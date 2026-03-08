import { createServerFn } from "@tanstack/react-start";
import { isAddress, isHash, isHex, recoverMessageAddress } from "viem";
import { z } from "zod";
import { env } from "cloudflare:workers";
import { validateTransfer } from "./validate-tx";
import { grantProEntitlement } from "./revenuecat";
import { SUPPORTED_CHAIN_IDS, type SupportedChainId } from "./chains";

const txHashSchema = z
  .string()
  .refine((v): v is `0x${string}` => isHash(v), "invalid tx hash");

const addressSchema = z
  .string()
  .refine((v): v is `0x${string}` => isAddress(v), "invalid address");

const signatureSchema = z
  .string()
  .refine((v): v is `0x${string}` => isHex(v), "invalid signature");

const chainIdSchema = z
  .number()
  .refine(
    (id): id is SupportedChainId => SUPPORTED_CHAIN_IDS.has(id as SupportedChainId),
    "unsupported chain",
  );

const appIdSchema = z.string().uuid("invalid app id");

export const validateSchema = z.object({
  txHash: txHashSchema,
  chainId: chainIdSchema,
  appId: appIdSchema,
  walletAddress: addressSchema.optional(),
});

export const recoverSchema = z.object({
  txHash: txHashSchema,
  chainId: chainIdSchema,
  signature: signatureSchema,
});

const formTxHash = z.string().refine((v): boolean => isHash(v), "invalid tx hash");
const formChainId = z.coerce
  .number()
  .refine(
    (id) => SUPPORTED_CHAIN_IDS.has(id as SupportedChainId),
    "unsupported chain",
  );

export const manualFormSchema = z.object({
  txHash: formTxHash,
  chainId: formChainId,
  appId: z.string().uuid("invalid app id"),
});

export const walletFormSchema = z.object({
  appId: z.string().uuid("invalid app id"),
  chainId: formChainId,
});

export const recoverFormSchema = z.object({
  txHash: formTxHash,
  chainId: formChainId,
});

function DB(): D1Database {
  return env.DB;
}

export const validatePurchase = createServerFn({ method: "POST" })
  .inputValidator(validateSchema)
  .handler(async ({ data }) => {
    await validateTransfer(data.txHash, data.chainId);

    const db = DB();

    try {
      await db
        .prepare(
          "INSERT INTO purchases (tx_hash, chain_id, app_id, wallet_address) VALUES (?, ?, ?, ?)",
        )
        .bind(data.txHash, data.chainId, data.appId, data.walletAddress ?? null)
        .run();
    } catch (e) {
      if (e instanceof Error && e.message.includes("UNIQUE")) {
        throw new Error("transaction already used");
      }
      throw e;
    }

    await grantProEntitlement(data.appId);

    return { success: true };
  });

export const recoverPurchase = createServerFn({ method: "POST" })
  .inputValidator(recoverSchema)
  .handler(async ({ data }) => {
    const recovered = await recoverMessageAddress({
      message: data.txHash,
      signature: data.signature,
    });

    const transfer = await validateTransfer(data.txHash, data.chainId);

    if (transfer.from.toLowerCase() !== recovered.toLowerCase()) {
      throw new Error("signature does not match transaction sender");
    }

    const db = DB();

    const row = await db
      .prepare("SELECT app_id, wallet_address FROM purchases WHERE tx_hash = ?")
      .bind(data.txHash)
      .first<{ app_id: string; wallet_address: string | null }>();

    if (!row) {
      throw new Error("transaction not registered");
    }

    if (
      !row.wallet_address ||
      row.wallet_address.toLowerCase() !== recovered.toLowerCase()
    ) {
      throw new Error("wallet does not match purchase record");
    }

    return { appId: row.app_id };
  });

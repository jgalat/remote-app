import { createPublicClient, http, parseEventLogs, getAddress } from "viem";
import type { SupportedChainId } from "./chains";
import {
  USDC,
  RECIPIENT,
  MIN_AMOUNT,
  SUPPORTED_CHAINS,
  TRANSFER_EVENT_ABI,
} from "./chains";

export type TransferInfo = {
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
};

export async function validateTransfer(
  txHash: `0x${string}`,
  chainId: SupportedChainId,
): Promise<TransferInfo> {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error("unsupported chain");
  }

  const usdcAddress = USDC[chainId];

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  const receipt = await client.getTransactionReceipt({ hash: txHash });

  if (receipt.status !== "success") {
    throw new Error("transaction failed");
  }

  const logs = parseEventLogs({
    abi: TRANSFER_EVENT_ABI,
    logs: receipt.logs,
  });

  const transfer = logs.find(
    (log) =>
      getAddress(log.address) === getAddress(usdcAddress) &&
      getAddress(log.args.to) === getAddress(RECIPIENT) &&
      log.args.value >= MIN_AMOUNT,
  );

  if (!transfer) {
    throw new Error(
      "no matching USDC transfer to recipient with sufficient amount",
    );
  }

  return {
    from: transfer.args.from,
    to: transfer.args.to,
    value: transfer.args.value,
  };
}

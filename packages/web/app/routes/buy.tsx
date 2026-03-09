import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSignMessage,
} from "wagmi";
import { erc20Abi } from "viem";
import {
  validatePurchase,
  recoverPurchase,
  manualFormSchema,
  walletFormSchema,
  recoverFormSchema,
} from "~/lib/server-fns";
import {
  USDC,
  RECIPIENT,
  MIN_AMOUNT,
  SUPPORTED_CHAINS,
} from "~/lib/chains";

export const Route = createFileRoute("/buy")({
  head: () => ({
    meta: [
      { title: "Buy Pro | Remote for Transmission" },
      {
        name: "description",
        content:
          "Purchase a pro license for Remote for Transmission using USDC.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Buy Pro | Remote for Transmission" },
      {
        property: "og:description",
        content:
          "Purchase a pro license for Remote for Transmission using USDC.",
      },
      {
        property: "og:image",
        content: "https://remote.jg.ar/assets/og_preview.jpg",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
    ],
    links: [{ rel: "canonical", href: "https://remote.jg.ar/buy" }],
  }),
  component: BuyPage,
});

const linkClass =
  "font-medium text-[#cc0063] underline decoration-1 underline-offset-[0.2em] hover:text-[#a90052]";
const inputClass =
  "w-full border-b border-[#ccc] bg-transparent px-0 py-2 text-sm outline-none focus:border-[#cc0063] transition-colors placeholder:text-[#aaa]";
const btnClass =
  "border border-[#cc0063] px-5 py-2 text-sm font-medium text-[#cc0063] transition-colors hover:bg-[#cc0063] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#cc0063]";
const btnFilledClass =
  "bg-[#cc0063] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#a90052] disabled:opacity-40";

function BuyPage() {
  const [tab, setTab] = useState<"manual" | "wallet" | "recover">("wallet");

  return (
    <main className="mx-auto max-w-[1080px] px-[1.1rem] pt-[2.4rem] pb-[1.6rem]">
      <div className="mb-[1.1rem] flex flex-wrap justify-between gap-[0.8rem] text-[#888]">
        <span>Remote for Transmission</span>
        <span>Pro</span>
      </div>

      <a className={`mb-6 inline-block ${linkClass}`} href="/">
        Back to homepage
      </a>

      <h1 className="mb-3 font-bold text-[clamp(2rem,5.2vw,3rem)] leading-[0.98] tracking-[-0.02em]">
        Unlock Pro
      </h1>
      <p className="mb-4 max-w-[52ch] leading-[1.6] text-[#444]">
        Send 2 USDC to the address below to get a lifetime pro license. Your
        license is tied to your App ID.
      </p>
      <div className="mb-8">
        <div className="flex items-start gap-5 max-[560px]:flex-col max-[560px]:items-center">
          <QRCodeSVG
            value={RECIPIENT}
            size={96}
            bgColor="transparent"
            fgColor="#222"
          />
          <div className="min-w-0 flex-1 max-[560px]:text-center">
            <p className="mb-1 text-xs tracking-wide text-[#888] uppercase">
              Send 2 USDC to
            </p>
            <div className="flex items-baseline gap-2 max-[560px]:justify-center">
              <code className="break-all text-[0.82rem] leading-[1.5] text-[#222]">
                {RECIPIENT}
              </code>
              <CopyButton text={RECIPIENT} />
            </div>
            <div className="mt-3 flex flex-wrap gap-[0.35rem]">
              {SUPPORTED_CHAINS.map((c: (typeof SUPPORTED_CHAINS)[number]) => (
                <span
                  key={c.id}
                  className="border border-[#ddd] px-[0.45rem] py-[0.1rem] text-[0.7rem] text-[#666]"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="mb-8 flex gap-6 border-b border-[#ddd]">
        {(
          [
            ["wallet", "Pay"],
            ["recover", "Recover"],
            ["manual", "Verify"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium transition-colors ${
              tab === key
                ? "border-b-2 border-[#cc0063] text-[#cc0063]"
                : "text-[#888] hover:text-[#444]"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "wallet" && <WalletTransfer />}
      {tab === "manual" && <ManualVerification />}
      {tab === "recover" && <RecoverLicense />}

      <p className="mt-10 text-sm text-[#888]">
        Need help? See the{" "}
        <a
          className={linkClass}
          href="https://github.com/jgalat/remote-app/wiki/Buying-a-Pro-License"
          target="_blank"
          rel="noopener noreferrer"
        >
          guide
        </a>{" "}
        or contact{" "}
        <a className={linkClass} href="mailto:remote@jg.ar">
          remote@jg.ar
        </a>
      </p>

      <footer className="mt-[2.1rem] text-[0.9rem] text-[#888]">
        Remote for Transmission
      </footer>
    </main>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    });
  }, [text]);

  return (
    <button
      onClick={copy}
      className="shrink-0 text-xs text-[#888] underline decoration-1 underline-offset-[0.2em] hover:text-[#cc0063]"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ChainSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full border-b border-[#ccc] bg-transparent py-2 text-sm outline-none focus:border-[#cc0063]"
    >
      {SUPPORTED_CHAINS.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

function StatusMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <p
      className={`mt-4 border-l-2 py-2 pl-3 text-sm ${
        type === "success"
          ? "border-green-600 text-green-800"
          : "border-red-500 text-red-700"
      }`}
    >
      {message}
    </p>
  );
}

function MutationStatus({ error, isSuccess }: { error: Error | null; isSuccess: boolean }) {
  if (isSuccess) return <StatusMessage type="success" message="Pro license granted." />;
  if (error) return <StatusMessage type="error" message={error.message} />;
  return null;
}

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-baseline gap-3">
        <code className="text-sm leading-none text-[#444]">
          {address.slice(0, 6)}...{address.slice(-4)}
        </code>
        <button
          onClick={() => disconnect()}
          className="text-sm leading-none text-[#888] underline decoration-1 underline-offset-[0.2em] hover:text-[#cc0063]"
        >
          disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className={btnClass}
        >
          {isPending ? "Connecting..." : connector.name}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs tracking-wide text-[#888] uppercase">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ManualVerification() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: { chainId: SUPPORTED_CHAINS[0].id },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof manualFormSchema>) =>
      validatePurchase({ data }),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="max-w-lg space-y-5"
    >
      <p className="border-l-2 border-amber-400 py-1 pl-3 text-sm text-[#666]">
        Your license is permanently tied to this App ID. Save it securely -- it
        cannot be recovered if lost.
      </p>
      <p className="text-sm leading-[1.6] text-[#444]">
        Sent 2 USDC from an exchange or another wallet? Enter the transaction
        details below to activate your license manually.
      </p>
      <Field label="App ID" error={errors.appId?.message}>
        <input
          type="text"
          placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx"
          {...register("appId")}
          className={inputClass}
        />
      </Field>
      <Field label="Transaction Hash" error={errors.txHash?.message}>
        <input
          type="text"
          placeholder="0x..."
          {...register("txHash")}
          className={inputClass}
        />
      </Field>
      <Field label="Chain" error={errors.chainId?.message}>
        <ChainSelect
          {...register("chainId", { valueAsNumber: true })}
        />
      </Field>
      <button
        type="submit"
        disabled={mutation.isPending}
        className={btnFilledClass}
      >
        {mutation.isPending ? "Validating..." : "Verify & Activate"}
      </button>
      <MutationStatus error={mutation.error} isSuccess={mutation.isSuccess} />
    </form>
  );
}

function WalletTransfer() {
  const { address, isConnected } = useAccount();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: { chainId: SUPPORTED_CHAINS[0].id },
  });

  const chainId = watch("chainId");

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      chainId,
      confirmations: 1,
      query: { enabled: !!hash },
    });

  const activation = useMutation({
    mutationFn: ({ txHash, appId }: { txHash: `0x${string}`; appId: string }) =>
      validatePurchase({
        data: { txHash, chainId, appId, walletAddress: address! },
      }),
  });

  const lastAppId = useState<string | null>(null);

  useEffect(() => {
    if (isConfirmed && hash && !activation.isSuccess && !activation.isPending && lastAppId[0]) {
      activation.mutate({ txHash: hash, appId: lastAppId[0] });
    }
  }, [isConfirmed, hash]);

  const pay = handleSubmit((data) => {
    const usdcAddress = USDC[data.chainId as keyof typeof USDC];
    if (!usdcAddress) return;
    lastAppId[1](data.appId);
    writeContract({
      chainId: data.chainId,
      address: usdcAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [RECIPIENT, MIN_AMOUNT],
    });
  });

  const busy = isWritePending || isConfirming || activation.isPending;

  return (
    <form onSubmit={pay} className="max-w-lg space-y-5">
      <p className="text-sm leading-[1.6] text-[#444]">
        Connect your wallet, pay 2 USDC, and your license activates
        automatically. You can recover your App ID later using the same wallet.
      </p>
      <Field label="Wallet">
        <ConnectWallet />
      </Field>
      {isConnected && (
        <>
          <Field label="App ID" error={errors.appId?.message}>
            <input
              type="text"
              placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx"
              {...register("appId")}
              className={inputClass}
            />
          </Field>
          <Field label="Chain" error={errors.chainId?.message}>
            <ChainSelect
              {...register("chainId", { valueAsNumber: true })}
            />
          </Field>
          <button
            type="submit"
            disabled={busy}
            className={btnFilledClass}
          >
            {isWritePending
              ? "Confirm in wallet..."
              : isConfirming
                ? "Confirming..."
                : activation.isPending
                  ? "Activating..."
                  : "Pay 2 USDC"}
          </button>
          {writeError && (
            <StatusMessage type="error" message={writeError.message} />
          )}
          {activation.error && hash && lastAppId[0] && (
            <>
              <StatusMessage type="error" message={activation.error.message} />
              <button
                type="button"
                onClick={() => activation.mutate({ txHash: hash, appId: lastAppId[0]! })}
                disabled={activation.isPending}
                className={btnClass}
              >
                {activation.isPending ? "Retrying..." : "Retry activation"}
              </button>
            </>
          )}
        </>
      )}
      {activation.isSuccess && <StatusMessage type="success" message="Pro license granted." />}
    </form>
  );
}

function RecoverLicense() {
  const { isConnected } = useAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof recoverFormSchema>>({
    resolver: zodResolver(recoverFormSchema),
    defaultValues: { chainId: SUPPORTED_CHAINS[0].id },
  });

  const { signMessageAsync } = useSignMessage();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof recoverFormSchema>) => {
      const signature = await signMessageAsync({ message: data.txHash });
      return recoverPurchase({ data: { ...data, signature } });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="max-w-lg space-y-5"
    >
      <p className="text-sm leading-[1.6] text-[#444]">
        Recover your App ID by signing with the same wallet used to pay. Only
        works for purchases made via the wallet option.
      </p>
      <Field label="Wallet">
        <ConnectWallet />
      </Field>
      {isConnected && (
        <>
          <Field label="Transaction Hash" error={errors.txHash?.message}>
            <input
              type="text"
              placeholder="0x..."
              {...register("txHash")}
              className={inputClass}
            />
          </Field>
          <Field label="Chain" error={errors.chainId?.message}>
            <ChainSelect
              {...register("chainId", { valueAsNumber: true })}
            />
          </Field>
          <button
            type="submit"
            disabled={mutation.isPending}
            className={btnFilledClass}
          >
            {mutation.isPending ? "Recovering..." : "Sign & Recover"}
          </button>
        </>
      )}
      {mutation.data && (
        <div className="border-l-2 border-green-600 py-2 pl-3">
          <p className="mb-1 text-xs tracking-wide text-[#888] uppercase">
            Your App ID
          </p>
          <code className="block break-all text-sm">{mutation.data.appId}</code>
        </div>
      )}
      {mutation.error && (
        <StatusMessage type="error" message={mutation.error.message} />
      )}
    </form>
  );
}

import {
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
} from "viem/chains";

export const RECIPIENT = "0xB340840DfA6775Ae9d7Ae77445EF5A645c05fEf2" as const;
export const MIN_AMOUNT = 2_000_000n;

export const SUPPORTED_CHAINS = [
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

export const SUPPORTED_CHAIN_IDS = new Set<SupportedChainId>(
  SUPPORTED_CHAINS.map((c) => c.id),
);

export const USDC: Record<SupportedChainId, `0x${string}`> = {
  [mainnet.id]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [optimism.id]: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
};

export const TRANSFER_EVENT_ABI = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

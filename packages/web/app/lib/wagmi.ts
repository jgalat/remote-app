import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
} from "viem/chains";

export const config = createConfig({
  chains: [mainnet, base, optimism, arbitrum, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});

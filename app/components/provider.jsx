"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { WagmiProvider, createConfig, http } from "wagmi";

import { bscTestnet } from "wagmi/chains";

import { injected } from "wagmi/connectors";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [bscTestnet],

  connectors: [
    injected(),
  ],

  transports: {
    [bscTestnet.id]: http(
      "https://data-seed-prebsc-1-s1.binance.org:8545/"
    ),
  },
});

export default function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
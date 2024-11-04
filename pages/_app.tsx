import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { Provider } from "jotai";
import NoSSR from "react-no-ssr";
import Page from "@/components/common/Page";
import { RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  coin98Wallet,
  rabbyWallet,
  safeWallet,
  okxWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Analytics } from "@vercel/analytics/react"
import { WagmiProvider, http } from "wagmi";
import { arbitrum, fraxtal, base, mainnet, optimism, polygon, xLayer } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWallet } from "@passkeys/core";
import { WalletProvider, WalletWidget } from "@passkeys/react";

const PROJECT_ID = "9b83e8f348c7515d3f94d83f95a05749"

const exodus = createWallet({
  appId: "c247e96b-43ed-487f-8b78-51d6a630f0f4",
  providers: {
    ethereum: true,
  }
});

const connectors = connectorsForWallets([
  {
    groupName: "Suggested",
    wallets: [
      injectedWallet,
      walletConnectWallet,
      safeWallet,
      rabbyWallet,
    ],
  },
  {
    groupName: "Others",
    wallets: [
      coinbaseWallet,
      coin98Wallet,
      okxWallet,
      rainbowWallet
    ],
  },
],
  {
    appName: "VaultCraft",
    projectId: PROJECT_ID
  }
);


const config = getDefaultConfig({
  appName: 'VaultCraft',
  projectId: PROJECT_ID,
  // @ts-ignore
  chains: SUPPORTED_NETWORKS,
  transports: {
    [mainnet.id]: http(RPC_URLS[mainnet.id]),
    [polygon.id]: http(RPC_URLS[polygon.id]),
    [optimism.id]: http(RPC_URLS[optimism.id]),
    [arbitrum.id]: http(RPC_URLS[arbitrum.id]),
    [xLayer.id]: http(RPC_URLS[xLayer.id]),
    [base.id]: http(RPC_URLS[base.id]),
    [fraxtal.id]: http(RPC_URLS[fraxtal.id]),
    // [avalanche.id]: http(RPC_URLS[avalanche.id]),
  },
  connectors
})

const queryClient = new QueryClient()

const nextFont = localFont({
  src: [
    {
      path: "../public/KH_Teka/KHTeka-Black.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/KH_Teka/KHTeka-BlackItalic.woff",
      weight: "900",
      style: "italic",
    },
    {
      path: "../public/KH_Teka/KHTeka-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/KH_Teka/KHTeka-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "../public/KH_Teka/KHTeka-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/KH_Teka/KHTeka-MediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/KH_Teka/KHTeka-RegularItalic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/KH_Teka/KHTeka-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/KH_Teka/KHTeka-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/KH_Teka/KHTeka-LightItalic.woff",
      weight: "300",
      style: "italic",
    },
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>VaultCraft</title>
        <meta
          name="description"
          content="VaultCraft is a DeFi yield-optimizing protocol with customizable asset strategies that instantly zap your crypto from any chain into the highest yield-generating products across DeFi in 1 click."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type={"image/png"} href="/images/icons/favicon.ico" />
      </Head>
      <main className={nextFont.className}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root [data-rk] {
              --rk-radii-modal: 1rem;
            }
            [data-rk] * {
              font-family: ${nextFont.style.fontFamily} !important;
            }
          `,
          }}
        />
        <Toaster />
        <Analytics />
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider modalSize="compact">
              <WalletProvider wallet={exodus}>
                <WalletWidget />
                <NoSSR>
                  <Provider>
                    <Page>
                      { /* @ts-ignore */}
                      <Component {...pageProps} />
                    </Page>
                  </Provider>
                </NoSSR>
              </WalletProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </main >
    </>
  );
}

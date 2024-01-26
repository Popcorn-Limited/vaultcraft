import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import localFont from 'next/font/local'
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { Provider } from "jotai";
// @ts-ignore
import NoSSR from 'react-no-ssr';
import Page from "@/components/common/Page";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  coin98Wallet,
  rabbyWallet,
  safeWallet
} from '@rainbow-me/rainbowkit/wallets';

const { chains, publicClient } = configureChains(SUPPORTED_NETWORKS, [
  alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
  }),
  jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }) })],
  {
    pollingInterval: 7_000,
    stallTimeout: 5_000, // time to change to another RPC if failed
  }
);

const connectors = connectorsForWallets([
  {
    groupName: 'Suggested',
    wallets: [
      injectedWallet({ chains }),
      rainbowWallet({ projectId: '9b83e8f348c7515d3f94d83f95a05749', chains }),
      metaMaskWallet({ projectId: '9b83e8f348c7515d3f94d83f95a05749', chains }),
      rabbyWallet({ chains })
    ],
  },
  {
    groupName: 'Others',
    wallets: [
      coinbaseWallet({ chains, appName: 'VaultCraft' }),
      walletConnectWallet({ projectId: '9b83e8f348c7515d3f94d83f95a05749', chains }),
      coin98Wallet({ projectId: '9b83e8f348c7515d3f94d83f95a05749', chains }),
      safeWallet({ chains })
    ]
  }
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const nextFont = localFont({
  src: [
    {
      path: '../public/KH_Teka/KHTeka-Black.woff',
      weight: '900',
      style: 'normal'
    },
    {
      path: '../public/KH_Teka/KHTeka-BlackItalic.woff',
      weight: '900',
      style: 'italic'
    },
    {
      path: '../public/KH_Teka/KHTeka-Bold.woff',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../public/KH_Teka/KHTeka-BoldItalic.woff',
      weight: '700',
      style: 'italic'
    },
    {
      path: '../public/KH_Teka/KHTeka-Medium.woff',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../public/KH_Teka/KHTeka-MediumItalic.woff',
      weight: '500',
      style: 'italic'
    },
    {
      path: '../public/KH_Teka/KHTeka-RegularItalic.woff',
      weight: '400',
      style: 'italic'
    },
    {
      path: '../public/KH_Teka/KHTeka-Regular.woff',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../public/KH_Teka/KHTeka-Light.woff',
      weight: '300',
      style: 'normal'
    },
    {
      path: '../public/KH_Teka/KHTeka-LightItalic.woff',
      weight: '300',
      style: 'italic'
    },
  ]
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>VaultCraft</title>
        <meta name="description" content="VaultCraft is a DeFi yield-optimizing protocol with customizable asset strategies that instantly zap your crypto from any chain into the highest yield-generating products across DeFi in 1 click." />
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
        <WagmiConfig config={config}>
          <RainbowKitProvider chains={chains} modalSize="compact">
            <NoSSR>
              <Provider>
                <Page>
                  <Component {...pageProps} />
                </Page>
              </Provider>
            </NoSSR>
          </RainbowKitProvider>
        </WagmiConfig>
      </main>
    </>
  );
}

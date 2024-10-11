import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WormholeConnect = dynamic(
  () => import('@wormhole-foundation/wormhole-connect'),
  { ssr: false }
);

// const theme: WormholeConnectPartialTheme = {
//   background: {
//     default: '#212b4a'
//   }
// }

// const customized= dark;

const wormholeConfig = {
  env: 'mainnet', // from deployment.json of the NTT deployment directory
  networks: ['ethereum', 'arbitrum', 'optimism', 'base', 'avalanche'], // from https://github.com/wormhole-foundation/wormhole-connect/blob/development/wormhole-connect/src/config/testnet/chains.ts#L170
  tokens: ['VCX', 'arbVCX', 'opVCX', 'baseVCX', 'avaxVCX'],  // this will limit the available tokens that can be transferred to the other chain
  routes: ['nttRelay'], // this will limit the available routes - from https://github.com/wormhole-foundation/wormhole-connect/blob/d7a6b67b18db2c8eb4a249d19ef77d0174deffbe/wormhole-connect/src/config/types.ts#L70
  nttGroups: {
    VCX_NTT: { // arbitrary name for the ntt group
      nttManagers: [
        {
          chainName: 'ethereum',
          address: '0xBfdc5171Cf63acE266aF9cA06DAD6301Ef6455d3', // nttManagers Address from deployment.json
          tokenKey: 'VCX',
          transceivers: [
            {
              address: '0xBf238579EFc1Da2cE9E8d1237aAE37531C16B37a', // transceivers address from deployment.json
              type: 'wormhole'
            }
          ]
        },
        {
          chainName: 'arbitrum',
          address: '0x0fa98307C08a4A832291767600ABaDb02209DF3f', // nttManagers Address from deployment.json
          tokenKey: 'arbVCX',
          transceivers: [
            {
              address: '0x8052D5245341F67a8033798987d5d4b323a0913A', // transceivers address from deployment.json
              type: 'wormhole'
            }
          ]
        },
        {
          chainName: 'optimism',
          address: '0xDafC709d84f5FE09546fD054220EA59b47517379', // nttManagers Address from deployment.json
          tokenKey: 'opVCX',
          transceivers: [
            {
              address: '0x0f5325Ea19504403fA543688bC84F9DC3327D78b', // transceivers address from deployment.json
              type: 'wormhole'
            }
          ]
        },
        {
          chainName: 'base',
          address: '0xDafC709d84f5FE09546fD054220EA59b47517379', // nttManagers Address from deployment.json
          tokenKey: 'baseVCX',
          transceivers: [
            {
              address: '0x0f5325Ea19504403fA543688bC84F9DC3327D78b', // transceivers address from deployment.json
              type: 'wormhole'
            }
          ]
        },
        {
          chainName: 'avalanche',
          address: '0x30F64191353Db3f2135CAb366039c916BE38B598', // nttManagers Address from deployment.json
          tokenKey: 'avaxVCX',
          transceivers: [
            {
              address: '0xdcA6fd78f1128F9593Af4c59e48FfEc177295654', // transceivers address from deployment.json
              type: 'wormhole'
            }
          ]
        }
      ]
    }
  },
  tokensConfig: {
    VCX: {
      key: 'VCX',
      symbol: 'VCX',
      nativeChain: 'ethereum', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
      displayName: 'Vaultcraft VCX', // name that is displayed in the Route
      tokenId: {
        chain: 'mainnet',
        address: '0xce246eea10988c495b4a90a905ee9237a0f91543' // token address
      },
      coinGeckoId: 'test',
      icon: 'https://app.vaultcraft.io/images/tokens/vcx.svg',
      color: '#00C3D9',
      decimals: {
        default: 18
      }
    },
    arbVCX: {
      key: 'arbVCX',
      symbol: 'wVCX',
      nativeChain: 'arbitrum', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
      displayName: 'Wormhole Arbitrum VCX', // name that is displayed in the Route
      tokenId: {
        chain: 'arbitrum',
        address: '0xFeae6470A79b7779888f4a64af315Ca997D6cF33' // token address
      },
      coinGeckoId: 'test',
      icon: 'https://app.vaultcraft.io/images/tokens/vcx.svg',
      color: '#00C3D9',
      decimals: {
        default: 18
      }
    },
    opVCX: {
      key: 'opVCX',
      symbol: 'wVCX',
      nativeChain: 'optimism', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
      displayName: 'Wormhole Optimism VCX', // name that is displayed in the Route
      tokenId: {
        chain: 'optimism',
        address: '0x43Ad2CFDDA3CEFf40d832eB9bc33eC3FACE86829' // token address
      },
      coinGeckoId: 'test',
      icon: 'https://app.vaultcraft.io/images/tokens/vcx.svg',
      color: '#00C3D9',
      decimals: {
        default: 18
      }
    },
    baseVCX: {
      key: 'baseVCX',
      symbol: 'wVCX',
      nativeChain: 'base', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
      displayName: 'Wormhole Base VCX', // name that is displayed in the Route
      tokenId: {
        chain: 'base',
        address: '0x43Ad2CFDDA3CEFf40d832eB9bc33eC3FACE86829' // token address
      },
      coinGeckoId: 'test',
      icon: 'https://app.vaultcraft.io/images/tokens/vcx.svg',
      color: '#00C3D9',
      decimals: {
        default: 18
      }
    },
    avaxVCX: {
      key: 'avaxVCX',
      symbol: 'wVCX',
      nativeChain: 'avalanche', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
      displayName: 'Wormhole Avalanche VCX', // name that is displayed in the Route
      tokenId: {
        chain: 'avalanche',
        address: '0x58890c4d6268CA329C9Ff626dc4Da07c1977Deb4' // token address
      },
      coinGeckoId: 'test',
      icon: 'https://app.vaultcraft.io/images/tokens/vcx.svg',
      color: '#00C3D9',
      decimals: {
        default: 18
      }
    }
  }
}

export default function WormholeBridge() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // @ts-ignore
  return <WormholeConnect config={wormholeConfig} />
}
import WormholeConnect, {
    WormholeConnectConfig, WormholeConnectTheme, dark
  } from '@wormhole-foundation/wormhole-connect';
  import NoSSR from "react-no-ssr";

  // const theme: WormholeConnectPartialTheme = {
  //   background: {
  //     default: '#212b4a'
  //   }
  // }

  const customized: WormholeConnectTheme = dark;
  customized.background.default = "navy";
  customized.button.action = "#81c784";
  customized.button.actionText = "#000000";

  const wormholeConfig: WormholeConnectConfig = {
      env: 'mainnet', // from deployment.json of the NTT deployment directory
      networks: ['ethereum', 'arbitrum'], // from https://github.com/wormhole-foundation/wormhole-connect/blob/development/wormhole-connect/src/config/testnet/chains.ts#L170
      tokens: ['VCX', 'arbwVCX'],  // this will limit the available tokens that can be transferred to the other chain
      routes: ['nttManual'], // this will limit the available routes - from https://github.com/wormhole-foundation/wormhole-connect/blob/d7a6b67b18db2c8eb4a249d19ef77d0174deffbe/wormhole-connect/src/config/types.ts#L70
      bridgeDefaults: {
        fromNetwork: 'ethereum',
        toNetwork: 'arbitrum'
      },
      nttGroups: {
        FTT_NTT: { // arbitrary name for the ntt group
          nttManagers: [
            {
              chainName: 'ethereum',
              address: '0x84926f0957AB2C466Ed6Ce01D5c7458BACa4bFAd', // nttManagers Address from deployment.json
              tokenKey: 'VCX', 
              transceivers: [
                {
                  address: '0x609Cb6E34dFD476b748b943E5c2b6aA40529Fc2d', // transceivers address from deployment.json
                  type: 'wormhole'
                }
              ]
            },
            {
              chainName: 'arbitrum',
              address: '0x0fa98307C08a4A832291767600ABaDb02209DF3f', // nttManagers Address from deployment.json
              tokenKey: 'arbwVCX',
              transceivers: [
                {
                  address: '0x8052D5245341F67a8033798987d5d4b323a0913A', // transceivers address from deployment.json
                  type: 'wormhole'
                }
              ]
            }
          ]
        }
      },
      // rpcs: {
      //   arbitrum_sepolia: 'https://ArbitrumSepolia-testnet-rpc.publicnode.com',
      //   base_sepolia: 'https://base-sepolia.g.alchemy.com/v2/a0pLcKaYZsGYU68s567eeouqyMJQI3yJ'
      // },
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
          icon: 'https://wormhole.com/token.png',
          color: '#00C3D9',
          decimals: {
            default: 18
          }
        },
        arbwVCX: {
          key: 'arbwVCX',
          symbol: 'wVCX',
          nativeChain: 'arbitrum', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
          displayName: 'Wormhole Arbitrum VCX', // name that is displayed in the Route
          tokenId: {
            chain: 'arbitrum',
            address: '0xFeae6470A79b7779888f4a64af315Ca997D6cF33' // token address
          },
          coinGeckoId: 'test',
          icon: 'https://wormhole.com/token.png',
          color: '#00C3D9',
          decimals: {
            default: 18
          }
        }
      }
  }

export default function WormholeBridge() {  
  return (
  <NoSSR><WormholeConnect config={wormholeConfig} theme={customized}/></NoSSR>)
}

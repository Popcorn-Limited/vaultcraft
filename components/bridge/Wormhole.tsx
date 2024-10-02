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
      env: 'testnet', // from deployment.json of the NTT deployment directory
      networks: ['arbitrum_sepolia', 'base_sepolia'], // from https://github.com/wormhole-foundation/wormhole-connect/blob/development/wormhole-connect/src/config/testnet/chains.ts#L170
      // tokens: ['ArbitrumSepoliaToken', 'BaseSepoliaToken'],  // this will limit the available tokens that can be transferred to the other chain
      routes: ['nttManual'], // this will limit the available routes - from https://github.com/wormhole-foundation/wormhole-connect/blob/d7a6b67b18db2c8eb4a249d19ef77d0174deffbe/wormhole-connect/src/config/types.ts#L70
      bridgeDefaults: {
        fromNetwork: 'arbitrum_sepolia',
        toNetwork: 'base_sepolia'
      },
      nttGroups: {
        FTT_NTT: { // arbitrary name for the ntt group
          nttManagers: [
            {
              chainName: 'arbitrum_sepolia',
              address: '0x40B74aC60F4133b31F297767B455B4328d917809', // nttManagers Address from deployment.json
              tokenKey: 'ArbitrumSepoliaToken', 
              transceivers: [
                {
                  address: '0xB4A9615DFB7F03Ed89f010E6a326B97407E9fdD8', // transceivers address from deployment.json
                  type: 'wormhole'
                }
              ]
            },
            {
              chainName: 'base_sepolia',
              address: '0x67eB307120D219d84d1a66a62016D396045F352b', // nttManagers Address from deployment.json
              tokenKey: 'BaseSepoliaToken',
              transceivers: [
                {
                  address: '0xdc45bC110380759F6609564295247aBC9e91Ebf1', // transceivers address from deployment.json
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
        ArbitrumSepoliaToken: {
          key: 'ArbitrumSepoliaToken',
          symbol: 'FTT',
          nativeChain: 'arbitrum_sepolia', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
          displayName: 'FTT (ArbitrumSepolia)', // name that is displayed in the Route
          tokenId: {
            chain: 'arbitrum_sepolia',
            address: '0x04661C1d878E36EFa44721B59911a3b8373efBCd' // token address
          },
          coinGeckoId: 'test',
          icon: 'https://wormhole.com/token.png',
          color: '#00C3D9',
          decimals: {
            default: 18
          }
        },
        BaseSepoliaToken: {
          key: 'BaseSepoliaToken',
          symbol: 'FTT',
          nativeChain: 'base_sepolia', // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
          displayName: 'FTT (BaseSepolia)', // name that is displayed in the Route
          tokenId: {
            chain: 'base_sepolia',
            address: '0x4BA04db16799d4Dfbc658d3E4cCC509F564a7eF5' // token address
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

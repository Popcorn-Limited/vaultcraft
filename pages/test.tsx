import { getVotePeriodEndTime } from "@/lib/gauges/utils"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { AnyToAnyDepositorAbi, AssetPushOracleAbi, AssetPushOracleByChain, VaultAbi } from "@/lib/constants";
import { usePublicClient } from "wagmi";

export default function Test() {
  const assets = Object.keys(vaultsRaw).map(vault => vaultsRaw[vault].assetAddress)
  const keys = Object.keys(tokensRaw).filter(key => assets.map(asset => asset.toLowerCase()).includes(key.toLowerCase()))
  console.log(keys.map(key => tokensRaw[key]))
  return <></>
}

const vaultsRaw = {
  "0x44a7b29335cfc61C2bEA1c48710A1fE11f4aFBa9": {
    "address": "0x44a7b29335cfc61C2bEA1c48710A1fE11f4aFBa9",
    "assetAddress": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    "strategies": ["0x2D0483FefAbA4325c7521539a3DFaCf94A19C472"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 0
    },
    "type": "single-asset-lock-vault-v1",
    "description": "",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "creator": "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    "apyId": ""
  },
  "0x1F0a3bF1e4Ea8f27449AFa0a3A27eFc3817431fc": {
    "address": "0x1F0a3bF1e4Ea8f27449AFa0a3A27eFc3817431fc",
    "assetAddress": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    "strategies": ["0x9168AC3a83A31bd85c93F4429a84c05db2CaEF08"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 0
    },
    "type": "single-asset-lock-vault-v1",
    "description": "",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "creator": "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    "apyId": ""
  },
  "0xDc5Ed7b972710594082479AF498B1dA02d03a273": {
    "address": "0xDc5Ed7b972710594082479AF498B1dA02d03a273",
    "assetAddress": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    "strategies": ["0x6076ebDFE17555ed3E6869CF9C373Bbd9aD55d38"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 0
    },
    "type": "single-asset-lock-vault-v1",
    "description": "",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "creator": "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    "apyId": ""
  },
  "0xcede40B40F7AF69f5Aa6b12D75fd5eA9cE138b93": {
    "address": "0xcede40B40F7AF69f5Aa6b12D75fd5eA9cE138b93",
    "assetAddress": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    "strategies": [
      "0x61dCd1Da725c0Cdb2C6e67a0058E317cA819Cf5f",
      "0x9168AC3a83A31bd85c93F4429a84c05db2CaEF08",
      "0x2D0483FefAbA4325c7521539a3DFaCf94A19C472",
      "0x6076ebDFE17555ed3E6869CF9C373Bbd9aD55d38"
    ],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 100000000000000000
    },
    "type": "multi-strategy-vault-v1",
    "description": "<p>This is an experimental vault testing the multi strategy vault. This vault allocates rebalances your assets between multiple fraxlend pools and aave to optimize your yield.</p>",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "creator": "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    "labels": ["Experimental"],
    "gauge": "0x1463b4F8EC81aA46D77b549Bda98390660eA92A6",
    "apyId": ""
  },
  "0xC9ed56fbCbc3f0CE764D38e039cdaF36aa3c284c": {
    "address": "0xC9ed56fbCbc3f0CE764D38e039cdaF36aa3c284c",
    "assetAddress": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    "strategies": ["0x323053A0902E67791c06F65A5D2097ee79dD740F"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 100000000000000000
    },
    "type": "single-asset-vault-v1",
    "description": "<p>This is an experimental vault testing the CurveSingleAssetCompounder. It deploys FRAX into the crvUSD/FRAX Pool on Curve and compounds rewards back into it.</p>",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "creator": "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    "labels": ["Experimental"],
    "apyId": ""
  },
  "0xd11A312a7d9745C62dfc014D72E7Bb2403DABf72": {
    "address": "0xd11A312a7d9745C62dfc014D72E7Bb2403DABf72",
    "assetAddress": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    "strategies": ["0x8904c44f1b2AD67a1c8Ac43D6774272Cd5836eaA"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 100000000000000000
    },
    "type": "single-asset-vault-v1",
    "description": "",
    "creator": "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "gauge": "0x52843d173FE0BBeA5307fa4864665858AaFc9b73",
    "apyId": "5787db25-0f58-4593-97b6-5721caca72da"
  },
  "0xD3A17928245064B6DF5095a76e277fe441D538a4": {
    "address": "0xD3A17928245064B6DF5095a76e277fe441D538a4",
    "assetAddress": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "strategies": ["0x5769F1c62Fa2AA6087df3dd1FA6a7Ae89Bb45FFd"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 100000000000000000
    },
    "type": "single-asset-vault-v1",
    "description": "",
    "creator": "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "gauge": "0xc9aD14cefb29506534a973F7E0E97e68eCe4fa3f",
    "apyId": "d25cd9ec-ffaf-4630-9a13-8b03d577f12f"
  },
  "0xC4bBbbAF12B1bE472E6E7B1A76d2756d5C763F95": {
    "address": "0xC4bBbbAF12B1bE472E6E7B1A76d2756d5C763F95",
    "assetAddress": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "strategies": ["0x067e4c15B052C73998689D7A0e19D0B2910819dc"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 0
    },
    "type": "multi-strategy-vault-v2",
    "description": "",
    "creator": "0x2C3B135cd7dc6C673b358BEF214843DAb3464278",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "gauge": "0x5E6A9859Dc1b393a82a5874F9cBA22E92d9fbBd2",
    "apyId": "311c187e-bfac-4739-944a-f21d2fe3633b"
  },
  "0x8aD58FA719FDf6dc5B324Db9eE22E561377Fda69": {
    "address": "0x8aD58FA719FDf6dc5B324Db9eE22E561377Fda69",
    "assetAddress": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    "strategies": ["0x268823d2D666643721A15462De02987F77DE7bbf"],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 0
    },
    "type": "multi-strategy-vault-v2",
    "description": "",
    "creator": "0x2C3B135cd7dc6C673b358BEF214843DAb3464278",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "gauge": "0xf4CC0E086f70815f6153E66749A627227a8CA386",
    "apyId": "3171c3c6-4e25-455e-9758-984b0ac2bb47"
  },
  "0xA76331558b8D501dd644603e98aE02e291bBD197": {
    "address": "0xA76331558b8D501dd644603e98aE02e291bBD197",
    "assetAddress": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "strategies": [
      "0x5769F1c62Fa2AA6087df3dd1FA6a7Ae89Bb45FFd",
      "0xC8D9AaD4EF9Da1E1436B150778eaF0A8be5e35Cd"
    ],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 0
    },
    "type": "multi-strategy-vault-v2.5",
    "description": "",
    "creator": "0xA5aEf04E03789AD15405D153a82D0b128c36988b",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "apyId": "",
    "labels": ["Experimental"]
  },
  "0xbCde085E5d663Ee592D760311C9cE33b37bEC684": {
    "address": "0xbCde085E5d663Ee592D760311C9cE33b37bEC684",
    "assetAddress": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "strategies": [
      "0x5769F1c62Fa2AA6087df3dd1FA6a7Ae89Bb45FFd",
      "0xC8D9AaD4EF9Da1E1436B150778eaF0A8be5e35Cd"
    ],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 0,
      "performance": 0
    },
    "type": "multi-strategy-vault-v2.5",
    "description": "",
    "creator": "0x2C3B135cd7dc6C673b358BEF214843DAb3464278",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "apyId": "",
    "labels": ["Experimental"]
  },
  "0x55c4d29cCdf671cb901081dAF2e91891c95b07ba": {
    "address": "0x55c4d29cCdf671cb901081dAF2e91891c95b07ba",
    "assetAddress": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "strategies": [
      "0x430cF36a989DFef9ff8F0f3b7738059715a07B6c",
      "0x5769F1c62Fa2AA6087df3dd1FA6a7Ae89Bb45FFd",
      "0x7D375fAA1A42F183ACe063e188c3c95fCBf04e93",
      "0xA2655b902dc8e6AfAD89e03f13fc2a484043F416",
      "0x970550f7057fdE945a7Ca3B32EBc23994ABC2239",
      "0xA714B8585f5a17ae4E85700fA3d81d0ab0C6dDEB",
      "0xCEe8104ED8796CD6eF6d7CC761Ea88FaFD3b80ee",
      "0x7385AaFE2FD203B2720f172178dBCf1951CcC062",
      "0xb8108710706a6B870e06270c3a2e6570aE03804a",
      "0x15f8190294846c429615435Bd1A3E1Efe0dc93Ee"
    ],
    "chainId": 42161,
    "fees": {
      "deposit": 0,
      "withdrawal": 0,
      "management": 20000000000000000,
      "performance": 100000000000000000
    },
    "type": "multi-strategy-vault-v2.5",
    "description": "",
    "creator": "0x4CC090Ba6f871212c87565A94e7e35f09E894c59",
    "feeRecipient": "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
    "apyId": "",
    "labels": ["Experimental"],
    "name":"Mega USDC Vault"
  }
}



const tokensRaw = {
  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1": {
    "address": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    "name": "Dai Stablecoin",
    "symbol": "DAI",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/DAI.png",
    "chainId": 42161
  },
  "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8": {
    "address": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    "name": "USDC (Bridged)",
    "symbol": "USDC.e",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png",
    "chainId": 42161
  },
  "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F": {
    "address": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    "name": "Frax",
    "symbol": "FRAX",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/FRAX.png",
    "chainId": 42161
  },
  "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b": {
    "address": "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b",
    "name": "LUSD",
    "symbol": "LUSD",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/LUSD.png",
    "chainId": 42161
  },
  "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f": {
    "address": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    "name": "Wrapped BTC",
    "symbol": "WBTC",
    "decimals": 8,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/WBTC.png",
    "chainId": 42161
  },
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1": {
    "address": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "name": "Wrapped Ether",
    "symbol": "WETH",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/WETH.svg",
    "chainId": 42161
  },
  "0x892785f33CdeE22A30AEF750F285E18c18040c3e": {
    "address": "0x892785f33CdeE22A30AEF750F285E18c18040c3e",
    "name": "Stargate USDC",
    "symbol": "stgUSDC",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png",
    "chainId": 42161
  },
  "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641": {
    "address": "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641",
    "name": "Stargate USDT",
    "symbol": "stgUSDT",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDT.png",
    "chainId": 42161
  },
  "0x68f5d998F00bB2460511021741D098c05721d8fF": {
    "address": "0x68f5d998F00bB2460511021741D098c05721d8fF",
    "name": "Hop DAI",
    "symbol": "hDAI",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/DAI.png",
    "chainId": 42161
  },
  "0xB67c014FA700E69681a673876eb8BAFAA36BFf71": {
    "address": "0xB67c014FA700E69681a673876eb8BAFAA36BFf71",
    "name": "Hop USDC",
    "symbol": "hUSDC",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png",
    "chainId": 42161
  },
  "0xCe3B19D820CB8B9ae370E423B0a329c4314335fE": {
    "address": "0xCe3B19D820CB8B9ae370E423B0a329c4314335fE",
    "name": "Hop USDT",
    "symbol": "hUSDT",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDT.png",
    "chainId": 42161
  },
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": {
    "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/icon",
    "chainId": 42161
  },
  "0xBfa641051Ba0a0Ad1b0AcF549a89536A0D76472E": {
    "address": "0xBfa641051Ba0a0Ad1b0AcF549a89536A0D76472E",
    "name": "Badger",
    "symbol": "BADGER",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbfa641051ba0a0ad1b0acf549a89536a0d76472e/icon",
    "chainId": 42161
  },
  "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8": {
    "address": "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",
    "name": "Balancer",
    "symbol": "BAL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8/icon",
    "chainId": 42161
  },
  "0x3a8B787f78D775AECFEEa15706D4221B40F345AB": {
    "address": "0x3a8B787f78D775AECFEEa15706D4221B40F345AB",
    "name": "CelerToken",
    "symbol": "CELR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3a8b787f78d775aecfeea15706d4221b40f345ab/icon",
    "chainId": 42161
  },
  "0x354A6dA3fcde098F8389cad84b0182725c6C91dE": {
    "address": "0x354A6dA3fcde098F8389cad84b0182725c6C91dE",
    "name": "Compound",
    "symbol": "COMP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x354a6da3fcde098f8389cad84b0182725c6c91de/icon",
    "chainId": 42161
  },
  "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978": {
    "address": "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    "name": "Curve DAO Token",
    "symbol": "CRV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x11cdb42b0eb46d95f990bedd4695a6e3fa034978/icon",
    "chainId": 42161
  },
  "0x8038F3C971414FD1FC220bA727F2D4A0fC98cb65": {
    "address": "0x8038F3C971414FD1FC220bA727F2D4A0fC98cb65",
    "name": "dHedge DAO Token",
    "symbol": "DHT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8038f3c971414fd1fc220ba727f2d4a0fc98cb65/icon",
    "chainId": 42161
  },
  "0xC3Ae0333F0F34aa734D5493276223d95B8F9Cb37": {
    "address": "0xC3Ae0333F0F34aa734D5493276223d95B8F9Cb37",
    "name": "DXdao",
    "symbol": "DXD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc3ae0333f0f34aa734d5493276223d95b8f9cb37/icon",
    "chainId": 42161
  },
  "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a": {
    "address": "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    "name": "GMX",
    "symbol": "GMX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a/icon",
    "chainId": 42161
  },
  "0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1": {
    "address": "0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1",
    "name": "Gnosis Token",
    "symbol": "GNO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa0b862f60edef4452f25b4160f177db44deb6cf1/icon",
    "chainId": 42161
  },
  "0x3CD1833Ce959E087D0eF0Cb45ed06BffE60F23Ba": {
    "address": "0x3CD1833Ce959E087D0eF0Cb45ed06BffE60F23Ba",
    "name": "Land",
    "symbol": "LAND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3cd1833ce959e087d0ef0cb45ed06bffe60f23ba/icon",
    "chainId": 42161
  },
  "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4": {
    "address": "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    "name": "ChainLink Token",
    "symbol": "LINK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf97f4df75117a78c1a5a0dbb814af92458539fb4/icon",
    "chainId": 42161
  },
  "0x99F40b01BA9C469193B360f72740E416B17Ac332": {
    "address": "0x99F40b01BA9C469193B360f72740E416B17Ac332",
    "name": "MATH Token",
    "symbol": "MATH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x99f40b01ba9c469193b360f72740e416b17ac332/icon",
    "chainId": 42161
  },
  "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42": {
    "address": "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42",
    "name": "MCDEX Token",
    "symbol": "MCB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4e352cf164e64adcbad318c3a1e222e9eba4ce42/icon",
    "chainId": 42161
  },
  "0x2e9a6Df78E42a30712c10a9Dc4b1C8656f8F2879": {
    "address": "0x2e9a6Df78E42a30712c10a9Dc4b1C8656f8F2879",
    "name": "Maker",
    "symbol": "MKR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2e9a6df78e42a30712c10a9dc4b1c8656f8f2879/icon",
    "chainId": 42161
  },
  "0x3642c0680329ae3e103E2B5AB29DDfed4d43CBE5": {
    "address": "0x3642c0680329ae3e103E2B5AB29DDfed4d43CBE5",
    "name": "Plenny",
    "symbol": "PL2",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3642c0680329ae3e103e2b5ab29ddfed4d43cbe5/icon",
    "chainId": 42161
  },
  "0x51fC0f6660482Ea73330E414eFd7808811a57Fa2": {
    "address": "0x51fC0f6660482Ea73330E414eFd7808811a57Fa2",
    "name": "Premia",
    "symbol": "PREMIA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x51fc0f6660482ea73330e414efd7808811a57fa2/icon",
    "chainId": 42161
  },
  "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A": {
    "address": "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A",
    "name": "SushiToken",
    "symbol": "SUSHI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd4d42f0b6def4ce0383636770ef773390d85c61a/icon",
    "chainId": 42161
  },
  "0xdE903E2712288A1dA82942DDdF2c20529565aC30": {
    "address": "0xdE903E2712288A1dA82942DDdF2c20529565aC30",
    "name": "Swapr",
    "symbol": "SWPR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xde903e2712288a1da82942dddf2c20529565ac30/icon",
    "chainId": 42161
  },
  "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0": {
    "address": "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    "name": "Uniswap",
    "symbol": "UNI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0/icon",
    "chainId": 42161
  },
  "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9": {
    "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    "name": "Tether USD",
    "symbol": "USDT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9/icon",
    "chainId": 42161
  },
  "0x0F61B24272AF65EACF6adFe507028957698e032F": {
    "address": "0x0F61B24272AF65EACF6adFe507028957698e032F",
    "name": "Zippie",
    "symbol": "ZIPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0f61b24272af65eacf6adfe507028957698e032f/icon",
    "chainId": 42161
  },
  "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A": {
    "address": "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
    "name": "Magic Internet Money",
    "symbol": "MIM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a/icon",
    "chainId": 42161
  },
  "0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF": {
    "address": "0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF",
    "name": "Spell Token",
    "symbol": "SPELL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af/icon",
    "chainId": 42161
  },
  "0x739ca6D71365a08f584c8FC4e1029045Fa8ABC4B": {
    "address": "0x739ca6D71365a08f584c8FC4e1029045Fa8ABC4B",
    "name": "Wrapped sOHM",
    "symbol": "wsOHM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x739ca6d71365a08f584c8fc4e1029045fa8abc4b/icon",
    "chainId": 42161
  },
  "0x1dDcaa4Ed761428ae348BEfC6718BCb12e63bFaa": {
    "address": "0x1dDcaa4Ed761428ae348BEfC6718BCb12e63bFaa",
    "name": "deBridge USD Coin",
    "symbol": "deUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1ddcaa4ed761428ae348befc6718bcb12e63bfaa/icon",
    "chainId": 42161
  },
  "0xcFe3FBc98D80f7Eca0bC76cD1F406A19dD425896": {
    "address": "0xcFe3FBc98D80f7Eca0bC76cD1F406A19dD425896",
    "name": "Scalara NFT Index",
    "symbol": "NFTI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcfe3fbc98d80f7eca0bc76cd1f406a19dd425896/icon",
    "chainId": 42161
  },
  "0x123389C2f0e9194d9bA98c21E63c375B67614108": {
    "address": "0x123389C2f0e9194d9bA98c21E63c375B67614108",
    "name": "EthereumMax",
    "symbol": "EMAX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x123389c2f0e9194d9ba98c21e63c375b67614108/icon",
    "chainId": 42161
  },
  "0xcAB86F6Fb6d1C2cBeeB97854A0C023446A075Fe3": {
    "address": "0xcAB86F6Fb6d1C2cBeeB97854A0C023446A075Fe3",
    "name": "deBridge Ether",
    "symbol": "deETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcab86f6fb6d1c2cbeeb97854a0c023446a075fe3/icon",
    "chainId": 42161
  },
  "0xeEeEEb57642040bE42185f49C52F7E9B38f8eeeE": {
    "address": "0xeEeEEb57642040bE42185f49C52F7E9B38f8eeeE",
    "name": "Elk",
    "symbol": "ELK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeeeeeb57642040be42185f49c52f7e9b38f8eeee/icon",
    "chainId": 42161
  },
  "0x75C9bC761d88f70156DAf83aa010E84680baF131": {
    "address": "0x75C9bC761d88f70156DAf83aa010E84680baF131",
    "name": "Saddle DAO",
    "symbol": "SDL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x75c9bc761d88f70156daf83aa010e84680baf131/icon",
    "chainId": 42161
  },
  "0xC74fE4c715510Ec2F8C61d70D397B32043F55Abe": {
    "address": "0xC74fE4c715510Ec2F8C61d70D397B32043F55Abe",
    "name": "Mycelium",
    "symbol": "MYC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc74fe4c715510ec2f8c61d70d397b32043f55abe/icon",
    "chainId": 42161
  },
  "0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17": {
    "address": "0x64343594Ab9b56e99087BfA6F2335Db24c2d1F17",
    "name": "Vesta Stable",
    "symbol": "VST",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x64343594ab9b56e99087bfa6f2335db24c2d1f17/icon",
    "chainId": 42161
  },
  "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55": {
    "address": "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
    "name": "Dopex Governance Token",
    "symbol": "DPX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55/icon",
    "chainId": 42161
  },
  "0x6694340fc020c5E6B96567843da2df01b2CE1eb6": {
    "address": "0x6694340fc020c5E6B96567843da2df01b2CE1eb6",
    "name": "StargateToken",
    "symbol": "STG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6694340fc020c5e6b96567843da2df01b2ce1eb6/icon",
    "chainId": 42161
  },
  "0x93C15cd7DE26f07265f0272E0b831C5D7fAb174f": {
    "address": "0x93C15cd7DE26f07265f0272E0b831C5D7fAb174f",
    "name": "Liquid",
    "symbol": "LIQD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x93c15cd7de26f07265f0272e0b831c5d7fab174f/icon",
    "chainId": 42161
  },
  "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC": {
    "address": "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
    "name": "Hop",
    "symbol": "HOP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc/icon",
    "chainId": 42161
  },
  "0x5979D7b546E38E414F7E9822514be443A4800529": {
    "address": "0x5979D7b546E38E414F7E9822514be443A4800529",
    "name": "Wrapped liquid staked Ether 2.0",
    "symbol": "wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5979d7b546e38e414f7e9822514be443a4800529/icon",
    "chainId": 42161
  },
  "0xD74f5255D557944cf7Dd0E45FF521520002D5748": {
    "address": "0xD74f5255D557944cf7Dd0E45FF521520002D5748",
    "name": "Sperax USD",
    "symbol": "USDs",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd74f5255d557944cf7dd0e45ff521520002d5748/icon",
    "chainId": 42161
  },
  "0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7": {
    "address": "0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7",
    "name": "agEUR",
    "symbol": "agEUR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfa5ed56a203466cbbc2430a43c66b9d8723528e7/icon",
    "chainId": 42161
  },
  "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60": {
    "address": "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60",
    "name": "Lido DAO Token",
    "symbol": "LDO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60/icon",
    "chainId": 42161
  },
  "0x9E758B8a98a42d612b3D38B66a22074DC03D7370": {
    "address": "0x9E758B8a98a42d612b3D38B66a22074DC03D7370",
    "name": "Symbiosis",
    "symbol": "SIS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9e758b8a98a42d612b3d38b66a22074dc03d7370/icon",
    "chainId": 42161
  },
  "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07": {
    "address": "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07",
    "name": "JoeToken",
    "symbol": "JOE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07/icon",
    "chainId": 42161
  },
  "0x55fF62567f09906A85183b866dF84bf599a4bf70": {
    "address": "0x55fF62567f09906A85183b866dF84bf599a4bf70",
    "name": "Kromatika",
    "symbol": "KROM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x55ff62567f09906a85183b866df84bf599a4bf70/icon",
    "chainId": 42161
  },
  "0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65": {
    "address": "0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65",
    "name": "USD+",
    "symbol": "USD+",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe80772eaf6e2e18b651f160bc9158b2a5cafca65/icon",
    "chainId": 42161
  },
  "0x912CE59144191C1204E64559FE8253a0e49E6548": {
    "address": "0x912CE59144191C1204E64559FE8253a0e49E6548",
    "name": "Arbitrum",
    "symbol": "ARB",
    "decimals": 18,
    "logoURI": "https://arbiscan.io/token/images/arbitrumone2_32_new.png",
    "chainId": 42161
  },
  "0xdA51015b73cE11F77A115Bb1b8a7049e02dDEcf0": {
    "address": "0xdA51015b73cE11F77A115Bb1b8a7049e02dDEcf0",
    "name": "Neutra Token",
    "symbol": "NEU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xda51015b73ce11f77a115bb1b8a7049e02ddecf0/icon",
    "chainId": 42161
  },
  "0x417a1aFD44250314BffB11ff68E989775e990ab6": {
    "address": "0x417a1aFD44250314BffB11ff68E989775e990ab6",
    "name": "Volta Protocol Token",
    "symbol": "VOLTA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x417a1afd44250314bffb11ff68e989775e990ab6/icon",
    "chainId": 42161
  },
  "0xc628534100180582E43271448098cb2c185795BD": {
    "address": "0xc628534100180582E43271448098cb2c185795BD",
    "name": "Flashstake",
    "symbol": "FLASH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc628534100180582e43271448098cb2c185795bd/icon",
    "chainId": 42161
  },
  "0x088cd8f5eF3652623c22D48b1605DCfE860Cd704": {
    "address": "0x088cd8f5eF3652623c22D48b1605DCfE860Cd704",
    "name": "VelaToken",
    "symbol": "VELA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x088cd8f5ef3652623c22d48b1605dcfe860cd704/icon",
    "chainId": 42161
  },
  "0x15a808ed3846D25e88AE868DE79F1bcB1Ac382B5": {
    "address": "0x15a808ed3846D25e88AE868DE79F1bcB1Ac382B5",
    "name": "Metavault DAO",
    "symbol": "MVD",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x15a808ed3846d25e88ae868de79f1bcb1ac382b5/icon",
    "chainId": 42161
  },
  "0xf0a562BEe81f674E0c5486C9716060f4cD5Ef944": {
    "address": "0xf0a562BEe81f674E0c5486C9716060f4cD5Ef944",
    "name": "Unbound Dollar",
    "symbol": "UND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf0a562bee81f674e0c5486c9716060f4cd5ef944/icon",
    "chainId": 42161
  },
  "0xD5eBD23D5eb968c2efbA2B03F27Ee61718609A71": {
    "address": "0xD5eBD23D5eb968c2efbA2B03F27Ee61718609A71",
    "name": "Unbound",
    "symbol": "UNB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd5ebd23d5eb968c2efba2b03f27ee61718609a71/icon",
    "chainId": 42161
  },
  "0x9ed7E4B1BFF939ad473dA5E7a218C771D1569456": {
    "address": "0x9ed7E4B1BFF939ad473dA5E7a218C771D1569456",
    "name": "Reunit Token",
    "symbol": "REUNI",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9ed7e4b1bff939ad473da5e7a218c771d1569456/icon",
    "chainId": 42161
  },
  "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8": {
    "address": "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8",
    "name": "Rocket Pool ETH",
    "symbol": "rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8/icon",
    "chainId": 42161
  },
  "0x3082CC23568eA640225c2467653dB90e9250AaA0": {
    "address": "0x3082CC23568eA640225c2467653dB90e9250AaA0",
    "name": "Radiant",
    "symbol": "RDNT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3082cc23568ea640225c2467653db90e9250aaa0/icon",
    "chainId": 42161
  },
  "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE": {
    "address": "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE",
    "name": "beefy.finance",
    "symbol": "BIFI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae/icon",
    "chainId": 42161
  },
  "0x079504b86d38119F859c4194765029F692b7B7aa": {
    "address": "0x079504b86d38119F859c4194765029F692b7B7aa",
    "name": "Lyra Token",
    "symbol": "LYRA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x079504b86d38119f859c4194765029f692b7b7aa/icon",
    "chainId": 42161
  },
  "0x965F298E4ade51C0b0bB24e3369deB6C7D5b3951": {
    "address": "0x965F298E4ade51C0b0bB24e3369deB6C7D5b3951",
    "name": "AutoDCA",
    "symbol": "DCA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x965f298e4ade51c0b0bb24e3369deb6c7d5b3951/icon",
    "chainId": 42161
  },
  "0x32Eb7902D4134bf98A28b963D26de779AF92A212": {
    "address": "0x32Eb7902D4134bf98A28b963D26de779AF92A212",
    "name": "Dopex Rebate Token",
    "symbol": "RDPX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32eb7902d4134bf98a28b963d26de779af92a212/icon",
    "chainId": 42161
  },
  "0xeb8E93A0c7504Bffd8A8fFa56CD754c63aAeBFe8": {
    "address": "0xeb8E93A0c7504Bffd8A8fFa56CD754c63aAeBFe8",
    "name": "DAI+",
    "symbol": "DAI+",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeb8e93a0c7504bffd8a8ffa56cd754c63aaebfe8/icon",
    "chainId": 42161
  },
  "0xB64E280e9D1B5DbEc4AcceDb2257A87b400DB149": {
    "address": "0xB64E280e9D1B5DbEc4AcceDb2257A87b400DB149",
    "name": "Level Token",
    "symbol": "LVL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb64e280e9d1b5dbec4accedb2257a87b400db149/icon",
    "chainId": 42161
  },
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831": {
    "address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "name": "USD Coin",
    "symbol": "USDC",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png",
    "chainId": 42161
  },
  "0x9623063377AD1B27544C965cCd7342f7EA7e88C7": {
    "address": "0x9623063377AD1B27544C965cCd7342f7EA7e88C7",
    "name": "Graph Token",
    "symbol": "GRT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9623063377ad1b27544c965ccd7342f7ea7e88c7/icon",
    "chainId": 42161
  },
  "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d": {
    "address": "0x3F56e0c36d275367b8C502090EDF38289b3dEa0d",
    "name": "Mai Stablecoin",
    "symbol": "MAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3f56e0c36d275367b8c502090edf38289b3dea0d/icon",
    "chainId": 42161
  },
  "0xB766039cc6DB368759C1E56B79AFfE831d0Cc507": {
    "address": "0xB766039cc6DB368759C1E56B79AFfE831d0Cc507",
    "name": "Rocket Pool Protocol",
    "symbol": "RPL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb766039cc6db368759c1e56b79affe831d0cc507/icon",
    "chainId": 42161
  },
  "0xC19669A405067927865B40Ea045a2baabbbe57f5": {
    "address": "0xC19669A405067927865B40Ea045a2baabbbe57f5",
    "name": "STAR",
    "symbol": "STAR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc19669a405067927865b40ea045a2baabbbe57f5/icon",
    "chainId": 42161
  },
  "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8": {
    "address": "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
    "name": "Pendle",
    "symbol": "PENDLE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8/icon",
    "chainId": 42161
  },
  "0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf": {
    "address": "0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf",
    "name": "Aave Arbitrum wstETH",
    "symbol": "aArbwstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff/icon",
    "chainId": 42161
  },
  "0x0dF5dfd95966753f01cb80E76dc20EA958238C46": {
    "address": "0x0dF5dfd95966753f01cb80E76dc20EA958238C46",
    "name": "Radiant interest bearing WETH",
    "symbol": "rWETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0df5dfd95966753f01cb80e76dc20ea958238c46/icon",
    "chainId": 42161
  },
  "0x32dF62dc3aEd2cD6224193052Ce665DC18165841": {
    "address": "0x32dF62dc3aEd2cD6224193052Ce665DC18165841",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32df62dc3aed2cd6224193052ce665dc18165841/icon",
    "chainId": 42161
  },
  "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8": {
    "address": "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
    "name": "Aave Arbitrum WETH",
    "symbol": "aArbWETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8/icon",
    "chainId": 42161
  },
  "0x078f358208685046a11C85e8ad32895DED33A249": {
    "address": "0x078f358208685046a11C85e8ad32895DED33A249",
    "name": "Aave Arbitrum WBTC",
    "symbol": "aArbWBTC",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x078f358208685046a11c85e8ad32895ded33a249/icon",
    "chainId": 42161
  },
  "0x42C248D137512907048021B30d9dA17f48B5b7B2": {
    "address": "0x42C248D137512907048021B30d9dA17f48B5b7B2",
    "name": "Radiant interest bearing WSTETH",
    "symbol": "rWSTETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x42c248d137512907048021b30d9da17f48b5b7b2/icon",
    "chainId": 42161
  },
  "0x48a29E756CC1C097388f3B2f3b570ED270423b3d": {
    "address": "0x48a29E756CC1C097388f3B2f3b570ED270423b3d",
    "name": "Radiant interest bearing USDC",
    "symbol": "rUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x48a29e756cc1c097388f3b2f3b570ed270423b3d/icon",
    "chainId": 42161
  },
  "0x727354712BDFcd8596a3852Fd2065b3C34F4F770": {
    "address": "0x727354712BDFcd8596a3852Fd2065b3C34F4F770",
    "name": "Radiant interest bearing WBTC",
    "symbol": "rWBTC",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x727354712bdfcd8596a3852fd2065b3c34f4f770/icon",
    "chainId": 42161
  },
  "0x2dADe5b7df9DA3a7e1c9748d169Cd6dFf77e3d01": {
    "address": "0x2dADe5b7df9DA3a7e1c9748d169Cd6dFf77e3d01",
    "name": "Radiant interest bearing ARB",
    "symbol": "rARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2dade5b7df9da3a7e1c9748d169cd6dff77e3d01/icon",
    "chainId": 42161
  },
  "0xB7E50106A5bd3Cf21AF210A755F9C8740890A8c9": {
    "address": "0xB7E50106A5bd3Cf21AF210A755F9C8740890A8c9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb7e50106a5bd3cf21af210a755f9c8740890a8c9/icon",
    "chainId": 42161
  },
  "0x539bdE0d7Dbd336b79148AA742883198BBF60342": {
    "address": "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    "name": "MAGIC",
    "symbol": "MAGIC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x539bde0d7dbd336b79148aa742883198bbf60342/icon",
    "chainId": 42161
  },
  "0x7f90122BF0700F9E7e1F688fe926940E8839F353": {
    "address": "0x7f90122BF0700F9E7e1F688fe926940E8839F353",
    "name": "Curve.fi USDC/USDT",
    "symbol": "2CRV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7f90122bf0700f9e7e1f688fe926940e8839f353/icon",
    "chainId": 42161
  },
  "0xd69D402D1bDB9A2b8c3d88D98b9CEaf9e4Cd72d9": {
    "address": "0xd69D402D1bDB9A2b8c3d88D98b9CEaf9e4Cd72d9",
    "name": "Radiant interest bearing USDT",
    "symbol": "rUSDT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd69d402d1bdb9a2b8c3d88d98b9ceaf9e4cd72d9/icon",
    "chainId": 42161
  },
  "0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530": {
    "address": "0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530",
    "name": "Aave Arbitrum LINK",
    "symbol": "aArbLINK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x191c10aa4af7c30e871e70c95db0e4eb77237530/icon",
    "chainId": 42161
  },
  "0x905dfCD5649217c42684f23958568e533C711Aa3": {
    "address": "0x905dfCD5649217c42684f23958568e533C711Aa3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x905dfcd5649217c42684f23958568e533c711aa3/icon",
    "chainId": 42161
  },
  "0xbcaA6c053cab3Dd73a2E898d89A4f84a180ae1CA": {
    "address": "0xbcaA6c053cab3Dd73a2E898d89A4f84a180ae1CA",
    "name": "33AURA-33ARB-33BAL",
    "symbol": "33AURA-33ARB-33BAL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca/icon",
    "chainId": 42161
  },
  "0x1509706a6c66CA549ff0cB464de88231DDBe213B": {
    "address": "0x1509706a6c66CA549ff0cB464de88231DDBe213B",
    "name": "Aura",
    "symbol": "AURA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1509706a6c66ca549ff0cb464de88231ddbe213b/icon",
    "chainId": 42161
  },
  "0x0D914606f3424804FA1BbBE56CCC3416733acEC6": {
    "address": "0x0D914606f3424804FA1BbBE56CCC3416733acEC6",
    "name": "Radiant interest bearing DAI",
    "symbol": "rDAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0d914606f3424804fa1bbbe56ccc3416733acec6/icon",
    "chainId": 42161
  },
  "0x7418F5A2621E13c05d1EFBd71ec922070794b90a": {
    "address": "0x7418F5A2621E13c05d1EFBd71ec922070794b90a",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7418f5a2621e13c05d1efbd71ec922070794b90a/icon",
    "chainId": 42161
  },
  "0x6fD58f5a2F3468e35fEb098b5F59F04157002407": {
    "address": "0x6fD58f5a2F3468e35fEb098b5F59F04157002407",
    "name": "poor guy",
    "symbol": "pogai",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6fd58f5a2f3468e35feb098b5f59f04157002407/icon",
    "chainId": 42161
  },
  "0x6533afac2E7BCCB20dca161449A13A32D391fb00": {
    "address": "0x6533afac2E7BCCB20dca161449A13A32D391fb00",
    "name": "Aave Arbitrum ARB",
    "symbol": "aArbARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6533afac2e7bccb20dca161449a13a32d391fb00/icon",
    "chainId": 42161
  },
  "0xa6c5C7D189fA4eB5Af8ba34E63dCDD3a635D433f": {
    "address": "0xa6c5C7D189fA4eB5Af8ba34E63dCDD3a635D433f",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa6c5c7d189fa4eb5af8ba34e63dcdd3a635d433f/icon",
    "chainId": 42161
  },
  "0x73ca43c063F06cBEE4358A2Fb705B0F9088e243f": {
    "address": "0x73ca43c063F06cBEE4358A2Fb705B0F9088e243f",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x73ca43c063f06cbee4358a2fb705b0f9088e243f/icon",
    "chainId": 42161
  },
  "0x6dD963C510c2D2f09d5eDdB48Ede45FeD063Eb36": {
    "address": "0x6dD963C510c2D2f09d5eDdB48Ede45FeD063Eb36",
    "name": "Factor",
    "symbol": "FCTR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6dd963c510c2d2f09d5eddb48ede45fed063eb36/icon",
    "chainId": 42161
  },
  "0x8e0B8c8BB9db49a46697F3a5Bb8A308e744821D2": {
    "address": "0x8e0B8c8BB9db49a46697F3a5Bb8A308e744821D2",
    "name": "Curve.fi USD-BTC-ETH",
    "symbol": "crv3crypto",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8e0b8c8bb9db49a46697f3a5bb8a308e744821d2/icon",
    "chainId": 42161
  },
  "0x85B10228cd93A6e5E354Ff0f2c60875E8E62F65A": {
    "address": "0x85B10228cd93A6e5E354Ff0f2c60875E8E62F65A",
    "name": "Moo Balancer Arb wstETH-ETH V3",
    "symbol": "mooBalancerArbwstETH-ETHV3",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x85b10228cd93a6e5e354ff0f2c60875e8e62f65a/icon",
    "chainId": 42161
  },
  "0x6ab707Aca953eDAeFBc4fD23bA73294241490620": {
    "address": "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
    "name": "Aave Arbitrum USDT",
    "symbol": "aArbUSDT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6ab707aca953edaefbc4fd23ba73294241490620/icon",
    "chainId": 42161
  },
  "0x9791d590788598535278552EEcD4b211bFc790CB": {
    "address": "0x9791d590788598535278552EEcD4b211bFc790CB",
    "name": "Balancer wstETH-WETH Stable Pool",
    "symbol": "wstETH-WETH-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9791d590788598535278552eecd4b211bfc790cb/icon",
    "chainId": 42161
  },
  "0xDbcD16e622c95AcB2650b38eC799f76BFC557a0b": {
    "address": "0xDbcD16e622c95AcB2650b38eC799f76BFC557a0b",
    "name": "Curve.fi ETH/wstETH",
    "symbol": "wstETHCRV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdbcd16e622c95acb2650b38ec799f76bfc557a0b/icon",
    "chainId": 42161
  },
  "0x9dbbBaecACEDf53d5Caa295b8293c1def2055Adc": {
    "address": "0x9dbbBaecACEDf53d5Caa295b8293c1def2055Adc",
    "name": "Moo Gmx GLP",
    "symbol": "mooGmxGLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9dbbbaecacedf53d5caa295b8293c1def2055adc/icon",
    "chainId": 42161
  },
  "0xAa6d06CeB39132b720b54259B70F41f9C975782A": {
    "address": "0xAa6d06CeB39132b720b54259B70F41f9C975782A",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa6d06ceb39132b720b54259b70f41f9c975782a/icon",
    "chainId": 42161
  },
  "0xc9f52540976385A84BF416903e1Ca3983c539E34": {
    "address": "0xc9f52540976385A84BF416903e1Ca3983c539E34",
    "name": "50tBTC-50WETH",
    "symbol": "50tBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc9f52540976385a84bf416903e1ca3983c539e34/icon",
    "chainId": 42161
  },
  "0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf": {
    "address": "0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf",
    "name": "StakedGlp",
    "symbol": "sGLP",
    "decimals": 18,
    "logoURI": "https://pirex.io/assets/images/tokens/GLP.png",
    "chainId": 42161
  },
  "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40": {
    "address": "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40",
    "name": "Arbitrum tBTC v2",
    "symbol": "tBTC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6c84a8f1c29108f47a79964b5fe888d4f4d0de40/icon",
    "chainId": 42161
  },
  "0xD77B108d4f6cefaa0Cae9506A934e825BEccA46E": {
    "address": "0xD77B108d4f6cefaa0Cae9506A934e825BEccA46E",
    "name": "WINR",
    "symbol": "WINR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd77b108d4f6cefaa0cae9506a934e825becca46e/icon",
    "chainId": 42161
  },
  "0x30dF229cefa463e991e29D42DB0bae2e122B2AC7": {
    "address": "0x30dF229cefa463e991e29D42DB0bae2e122B2AC7",
    "name": "Curve.fi Factory USD Metapool: MIM",
    "symbol": "MIM3CRV-f",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x30df229cefa463e991e29d42db0bae2e122b2ac7/icon",
    "chainId": 42161
  },
  "0x625E7708f30cA75bfd92586e17077590C60eb4cD": {
    "address": "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
    "name": "Aave Arbitrum USDC",
    "symbol": "aArbUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x625e7708f30ca75bfd92586e17077590c60eb4cd/icon",
    "chainId": 42161
  },
  "0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f": {
    "address": "0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f",
    "name": "Balancer wstETH-WETH Stable Pool",
    "symbol": "B-wstETH-WETH-Stable",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x36bf227d6bac96e2ab1ebb5492ecec69c691943f/icon",
    "chainId": 42161
  },
  "0x9E75f8298e458B76382870982788988A0799195b": {
    "address": "0x9E75f8298e458B76382870982788988A0799195b",
    "name": "Moo Curve wstETH",
    "symbol": "mooCurveWSTETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9e75f8298e458b76382870982788988a0799195b/icon",
    "chainId": 42161
  },
  "0x0C1Cf6883efA1B496B01f654E247B9b419873054": {
    "address": "0x0C1Cf6883efA1B496B01f654E247B9b419873054",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c1cf6883efa1b496b01f654e247b9b419873054/icon",
    "chainId": 42161
  },
  "0x8Eb270e296023E9D92081fdF967dDd7878724424": {
    "address": "0x8Eb270e296023E9D92081fdF967dDd7878724424",
    "name": "Aave Arbitrum rETH",
    "symbol": "aArbrETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8eb270e296023e9d92081fdf967ddd7878724424/icon",
    "chainId": 42161
  },
  "0x83d6c8C06ac276465e4C92E7aC8C23740F435140": {
    "address": "0x83d6c8C06ac276465e4C92E7aC8C23740F435140",
    "name": "HMX",
    "symbol": "HMX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x83d6c8c06ac276465e4c92e7ac8c23740f435140/icon",
    "chainId": 42161
  },
  "0xDa2307A45D298e855415675bF388e2bd64351D5b": {
    "address": "0xDa2307A45D298e855415675bF388e2bd64351D5b",
    "name": "Moo Abrcdbr MIM-2CRV",
    "symbol": "mooAbrcdbrMIM-2CRV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xda2307a45d298e855415675bf388e2bd64351d5b/icon",
    "chainId": 42161
  },
  "0xaa5bD49f2162ffdC15634c87A77AC67bD51C6a6D": {
    "address": "0xaa5bD49f2162ffdC15634c87A77AC67bD51C6a6D",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa5bd49f2162ffdc15634c87a77ac67bd51c6a6d/icon",
    "chainId": 42161
  },
  "0xBfCa4230115DE8341F3A3d5e8845fFb3337B2Be3": {
    "address": "0xBfCa4230115DE8341F3A3d5e8845fFb3337B2Be3",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbfca4230115de8341f3a3d5e8845ffb3337b2be3/icon",
    "chainId": 42161
  },
  "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1": {
    "address": "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",
    "name": "Governance OHM",
    "symbol": "gOHM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1/icon",
    "chainId": 42161
  },
  "0xB27c433C1cdb1B42E2601Af2d40dD442fbf1cdc3": {
    "address": "0xB27c433C1cdb1B42E2601Af2d40dD442fbf1cdc3",
    "name": "Moo Balancer wstETH-ETH V2",
    "symbol": "mooBalancerwstETH-ETHV2",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb27c433c1cdb1b42e2601af2d40dd442fbf1cdc3/icon",
    "chainId": 42161
  },
  "0x460c2c075340EbC19Cf4af68E5d83C194E7D21D0": {
    "address": "0x460c2c075340EbC19Cf4af68E5d83C194E7D21D0",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x460c2c075340ebc19cf4af68e5d83c194e7d21d0/icon",
    "chainId": 42161
  },
  "0x10393c20975cF177a3513071bC110f7962CD67da": {
    "address": "0x10393c20975cF177a3513071bC110f7962CD67da",
    "name": "Jones DAO",
    "symbol": "JONES",
    "decimals": 18,
    "logoURI": "https://arbiscan.io/token/images/jonesdaoarb_32.png",
    "chainId": 42161
  },
  "0x9164424A33a89202040F02170431073c59eFa1A9": {
    "address": "0x9164424A33a89202040F02170431073c59eFa1A9",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9164424a33a89202040f02170431073c59efa1a9/icon",
    "chainId": 42161
  },
  "0x982239D38Af50B0168dA33346d85Fb12929c4c07": {
    "address": "0x982239D38Af50B0168dA33346d85Fb12929c4c07",
    "name": "Arbitrove Governance Token",
    "symbol": "TROVE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x982239d38af50b0168da33346d85fb12929c4c07/icon",
    "chainId": 42161
  },
  "0xA5836838B7B9B3966066eD4382d86d111cA38959": {
    "address": "0xA5836838B7B9B3966066eD4382d86d111cA38959",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa5836838b7b9b3966066ed4382d86d111ca38959/icon",
    "chainId": 42161
  },
  "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e": {
    "address": "0x915A55e36A01285A14f05dE6e81ED9cE89772f8e",
    "name": "Stargate Ether Vault-LP",
    "symbol": "S*SGETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x915a55e36a01285a14f05de6e81ed9ce89772f8e/icon",
    "chainId": 42161
  },
  "0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0": {
    "address": "0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0",
    "name": "Stargate Ether Vault",
    "symbol": "SGETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x82cbecf39bee528b5476fe6d1550af59a9db6fc0/icon",
    "chainId": 42161
  },
  "0x4167ad1FeC5190e6FA7aa97cD1C40f63bd6C64D0": {
    "address": "0x4167ad1FeC5190e6FA7aa97cD1C40f63bd6C64D0",
    "name": "hh",
    "symbol": "hh",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4167ad1fec5190e6fa7aa97cd1c40f63bd6c64d0/icon",
    "chainId": 42161
  },
  "0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5": {
    "address": "0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5",
    "name": "Curve.fi Factory Plain Pool: FRAXBP",
    "symbol": "FRAXBP-f",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5/icon",
    "chainId": 42161
  },
  "0x07Db98358D58Ba9bE90cd0A18cd86AF807ac3B4E": {
    "address": "0x07Db98358D58Ba9bE90cd0A18cd86AF807ac3B4E",
    "name": "Moo Sushi WETH-USDC",
    "symbol": "mooSushiWETH-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x07db98358d58ba9be90cd0a18cd86af807ac3b4e/icon",
    "chainId": 42161
  },
  "0xEc7c0205a6f426c2Cb1667d783B5B4fD2f875434": {
    "address": "0xEc7c0205a6f426c2Cb1667d783B5B4fD2f875434",
    "name": "Moo Curve 2Pool",
    "symbol": "mooCurve2Pool",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xec7c0205a6f426c2cb1667d783b5b4fd2f875434/icon",
    "chainId": 42161
  },
  "0x84652bb2539513BAf36e225c930Fdd8eaa63CE27": {
    "address": "0x84652bb2539513BAf36e225c930Fdd8eaa63CE27",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x84652bb2539513baf36e225c930fdd8eaa63ce27/icon",
    "chainId": 42161
  },
  "0xb3028Ca124B80CFE6E9CA57B70eF2F0CCC41eBd4": {
    "address": "0xb3028Ca124B80CFE6E9CA57B70eF2F0CCC41eBd4",
    "name": "50MAGIC-50USDC",
    "symbol": "50MAGIC-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb3028ca124b80cfe6e9ca57b70ef2f0ccc41ebd4/icon",
    "chainId": 42161
  },
  "0x3a4c6D2404b5eb14915041e01F63200a82f4a343": {
    "address": "0x3a4c6D2404b5eb14915041e01F63200a82f4a343",
    "name": "50STG-50USDC",
    "symbol": "50STG-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3a4c6d2404b5eb14915041e01f63200a82f4a343/icon",
    "chainId": 42161
  },
  "0xc7FA3A3527435720f0e2a4c1378335324dd4F9b3": {
    "address": "0xc7FA3A3527435720f0e2a4c1378335324dd4F9b3",
    "name": "AuraBal wstETH Pool",
    "symbol": "55auraBal-45wsteth",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc7fa3a3527435720f0e2a4c1378335324dd4f9b3/icon",
    "chainId": 42161
  },
  "0x223738a747383d6F9f827d95964e4d8E8AC754cE": {
    "address": "0x223738a747383d6F9f827d95964e4d8E8AC754cE",
    "name": "Aura BAL",
    "symbol": "auraBAL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x223738a747383d6f9f827d95964e4d8e8ac754ce/icon",
    "chainId": 42161
  },
  "0x8cbaAC87FDD9Bb6C3FdB5b3C870b2443D0284fa6": {
    "address": "0x8cbaAC87FDD9Bb6C3FdB5b3C870b2443D0284fa6",
    "name": "Moo Sushi MAGIC-ETH",
    "symbol": "mooSushiMAGIC-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8cbaac87fdd9bb6c3fdb5b3c870b2443d0284fa6/icon",
    "chainId": 42161
  },
  "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE": {
    "address": "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
    "name": "Aave Arbitrum DAI",
    "symbol": "aArbDAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee/icon",
    "chainId": 42161
  },
  "0xCF297A94d527A34081Db2A20Eb1c87248cD1ea81": {
    "address": "0xCF297A94d527A34081Db2A20Eb1c87248cD1ea81",
    "name": "Moo Balancer Arb ETH-rETH",
    "symbol": "mooBalancerArbETH-rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcf297a94d527a34081db2a20eb1c87248cd1ea81/icon",
    "chainId": 42161
  },
  "0x51f9f9fF6cB2266D68c04eC289c7ABa81378a383": {
    "address": "0x51f9f9fF6cB2266D68c04eC289c7ABa81378a383",
    "name": "iGameS",
    "symbol": "IGS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x51f9f9ff6cb2266d68c04ec289c7aba81378a383/icon",
    "chainId": 42161
  },
  "0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81": {
    "address": "0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81",
    "name": "Balancer rETH-WETH Stable Pool",
    "symbol": "rETH-WETH-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xade4a71bb62bec25154cfc7e6ff49a513b491e81/icon",
    "chainId": 42161
  },
  "0x71c15610F11D669d4A9e02a64e43c6D1E27c6Cad": {
    "address": "0x71c15610F11D669d4A9e02a64e43c6D1E27c6Cad",
    "name": "Moo Balancer tBTC-WETH",
    "symbol": "mooBalancertBTC-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x71c15610f11d669d4a9e02a64e43c6d1e27c6cad/icon",
    "chainId": 42161
  },
  "0x1C31fB3359357f6436565cCb3E982Bc6Bf4189ae": {
    "address": "0x1C31fB3359357f6436565cCb3E982Bc6Bf4189ae",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1c31fb3359357f6436565ccb3e982bc6bf4189ae/icon",
    "chainId": 42161
  },
  "0x724dc807b04555b71ed48a6896b6F41593b8C637": {
    "address": "0x724dc807b04555b71ed48a6896b6F41593b8C637",
    "name": "Aave Arbitrum USDCn",
    "symbol": "aArbUSDCn",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x724dc807b04555b71ed48a6896b6f41593b8c637/icon",
    "chainId": 42161
  },
  "0x772598E9e62155D7fDFe65FdF01EB5a53a8465BE": {
    "address": "0x772598E9e62155D7fDFe65FdF01EB5a53a8465BE",
    "name": "Empyreal",
    "symbol": "EMP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x772598e9e62155d7fdfe65fdf01eb5a53a8465be/icon",
    "chainId": 42161
  },
  "0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B": {
    "address": "0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B",
    "name": "BOB",
    "symbol": "BOB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b/icon",
    "chainId": 42161
  },
  "0xBDF4e730ED5152a7AC646BB7b514Ed624E1147C4": {
    "address": "0xBDF4e730ED5152a7AC646BB7b514Ed624E1147C4",
    "name": "Moo Balancer tBTC-WBTC",
    "symbol": "mooBalancertBTC-WBTC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbdf4e730ed5152a7ac646bb7b514ed624e1147c4/icon",
    "chainId": 42161
  },
  "0x616279fF3dBf57A55e3d1F2E309e5D704E4e58Ae": {
    "address": "0x616279fF3dBf57A55e3d1F2E309e5D704E4e58Ae",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x616279ff3dbf57a55e3d1f2e309e5d704e4e58ae/icon",
    "chainId": 42161
  },
  "0x542F16DA0efB162D20bF4358EfA095B70A100f9E": {
    "address": "0x542F16DA0efB162D20bF4358EfA095B70A100f9E",
    "name": "2BTC",
    "symbol": "2BTC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x542f16da0efb162d20bf4358efa095b70a100f9e/icon",
    "chainId": 42161
  },
  "0x7241bC8035b65865156DDb5EdEf3eB32874a3AF6": {
    "address": "0x7241bC8035b65865156DDb5EdEf3eB32874a3AF6",
    "name": "Jones GLP",
    "symbol": "jGLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7241bc8035b65865156ddb5edef3eb32874a3af6/icon",
    "chainId": 42161
  },
  "0xbFD465E270F8D6bA62b5000cD27D155FB5aE70f0": {
    "address": "0xbFD465E270F8D6bA62b5000cD27D155FB5aE70f0",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbfd465e270f8d6ba62b5000cd27d155fb5ae70f0/icon",
    "chainId": 42161
  },
  "0x51318B7D00db7ACc4026C88c3952B66278B6A67F": {
    "address": "0x51318B7D00db7ACc4026C88c3952B66278B6A67F",
    "name": "Plutus",
    "symbol": "PLS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x51318b7d00db7acc4026c88c3952b66278b6a67f/icon",
    "chainId": 42161
  },
  "0x0341C0C0ec423328621788d4854119B97f44E391": {
    "address": "0x0341C0C0ec423328621788d4854119B97f44E391",
    "name": "Silo Governance Token",
    "symbol": "Silo",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0341c0c0ec423328621788d4854119b97f44e391/icon",
    "chainId": 42161
  },
  "0xCB0E5bFa72bBb4d16AB5aA0c60601c438F04b4ad": {
    "address": "0xCB0E5bFa72bBb4d16AB5aA0c60601c438F04b4ad",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcb0e5bfa72bbb4d16ab5aa0c60601c438f04b4ad/icon",
    "chainId": 42161
  },
  "0x29fC01f04032c76cA40f353c7dF685f4444c15eD": {
    "address": "0x29fC01f04032c76cA40f353c7dF685f4444c15eD",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x29fc01f04032c76ca40f353c7df685f4444c15ed/icon",
    "chainId": 42161
  },
  "0x0Ae38f7E10A43B5b2fB064B42a2f4514cbA909ef": {
    "address": "0x0Ae38f7E10A43B5b2fB064B42a2f4514cbA909ef",
    "name": "unshETH Ether",
    "symbol": "unshETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0ae38f7e10a43b5b2fb064b42a2f4514cba909ef/icon",
    "chainId": 42161
  },
  "0x515e252b2b5c22b4b2b6Df66c2eBeeA871AA4d69": {
    "address": "0x515e252b2b5c22b4b2b6Df66c2eBeeA871AA4d69",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x515e252b2b5c22b4b2b6df66c2ebeea871aa4d69/icon",
    "chainId": 42161
  },
  "0x569061E2D807881F4A33E1cbE1063bc614cB75a4": {
    "address": "0x569061E2D807881F4A33E1cbE1063bc614cB75a4",
    "name": "80Y2K-20WETH",
    "symbol": "80Y2K-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x569061e2d807881f4a33e1cbe1063bc614cb75a4/icon",
    "chainId": 42161
  },
  "0x65c936f008BC34fE819bce9Fa5afD9dc2d49977f": {
    "address": "0x65c936f008BC34fE819bce9Fa5afD9dc2d49977f",
    "name": "Y2K",
    "symbol": "Y2K",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x65c936f008bc34fe819bce9fa5afd9dc2d49977f/icon",
    "chainId": 42161
  },
  "0x2297aEbD383787A160DD0d9F71508148769342E3": {
    "address": "0x2297aEbD383787A160DD0d9F71508148769342E3",
    "name": "Bitcoin",
    "symbol": "BTC.b",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2297aebd383787a160dd0d9f71508148769342e3/icon",
    "chainId": 42161
  },
  "0x64541216bAFFFEec8ea535BB71Fbc927831d0595": {
    "address": "0x64541216bAFFFEec8ea535BB71Fbc927831d0595",
    "name": "Balancer 33 WETH 33 WBTC 33 USDC",
    "symbol": "B-33WETH-33WBTC-33USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x64541216bafffeec8ea535bb71fbc927831d0595/icon",
    "chainId": 42161
  },
  "0x8ffDf2DE812095b1D19CB146E4c004587C0A0692": {
    "address": "0x8ffDf2DE812095b1D19CB146E4c004587C0A0692",
    "name": "Aave Arbitrum LUSD",
    "symbol": "aArbLUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8ffdf2de812095b1d19cb146e4c004587c0a0692/icon",
    "chainId": 42161
  },
  "0x93D504070AB0eede5449C89C5eA0F5e34D8103f8": {
    "address": "0x93D504070AB0eede5449C89C5eA0F5e34D8103f8",
    "name": "Archi token",
    "symbol": "ARCHI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x93d504070ab0eede5449c89c5ea0f5e34d8103f8/icon",
    "chainId": 42161
  },
  "0xE01E0B5C707EdEE3FFC10b464115cC20073817A2": {
    "address": "0xE01E0B5C707EdEE3FFC10b464115cC20073817A2",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe01e0b5c707edee3ffc10b464115cc20073817a2/icon",
    "chainId": 42161
  },
  "0x264e2900FdB1F2e28b7A35346aCC650b3d235226": {
    "address": "0x264e2900FdB1F2e28b7A35346aCC650b3d235226",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x264e2900fdb1f2e28b7a35346acc650b3d235226/icon",
    "chainId": 42161
  },
  "0xBF6CBb1F40a542aF50839CaD01b0dc1747F11e18": {
    "address": "0xBF6CBb1F40a542aF50839CaD01b0dc1747F11e18",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbf6cbb1f40a542af50839cad01b0dc1747f11e18/icon",
    "chainId": 42161
  },
  "0x1824a51C106EFC27d35A74efB56d9BF54dDb22d4": {
    "address": "0x1824a51C106EFC27d35A74efB56d9BF54dDb22d4",
    "name": "Perpy-Token",
    "symbol": "PRY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1824a51c106efc27d35a74efb56d9bf54ddb22d4/icon",
    "chainId": 42161
  },
  "0x1e5b183b589A1d30aE5F6fDB8436F945989828Ca": {
    "address": "0x1e5b183b589A1d30aE5F6fDB8436F945989828Ca",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1e5b183b589a1d30ae5f6fdb8436f945989828ca/icon",
    "chainId": 42161
  },
  "0x913398d79438e8D709211cFC3DC8566F6C67e1A8": {
    "address": "0x913398d79438e8D709211cFC3DC8566F6C67e1A8",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x913398d79438e8d709211cfc3dc8566f6c67e1a8/icon",
    "chainId": 42161
  },
  "0x8dC6EFD57A13B7ba3ff7824c9708DB24d3190703": {
    "address": "0x8dC6EFD57A13B7ba3ff7824c9708DB24d3190703",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8dc6efd57a13b7ba3ff7824c9708db24d3190703/icon",
    "chainId": 42161
  },
  "0xD67A097dCE9d4474737e6871684aE3c05460F571": {
    "address": "0xD67A097dCE9d4474737e6871684aE3c05460F571",
    "name": "GND",
    "symbol": "GND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd67a097dce9d4474737e6871684ae3c05460f571/icon",
    "chainId": 42161
  },
  "0x2e80259C9071B6176205FF5F5Eb6F7EC8361b93f": {
    "address": "0x2e80259C9071B6176205FF5F5Eb6F7EC8361b93f",
    "name": "HashDAO Token",
    "symbol": "HASH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2e80259c9071b6176205ff5f5eb6f7ec8361b93f/icon",
    "chainId": 42161
  },
  "0x78AB636351c1C5f117C1442B82d14aB3a92F8464": {
    "address": "0x78AB636351c1C5f117C1442B82d14aB3a92F8464",
    "name": "Moo Arbitrum BIFI",
    "symbol": "mooArbitrumBIFI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x78ab636351c1c5f117c1442b82d14ab3a92f8464/icon",
    "chainId": 42161
  },
  "0x18c11FD286C5EC11c3b683Caa813B77f5163A122": {
    "address": "0x18c11FD286C5EC11c3b683Caa813B77f5163A122",
    "name": "Gains Network",
    "symbol": "GNS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x18c11fd286c5ec11c3b683caa813b77f5163a122/icon",
    "chainId": 42161
  },
  "0x5180Dce8F532f40d84363737858E2C5Fd0C8aB39": {
    "address": "0x5180Dce8F532f40d84363737858E2C5Fd0C8aB39",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5180dce8f532f40d84363737858e2c5fd0c8ab39/icon",
    "chainId": 42161
  },
  "0x033f193b3Fceb22a440e89A2867E8FEE181594D9": {
    "address": "0x033f193b3Fceb22a440e89A2867E8FEE181594D9",
    "name": "Rodeo",
    "symbol": "RDO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x033f193b3fceb22a440e89a2867e8fee181594d9/icon",
    "chainId": 42161
  },
  "0xC9da32C3b444F15412F7FeAC6104d1E258D23B1b": {
    "address": "0xC9da32C3b444F15412F7FeAC6104d1E258D23B1b",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc9da32c3b444f15412f7feac6104d1e258d23b1b/icon",
    "chainId": 42161
  },
  "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8": {
    "address": "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8",
    "name": "Camelot token",
    "symbol": "GRAIL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3d9907f9a368ad0a51be60f7da3b97cf940982d8/icon",
    "chainId": 42161
  },
  "0x035D9815AE5aF78D568721FA118bB93428C91f51": {
    "address": "0x035D9815AE5aF78D568721FA118bB93428C91f51",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x035d9815ae5af78d568721fa118bb93428c91f51/icon",
    "chainId": 42161
  },
  "0x4568Ca00299819998501914690d6010ae48a59bA": {
    "address": "0x4568Ca00299819998501914690d6010ae48a59bA",
    "name": "Army of Fortune Coin",
    "symbol": "AFC",
    "decimals": 0,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4568ca00299819998501914690d6010ae48a59ba/icon",
    "chainId": 42161
  },
  "0xF236ea74B515eF96a9898F5a4ed4Aa591f253Ce1": {
    "address": "0xF236ea74B515eF96a9898F5a4ed4Aa591f253Ce1",
    "name": "Plutus DPX",
    "symbol": "plsDPX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf236ea74b515ef96a9898f5a4ed4aa591f253ce1/icon",
    "chainId": 42161
  },
  "0x789367CdBE75D8799E0b36c83925278c16D3b921": {
    "address": "0x789367CdBE75D8799E0b36c83925278c16D3b921",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x789367cdbe75d8799e0b36c83925278c16d3b921/icon",
    "chainId": 42161
  },
  "0x2bcd0aac7D98697D8760fB291625829113E354e7": {
    "address": "0x2bcd0aac7D98697D8760fB291625829113E354e7",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2bcd0aac7d98697d8760fb291625829113e354e7/icon",
    "chainId": 42161
  },
  "0x32e4d98d3010AC12d75019C484cAA78665B03986": {
    "address": "0x32e4d98d3010AC12d75019C484cAA78665B03986",
    "name": "GBOT",
    "symbol": "GBOT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32e4d98d3010ac12d75019c484caa78665b03986/icon",
    "chainId": 42161
  },
  "0xe66998533a1992ecE9eA99cDf47686F4fc8458E0": {
    "address": "0xe66998533a1992ecE9eA99cDf47686F4fc8458E0",
    "name": "Jones USDC",
    "symbol": "jUSDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe66998533a1992ece9ea99cdf47686f4fc8458e0/icon",
    "chainId": 42161
  },
  "0xd37025aC6227334C7762AeD5929Ce3272fbb6fdC": {
    "address": "0xd37025aC6227334C7762AeD5929Ce3272fbb6fdC",
    "name": "Moo Aura Arb DOLA-USDC",
    "symbol": "mooAuraArbDOLA-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd37025ac6227334c7762aed5929ce3272fbb6fdc/icon",
    "chainId": 42161
  },
  "0x5201f6482EEA49c90FE609eD9d8F69328bAc8ddA": {
    "address": "0x5201f6482EEA49c90FE609eD9d8F69328bAc8ddA",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5201f6482eea49c90fe609ed9d8f69328bac8dda/icon",
    "chainId": 42161
  },
  "0x8bc65Eed474D1A00555825c91FeAb6A8255C2107": {
    "address": "0x8bc65Eed474D1A00555825c91FeAb6A8255C2107",
    "name": "Balancer DOLA/USDC StablePool",
    "symbol": "DOLA/USDC BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8bc65eed474d1a00555825c91feab6a8255c2107/icon",
    "chainId": 42161
  },
  "0x1850e96550d6716d43bA4d7DF815FfC32bD0d03e": {
    "address": "0x1850e96550d6716d43bA4d7DF815FfC32bD0d03e",
    "name": "Correlated rAMM - FRAX/DOLA",
    "symbol": "crAMM-FRAX/DOLA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1850e96550d6716d43ba4d7df815ffc32bd0d03e/icon",
    "chainId": 42161
  },
  "0x6A7661795C374c0bFC635934efAddFf3A7Ee23b6": {
    "address": "0x6A7661795C374c0bFC635934efAddFf3A7Ee23b6",
    "name": "Dola USD Stablecoin",
    "symbol": "DOLA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6a7661795c374c0bfc635934efaddff3a7ee23b6/icon",
    "chainId": 42161
  },
  "0xB6a0ad0f714352830467725e619ea23E2C488f37": {
    "address": "0xB6a0ad0f714352830467725e619ea23E2C488f37",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb6a0ad0f714352830467725e619ea23e2c488f37/icon",
    "chainId": 42161
  },
  "0x73700aeCfC4621E112304B6eDC5BA9e36D7743D3": {
    "address": "0x73700aeCfC4621E112304B6eDC5BA9e36D7743D3",
    "name": "liquid ETH",
    "symbol": "lqETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x73700aecfc4621e112304b6edc5ba9e36d7743d3/icon",
    "chainId": 42161
  },
  "0x69B545997BD6aBC81CaE39Fe9bdC94d2242a0f92": {
    "address": "0x69B545997BD6aBC81CaE39Fe9bdC94d2242a0f92",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x69b545997bd6abc81cae39fe9bdc94d2242a0f92/icon",
    "chainId": 42161
  },
  "0xa0d758b81f8ed6635CDE1DA91C8fe1bD48C28A09": {
    "address": "0xa0d758b81f8ed6635CDE1DA91C8fe1bD48C28A09",
    "name": "Moo Balancer Arb 4POOL",
    "symbol": "mooBalancerArb4POOL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa0d758b81f8ed6635cde1da91c8fe1bd48c28a09/icon",
    "chainId": 42161
  },
  "0x256BA319c286720DC74b53868821BA7eaF628900": {
    "address": "0x256BA319c286720DC74b53868821BA7eaF628900",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x256ba319c286720dc74b53868821ba7eaf628900/icon",
    "chainId": 42161
  },
  "0x49bB23DfAe944059C2403BCc255c5a9c0F851a8D": {
    "address": "0x49bB23DfAe944059C2403BCc255c5a9c0F851a8D",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x49bb23dfae944059c2403bcc255c5a9c0f851a8d/icon",
    "chainId": 42161
  },
  "0x423A1323c871aBC9d89EB06855bF5347048Fc4A5": {
    "address": "0x423A1323c871aBC9d89EB06855bF5347048Fc4A5",
    "name": "Balancer Stable 4pool",
    "symbol": "4POOL-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x423a1323c871abc9d89eb06855bf5347048fc4a5/icon",
    "chainId": 42161
  },
  "0x0B63C61bba4a876a6eB8b5e596800F7649A9B71E": {
    "address": "0x0B63C61bba4a876a6eB8b5e596800F7649A9B71E",
    "name": "Sector",
    "symbol": "SECT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0b63c61bba4a876a6eb8b5e596800f7649a9b71e/icon",
    "chainId": 42161
  },
  "0xBfbCFe8873fE28Dfa25f1099282b088D52bbAD9C": {
    "address": "0xBfbCFe8873fE28Dfa25f1099282b088D52bbAD9C",
    "name": "Equilibria Token",
    "symbol": "EQB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbfbcfe8873fe28dfa25f1099282b088d52bbad9c/icon",
    "chainId": 42161
  },
  "0xF19547f9ED24aA66b03c3a552D181Ae334FBb8DB": {
    "address": "0xF19547f9ED24aA66b03c3a552D181Ae334FBb8DB",
    "name": "Lodestar",
    "symbol": "LODE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf19547f9ed24aa66b03c3a552d181ae334fbb8db/icon",
    "chainId": 42161
  },
  "0x87425D8812f44726091831a9A109f4bDc3eA34b4": {
    "address": "0x87425D8812f44726091831a9A109f4bDc3eA34b4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x87425d8812f44726091831a9a109f4bdc3ea34b4/icon",
    "chainId": 42161
  },
  "0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30": {
    "address": "0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30",
    "name": "Thales DAO Token",
    "symbol": "THALES",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe85b662fe97e8562f4099d8a1d5a92d4b453bf30/icon",
    "chainId": 42161
  },
  "0xD5270AEDEb6f9197cD8d881Db74DBd0D994C325c": {
    "address": "0xD5270AEDEb6f9197cD8d881Db74DBd0D994C325c",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd5270aedeb6f9197cd8d881db74dbd0d994c325c/icon",
    "chainId": 42161
  },
  "0x6bB7A17AcC227fd1F6781D1EEDEAE01B42047eE0": {
    "address": "0x6bB7A17AcC227fd1F6781D1EEDEAE01B42047eE0",
    "name": "LEX",
    "symbol": "LEX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6bb7a17acc227fd1f6781d1eedeae01b42047ee0/icon",
    "chainId": 42161
  },
  "0x6A78E84FA0edAD4D99eB90edc041CdbF85925961": {
    "address": "0x6A78E84FA0edAD4D99eB90edc041CdbF85925961",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6a78e84fa0edad4d99eb90edc041cdbf85925961/icon",
    "chainId": 42161
  },
  "0x5705A261342d01583D2a40F74eAB8bC4852336ED": {
    "address": "0x5705A261342d01583D2a40F74eAB8bC4852336ED",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5705a261342d01583d2a40f74eab8bc4852336ed/icon",
    "chainId": 42161
  },
  "0x79DC8ABE4f1157eDfAcf9875eCd3E17aE7056268": {
    "address": "0x79DC8ABE4f1157eDfAcf9875eCd3E17aE7056268",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x79dc8abe4f1157edfacf9875ecd3e17ae7056268/icon",
    "chainId": 42161
  },
  "0x30dcBa0405004cF124045793E1933C798Af9E66a": {
    "address": "0x30dcBa0405004cF124045793E1933C798Af9E66a",
    "name": "Yieldification",
    "symbol": "YDF",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x30dcba0405004cf124045793e1933c798af9e66a/icon",
    "chainId": 42161
  },
  "0x6Fc2680D8ad8e8312191441B4ECa9EfF8D06b45a": {
    "address": "0x6Fc2680D8ad8e8312191441B4ECa9EfF8D06b45a",
    "name": "Choke",
    "symbol": "CHOKE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6fc2680d8ad8e8312191441b4eca9eff8d06b45a/icon",
    "chainId": 42161
  },
  "0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b": {
    "address": "0x09E18590E8f76b6Cf471b3cd75fE1A1a9D2B2c2b",
    "name": "AIDOGE",
    "symbol": "AIDOGE",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b/icon",
    "chainId": 42161
  },
  "0x994Ff2ab544D00aD4EC0380a1Be8F75f4EC47Cf9": {
    "address": "0x994Ff2ab544D00aD4EC0380a1Be8F75f4EC47Cf9",
    "name": "Moo Sushi ARB-ETH V2",
    "symbol": "mooSushiARB-ETHV2",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x994ff2ab544d00ad4ec0380a1be8f75f4ec47cf9/icon",
    "chainId": 42161
  },
  "0x410c879c62f22794bD5eE98e2EE01490F6d47A6b": {
    "address": "0x410c879c62f22794bD5eE98e2EE01490F6d47A6b",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x410c879c62f22794bd5ee98e2ee01490f6d47a6b/icon",
    "chainId": 42161
  },
  "0x1B8d516E2146D7a32Aca0FcBf9482db85fD42c3a": {
    "address": "0x1B8d516E2146D7a32Aca0FcBf9482db85fD42c3a",
    "name": "AlphaScan",
    "symbol": "ASCN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1b8d516e2146d7a32aca0fcbf9482db85fd42c3a/icon",
    "chainId": 42161
  },
  "0x3DB4B7DA67dd5aF61Cb9b3C70501B1BdB24b2C22": {
    "address": "0x3DB4B7DA67dd5aF61Cb9b3C70501B1BdB24b2C22",
    "name": "gmdUSDC",
    "symbol": "gmdUSDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3db4b7da67dd5af61cb9b3c70501b1bdb24b2c22/icon",
    "chainId": 42161
  },
  "0xEC13336bbd50790a00CDc0fEddF11287eaF92529": {
    "address": "0xEC13336bbd50790a00CDc0fEddF11287eaF92529",
    "name": "gmUSD",
    "symbol": "gmUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xec13336bbd50790a00cdc0feddf11287eaf92529/icon",
    "chainId": 42161
  },
  "0x8B0E6f19Ee57089F7649A455D89D7bC6314D04e8": {
    "address": "0x8B0E6f19Ee57089F7649A455D89D7bC6314D04e8",
    "name": "DMT",
    "symbol": "DMT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8b0e6f19ee57089f7649a455d89d7bc6314d04e8/icon",
    "chainId": 42161
  },
  "0xd85E038593d7A098614721EaE955EC2022B9B91B": {
    "address": "0xd85E038593d7A098614721EaE955EC2022B9B91B",
    "name": "Gains Network DAI",
    "symbol": "gDAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd85e038593d7a098614721eae955ec2022b9b91b/icon",
    "chainId": 42161
  },
  "0x4c0A68dd92449Fc06c1A651E9eb1dFfB61D64e18": {
    "address": "0x4c0A68dd92449Fc06c1A651E9eb1dFfB61D64e18",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4c0a68dd92449fc06c1a651e9eb1dffb61d64e18/icon",
    "chainId": 42161
  },
  "0xC61ff48f94D801c1ceFaCE0289085197B5ec44F0": {
    "address": "0xC61ff48f94D801c1ceFaCE0289085197B5ec44F0",
    "name": "VSTA-WETH",
    "symbol": "50VSTA-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc61ff48f94d801c1ceface0289085197b5ec44f0/icon",
    "chainId": 42161
  },
  "0xa684cd057951541187f288294a1e1C2646aA2d24": {
    "address": "0xa684cd057951541187f288294a1e1C2646aA2d24",
    "name": "Vesta",
    "symbol": "VSTA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa684cd057951541187f288294a1e1c2646aa2d24/icon",
    "chainId": 42161
  },
  "0x561877b6b3DD7651313794e5F2894B2F18bE0766": {
    "address": "0x561877b6b3DD7651313794e5F2894B2F18bE0766",
    "name": "Matic Token",
    "symbol": "MATIC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x561877b6b3dd7651313794e5f2894b2f18be0766/icon",
    "chainId": 42161
  },
  "0xf6a1284Dc2ce247Bca885ac4F36b37E91d3bD032": {
    "address": "0xf6a1284Dc2ce247Bca885ac4F36b37E91d3bD032",
    "name": "Moo Hop ETH",
    "symbol": "mooHopETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf6a1284dc2ce247bca885ac4f36b37e91d3bd032/icon",
    "chainId": 42161
  },
  "0xC95110FF2D1c721600f52Bdeb4EAA8b3d2298C6F": {
    "address": "0xC95110FF2D1c721600f52Bdeb4EAA8b3d2298C6F",
    "name": "Ring.Exchange",
    "symbol": "RNG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc95110ff2d1c721600f52bdeb4eaa8b3d2298c6f/icon",
    "chainId": 42161
  },
  "0x3eFd3E18504dC213188Ed2b694F886A305a6e5ed": {
    "address": "0x3eFd3E18504dC213188Ed2b694F886A305a6e5ed",
    "name": "Balancer 80peg-20WETH",
    "symbol": "PEG_80-WETH_20",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3efd3e18504dc213188ed2b694f886a305a6e5ed/icon",
    "chainId": 42161
  },
  "0x59745774Ed5EfF903e615F5A2282Cae03484985a": {
    "address": "0x59745774Ed5EfF903e615F5A2282Cae03484985a",
    "name": "Hop ETH LP Token",
    "symbol": "HOP-LP-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x59745774ed5eff903e615f5a2282cae03484985a/icon",
    "chainId": 42161
  },
  "0x4fc2A3Fb655847b7B72E19EAA2F10fDB5C2aDdbe": {
    "address": "0x4fc2A3Fb655847b7B72E19EAA2F10fDB5C2aDdbe",
    "name": "Pepe Governance Token",
    "symbol": "PEG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4fc2a3fb655847b7b72e19eaa2f10fdb5c2addbe/icon",
    "chainId": 42161
  },
  "0x25fAa972bC761044e8CB0E88A8110a6984DCD6E1": {
    "address": "0x25fAa972bC761044e8CB0E88A8110a6984DCD6E1",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x25faa972bc761044e8cb0e88a8110a6984dcd6e1/icon",
    "chainId": 42161
  },
  "0xeE9857dE0e55d4A54D36a5A5a73A15e57435FdCA": {
    "address": "0xeE9857dE0e55d4A54D36a5A5a73A15e57435FdCA",
    "name": "AsgardX",
    "symbol": "ODIN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xee9857de0e55d4a54d36a5a5a73a15e57435fdca/icon",
    "chainId": 42161
  },
  "0xD295d690b9BF17bd217B94BC50C12729762C1862": {
    "address": "0xD295d690b9BF17bd217B94BC50C12729762C1862",
    "name": "Moo Sushi gOHM-ETH",
    "symbol": "mooSushigOHM-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd295d690b9bf17bd217b94bc50c12729762c1862/icon",
    "chainId": 42161
  },
  "0x12c997FAdca32dB01E3145DE7Bf9cdB06455391D": {
    "address": "0x12c997FAdca32dB01E3145DE7Bf9cdB06455391D",
    "name": "Moo Aura Arb cbETH/wstETH/rETH",
    "symbol": "mooAuraArbcbETH/wstETH/rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x12c997fadca32db01e3145de7bf9cdb06455391d/icon",
    "chainId": 42161
  },
  "0x289ba1701C2F088cf0faf8B3705246331cB8A839": {
    "address": "0x289ba1701C2F088cf0faf8B3705246331cB8A839",
    "name": "Livepeer Token",
    "symbol": "LPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x289ba1701c2f088cf0faf8b3705246331cb8a839/icon",
    "chainId": 42161
  },
  "0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B": {
    "address": "0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B",
    "name": "Balancer wstETH/rETH/cbETH CSP",
    "symbol": "wstETH/rETH/cbETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4a2f6ae7f3e5d715689530873ec35593dc28951b/icon",
    "chainId": 42161
  },
  "0xE56C8cFaAA68469990C40844a89205C4fD7e25A4": {
    "address": "0xE56C8cFaAA68469990C40844a89205C4fD7e25A4",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe56c8cfaaa68469990c40844a89205c4fd7e25a4/icon",
    "chainId": 42161
  },
  "0xCB24B141ECaaAd0d2c255d6F99d6f4790546a75c": {
    "address": "0xCB24B141ECaaAd0d2c255d6F99d6f4790546a75c",
    "name": "Exponential Capital",
    "symbol": "EXPO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcb24b141ecaaad0d2c255d6f99d6f4790546a75c/icon",
    "chainId": 42161
  },
  "0x1ae52977716E5BFD09a2B1C9AC2406Af913C094b": {
    "address": "0x1ae52977716E5BFD09a2B1C9AC2406Af913C094b",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1ae52977716e5bfd09a2b1c9ac2406af913c094b/icon",
    "chainId": 42161
  },
  "0xAf5db6E1CC585ca312E8c8F7c499033590cf5C98": {
    "address": "0xAf5db6E1CC585ca312E8c8F7c499033590cf5C98",
    "name": "Arken Token",
    "symbol": "ARKEN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaf5db6e1cc585ca312e8c8f7c499033590cf5c98/icon",
    "chainId": 42161
  },
  "0x8eBb85D53e6955e557b7c53acDE1D42fD68561Ec": {
    "address": "0x8eBb85D53e6955e557b7c53acDE1D42fD68561Ec",
    "name": "LionDEX Token",
    "symbol": "LION",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8ebb85d53e6955e557b7c53acde1d42fd68561ec/icon",
    "chainId": 42161
  },
  "0x9E92B9Ef3c3Cc4053591002F4f04d2Aef87bf2d2": {
    "address": "0x9E92B9Ef3c3Cc4053591002F4f04d2Aef87bf2d2",
    "name": "DarkMeta",
    "symbol": "DMT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9e92b9ef3c3cc4053591002f4f04d2aef87bf2d2/icon",
    "chainId": 42161
  },
  "0xAC511777F53cDE22A7FBa26A3E7dEbD12B6D409c": {
    "address": "0xAC511777F53cDE22A7FBa26A3E7dEbD12B6D409c",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xac511777f53cde22a7fba26a3e7debd12b6d409c/icon",
    "chainId": 42161
  },
  "0x3B30dC1A36bF8D2ef112Ea9efe2c9Dc7BeBABf55": {
    "address": "0x3B30dC1A36bF8D2ef112Ea9efe2c9Dc7BeBABf55",
    "name": "RIZZ",
    "symbol": "RIZZ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3b30dc1a36bf8d2ef112ea9efe2c9dc7bebabf55/icon",
    "chainId": 42161
  },
  "0xabD587f2607542723b17f14d00d99b987C29b074": {
    "address": "0xabD587f2607542723b17f14d00d99b987C29b074",
    "name": "SmarDex Token",
    "symbol": "SDEX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xabd587f2607542723b17f14d00d99b987c29b074/icon",
    "chainId": 42161
  },
  "0x7DD747D63b094971e6638313A6a2685E80c7Fb2e": {
    "address": "0x7DD747D63b094971e6638313A6a2685E80c7Fb2e",
    "name": "STFX",
    "symbol": "STFX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7dd747d63b094971e6638313a6a2685e80c7fb2e/icon",
    "chainId": 42161
  },
  "0x3A33473d7990a605a88ac72A78aD4EFC40a54ADB": {
    "address": "0x3A33473d7990a605a88ac72A78aD4EFC40a54ADB",
    "name": "Tigris",
    "symbol": "TIG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3a33473d7990a605a88ac72a78ad4efc40a54adb/icon",
    "chainId": 42161
  },
  "0x1F52145666C862eD3E2f1Da213d479E61b2892af": {
    "address": "0x1F52145666C862eD3E2f1Da213d479E61b2892af",
    "name": "Funny Coin",
    "symbol": "FUC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1f52145666c862ed3e2f1da213d479e61b2892af/icon",
    "chainId": 42161
  },
  "0x373217e8DAEE6744D4470E2b8955F4f86E70eCf3": {
    "address": "0x373217e8DAEE6744D4470E2b8955F4f86E70eCf3",
    "name": "gETH",
    "symbol": "gETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x373217e8daee6744d4470e2b8955f4f86e70ecf3/icon",
    "chainId": 42161
  },
  "0x0D20EF7033b73Ea0c9c320304B05da82E2C14E33": {
    "address": "0x0D20EF7033b73Ea0c9c320304B05da82E2C14E33",
    "name": "StableV1 AMM - FRAX/USD+",
    "symbol": "sAMM-FRAX/USD+",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0d20ef7033b73ea0c9c320304b05da82e2c14e33/icon",
    "chainId": 42161
  },
  "0x218fdEE44e8e923b500895e324Af6c0a2e07195d": {
    "address": "0x218fdEE44e8e923b500895e324Af6c0a2e07195d",
    "name": "Volatile rAMM - YFX/USDC",
    "symbol": "vrAMM-YFX/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x218fdee44e8e923b500895e324af6c0a2e07195d/icon",
    "chainId": 42161
  },
  "0x46034C63ad03254D6E96c655e82393E6C31E07C3": {
    "address": "0x46034C63ad03254D6E96c655e82393E6C31E07C3",
    "name": "Moo Hop USDT",
    "symbol": "mooHopUSDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x46034c63ad03254d6e96c655e82393e6c31e07c3/icon",
    "chainId": 42161
  },
  "0xaaE0c3856e665ff9b3E2872B6D75939D810b7E40": {
    "address": "0xaaE0c3856e665ff9b3E2872B6D75939D810b7E40",
    "name": "YieldFarming Index",
    "symbol": "YFX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaae0c3856e665ff9b3e2872b6d75939d810b7e40/icon",
    "chainId": 42161
  },
  "0xF26C10811D602e39580C9448944ddAe7b183fD95": {
    "address": "0xF26C10811D602e39580C9448944ddAe7b183fD95",
    "name": "Moo Curve TriCrypto",
    "symbol": "mooCurveTriCrypto",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf26c10811d602e39580c9448944ddae7b183fd95/icon",
    "chainId": 42161
  },
  "0x495DABd6506563Ce892B8285704bD28F9DdCAE65": {
    "address": "0x495DABd6506563Ce892B8285704bD28F9DdCAE65",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x495dabd6506563ce892b8285704bd28f9ddcae65/icon",
    "chainId": 42161
  },
  "0x01efEd58B534d7a7464359A6F8d14D986125816B": {
    "address": "0x01efEd58B534d7a7464359A6F8d14D986125816B",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x01efed58b534d7a7464359a6f8d14d986125816b/icon",
    "chainId": 42161
  },
  "0xf1264873436A0771E440E2b28072FAfcC5EEBd01": {
    "address": "0xf1264873436A0771E440E2b28072FAfcC5EEBd01",
    "name": "Kenshi",
    "symbol": "KNS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf1264873436a0771e440e2b28072fafcc5eebd01/icon",
    "chainId": 42161
  },
  "0xC73d2191A1dD0a99B377272899A5569eD83f8cd8": {
    "address": "0xC73d2191A1dD0a99B377272899A5569eD83f8cd8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc73d2191a1dd0a99b377272899a5569ed83f8cd8/icon",
    "chainId": 42161
  },
  "0x07E49d5dE43DDA6162Fa28D24d5935C151875283": {
    "address": "0x07E49d5dE43DDA6162Fa28D24d5935C151875283",
    "name": "GOVI",
    "symbol": "GOVI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x07e49d5de43dda6162fa28d24d5935c151875283/icon",
    "chainId": 42161
  },
  "0xe8A3Bf796cA5a13283ec6B1c5b645B91D7CfEf5D": {
    "address": "0xe8A3Bf796cA5a13283ec6B1c5b645B91D7CfEf5D",
    "name": "Zombie Virus Token",
    "symbol": "aZVT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe8a3bf796ca5a13283ec6b1c5b645b91d7cfef5d/icon",
    "chainId": 42161
  },
  "0x8f93Eaae544e8f5EB077A1e09C1554067d9e2CA8": {
    "address": "0x8f93Eaae544e8f5EB077A1e09C1554067d9e2CA8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8f93eaae544e8f5eb077a1e09c1554067d9e2ca8/icon",
    "chainId": 42161
  },
  "0x8971dFb268B961a9270632f28B24F2f637c94244": {
    "address": "0x8971dFb268B961a9270632f28B24F2f637c94244",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8971dfb268b961a9270632f28b24f2f637c94244/icon",
    "chainId": 42161
  },
  "0x4237FD25a3BC078F5Ec86Ce169F8082cF65b4Af4": {
    "address": "0x4237FD25a3BC078F5Ec86Ce169F8082cF65b4Af4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4237fd25a3bc078f5ec86ce169f8082cf65b4af4/icon",
    "chainId": 42161
  },
  "0x713aDaF6cE3e885F987569E0A145dbeE106121a7": {
    "address": "0x713aDaF6cE3e885F987569E0A145dbeE106121a7",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x713adaf6ce3e885f987569e0a145dbee106121a7/icon",
    "chainId": 42161
  },
  "0x20547341E58fB558637FA15379C92e11F7b7F710": {
    "address": "0x20547341E58fB558637FA15379C92e11F7b7F710",
    "name": "Mozaic Token",
    "symbol": "MOZ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x20547341e58fb558637fa15379c92e11f7b7f710/icon",
    "chainId": 42161
  },
  "0x352F4bF396a7353A0877f99e99757E5d294Df374": {
    "address": "0x352F4bF396a7353A0877f99e99757E5d294Df374",
    "name": "Sundae Token",
    "symbol": "SUNDAE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x352f4bf396a7353a0877f99e99757e5d294df374/icon",
    "chainId": 42161
  },
  "0x431402e8b9dE9aa016C743880e04E517074D8cEC": {
    "address": "0x431402e8b9dE9aa016C743880e04E517074D8cEC",
    "name": "Hegic",
    "symbol": "HEGIC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x431402e8b9de9aa016c743880e04e517074d8cec/icon",
    "chainId": 42161
  },
  "0x7F465507f058e17Ad21623927a120ac05CA32741": {
    "address": "0x7F465507f058e17Ad21623927a120ac05CA32741",
    "name": "Arcadeum",
    "symbol": "ARC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7f465507f058e17ad21623927a120ac05ca32741/icon",
    "chainId": 42161
  },
  "0x810Cf1757B51963102e0B4fe9FdfCDF749deA98a": {
    "address": "0x810Cf1757B51963102e0B4fe9FdfCDF749deA98a",
    "name": "Sanctum Coin",
    "symbol": "SANCTA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x810cf1757b51963102e0b4fe9fdfcdf749dea98a/icon",
    "chainId": 42161
  },
  "0xeD29730F9FF29ea50D63462D8EC84307d36b8954": {
    "address": "0xeD29730F9FF29ea50D63462D8EC84307d36b8954",
    "name": "Moo Joe Auto ETH-USDC.e",
    "symbol": "mooJoeAutoETH-USDC.e",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xed29730f9ff29ea50d63462d8ec84307d36b8954/icon",
    "chainId": 42161
  },
  "0x60F7116d7c451ac5a5159F60Fc5fC36336b742c4": {
    "address": "0x60F7116d7c451ac5a5159F60Fc5fC36336b742c4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x60f7116d7c451ac5a5159f60fc5fc36336b742c4/icon",
    "chainId": 42161
  },
  "0x7698Ac5D15bb3Ba7185adCBff32A80ebD9d0709B": {
    "address": "0x7698Ac5D15bb3Ba7185adCBff32A80ebD9d0709B",
    "name": "GenomesDAO Governance",
    "symbol": "GNOME",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7698ac5d15bb3ba7185adcbff32a80ebd9d0709b/icon",
    "chainId": 42161
  },
  "0x031d35296154279DC1984dCD93E392b1f946737b": {
    "address": "0x031d35296154279DC1984dCD93E392b1f946737b",
    "name": "Cap",
    "symbol": "CAP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x031d35296154279dc1984dcd93e392b1f946737b/icon",
    "chainId": 42161
  },
  "0x5dCF474814515B58ca0CA5e80bbB00d18C5B5cF8": {
    "address": "0x5dCF474814515B58ca0CA5e80bbB00d18C5B5cF8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5dcf474814515b58ca0ca5e80bbb00d18c5b5cf8/icon",
    "chainId": 42161
  },
  "0x1A5B0aaF478bf1FDA7b934c76E7692D722982a6D": {
    "address": "0x1A5B0aaF478bf1FDA7b934c76E7692D722982a6D",
    "name": "Buffer Token",
    "symbol": "BFR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1a5b0aaf478bf1fda7b934c76e7692d722982a6d/icon",
    "chainId": 42161
  },
  "0x2CaB3abfC1670D1a452dF502e216a66883cDf079": {
    "address": "0x2CaB3abfC1670D1a452dF502e216a66883cDf079",
    "name": "Layer2DAO",
    "symbol": "L2DAO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2cab3abfc1670d1a452df502e216a66883cdf079/icon",
    "chainId": 42161
  },
  "0x68A0859de50B4Dfc6EFEbE981cA906D38Cdb0D1F": {
    "address": "0x68A0859de50B4Dfc6EFEbE981cA906D38Cdb0D1F",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x68a0859de50b4dfc6efebe981ca906d38cdb0d1f/icon",
    "chainId": 42161
  },
  "0x10052e51797CC9a018d50D112547347E7951c198": {
    "address": "0x10052e51797CC9a018d50D112547347E7951c198",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x10052e51797cc9a018d50d112547347e7951c198/icon",
    "chainId": 42161
  },
  "0x9e724698051DA34994F281bD81C3E7372d1960AE": {
    "address": "0x9e724698051DA34994F281bD81C3E7372d1960AE",
    "name": "Ascension Protocol",
    "symbol": "ASCEND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9e724698051da34994f281bd81c3e7372d1960ae/icon",
    "chainId": 42161
  },
  "0xD496eA90a454eA49e30A8fD9E053C186D4FC897D": {
    "address": "0xD496eA90a454eA49e30A8fD9E053C186D4FC897D",
    "name": "Moo Stargate USDC",
    "symbol": "mooStargateUSDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd496ea90a454ea49e30a8fd9e053c186d4fc897d/icon",
    "chainId": 42161
  },
  "0x835785C823e3c19c37cb6e2C616C278738947978": {
    "address": "0x835785C823e3c19c37cb6e2C616C278738947978",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x835785c823e3c19c37cb6e2c616c278738947978/icon",
    "chainId": 42161
  },
  "0x5575552988A3A80504bBaeB1311674fCFd40aD4B": {
    "address": "0x5575552988A3A80504bBaeB1311674fCFd40aD4B",
    "name": "Sperax",
    "symbol": "SPA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5575552988a3a80504bbaeb1311674fcfd40ad4b/icon",
    "chainId": 42161
  },
  "0x3404149e9EE6f17Fb41DB1Ce593ee48FBDcD9506": {
    "address": "0x3404149e9EE6f17Fb41DB1Ce593ee48FBDcD9506",
    "name": "Hydranet",
    "symbol": "HDN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3404149e9ee6f17fb41db1ce593ee48fbdcd9506/icon",
    "chainId": 42161
  },
  "0xdA661fa59320B808c5a6d23579fCfEdf1FD3cf36": {
    "address": "0xdA661fa59320B808c5a6d23579fCfEdf1FD3cf36",
    "name": "Mobox",
    "symbol": "MBOX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xda661fa59320b808c5a6d23579fcfedf1fd3cf36/icon",
    "chainId": 42161
  },
  "0xECA14F81085e5B8d1c9D32Dcb596681574723561": {
    "address": "0xECA14F81085e5B8d1c9D32Dcb596681574723561",
    "name": "Spool DAO Token",
    "symbol": "SPOOL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeca14f81085e5b8d1c9d32dcb596681574723561/icon",
    "chainId": 42161
  },
  "0x640278BadA847b7CE71bb22F20517A009a049640": {
    "address": "0x640278BadA847b7CE71bb22F20517A009a049640",
    "name": "NGT",
    "symbol": "NGT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x640278bada847b7ce71bb22f20517a009a049640/icon",
    "chainId": 42161
  },
  "0xbc103bba961501b1b8F85623BB027878C174622f": {
    "address": "0xbc103bba961501b1b8F85623BB027878C174622f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbc103bba961501b1b8f85623bb027878c174622f/icon",
    "chainId": 42161
  },
  "0x5b772b00Cb6B95c4501E4be75ce7ddD6CB625320": {
    "address": "0x5b772b00Cb6B95c4501E4be75ce7ddD6CB625320",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5b772b00cb6b95c4501e4be75ce7ddd6cb625320/icon",
    "chainId": 42161
  },
  "0x1533A3278f3F9141d5F820A184EA4B017fce2382": {
    "address": "0x1533A3278f3F9141d5F820A184EA4B017fce2382",
    "name": "Balancer USDT-USDC-DAI StablePool",
    "symbol": "B-staBAL-3",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1533a3278f3f9141d5f820a184ea4b017fce2382/icon",
    "chainId": 42161
  },
  "0xA6219B4Bf4B861A2b1C02da43b2aF266186eDC04": {
    "address": "0xA6219B4Bf4B861A2b1C02da43b2aF266186eDC04",
    "name": "ArVault",
    "symbol": "ARVAULT",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa6219b4bf4b861a2b1c02da43b2af266186edc04/icon",
    "chainId": 42161
  },
  "0xd26B0c6Ef8581E921AE41C66e508C62a581B709D": {
    "address": "0xd26B0c6Ef8581E921AE41C66e508C62a581B709D",
    "name": "SEX",
    "symbol": "SEX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd26b0c6ef8581e921ae41c66e508c62a581b709d/icon",
    "chainId": 42161
  },
  "0xD449Efa0A587f2cb6BE3AE577Bc167a774525810": {
    "address": "0xD449Efa0A587f2cb6BE3AE577Bc167a774525810",
    "name": "Oats And Grains",
    "symbol": "BPT-OG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd449efa0a587f2cb6be3ae577bc167a774525810/icon",
    "chainId": 42161
  },
  "0x80bB30D62a16e1F2084dEAE84dc293531c3AC3A1": {
    "address": "0x80bB30D62a16e1F2084dEAE84dc293531c3AC3A1",
    "name": "Granary Token",
    "symbol": "GRAIN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x80bb30d62a16e1f2084deae84dc293531c3ac3a1/icon",
    "chainId": 42161
  },
  "0xa1150db5105987CEC5Fd092273d1e3cbb22b378b": {
    "address": "0xa1150db5105987CEC5Fd092273d1e3cbb22b378b",
    "name": "Oath Token",
    "symbol": "OATH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa1150db5105987cec5fd092273d1e3cbb22b378b/icon",
    "chainId": 42161
  },
  "0x5892bA611fdC1598b72a30D087d28c989d429eF7": {
    "address": "0x5892bA611fdC1598b72a30D087d28c989d429eF7",
    "name": "Moo Aura Arb wstETH-ankrETH",
    "symbol": "mooAuraArbwstETH-ankrETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5892ba611fdc1598b72a30d087d28c989d429ef7/icon",
    "chainId": 42161
  },
  "0x5e904bc0079af01A16782E47100aE1196d9B3706": {
    "address": "0x5e904bc0079af01A16782E47100aE1196d9B3706",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5e904bc0079af01a16782e47100ae1196d9b3706/icon",
    "chainId": 42161
  },
  "0xC70364Ef7ae70f4F17C12927B7945D293d6184Cf": {
    "address": "0xC70364Ef7ae70f4F17C12927B7945D293d6184Cf",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc70364ef7ae70f4f17c12927b7945d293d6184cf/icon",
    "chainId": 42161
  },
  "0x0D111e482146fE9aC9cA3A65D92E65610BBC1Ba6": {
    "address": "0x0D111e482146fE9aC9cA3A65D92E65610BBC1Ba6",
    "name": "Plutus SPA",
    "symbol": "plsSPA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0d111e482146fe9ac9ca3a65d92e65610bbc1ba6/icon",
    "chainId": 42161
  },
  "0x680447595e8b7b3Aa1B43beB9f6098C79ac2Ab3f": {
    "address": "0x680447595e8b7b3Aa1B43beB9f6098C79ac2Ab3f",
    "name": "Decentralized USD",
    "symbol": "USDD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x680447595e8b7b3aa1b43beb9f6098c79ac2ab3f/icon",
    "chainId": 42161
  },
  "0x3FD4954a851eaD144c2FF72B1f5a38Ea5976Bd54": {
    "address": "0x3FD4954a851eaD144c2FF72B1f5a38Ea5976Bd54",
    "name": "Balancer ankrETH/wstETH StablePool",
    "symbol": "ankrETH/wstETH-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3fd4954a851ead144c2ff72b1f5a38ea5976bd54/icon",
    "chainId": 42161
  },
  "0x94d23F048D858D8CF19bB85e45b499643DE921AC": {
    "address": "0x94d23F048D858D8CF19bB85e45b499643DE921AC",
    "name": "Celestia",
    "symbol": "TIA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x94d23f048d858d8cf19bb85e45b499643de921ac/icon",
    "chainId": 42161
  },
  "0x169fC604e597fD911725a6F50E453c6B87bff64A": {
    "address": "0x169fC604e597fD911725a6F50E453c6B87bff64A",
    "name": "FriendTech",
    "symbol": "FTC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x169fc604e597fd911725a6f50e453c6b87bff64a/icon",
    "chainId": 42161
  },
  "0xeDE0CE8cdc65bcF6422f3Afb9d7cDb3e59C09658": {
    "address": "0xeDE0CE8cdc65bcF6422f3Afb9d7cDb3e59C09658",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xede0ce8cdc65bcf6422f3afb9d7cdb3e59c09658/icon",
    "chainId": 42161
  },
  "0x4D15a3A2286D883AF0AA1B3f21367843FAc63E07": {
    "address": "0x4D15a3A2286D883AF0AA1B3f21367843FAc63E07",
    "name": "TrueUSD",
    "symbol": "TUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4d15a3a2286d883af0aa1b3f21367843fac63e07/icon",
    "chainId": 42161
  },
  "0x8096aD3107715747361acefE685943bFB427C722": {
    "address": "0x8096aD3107715747361acefE685943bFB427C722",
    "name": "Crypto Volatility Token",
    "symbol": "CVI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8096ad3107715747361acefe685943bfb427c722/icon",
    "chainId": 42161
  },
  "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B": {
    "address": "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B",
    "name": "GMD",
    "symbol": "GMD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4945970efeec98d393b4b979b9be265a3ae28a8b/icon",
    "chainId": 42161
  },
  "0x128D90fFe1c5cB2Eeb030547Fd4CA421CCe55AE3": {
    "address": "0x128D90fFe1c5cB2Eeb030547Fd4CA421CCe55AE3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x128d90ffe1c5cb2eeb030547fd4ca421cce55ae3/icon",
    "chainId": 42161
  },
  "0x0C4De24BfBc86D1b6EF742F6022b84262A32d5C8": {
    "address": "0x0C4De24BfBc86D1b6EF742F6022b84262A32d5C8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c4de24bfbc86d1b6ef742f6022b84262a32d5c8/icon",
    "chainId": 42161
  },
  "0x85c3E9546e1BD65CaE10b69C49b8c331B29D17A3": {
    "address": "0x85c3E9546e1BD65CaE10b69C49b8c331B29D17A3",
    "name": "reDao",
    "symbol": "RD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x85c3e9546e1bd65cae10b69c49b8c331b29d17a3/icon",
    "chainId": 42161
  },
  "0x55678cd083fcDC2947a0Df635c93C838C89454A3": {
    "address": "0x55678cd083fcDC2947a0Df635c93C838C89454A3",
    "name": "Tokenlon",
    "symbol": "LON",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x55678cd083fcdc2947a0df635c93c838c89454a3/icon",
    "chainId": 42161
  },
  "0xC126340ddAe642721219927dC78D976D83a17ae0": {
    "address": "0xC126340ddAe642721219927dC78D976D83a17ae0",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc126340ddae642721219927dc78d976d83a17ae0/icon",
    "chainId": 42161
  },
  "0x27D8De4c30ffDE34e982482AE504fC7F23061f61": {
    "address": "0x27D8De4c30ffDE34e982482AE504fC7F23061f61",
    "name": "MyMetaTrader Token",
    "symbol": "MMT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x27d8de4c30ffde34e982482ae504fc7f23061f61/icon",
    "chainId": 42161
  },
  "0xEF66660477450BF6c9e3C6d3FFAB469ed2DF8d35": {
    "address": "0xEF66660477450BF6c9e3C6d3FFAB469ed2DF8d35",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xef66660477450bf6c9e3c6d3ffab469ed2df8d35/icon",
    "chainId": 42161
  },
  "0xB260163158311596Ea88a700C5a30f101D072326": {
    "address": "0xB260163158311596Ea88a700C5a30f101D072326",
    "name": "StableV1 AMM - USD+/DAI+",
    "symbol": "sAMM-USD+/DAI+",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb260163158311596ea88a700c5a30f101d072326/icon",
    "chainId": 42161
  },
  "0x1922C36F3bc762Ca300b4a46bB2102F84B1684aB": {
    "address": "0x1922C36F3bc762Ca300b4a46bB2102F84B1684aB",
    "name": "Compounded Marinated UMAMI",
    "symbol": "cmUMAMI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1922c36f3bc762ca300b4a46bb2102f84b1684ab/icon",
    "chainId": 42161
  },
  "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3": {
    "address": "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3",
    "name": "Umami",
    "symbol": "UMAMI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1622bf67e6e5747b81866fe0b85178a93c7f86e3/icon",
    "chainId": 42161
  },
  "0x044838A9d24a8bfCfD76338e83f9d8A0e2B31f8a": {
    "address": "0x044838A9d24a8bfCfD76338e83f9d8A0e2B31f8a",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x044838a9d24a8bfcfd76338e83f9d8a0e2b31f8a/icon",
    "chainId": 42161
  },
  "0xB8A1fB453FBa462B854cb63adfc922dE2c985256": {
    "address": "0xB8A1fB453FBa462B854cb63adfc922dE2c985256",
    "name": "X TOKEN",
    "symbol": "XTOKEN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb8a1fb453fba462b854cb63adfc922de2c985256/icon",
    "chainId": 42161
  },
  "0xCBAB6076b4B0c482e7127a201b79a13D117E2B53": {
    "address": "0xCBAB6076b4B0c482e7127a201b79a13D117E2B53",
    "name": "Moo Balancer WBTC-WETH-USDC",
    "symbol": "mooBalancerWBTC-WETH-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcbab6076b4b0c482e7127a201b79a13d117e2b53/icon",
    "chainId": 42161
  },
  "0x0AFd1c279e669D2C85404c1D30EB6D14952672D9": {
    "address": "0x0AFd1c279e669D2C85404c1D30EB6D14952672D9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0afd1c279e669d2c85404c1d30eb6d14952672d9/icon",
    "chainId": 42161
  },
  "0x55395f7092Ce28c3f9332fa5f0A0D11fB11bA874": {
    "address": "0x55395f7092Ce28c3f9332fa5f0A0D11fB11bA874",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x55395f7092ce28c3f9332fa5f0a0d11fb11ba874/icon",
    "chainId": 42161
  },
  "0x9E3470d672bdBdEee311B59BDC3256aA76bE2a70": {
    "address": "0x9E3470d672bdBdEee311B59BDC3256aA76bE2a70",
    "name": "AET Token",
    "symbol": "AET",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9e3470d672bdbdeee311b59bdc3256aa76be2a70/icon",
    "chainId": 42161
  },
  "0xd779120b3e9f7F90b5D2d7419bD183636f36cadC": {
    "address": "0xd779120b3e9f7F90b5D2d7419bD183636f36cadC",
    "name": "Goblin Town",
    "symbol": "SCREE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd779120b3e9f7f90b5d2d7419bd183636f36cadc/icon",
    "chainId": 42161
  },
  "0xD2F7D5498696C653e0aBD7afaB283B5d755dd6B9": {
    "address": "0xD2F7D5498696C653e0aBD7afaB283B5d755dd6B9",
    "name": "Arbitrum Nove",
    "symbol": "NOVE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd2f7d5498696c653e0abd7afab283b5d755dd6b9/icon",
    "chainId": 42161
  },
  "0x96059759C6492fb4e8a9777b65f307F2C811a34F": {
    "address": "0x96059759C6492fb4e8a9777b65f307F2C811a34F",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x96059759c6492fb4e8a9777b65f307f2c811a34f/icon",
    "chainId": 42161
  },
  "0x6AF7bCA454f3C8165225Ed46FD4d78cc90E81fAA": {
    "address": "0x6AF7bCA454f3C8165225Ed46FD4d78cc90E81fAA",
    "name": "UPDOGE-BPT",
    "symbol": "UPDOGE-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6af7bca454f3c8165225ed46fd4d78cc90e81faa/icon",
    "chainId": 42161
  },
  "0x8B65C028B223b83b13FCF1d1F0873320e6CAB132": {
    "address": "0x8B65C028B223b83b13FCF1d1F0873320e6CAB132",
    "name": "UPDOGE",
    "symbol": "UPDOGE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8b65c028b223b83b13fcf1d1f0873320e6cab132/icon",
    "chainId": 42161
  },
  "0xf4ccbAf200152dC3162420123824469cC27a00Cf": {
    "address": "0xf4ccbAf200152dC3162420123824469cC27a00Cf",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf4ccbaf200152dc3162420123824469cc27a00cf/icon",
    "chainId": 42161
  },
  "0xd4c08606bE09bb7ed5284Eb6757A0880393573C4": {
    "address": "0xd4c08606bE09bb7ed5284Eb6757A0880393573C4",
    "name": "mxGLP",
    "symbol": "mxGLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd4c08606be09bb7ed5284eb6757a0880393573c4/icon",
    "chainId": 42161
  },
  "0x24704aFF49645D32655A76Df6d407E02d146dAfC": {
    "address": "0x24704aFF49645D32655A76Df6d407E02d146dAfC",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x24704aff49645d32655a76df6d407e02d146dafc/icon",
    "chainId": 42161
  },
  "0xbcFc5483EC12A0a78472FECF3C7e1658b21d2540": {
    "address": "0xbcFc5483EC12A0a78472FECF3C7e1658b21d2540",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbcfc5483ec12a0a78472fecf3c7e1658b21d2540/icon",
    "chainId": 42161
  },
  "0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017": {
    "address": "0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017",
    "name": "Radiant",
    "symbol": "RDNT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017/icon",
    "chainId": 42161
  },
  "0xF9e029a62293483BB0Ea46849f43521A6E9F714D": {
    "address": "0xF9e029a62293483BB0Ea46849f43521A6E9F714D",
    "name": "MTD",
    "symbol": "MTD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf9e029a62293483bb0ea46849f43521a6e9f714d/icon",
    "chainId": 42161
  },
  "0xd3aC0C63feF0506699d68d833a10477137254aFf": {
    "address": "0xd3aC0C63feF0506699d68d833a10477137254aFf",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd3ac0c63fef0506699d68d833a10477137254aff/icon",
    "chainId": 42161
  },
  "0x9A592B4539E22EeB8B2A3Df679d572C7712Ef999": {
    "address": "0x9A592B4539E22EeB8B2A3Df679d572C7712Ef999",
    "name": "Pirex GMX",
    "symbol": "pxGMX",
    "decimals": 18,
    "logoURI": "https://pirex.io/assets/images/tokens/GMX.png",
    "chainId": 42161
  },
  "0xcb1D846468c31248609bF867f4015d14818f5b77": {
    "address": "0xcb1D846468c31248609bF867f4015d14818f5b77",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcb1d846468c31248609bf867f4015d14818f5b77/icon",
    "chainId": 42161
  },
  "0x8933fEDD98Cbb482e27C41e1bD7216a4e42eBd39": {
    "address": "0x8933fEDD98Cbb482e27C41e1bD7216a4e42eBd39",
    "name": "PegasusBot",
    "symbol": "PGS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8933fedd98cbb482e27c41e1bd7216a4e42ebd39/icon",
    "chainId": 42161
  },
  "0x02C408F5859360C84a6521C79c013726780a4E1e": {
    "address": "0x02C408F5859360C84a6521C79c013726780a4E1e",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x02c408f5859360c84a6521c79c013726780a4e1e/icon",
    "chainId": 42161
  },
  "0x007a6e7BCe86f96DDc6a34AbA433a4757d8b9990": {
    "address": "0x007a6e7BCe86f96DDc6a34AbA433a4757d8b9990",
    "name": "WWD",
    "symbol": "WWD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x007a6e7bce86f96ddc6a34aba433a4757d8b9990/icon",
    "chainId": 42161
  },
  "0x61A1ff55C5216b636a294A07D77C6F4Df10d3B56": {
    "address": "0x61A1ff55C5216b636a294A07D77C6F4Df10d3B56",
    "name": "ApeX Token",
    "symbol": "APEX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x61a1ff55c5216b636a294a07d77c6f4df10d3b56/icon",
    "chainId": 42161
  },
  "0xeCA66820ed807c096e1Bd7a1A091cD3D3152cC79": {
    "address": "0xeCA66820ed807c096e1Bd7a1A091cD3D3152cC79",
    "name": "Ghast",
    "symbol": "GHA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeca66820ed807c096e1bd7a1a091cd3d3152cc79/icon",
    "chainId": 42161
  },
  "0xdc1B3F63944e0ff11dbaD513FE4175fc0466cE2E": {
    "address": "0xdc1B3F63944e0ff11dbaD513FE4175fc0466cE2E",
    "name": "MetaX",
    "symbol": "MetaX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdc1b3f63944e0ff11dbad513fe4175fc0466ce2e/icon",
    "chainId": 42161
  },
  "0x4f14D06CB1661cE1DC2A2f26A10A7Cd94393b29C": {
    "address": "0x4f14D06CB1661cE1DC2A2f26A10A7Cd94393b29C",
    "name": "20fxUSD-80FOREX",
    "symbol": "20fxUSD-80FOREX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4f14d06cb1661ce1dc2a2f26a10a7cd94393b29c/icon",
    "chainId": 42161
  },
  "0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F": {
    "address": "0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F",
    "name": "handleUSD",
    "symbol": "fxUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8616e8ea83f048ab9a5ec513c9412dd2993bce3f/icon",
    "chainId": 42161
  },
  "0xDb298285FE4C5410B05390cA80e8Fbe9DE1F259B": {
    "address": "0xDb298285FE4C5410B05390cA80e8Fbe9DE1F259B",
    "name": "handleFOREX",
    "symbol": "FOREX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdb298285fe4c5410b05390ca80e8fbe9de1f259b/icon",
    "chainId": 42161
  },
  "0x9cfa9d0123EbEd83c2811dF77dAf8D36Fa48E8aC": {
    "address": "0x9cfa9d0123EbEd83c2811dF77dAf8D36Fa48E8aC",
    "name": "Moo Uniswap Gamma BTCb-WETH",
    "symbol": "mooUniswapGammaBTCb-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9cfa9d0123ebed83c2811df77daf8d36fa48e8ac/icon",
    "chainId": 42161
  },
  "0xca809921A596A9439Ff3A14e526d338b219E46d4": {
    "address": "0xca809921A596A9439Ff3A14e526d338b219E46d4",
    "name": "Crypto Index Pool",
    "symbol": "CIP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xca809921a596a9439ff3a14e526d338b219e46d4/icon",
    "chainId": 42161
  },
  "0xcC65A812ce382aB909a11E434dbf75B34f1cc59D": {
    "address": "0xcC65A812ce382aB909a11E434dbf75B34f1cc59D",
    "name": "Balancer 60 BAL 40 WETH",
    "symbol": "B-60BAL-40WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcc65a812ce382ab909a11e434dbf75b34f1cc59d/icon",
    "chainId": 42161
  },
  "0x3344A88855E8242DED86aF2F874c8928F6Ad7BbA": {
    "address": "0x3344A88855E8242DED86aF2F874c8928F6Ad7BbA",
    "name": "xBTC.b-WETH3",
    "symbol": "xBTC.b-WETH3",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3344a88855e8242ded86af2f874c8928f6ad7bba/icon",
    "chainId": 42161
  },
  "0x9d2F299715D94d8A7E6F5eaa8E654E8c74a988A7": {
    "address": "0x9d2F299715D94d8A7E6F5eaa8E654E8c74a988A7",
    "name": "Frax Share",
    "symbol": "FXS",
    "decimals": 18,
    "logoURI": "https://arbiscan.io/token/images/fraxsharefxs_32.png",
    "chainId": 42161
  },
  "0x2ea3CA79413C2EC4C1893D5f8C34C16acB2288A4": {
    "address": "0x2ea3CA79413C2EC4C1893D5f8C34C16acB2288A4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2ea3ca79413c2ec4c1893d5f8c34c16acb2288a4/icon",
    "chainId": 42161
  },
  "0x76526043de41d5cC9b7Af1dD696739EAa8FbF0A4": {
    "address": "0x76526043de41d5cC9b7Af1dD696739EAa8FbF0A4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x76526043de41d5cc9b7af1dd696739eaa8fbf0a4/icon",
    "chainId": 42161
  },
  "0x15b53d277Af860f51c3E6843F8075007026BBb3a": {
    "address": "0x15b53d277Af860f51c3E6843F8075007026BBb3a",
    "name": "Radiant interest bearing WETH",
    "symbol": "rWETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x15b53d277af860f51c3e6843f8075007026bbb3a/icon",
    "chainId": 42161
  },
  "0xa1e48225215d9e656F4f9d779fc32817C50de0E5": {
    "address": "0xa1e48225215d9e656F4f9d779fc32817C50de0E5",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa1e48225215d9e656f4f9d779fc32817c50de0e5/icon",
    "chainId": 42161
  },
  "0x6609BE1547166D1C4605F3A243FDCFf467e600C3": {
    "address": "0x6609BE1547166D1C4605F3A243FDCFf467e600C3",
    "name": "NEU",
    "symbol": "NEU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6609be1547166d1c4605f3a243fdcff467e600c3/icon",
    "chainId": 42161
  },
  "0x76bE7aDac79d131033d4F6a0148C50d8BF7BeA8c": {
    "address": "0x76bE7aDac79d131033d4F6a0148C50d8BF7BeA8c",
    "name": "mountain sea world",
    "symbol": "MSC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x76be7adac79d131033d4f6a0148c50d8bf7bea8c/icon",
    "chainId": 42161
  },
  "0xFCb0101503f399B4752E5160ccd5EcE3a71719bd": {
    "address": "0xFCb0101503f399B4752E5160ccd5EcE3a71719bd",
    "name": "Moo SolidLizard ARB-ETH",
    "symbol": "mooSolidLizardARB-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfcb0101503f399b4752e5160ccd5ece3a71719bd/icon",
    "chainId": 42161
  },
  "0x3fb69D8720816A604487F2Fd5813b72C15Dd77Ea": {
    "address": "0x3fb69D8720816A604487F2Fd5813b72C15Dd77Ea",
    "name": "VolatileV1 AMM - plsRDNT/RDNT",
    "symbol": "vAMM-plsRDNT/RDNT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3fb69d8720816a604487f2fd5813b72c15dd77ea/icon",
    "chainId": 42161
  },
  "0xAa02446c845859Fc0D967f62964A703EdDA160c2": {
    "address": "0xAa02446c845859Fc0D967f62964A703EdDA160c2",
    "name": "VolatileV1 AMM - WETH/DEUS",
    "symbol": "vAMM-WETH/DEUS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa02446c845859fc0d967f62964a703edda160c2/icon",
    "chainId": 42161
  },
  "0xCeD06c9330B02C378C31c7b12570B1C38AbfcEA6": {
    "address": "0xCeD06c9330B02C378C31c7b12570B1C38AbfcEA6",
    "name": "Volatile AMM - WETH/ARB",
    "symbol": "vAMM-WETH/ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xced06c9330b02c378c31c7b12570b1c38abfcea6/icon",
    "chainId": 42161
  },
  "0x1605bbDAB3b38d10fA23A7Ed0d0e8F4FEa5bFF59": {
    "address": "0x1605bbDAB3b38d10fA23A7Ed0d0e8F4FEa5bFF59",
    "name": "Plutus RDNT",
    "symbol": "plsRDNT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1605bbdab3b38d10fa23a7ed0d0e8f4fea5bff59/icon",
    "chainId": 42161
  },
  "0xc8CCBd97b96834b976C995a67BF46e5754e2C48E": {
    "address": "0xc8CCBd97b96834b976C995a67BF46e5754e2C48E",
    "name": "Parallax Token",
    "symbol": "PLX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc8ccbd97b96834b976c995a67bf46e5754e2c48e/icon",
    "chainId": 42161
  },
  "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44": {
    "address": "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44",
    "name": "DEUS",
    "symbol": "DEUS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xde5ed76e7c05ec5e4572cfc88d1acea165109e44/icon",
    "chainId": 42161
  },
  "0x682BD6921B8b9634EB4635a269EA8Ae857d6Bb4e": {
    "address": "0x682BD6921B8b9634EB4635a269EA8Ae857d6Bb4e",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x682bd6921b8b9634eb4635a269ea8ae857d6bb4e/icon",
    "chainId": 42161
  },
  "0x341a16FD1399df0990a89C0a285b97e11E749e66": {
    "address": "0x341a16FD1399df0990a89C0a285b97e11E749e66",
    "name": "Variable Pair - lqETH/WETH",
    "symbol": "vAMM-lqETH/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x341a16fd1399df0990a89c0a285b97e11e749e66/icon",
    "chainId": 42161
  },
  "0xa0c79678bCFbEA0a358D5FeA563100893C37a848": {
    "address": "0xa0c79678bCFbEA0a358D5FeA563100893C37a848",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa0c79678bcfbea0a358d5fea563100893c37a848/icon",
    "chainId": 42161
  },
  "0x59A729658e9245B0cF1f8Cb9fb37945D2B06ea27": {
    "address": "0x59A729658e9245B0cF1f8Cb9fb37945D2B06ea27",
    "name": "GenomesDAO",
    "symbol": "GENE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x59a729658e9245b0cf1f8cb9fb37945d2b06ea27/icon",
    "chainId": 42161
  },
  "0xf329e36C7bF6E5E86ce2150875a84Ce77f477375": {
    "address": "0xf329e36C7bF6E5E86ce2150875a84Ce77f477375",
    "name": "Aave Arbitrum AAVE",
    "symbol": "aArbAAVE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf329e36c7bf6e5e86ce2150875a84ce77f477375/icon",
    "chainId": 42161
  },
  "0xa636E51C966331411Bb8D5f83D06010C3197f12D": {
    "address": "0xa636E51C966331411Bb8D5f83D06010C3197f12D",
    "name": "VolatileV1 AMM - IBEX/ARB",
    "symbol": "vAMM-IBEX/ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa636e51c966331411bb8d5f83d06010c3197f12d/icon",
    "chainId": 42161
  },
  "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196": {
    "address": "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196",
    "name": "Aave Token",
    "symbol": "AAVE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xba5ddd1f9d7f570dc94a51479a000e3bce967196/icon",
    "chainId": 42161
  },
  "0x56659245931CB6920e39C189D2a0e7DD0dA2d57b": {
    "address": "0x56659245931CB6920e39C189D2a0e7DD0dA2d57b",
    "name": "Impermax",
    "symbol": "IBEX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x56659245931cb6920e39c189d2a0e7dd0da2d57b/icon",
    "chainId": 42161
  },
  "0xbA288Eac2F578BAb1b40084c1AFEdb33dFb77D82": {
    "address": "0xbA288Eac2F578BAb1b40084c1AFEdb33dFb77D82",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xba288eac2f578bab1b40084c1afedb33dfb77d82/icon",
    "chainId": 42161
  },
  "0x46c0C24dd1042C65218F6EA525655B565df0B18F": {
    "address": "0x46c0C24dd1042C65218F6EA525655B565df0B18F",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x46c0c24dd1042c65218f6ea525655b565df0b18f/icon",
    "chainId": 42161
  },
  "0x6a96d52C0D0eb1Ee094a91173964b8FFE5c254C8": {
    "address": "0x6a96d52C0D0eb1Ee094a91173964b8FFE5c254C8",
    "name": "ALEO",
    "symbol": "ALEO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6a96d52c0d0eb1ee094a91173964b8ffe5c254c8/icon",
    "chainId": 42161
  },
  "0x4e914bbDCDE0f455A8aC9d59d3bF739c46287Ed2": {
    "address": "0x4e914bbDCDE0f455A8aC9d59d3bF739c46287Ed2",
    "name": "Axelar Wrapped SOMM",
    "symbol": "axlSOMM",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4e914bbdcde0f455a8ac9d59d3bf739c46287ed2/icon",
    "chainId": 42161
  },
  "0x6522d9AD280ed92155b33a6c4dDE84FCc857914d": {
    "address": "0x6522d9AD280ed92155b33a6c4dDE84FCc857914d",
    "name": "VolatileV1 AMM - IDIA/USDC",
    "symbol": "vAMM-IDIA/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6522d9ad280ed92155b33a6c4dde84fcc857914d/icon",
    "chainId": 42161
  },
  "0xF202Ab403Cd7E90197ec0f010ee897E283037706": {
    "address": "0xF202Ab403Cd7E90197ec0f010ee897E283037706",
    "name": "Savvy USD",
    "symbol": "svUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf202ab403cd7e90197ec0f010ee897e283037706/icon",
    "chainId": 42161
  },
  "0xE6045890B20945D00e6f3c01878265C03C5435D3": {
    "address": "0xE6045890B20945D00e6f3c01878265C03C5435D3",
    "name": "Impossible Decentralized Incubat",
    "symbol": "IDIA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe6045890b20945d00e6f3c01878265c03c5435d3/icon",
    "chainId": 42161
  },
  "0xB1bC21f748AE2bE95674876710bc6D78235480e0": {
    "address": "0xB1bC21f748AE2bE95674876710bc6D78235480e0",
    "name": "HORD Token [via ChainPort.io]",
    "symbol": "HORD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb1bc21f748ae2be95674876710bc6d78235480e0/icon",
    "chainId": 42161
  },
  "0x1Cb94adFd3314d48Ca8145b2c6983419257c0486": {
    "address": "0x1Cb94adFd3314d48Ca8145b2c6983419257c0486",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1cb94adfd3314d48ca8145b2c6983419257c0486/icon",
    "chainId": 42161
  },
  "0xebCe8D1643b307731A7a42947aB6D9872a4b8AdF": {
    "address": "0xebCe8D1643b307731A7a42947aB6D9872a4b8AdF",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xebce8d1643b307731a7a42947ab6d9872a4b8adf/icon",
    "chainId": 42161
  },
  "0x4CFA50B7Ce747e2D61724fcAc57f24B748FF2b2A": {
    "address": "0x4CFA50B7Ce747e2D61724fcAc57f24B748FF2b2A",
    "name": "Fluid USDC",
    "symbol": "fUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4cfa50b7ce747e2d61724fcac57f24b748ff2b2a/icon",
    "chainId": 42161
  },
  "0x813EadD285AA0d16aad8bB21c1A5C07486C9ed61": {
    "address": "0x813EadD285AA0d16aad8bB21c1A5C07486C9ed61",
    "name": "Arbitrum Nova",
    "symbol": "NOVA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x813eadd285aa0d16aad8bb21c1a5c07486c9ed61/icon",
    "chainId": 42161
  },
  "0x5B904f19fb9ccf493b623e5c8cE91603665788b0": {
    "address": "0x5B904f19fb9ccf493b623e5c8cE91603665788b0",
    "name": "Moo Gmx GMX",
    "symbol": "mooGmxGMX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5b904f19fb9ccf493b623e5c8ce91603665788b0/icon",
    "chainId": 42161
  },
  "0xa61F74247455A40b01b0559ff6274441FAfa22A3": {
    "address": "0xa61F74247455A40b01b0559ff6274441FAfa22A3",
    "name": "Magpie Token",
    "symbol": "MGP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa61f74247455a40b01b0559ff6274441fafa22a3/icon",
    "chainId": 42161
  },
  "0x5A8beF2fEb83057bBCcC81cea985a94a62A86208": {
    "address": "0x5A8beF2fEb83057bBCcC81cea985a94a62A86208",
    "name": "Moo Sushi RDPX-ETH",
    "symbol": "mooSushiRDPX-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5a8bef2feb83057bbccc81cea985a94a62a86208/icon",
    "chainId": 42161
  },
  "0xC47D9753F3b32aA9548a7C3F30b6aEc3B2d2798C": {
    "address": "0xC47D9753F3b32aA9548a7C3F30b6aEc3B2d2798C",
    "name": "TND",
    "symbol": "TND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc47d9753f3b32aa9548a7c3f30b6aec3b2d2798c/icon",
    "chainId": 42161
  },
  "0x31C91D8Fb96BfF40955DD2dbc909B36E8b104Dde": {
    "address": "0x31C91D8Fb96BfF40955DD2dbc909B36E8b104Dde",
    "name": "Poison.Finance Poison",
    "symbol": "POI$ON",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x31c91d8fb96bff40955dd2dbc909b36e8b104dde/icon",
    "chainId": 42161
  },
  "0x3EcC5A0d8b3456c5E1ab2B110f0a4da923dC49Ec": {
    "address": "0x3EcC5A0d8b3456c5E1ab2B110f0a4da923dC49Ec",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3ecc5a0d8b3456c5e1ab2b110f0a4da923dc49ec/icon",
    "chainId": 42161
  },
  "0xBcc9C1763d54427bDF5EfB6e9EB9494E5a1fbAbf": {
    "address": "0xBcc9C1763d54427bDF5EfB6e9EB9494E5a1fbAbf",
    "name": "HonorWorld Token",
    "symbol": "HWT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbcc9c1763d54427bdf5efb6e9eb9494e5a1fbabf/icon",
    "chainId": 42161
  },
  "0x9fEC869134A3612058DE1533C20BF1C7f3d301C0": {
    "address": "0x9fEC869134A3612058DE1533C20BF1C7f3d301C0",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9fec869134a3612058de1533c20bf1c7f3d301c0/icon",
    "chainId": 42161
  },
  "0x480EcF204f510404a720AE9715713A6E682117f9": {
    "address": "0x480EcF204f510404a720AE9715713A6E682117f9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x480ecf204f510404a720ae9715713a6e682117f9/icon",
    "chainId": 42161
  },
  "0xfb9Fed8cB962548A11fE7F6F282949061395c7F5": {
    "address": "0xfb9Fed8cB962548A11fE7F6F282949061395c7F5",
    "name": "NUON",
    "symbol": "NUON",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfb9fed8cb962548a11fe7f6f282949061395c7f5/icon",
    "chainId": 42161
  },
  "0xfF4aF11B06618183866D6e71c5aB89645F8C5E56": {
    "address": "0xfF4aF11B06618183866D6e71c5aB89645F8C5E56",
    "name": "TDX",
    "symbol": "TDX",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xff4af11b06618183866d6e71c5ab89645f8c5e56/icon",
    "chainId": 42161
  },
  "0x805ba50001779CeD4f59CfF63aea527D12B94829": {
    "address": "0x805ba50001779CeD4f59CfF63aea527D12B94829",
    "name": "Radiant interest bearing USDC",
    "symbol": "rUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x805ba50001779ced4f59cff63aea527d12b94829/icon",
    "chainId": 42161
  },
  "0xBbcF0B7F070B170909C9ff430878e92ceAd990F3": {
    "address": "0xBbcF0B7F070B170909C9ff430878e92ceAd990F3",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbbcf0b7f070b170909c9ff430878e92cead990f3/icon",
    "chainId": 42161
  },
  "0x1426CF37CAA89628C4DA2864e40cF75E6d66Ac6b": {
    "address": "0x1426CF37CAA89628C4DA2864e40cF75E6d66Ac6b",
    "name": "Relay Token",
    "symbol": "RELAY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1426cf37caa89628c4da2864e40cf75e6d66ac6b/icon",
    "chainId": 42161
  },
  "0xBFC41D69e3e828718b39ddC448B1050A82f84105": {
    "address": "0xBFC41D69e3e828718b39ddC448B1050A82f84105",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbfc41d69e3e828718b39ddc448b1050a82f84105/icon",
    "chainId": 42161
  },
  "0x855F1b323FdD73AF1e2C075C1F422593624eD0DD": {
    "address": "0x855F1b323FdD73AF1e2C075C1F422593624eD0DD",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x855f1b323fdd73af1e2c075c1f422593624ed0dd/icon",
    "chainId": 42161
  },
  "0x7DdF25cB4861590578f1fb85Fcf1C5aFD00A01dE": {
    "address": "0x7DdF25cB4861590578f1fb85Fcf1C5aFD00A01dE",
    "name": "Peper",
    "symbol": "PEPER",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7ddf25cb4861590578f1fb85fcf1c5afd00a01de/icon",
    "chainId": 42161
  },
  "0x51A80238B5738725128d3a3e06Ab41c1d4C05C74": {
    "address": "0x51A80238B5738725128d3a3e06Ab41c1d4C05C74",
    "name": "unshETHing_Token",
    "symbol": "USH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x51a80238b5738725128d3a3e06ab41c1d4c05c74/icon",
    "chainId": 42161
  },
  "0xf7693c6fD9a7172D537FA75D133D309501Cbd657": {
    "address": "0xf7693c6fD9a7172D537FA75D133D309501Cbd657",
    "name": "Web3 No Value",
    "symbol": "W3N",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf7693c6fd9a7172d537fa75d133d309501cbd657/icon",
    "chainId": 42161
  },
  "0x3932192dE4f17DFB94Be031a8458E215A44BF560": {
    "address": "0x3932192dE4f17DFB94Be031a8458E215A44BF560",
    "name": "Correlated rAMM - frxETH/WETH",
    "symbol": "crAMM-frxETH/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3932192de4f17dfb94be031a8458e215a44bf560/icon",
    "chainId": 42161
  },
  "0x7fFAf4698635a7679CE508160f2156B8739f37fE": {
    "address": "0x7fFAf4698635a7679CE508160f2156B8739f37fE",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7ffaf4698635a7679ce508160f2156b8739f37fe/icon",
    "chainId": 42161
  },
  "0x952C4d563E8F74910E979C5fF8Eb30aEB6AfEA85": {
    "address": "0x952C4d563E8F74910E979C5fF8Eb30aEB6AfEA85",
    "name": "PepeSatoshi",
    "symbol": "PEPESATOSHI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x952c4d563e8f74910e979c5ff8eb30aeb6afea85/icon",
    "chainId": 42161
  },
  "0x178412e79c25968a32e89b11f63B33F733770c2A": {
    "address": "0x178412e79c25968a32e89b11f63B33F733770c2A",
    "name": "Frax Ether",
    "symbol": "frxETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x178412e79c25968a32e89b11f63b33f733770c2a/icon",
    "chainId": 42161
  },
  "0xD4c556bB8D9ECef063C5d75c65D6E31E46990367": {
    "address": "0xD4c556bB8D9ECef063C5d75c65D6E31E46990367",
    "name": "Unbound Dollar",
    "symbol": "UND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd4c556bb8d9ecef063c5d75c65d6e31e46990367/icon",
    "chainId": 42161
  },
  "0x3FEC70f319A4145eba17765Ae0C64b2232fe5BAe": {
    "address": "0x3FEC70f319A4145eba17765Ae0C64b2232fe5BAe",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3fec70f319a4145eba17765ae0c64b2232fe5bae/icon",
    "chainId": 42161
  },
  "0xf653eBE8029b10C2E42936553e74145EfC58e6F4": {
    "address": "0xf653eBE8029b10C2E42936553e74145EfC58e6F4",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf653ebe8029b10c2e42936553e74145efc58e6f4/icon",
    "chainId": 42161
  },
  "0x8d333f82e0693f53fA48c40d5D4547142E907e1D": {
    "address": "0x8d333f82e0693f53fA48c40d5D4547142E907e1D",
    "name": "80PAL-20OHM",
    "symbol": "80PAL-20OHM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8d333f82e0693f53fa48c40d5d4547142e907e1d/icon",
    "chainId": 42161
  },
  "0xFc77b86F3ADe71793E1EEc1E7944DB074922856e": {
    "address": "0xFc77b86F3ADe71793E1EEc1E7944DB074922856e",
    "name": "Mugen",
    "symbol": "MGN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfc77b86f3ade71793e1eec1e7944db074922856e/icon",
    "chainId": 42161
  },
  "0x9f6AbbF0Ba6B5bfa27f4deb6597CC6Ec20573FDA": {
    "address": "0x9f6AbbF0Ba6B5bfa27f4deb6597CC6Ec20573FDA",
    "name": "Ferrum Network Token",
    "symbol": "FRM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda/icon",
    "chainId": 42161
  },
  "0x8f063694D1C96326eE8ed75f1469d95Eb0059D62": {
    "address": "0x8f063694D1C96326eE8ed75f1469d95Eb0059D62",
    "name": "Ainance",
    "symbol": "ANA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8f063694d1c96326ee8ed75f1469d95eb0059d62/icon",
    "chainId": 42161
  },
  "0xa7997F0eC9fa54E89659229fB26537B6A725b798": {
    "address": "0xa7997F0eC9fa54E89659229fB26537B6A725b798",
    "name": "Paladin Token",
    "symbol": "PAL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa7997f0ec9fa54e89659229fb26537b6a725b798/icon",
    "chainId": 42161
  },
  "0xf0cb2dc0db5e6c66B9a70Ac27B06b878da017028": {
    "address": "0xf0cb2dc0db5e6c66B9a70Ac27B06b878da017028",
    "name": "Olympus",
    "symbol": "OHM",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf0cb2dc0db5e6c66b9a70ac27b06b878da017028/icon",
    "chainId": 42161
  },
  "0xA98070C4a600678a93cEaF4bF629eE255F46f64F": {
    "address": "0xA98070C4a600678a93cEaF4bF629eE255F46f64F",
    "name": "Moo Hop USDC",
    "symbol": "mooHopUSDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa98070c4a600678a93ceaf4bf629ee255f46f64f/icon",
    "chainId": 42161
  },
  "0x5Fa594Dd5e198DE5E7EF539F1b8fB154AeFD3891": {
    "address": "0x5Fa594Dd5e198DE5E7EF539F1b8fB154AeFD3891",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5fa594dd5e198de5e7ef539f1b8fb154aefd3891/icon",
    "chainId": 42161
  },
  "0xf166fF5CD771923D4d4fb870403Afc6F13DD2D02": {
    "address": "0xf166fF5CD771923D4d4fb870403Afc6F13DD2D02",
    "name": "Correlated rAMM - frxETH/sfrxETH",
    "symbol": "crAMM-frxETH/sfrxETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf166ff5cd771923d4d4fb870403afc6f13dd2d02/icon",
    "chainId": 42161
  },
  "0xB5bd58C733948e3d65d86BA9604e06e5dA276FD1": {
    "address": "0xB5bd58C733948e3d65d86BA9604e06e5dA276FD1",
    "name": "WBTC-wstETH",
    "symbol": "WBTC-wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb5bd58c733948e3d65d86ba9604e06e5da276fd1/icon",
    "chainId": 42161
  },
  "0x95aB45875cFFdba1E5f451B950bC2E42c0053f39": {
    "address": "0x95aB45875cFFdba1E5f451B950bC2E42c0053f39",
    "name": "Staked Frax Ether",
    "symbol": "sfrxETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x95ab45875cffdba1e5f451b950bc2e42c0053f39/icon",
    "chainId": 42161
  },
  "0x9773367fB87CFbcB7F6A0AB9a9e3Ab635023b7Da": {
    "address": "0x9773367fB87CFbcB7F6A0AB9a9e3Ab635023b7Da",
    "name": "DEEPP",
    "symbol": "DEEPP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9773367fb87cfbcb7f6a0ab9a9e3ab635023b7da/icon",
    "chainId": 42161
  },
  "0xC0b4D8AFFe04aD24CE6C52672A885DF669EF3F9A": {
    "address": "0xC0b4D8AFFe04aD24CE6C52672A885DF669EF3F9A",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc0b4d8affe04ad24ce6c52672a885df669ef3f9a/icon",
    "chainId": 42161
  },
  "0x45d780CfE839b8a8f292C9E26aa5D1805bc536dc": {
    "address": "0x45d780CfE839b8a8f292C9E26aa5D1805bc536dc",
    "name": "ZOCI",
    "symbol": "ZOCI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x45d780cfe839b8a8f292c9e26aa5d1805bc536dc/icon",
    "chainId": 42161
  },
  "0xaa54e84A3e6e5A80288d2C2f8e36eA5cA3A3Ca30": {
    "address": "0xaa54e84A3e6e5A80288d2C2f8e36eA5cA3A3Ca30",
    "name": "SHARBI",
    "symbol": "$SHARBI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa54e84a3e6e5a80288d2c2f8e36ea5ca3a3ca30/icon",
    "chainId": 42161
  },
  "0x3c6eF5Ed8ad5DF0d5e3D05C6e607c60F987fB735": {
    "address": "0x3c6eF5Ed8ad5DF0d5e3D05C6e607c60F987fB735",
    "name": "Correlated rAMM - MAI/USDC",
    "symbol": "crAMM-MAI/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3c6ef5ed8ad5df0d5e3d05c6e607c60f987fb735/icon",
    "chainId": 42161
  },
  "0x61330854724d4c02FBdC9F0F74976eAf2C556b3E": {
    "address": "0x61330854724d4c02FBdC9F0F74976eAf2C556b3E",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x61330854724d4c02fbdc9f0f74976eaf2c556b3e/icon",
    "chainId": 42161
  },
  "0x43c25F828390DE5a3648864eb485CC523E039e67": {
    "address": "0x43c25F828390DE5a3648864eb485CC523E039e67",
    "name": "Pet Token",
    "symbol": "PET",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x43c25f828390de5a3648864eb485cc523e039e67/icon",
    "chainId": 42161
  },
  "0xD4d026322C88C2d49942A75DfF920FCfbC5614C1": {
    "address": "0xD4d026322C88C2d49942A75DfF920FCfbC5614C1",
    "name": "OpenLeverage",
    "symbol": "OLE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd4d026322c88c2d49942a75dff920fcfbc5614c1/icon",
    "chainId": 42161
  },
  "0xF878fD7C62a9D191EA58aaFB1AA000dc71431723": {
    "address": "0xF878fD7C62a9D191EA58aaFB1AA000dc71431723",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf878fd7c62a9d191ea58aafb1aa000dc71431723/icon",
    "chainId": 42161
  },
  "0xBBEa044f9e7c0520195e49Ad1e561572E7E1B948": {
    "address": "0xBBEa044f9e7c0520195e49Ad1e561572E7E1B948",
    "name": "MZR",
    "symbol": "MZR Token",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbbea044f9e7c0520195e49ad1e561572e7e1b948/icon",
    "chainId": 42161
  },
  "0xAB88D66Bc82AC67b5a7eAa96B5FAC127D0DAAAAa": {
    "address": "0xAB88D66Bc82AC67b5a7eAa96B5FAC127D0DAAAAa",
    "name": "MOMO",
    "symbol": "MOMO",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xab88d66bc82ac67b5a7eaa96b5fac127d0daaaaa/icon",
    "chainId": 42161
  },
  "0xD2A7084369cC93672b2CA868757a9f327e3677a4": {
    "address": "0xD2A7084369cC93672b2CA868757a9f327e3677a4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd2a7084369cc93672b2ca868757a9f327e3677a4/icon",
    "chainId": 42161
  },
  "0x257DBe5E13e53B16947bf7Ef8B108DF616bC2054": {
    "address": "0x257DBe5E13e53B16947bf7Ef8B108DF616bC2054",
    "name": "VolatileV1 AMM - WAR/WETH",
    "symbol": "vAMM-WAR/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x257dbe5e13e53b16947bf7ef8b108df616bc2054/icon",
    "chainId": 42161
  },
  "0xd5DA32Ad4C7510457C0e46Fa4332F75f6C4C4dC0": {
    "address": "0xd5DA32Ad4C7510457C0e46Fa4332F75f6C4C4dC0",
    "name": "AutoEarn Token",
    "symbol": "ATE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd5da32ad4c7510457c0e46fa4332f75f6c4c4dc0/icon",
    "chainId": 42161
  },
  "0x1F6E4B5fFc94cCA08cF6BB1479148d6329d4bAF5": {
    "address": "0x1F6E4B5fFc94cCA08cF6BB1479148d6329d4bAF5",
    "name": "WAR",
    "symbol": "WAR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1f6e4b5ffc94cca08cf6bb1479148d6329d4baf5/icon",
    "chainId": 42161
  },
  "0x9dCA587dc65AC0a043828B0acd946d71eb8D46c1": {
    "address": "0x9dCA587dc65AC0a043828B0acd946d71eb8D46c1",
    "name": "iFARM",
    "symbol": "iFARM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9dca587dc65ac0a043828b0acd946d71eb8d46c1/icon",
    "chainId": 42161
  },
  "0x36970fc0dc6f3e21C924997bdf4DF2a790dDF503": {
    "address": "0x36970fc0dc6f3e21C924997bdf4DF2a790dDF503",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x36970fc0dc6f3e21c924997bdf4df2a790ddf503/icon",
    "chainId": 42161
  },
  "0x2c7513F299778A84797F293503DB1A73A15FD48D": {
    "address": "0x2c7513F299778A84797F293503DB1A73A15FD48D",
    "name": "OpenbetAI",
    "symbol": "OPENBET",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2c7513f299778a84797f293503db1a73a15fd48d/icon",
    "chainId": 42161
  },
  "0x7CA686B3795784f12643127c5c3F56aa107a04C3": {
    "address": "0x7CA686B3795784f12643127c5c3F56aa107a04C3",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7ca686b3795784f12643127c5c3f56aa107a04c3/icon",
    "chainId": 42161
  },
  "0x655a6BeEBF2361A19549a99486FF65f709BD2646": {
    "address": "0x655a6BeEBF2361A19549a99486FF65f709BD2646",
    "name": "LilAI",
    "symbol": "LILAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x655a6beebf2361a19549a99486ff65f709bd2646/icon",
    "chainId": 42161
  },
  "0xCCD3891c1452b7CB0E4632774B9365DC4eE24f20": {
    "address": "0xCCD3891c1452b7CB0E4632774B9365DC4eE24f20",
    "name": "EDE",
    "symbol": "EDE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xccd3891c1452b7cb0e4632774b9365dc4ee24f20/icon",
    "chainId": 42161
  },
  "0xD1F820edc52b89Fd4CC254418e396eDba628f0e7": {
    "address": "0xD1F820edc52b89Fd4CC254418e396eDba628f0e7",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd1f820edc52b89fd4cc254418e396edba628f0e7/icon",
    "chainId": 42161
  },
  "0xafE909b1A5ed90d36f9eE1490fCB855645C00EB3": {
    "address": "0xafE909b1A5ed90d36f9eE1490fCB855645C00EB3",
    "name": "VolatileV1 AMM - WETH/ARB",
    "symbol": "vAMM-WETH/ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xafe909b1a5ed90d36f9ee1490fcb855645c00eb3/icon",
    "chainId": 42161
  },
  "0xb0eCc6ac0073c063DCFC026cCdC9039Cae2998E1": {
    "address": "0xb0eCc6ac0073c063DCFC026cCdC9039Cae2998E1",
    "name": "Account Abstraction Incentive",
    "symbol": "AA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb0ecc6ac0073c063dcfc026ccdc9039cae2998e1/icon",
    "chainId": 42161
  },
  "0x9c8eF67C9168587134e1F29a71405DC753500A45": {
    "address": "0x9c8eF67C9168587134e1F29a71405DC753500A45",
    "name": "Legends",
    "symbol": "LG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9c8ef67c9168587134e1f29a71405dc753500a45/icon",
    "chainId": 42161
  },
  "0xEb3C4d71C31d291e47641cd09eA8E8f5696B6B4C": {
    "address": "0xEb3C4d71C31d291e47641cd09eA8E8f5696B6B4C",
    "name": "DopeWarz",
    "symbol": "DWZ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeb3c4d71c31d291e47641cd09ea8e8f5696b6b4c/icon",
    "chainId": 42161
  },
  "0x5190F06EaceFA2C552dc6BD5e763b81C73293293": {
    "address": "0x5190F06EaceFA2C552dc6BD5e763b81C73293293",
    "name": "Wombex Token",
    "symbol": "WMX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5190f06eacefa2c552dc6bd5e763b81c73293293/icon",
    "chainId": 42161
  },
  "0xfef1e3e114E9D73FA794ee3B8435c59Aef33a0f8": {
    "address": "0xfef1e3e114E9D73FA794ee3B8435c59Aef33a0f8",
    "name": "VolatileV1 AMM - fBOMB/YFX",
    "symbol": "vAMM-fBOMB/YFX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfef1e3e114e9d73fa794ee3b8435c59aef33a0f8/icon",
    "chainId": 42161
  },
  "0x02Cf9AB55Be7B64545aCd6E297c66375E0806b3F": {
    "address": "0x02Cf9AB55Be7B64545aCd6E297c66375E0806b3F",
    "name": "Variable Pair - WBTC/lqETH",
    "symbol": "vAMM-WBTC/lqETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x02cf9ab55be7b64545acd6e297c66375e0806b3f/icon",
    "chainId": 42161
  },
  "0x74ccbe53F77b08632ce0CB91D3A545bF6B8E0979": {
    "address": "0x74ccbe53F77b08632ce0CB91D3A545bF6B8E0979",
    "name": "Fantom Bomb",
    "symbol": "fBOMB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x74ccbe53f77b08632ce0cb91d3a545bf6b8e0979/icon",
    "chainId": 42161
  },
  "0xB2DefC5c3A69abe2B681C714b080A892825B2073": {
    "address": "0xB2DefC5c3A69abe2B681C714b080A892825B2073",
    "name": "Moo SolidLizard WETH-USDC",
    "symbol": "mooSolidLizardWETH-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb2defc5c3a69abe2b681c714b080a892825b2073/icon",
    "chainId": 42161
  },
  "0xACb1E5547A00f908EDfB61C4D483f9124a5A3ced": {
    "address": "0xACb1E5547A00f908EDfB61C4D483f9124a5A3ced",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xacb1e5547a00f908edfb61c4d483f9124a5a3ced/icon",
    "chainId": 42161
  },
  "0x3221022e37029923aCe4235D812273C5A42C322d": {
    "address": "0x3221022e37029923aCe4235D812273C5A42C322d",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3221022e37029923ace4235d812273c5a42c322d/icon",
    "chainId": 42161
  },
  "0xe20F93279fF3538b1ad70D11bA160755625e3400": {
    "address": "0xe20F93279fF3538b1ad70D11bA160755625e3400",
    "name": "Volatile AMM - WETH/USDC",
    "symbol": "vAMM-WETH/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe20f93279ff3538b1ad70d11ba160755625e3400/icon",
    "chainId": 42161
  },
  "0xEFff64cDead61677081c5db879034E3eA713bE39": {
    "address": "0xEFff64cDead61677081c5db879034E3eA713bE39",
    "name": "MPT",
    "symbol": "MPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xefff64cdead61677081c5db879034e3ea713be39/icon",
    "chainId": 42161
  },
  "0x3B1AfeED07b49652dF107145feB493C251545619": {
    "address": "0x3B1AfeED07b49652dF107145feB493C251545619",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3b1afeed07b49652df107145feb493c251545619/icon",
    "chainId": 42161
  },
  "0xb6DD51D5425861C808Fd60827Ab6CFBfFE604959": {
    "address": "0xb6DD51D5425861C808Fd60827Ab6CFBfFE604959",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb6dd51d5425861c808fd60827ab6cfbffe604959/icon",
    "chainId": 42161
  },
  "0x8937FC210167C92dEcc96892C0166D028c22804c": {
    "address": "0x8937FC210167C92dEcc96892C0166D028c22804c",
    "name": "Zyber LP",
    "symbol": "ZLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8937fc210167c92decc96892c0166d028c22804c/icon",
    "chainId": 42161
  },
  "0x7CA0B5Ca80291B1fEB2d45702FFE56a7A53E7a97": {
    "address": "0x7CA0B5Ca80291B1fEB2d45702FFE56a7A53E7a97",
    "name": "Radiate Token",
    "symbol": "RADT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7ca0b5ca80291b1feb2d45702ffe56a7a53e7a97/icon",
    "chainId": 42161
  },
  "0xA8EC857E5F001ffbcdEc4bFa2a3Fe86dB607f4Ad": {
    "address": "0xA8EC857E5F001ffbcdEc4bFa2a3Fe86dB607f4Ad",
    "name": "HXTO",
    "symbol": "HXTO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa8ec857e5f001ffbcdec4bfa2a3fe86db607f4ad/icon",
    "chainId": 42161
  },
  "0x876Ec6bE52486Eeec06bc06434f3E629D695c6bA": {
    "address": "0x876Ec6bE52486Eeec06bc06434f3E629D695c6bA",
    "name": "FluidFi",
    "symbol": "FLUID",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x876ec6be52486eeec06bc06434f3e629d695c6ba/icon",
    "chainId": 42161
  },
  "0x692a0B300366D1042679397e40f3d2cb4b8F7D30": {
    "address": "0x692a0B300366D1042679397e40f3d2cb4b8F7D30",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x692a0b300366d1042679397e40f3d2cb4b8f7d30/icon",
    "chainId": 42161
  },
  "0x80514CfB7cb438F1f997Ab62fFD1314c1a1c0f12": {
    "address": "0x80514CfB7cb438F1f997Ab62fFD1314c1a1c0f12",
    "name": "Moo Sushi MIM-WETH",
    "symbol": "mooSushiMIM-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x80514cfb7cb438f1f997ab62ffd1314c1a1c0f12/icon",
    "chainId": 42161
  },
  "0xD46F8323E6E5540746E2df154cc1056907e89C7A": {
    "address": "0xD46F8323E6E5540746E2df154cc1056907e89C7A",
    "name": "Volatile rAMM - fBOMB/WETH",
    "symbol": "vrAMM-fBOMB/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd46f8323e6e5540746e2df154cc1056907e89c7a/icon",
    "chainId": 42161
  },
  "0x8ef642333BbA8D83Ea67ff65Af29BB69d19A1995": {
    "address": "0x8ef642333BbA8D83Ea67ff65Af29BB69d19A1995",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8ef642333bba8d83ea67ff65af29bb69d19a1995/icon",
    "chainId": 42161
  },
  "0xDF13D3c7f5Bf27c7799C2b51826314e842397876": {
    "address": "0xDF13D3c7f5Bf27c7799C2b51826314e842397876",
    "name": "MeeetSocialGameToken",
    "symbol": "MST",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdf13d3c7f5bf27c7799c2b51826314e842397876/icon",
    "chainId": 42161
  },
  "0xA271826737f32c317b62E306b2e11a876324ce8A": {
    "address": "0xA271826737f32c317b62E306b2e11a876324ce8A",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa271826737f32c317b62e306b2e11a876324ce8a/icon",
    "chainId": 42161
  },
  "0xcF985abA4647a432E60efcEeB8054BBd64244305": {
    "address": "0xcF985abA4647a432E60efcEeB8054BBd64244305",
    "name": "EUROe Stablecoin",
    "symbol": "EUROe",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcf985aba4647a432e60efceeb8054bbd64244305/icon",
    "chainId": 42161
  },
  "0xB57C4fEBAE5F8C68Bd45D676317Ec97Ff38911E0": {
    "address": "0xB57C4fEBAE5F8C68Bd45D676317Ec97Ff38911E0",
    "name": "Lancelot",
    "symbol": "LANCE",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb57c4febae5f8c68bd45d676317ec97ff38911e0/icon",
    "chainId": 42161
  },
  "0xDd8e557C8804D326c72074e987de02A23ae6Ef84": {
    "address": "0xDd8e557C8804D326c72074e987de02A23ae6Ef84",
    "name": "ArbInu",
    "symbol": "ARBINU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdd8e557c8804d326c72074e987de02a23ae6ef84/icon",
    "chainId": 42161
  },
  "0x63bc11ED89a89f793f5931816061cFDD0e8E3090": {
    "address": "0x63bc11ED89a89f793f5931816061cFDD0e8E3090",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x63bc11ed89a89f793f5931816061cfdd0e8e3090/icon",
    "chainId": 42161
  },
  "0x9cB7C512Da0b6BA5f06eA1C04f2cC82F132e348B": {
    "address": "0x9cB7C512Da0b6BA5f06eA1C04f2cC82F132e348B",
    "name": "Thetanut Index USDC",
    "symbol": "indexUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9cb7c512da0b6ba5f06ea1c04f2cc82f132e348b/icon",
    "chainId": 42161
  },
  "0xc2F082d33b5B8eF3A7E3de30da54EFd3114512aC": {
    "address": "0xc2F082d33b5B8eF3A7E3de30da54EFd3114512aC",
    "name": "Balancer 80 PICKLE 20 WETH",
    "symbol": "B-80PICKLE-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac/icon",
    "chainId": 42161
  },
  "0x54F983F1407D6ec30C6B7633F2Bf05a672a7f216": {
    "address": "0x54F983F1407D6ec30C6B7633F2Bf05a672a7f216",
    "name": "Orbitrum",
    "symbol": "ORB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x54f983f1407d6ec30c6b7633f2bf05a672a7f216/icon",
    "chainId": 42161
  },
  "0x965772e0E9c84b6f359c8597C891108DcF1c5B1A": {
    "address": "0x965772e0E9c84b6f359c8597C891108DcF1c5B1A",
    "name": "PickleToken",
    "symbol": "PICKLE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x965772e0e9c84b6f359c8597c891108dcf1c5b1a/icon",
    "chainId": 42161
  },
  "0x9A1e2f4dF9f13855Af30A6b132c1332E6f731C9C": {
    "address": "0x9A1e2f4dF9f13855Af30A6b132c1332E6f731C9C",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9a1e2f4df9f13855af30a6b132c1332e6f731c9c/icon",
    "chainId": 42161
  },
  "0xf011B036934b58A619D2822d90ecd726126Efdf2": {
    "address": "0xf011B036934b58A619D2822d90ecd726126Efdf2",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf011b036934b58a619d2822d90ecd726126efdf2/icon",
    "chainId": 42161
  },
  "0x884e1dB2Bde9023203Aa900A5f35B87BbAb001B9": {
    "address": "0x884e1dB2Bde9023203Aa900A5f35B87BbAb001B9",
    "name": "Generic Coin",
    "symbol": "GEN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x884e1db2bde9023203aa900a5f35b87bbab001b9/icon",
    "chainId": 42161
  },
  "0xBD80923830B1B122dcE0C446b704621458329F1D": {
    "address": "0xBD80923830B1B122dcE0C446b704621458329F1D",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbd80923830b1b122dce0c446b704621458329f1d/icon",
    "chainId": 42161
  },
  "0xe20B9e246db5a0d21BF9209E4858Bc9A3ff7A034": {
    "address": "0xe20B9e246db5a0d21BF9209E4858Bc9A3ff7A034",
    "name": "Wrapped Banano",
    "symbol": "wBAN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe20b9e246db5a0d21bf9209e4858bc9a3ff7a034/icon",
    "chainId": 42161
  },
  "0xae48b7C8e096896E32D53F10d0Bf89f82ec7b987": {
    "address": "0xae48b7C8e096896E32D53F10d0Bf89f82ec7b987",
    "name": "Fractal Protocol Vault Token",
    "symbol": "USDF",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xae48b7c8e096896e32d53f10d0bf89f82ec7b987/icon",
    "chainId": 42161
  },
  "0xD5A56b510247DB33695b0bEa29992AC6670081ea": {
    "address": "0xD5A56b510247DB33695b0bEa29992AC6670081ea",
    "name": "Goons of Balatroon",
    "symbol": "GOB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd5a56b510247db33695b0bea29992ac6670081ea/icon",
    "chainId": 42161
  },
  "0xBbBe4D4a3d370F478be7f2D3B734591BB1a99d37": {
    "address": "0xBbBe4D4a3d370F478be7f2D3B734591BB1a99d37",
    "name": "VolatileV1 AMM - WETH/rETH",
    "symbol": "vAMM-WETH/rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbbbe4d4a3d370f478be7f2d3b734591bb1a99d37/icon",
    "chainId": 42161
  },
  "0xef261714F7E5ba6b86F4780eb6e3bf26B10729CF": {
    "address": "0xef261714F7E5ba6b86F4780eb6e3bf26B10729CF",
    "name": "White Lotus",
    "symbol": "LOTUS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xef261714f7e5ba6b86f4780eb6e3bf26b10729cf/icon",
    "chainId": 42161
  },
  "0xa7fC98760331409c1FC0177dECF083cE9d5aed87": {
    "address": "0xa7fC98760331409c1FC0177dECF083cE9d5aed87",
    "name": "Moo Ramses MAI-USDC",
    "symbol": "mooRamsesMAI-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa7fc98760331409c1fc0177decf083ce9d5aed87/icon",
    "chainId": 42161
  },
  "0xE342d72B34eA684d0bd3d029347478fe764d40A2": {
    "address": "0xE342d72B34eA684d0bd3d029347478fe764d40A2",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe342d72b34ea684d0bd3d029347478fe764d40a2/icon",
    "chainId": 42161
  },
  "0xE4dff99E7db2b70FbA70d6F843C66FD503e00158": {
    "address": "0xE4dff99E7db2b70FbA70d6F843C66FD503e00158",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe4dff99e7db2b70fba70d6f843c66fd503e00158/icon",
    "chainId": 42161
  },
  "0x244Ae62439C1Ef3187f244d8604ac2c391eF2b53": {
    "address": "0x244Ae62439C1Ef3187f244d8604ac2c391eF2b53",
    "name": "Modular",
    "symbol": "MOD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x244ae62439c1ef3187f244d8604ac2c391ef2b53/icon",
    "chainId": 42161
  },
  "0x7ba861c07d40e3341B901Fd6F418e96E0132E25b": {
    "address": "0x7ba861c07d40e3341B901Fd6F418e96E0132E25b",
    "name": "Stride Staked Atom",
    "symbol": "stATOM",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7ba861c07d40e3341b901fd6f418e96e0132e25b/icon",
    "chainId": 42161
  },
  "0x8F1939AadAeA4fe5203D79051B8AFDe0951aEeBE": {
    "address": "0x8F1939AadAeA4fe5203D79051B8AFDe0951aEeBE",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8f1939aadaea4fe5203d79051b8afde0951aeebe/icon",
    "chainId": 42161
  },
  "0x7C8a1A80FDd00C9Cccd6EbD573E9EcB49BFa2a59": {
    "address": "0x7C8a1A80FDd00C9Cccd6EbD573E9EcB49BFa2a59",
    "name": "AICODE",
    "symbol": "AICODE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7c8a1a80fdd00c9cccd6ebd573e9ecb49bfa2a59/icon",
    "chainId": 42161
  },
  "0x8868e3138E9a7B74aF6d7ddCE71dE35cC60c6073": {
    "address": "0x8868e3138E9a7B74aF6d7ddCE71dE35cC60c6073",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8868e3138e9a7b74af6d7ddce71de35cc60c6073/icon",
    "chainId": 42161
  },
  "0x4e05d153305Bc472e220Ec3F7a7894b38f74741F": {
    "address": "0x4e05d153305Bc472e220Ec3F7a7894b38f74741F",
    "name": "Smart Aliens",
    "symbol": "SAS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4e05d153305bc472e220ec3f7a7894b38f74741f/icon",
    "chainId": 42161
  },
  "0xfb9E5D956D889D91a82737B9bFCDaC1DCE3e1449": {
    "address": "0xfb9E5D956D889D91a82737B9bFCDaC1DCE3e1449",
    "name": "LQTY",
    "symbol": "LQTY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfb9e5d956d889d91a82737b9bfcdac1dce3e1449/icon",
    "chainId": 42161
  },
  "0x37A7bF05807feCD6b1CCE53366059e70E313e4Af": {
    "address": "0x37A7bF05807feCD6b1CCE53366059e70E313e4Af",
    "name": "StableV1 AMM - FRAX/MAI",
    "symbol": "sAMM-FRAX/MAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x37a7bf05807fecd6b1cce53366059e70e313e4af/icon",
    "chainId": 42161
  },
  "0xF9DF075716B2D9B95616341DC6bC64c85e56645c": {
    "address": "0xF9DF075716B2D9B95616341DC6bC64c85e56645c",
    "name": "Mayfair",
    "symbol": "$MAY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf9df075716b2d9b95616341dc6bc64c85e56645c/icon",
    "chainId": 42161
  },
  "0x4D323f77c32EDdC62BF8eAbA11E5C573FD0a2ccd": {
    "address": "0x4D323f77c32EDdC62BF8eAbA11E5C573FD0a2ccd",
    "name": "Moo Sushi DPX-ETH",
    "symbol": "mooSushiDPX-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4d323f77c32eddc62bf8eaba11e5c573fd0a2ccd/icon",
    "chainId": 42161
  },
  "0x98ca8d9FbbF36C588629D458dAd05fbFe832AAdD": {
    "address": "0x98ca8d9FbbF36C588629D458dAd05fbFe832AAdD",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x98ca8d9fbbf36c588629d458dad05fbfe832aadd/icon",
    "chainId": 42161
  },
  "0xeE0b14e8fC86691Cf6eE42B9954985B4cF968534": {
    "address": "0xeE0b14e8fC86691Cf6eE42B9954985B4cF968534",
    "name": "ZenPandaCoin",
    "symbol": "ZPC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xee0b14e8fc86691cf6ee42b9954985b4cf968534/icon",
    "chainId": 42161
  },
  "0x6CDA1D3D092811b2d48F7476adb59A6239CA9b95": {
    "address": "0x6CDA1D3D092811b2d48F7476adb59A6239CA9b95",
    "name": "StaFi",
    "symbol": "rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6cda1d3d092811b2d48f7476adb59a6239ca9b95/icon",
    "chainId": 42161
  },
  "0xaD28940024117B442a9EFB6D0f25C8B59e1c950B": {
    "address": "0xaD28940024117B442a9EFB6D0f25C8B59e1c950B",
    "name": "Balancer Aave v3 Boosted Pool (WETH)",
    "symbol": "bb-a-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xad28940024117b442a9efb6d0f25c8b59e1c950b/icon",
    "chainId": 42161
  },
  "0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487": {
    "address": "0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487",
    "name": "Gravita Debt Token",
    "symbol": "GRAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487/icon",
    "chainId": 42161
  },
  "0x18468b6eBA332285c6d9BB03Fe7fb52e108c4596": {
    "address": "0x18468b6eBA332285c6d9BB03Fe7fb52e108c4596",
    "name": "Static Aave Arbitrum WETH",
    "symbol": "stataArbWETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x18468b6eba332285c6d9bb03fe7fb52e108c4596/icon",
    "chainId": 42161
  },
  "0xB2FA688396F35c93Ba4f054866eF8527902fec07": {
    "address": "0xB2FA688396F35c93Ba4f054866eF8527902fec07",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb2fa688396f35c93ba4f054866ef8527902fec07/icon",
    "chainId": 42161
  },
  "0xeb9153afBAa3A6cFbd4fcE39988Cea786d3F62bb": {
    "address": "0xeb9153afBAa3A6cFbd4fcE39988Cea786d3F62bb",
    "name": "Correlated rAMM - USD+/DAI+",
    "symbol": "crAMM-USD+/DAI+",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeb9153afbaa3a6cfbd4fce39988cea786d3f62bb/icon",
    "chainId": 42161
  },
  "0xB5a628803ee72D82098D4bcaF29a42e63531B441": {
    "address": "0xB5a628803ee72D82098D4bcaF29a42e63531B441",
    "name": "Unstoppable Ecosystem Token",
    "symbol": "UND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb5a628803ee72d82098d4bcaf29a42e63531b441/icon",
    "chainId": 42161
  },
  "0xcBe94D75ec713B7ead84f55620dc3174beEb1CFe": {
    "address": "0xcBe94D75ec713B7ead84f55620dc3174beEb1CFe",
    "name": "FORE Protocol",
    "symbol": "FORE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcbe94d75ec713b7ead84f55620dc3174beeb1cfe/icon",
    "chainId": 42161
  },
  "0x0236fE5972565FA8C4a9f3911DC943Fdf4045714": {
    "address": "0x0236fE5972565FA8C4a9f3911DC943Fdf4045714",
    "name": "VolatileV1 AMM - IDIA/USDC",
    "symbol": "vAMM-IDIA/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0236fe5972565fa8c4a9f3911dc943fdf4045714/icon",
    "chainId": 42161
  },
  "0x9c29C860EfB3c051b772699960C768B78b5aecBc": {
    "address": "0x9c29C860EfB3c051b772699960C768B78b5aecBc",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9c29c860efb3c051b772699960c768b78b5aecbc/icon",
    "chainId": 42161
  },
  "0xD91903D548f19C0FC0a6B9ED09D2F72b4dFe7144": {
    "address": "0xD91903D548f19C0FC0a6B9ED09D2F72b4dFe7144",
    "name": "Impossible Decentralized Incubator Access Token",
    "symbol": "IDIA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd91903d548f19c0fc0a6b9ed09d2f72b4dfe7144/icon",
    "chainId": 42161
  },
  "0xB4ee30dE6BF7e8F9eFBFcC9715021144DEFDe96F": {
    "address": "0xB4ee30dE6BF7e8F9eFBFcC9715021144DEFDe96F",
    "name": "mFERC",
    "symbol": "MFERC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb4ee30de6bf7e8f9efbfcc9715021144defde96f/icon",
    "chainId": 42161
  },
  "0x0594Ec32240C78e056304b4A60f48a67c69179b4": {
    "address": "0x0594Ec32240C78e056304b4A60f48a67c69179b4",
    "name": "Moo SolidLizard ARB-USDC",
    "symbol": "mooSolidLizardARB-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0594ec32240c78e056304b4a60f48a67c69179b4/icon",
    "chainId": 42161
  },
  "0x32Ef0f8aF29F7b67bE6B48A12Ca0E09f1f302035": {
    "address": "0x32Ef0f8aF29F7b67bE6B48A12Ca0E09f1f302035",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32ef0f8af29f7b67be6b48a12ca0e09f1f302035/icon",
    "chainId": 42161
  },
  "0x9cB911Cbb270cAE0d132689cE11c2c52aB2DedBC": {
    "address": "0x9cB911Cbb270cAE0d132689cE11c2c52aB2DedBC",
    "name": "Volatile AMM - ARB/USDC",
    "symbol": "vAMM-ARB/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9cb911cbb270cae0d132689ce11c2c52ab2dedbc/icon",
    "chainId": 42161
  },
  "0x4DAD357726b41bb8932764340ee9108cC5AD33a0": {
    "address": "0x4DAD357726b41bb8932764340ee9108cC5AD33a0",
    "name": "NitroShiba",
    "symbol": "NISHIB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4dad357726b41bb8932764340ee9108cc5ad33a0/icon",
    "chainId": 42161
  },
  "0x97b192198d164C2a1834295e302B713bc32C8F1d": {
    "address": "0x97b192198d164C2a1834295e302B713bc32C8F1d",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x97b192198d164c2a1834295e302b713bc32c8f1d/icon",
    "chainId": 42161
  },
  "0x76193bDC38A039e72053aC5E61f7B6AC74d7b193": {
    "address": "0x76193bDC38A039e72053aC5E61f7B6AC74d7b193",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x76193bdc38a039e72053ac5e61f7b6ac74d7b193/icon",
    "chainId": 42161
  },
  "0x691168C8dF23faeaB4dF89d823F3EA56BA5c3eBc": {
    "address": "0x691168C8dF23faeaB4dF89d823F3EA56BA5c3eBc",
    "name": "LITE",
    "symbol": "LITE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x691168c8df23faeab4df89d823f3ea56ba5c3ebc/icon",
    "chainId": 42161
  },
  "0x847Db21ef9DE627c23d3DfF470af6599b1A30d3f": {
    "address": "0x847Db21ef9DE627c23d3DfF470af6599b1A30d3f",
    "name": "Black Rabbit AI",
    "symbol": "BRAIN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x847db21ef9de627c23d3dff470af6599b1a30d3f/icon",
    "chainId": 42161
  },
  "0xDF1A6Dd4E5b77d7F2143eD73074bE26c806754c5": {
    "address": "0xDF1A6Dd4E5b77d7F2143eD73074bE26c806754c5",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdf1a6dd4e5b77d7f2143ed73074be26c806754c5/icon",
    "chainId": 42161
  },
  "0x662d0f9Ff837A51cF89A1FE7E0882a906dAC08a3": {
    "address": "0x662d0f9Ff837A51cF89A1FE7E0882a906dAC08a3",
    "name": "Jones ETH",
    "symbol": "jETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x662d0f9ff837a51cf89a1fe7e0882a906dac08a3/icon",
    "chainId": 42161
  },
  "0xa52E349dC5f12E50044D717B5191fc1fB12767C5": {
    "address": "0xa52E349dC5f12E50044D717B5191fc1fB12767C5",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa52e349dc5f12e50044d717b5191fc1fb12767c5/icon",
    "chainId": 42161
  },
  "0x0e1E13846E3320B8a471b72080b8cDe86CDEE3c2": {
    "address": "0x0e1E13846E3320B8a471b72080b8cDe86CDEE3c2",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0e1e13846e3320b8a471b72080b8cde86cdee3c2/icon",
    "chainId": 42161
  },
  "0xaa02F15647CF644F446b6F02763b8c8976A19f62": {
    "address": "0xaa02F15647CF644F446b6F02763b8c8976A19f62",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa02f15647cf644f446b6f02763b8c8976a19f62/icon",
    "chainId": 42161
  },
  "0xB6b6491426517147139fF4b159E3f622aaB11F1c": {
    "address": "0xB6b6491426517147139fF4b159E3f622aaB11F1c",
    "name": "Rocket Raccoon",
    "symbol": "RRC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb6b6491426517147139ff4b159e3f622aab11f1c/icon",
    "chainId": 42161
  },
  "0x7B5EB3940021Ec0e8e463D5dBB4B7B09a89DDF96": {
    "address": "0x7B5EB3940021Ec0e8e463D5dBB4B7B09a89DDF96",
    "name": "Wombat Token",
    "symbol": "WOM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7b5eb3940021ec0e8e463d5dbb4b7b09a89ddf96/icon",
    "chainId": 42161
  },
  "0x0d8F04522C5792c7378e39C92aB348f315f4FC4f": {
    "address": "0x0d8F04522C5792c7378e39C92aB348f315f4FC4f",
    "name": "AI Arb ENGLISH",
    "symbol": "AIEN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0d8f04522c5792c7378e39c92ab348f315f4fc4f/icon",
    "chainId": 42161
  },
  "0x05814372E9820C0EBDCBa26d0a7c20655F4ff23F": {
    "address": "0x05814372E9820C0EBDCBa26d0a7c20655F4ff23F",
    "name": "MemePad",
    "symbol": "MEPAD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x05814372e9820c0ebdcba26d0a7c20655f4ff23f/icon",
    "chainId": 42161
  },
  "0xD925C8962bd63DD0a0eE69cE85C2D0789C2785f6": {
    "address": "0xD925C8962bd63DD0a0eE69cE85C2D0789C2785f6",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd925c8962bd63dd0a0ee69ce85c2d0789c2785f6/icon",
    "chainId": 42161
  },
  "0x6475E495Acb6226a70Fce26D2eE0bE2c396A9591": {
    "address": "0x6475E495Acb6226a70Fce26D2eE0bE2c396A9591",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6475e495acb6226a70fce26d2ee0be2c396a9591/icon",
    "chainId": 42161
  },
  "0x6C01242B5e039Ab0CD20d7E7e249920FE03c3cfA": {
    "address": "0x6C01242B5e039Ab0CD20d7E7e249920FE03c3cfA",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6c01242b5e039ab0cd20d7e7e249920fe03c3cfa/icon",
    "chainId": 42161
  },
  "0x6d038130B9b379A373B1D33a29d5904ED1bb9026": {
    "address": "0x6d038130B9b379A373B1D33a29d5904ED1bb9026",
    "name": "Quick Intel",
    "symbol": "QUICKI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6d038130b9b379a373b1d33a29d5904ed1bb9026/icon",
    "chainId": 42161
  },
  "0x5C5d4C49ce120f0058744482027b7B4e9A092f38": {
    "address": "0x5C5d4C49ce120f0058744482027b7B4e9A092f38",
    "name": "XDOGE",
    "symbol": "XDOGE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5c5d4c49ce120f0058744482027b7b4e9a092f38/icon",
    "chainId": 42161
  },
  "0xd52862915de98201bA93a45E73081450075C4E33": {
    "address": "0xd52862915de98201bA93a45E73081450075C4E33",
    "name": "StableV1 AMM - frxETH/sfrxETH",
    "symbol": "sAMM-frxETH/sfrxETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd52862915de98201ba93a45e73081450075c4e33/icon",
    "chainId": 42161
  },
  "0x824bfb47091F787BD7B909d7b458974f499BC635": {
    "address": "0x824bfb47091F787BD7B909d7b458974f499BC635",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x824bfb47091f787bd7b909d7b458974f499bc635/icon",
    "chainId": 42161
  },
  "0x178E029173417b1F9C8bC16DCeC6f697bC323746": {
    "address": "0x178E029173417b1F9C8bC16DCeC6f697bC323746",
    "name": "Balancer 50wstETH-50USDC",
    "symbol": "50WSTETH-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x178e029173417b1f9c8bc16dcec6f697bc323746/icon",
    "chainId": 42161
  },
  "0x894A3abB764A0EF5Da69C62336aC3c15B88bf106": {
    "address": "0x894A3abB764A0EF5Da69C62336aC3c15B88bf106",
    "name": "CHUNKS",
    "symbol": "CHUNKS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x894a3abb764a0ef5da69c62336ac3c15b88bf106/icon",
    "chainId": 42161
  },
  "0x91E13d076aCb6BaaD2df435Dd0e10AdF1b19c8D6": {
    "address": "0x91E13d076aCb6BaaD2df435Dd0e10AdF1b19c8D6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x91e13d076acb6baad2df435dd0e10adf1b19c8d6/icon",
    "chainId": 42161
  },
  "0x9c5397dBCD8B039c5fc8b1Bc2602fA2767567149": {
    "address": "0x9c5397dBCD8B039c5fc8b1Bc2602fA2767567149",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9c5397dbcd8b039c5fc8b1bc2602fa2767567149/icon",
    "chainId": 42161
  },
  "0xC385267AdfB56Fa7608C3D509D368fD84C033613": {
    "address": "0xC385267AdfB56Fa7608C3D509D368fD84C033613",
    "name": "Tulip Game",
    "symbol": "TLIP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc385267adfb56fa7608c3d509d368fd84c033613/icon",
    "chainId": 42161
  },
  "0x47D6716cCe5741f3A44ABBa29FF59aFd29dDEA99": {
    "address": "0x47D6716cCe5741f3A44ABBa29FF59aFd29dDEA99",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x47d6716cce5741f3a44abba29ff59afd29ddea99/icon",
    "chainId": 42161
  },
  "0x8aBfa6a4F4B9865b0e7ACfDCe1839A2584636d06": {
    "address": "0x8aBfa6a4F4B9865b0e7ACfDCe1839A2584636d06",
    "name": "MAGIKAL.ai",
    "symbol": "MGKL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8abfa6a4f4b9865b0e7acfdce1839a2584636d06/icon",
    "chainId": 42161
  },
  "0xbb1554b79D49327F6f000fb8057a972BFee4Afca": {
    "address": "0xbb1554b79D49327F6f000fb8057a972BFee4Afca",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbb1554b79d49327f6f000fb8057a972bfee4afca/icon",
    "chainId": 42161
  },
  "0x0FC0c323Cf76E188654D63D62e668caBeC7a525b": {
    "address": "0x0FC0c323Cf76E188654D63D62e668caBeC7a525b",
    "name": "Lumerin",
    "symbol": "LMR",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0fc0c323cf76e188654d63d62e668cabec7a525b/icon",
    "chainId": 42161
  },
  "0xeA80D98658935e97703D4f52b3a24DE2eBC4f5Bb": {
    "address": "0xeA80D98658935e97703D4f52b3a24DE2eBC4f5Bb",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xea80d98658935e97703d4f52b3a24de2ebc4f5bb/icon",
    "chainId": 42161
  },
  "0x6BB45804e7D5375E8fbEEE505392F5ecC4E76C95": {
    "address": "0x6BB45804e7D5375E8fbEEE505392F5ecC4E76C95",
    "name": "Saint Inu",
    "symbol": "SAINT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6bb45804e7d5375e8fbeee505392f5ecc4e76c95/icon",
    "chainId": 42161
  },
  "0xFA296FcA3c7DBa4a92A42Ec0B5E2138DA3b29050": {
    "address": "0xFA296FcA3c7DBa4a92A42Ec0B5E2138DA3b29050",
    "name": "Shibai Token",
    "symbol": "shibai",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfa296fca3c7dba4a92a42ec0b5e2138da3b29050/icon",
    "chainId": 42161
  },
  "0x0cBD6fAdcF8096cC9A43d90B45F65826102e3eCE": {
    "address": "0x0cBD6fAdcF8096cC9A43d90B45F65826102e3eCE",
    "name": "CheckDot",
    "symbol": "CDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0cbd6fadcf8096cc9a43d90b45f65826102e3ece/icon",
    "chainId": 42161
  },
  "0xe8EE01aE5959D3231506FcDeF2d5F3E85987a39c": {
    "address": "0xe8EE01aE5959D3231506FcDeF2d5F3E85987a39c",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe8ee01ae5959d3231506fcdef2d5f3e85987a39c/icon",
    "chainId": 42161
  },
  "0xc61b6c8a0B346b3c090378c8159fAD3D3C57261C": {
    "address": "0xc61b6c8a0B346b3c090378c8159fAD3D3C57261C",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc61b6c8a0b346b3c090378c8159fad3d3c57261c/icon",
    "chainId": 42161
  },
  "0x1395E41Cf62E35753A8E7EF1f7DfC00964D6d117": {
    "address": "0x1395E41Cf62E35753A8E7EF1f7DfC00964D6d117",
    "name": "OBMANSHIK TOKEN",
    "symbol": "OBMANSHIK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1395e41cf62e35753a8e7ef1f7dfc00964d6d117/icon",
    "chainId": 42161
  },
  "0x47ECF602a62BaF7d4e6b30FE3E8dD45BB8cfFadc": {
    "address": "0x47ECF602a62BaF7d4e6b30FE3E8dD45BB8cfFadc",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x47ecf602a62baf7d4e6b30fe3e8dd45bb8cffadc/icon",
    "chainId": 42161
  },
  "0x3d2D453B56F4C09950804fD5E42f12a4A237c5e6": {
    "address": "0x3d2D453B56F4C09950804fD5E42f12a4A237c5e6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3d2d453b56f4c09950804fd5e42f12a4a237c5e6/icon",
    "chainId": 42161
  },
  "0xDC8184ba488e949815d4AAfb35B3c56ad03B4179": {
    "address": "0xDC8184ba488e949815d4AAfb35B3c56ad03B4179",
    "name": "Roseon",
    "symbol": "ROSX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdc8184ba488e949815d4aafb35b3c56ad03b4179/icon",
    "chainId": 42161
  },
  "0xE94C80E7433d5053AeC324B41ed5400174743302": {
    "address": "0xE94C80E7433d5053AeC324B41ed5400174743302",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe94c80e7433d5053aec324b41ed5400174743302/icon",
    "chainId": 42161
  },
  "0x47ff6facEE1B0E136C88Ed1A7393691Ed794BD59": {
    "address": "0x47ff6facEE1B0E136C88Ed1A7393691Ed794BD59",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x47ff6facee1b0e136c88ed1a7393691ed794bd59/icon",
    "chainId": 42161
  },
  "0x7D86F1eafF29F076576b2Ff09CE3bcC7533fD2C5": {
    "address": "0x7D86F1eafF29F076576b2Ff09CE3bcC7533fD2C5",
    "name": "Risitas Coin",
    "symbol": "RISITA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7d86f1eaff29f076576b2ff09ce3bcc7533fd2c5/icon",
    "chainId": 42161
  },
  "0x6Aa395F06986ea4eFe0a4630C7865C1eB08D5e7e": {
    "address": "0x6Aa395F06986ea4eFe0a4630C7865C1eB08D5e7e",
    "name": "Jarvis Reward Token",
    "symbol": "JRT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6aa395f06986ea4efe0a4630c7865c1eb08d5e7e/icon",
    "chainId": 42161
  },
  "0xc5fFd083B983AAF823a9b485b207F898ed2f32DC": {
    "address": "0xc5fFd083B983AAF823a9b485b207F898ed2f32DC",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc5ffd083b983aaf823a9b485b207f898ed2f32dc/icon",
    "chainId": 42161
  },
  "0xB827710314A05BCBeE9180E11c2abE5823289422": {
    "address": "0xB827710314A05BCBeE9180E11c2abE5823289422",
    "name": "Abachi",
    "symbol": "ABI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb827710314a05bcbee9180e11c2abe5823289422/icon",
    "chainId": 42161
  },
  "0x50E401255275dc405A99d3281f396cCa681eEa9d": {
    "address": "0x50E401255275dc405A99d3281f396cCa681eEa9d",
    "name": "Kortana",
    "symbol": "KORA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x50e401255275dc405a99d3281f396cca681eea9d/icon",
    "chainId": 42161
  },
  "0x09ad12552ec45f82bE90B38dFE7b06332A680864": {
    "address": "0x09ad12552ec45f82bE90B38dFE7b06332A680864",
    "name": "Adamant Token (Arbitrum)",
    "symbol": "ARBY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x09ad12552ec45f82be90b38dfe7b06332a680864/icon",
    "chainId": 42161
  },
  "0x954ac1c73e16c77198e83C088aDe88f6223F3d44": {
    "address": "0x954ac1c73e16c77198e83C088aDe88f6223F3d44",
    "name": "LeverageInu",
    "symbol": "LEVI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x954ac1c73e16c77198e83c088ade88f6223f3d44/icon",
    "chainId": 42161
  },
  "0x20D80Ef4E6D8f9d40137849EE3b5f08ddD32680a": {
    "address": "0x20D80Ef4E6D8f9d40137849EE3b5f08ddD32680a",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x20d80ef4e6d8f9d40137849ee3b5f08ddd32680a/icon",
    "chainId": 42161
  },
  "0xd477319386200598734B817A861709D93bf081B2": {
    "address": "0xd477319386200598734B817A861709D93bf081B2",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd477319386200598734b817a861709d93bf081b2/icon",
    "chainId": 42161
  },
  "0xE879cf236D541EDFB2eD80d48A6D93ee54c98A76": {
    "address": "0xE879cf236D541EDFB2eD80d48A6D93ee54c98A76",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe879cf236d541edfb2ed80d48a6d93ee54c98a76/icon",
    "chainId": 42161
  },
  "0xDBf5c47eA7bC6384eC8b8e60CADf885e736bcc09": {
    "address": "0xDBf5c47eA7bC6384eC8b8e60CADf885e736bcc09",
    "name": "VolatileV1 AMM - YFX/USDC",
    "symbol": "vAMM-YFX/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdbf5c47ea7bc6384ec8b8e60cadf885e736bcc09/icon",
    "chainId": 42161
  },
  "0x3A18dcC9745eDcD1Ef33ecB93b0b6eBA5671e7Ca": {
    "address": "0x3A18dcC9745eDcD1Ef33ecB93b0b6eBA5671e7Ca",
    "name": "Kujira native asset",
    "symbol": "KUJI",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3a18dcc9745edcd1ef33ecb93b0b6eba5671e7ca/icon",
    "chainId": 42161
  },
  "0x76CE14237110C865F431e18F91fC1B225fb6fE99": {
    "address": "0x76CE14237110C865F431e18F91fC1B225fb6fE99",
    "name": "POT Token",
    "symbol": "POT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x76ce14237110c865f431e18f91fc1b225fb6fe99/icon",
    "chainId": 42161
  },
  "0xe7f6C3c1F0018E4C08aCC52965e5cbfF99e34A44": {
    "address": "0xe7f6C3c1F0018E4C08aCC52965e5cbfF99e34A44",
    "name": "Plutus JONES",
    "symbol": "plsJONES",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe7f6c3c1f0018e4c08acc52965e5cbff99e34a44/icon",
    "chainId": 42161
  },
  "0xC774924Edb53658241dB89924fA7BC704f25fc52": {
    "address": "0xC774924Edb53658241dB89924fA7BC704f25fc52",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc774924edb53658241db89924fa7bc704f25fc52/icon",
    "chainId": 42161
  },
  "0x64C5f68D70ec755B36059c4b6a47056940be6902": {
    "address": "0x64C5f68D70ec755B36059c4b6a47056940be6902",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x64c5f68d70ec755b36059c4b6a47056940be6902/icon",
    "chainId": 42161
  },
  "0x3C9BcBF7e2ea11bd5bcC1B328c795d421d417406": {
    "address": "0x3C9BcBF7e2ea11bd5bcC1B328c795d421d417406",
    "name": "Arbitrum Carbon Utility Token",
    "symbol": "aCUT",
    "decimals": 5,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3c9bcbf7e2ea11bd5bcc1b328c795d421d417406/icon",
    "chainId": 42161
  },
  "0x4425742F1EC8D98779690b5A3A6276Db85Ddc01A": {
    "address": "0x4425742F1EC8D98779690b5A3A6276Db85Ddc01A",
    "name": "The Doge NFT",
    "symbol": "DOG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4425742f1ec8d98779690b5a3a6276db85ddc01a/icon",
    "chainId": 42161
  },
  "0xd302119B5C46d504D0b3534312e56eC321976251": {
    "address": "0xd302119B5C46d504D0b3534312e56eC321976251",
    "name": "VolatileV1 AMM - ARB/USDC",
    "symbol": "vAMM-ARB/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd302119b5c46d504d0b3534312e56ec321976251/icon",
    "chainId": 42161
  },
  "0x0c59173C17d5C607B291bF470C5Da7D2004D7Af5": {
    "address": "0x0c59173C17d5C607B291bF470C5Da7D2004D7Af5",
    "name": "Volatile rAMM - TAROT/WETH",
    "symbol": "vrAMM-TAROT/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c59173c17d5c607b291bf470c5da7d2004d7af5/icon",
    "chainId": 42161
  },
  "0xFdad8EDC724277e975F4955d288C6EB5b20A3146": {
    "address": "0xFdad8EDC724277e975F4955d288C6EB5b20A3146",
    "name": "Nulswap",
    "symbol": "NSWAP",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfdad8edc724277e975f4955d288c6eb5b20a3146/icon",
    "chainId": 42161
  },
  "0x13278cD824D33A7aDB9f0a9A84ACA7C0D2DEEBf7": {
    "address": "0x13278cD824D33A7aDB9f0a9A84ACA7C0D2DEEBf7",
    "name": "Tarot",
    "symbol": "TAROT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x13278cd824d33a7adb9f0a9a84aca7c0d2deebf7/icon",
    "chainId": 42161
  },
  "0x644192291cc835A93d6330b24EA5f5FEdD0eEF9e": {
    "address": "0x644192291cc835A93d6330b24EA5f5FEdD0eEF9e",
    "name": "AllianceBlock Nexera Token",
    "symbol": "NXRA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x644192291cc835a93d6330b24ea5f5fedd0eef9e/icon",
    "chainId": 42161
  },
  "0x10A12127867d3885Ac64b51cc91a67c907eE51db": {
    "address": "0x10A12127867d3885Ac64b51cc91a67c907eE51db",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x10a12127867d3885ac64b51cc91a67c907ee51db/icon",
    "chainId": 42161
  },
  "0xd306c21Da241fB0eE03C658Ceaa75daa8fE78658": {
    "address": "0xd306c21Da241fB0eE03C658Ceaa75daa8fE78658",
    "name": "VolatileV1 AMM - IBEX/WETH",
    "symbol": "vAMM-IBEX/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd306c21da241fb0ee03c658ceaa75daa8fe78658/icon",
    "chainId": 42161
  },
  "0x149f3dDeB5FF9bE7342D07C35D6dA19Df3F790af": {
    "address": "0x149f3dDeB5FF9bE7342D07C35D6dA19Df3F790af",
    "name": "Moo Sushi SPELL-WETH",
    "symbol": "mooSushiSPELL-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x149f3ddeb5ff9be7342d07c35d6da19df3f790af/icon",
    "chainId": 42161
  },
  "0xFE5A433bceE3ac8147695521Aa383F41C116A10D": {
    "address": "0xFE5A433bceE3ac8147695521Aa383F41C116A10D",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfe5a433bcee3ac8147695521aa383f41c116a10d/icon",
    "chainId": 42161
  },
  "0x2F320aE219ACDE7671427a881bA4aa0449595314": {
    "address": "0x2F320aE219ACDE7671427a881bA4aa0449595314",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2f320ae219acde7671427a881ba4aa0449595314/icon",
    "chainId": 42161
  },
  "0x5084864CE2C2e1A86B70798D9d8709abAcfCbE29": {
    "address": "0x5084864CE2C2e1A86B70798D9d8709abAcfCbE29",
    "name": "PEPE CLUB",
    "symbol": "PEPEC",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5084864ce2c2e1a86b70798d9d8709abacfcbe29/icon",
    "chainId": 42161
  },
  "0x5293c6CA56b8941040b8D18f557dFA82cF520216": {
    "address": "0x5293c6CA56b8941040b8D18f557dFA82cF520216",
    "name": "Radiant interest bearing DAI",
    "symbol": "rDAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5293c6ca56b8941040b8d18f557dfa82cf520216/icon",
    "chainId": 42161
  },
  "0xA6efAE0C9293B4eE340De31022900bA747eaA92D": {
    "address": "0xA6efAE0C9293B4eE340De31022900bA747eaA92D",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa6efae0c9293b4ee340de31022900ba747eaa92d/icon",
    "chainId": 42161
  },
  "0xE06E99cA3AaEeaD5431e921E8E521E3D4e86B5c4": {
    "address": "0xE06E99cA3AaEeaD5431e921E8E521E3D4e86B5c4",
    "name": "Smol",
    "symbol": "SMOL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe06e99ca3aaeead5431e921e8e521e3d4e86b5c4/icon",
    "chainId": 42161
  },
  "0xF1A82bfA7fCEb8B8741e7E04a6B8EfD348cA6393": {
    "address": "0xF1A82bfA7fCEb8B8741e7E04a6B8EfD348cA6393",
    "name": "AISHIB",
    "symbol": "AISHIB",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf1a82bfa7fceb8b8741e7e04a6b8efd348ca6393/icon",
    "chainId": 42161
  },
  "0xD5954c3084a1cCd70B4dA011E67760B8e78aeE84": {
    "address": "0xD5954c3084a1cCd70B4dA011E67760B8e78aeE84",
    "name": "ArbiDex Token",
    "symbol": "ARX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd5954c3084a1ccd70b4da011e67760b8e78aee84/icon",
    "chainId": 42161
  },
  "0x5b69430721B580bB502af14d07001aC5de10aC6a": {
    "address": "0x5b69430721B580bB502af14d07001aC5de10aC6a",
    "name": "VolatileV1 AMM - WBTC/WETH",
    "symbol": "vAMM-WBTC/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5b69430721b580bb502af14d07001ac5de10ac6a/icon",
    "chainId": 42161
  },
  "0xc4270Db02259D801Aac274F461BF59F492AC0Db9": {
    "address": "0xc4270Db02259D801Aac274F461BF59F492AC0Db9",
    "name": "ExNetwork Community Token",
    "symbol": "EXNT",
    "decimals": 16,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc4270db02259d801aac274f461bf59f492ac0db9/icon",
    "chainId": 42161
  },
  "0x569deb225441FD18BdE18aED53E2EC7Eb4e10D93": {
    "address": "0x569deb225441FD18BdE18aED53E2EC7Eb4e10D93",
    "name": "YFX",
    "symbol": "YFX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x569deb225441fd18bde18aed53e2ec7eb4e10d93/icon",
    "chainId": 42161
  },
  "0xfcDD5a02C611ba6Fe2802f885281500EC95805d7": {
    "address": "0xfcDD5a02C611ba6Fe2802f885281500EC95805d7",
    "name": "Moo Sushi WBTC-WETH",
    "symbol": "mooSushiWBTC-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfcdd5a02c611ba6fe2802f885281500ec95805d7/icon",
    "chainId": 42161
  },
  "0xB750E23497d942F418FCc80D1EA796ac96ed879d": {
    "address": "0xB750E23497d942F418FCc80D1EA796ac96ed879d",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb750e23497d942f418fcc80d1ea796ac96ed879d/icon",
    "chainId": 42161
  },
  "0x2Ac7E48bA0D7fd2AB9C5c00747B106141074013F": {
    "address": "0x2Ac7E48bA0D7fd2AB9C5c00747B106141074013F",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2ac7e48ba0d7fd2ab9c5c00747b106141074013f/icon",
    "chainId": 42161
  },
  "0x7050A8908E2a60899D8788015148241f0993a3FD": {
    "address": "0x7050A8908E2a60899D8788015148241f0993a3FD",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7050a8908e2a60899d8788015148241f0993a3fd/icon",
    "chainId": 42161
  },
  "0x6F5401c53e2769c858665621d22DDBF53D8d27c5": {
    "address": "0x6F5401c53e2769c858665621d22DDBF53D8d27c5",
    "name": "Connect Financial",
    "symbol": "CNFI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6f5401c53e2769c858665621d22ddbf53d8d27c5/icon",
    "chainId": 42161
  },
  "0xdD389517320720F09db75D20A27d8A2cFa5f8568": {
    "address": "0xdD389517320720F09db75D20A27d8A2cFa5f8568",
    "name": "AI Card Render",
    "symbol": "ACR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdd389517320720f09db75d20a27d8a2cfa5f8568/icon",
    "chainId": 42161
  },
  "0xB98058640970d8Aa7BbcE3B067B2D63C14143786": {
    "address": "0xB98058640970d8Aa7BbcE3B067B2D63C14143786",
    "name": "Baby Arbitrum",
    "symbol": "BARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb98058640970d8aa7bbce3b067b2d63c14143786/icon",
    "chainId": 42161
  },
  "0x498D4C5910f8384a4d8F200D0339016Ea1EBaB32": {
    "address": "0x498D4C5910f8384a4d8F200D0339016Ea1EBaB32",
    "name": "VolatileV1 AMM - WETH/ARKEN",
    "symbol": "vAMM-WETH/ARKEN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x498d4c5910f8384a4d8f200d0339016ea1ebab32/icon",
    "chainId": 42161
  },
  "0xe235E8dFa8ea3b7fFFF1C922fA4928bFB7ad964a": {
    "address": "0xe235E8dFa8ea3b7fFFF1C922fA4928bFB7ad964a",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe235e8dfa8ea3b7ffff1c922fa4928bfb7ad964a/icon",
    "chainId": 42161
  },
  "0xEf47CCC71EC8941B67DC679D1a5f78fACfD0ec3C": {
    "address": "0xEf47CCC71EC8941B67DC679D1a5f78fACfD0ec3C",
    "name": "Radiant interest bearing USDT",
    "symbol": "rUSDT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xef47ccc71ec8941b67dc679d1a5f78facfd0ec3c/icon",
    "chainId": 42161
  },
  "0x4B1AC748eB93457aFb615F035737a5a2383c1232": {
    "address": "0x4B1AC748eB93457aFb615F035737a5a2383c1232",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4b1ac748eb93457afb615f035737a5a2383c1232/icon",
    "chainId": 42161
  },
  "0x9842989969687f7d249d01Cae1D2ff6b7b6b6D35": {
    "address": "0x9842989969687f7d249d01Cae1D2ff6b7b6b6D35",
    "name": "New Crypto Space",
    "symbol": "CRYPTO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9842989969687f7d249d01cae1d2ff6b7b6b6d35/icon",
    "chainId": 42161
  },
  "0x5Fd71280b6385157b291b9962f22153FC9E79000": {
    "address": "0x5Fd71280b6385157b291b9962f22153FC9E79000",
    "name": "GarbiProtocol",
    "symbol": "GRB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5fd71280b6385157b291b9962f22153fc9e79000/icon",
    "chainId": 42161
  },
  "0x5806AA266013D733db093F8A74dA733A081f989a": {
    "address": "0x5806AA266013D733db093F8A74dA733A081f989a",
    "name": "The Wild West",
    "symbol": "WILD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5806aa266013d733db093f8a74da733a081f989a/icon",
    "chainId": 42161
  },
  "0xb6f8E925DF16Db713c4c235AbbEBA8B24e59B81C": {
    "address": "0xb6f8E925DF16Db713c4c235AbbEBA8B24e59B81C",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb6f8e925df16db713c4c235abbeba8b24e59b81c/icon",
    "chainId": 42161
  },
  "0x70Df9Dd83be2a9F9Fcc58Dd7C00d032d007b7859": {
    "address": "0x70Df9Dd83be2a9F9Fcc58Dd7C00d032d007b7859",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x70df9dd83be2a9f9fcc58dd7c00d032d007b7859/icon",
    "chainId": 42161
  },
  "0x7c6cd2c431b09aAff811BfBB2316461c1DB60195": {
    "address": "0x7c6cd2c431b09aAff811BfBB2316461c1DB60195",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7c6cd2c431b09aaff811bfbb2316461c1db60195/icon",
    "chainId": 42161
  },
  "0x2C2Aa730C0A3f56590FC57568869A3345b803Cfa": {
    "address": "0x2C2Aa730C0A3f56590FC57568869A3345b803Cfa",
    "name": "Project X",
    "symbol": "X",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2c2aa730c0a3f56590fc57568869a3345b803cfa/icon",
    "chainId": 42161
  },
  "0x5a198f608D33F4Af8D7AD8e16295913Dfe9fd14A": {
    "address": "0x5a198f608D33F4Af8D7AD8e16295913Dfe9fd14A",
    "name": "HODL",
    "symbol": "HODL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5a198f608d33f4af8d7ad8e16295913dfe9fd14a/icon",
    "chainId": 42161
  },
  "0xeD3fB761414DA74b74F33e5c5a1f78104b188DfC": {
    "address": "0xeD3fB761414DA74b74F33e5c5a1f78104b188DfC",
    "name": "ArbiNYAN",
    "symbol": "NYAN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xed3fb761414da74b74f33e5c5a1f78104b188dfc/icon",
    "chainId": 42161
  },
  "0x052f7890E50fb5b921BCAb3B10B79a58A3B9d40f": {
    "address": "0x052f7890E50fb5b921BCAb3B10B79a58A3B9d40f",
    "name": "Correlated rAMM - MAI/DOLA",
    "symbol": "crAMM-MAI/DOLA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x052f7890e50fb5b921bcab3b10b79a58a3b9d40f/icon",
    "chainId": 42161
  },
  "0x9547F9dA8142d24207e7054a57e569DB8D682f76": {
    "address": "0x9547F9dA8142d24207e7054a57e569DB8D682f76",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9547f9da8142d24207e7054a57e569db8d682f76/icon",
    "chainId": 42161
  },
  "0x8a98640ebAfAE04Ab011A2BD7cDa46B0384b4Bd0": {
    "address": "0x8a98640ebAfAE04Ab011A2BD7cDa46B0384b4Bd0",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8a98640ebafae04ab011a2bd7cda46b0384b4bd0/icon",
    "chainId": 42161
  },
  "0x88F3C911190A2b6459345872c363371F3dFA72b6": {
    "address": "0x88F3C911190A2b6459345872c363371F3dFA72b6",
    "name": "Hamburglar Token",
    "symbol": "HAMBURGLAR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x88f3c911190a2b6459345872c363371f3dfa72b6/icon",
    "chainId": 42161
  },
  "0xB5B5b428e4DE365F809CeD8271D202449e5c2F72": {
    "address": "0xB5B5b428e4DE365F809CeD8271D202449e5c2F72",
    "name": "BRUH",
    "symbol": "BRUH",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb5b5b428e4de365f809ced8271d202449e5c2f72/icon",
    "chainId": 42161
  },
  "0x66C279130a5D253df72948fE2187972226605594": {
    "address": "0x66C279130a5D253df72948fE2187972226605594",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x66c279130a5d253df72948fe2187972226605594/icon",
    "chainId": 42161
  },
  "0x38978ED6B33Bb3D23BFd5511f713E4B14CcBCea1": {
    "address": "0x38978ED6B33Bb3D23BFd5511f713E4B14CcBCea1",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x38978ed6b33bb3d23bfd5511f713e4b14ccbcea1/icon",
    "chainId": 42161
  },
  "0xBf62cA5BD5865AfC38897A4F3Bb07c000781334e": {
    "address": "0xBf62cA5BD5865AfC38897A4F3Bb07c000781334e",
    "name": "SPONGE BOB",
    "symbol": "SPONGE BOB",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbf62ca5bd5865afc38897a4f3bb07c000781334e/icon",
    "chainId": 42161
  },
  "0x1e0a31825dd82559A97027B3E8867BA79e894b36": {
    "address": "0x1e0a31825dd82559A97027B3E8867BA79e894b36",
    "name": "Mini Pepe Coin",
    "symbol": "MINIPEPE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1e0a31825dd82559a97027b3e8867ba79e894b36/icon",
    "chainId": 42161
  },
  "0x2524A6F09baa306B9e3b70E6316B018A08e4Fb3b": {
    "address": "0x2524A6F09baa306B9e3b70E6316B018A08e4Fb3b",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2524a6f09baa306b9e3b70e6316b018a08e4fb3b/icon",
    "chainId": 42161
  },
  "0x62FdDfC2D4b35aDec79c6082CA2894eAb01aC0db": {
    "address": "0x62FdDfC2D4b35aDec79c6082CA2894eAb01aC0db",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x62fddfc2d4b35adec79c6082ca2894eab01ac0db/icon",
    "chainId": 42161
  },
  "0x088F6dCDe862781db7b01fEB67afd265aBbC6d90": {
    "address": "0x088F6dCDe862781db7b01fEB67afd265aBbC6d90",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x088f6dcde862781db7b01feb67afd265abbc6d90/icon",
    "chainId": 42161
  },
  "0xF80D589b3Dbe130c270a69F1a69D050f268786Df": {
    "address": "0xF80D589b3Dbe130c270a69F1a69D050f268786Df",
    "name": "Flux",
    "symbol": "FLUX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf80d589b3dbe130c270a69f1a69d050f268786df/icon",
    "chainId": 42161
  },
  "0x2A35C341F4dcF2d18e0FB38E0dF50e8a47Af1368": {
    "address": "0x2A35C341F4dcF2d18e0FB38E0dF50e8a47Af1368",
    "name": "Arbitrum Pad",
    "symbol": "ARBPAD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2a35c341f4dcf2d18e0fb38e0df50e8a47af1368/icon",
    "chainId": 42161
  },
  "0xA2F1C1B52E1b7223825552343297Dc68a29ABecC": {
    "address": "0xA2F1C1B52E1b7223825552343297Dc68a29ABecC",
    "name": "VolatileV1 AMM - WETH/USDC",
    "symbol": "vAMM-WETH/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa2f1c1b52e1b7223825552343297dc68a29abecc/icon",
    "chainId": 42161
  },
  "0xa2B8Dcc7E7E832d76F69a3a296F8B8081b796201": {
    "address": "0xa2B8Dcc7E7E832d76F69a3a296F8B8081b796201",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa2b8dcc7e7e832d76f69a3a296f8b8081b796201/icon",
    "chainId": 42161
  },
  "0xBbD7fF1728963A5Eb582d26ea90290F84E89bd66": {
    "address": "0xBbD7fF1728963A5Eb582d26ea90290F84E89bd66",
    "name": "StableV1 AMM - DOLA/USD+",
    "symbol": "sAMM-DOLA/USD+",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbbd7ff1728963a5eb582d26ea90290f84e89bd66/icon",
    "chainId": 42161
  },
  "0x06a132318C1d10565Bf1f5Fb55c9bD24d3Bf5aC7": {
    "address": "0x06a132318C1d10565Bf1f5Fb55c9bD24d3Bf5aC7",
    "name": "Arbitum AI Token",
    "symbol": "ArbAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x06a132318c1d10565bf1f5fb55c9bd24d3bf5ac7/icon",
    "chainId": 42161
  },
  "0x62893c6e129475DBFA412a91591Db25FEFf28cB2": {
    "address": "0x62893c6e129475DBFA412a91591Db25FEFf28cB2",
    "name": "Arbitrum King Doge",
    "symbol": "AKDOGE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x62893c6e129475dbfa412a91591db25feff28cb2/icon",
    "chainId": 42161
  },
  "0x9aC09266B68a8Fea081C232e54fA31526E740570": {
    "address": "0x9aC09266B68a8Fea081C232e54fA31526E740570",
    "name": "VolatileV1 AMM - RDNT/WETH",
    "symbol": "vAMM-RDNT/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9ac09266b68a8fea081c232e54fa31526e740570/icon",
    "chainId": 42161
  },
  "0x3F6253767208aAf70071d563403C8023809d52FF": {
    "address": "0x3F6253767208aAf70071d563403C8023809d52FF",
    "name": "Correlated rAMM - FRAX/MAI",
    "symbol": "crAMM-FRAX/MAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3f6253767208aaf70071d563403c8023809d52ff/icon",
    "chainId": 42161
  },
  "0x32cbC0b0A02a43aD8f8a58444d203B9DeEB81E27": {
    "address": "0x32cbC0b0A02a43aD8f8a58444d203B9DeEB81E27",
    "name": "Stable Pair - USDT/USDC",
    "symbol": "sAMM-USDT/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32cbc0b0a02a43ad8f8a58444d203b9deeb81e27/icon",
    "chainId": 42161
  },
  "0x4F137f5b3756Cc46B0fafC62bb47B4c84E6Cef68": {
    "address": "0x4F137f5b3756Cc46B0fafC62bb47B4c84E6Cef68",
    "name": "Birdie Token",
    "symbol": "BIRDIE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4f137f5b3756cc46b0fafc62bb47b4c84e6cef68/icon",
    "chainId": 42161
  },
  "0xB6314b58d8De5B6aebd0045c55A385ca0334075a": {
    "address": "0xB6314b58d8De5B6aebd0045c55A385ca0334075a",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb6314b58d8de5b6aebd0045c55a385ca0334075a/icon",
    "chainId": 42161
  },
  "0x3feBfFf2d6240B902E3D41888C92BCBdf8A2C222": {
    "address": "0x3feBfFf2d6240B902E3D41888C92BCBdf8A2C222",
    "name": "Taikula Coin",
    "symbol": "Taikula",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3febfff2d6240b902e3d41888c92bcbdf8a2c222/icon",
    "chainId": 42161
  },
  "0xCf2fe24dEF7141A5BA87597b144817FaDb070E15": {
    "address": "0xCf2fe24dEF7141A5BA87597b144817FaDb070E15",
    "name": "CHEESE",
    "symbol": "CHEESE",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcf2fe24def7141a5ba87597b144817fadb070e15/icon",
    "chainId": 42161
  },
  "0x75C746bf7f229BE46915894cbdEeE7023B9e709f": {
    "address": "0x75C746bf7f229BE46915894cbdEeE7023B9e709f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x75c746bf7f229be46915894cbdeee7023b9e709f/icon",
    "chainId": 42161
  },
  "0x1FAe2A29940015632f2a6CE006dFA7E3225515A7": {
    "address": "0x1FAe2A29940015632f2a6CE006dFA7E3225515A7",
    "name": "Nitro Floki",
    "symbol": "NIFLOKI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1fae2a29940015632f2a6ce006dfa7e3225515a7/icon",
    "chainId": 42161
  },
  "0x43e7254962B78edf387106d3Ac0af05C87aB2651": {
    "address": "0x43e7254962B78edf387106d3Ac0af05C87aB2651",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x43e7254962b78edf387106d3ac0af05c87ab2651/icon",
    "chainId": 42161
  },
  "0x2CF707a183bF9eC61e6ccf3deb632355a2A12685": {
    "address": "0x2CF707a183bF9eC61e6ccf3deb632355a2A12685",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2cf707a183bf9ec61e6ccf3deb632355a2a12685/icon",
    "chainId": 42161
  },
  "0xdB58bA3B74CBBa91E80F8329Ff9A5b19036EC3dF": {
    "address": "0xdB58bA3B74CBBa91E80F8329Ff9A5b19036EC3dF",
    "name": "VolatileV1 AMM - Y2K/WETH",
    "symbol": "vAMM-Y2K/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdb58ba3b74cbba91e80f8329ff9a5b19036ec3df/icon",
    "chainId": 42161
  },
  "0x09090e22118b375f2c7b95420c04414E4bf68e1A": {
    "address": "0x09090e22118b375f2c7b95420c04414E4bf68e1A",
    "name": "Beluga Token",
    "symbol": "BELA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x09090e22118b375f2c7b95420c04414e4bf68e1a/icon",
    "chainId": 42161
  },
  "0x93c157932E5649E794Df8999714af8690226A1c9": {
    "address": "0x93c157932E5649E794Df8999714af8690226A1c9",
    "name": "Dragon Arena Arbitrum",
    "symbol": "DRA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x93c157932e5649e794df8999714af8690226a1c9/icon",
    "chainId": 42161
  },
  "0x0A24982c2A428BF280CB401585ae3081CBdE5708": {
    "address": "0x0A24982c2A428BF280CB401585ae3081CBdE5708",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0a24982c2a428bf280cb401585ae3081cbde5708/icon",
    "chainId": 42161
  },
  "0x11EECDBD8f2D670016D061E4c064072E6158Ede2": {
    "address": "0x11EECDBD8f2D670016D061E4c064072E6158Ede2",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x11eecdbd8f2d670016d061e4c064072e6158ede2/icon",
    "chainId": 42161
  },
  "0xB4E48e494C314484009c7B33b5B97d0db07f530C": {
    "address": "0xB4E48e494C314484009c7B33b5B97d0db07f530C",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb4e48e494c314484009c7b33b5b97d0db07f530c/icon",
    "chainId": 42161
  },
  "0x155f0DD04424939368972f4e1838687d6a831151": {
    "address": "0x155f0DD04424939368972f4e1838687d6a831151",
    "name": "ArbiDoge",
    "symbol": "ADoge",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x155f0dd04424939368972f4e1838687d6a831151/icon",
    "chainId": 42161
  },
  "0x582A76775f21517F29B23D2A4eb74Ef18e711871": {
    "address": "0x582A76775f21517F29B23D2A4eb74Ef18e711871",
    "name": "JackBot",
    "symbol": "JACKBOT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x582a76775f21517f29b23d2a4eb74ef18e711871/icon",
    "chainId": 42161
  },
  "0xDE4cd6F2E2d647e708aBB0c039404B24a2827C35": {
    "address": "0xDE4cd6F2E2d647e708aBB0c039404B24a2827C35",
    "name": "ArbiPay",
    "symbol": "APAY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xde4cd6f2e2d647e708abb0c039404b24a2827c35/icon",
    "chainId": 42161
  },
  "0x498C620C7C91C6eba2E3Cd5485383f41613b7EB6": {
    "address": "0x498C620C7C91C6eba2E3Cd5485383f41613b7EB6",
    "name": "Alongside Crypto Market Index",
    "symbol": "AMKT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x498c620c7c91c6eba2e3cd5485383f41613b7eb6/icon",
    "chainId": 42161
  },
  "0xDFA71CBd067FaE08165049e10388146a8B05CcBC": {
    "address": "0xDFA71CBd067FaE08165049e10388146a8B05CcBC",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdfa71cbd067fae08165049e10388146a8b05ccbc/icon",
    "chainId": 42161
  },
  "0xdD69DB25F6D620A7baD3023c5d32761D353D3De9": {
    "address": "0xdD69DB25F6D620A7baD3023c5d32761D353D3De9",
    "name": "Goerli ETH",
    "symbol": "GETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdd69db25f6d620a7bad3023c5d32761d353d3de9/icon",
    "chainId": 42161
  },
  "0x86B162765811e4D16Dd7de17e7a5110953A5A5Df": {
    "address": "0x86B162765811e4D16Dd7de17e7a5110953A5A5Df",
    "name": "Arb Poppy AI",
    "symbol": "AIPOPPY",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x86b162765811e4d16dd7de17e7a5110953a5a5df/icon",
    "chainId": 42161
  },
  "0xB2498cde54810424a24Fdd23579164265A0C14c5": {
    "address": "0xB2498cde54810424a24Fdd23579164265A0C14c5",
    "name": "Taikula Coin",
    "symbol": "Taikula",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb2498cde54810424a24fdd23579164265a0c14c5/icon",
    "chainId": 42161
  },
  "0x53Ee546eB38fB2C8b870f56DeeaeCF80367a4551": {
    "address": "0x53Ee546eB38fB2C8b870f56DeeaeCF80367a4551",
    "name": "EBONDS",
    "symbol": "EBONDS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x53ee546eb38fb2c8b870f56deeaecf80367a4551/icon",
    "chainId": 42161
  },
  "0x3bAa857646e5A0B475E75a1dbD38E7f0a6742058": {
    "address": "0x3bAa857646e5A0B475E75a1dbD38E7f0a6742058",
    "name": "Moo Aura Arb auraBAL-wstETH",
    "symbol": "mooAuraArbauraBAL-wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3baa857646e5a0b475e75a1dbd38e7f0a6742058/icon",
    "chainId": 42161
  },
  "0x0Cb4707Aa370460c0AF9b0c5Aad833A8143A205b": {
    "address": "0x0Cb4707Aa370460c0AF9b0c5Aad833A8143A205b",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0cb4707aa370460c0af9b0c5aad833a8143a205b/icon",
    "chainId": 42161
  },
  "0xFE4Fa5932899C9a541E8E26b6e7e59506254ADEC": {
    "address": "0xFE4Fa5932899C9a541E8E26b6e7e59506254ADEC",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfe4fa5932899c9a541e8e26b6e7e59506254adec/icon",
    "chainId": 42161
  },
  "0x66ba30d5D7c66aFd4ed41c3498eC9e20a03a1368": {
    "address": "0x66ba30d5D7c66aFd4ed41c3498eC9e20a03a1368",
    "name": "Ethereum FIL",
    "symbol": "eFIL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x66ba30d5d7c66afd4ed41c3498ec9e20a03a1368/icon",
    "chainId": 42161
  },
  "0xB2dCBD5258A22385240e4ac13fc6726B66F0dE96": {
    "address": "0xB2dCBD5258A22385240e4ac13fc6726B66F0dE96",
    "name": "ZenithSwap",
    "symbol": "ZSP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb2dcbd5258a22385240e4ac13fc6726b66f0de96/icon",
    "chainId": 42161
  },
  "0xE086022290444bcD279D22c56925cc5Eda389999": {
    "address": "0xE086022290444bcD279D22c56925cc5Eda389999",
    "name": "lucky money Arb",
    "symbol": "YSARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe086022290444bcd279d22c56925cc5eda389999/icon",
    "chainId": 42161
  },
  "0x0D91199Ab8B6051B3B7E048Dc4e44284a23F20C9": {
    "address": "0x0D91199Ab8B6051B3B7E048Dc4e44284a23F20C9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0d91199ab8b6051b3b7e048dc4e44284a23f20c9/icon",
    "chainId": 42161
  },
  "0x634C4950445251bE6C2aC9dcD50CAa450742C341": {
    "address": "0x634C4950445251bE6C2aC9dcD50CAa450742C341",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x634c4950445251be6c2ac9dcd50caa450742c341/icon",
    "chainId": 42161
  },
  "0x01Dc7C21D0BFcfeCD310B3c9dDe8819b1b2EC38B": {
    "address": "0x01Dc7C21D0BFcfeCD310B3c9dDe8819b1b2EC38B",
    "name": "Gambler Shiba",
    "symbol": "AGS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x01dc7c21d0bfcfecd310b3c9dde8819b1b2ec38b/icon",
    "chainId": 42161
  },
  "0xe6Be2f5AB2AD4B8b146E3008f81832cF7B279f43": {
    "address": "0xe6Be2f5AB2AD4B8b146E3008f81832cF7B279f43",
    "name": "ToxicGarden.finance SEED",
    "symbol": "SEED",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe6be2f5ab2ad4b8b146e3008f81832cf7b279f43/icon",
    "chainId": 42161
  },
  "0x88942cCd34cc4523e2F698DDCE9BB3eb908CC974": {
    "address": "0x88942cCd34cc4523e2F698DDCE9BB3eb908CC974",
    "name": "Moo Gns GNS",
    "symbol": "mooGnsGNS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x88942ccd34cc4523e2f698ddce9bb3eb908cc974/icon",
    "chainId": 42161
  },
  "0xdb286ED48b294D348593bFAf1f862393FA8776e9": {
    "address": "0xdb286ED48b294D348593bFAf1f862393FA8776e9",
    "name": "StableV1 AMM - frxETH/WETH",
    "symbol": "sAMM-frxETH/WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdb286ed48b294d348593bfaf1f862393fa8776e9/icon",
    "chainId": 42161
  },
  "0xa231aEa07Bb5e79aE162f95903806FC5AD65fF11": {
    "address": "0xa231aEa07Bb5e79aE162f95903806FC5AD65fF11",
    "name": "Balancer 50DFX-50WETH",
    "symbol": "50DFX-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa231aea07bb5e79ae162f95903806fc5ad65ff11/icon",
    "chainId": 42161
  },
  "0xA4914B824eF261D4ED0Ccecec29500862d57c0a1": {
    "address": "0xA4914B824eF261D4ED0Ccecec29500862d57c0a1",
    "name": "DFX Token",
    "symbol": "DFX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa4914b824ef261d4ed0ccecec29500862d57c0a1/icon",
    "chainId": 42161
  },
  "0x400d7f19Ca189762D7944A62ea351db8De54F571": {
    "address": "0x400d7f19Ca189762D7944A62ea351db8De54F571",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x400d7f19ca189762d7944a62ea351db8de54f571/icon",
    "chainId": 42161
  },
  "0xadf5DD3E51bF28aB4F07e684eCF5d00691818790": {
    "address": "0xadf5DD3E51bF28aB4F07e684eCF5d00691818790",
    "name": "ICHI",
    "symbol": "ICHI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xadf5dd3e51bf28ab4f07e684ecf5d00691818790/icon",
    "chainId": 42161
  },
  "0x8d62A927addcd987a2cAF0CB656c694424986aF8": {
    "address": "0x8d62A927addcd987a2cAF0CB656c694424986aF8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8d62a927addcd987a2caf0cb656c694424986af8/icon",
    "chainId": 42161
  },
  "0xfb17d52F77Db6E32B5A082Ed4307FCFb0a86BEEE": {
    "address": "0xfb17d52F77Db6E32B5A082Ed4307FCFb0a86BEEE",
    "name": "Pizon",
    "symbol": "PZT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfb17d52f77db6e32b5a082ed4307fcfb0a86beee/icon",
    "chainId": 42161
  },
  "0xfB08Dac00Da5E400915aF269245C722718293111": {
    "address": "0xfB08Dac00Da5E400915aF269245C722718293111",
    "name": "Ronald McDonald Token",
    "symbol": "RONALD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfb08dac00da5e400915af269245c722718293111/icon",
    "chainId": 42161
  },
  "0x6B8b78554Db2f017CCA749dad38E445cd8A3b5B4": {
    "address": "0x6B8b78554Db2f017CCA749dad38E445cd8A3b5B4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6b8b78554db2f017cca749dad38e445cd8a3b5b4/icon",
    "chainId": 42161
  },
  "0x5157d88f624e45334C7051C510CB0B5DDD67AA58": {
    "address": "0x5157d88f624e45334C7051C510CB0B5DDD67AA58",
    "name": "Phuture DeFi Index",
    "symbol": "PDI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5157d88f624e45334c7051c510cb0b5ddd67aa58/icon",
    "chainId": 42161
  },
  "0x61aCf5194A8D1c9808F90EF174e33eb7FD6d9782": {
    "address": "0x61aCf5194A8D1c9808F90EF174e33eb7FD6d9782",
    "name": "Dogmusk",
    "symbol": "Dogmusk",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x61acf5194a8d1c9808f90ef174e33eb7fd6d9782/icon",
    "chainId": 42161
  },
  "0x05d35769a222AfFd6185e20F3f3676Abde56C25F": {
    "address": "0x05d35769a222AfFd6185e20F3f3676Abde56C25F",
    "name": "Unlimited Network Token",
    "symbol": "UWU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x05d35769a222affd6185e20f3f3676abde56c25f/icon",
    "chainId": 42161
  },
  "0x6723661384cb71D8F8B5bF09F3F3f8c7Ac2dB958": {
    "address": "0x6723661384cb71D8F8B5bF09F3F3f8c7Ac2dB958",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6723661384cb71d8f8b5bf09f3f3f8c7ac2db958/icon",
    "chainId": 42161
  },
  "0x76fbfbB37F1258EA11bbF47753C2835180883AF5": {
    "address": "0x76fbfbB37F1258EA11bbF47753C2835180883AF5",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x76fbfbb37f1258ea11bbf47753c2835180883af5/icon",
    "chainId": 42161
  },
  "0x6d2CAF65163Ff290EC2a362d6E413faE4643F90E": {
    "address": "0x6d2CAF65163Ff290EC2a362d6E413faE4643F90E",
    "name": "Temple",
    "symbol": "TEMPLE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6d2caf65163ff290ec2a362d6e413fae4643f90e/icon",
    "chainId": 42161
  },
  "0x8d6B9D796289fFE2B7061B2fF56d459380db2355": {
    "address": "0x8d6B9D796289fFE2B7061B2fF56d459380db2355",
    "name": "FITTY CENT",
    "symbol": "F50",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8d6b9d796289ffe2b7061b2ff56d459380db2355/icon",
    "chainId": 42161
  },
  "0x3Ce724447cBa503a3804Cb31eceDCf39eE86567b": {
    "address": "0x3Ce724447cBa503a3804Cb31eceDCf39eE86567b",
    "name": "TWOPAW Arbitrum",
    "symbol": "TWOPAW",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3ce724447cba503a3804cb31ecedcf39ee86567b/icon",
    "chainId": 42161
  },
  "0xC25a7FBF003FF87e66CF62056fC463ADeFf4998a": {
    "address": "0xC25a7FBF003FF87e66CF62056fC463ADeFf4998a",
    "name": "Sniffer Inu",
    "symbol": "SNIFU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc25a7fbf003ff87e66cf62056fc463adeff4998a/icon",
    "chainId": 42161
  },
  "0xf69223B75D9CF7c454Bb44e30a3772202bEE72CF": {
    "address": "0xf69223B75D9CF7c454Bb44e30a3772202bEE72CF",
    "name": "Zyber LP",
    "symbol": "ZLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf69223b75d9cf7c454bb44e30a3772202bee72cf/icon",
    "chainId": 42161
  },
  "0x3B475F6f2f41853706afc9Fa6a6b8C5dF1a2724c": {
    "address": "0x3B475F6f2f41853706afc9Fa6a6b8C5dF1a2724c",
    "name": "Zyber Token",
    "symbol": "ZYB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3b475f6f2f41853706afc9fa6a6b8c5df1a2724c/icon",
    "chainId": 42161
  },
  "0x562Ae83d17590d9681D5445EcfC0F56517e49f24": {
    "address": "0x562Ae83d17590d9681D5445EcfC0F56517e49f24",
    "name": "Moo Stargate ETH",
    "symbol": "mooStargateETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x562ae83d17590d9681d5445ecfc0f56517e49f24/icon",
    "chainId": 42161
  },
  "0xBC57A6567A0655B1e2805961FC4F20e6a1ff55BD": {
    "address": "0xBC57A6567A0655B1e2805961FC4F20e6a1ff55BD",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbc57a6567a0655b1e2805961fc4f20e6a1ff55bd/icon",
    "chainId": 42161
  },
  "0x8b3263136f27B3B24dc3854344e9a6a3B34522E6": {
    "address": "0x8b3263136f27B3B24dc3854344e9a6a3B34522E6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8b3263136f27b3b24dc3854344e9a6a3b34522e6/icon",
    "chainId": 42161
  },
  "0xfF10886fC52FeEc34eEdb5646a32C79349F8B497": {
    "address": "0xfF10886fC52FeEc34eEdb5646a32C79349F8B497",
    "name": "LIULIU",
    "symbol": "LIULIU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xff10886fc52feec34eedb5646a32c79349f8b497/icon",
    "chainId": 42161
  },
  "0xf387359fAb862eaEF4B7C03D2174755918c58D4d": {
    "address": "0xf387359fAb862eaEF4B7C03D2174755918c58D4d",
    "name": "YOGI",
    "symbol": "YOGI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf387359fab862eaef4b7c03d2174755918c58d4d/icon",
    "chainId": 42161
  },
  "0xdE6FbfB149a290efE4c70A23DF770B268D2839Eb": {
    "address": "0xdE6FbfB149a290efE4c70A23DF770B268D2839Eb",
    "name": "Moo Ramses FRAX-MAI",
    "symbol": "mooRamsesFRAX-MAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xde6fbfb149a290efe4c70a23df770b268d2839eb/icon",
    "chainId": 42161
  },
  "0xD2665B86ce4EC9556Acc6e72900E72CC6F1d3FB9": {
    "address": "0xD2665B86ce4EC9556Acc6e72900E72CC6F1d3FB9",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd2665b86ce4ec9556acc6e72900e72cc6f1d3fb9/icon",
    "chainId": 42161
  },
  "0x7985de01B26C1EFaBA8BF4A9971a32dFF8661BfB": {
    "address": "0x7985de01B26C1EFaBA8BF4A9971a32dFF8661BfB",
    "name": "BananaCoin",
    "symbol": "Banana",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7985de01b26c1efaba8bf4a9971a32dff8661bfb/icon",
    "chainId": 42161
  },
  "0x6048Df2D0dB43477eE77ff2e6D86e4339d3d5A66": {
    "address": "0x6048Df2D0dB43477eE77ff2e6D86e4339d3d5A66",
    "name": "Buccaneer V3",
    "symbol": "BV3A",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6048df2d0db43477ee77ff2e6d86e4339d3d5a66/icon",
    "chainId": 42161
  },
  "0xdC77a18bE374671b762d13277562DBaC14058c3c": {
    "address": "0xdC77a18bE374671b762d13277562DBaC14058c3c",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdc77a18be374671b762d13277562dbac14058c3c/icon",
    "chainId": 42161
  },
  "0x2F73FB16933585Ba089100C05561D58FD342bDf5": {
    "address": "0x2F73FB16933585Ba089100C05561D58FD342bDf5",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2f73fb16933585ba089100c05561d58fd342bdf5/icon",
    "chainId": 42161
  },
  "0x6Dc147be79e625E5C9033651238CCce973a0950c": {
    "address": "0x6Dc147be79e625E5C9033651238CCce973a0950c",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6dc147be79e625e5c9033651238ccce973a0950c/icon",
    "chainId": 42161
  },
  "0x0B07d8A47ac0317aA84E3592B8fcd99a49Bbd2A2": {
    "address": "0x0B07d8A47ac0317aA84E3592B8fcd99a49Bbd2A2",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0b07d8a47ac0317aa84e3592b8fcd99a49bbd2a2/icon",
    "chainId": 42161
  },
  "0xc136E6B376a9946B156db1ED3A34b08AFdAeD76d": {
    "address": "0xc136E6B376a9946B156db1ED3A34b08AFdAeD76d",
    "name": "CreDA Protocol Token",
    "symbol": "CREDA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc136e6b376a9946b156db1ed3a34b08afdaed76d/icon",
    "chainId": 42161
  },
  "0xaF9977C2737eb61076C0dC0bad33509a26347eaC": {
    "address": "0xaF9977C2737eb61076C0dC0bad33509a26347eaC",
    "name": "McNugget Buddies Token",
    "symbol": "MCNUGGET",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaf9977c2737eb61076c0dc0bad33509a26347eac/icon",
    "chainId": 42161
  },
  "0xa5Dd76C46dE4d800ca9F985105A36b1F3ABF7969": {
    "address": "0xa5Dd76C46dE4d800ca9F985105A36b1F3ABF7969",
    "name": "McDonalds Token",
    "symbol": "McDonalds",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa5dd76c46de4d800ca9f985105a36b1f3abf7969/icon",
    "chainId": 42161
  },
  "0xDEE46BE9D0b207e5d88D2Efd84a045E725A242F7": {
    "address": "0xDEE46BE9D0b207e5d88D2Efd84a045E725A242F7",
    "name": "Pepe",
    "symbol": "PEPE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdee46be9d0b207e5d88d2efd84a045e725a242f7/icon",
    "chainId": 42161
  },
  "0x6809a7FD1C8fb09d1fE79Ff8962D12027B318Bab": {
    "address": "0x6809a7FD1C8fb09d1fE79Ff8962D12027B318Bab",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6809a7fd1c8fb09d1fe79ff8962d12027b318bab/icon",
    "chainId": 42161
  },
  "0xccF58d364f141A92B07175235A82866485800858": {
    "address": "0xccF58d364f141A92B07175235A82866485800858",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xccf58d364f141a92b07175235a82866485800858/icon",
    "chainId": 42161
  },
  "0xF29Fdf6B7BdFFb025D7e6dfdF344992D2D16E249": {
    "address": "0xF29Fdf6B7BdFFb025D7e6dfdF344992D2D16E249",
    "name": "GENSX",
    "symbol": "GENSX",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf29fdf6b7bdffb025d7e6dfdf344992d2d16e249/icon",
    "chainId": 42161
  },
  "0xfF67b6599959BaA5D978817cc389d1618457f63c": {
    "address": "0xfF67b6599959BaA5D978817cc389d1618457f63c",
    "name": "Twoge Inu",
    "symbol": "TWOGE",
    "decimals": 5,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xff67b6599959baa5d978817cc389d1618457f63c/icon",
    "chainId": 42161
  },
  "0x93b48e950380AdCf6d67C392f20d44Fb88D258Dc": {
    "address": "0x93b48e950380AdCf6d67C392f20d44Fb88D258Dc",
    "name": "50USDC-50USDC.e",
    "symbol": "50USDC-50USDC.e",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x93b48e950380adcf6d67c392f20d44fb88d258dc/icon",
    "chainId": 42161
  },
  "0x579E22665454367DdD2EF6C1A7fBb6873f465c10": {
    "address": "0x579E22665454367DdD2EF6C1A7fBb6873f465c10",
    "name": "VolatileV1 AMM - WETH/IDIA",
    "symbol": "vAMM-WETH/IDIA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x579e22665454367ddd2ef6c1a7fbb6873f465c10/icon",
    "chainId": 42161
  },
  "0x8C75a1C86C21b74754FC8e3Bc4e7f79B4fCC5a28": {
    "address": "0x8C75a1C86C21b74754FC8e3Bc4e7f79B4fCC5a28",
    "name": "ESIR",
    "symbol": "ESIR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8c75a1c86c21b74754fc8e3bc4e7f79b4fcc5a28/icon",
    "chainId": 42161
  },
  "0x25caFa8e0B25A1c63aEE52288f825bf99b36F3A8": {
    "address": "0x25caFa8e0B25A1c63aEE52288f825bf99b36F3A8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x25cafa8e0b25a1c63aee52288f825bf99b36f3a8/icon",
    "chainId": 42161
  },
  "0xEfa2Ae4d8da62E99Ed9744C196b2cbF477c3FF27": {
    "address": "0xEfa2Ae4d8da62E99Ed9744C196b2cbF477c3FF27",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xefa2ae4d8da62e99ed9744c196b2cbf477c3ff27/icon",
    "chainId": 42161
  },
  "0x7F244b47C63E9Ca33A58E6550bfd1D3dC806Ce55": {
    "address": "0x7F244b47C63E9Ca33A58E6550bfd1D3dC806Ce55",
    "name": "CHEESE",
    "symbol": "CHEESE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7f244b47c63e9ca33a58e6550bfd1d3dc806ce55/icon",
    "chainId": 42161
  },
  "0xC48c25bEe5e9BCa6D2DE94C798b4c127Af4a9496": {
    "address": "0xC48c25bEe5e9BCa6D2DE94C798b4c127Af4a9496",
    "name": "ArbDoge",
    "symbol": "ARBDOG",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc48c25bee5e9bca6d2de94c798b4c127af4a9496/icon",
    "chainId": 42161
  },
  "0xa3E7e143b69AEaa2B435EFD7E40C4A7D1d6D8296": {
    "address": "0xa3E7e143b69AEaa2B435EFD7E40C4A7D1d6D8296",
    "name": "Bubble",
    "symbol": "BUB",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa3e7e143b69aeaa2b435efd7e40c4a7d1d6d8296/icon",
    "chainId": 42161
  },
  "0xD2cC61A36c31425B3Eb9bBEeCcE74A82a2e32E27": {
    "address": "0xD2cC61A36c31425B3Eb9bBEeCcE74A82a2e32E27",
    "name": "RATS",
    "symbol": "RATS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd2cc61a36c31425b3eb9bbeecce74a82a2e32e27/icon",
    "chainId": 42161
  },
  "0xE28881d63f4F0577d4f75eA04F3a3e75FEFfC491": {
    "address": "0xE28881d63f4F0577d4f75eA04F3a3e75FEFfC491",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe28881d63f4f0577d4f75ea04f3a3e75feffc491/icon",
    "chainId": 42161
  },
  "0x393c93f8133bc89db3177D6e10182Efd4129D0d1": {
    "address": "0x393c93f8133bc89db3177D6e10182Efd4129D0d1",
    "name": "VolatileV1 AMM - WETH/LQTY",
    "symbol": "vAMM-WETH/LQTY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x393c93f8133bc89db3177d6e10182efd4129d0d1/icon",
    "chainId": 42161
  },
  "0x710ff0B35FA4812B2F437eF5C84eaD03961693e4": {
    "address": "0x710ff0B35FA4812B2F437eF5C84eaD03961693e4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x710ff0b35fa4812b2f437ef5c84ead03961693e4/icon",
    "chainId": 42161
  },
  "0x53bCF6698C911b2A7409a740EACDDB901fC2a2C6": {
    "address": "0x53bCF6698C911b2A7409a740EACDDB901fC2a2C6",
    "name": "Kabosu",
    "symbol": "KABOSU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x53bcf6698c911b2a7409a740eacddb901fc2a2c6/icon",
    "chainId": 42161
  },
  "0x10031e7CFf689de64f1A5a8ECF4fBBc7Aa068927": {
    "address": "0x10031e7CFf689de64f1A5a8ECF4fBBc7Aa068927",
    "name": "Gravity Token",
    "symbol": "GRV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x10031e7cff689de64f1a5a8ecf4fbbc7aa068927/icon",
    "chainId": 42161
  },
  "0xDa181136e923590040a81946c921C8cD6a70C0E9": {
    "address": "0xDa181136e923590040a81946c921C8cD6a70C0E9",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xda181136e923590040a81946c921c8cd6a70c0e9/icon",
    "chainId": 42161
  },
  "0xE8C060d40D7Bc96fCd5b758Bd1437C8653400b0e": {
    "address": "0xE8C060d40D7Bc96fCd5b758Bd1437C8653400b0e",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe8c060d40d7bc96fcd5b758bd1437c8653400b0e/icon",
    "chainId": 42161
  },
  "0x9FE8f0A9B9ddc61EDdBCBA7aAd72F9b2462c6CaE": {
    "address": "0x9FE8f0A9B9ddc61EDdBCBA7aAd72F9b2462c6CaE",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9fe8f0a9b9ddc61eddbcba7aad72f9b2462c6cae/icon",
    "chainId": 42161
  },
  "0x5748a6DDA0D17d9A16f7d411D0cf334a3179eBa6": {
    "address": "0x5748a6DDA0D17d9A16f7d411D0cf334a3179eBa6",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5748a6dda0d17d9a16f7d411d0cf334a3179eba6/icon",
    "chainId": 42161
  },
  "0x8929e9DbD2785e3BA16175E596CDD61520feE0D1": {
    "address": "0x8929e9DbD2785e3BA16175E596CDD61520feE0D1",
    "name": "Altitude",
    "symbol": "ALTD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8929e9dbd2785e3ba16175e596cdd61520fee0d1/icon",
    "chainId": 42161
  },
  "0x84F5c2cFba754E76DD5aE4fB369CfC920425E12b": {
    "address": "0x84F5c2cFba754E76DD5aE4fB369CfC920425E12b",
    "name": "Cryptex",
    "symbol": "CTX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x84f5c2cfba754e76dd5ae4fb369cfc920425e12b/icon",
    "chainId": 42161
  },
  "0x77d4C54FaA955044b62C996cb6063E7cC56DB674": {
    "address": "0x77d4C54FaA955044b62C996cb6063E7cC56DB674",
    "name": "Officer Big Mac Token",
    "symbol": "BIGMAC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x77d4c54faa955044b62c996cb6063e7cc56db674/icon",
    "chainId": 42161
  },
  "0x44B320ADc0DEa8A6D3A2625C636d5dE85A3f6C28": {
    "address": "0x44B320ADc0DEa8A6D3A2625C636d5dE85A3f6C28",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x44b320adc0dea8a6d3a2625c636d5de85a3f6c28/icon",
    "chainId": 42161
  },
  "0x1CF435b95F6616DEF28fFBAB02b124c3d65b9658": {
    "address": "0x1CF435b95F6616DEF28fFBAB02b124c3d65b9658",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1cf435b95f6616def28ffbab02b124c3d65b9658/icon",
    "chainId": 42161
  },
  "0x2Dc0fC5156960534Aa4352d0F3908B2F9De0a853": {
    "address": "0x2Dc0fC5156960534Aa4352d0F3908B2F9De0a853",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2dc0fc5156960534aa4352d0f3908b2f9de0a853/icon",
    "chainId": 42161
  },
  "0x1DB5d4897573106C693A34479cC875cf963D6ff8": {
    "address": "0x1DB5d4897573106C693A34479cC875cf963D6ff8",
    "name": "Arbitrumium",
    "symbol": "ARM",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1db5d4897573106c693a34479cc875cf963d6ff8/icon",
    "chainId": 42161
  },
  "0x623fa3B72853C2bF8198f7bdEC1DE7D5aCa1C155": {
    "address": "0x623fa3B72853C2bF8198f7bdEC1DE7D5aCa1C155",
    "name": "Happy Meal Box Token",
    "symbol": "HAPPYMEAL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x623fa3b72853c2bf8198f7bdec1de7d5aca1c155/icon",
    "chainId": 42161
  },
  "0x700e4edb5c7D8f53CCb0cf212b81A121728e1D5b": {
    "address": "0x700e4edb5c7D8f53CCb0cf212b81A121728e1D5b",
    "name": "LOPO",
    "symbol": "LOPO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x700e4edb5c7d8f53ccb0cf212b81a121728e1d5b/icon",
    "chainId": 42161
  },
  "0xeee5FBcFF2f22b351D0A693ED62C515C01ef3EcA": {
    "address": "0xeee5FBcFF2f22b351D0A693ED62C515C01ef3EcA",
    "name": "VolatileV1 AMM - IBEX/USDC",
    "symbol": "vAMM-IBEX/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeee5fbcff2f22b351d0a693ed62c515c01ef3eca/icon",
    "chainId": 42161
  },
  "0x79f707D68CD49ca5D9aEB33affd4477C3ea8ea8f": {
    "address": "0x79f707D68CD49ca5D9aEB33affd4477C3ea8ea8f",
    "name": "ETH Volatility Index",
    "symbol": "ETHV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x79f707d68cd49ca5d9aeb33affd4477c3ea8ea8f/icon",
    "chainId": 42161
  },
  "0x245efECfCA92325B9d939388090677DB45737DA0": {
    "address": "0x245efECfCA92325B9d939388090677DB45737DA0",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x245efecfca92325b9d939388090677db45737da0/icon",
    "chainId": 42161
  },
  "0x6658394CA08b855De82e15A8002A8D1c4f0d05d9": {
    "address": "0x6658394CA08b855De82e15A8002A8D1c4f0d05d9",
    "name": "Mayor McCheese Token",
    "symbol": "McCHEESE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6658394ca08b855de82e15a8002a8d1c4f0d05d9/icon",
    "chainId": 42161
  },
  "0x0EDc9d82aB8B7Aa2405dee4e6D43D24030E6d549": {
    "address": "0x0EDc9d82aB8B7Aa2405dee4e6D43D24030E6d549",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0edc9d82ab8b7aa2405dee4e6d43d24030e6d549/icon",
    "chainId": 42161
  },
  "0x50d9473232425f303d15b3bBeAD283d2fD79D41e": {
    "address": "0x50d9473232425f303d15b3bBeAD283d2fD79D41e",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x50d9473232425f303d15b3bbead283d2fd79d41e/icon",
    "chainId": 42161
  },
  "0xB4E3EEec43Ebc04F28d31f2c021d15e9F56f0e54": {
    "address": "0xB4E3EEec43Ebc04F28d31f2c021d15e9F56f0e54",
    "name": "MAW",
    "symbol": "MAW",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb4e3eeec43ebc04f28d31f2c021d15e9f56f0e54/icon",
    "chainId": 42161
  },
  "0xC37689d5B73d39981472756473D0De6046beef88": {
    "address": "0xC37689d5B73d39981472756473D0De6046beef88",
    "name": "LineFi Game Token",
    "symbol": "LFG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc37689d5b73d39981472756473d0de6046beef88/icon",
    "chainId": 42161
  },
  "0x2E3daDDd536db659AD5518728289410B517062cB": {
    "address": "0x2E3daDDd536db659AD5518728289410B517062cB",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2e3daddd536db659ad5518728289410b517062cb/icon",
    "chainId": 42161
  },
  "0x8234462742DbbAaF394AB1e7A1b7AE118E9172d4": {
    "address": "0x8234462742DbbAaF394AB1e7A1b7AE118E9172d4",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8234462742dbbaaf394ab1e7a1b7ae118e9172d4/icon",
    "chainId": 42161
  },
  "0xe77e0C559494585aC396A91BF35fB164E272b896": {
    "address": "0xe77e0C559494585aC396A91BF35fB164E272b896",
    "name": "OSCAR SWAP",
    "symbol": "OSCAR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe77e0c559494585ac396a91bf35fb164e272b896/icon",
    "chainId": 42161
  },
  "0x12F7cf4F2E3f87678EC5207Fc920c815E31524df": {
    "address": "0x12F7cf4F2E3f87678EC5207Fc920c815E31524df",
    "name": "Dotlab",
    "symbol": "DTL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x12f7cf4f2e3f87678ec5207fc920c815e31524df/icon",
    "chainId": 42161
  },
  "0xa9ef69CAC80488eF05926023421214C98f22105d": {
    "address": "0xa9ef69CAC80488eF05926023421214C98f22105d",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa9ef69cac80488ef05926023421214c98f22105d/icon",
    "chainId": 42161
  },
  "0x1a7BD9EDC36Fb2b3c0852bcD7438c2A957Fd7Ad5": {
    "address": "0x1a7BD9EDC36Fb2b3c0852bcD7438c2A957Fd7Ad5",
    "name": "ArbiMoon",
    "symbol": "aMoon",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1a7bd9edc36fb2b3c0852bcd7438c2a957fd7ad5/icon",
    "chainId": 42161
  },
  "0x6345cCF4b1d4411789cD11411F146BFe3dE14e8A": {
    "address": "0x6345cCF4b1d4411789cD11411F146BFe3dE14e8A",
    "name": "Stable Pair - DAI/USDC",
    "symbol": "sAMM-DAI/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6345ccf4b1d4411789cd11411f146bfe3de14e8a/icon",
    "chainId": 42161
  },
  "0xf181afDa4dA45c035a304207e35dedAA9b18591C": {
    "address": "0xf181afDa4dA45c035a304207e35dedAA9b18591C",
    "name": "Volatile rAMM - agEUR/USDC",
    "symbol": "vrAMM-agEUR/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf181afda4da45c035a304207e35dedaa9b18591c/icon",
    "chainId": 42161
  },
  "0x47888C34e9aa879363E94E5302681e763B18D39E": {
    "address": "0x47888C34e9aa879363E94E5302681e763B18D39E",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x47888c34e9aa879363e94e5302681e763b18d39e/icon",
    "chainId": 42161
  },
  "0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C": {
    "address": "0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C",
    "name": "Frax-LP",
    "symbol": "S*FRAX",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa4bf442f024820b2c28cd0fd72b82c63e66f56c/icon",
    "chainId": 42161
  },
  "0xc0020e365E8914F7844ddD6D36a1BA258c0094Dd": {
    "address": "0xc0020e365E8914F7844ddD6D36a1BA258c0094Dd",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc0020e365e8914f7844ddd6d36a1ba258c0094dd/icon",
    "chainId": 42161
  },
  "0x5588021F7c1FBb2Adb02f504ca661A05d50CFc66": {
    "address": "0x5588021F7c1FBb2Adb02f504ca661A05d50CFc66",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5588021f7c1fbb2adb02f504ca661a05d50cfc66/icon",
    "chainId": 42161
  },
  "0x109EB5E931B1dDf115997EBCf918AC07A75D3778": {
    "address": "0x109EB5E931B1dDf115997EBCf918AC07A75D3778",
    "name": "Volatile rAMM - WETH/XCAD",
    "symbol": "vrAMM-WETH/XCAD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x109eb5e931b1ddf115997ebcf918ac07a75d3778/icon",
    "chainId": 42161
  },
  "0x2a5fF8183bB902af7BdDE2261e7Cea0BDc5d0783": {
    "address": "0x2a5fF8183bB902af7BdDE2261e7Cea0BDc5d0783",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2a5ff8183bb902af7bdde2261e7cea0bdc5d0783/icon",
    "chainId": 42161
  },
  "0x921f99719Eb6C01b4B8f0BA7973A7C24891e740A": {
    "address": "0x921f99719Eb6C01b4B8f0BA7973A7C24891e740A",
    "name": "XCAD Token",
    "symbol": "XCAD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x921f99719eb6c01b4b8f0ba7973a7c24891e740a/icon",
    "chainId": 42161
  },
  "0xc9c2B86CD4cdbAB70cd65D22EB044574c3539F6c": {
    "address": "0xc9c2B86CD4cdbAB70cd65D22EB044574c3539F6c",
    "name": "Feisty Doge NFT",
    "symbol": "NFD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc9c2b86cd4cdbab70cd65d22eb044574c3539f6c/icon",
    "chainId": 42161
  },
  "0xd3E133a0A14Bb8B595e5Fbf9851c7c783685BA69": {
    "address": "0xd3E133a0A14Bb8B595e5Fbf9851c7c783685BA69",
    "name": "Locker Token",
    "symbol": "LKT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd3e133a0a14bb8b595e5fbf9851c7c783685ba69/icon",
    "chainId": 42161
  },
  "0xD474E6c0930e3B1b999E7b093abCF1a38018D4F4": {
    "address": "0xD474E6c0930e3B1b999E7b093abCF1a38018D4F4",
    "name": "MetaCity Token",
    "symbol": "MTC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd474e6c0930e3b1b999e7b093abcf1a38018d4f4/icon",
    "chainId": 42161
  },
  "0x673D6D2DA0B1B477464f16267cefC7a8D27BF53f": {
    "address": "0x673D6D2DA0B1B477464f16267cefC7a8D27BF53f",
    "name": "METALAND",
    "symbol": "METALAND",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x673d6d2da0b1b477464f16267cefc7a8d27bf53f/icon",
    "chainId": 42161
  },
  "0xA9640CaA54E431ec21a4E14DE8dde0b05Cf034E7": {
    "address": "0xA9640CaA54E431ec21a4E14DE8dde0b05Cf034E7",
    "name": "Moo Balancer Arb rETH-bbaWETH",
    "symbol": "mooBalancerArbrETH-bbaWETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa9640caa54e431ec21a4e14de8dde0b05cf034e7/icon",
    "chainId": 42161
  },
  "0xCba9Ff45cfB9cE238AfDE32b0148Eb82CbE63562": {
    "address": "0xCba9Ff45cfB9cE238AfDE32b0148Eb82CbE63562",
    "name": "Balancer rETH-Boosted Aave WETH StablePool",
    "symbol": "rETH-bb-a-WETH-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcba9ff45cfb9ce238afde32b0148eb82cbe63562/icon",
    "chainId": 42161
  },
  "0x306132b6147751B85E608B4C1EC452E111531eA2": {
    "address": "0x306132b6147751B85E608B4C1EC452E111531eA2",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x306132b6147751b85e608b4c1ec452e111531ea2/icon",
    "chainId": 42161
  },
  "0x1D987200dF3B744CFa9C14f713F5334CB4Bc4D5D": {
    "address": "0x1D987200dF3B744CFa9C14f713F5334CB4Bc4D5D",
    "name": "REKT",
    "symbol": "REKT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1d987200df3b744cfa9c14f713f5334cb4bc4d5d/icon",
    "chainId": 42161
  },
  "0xA8eC0aa8fe4287E768Fd382845442Fa29F2886ef": {
    "address": "0xA8eC0aa8fe4287E768Fd382845442Fa29F2886ef",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa8ec0aa8fe4287e768fd382845442fa29f2886ef/icon",
    "chainId": 42161
  },
  "0x842216E0aa2ae608699F7b1063F26ce6b30c5311": {
    "address": "0x842216E0aa2ae608699F7b1063F26ce6b30c5311",
    "name": "URD Token",
    "symbol": "URD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x842216e0aa2ae608699f7b1063f26ce6b30c5311/icon",
    "chainId": 42161
  },
  "0x7a5D193fE4ED9098F7EAdC99797087C96b002907": {
    "address": "0x7a5D193fE4ED9098F7EAdC99797087C96b002907",
    "name": "Plutus ARB",
    "symbol": "plsARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7a5d193fe4ed9098f7eadc99797087c96b002907/icon",
    "chainId": 42161
  },
  "0x047E339b0220445a9884Ed70030E5B317f8E5bC6": {
    "address": "0x047E339b0220445a9884Ed70030E5B317f8E5bC6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x047e339b0220445a9884ed70030e5b317f8e5bc6/icon",
    "chainId": 42161
  },
  "0x278f76df86EfdcbE0f2573AE54e917505621E312": {
    "address": "0x278f76df86EfdcbE0f2573AE54e917505621E312",
    "name": "VolatileV1 AMM - wUSDR/USDC",
    "symbol": "vAMM-wUSDR/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x278f76df86efdcbe0f2573ae54e917505621e312/icon",
    "chainId": 42161
  },
  "0xcE96EFfdd5CB2c9F11721d7998cb735cf13671ad": {
    "address": "0xcE96EFfdd5CB2c9F11721d7998cb735cf13671ad",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xce96effdd5cb2c9f11721d7998cb735cf13671ad/icon",
    "chainId": 42161
  },
  "0xc7024B02a3C3893C482F5DD03193CFD1DBEC604f": {
    "address": "0xc7024B02a3C3893C482F5DD03193CFD1DBEC604f",
    "name": "Moo Stargate USDT",
    "symbol": "mooStargateUSDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc7024b02a3c3893c482f5dd03193cfd1dbec604f/icon",
    "chainId": 42161
  },
  "0x080967D85deb6d2Fe2899322B845EaD3218801aA": {
    "address": "0x080967D85deb6d2Fe2899322B845EaD3218801aA",
    "name": "Moo Uniswap Gamma USDC-USDT",
    "symbol": "mooUniswapGammaUSDC-USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x080967d85deb6d2fe2899322b845ead3218801aa/icon",
    "chainId": 42161
  },
  "0x67C31056358b8977Ea95a3a899dD380D4BceD706": {
    "address": "0x67C31056358b8977Ea95a3a899dD380D4BceD706",
    "name": "ETHforestAI",
    "symbol": "ETHFAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x67c31056358b8977ea95a3a899dd380d4bced706/icon",
    "chainId": 42161
  },
  "0x91Ed9458359d0C7Bc03cFE21a58C905fD64402b3": {
    "address": "0x91Ed9458359d0C7Bc03cFE21a58C905fD64402b3",
    "name": "xUSDC-USDT01",
    "symbol": "xUSDC-USDT01",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x91ed9458359d0c7bc03cfe21a58c905fd64402b3/icon",
    "chainId": 42161
  },
  "0xDDc0385169797937066bBd8EF409b5B3c0dFEB52": {
    "address": "0xDDc0385169797937066bBd8EF409b5B3c0dFEB52",
    "name": "Wrapped USDR",
    "symbol": "wUSDR",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xddc0385169797937066bbd8ef409b5b3c0dfeb52/icon",
    "chainId": 42161
  },
  "0x86B24633766b52fC18E31744F558c7e1711f2bbD": {
    "address": "0x86B24633766b52fC18E31744F558c7e1711f2bbD",
    "name": "MemeBuff",
    "symbol": "BUFF",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x86b24633766b52fc18e31744f558c7e1711f2bbd/icon",
    "chainId": 42161
  },
  "0x7D6ce3095d0f664eF2E10fb6BB045a45AC9e35E2": {
    "address": "0x7D6ce3095d0f664eF2E10fb6BB045a45AC9e35E2",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7d6ce3095d0f664ef2e10fb6bb045a45ac9e35e2/icon",
    "chainId": 42161
  },
  "0x907602217e1d4349268852dfF99eB5fAE032d826": {
    "address": "0x907602217e1d4349268852dfF99eB5fAE032d826",
    "name": "Frax Price Index",
    "symbol": "FPI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x907602217e1d4349268852dff99eb5fae032d826/icon",
    "chainId": 42161
  },
  "0x1b896893dfc86bb67Cf57767298b9073D2c1bA2c": {
    "address": "0x1b896893dfc86bb67Cf57767298b9073D2c1bA2c",
    "name": "PancakeSwap Token",
    "symbol": "Cake",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1b896893dfc86bb67cf57767298b9073d2c1ba2c/icon",
    "chainId": 42161
  },
  "0x928b37318B1F9E05d7F0b2547378D093f45F3BbA": {
    "address": "0x928b37318B1F9E05d7F0b2547378D093f45F3BbA",
    "name": "Monsters Token",
    "symbol": "MST",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x928b37318b1f9e05d7f0b2547378d093f45f3bba/icon",
    "chainId": 42161
  },
  "0xbE8bAD7FEdB9a012295CBC2f018994dC43b32A24": {
    "address": "0xbE8bAD7FEdB9a012295CBC2f018994dC43b32A24",
    "name": "AIFIN",
    "symbol": "AIFIN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbe8bad7fedb9a012295cbc2f018994dc43b32a24/icon",
    "chainId": 42161
  },
  "0xeca2C9d3881DF18fb129582b65B82D67EDD21D19": {
    "address": "0xeca2C9d3881DF18fb129582b65B82D67EDD21D19",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeca2c9d3881df18fb129582b65b82d67edd21d19/icon",
    "chainId": 42161
  },
  "0xa6efc26dAA4bb2b9bF5D23A0bc202A2BaDC2B59E": {
    "address": "0xa6efc26dAA4bb2b9bF5D23A0bc202A2BaDC2B59E",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa6efc26daa4bb2b9bf5d23a0bc202a2badc2b59e/icon",
    "chainId": 42161
  },
  "0x6eB94C6c714745d73444D9a61498F4C4c61199b6": {
    "address": "0x6eB94C6c714745d73444D9a61498F4C4c61199b6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6eb94c6c714745d73444d9a61498f4c4c61199b6/icon",
    "chainId": 42161
  },
  "0x8eb013855089Ab8d3B8c8250bc0ac52F66FF6177": {
    "address": "0x8eb013855089Ab8d3B8c8250bc0ac52F66FF6177",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8eb013855089ab8d3b8c8250bc0ac52f66ff6177/icon",
    "chainId": 42161
  },
  "0x458a2df1A5C74C5dc9eD6E01Dd1178E6D353243B": {
    "address": "0x458a2df1A5C74C5dc9eD6E01Dd1178E6D353243B",
    "name": "Gemstone",
    "symbol": "GEM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x458a2df1a5c74c5dc9ed6e01dd1178e6d353243b/icon",
    "chainId": 42161
  },
  "0x855c71Ab6b76eA3d43A8dE06fcf9166F0F3e091B": {
    "address": "0x855c71Ab6b76eA3d43A8dE06fcf9166F0F3e091B",
    "name": "CATOSHI",
    "symbol": "CATS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x855c71ab6b76ea3d43a8de06fcf9166f0f3e091b/icon",
    "chainId": 42161
  },
  "0x2067694cf3E2e16154F225a6e52Ae0e4386Fb77a": {
    "address": "0x2067694cf3E2e16154F225a6e52Ae0e4386Fb77a",
    "name": "KEK AI",
    "symbol": "KEKAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2067694cf3e2e16154f225a6e52ae0e4386fb77a/icon",
    "chainId": 42161
  },
  "0xA0a941F4b52D50f4E41e4a7547307B3191ABf600": {
    "address": "0xA0a941F4b52D50f4E41e4a7547307B3191ABf600",
    "name": "Moo Ramses FRAX-DOLA",
    "symbol": "mooRamsesFRAX-DOLA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa0a941f4b52d50f4e41e4a7547307b3191abf600/icon",
    "chainId": 42161
  },
  "0xbcD23Fc5eA00237dd6473410490430A568fC8362": {
    "address": "0xbcD23Fc5eA00237dd6473410490430A568fC8362",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbcd23fc5ea00237dd6473410490430a568fc8362/icon",
    "chainId": 42161
  },
  "0xD8369C2EDA18dD6518eABb1F85BD60606dEb39Ec": {
    "address": "0xD8369C2EDA18dD6518eABb1F85BD60606dEb39Ec",
    "name": "Wrapped Ether",
    "symbol": "WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd8369c2eda18dd6518eabb1f85bd60606deb39ec/icon",
    "chainId": 42161
  },
  "0xf5cc9c66F42762FAc800972A04b28183cC65Bd6C": {
    "address": "0xf5cc9c66F42762FAc800972A04b28183cC65Bd6C",
    "name": "EGGOR Token",
    "symbol": "EGG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf5cc9c66f42762fac800972a04b28183cc65bd6c/icon",
    "chainId": 42161
  },
  "0x2a23dbF2647C7C065092BB216053Efcbf13229de": {
    "address": "0x2a23dbF2647C7C065092BB216053Efcbf13229de",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2a23dbf2647c7c065092bb216053efcbf13229de/icon",
    "chainId": 42161
  },
  "0xb0a5B5649104Ccf27f9d14E23894c025C21fd4b5": {
    "address": "0xb0a5B5649104Ccf27f9d14E23894c025C21fd4b5",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb0a5b5649104ccf27f9d14e23894c025c21fd4b5/icon",
    "chainId": 42161
  },
  "0x43aB8f7d2A8Dd4102cCEA6b438F6d747b1B9F034": {
    "address": "0x43aB8f7d2A8Dd4102cCEA6b438F6d747b1B9F034",
    "name": "Savvy",
    "symbol": "SVY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x43ab8f7d2a8dd4102ccea6b438f6d747b1b9f034/icon",
    "chainId": 42161
  },
  "0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12": {
    "address": "0x21E60EE73F17AC0A411ae5D690f908c3ED66Fe12",
    "name": "Deri",
    "symbol": "DERI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x21e60ee73f17ac0a411ae5d690f908c3ed66fe12/icon",
    "chainId": 42161
  },
  "0x6F28B4C7887808186bCfAf361Ee12d03b0482E36": {
    "address": "0x6F28B4C7887808186bCfAf361Ee12d03b0482E36",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6f28b4c7887808186bcfaf361ee12d03b0482e36/icon",
    "chainId": 42161
  },
  "0xb0d62768e2Fb9bD437a51B993b77B93Ac9F249d5": {
    "address": "0xb0d62768e2Fb9bD437a51B993b77B93Ac9F249d5",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb0d62768e2fb9bd437a51b993b77b93ac9f249d5/icon",
    "chainId": 42161
  },
  "0x631E77a55a6dDf7b9a95D5a1a1bCaB6D938C6747": {
    "address": "0x631E77a55a6dDf7b9a95D5a1a1bCaB6D938C6747",
    "name": "ArbiBomb",
    "symbol": "AriB",
    "decimals": 0,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x631e77a55a6ddf7b9a95d5a1a1bcab6d938c6747/icon",
    "chainId": 42161
  },
  "0xdf28f508Abc1Ce0Ae82b7e07a79f6cde15D1F5fe": {
    "address": "0xdf28f508Abc1Ce0Ae82b7e07a79f6cde15D1F5fe",
    "name": "WTFUCK Token",
    "symbol": "WTFUCK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdf28f508abc1ce0ae82b7e07a79f6cde15d1f5fe/icon",
    "chainId": 42161
  },
  "0xeBc148d40313Be9C9F214d3BEB9F2ddEbeC0Ec52": {
    "address": "0xeBc148d40313Be9C9F214d3BEB9F2ddEbeC0Ec52",
    "name": "StereoAI",
    "symbol": "STAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xebc148d40313be9c9f214d3beb9f2ddebec0ec52/icon",
    "chainId": 42161
  },
  "0x835a1BcA3e5da0752dD73BD3f89AC0357fD34943": {
    "address": "0x835a1BcA3e5da0752dD73BD3f89AC0357fD34943",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x835a1bca3e5da0752dd73bd3f89ac0357fd34943/icon",
    "chainId": 42161
  },
  "0x473F0aF5259195bF4fB5669d6c30C42F2e80bcA0": {
    "address": "0x473F0aF5259195bF4fB5669d6c30C42F2e80bcA0",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x473f0af5259195bf4fb5669d6c30c42f2e80bca0/icon",
    "chainId": 42161
  },
  "0x4F7ecB899871114F75c052D94a74ebd316f20660": {
    "address": "0x4F7ecB899871114F75c052D94a74ebd316f20660",
    "name": "StableV1 AMM - LUSD/USDC",
    "symbol": "sAMM-LUSD/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4f7ecb899871114f75c052d94a74ebd316f20660/icon",
    "chainId": 42161
  },
  "0xfd60b1d9D1CB1fC124551382098dCC58613B311A": {
    "address": "0xfd60b1d9D1CB1fC124551382098dCC58613B311A",
    "name": "Solidian",
    "symbol": "SOLIDIAN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfd60b1d9d1cb1fc124551382098dcc58613b311a/icon",
    "chainId": 42161
  },
  "0x2C110867CA90e43D372C1C2E92990B00EA32818b": {
    "address": "0x2C110867CA90e43D372C1C2E92990B00EA32818b",
    "name": "Stabilize Token",
    "symbol": "STBZ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2c110867ca90e43d372c1c2e92990b00ea32818b/icon",
    "chainId": 42161
  },
  "0xD440d56479a647fa4dD98a00efffC94D0c0c0576": {
    "address": "0xD440d56479a647fa4dD98a00efffC94D0c0c0576",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd440d56479a647fa4dd98a00efffc94d0c0c0576/icon",
    "chainId": 42161
  },
  "0x1dBa7641dc69188D6086a73B972aC4bda29Ec35d": {
    "address": "0x1dBa7641dc69188D6086a73B972aC4bda29Ec35d",
    "name": "Curve MIM Pool Vault",
    "symbol": "yvCurve-MIM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1dba7641dc69188d6086a73b972ac4bda29ec35d/icon",
    "chainId": 42161
  },
  "0x1910155BB545F9eB9a87c602C96B46aa0E8241d3": {
    "address": "0x1910155BB545F9eB9a87c602C96B46aa0E8241d3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1910155bb545f9eb9a87c602c96b46aa0e8241d3/icon",
    "chainId": 42161
  },
  "0x39511b74722afE77d532Eb70632B4B59C559019b": {
    "address": "0x39511b74722afE77d532Eb70632B4B59C559019b",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x39511b74722afe77d532eb70632b4b59c559019b/icon",
    "chainId": 42161
  },
  "0xf3b9bDCC2994543C9D3Ca04D062D7c0BAFE561F4": {
    "address": "0xf3b9bDCC2994543C9D3Ca04D062D7c0BAFE561F4",
    "name": "Degen Millionaires Club",
    "symbol": "DMC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf3b9bdcc2994543c9d3ca04d062d7c0bafe561f4/icon",
    "chainId": 42161
  },
  "0x32073445F666343e6Ce49bBfa8c92588121EAd04": {
    "address": "0x32073445F666343e6Ce49bBfa8c92588121EAd04",
    "name": "PartySocks",
    "symbol": "PSOCKS",
    "decimals": 0,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32073445f666343e6ce49bbfa8c92588121ead04/icon",
    "chainId": 42161
  },
  "0xa95c58057a24df33b3Ebc25bdA9afE5c4685D6Df": {
    "address": "0xa95c58057a24df33b3Ebc25bdA9afE5c4685D6Df",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa95c58057a24df33b3ebc25bda9afe5c4685d6df/icon",
    "chainId": 42161
  },
  "0x0E2D98C30485BC2B7D2Db75a6815A686b2cB5026": {
    "address": "0x0E2D98C30485BC2B7D2Db75a6815A686b2cB5026",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0e2d98c30485bc2b7d2db75a6815a686b2cb5026/icon",
    "chainId": 42161
  },
  "0x73474183a94956CD304c6c5A504923D8150bd9CE": {
    "address": "0x73474183a94956CD304c6c5A504923D8150bd9CE",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x73474183a94956cd304c6c5a504923d8150bd9ce/icon",
    "chainId": 42161
  },
  "0x067eCEDD510fEEd3906c97894aa7E91d1B43318A": {
    "address": "0x067eCEDD510fEEd3906c97894aa7E91d1B43318A",
    "name": "zLiqStake3M(ETH)",
    "symbol": "zLST3METH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x067ecedd510feed3906c97894aa7e91d1b43318a/icon",
    "chainId": 42161
  },
  "0xb5138e6671392184B9dA2040A7fe7b099a7DD1D4": {
    "address": "0xb5138e6671392184B9dA2040A7fe7b099a7DD1D4",
    "name": "OmniXRC",
    "symbol": "OXRC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb5138e6671392184b9da2040a7fe7b099a7dd1d4/icon",
    "chainId": 42161
  },
  "0x0C1b27e86005BB36251A6639c3a8c3343D19F389": {
    "address": "0x0C1b27e86005BB36251A6639c3a8c3343D19F389",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c1b27e86005bb36251a6639c3a8c3343d19f389/icon",
    "chainId": 42161
  },
  "0x99f2e02E2a7bB35587BaA55680C08FeBFDFA0497": {
    "address": "0x99f2e02E2a7bB35587BaA55680C08FeBFDFA0497",
    "name": "PEPEmoon",
    "symbol": "PEPEmoon",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x99f2e02e2a7bb35587baa55680c08febfdfa0497/icon",
    "chainId": 42161
  },
  "0x29C1EA5ED7af53094b1a79eF60d20641987c867e": {
    "address": "0x29C1EA5ED7af53094b1a79eF60d20641987c867e",
    "name": "Acid",
    "symbol": "ACID",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x29c1ea5ed7af53094b1a79ef60d20641987c867e/icon",
    "chainId": 42161
  },
  "0xD713a0968A2Ef8f39655fB7522AA14d3eCa859f8": {
    "address": "0xD713a0968A2Ef8f39655fB7522AA14d3eCa859f8",
    "name": "AI Dog",
    "symbol": "AIDOG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd713a0968a2ef8f39655fb7522aa14d3eca859f8/icon",
    "chainId": 42161
  },
  "0x8fa43CA179cdcf68B1F6c5D6eE82D0DC6F7D3501": {
    "address": "0x8fa43CA179cdcf68B1F6c5D6eE82D0DC6F7D3501",
    "name": "SnipeAI",
    "symbol": "SNIPE",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8fa43ca179cdcf68b1f6c5d6ee82d0dc6f7d3501/icon",
    "chainId": 42161
  },
  "0x1D36ceAe3C88F1c39Ee96f577c7b0274Cfc61193": {
    "address": "0x1D36ceAe3C88F1c39Ee96f577c7b0274Cfc61193",
    "name": "ARBixel",
    "symbol": "BIXEL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1d36ceae3c88f1c39ee96f577c7b0274cfc61193/icon",
    "chainId": 42161
  },
  "0x0Ce6C0c84F9DBEf72a298cF4B80a69f02A219a7C": {
    "address": "0x0Ce6C0c84F9DBEf72a298cF4B80a69f02A219a7C",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0ce6c0c84f9dbef72a298cf4b80a69f02a219a7c/icon",
    "chainId": 42161
  },
  "0x8b8149Dd385955DC1cE77a4bE7700CCD6a212e65": {
    "address": "0x8b8149Dd385955DC1cE77a4bE7700CCD6a212e65",
    "name": "Zyber LP",
    "symbol": "ZLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8b8149dd385955dc1ce77a4be7700ccd6a212e65/icon",
    "chainId": 42161
  },
  "0xD8c77726cF483e5ACb7D632610bE0c2237fB3fB1": {
    "address": "0xD8c77726cF483e5ACb7D632610bE0c2237fB3fB1",
    "name": "WODIU",
    "symbol": "WODIU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd8c77726cf483e5acb7d632610be0c2237fb3fb1/icon",
    "chainId": 42161
  },
  "0xc85d90dec1E12eDee418C445b381E7168EB380Ab": {
    "address": "0xc85d90dec1E12eDee418C445b381E7168EB380Ab",
    "name": "29WBTC-4wstETH-67ARB",
    "symbol": "29WBTC-4wstETH-67ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc85d90dec1e12edee418c445b381e7168eb380ab/icon",
    "chainId": 42161
  },
  "0xEf6F79CB2F59486179eF6D94D835A0ac01b1739C": {
    "address": "0xEf6F79CB2F59486179eF6D94D835A0ac01b1739C",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xef6f79cb2f59486179ef6d94d835a0ac01b1739c/icon",
    "chainId": 42161
  },
  "0x3DD149f50Efa93c302d49CED2a07EE3072Ac044f": {
    "address": "0x3DD149f50Efa93c302d49CED2a07EE3072Ac044f",
    "name": "boomer bucks",
    "symbol": "BOOMERINOS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3dd149f50efa93c302d49ced2a07ee3072ac044f/icon",
    "chainId": 42161
  },
  "0x759826BC0ed628A7A77d2831c498e4273BEF5d43": {
    "address": "0x759826BC0ed628A7A77d2831c498e4273BEF5d43",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x759826bc0ed628a7a77d2831c498e4273bef5d43/icon",
    "chainId": 42161
  },
  "0xC2AB73060B819D63dEBc7aF367a98d0E45af1fF2": {
    "address": "0xC2AB73060B819D63dEBc7aF367a98d0E45af1fF2",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc2ab73060b819d63debc7af367a98d0e45af1ff2/icon",
    "chainId": 42161
  },
  "0xB7D3F661ec5f7d780dDefe9bccD2250e3548B640": {
    "address": "0xB7D3F661ec5f7d780dDefe9bccD2250e3548B640",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb7d3f661ec5f7d780ddefe9bccd2250e3548b640/icon",
    "chainId": 42161
  },
  "0xD1c533a00548Dd9C1e7b0f8Ea834F65383b116De": {
    "address": "0xD1c533a00548Dd9C1e7b0f8Ea834F65383b116De",
    "name": "MetaPocket",
    "symbol": "MPCKT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd1c533a00548dd9c1e7b0f8ea834f65383b116de/icon",
    "chainId": 42161
  },
  "0x124114F8E5e6D08F6944ccc89e1704d6D984756e": {
    "address": "0x124114F8E5e6D08F6944ccc89e1704d6D984756e",
    "name": "OlympianInu",
    "symbol": "OPI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x124114f8e5e6d08f6944ccc89e1704d6d984756e/icon",
    "chainId": 42161
  },
  "0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6": {
    "address": "0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6",
    "name": "LEPE",
    "symbol": "LEPE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6cb0e4da8f621a3901573bd8c8d2c8a0987d78d6/icon",
    "chainId": 42161
  },
  "0x42e9Dc3F1a7dD582E81d2edF7e5C4869007ce14A": {
    "address": "0x42e9Dc3F1a7dD582E81d2edF7e5C4869007ce14A",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x42e9dc3f1a7dd582e81d2edf7e5c4869007ce14a/icon",
    "chainId": 42161
  },
  "0xC3755CC2EBD8916f0999a4a685b736A6d909a4a9": {
    "address": "0xC3755CC2EBD8916f0999a4a685b736A6d909a4a9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc3755cc2ebd8916f0999a4a685b736a6d909a4a9/icon",
    "chainId": 42161
  },
  "0xDB2DF3a973d522F73E55F2d3392f9BaA091f0756": {
    "address": "0xDB2DF3a973d522F73E55F2d3392f9BaA091f0756",
    "name": "yGLP",
    "symbol": "yGLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdb2df3a973d522f73e55f2d3392f9baa091f0756/icon",
    "chainId": 42161
  },
  "0x434e5028dfAb847ad6c26a5830f0214B0555CCa0": {
    "address": "0x434e5028dfAb847ad6c26a5830f0214B0555CCa0",
    "name": "BABY WALL STREET MEMES",
    "symbol": "BWSM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x434e5028dfab847ad6c26a5830f0214b0555cca0/icon",
    "chainId": 42161
  },
  "0xFd9090af7FB44b6D6F8b9Efd730939804bC27349": {
    "address": "0xFd9090af7FB44b6D6F8b9Efd730939804bC27349",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfd9090af7fb44b6d6f8b9efd730939804bc27349/icon",
    "chainId": 42161
  },
  "0x719581902349b9e178Bb9076cdd90C83b26F5173": {
    "address": "0x719581902349b9e178Bb9076cdd90C83b26F5173",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x719581902349b9e178bb9076cdd90c83b26f5173/icon",
    "chainId": 42161
  },
  "0xC6634A3B02ADA130eE585Dbb35fb8c7BC35515AE": {
    "address": "0xC6634A3B02ADA130eE585Dbb35fb8c7BC35515AE",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc6634a3b02ada130ee585dbb35fb8c7bc35515ae/icon",
    "chainId": 42161
  },
  "0x8eD4191F81F1e1D24a8a1195267D024d9358c9d7": {
    "address": "0x8eD4191F81F1e1D24a8a1195267D024d9358c9d7",
    "name": "Magnethereum",
    "symbol": "MAGNET",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8ed4191f81f1e1d24a8a1195267d024d9358c9d7/icon",
    "chainId": 42161
  },
  "0x8fBD795443245Af13Db38B5a6b281bbe7C0F251a": {
    "address": "0x8fBD795443245Af13Db38B5a6b281bbe7C0F251a",
    "name": "SwordAI",
    "symbol": "SwordAI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8fbd795443245af13db38b5a6b281bbe7c0f251a/icon",
    "chainId": 42161
  },
  "0x99Cca3Fbc4c6E18D3A8De7541e6B722187821fda": {
    "address": "0x99Cca3Fbc4c6E18D3A8De7541e6B722187821fda",
    "name": "SYNAPSE",
    "symbol": "SYNAPSE",
    "decimals": 4,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x99cca3fbc4c6e18d3a8de7541e6b722187821fda/icon",
    "chainId": 42161
  },
  "0xb4bbfE92702730ef7F1d28e4b9E42381182F48a5": {
    "address": "0xb4bbfE92702730ef7F1d28e4b9E42381182F48a5",
    "name": "HOLD TOKEN",
    "symbol": "HOLD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb4bbfe92702730ef7f1d28e4b9e42381182f48a5/icon",
    "chainId": 42161
  },
  "0xd978EdbaBB02D5ab2A948d15AfeF256C7Ce7d767": {
    "address": "0xd978EdbaBB02D5ab2A948d15AfeF256C7Ce7d767",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd978edbabb02d5ab2a948d15afef256c7ce7d767/icon",
    "chainId": 42161
  },
  "0xe4aD045aBB586dbDaE6b11A4d2c6FF5434B93Ed1": {
    "address": "0xe4aD045aBB586dbDaE6b11A4d2c6FF5434B93Ed1",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe4ad045abb586dbdae6b11a4d2c6ff5434b93ed1/icon",
    "chainId": 42161
  },
  "0x0A59F71431Bb9CfBEc0af9B8D1c043017b38e761": {
    "address": "0x0A59F71431Bb9CfBEc0af9B8D1c043017b38e761",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0a59f71431bb9cfbec0af9b8d1c043017b38e761/icon",
    "chainId": 42161
  },
  "0x3821A1dCd4E3F9e2787EAc3ea0838031F7d1bbFE": {
    "address": "0x3821A1dCd4E3F9e2787EAc3ea0838031F7d1bbFE",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3821a1dcd4e3f9e2787eac3ea0838031f7d1bbfe/icon",
    "chainId": 42161
  },
  "0x17a35E3D578797e34131d10e66c11170848c6Da1": {
    "address": "0x17a35E3D578797e34131d10e66c11170848c6Da1",
    "name": "33 1S-BTC 33 1L-BTC 33 USDC",
    "symbol": "33 1S-BTC 33 1L-BTC 33 USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x17a35e3d578797e34131d10e66c11170848c6da1/icon",
    "chainId": 42161
  },
  "0xBEf0723894a9dB43785c8409f743334379394181": {
    "address": "0xBEf0723894a9dB43785c8409f743334379394181",
    "name": "Arbitrum-Peg ArbDogecoin",
    "symbol": "ARBDOGE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbef0723894a9db43785c8409f743334379394181/icon",
    "chainId": 42161
  },
  "0x86b3353387F560295a8Fa7902679735E5f076Bd5": {
    "address": "0x86b3353387F560295a8Fa7902679735E5f076Bd5",
    "name": "Omicron",
    "symbol": "OMIC",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x86b3353387f560295a8fa7902679735e5f076bd5/icon",
    "chainId": 42161
  },
  "0xf2b945860457C2c2AeD2396f942Bb34Eb55E753f": {
    "address": "0xf2b945860457C2c2AeD2396f942Bb34Eb55E753f",
    "name": "Clippy",
    "symbol": "CLIPPY",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf2b945860457c2c2aed2396f942bb34eb55e753f/icon",
    "chainId": 42161
  },
  "0x052814194f459aF30EdB6a506eABFc85a4D99501": {
    "address": "0x052814194f459aF30EdB6a506eABFc85a4D99501",
    "name": "1S-BTC/USD",
    "symbol": "1S-BTC/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x052814194f459af30edb6a506eabfc85a4d99501/icon",
    "chainId": 42161
  },
  "0x1616bF7bbd60E57f961E83A602B6b9Abb6E6CAFc": {
    "address": "0x1616bF7bbd60E57f961E83A602B6b9Abb6E6CAFc",
    "name": "1L-BTC/USD",
    "symbol": "1L-BTC/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1616bf7bbd60e57f961e83a602b6b9abb6e6cafc/icon",
    "chainId": 42161
  },
  "0xaEFAeAbCa7CDA88DEC13008c972dc52F49Ca125D": {
    "address": "0xaEFAeAbCa7CDA88DEC13008c972dc52F49Ca125D",
    "name": "Degenopoly",
    "symbol": "DPOLY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaefaeabca7cda88dec13008c972dc52f49ca125d/icon",
    "chainId": 42161
  },
  "0x056dD3A3Ad8C35B1E9134F7cE3FA1786119D5F26": {
    "address": "0x056dD3A3Ad8C35B1E9134F7cE3FA1786119D5F26",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x056dd3a3ad8c35b1e9134f7ce3fa1786119d5f26/icon",
    "chainId": 42161
  },
  "0x6CC0D643C7b8709F468f58F363d73Af6e4971515": {
    "address": "0x6CC0D643C7b8709F468f58F363d73Af6e4971515",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6cc0d643c7b8709f468f58f363d73af6e4971515/icon",
    "chainId": 42161
  },
  "0x0a2099281411ee22e19B8308a0fb027E9861C4a8": {
    "address": "0x0a2099281411ee22e19B8308a0fb027E9861C4a8",
    "name": "MERLIN",
    "symbol": "MERLIN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0a2099281411ee22e19b8308a0fb027e9861c4a8/icon",
    "chainId": 42161
  },
  "0x3F7ae85208A79854197dc5FD9b5c562B83903837": {
    "address": "0x3F7ae85208A79854197dc5FD9b5c562B83903837",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3f7ae85208a79854197dc5fd9b5c562b83903837/icon",
    "chainId": 42161
  },
  "0xc858eE896aF182ECEe5c8B95d3E8CBBEC058383E": {
    "address": "0xc858eE896aF182ECEe5c8B95d3E8CBBEC058383E",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc858ee896af182ecee5c8b95d3e8cbbec058383e/icon",
    "chainId": 42161
  },
  "0x73e80b6623D84E1233E77230537b52557aEf077a": {
    "address": "0x73e80b6623D84E1233E77230537b52557aEf077a",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x73e80b6623d84e1233e77230537b52557aef077a/icon",
    "chainId": 42161
  },
  "0x1778Da37A6e1cEd51d804Ab9992C64F40E263688": {
    "address": "0x1778Da37A6e1cEd51d804Ab9992C64F40E263688",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1778da37a6e1ced51d804ab9992c64f40e263688/icon",
    "chainId": 42161
  },
  "0x6c3B06AA6e0565B9f24778FD8a044CC4bbC4cD93": {
    "address": "0x6c3B06AA6e0565B9f24778FD8a044CC4bbC4cD93",
    "name": "ArbFI (https://t.me/arbfiofficial)",
    "symbol": "ArbFI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6c3b06aa6e0565b9f24778fd8a044cc4bbc4cd93/icon",
    "chainId": 42161
  },
  "0x986a3DB4317177b4F84b05127E9e39a7Abd7187A": {
    "address": "0x986a3DB4317177b4F84b05127E9e39a7Abd7187A",
    "name": "CatKing",
    "symbol": "CKING",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x986a3db4317177b4f84b05127e9e39a7abd7187a/icon",
    "chainId": 42161
  },
  "0x87Af18Da5e7bA884E6ea5fa8C0bcbc09aC5D6B56": {
    "address": "0x87Af18Da5e7bA884E6ea5fa8C0bcbc09aC5D6B56",
    "name": "TTT Token",
    "symbol": "TTTT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x87af18da5e7ba884e6ea5fa8c0bcbc09ac5d6b56/icon",
    "chainId": 42161
  },
  "0x030CcD5212ad6F13834f33D60B22e9234D198eBc": {
    "address": "0x030CcD5212ad6F13834f33D60B22e9234D198eBc",
    "name": "Barbinu",
    "symbol": "BARBINU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x030ccd5212ad6f13834f33d60b22e9234d198ebc/icon",
    "chainId": 42161
  },
  "0x3dFe1324A0ee9d86337d06aEB829dEb4528DB9CA": {
    "address": "0x3dFe1324A0ee9d86337d06aEB829dEb4528DB9CA",
    "name": "Curve EURS-2Crv",
    "symbol": "crvEURSUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3dfe1324a0ee9d86337d06aeb829deb4528db9ca/icon",
    "chainId": 42161
  },
  "0xD22a58f79e9481D1a88e00c343885A588b34b68B": {
    "address": "0xD22a58f79e9481D1a88e00c343885A588b34b68B",
    "name": "STASIS EURS Token",
    "symbol": "EURS",
    "decimals": 2,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd22a58f79e9481d1a88e00c343885a588b34b68b/icon",
    "chainId": 42161
  },
  "0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50": {
    "address": "0xE99c8A590c98c7Ae9FB3B7ecbC115D2eBD533B50",
    "name": "Moo Sushi USDT-WETH",
    "symbol": "mooSushiUSDT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe99c8a590c98c7ae9fb3b7ecbc115d2ebd533b50/icon",
    "chainId": 42161
  },
  "0xb0Fb1787238879171Edc30b9730968600D55762A": {
    "address": "0xb0Fb1787238879171Edc30b9730968600D55762A",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb0fb1787238879171edc30b9730968600d55762a/icon",
    "chainId": 42161
  },
  "0xA9E1aEfF84b76b22ca388d729C3C349f18e78594": {
    "address": "0xA9E1aEfF84b76b22ca388d729C3C349f18e78594",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa9e1aeff84b76b22ca388d729c3c349f18e78594/icon",
    "chainId": 42161
  },
  "0x9e523234D36973f9e38642886197D023C88e307e": {
    "address": "0x9e523234D36973f9e38642886197D023C88e307e",
    "name": "Darwinia Network Native Token",
    "symbol": "RING",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9e523234d36973f9e38642886197d023c88e307e/icon",
    "chainId": 42161
  },
  "0xE4E02d69dfACC482DbFBCB4F5F173bC378422717": {
    "address": "0xE4E02d69dfACC482DbFBCB4F5F173bC378422717",
    "name": "ArbiMars",
    "symbol": "aMars",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe4e02d69dfacc482dbfbcb4f5f173bc378422717/icon",
    "chainId": 42161
  },
  "0xD00694E26b2B623BAD4ea94d746afE36907d432E": {
    "address": "0xD00694E26b2B623BAD4ea94d746afE36907d432E",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd00694e26b2b623bad4ea94d746afe36907d432e/icon",
    "chainId": 42161
  },
  "0x38d6C800C8D50A34B8F79CF8549aA488873a4F18": {
    "address": "0x38d6C800C8D50A34B8F79CF8549aA488873a4F18",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x38d6c800c8d50a34b8f79cf8549aa488873a4f18/icon",
    "chainId": 42161
  },
  "0x29D0B0dc74ee928725022A8f441787CB8206312b": {
    "address": "0x29D0B0dc74ee928725022A8f441787CB8206312b",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x29d0b0dc74ee928725022a8f441787cb8206312b/icon",
    "chainId": 42161
  },
  "0x58EA7917F74834dbE6b57D0a2a74fb68C1e94c55": {
    "address": "0x58EA7917F74834dbE6b57D0a2a74fb68C1e94c55",
    "name": "ArbTribe",
    "symbol": "$TRIBE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x58ea7917f74834dbe6b57d0a2a74fb68c1e94c55/icon",
    "chainId": 42161
  },
  "0x737fF1b6BC61e72De458dab8087cB8ce84f2f2D6": {
    "address": "0x737fF1b6BC61e72De458dab8087cB8ce84f2f2D6",
    "name": "AIFOOTBALL",
    "symbol": "AIFOOT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x737ff1b6bc61e72de458dab8087cb8ce84f2f2d6/icon",
    "chainId": 42161
  },
  "0x9654D1FC28C65af151D8A2d6A69B306606000000": {
    "address": "0x9654D1FC28C65af151D8A2d6A69B306606000000",
    "name": "TATAN TOKEN",
    "symbol": "TATAN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9654d1fc28c65af151d8a2d6a69b306606000000/icon",
    "chainId": 42161
  },
  "0xba0D34C6141c169EA7d63C71edFF5D84C1816e00": {
    "address": "0xba0D34C6141c169EA7d63C71edFF5D84C1816e00",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xba0d34c6141c169ea7d63c71edff5d84c1816e00/icon",
    "chainId": 42161
  },
  "0x4F865B71e8476D6D84b86E3Bd0dBbE74C80F9419": {
    "address": "0x4F865B71e8476D6D84b86E3Bd0dBbE74C80F9419",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4f865b71e8476d6d84b86e3bd0dbbe74c80f9419/icon",
    "chainId": 42161
  },
  "0x68AC58E8E6209DDb5E263356f3E7cA6aD487b75a": {
    "address": "0x68AC58E8E6209DDb5E263356f3E7cA6aD487b75a",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x68ac58e8e6209ddb5e263356f3e7ca6ad487b75a/icon",
    "chainId": 42161
  },
  "0xDB7D929434F0a52fFE3E5631044776b23E6f8a67": {
    "address": "0xDB7D929434F0a52fFE3E5631044776b23E6f8a67",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdb7d929434f0a52ffe3e5631044776b23e6f8a67/icon",
    "chainId": 42161
  },
  "0x64adfc9c3135755e1659Be3DAb2D18944EC73b48": {
    "address": "0x64adfc9c3135755e1659Be3DAb2D18944EC73b48",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x64adfc9c3135755e1659be3dab2d18944ec73b48/icon",
    "chainId": 42161
  },
  "0x860490C8424b681088A266dffa7808E2f17156f1": {
    "address": "0x860490C8424b681088A266dffa7808E2f17156f1",
    "name": "QR68",
    "symbol": "QR68",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x860490c8424b681088a266dffa7808e2f17156f1/icon",
    "chainId": 42161
  },
  "0xFe6DBFf2589414836F2C16c8dA15e38b472Cd513": {
    "address": "0xFe6DBFf2589414836F2C16c8dA15e38b472Cd513",
    "name": "ShibArbi",
    "symbol": "SHARBI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfe6dbff2589414836f2c16c8da15e38b472cd513/icon",
    "chainId": 42161
  },
  "0xA4e65dC029CBf60Cd9930be6082fa886B17b4B98": {
    "address": "0xA4e65dC029CBf60Cd9930be6082fa886B17b4B98",
    "name": "OceanFund",
    "symbol": "OFU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa4e65dc029cbf60cd9930be6082fa886b17b4b98/icon",
    "chainId": 42161
  },
  "0x9c546eB2998C11CDE81BfE2EcA1d2E4F408d94E6": {
    "address": "0x9c546eB2998C11CDE81BfE2EcA1d2E4F408d94E6",
    "name": "YEE",
    "symbol": "YEE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9c546eb2998c11cde81bfe2eca1d2e4f408d94e6/icon",
    "chainId": 42161
  },
  "0x5d93610568E89eda78bCF342d5082685C4e593A4": {
    "address": "0x5d93610568E89eda78bCF342d5082685C4e593A4",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5d93610568e89eda78bcf342d5082685c4e593a4/icon",
    "chainId": 42161
  },
  "0xaEEdaA39df693e4c06B9d30471E9848C34b70f5c": {
    "address": "0xaEEdaA39df693e4c06B9d30471E9848C34b70f5c",
    "name": "Moo Chronos WETH-ARB",
    "symbol": "mooChronos_WETH-ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaeedaa39df693e4c06b9d30471e9848c34b70f5c/icon",
    "chainId": 42161
  },
  "0xFcECC1B000918dd2fC963f00F301bBb45DC7c523": {
    "address": "0xFcECC1B000918dd2fC963f00F301bBb45DC7c523",
    "name": "Upside World",
    "symbol": "YFIII",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfcecc1b000918dd2fc963f00f301bbb45dc7c523/icon",
    "chainId": 42161
  },
  "0xc9Bb9FE8B51070551035edfFD3A61e6238972A77": {
    "address": "0xc9Bb9FE8B51070551035edfFD3A61e6238972A77",
    "name": "Carbon Negative Token",
    "symbol": "CNTOK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc9bb9fe8b51070551035edffd3a61e6238972a77/icon",
    "chainId": 42161
  },
  "0x01b325acD3170A90ca8399441B7FBD8727598008": {
    "address": "0x01b325acD3170A90ca8399441B7FBD8727598008",
    "name": "VolatileV1 AMM - GND/gmUSD",
    "symbol": "vAMM-GND/gmUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x01b325acd3170a90ca8399441b7fbd8727598008/icon",
    "chainId": 42161
  },
  "0x24Ef78C7092d255Ed14a0281ac1800C359aF3afe": {
    "address": "0x24Ef78C7092d255Ed14a0281ac1800C359aF3afe",
    "name": "Rabbit",
    "symbol": "RAB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x24ef78c7092d255ed14a0281ac1800c359af3afe/icon",
    "chainId": 42161
  },
  "0x6521ab3E7aA42b988F0C8e9205DAeB7a80882c20": {
    "address": "0x6521ab3E7aA42b988F0C8e9205DAeB7a80882c20",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6521ab3e7aa42b988f0c8e9205daeb7a80882c20/icon",
    "chainId": 42161
  },
  "0x776854F68B958a305E26757c989B33A500c2B6D4": {
    "address": "0x776854F68B958a305E26757c989B33A500c2B6D4",
    "name": "Arbitrum Makx",
    "symbol": "aMKX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x776854f68b958a305e26757c989b33a500c2b6d4/icon",
    "chainId": 42161
  },
  "0x22d384216dc0DA846024449BCC03151a565ab501": {
    "address": "0x22d384216dc0DA846024449BCC03151a565ab501",
    "name": "Baby AI",
    "symbol": "AIBS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x22d384216dc0da846024449bcc03151a565ab501/icon",
    "chainId": 42161
  },
  "0xfcD71F152871D7846Dd47e46F96306d63E34CD78": {
    "address": "0xfcD71F152871D7846Dd47e46F96306d63E34CD78",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfcd71f152871d7846dd47e46f96306d63e34cd78/icon",
    "chainId": 42161
  },
  "0x280a16F5D09D3620256f06b75C1CA3ec77a06710": {
    "address": "0x280a16F5D09D3620256f06b75C1CA3ec77a06710",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x280a16f5d09d3620256f06b75c1ca3ec77a06710/icon",
    "chainId": 42161
  },
  "0xa37FF6315C20A3A6210dcdcFaBaA85b804d72B18": {
    "address": "0xa37FF6315C20A3A6210dcdcFaBaA85b804d72B18",
    "name": "War",
    "symbol": "WAR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa37ff6315c20a3a6210dcdcfabaa85b804d72b18/icon",
    "chainId": 42161
  },
  "0xe021047851012D8e981EbD9F3C2CBB8945E996DA": {
    "address": "0xe021047851012D8e981EbD9F3C2CBB8945E996DA",
    "name": "GPT",
    "symbol": "GPT",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe021047851012d8e981ebd9f3c2cbb8945e996da/icon",
    "chainId": 42161
  },
  "0x4b50F53FE89Bf2035272c9aFd68E55DD7400cbea": {
    "address": "0x4b50F53FE89Bf2035272c9aFd68E55DD7400cbea",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4b50f53fe89bf2035272c9afd68e55dd7400cbea/icon",
    "chainId": 42161
  },
  "0xd7121a362268419578339E95CCB498E1d8A95Cea": {
    "address": "0xd7121a362268419578339E95CCB498E1d8A95Cea",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd7121a362268419578339e95ccb498e1d8a95cea/icon",
    "chainId": 42161
  },
  "0x76b9Cbd55FD6776c2de18738A04b0f9da56Ce6cA": {
    "address": "0x76b9Cbd55FD6776c2de18738A04b0f9da56Ce6cA",
    "name": "80BETS/20wstETH Pool Token",
    "symbol": "80BETS/20wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x76b9cbd55fd6776c2de18738a04b0f9da56ce6ca/icon",
    "chainId": 42161
  },
  "0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5": {
    "address": "0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5",
    "name": "BetSwirl v2",
    "symbol": "BETS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x94025780a1ab58868d9b2dbbb775f44b32e8e6e5/icon",
    "chainId": 42161
  },
  "0xa61a7b280B0be6Bf5Fc571104c11Fa5e3cF68F4C": {
    "address": "0xa61a7b280B0be6Bf5Fc571104c11Fa5e3cF68F4C",
    "name": "Bing",
    "symbol": "Bing",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa61a7b280b0be6bf5fc571104c11fa5e3cf68f4c/icon",
    "chainId": 42161
  },
  "0xaDB63c12bCBD1D83aa2CDA782ABdcb1FCFE57D64": {
    "address": "0xaDB63c12bCBD1D83aa2CDA782ABdcb1FCFE57D64",
    "name": "Cuzco",
    "symbol": "CUZ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xadb63c12bcbd1d83aa2cda782abdcb1fcfe57d64/icon",
    "chainId": 42161
  },
  "0xAca2334513Fe3e6c70D60Fbb8Ac3E9D28f1a17dC": {
    "address": "0xAca2334513Fe3e6c70D60Fbb8Ac3E9D28f1a17dC",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaca2334513fe3e6c70d60fbb8ac3e9d28f1a17dc/icon",
    "chainId": 42161
  },
  "0xaDD5620057336f868EAe78A451C503Ae7b576BAD": {
    "address": "0xaDD5620057336f868EAe78A451C503Ae7b576BAD",
    "name": "noiseGPT",
    "symbol": "noiseGPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xadd5620057336f868eae78a451c503ae7b576bad/icon",
    "chainId": 42161
  },
  "0x743b077b103d91109082A7a48e19fFC1093137A5": {
    "address": "0x743b077b103d91109082A7a48e19fFC1093137A5",
    "name": "CHAI",
    "symbol": "CHAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x743b077b103d91109082a7a48e19ffc1093137a5/icon",
    "chainId": 42161
  },
  "0xFFa80008bC3989AcB10B09ED6d3A35E6304A9fb9": {
    "address": "0xFFa80008bC3989AcB10B09ED6d3A35E6304A9fb9",
    "name": "OPTIMUM FUND",
    "symbol": "OMF",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xffa80008bc3989acb10b09ed6d3a35e6304a9fb9/icon",
    "chainId": 42161
  },
  "0xD737D65564ba5AB0D0700F78F961F2F0dED15B9C": {
    "address": "0xD737D65564ba5AB0D0700F78F961F2F0dED15B9C",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd737d65564ba5ab0d0700f78f961f2f0ded15b9c/icon",
    "chainId": 42161
  },
  "0xC7ca0aBfeFBAC7128d0533312532F6Ad8E07ded3": {
    "address": "0xC7ca0aBfeFBAC7128d0533312532F6Ad8E07ded3",
    "name": "XMY",
    "symbol": "XMY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc7ca0abfefbac7128d0533312532f6ad8e07ded3/icon",
    "chainId": 42161
  },
  "0xBe80F8E671890d11C6a716672E01817245b7D574": {
    "address": "0xBe80F8E671890d11C6a716672E01817245b7D574",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbe80f8e671890d11c6a716672e01817245b7d574/icon",
    "chainId": 42161
  },
  "0x5f0C893914344c9B5BB4b28C8322e8A80EE8Cc5b": {
    "address": "0x5f0C893914344c9B5BB4b28C8322e8A80EE8Cc5b",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5f0c893914344c9b5bb4b28c8322e8a80ee8cc5b/icon",
    "chainId": 42161
  },
  "0x32d82c387b1f9AcF6DE9707bEb7801503a840dDd": {
    "address": "0x32d82c387b1f9AcF6DE9707bEb7801503a840dDd",
    "name": "BRETT",
    "symbol": "BRETT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32d82c387b1f9acf6de9707beb7801503a840ddd/icon",
    "chainId": 42161
  },
  "0xEB99748e91AfCA94a6289db3b02E7ef4a8f0A22d": {
    "address": "0xEB99748e91AfCA94a6289db3b02E7ef4a8f0A22d",
    "name": "MahaDAO",
    "symbol": "MAHA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeb99748e91afca94a6289db3b02e7ef4a8f0a22d/icon",
    "chainId": 42161
  },
  "0xC817E0c965c700CbCEd9eC7c5e9ff74Aa41A0038": {
    "address": "0xC817E0c965c700CbCEd9eC7c5e9ff74Aa41A0038",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc817e0c965c700cbced9ec7c5e9ff74aa41a0038/icon",
    "chainId": 42161
  },
  "0x70cc9b2E946e1Ba9b2e13d549b8962B14E5F3521": {
    "address": "0x70cc9b2E946e1Ba9b2e13d549b8962B14E5F3521",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x70cc9b2e946e1ba9b2e13d549b8962b14e5f3521/icon",
    "chainId": 42161
  },
  "0x030D2B3b60e8067d98DB6d9277C0D2651b8AA153": {
    "address": "0x030D2B3b60e8067d98DB6d9277C0D2651b8AA153",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x030d2b3b60e8067d98db6d9277c0d2651b8aa153/icon",
    "chainId": 42161
  },
  "0x9d7C23914609E6Cd47Be1FdcB52c4EDAb297b2b8": {
    "address": "0x9d7C23914609E6Cd47Be1FdcB52c4EDAb297b2b8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9d7c23914609e6cd47be1fdcb52c4edab297b2b8/icon",
    "chainId": 42161
  },
  "0x5ee69Be4EB99902883C216f505A74ac879E9597D": {
    "address": "0x5ee69Be4EB99902883C216f505A74ac879E9597D",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5ee69be4eb99902883c216f505a74ac879e9597d/icon",
    "chainId": 42161
  },
  "0x26274e0dB149c847dF7A3cf1FDe9E93522A42d72": {
    "address": "0x26274e0dB149c847dF7A3cf1FDe9E93522A42d72",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x26274e0db149c847df7a3cf1fde9e93522a42d72/icon",
    "chainId": 42161
  },
  "0x2EF61FbE7ADc237611E847e9beE5ed1a401Fd854": {
    "address": "0x2EF61FbE7ADc237611E847e9beE5ed1a401Fd854",
    "name": "ROLLER",
    "symbol": "ROLL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2ef61fbe7adc237611e847e9bee5ed1a401fd854/icon",
    "chainId": 42161
  },
  "0x92E0598390cA83971dCfAc77fFc27b5431DB63ac": {
    "address": "0x92E0598390cA83971dCfAc77fFc27b5431DB63ac",
    "name": "Game Gem",
    "symbol": "GMGEM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x92e0598390ca83971dcfac77ffc27b5431db63ac/icon",
    "chainId": 42161
  },
  "0x9BA03c4Db8b3eC92d6bC3C2AD76859C058283B76": {
    "address": "0x9BA03c4Db8b3eC92d6bC3C2AD76859C058283B76",
    "name": "EARN Network DAO",
    "symbol": "END",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9ba03c4db8b3ec92d6bc3c2ad76859c058283b76/icon",
    "chainId": 42161
  },
  "0xEA68eC56D5A89f2C674b844b10a4a476E3a995c6": {
    "address": "0xEA68eC56D5A89f2C674b844b10a4a476E3a995c6",
    "name": "Burnitrum",
    "symbol": "BRB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xea68ec56d5a89f2c674b844b10a4a476e3a995c6/icon",
    "chainId": 42161
  },
  "0xB1CD1D319f5363Ed57FCe58a85055ADA0e15A957": {
    "address": "0xB1CD1D319f5363Ed57FCe58a85055ADA0e15A957",
    "name": "Catcoin",
    "symbol": "CATS",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb1cd1d319f5363ed57fce58a85055ada0e15a957/icon",
    "chainId": 42161
  },
  "0xd786cA0a3f6Caa22938CD751B905C39f84555BCB": {
    "address": "0xd786cA0a3f6Caa22938CD751B905C39f84555BCB",
    "name": "AkitaArbi",
    "symbol": "AkitaArbi",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd786ca0a3f6caa22938cd751b905c39f84555bcb/icon",
    "chainId": 42161
  },
  "0x225555F86f6b0fA4F418f41a4865c66096B7452e": {
    "address": "0x225555F86f6b0fA4F418f41a4865c66096B7452e",
    "name": "Moo Balancer wstETH-ETH",
    "symbol": "mooBalancerwstETH-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x225555f86f6b0fa4f418f41a4865c66096b7452e/icon",
    "chainId": 42161
  },
  "0xabbA22B9020f0a31e7E41DC23151e0aD65C089F6": {
    "address": "0xabbA22B9020f0a31e7E41DC23151e0aD65C089F6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xabba22b9020f0a31e7e41dc23151e0ad65c089f6/icon",
    "chainId": 42161
  },
  "0x0adeb25cb5920d4f7447af4a0428072EdC2cEE22": {
    "address": "0x0adeb25cb5920d4f7447af4a0428072EdC2cEE22",
    "name": "80GMX-20WETH",
    "symbol": "80GMX-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0adeb25cb5920d4f7447af4a0428072edc2cee22/icon",
    "chainId": 42161
  },
  "0xFB5e6d0c1DfeD2BA000fBC040Ab8DF3615AC329c": {
    "address": "0xFB5e6d0c1DfeD2BA000fBC040Ab8DF3615AC329c",
    "name": "Balancer stETH StablePool",
    "symbol": "B-stETH-Stable",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c/icon",
    "chainId": 42161
  },
  "0x9e931846720Ba38B69F046B1f04a74Ad4e23549d": {
    "address": "0x9e931846720Ba38B69F046B1f04a74Ad4e23549d",
    "name": "ArbLaunch",
    "symbol": "AL",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9e931846720ba38b69f046b1f04a74ad4e23549d/icon",
    "chainId": 42161
  },
  "0x6d944C69A38f1caB3CfaC6FaD09e26aDD6F53864": {
    "address": "0x6d944C69A38f1caB3CfaC6FaD09e26aDD6F53864",
    "name": "Moo SolidLizard USDC-USDT",
    "symbol": "mooSolidLizardUSDC-USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6d944c69a38f1cab3cfac6fad09e26add6f53864/icon",
    "chainId": 42161
  },
  "0xa69F34ceA347a2956266AD4e20A5d709A760A4b1": {
    "address": "0xa69F34ceA347a2956266AD4e20A5d709A760A4b1",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa69f34cea347a2956266ad4e20a5d709a760a4b1/icon",
    "chainId": 42161
  },
  "0x4cD44E6fCfA68bf797c65889c74B26b8C2e5d4d3": {
    "address": "0x4cD44E6fCfA68bf797c65889c74B26b8C2e5d4d3",
    "name": "Radiant interest bearing WBTC",
    "symbol": "rWBTC",
    "decimals": 8,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4cd44e6fcfa68bf797c65889c74b26b8c2e5d4d3/icon",
    "chainId": 42161
  },
  "0x5C8DCbeBEC3ab2A9ab15805E6758Fe541A64aec2": {
    "address": "0x5C8DCbeBEC3ab2A9ab15805E6758Fe541A64aec2",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5c8dcbebec3ab2a9ab15805e6758fe541a64aec2/icon",
    "chainId": 42161
  },
  "0x3Cf3147BeDf97A1181C980a4811889c0059E4ae9": {
    "address": "0x3Cf3147BeDf97A1181C980a4811889c0059E4ae9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3cf3147bedf97a1181c980a4811889c0059e4ae9/icon",
    "chainId": 42161
  },
  "0x651e00FfD5eCfA7F3d4F33d62eDe0a97Cf62EdE2": {
    "address": "0x651e00FfD5eCfA7F3d4F33d62eDe0a97Cf62EdE2",
    "name": "Balancer 80 LINK 20 WETH",
    "symbol": "B-80LINK-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x651e00ffd5ecfa7f3d4f33d62ede0a97cf62ede2/icon",
    "chainId": 42161
  },
  "0xC9dF93497B1852552F2200701cE58C236cC0378C": {
    "address": "0xC9dF93497B1852552F2200701cE58C236cC0378C",
    "name": "Stable AMM - USDT/USDC",
    "symbol": "sAMM-USDT/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc9df93497b1852552f2200701ce58c236cc0378c/icon",
    "chainId": 42161
  },
  "0x55162e966Bd7dcE0A471Ce3BC6A8DC751317613D": {
    "address": "0x55162e966Bd7dcE0A471Ce3BC6A8DC751317613D",
    "name": "STOP VIOLENCE LEARN",
    "symbol": "LEARN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x55162e966bd7dce0a471ce3bc6a8dc751317613d/icon",
    "chainId": 42161
  },
  "0x1de48982d5c222327532193FbDFB30EFBf997bF7": {
    "address": "0x1de48982d5c222327532193FbDFB30EFBf997bF7",
    "name": "SurfPepe",
    "symbol": "SPEPE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1de48982d5c222327532193fbdfb30efbf997bf7/icon",
    "chainId": 42161
  },
  "0x48482bF68B4c963EE415b477f66a437b63958045": {
    "address": "0x48482bF68B4c963EE415b477f66a437b63958045",
    "name": "ArbiBull",
    "symbol": "ABull",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x48482bf68b4c963ee415b477f66a437b63958045/icon",
    "chainId": 42161
  },
  "0x590cF2967edbAAbEC4F968529cC0bc4e6B2Dd6f4": {
    "address": "0x590cF2967edbAAbEC4F968529cC0bc4e6B2Dd6f4",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x590cf2967edbaabec4f968529cc0bc4e6b2dd6f4/icon",
    "chainId": 42161
  },
  "0x76Bb611D52AE46E53EC828460eB54c6ee0F008cF": {
    "address": "0x76Bb611D52AE46E53EC828460eB54c6ee0F008cF",
    "name": "Arbnb",
    "symbol": "ARBNB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x76bb611d52ae46e53ec828460eb54c6ee0f008cf/icon",
    "chainId": 42161
  },
  "0x9EF1AFCCfFAA70108B299652F010F646F5C8cd22": {
    "address": "0x9EF1AFCCfFAA70108B299652F010F646F5C8cd22",
    "name": "Moo Uniswap Gamma MAGIC-WETH",
    "symbol": "mooUniswapGammaMAGIC-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9ef1afccffaa70108b299652f010f646f5c8cd22/icon",
    "chainId": 42161
  },
  "0xD7Ff33AA0aa24e6507af984E7e34cB43AA906e84": {
    "address": "0xD7Ff33AA0aa24e6507af984E7e34cB43AA906e84",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd7ff33aa0aa24e6507af984e7e34cb43aa906e84/icon",
    "chainId": 42161
  },
  "0x2A8104c4E5E0cCaCCD84E3Ab0F463fBAA7498981": {
    "address": "0x2A8104c4E5E0cCaCCD84E3Ab0F463fBAA7498981",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2a8104c4e5e0ccaccd84e3ab0f463fbaa7498981/icon",
    "chainId": 42161
  },
  "0x5D25C880adDA6E6A6D7edE05b40F7558fcaC9271": {
    "address": "0x5D25C880adDA6E6A6D7edE05b40F7558fcaC9271",
    "name": "Peew",
    "symbol": "PEEW",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5d25c880adda6e6a6d7ede05b40f7558fcac9271/icon",
    "chainId": 42161
  },
  "0x9F0166a37A511d2D6647864Dd0abDc1Ef6699a0C": {
    "address": "0x9F0166a37A511d2D6647864Dd0abDc1Ef6699a0C",
    "name": "xMAGIC-WETH3",
    "symbol": "xMAGIC-WETH3",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9f0166a37a511d2d6647864dd0abdc1ef6699a0c/icon",
    "chainId": 42161
  },
  "0x66e221d16592007556291FD5c55Ec250266888Bb": {
    "address": "0x66e221d16592007556291FD5c55Ec250266888Bb",
    "name": "ARBITTER",
    "symbol": "ABT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x66e221d16592007556291fd5c55ec250266888bb/icon",
    "chainId": 42161
  },
  "0xEe9801669C6138E84bD50dEB500827b776777d28": {
    "address": "0xEe9801669C6138E84bD50dEB500827b776777d28",
    "name": "O3 Swap Token",
    "symbol": "O3",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xee9801669c6138e84bd50deb500827b776777d28/icon",
    "chainId": 42161
  },
  "0xDEb440BD695820c46E5C1E8B4bABaEb98a4Ae66b": {
    "address": "0xDEb440BD695820c46E5C1E8B4bABaEb98a4Ae66b",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdeb440bd695820c46e5c1e8b4babaeb98a4ae66b/icon",
    "chainId": 42161
  },
  "0xE64414929FE5Aa1B29562C5C37F2683708D9a2fa": {
    "address": "0xE64414929FE5Aa1B29562C5C37F2683708D9a2fa",
    "name": "AIMarvin",
    "symbol": "AIMarvin",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe64414929fe5aa1b29562c5c37f2683708d9a2fa/icon",
    "chainId": 42161
  },
  "0xfeFCd6C2D5Dee42e5E1aBcfb76F8741e9c830373": {
    "address": "0xfeFCd6C2D5Dee42e5E1aBcfb76F8741e9c830373",
    "name": "Moo Uniswap Gamma RDPX-WETH",
    "symbol": "mooUniswapGammaRDPX-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfefcd6c2d5dee42e5e1abcfb76f8741e9c830373/icon",
    "chainId": 42161
  },
  "0x629Aa19dF31882faC22D7f845ee8053C137a1741": {
    "address": "0x629Aa19dF31882faC22D7f845ee8053C137a1741",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x629aa19df31882fac22d7f845ee8053c137a1741/icon",
    "chainId": 42161
  },
  "0xc3E878fACb776B1A453fC70576c8FefB8ed39Fb1": {
    "address": "0xc3E878fACb776B1A453fC70576c8FefB8ed39Fb1",
    "name": "xRDPX-WETH10",
    "symbol": "xRDPX-WETH10",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc3e878facb776b1a453fc70576c8fefb8ed39fb1/icon",
    "chainId": 42161
  },
  "0xd3D700d3207D26211D956D62d7379A0809841882": {
    "address": "0xd3D700d3207D26211D956D62d7379A0809841882",
    "name": "ARB TOMCAT AI",
    "symbol": "AITOMCAT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd3d700d3207d26211d956d62d7379a0809841882/icon",
    "chainId": 42161
  },
  "0xC4663f169AAFB1d4506CE189D63810E24A8B63ea": {
    "address": "0xC4663f169AAFB1d4506CE189D63810E24A8B63ea",
    "name": "TurismoAI",
    "symbol": "TURAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc4663f169aafb1d4506ce189d63810e24a8b63ea/icon",
    "chainId": 42161
  },
  "0xc04d58eFDf361caf7e370f29Ccd8E32685851a59": {
    "address": "0xc04d58eFDf361caf7e370f29Ccd8E32685851a59",
    "name": "WETH/ARB",
    "symbol": "WETH/ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc04d58efdf361caf7e370f29ccd8e32685851a59/icon",
    "chainId": 42161
  },
  "0x4d1Aceb8B3C74679C6f3F9Ec62b35BF4F4A5C7B0": {
    "address": "0x4d1Aceb8B3C74679C6f3F9Ec62b35BF4F4A5C7B0",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4d1aceb8b3c74679c6f3f9ec62b35bf4f4a5c7b0/icon",
    "chainId": 42161
  },
  "0x93D98B4Caac02385a0ae7caaeADC805F48553F76": {
    "address": "0x93D98B4Caac02385a0ae7caaeADC805F48553F76",
    "name": "Volatile rAMM - WETH/DEUS",
    "symbol": "vrAMM-WETH/DEUS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x93d98b4caac02385a0ae7caaeadc805f48553f76/icon",
    "chainId": 42161
  },
  "0x40b96DAC9386E252E86eaCf330C138561b9dE37c": {
    "address": "0x40b96DAC9386E252E86eaCf330C138561b9dE37c",
    "name": "zGND",
    "symbol": "zGND",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x40b96dac9386e252e86eacf330c138561b9de37c/icon",
    "chainId": 42161
  },
  "0x32df4D7226D8466c74266926589366707144d6cC": {
    "address": "0x32df4D7226D8466c74266926589366707144d6cC",
    "name": "Trader",
    "symbol": "TRADER",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x32df4d7226d8466c74266926589366707144d6cc/icon",
    "chainId": 42161
  },
  "0x8Ddae0eb166628E04C34FB95d42003d55da3E441": {
    "address": "0x8Ddae0eb166628E04C34FB95d42003d55da3E441",
    "name": "Gunners v2",
    "symbol": "g",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8ddae0eb166628e04c34fb95d42003d55da3e441/icon",
    "chainId": 42161
  },
  "0x79bA74E4e351888d5859D2149F56Aed2D69442f3": {
    "address": "0x79bA74E4e351888d5859D2149F56Aed2D69442f3",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x79ba74e4e351888d5859d2149f56aed2d69442f3/icon",
    "chainId": 42161
  },
  "0xD2040A2dD314B7C979482cE1667082Ab0D0f47e2": {
    "address": "0xD2040A2dD314B7C979482cE1667082Ab0D0f47e2",
    "name": "zBlueCryp3M(USDC)",
    "symbol": "zBCryp3MUSDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd2040a2dd314b7c979482ce1667082ab0d0f47e2/icon",
    "chainId": 42161
  },
  "0xAcD1cAeF47E4c47BafE8a51B3F4305Fc38203b7A": {
    "address": "0xAcD1cAeF47E4c47BafE8a51B3F4305Fc38203b7A",
    "name": "Luneko",
    "symbol": "LUNE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xacd1caef47e4c47bafe8a51b3f4305fc38203b7a/icon",
    "chainId": 42161
  },
  "0x5BeDf047ee87d489890ae0016e7725f8f538dbF0": {
    "address": "0x5BeDf047ee87d489890ae0016e7725f8f538dbF0",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5bedf047ee87d489890ae0016e7725f8f538dbf0/icon",
    "chainId": 42161
  },
  "0x051D354e4C7579F8DcaDC13d244fcb6c9568c9d3": {
    "address": "0x051D354e4C7579F8DcaDC13d244fcb6c9568c9d3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x051d354e4c7579f8dcadc13d244fcb6c9568c9d3/icon",
    "chainId": 42161
  },
  "0x3789BE915951E0F0a676588C99E7357D3fDb586B": {
    "address": "0x3789BE915951E0F0a676588C99E7357D3fDb586B",
    "name": "Party Dice",
    "symbol": "DICE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3789be915951e0f0a676588c99e7357d3fdb586b/icon",
    "chainId": 42161
  },
  "0xB61f5a8d65AbD06BB59914B7024b691445fE69c5": {
    "address": "0xB61f5a8d65AbD06BB59914B7024b691445fE69c5",
    "name": "ArbiApe",
    "symbol": "AAPE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb61f5a8d65abd06bb59914b7024b691445fe69c5/icon",
    "chainId": 42161
  },
  "0x1D05Ec50dfE0A44a396B5c68B7c482E90563252D": {
    "address": "0x1D05Ec50dfE0A44a396B5c68B7c482E90563252D",
    "name": "AstroSpaces.io",
    "symbol": "SPACES",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1d05ec50dfe0a44a396b5c68b7c482e90563252d/icon",
    "chainId": 42161
  },
  "0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f": {
    "address": "0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f",
    "name": "Open Exchange Token",
    "symbol": "OX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x78a0a62fba6fb21a83fe8a3433d44c73a4017a6f/icon",
    "chainId": 42161
  },
  "0xFe288714c6708A0907b7AB2B42BD8c2B7a4eC385": {
    "address": "0xFe288714c6708A0907b7AB2B42BD8c2B7a4eC385",
    "name": "KloverToken",
    "symbol": "KVN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfe288714c6708a0907b7ab2b42bd8c2b7a4ec385/icon",
    "chainId": 42161
  },
  "0x85C3e0F63e50a994215969BA9F5259Ee9b96FF52": {
    "address": "0x85C3e0F63e50a994215969BA9F5259Ee9b96FF52",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x85c3e0f63e50a994215969ba9f5259ee9b96ff52/icon",
    "chainId": 42161
  },
  "0xdb0C6fC9E01cD95eb1d3bbAe6689962De489cD7B": {
    "address": "0xdb0C6fC9E01cD95eb1d3bbAe6689962De489cD7B",
    "name": "DSquared Governance Token",
    "symbol": "DSQ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdb0c6fc9e01cd95eb1d3bbae6689962de489cd7b/icon",
    "chainId": 42161
  },
  "0x01dE11cfD3A7261A954db411f02C86D8b826e5d2": {
    "address": "0x01dE11cfD3A7261A954db411f02C86D8b826e5d2",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x01de11cfd3a7261a954db411f02c86d8b826e5d2/icon",
    "chainId": 42161
  },
  "0xe1459247e8dd45010046bd8b34FF45E8E26D7E2F": {
    "address": "0xe1459247e8dd45010046bd8b34FF45E8E26D7E2F",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe1459247e8dd45010046bd8b34ff45e8e26d7e2f/icon",
    "chainId": 42161
  },
  "0xC764B55852F8849Ae69923e45ce077A576bF9a8d": {
    "address": "0xC764B55852F8849Ae69923e45ce077A576bF9a8d",
    "name": "20WETH-80ARB",
    "symbol": "20WETH-80ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc764b55852f8849ae69923e45ce077a576bf9a8d/icon",
    "chainId": 42161
  },
  "0x474f4Fad3909EfBf935Ee9e146318BdDDC465E34": {
    "address": "0x474f4Fad3909EfBf935Ee9e146318BdDDC465E34",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x474f4fad3909efbf935ee9e146318bdddc465e34/icon",
    "chainId": 42161
  },
  "0xa65E65d48015819B16d8d9784A307eb51e1eEcD3": {
    "address": "0xa65E65d48015819B16d8d9784A307eb51e1eEcD3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa65e65d48015819b16d8d9784a307eb51e1eecd3/icon",
    "chainId": 42161
  },
  "0xabf99C558F3FB63a466269aF0E350AB9813e26b9": {
    "address": "0xabf99C558F3FB63a466269aF0E350AB9813e26b9",
    "name": "The Fortune LIama",
    "symbol": "FLC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xabf99c558f3fb63a466269af0e350ab9813e26b9/icon",
    "chainId": 42161
  },
  "0x28a17e0a686878676c76E0d4A10895E8Bf42a410": {
    "address": "0x28a17e0a686878676c76E0d4A10895E8Bf42a410",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x28a17e0a686878676c76e0d4a10895e8bf42a410/icon",
    "chainId": 42161
  },
  "0xDd8b120DdaE0F19b922324012816F2F3Ce529BF8": {
    "address": "0xDd8b120DdaE0F19b922324012816F2F3Ce529BF8",
    "name": "Correlated rAMM - DOLA/USDC",
    "symbol": "crAMM-DOLA/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdd8b120ddae0f19b922324012816f2f3ce529bf8/icon",
    "chainId": 42161
  },
  "0x2Cc24a1f8b7254e9064F4866B852dBcacd313d8B": {
    "address": "0x2Cc24a1f8b7254e9064F4866B852dBcacd313d8B",
    "name": "Dork Lord (ARB)",
    "symbol": "DORK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2cc24a1f8b7254e9064f4866b852dbcacd313d8b/icon",
    "chainId": 42161
  },
  "0xa1F0B35cC60B166ae0563046b80f8ab9761A1ca6": {
    "address": "0xa1F0B35cC60B166ae0563046b80f8ab9761A1ca6",
    "name": "LineFi Metaverse Token",
    "symbol": "LMT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa1f0b35cc60b166ae0563046b80f8ab9761a1ca6/icon",
    "chainId": 42161
  },
  "0xE78987BA38658607358D054224fd1580d1A5Ad13": {
    "address": "0xE78987BA38658607358D054224fd1580d1A5Ad13",
    "name": "milkAI",
    "symbol": "milkAI",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe78987ba38658607358d054224fd1580d1a5ad13/icon",
    "chainId": 42161
  },
  "0x326c33FD1113c1F29B35B4407F3d6312a8518431": {
    "address": "0x326c33FD1113c1F29B35B4407F3d6312a8518431",
    "name": "Strips Token",
    "symbol": "STRP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x326c33fd1113c1f29b35b4407f3d6312a8518431/icon",
    "chainId": 42161
  },
  "0xf38FA591693dDe8416bA7E8B21fd7C510B7f7987": {
    "address": "0xf38FA591693dDe8416bA7E8B21fd7C510B7f7987",
    "name": "Banana Gun",
    "symbol": "BANANA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf38fa591693dde8416ba7e8b21fd7c510b7f7987/icon",
    "chainId": 42161
  },
  "0x4C42fA9Ecc3A17229EDf0fd6A8eec3F11D7E00D3": {
    "address": "0x4C42fA9Ecc3A17229EDf0fd6A8eec3F11D7E00D3",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4c42fa9ecc3a17229edf0fd6a8eec3f11d7e00d3/icon",
    "chainId": 42161
  },
  "0xC9445A9AFe8E48c71459aEdf956eD950e983eC5A": {
    "address": "0xC9445A9AFe8E48c71459aEdf956eD950e983eC5A",
    "name": "StableV1 AMM - USDT/USDC",
    "symbol": "sAMM-USDT/USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc9445a9afe8e48c71459aedf956ed950e983ec5a/icon",
    "chainId": 42161
  },
  "0xb3d24AFcc26E0403590189C0e4CE9c796390B09e": {
    "address": "0xb3d24AFcc26E0403590189C0e4CE9c796390B09e",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb3d24afcc26e0403590189c0e4ce9c796390b09e/icon",
    "chainId": 42161
  },
  "0x1772D876F9dF830693b8004322cb8885B77E47E5": {
    "address": "0x1772D876F9dF830693b8004322cb8885B77E47E5",
    "name": "Auradx",
    "symbol": "DallE2",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1772d876f9df830693b8004322cb8885b77e47e5/icon",
    "chainId": 42161
  },
  "0xA100c25A90c53CAD63BC1c6f13b7e5a51f2ac200": {
    "address": "0xA100c25A90c53CAD63BC1c6f13b7e5a51f2ac200",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa100c25a90c53cad63bc1c6f13b7e5a51f2ac200/icon",
    "chainId": 42161
  },
  "0xE88EAf471629eCb332030493175868508db1001c": {
    "address": "0xE88EAf471629eCb332030493175868508db1001c",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe88eaf471629ecb332030493175868508db1001c/icon",
    "chainId": 42161
  },
  "0x57799B5A9Ca1fbc4Eb8Ae09a8Ca82c02c301F3c1": {
    "address": "0x57799B5A9Ca1fbc4Eb8Ae09a8Ca82c02c301F3c1",
    "name": "Yolo Family",
    "symbol": "YOLO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x57799b5a9ca1fbc4eb8ae09a8ca82c02c301f3c1/icon",
    "chainId": 42161
  },
  "0x9506Cdf2e56B641C4e747aAc8Dac89f453C4Cc05": {
    "address": "0x9506Cdf2e56B641C4e747aAc8Dac89f453C4Cc05",
    "name": "Elons Ladies",
    "symbol": "ELADY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9506cdf2e56b641c4e747aac8dac89f453c4cc05/icon",
    "chainId": 42161
  },
  "0x0FF534801E98A4976246D1f418E441783fc9aa15": {
    "address": "0x0FF534801E98A4976246D1f418E441783fc9aa15",
    "name": "Future AI",
    "symbol": "Future-AI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0ff534801e98a4976246d1f418e441783fc9aa15/icon",
    "chainId": 42161
  },
  "0x3b2c47fC666122e09DC4AfaDfe8a3C854Ba18c75": {
    "address": "0x3b2c47fC666122e09DC4AfaDfe8a3C854Ba18c75",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3b2c47fc666122e09dc4afadfe8a3c854ba18c75/icon",
    "chainId": 42161
  },
  "0x7A1DeC2abA015cFf05Bb654dA2550b88f843A50d": {
    "address": "0x7A1DeC2abA015cFf05Bb654dA2550b88f843A50d",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7a1dec2aba015cff05bb654da2550b88f843a50d/icon",
    "chainId": 42161
  },
  "0x69b2cd28B205B47C8ba427e111dD486f9C461B57": {
    "address": "0x69b2cd28B205B47C8ba427e111dD486f9C461B57",
    "name": "Partyhat",
    "symbol": "PHAT",
    "decimals": 0,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x69b2cd28b205b47c8ba427e111dd486f9c461b57/icon",
    "chainId": 42161
  },
  "0xbb50199AC5D69c3cEc1E028453F4a6f6f4e44C75": {
    "address": "0xbb50199AC5D69c3cEc1E028453F4a6f6f4e44C75",
    "name": "ArbiShiba",
    "symbol": "ASHIB",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbb50199ac5d69c3cec1e028453f4a6f6f4e44c75/icon",
    "chainId": 42161
  },
  "0x9093351Ff2857fEA881808bDFF0CbEA73586F59F": {
    "address": "0x9093351Ff2857fEA881808bDFF0CbEA73586F59F",
    "name": "VolatileV1 AMM - WETH/DCA",
    "symbol": "vAMM-WETH/DCA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9093351ff2857fea881808bdff0cbea73586f59f/icon",
    "chainId": 42161
  },
  "0xE3579ED3823846518dc6B51e31360CEf6CFF189f": {
    "address": "0xE3579ED3823846518dc6B51e31360CEf6CFF189f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe3579ed3823846518dc6b51e31360cef6cff189f/icon",
    "chainId": 42161
  },
  "0x5ed4d6C9Da7852F27a95E9e1605BaA091c00A5F0": {
    "address": "0x5ed4d6C9Da7852F27a95E9e1605BaA091c00A5F0",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5ed4d6c9da7852f27a95e9e1605baa091c00a5f0/icon",
    "chainId": 42161
  },
  "0x6379F45C40C75E7a3Aa697ef07e4bA51bCb1fF66": {
    "address": "0x6379F45C40C75E7a3Aa697ef07e4bA51bCb1fF66",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6379f45c40c75e7a3aa697ef07e4ba51bcb1ff66/icon",
    "chainId": 42161
  },
  "0x4648B887F28a5346AbA5871cB25C58a634c4949f": {
    "address": "0x4648B887F28a5346AbA5871cB25C58a634c4949f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4648b887f28a5346aba5871cb25c58a634c4949f/icon",
    "chainId": 42161
  },
  "0xAFD871f684F21Ab9D7137608C71808f83D75e6fc": {
    "address": "0xAFD871f684F21Ab9D7137608C71808f83D75e6fc",
    "name": "Arbucks",
    "symbol": "BUCK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xafd871f684f21ab9d7137608c71808f83d75e6fc/icon",
    "chainId": 42161
  },
  "0x50E1F910C33F89Ee39008a3015720505228419F2": {
    "address": "0x50E1F910C33F89Ee39008a3015720505228419F2",
    "name": "SHIBACOMING",
    "symbol": "SHIBACOMING",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x50e1f910c33f89ee39008a3015720505228419f2/icon",
    "chainId": 42161
  },
  "0x8148a76Df1C63655E35929d782b2BC544DE4a85d": {
    "address": "0x8148a76Df1C63655E35929d782b2BC544DE4a85d",
    "name": "Cancelled",
    "symbol": "CANCEL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8148a76df1c63655e35929d782b2bc544de4a85d/icon",
    "chainId": 42161
  },
  "0xD38DE430D355a7a8337204c2A4C80392E61475a6": {
    "address": "0xD38DE430D355a7a8337204c2A4C80392E61475a6",
    "name": "DuckyCoinAI",
    "symbol": "DuckyAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd38de430d355a7a8337204c2a4c80392e61475a6/icon",
    "chainId": 42161
  },
  "0xF4a738D9CaE344CEA4165f335d478493a7946f24": {
    "address": "0xF4a738D9CaE344CEA4165f335d478493a7946f24",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf4a738d9cae344cea4165f335d478493a7946f24/icon",
    "chainId": 42161
  },
  "0x39Fb5888789D6953D45bA801dfa32789E8eb8f43": {
    "address": "0x39Fb5888789D6953D45bA801dfa32789E8eb8f43",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x39fb5888789d6953d45ba801dfa32789e8eb8f43/icon",
    "chainId": 42161
  },
  "0xA5fc91bE851AdAbA6db55A60FEc68716dC46C6CE": {
    "address": "0xA5fc91bE851AdAbA6db55A60FEc68716dC46C6CE",
    "name": "Moo Chronos wUSDR-USDC",
    "symbol": "mooChronos_wUSDR-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa5fc91be851adaba6db55a60fec68716dc46c6ce/icon",
    "chainId": 42161
  },
  "0xDE54b643545f710c183D9267869d49bED4823af7": {
    "address": "0xDE54b643545f710c183D9267869d49bED4823af7",
    "name": "Marvelous ERC20",
    "symbol": "merc",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xde54b643545f710c183d9267869d49bed4823af7/icon",
    "chainId": 42161
  },
  "0x86A1012d437BBFf84fbDF62569D12d4FD3396F8c": {
    "address": "0x86A1012d437BBFf84fbDF62569D12d4FD3396F8c",
    "name": "Arbys",
    "symbol": "ARBYS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x86a1012d437bbff84fbdf62569d12d4fd3396f8c/icon",
    "chainId": 42161
  },
  "0x2f800db57B67e7c5216e76590D45B9B0B0BD7dCB": {
    "address": "0x2f800db57B67e7c5216e76590D45B9B0B0BD7dCB",
    "name": "SLURP",
    "symbol": "$SLURP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2f800db57b67e7c5216e76590d45b9b0b0bd7dcb/icon",
    "chainId": 42161
  },
  "0x1E50482e9185D9DAC418768D14b2F2AC2b4DAF39": {
    "address": "0x1E50482e9185D9DAC418768D14b2F2AC2b4DAF39",
    "name": "Volatile rAMM - WETH/RAM",
    "symbol": "vrAMM-WETH/RAM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1e50482e9185d9dac418768d14b2f2ac2b4daf39/icon",
    "chainId": 42161
  },
  "0x359DD9271AC48d4e5Ab30fAc60795C43eaE07dE7": {
    "address": "0x359DD9271AC48d4e5Ab30fAc60795C43eaE07dE7",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x359dd9271ac48d4e5ab30fac60795c43eae07de7/icon",
    "chainId": 42161
  },
  "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418": {
    "address": "0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418",
    "name": "Ramses",
    "symbol": "RAM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418/icon",
    "chainId": 42161
  },
  "0x873484F654a7203296931F529680449E8a642898": {
    "address": "0x873484F654a7203296931F529680449E8a642898",
    "name": "Inverse ETH Volatility Index",
    "symbol": "iETHV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x873484f654a7203296931f529680449e8a642898/icon",
    "chainId": 42161
  },
  "0x7BEc229129965714b86D55d5A9325D21F0DEEddd": {
    "address": "0x7BEc229129965714b86D55d5A9325D21F0DEEddd",
    "name": "Pepe Rew",
    "symbol": "PEPEREW",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7bec229129965714b86d55d5a9325d21f0deeddd/icon",
    "chainId": 42161
  },
  "0x87E2cd6a790FF19B91334c1fc7A900a585a9fce3": {
    "address": "0x87E2cd6a790FF19B91334c1fc7A900a585a9fce3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x87e2cd6a790ff19b91334c1fc7a900a585a9fce3/icon",
    "chainId": 42161
  },
  "0x51B902f19a56F0c8E409a34a215AD2673EDF3284": {
    "address": "0x51B902f19a56F0c8E409a34a215AD2673EDF3284",
    "name": "NFTEarthOFT",
    "symbol": "NFTE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x51b902f19a56f0c8e409a34a215ad2673edf3284/icon",
    "chainId": 42161
  },
  "0x58b9cB810A68a7f3e1E4f8Cb45D1B9B3c79705E8": {
    "address": "0x58b9cB810A68a7f3e1E4f8Cb45D1B9B3c79705E8",
    "name": "Connext",
    "symbol": "NEXT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x58b9cb810a68a7f3e1e4f8cb45d1b9b3c79705e8/icon",
    "chainId": 42161
  },
  "0x6d32C0894BF2F6Ea65828a37b40CBEAab0B7011d": {
    "address": "0x6d32C0894BF2F6Ea65828a37b40CBEAab0B7011d",
    "name": "TAT",
    "symbol": "TAT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6d32c0894bf2f6ea65828a37b40cbeaab0b7011d/icon",
    "chainId": 42161
  },
  "0xD56bdc0459b2155a2F43429016645374019CF4f7": {
    "address": "0xD56bdc0459b2155a2F43429016645374019CF4f7",
    "name": "ChowChow",
    "symbol": "CHOW",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd56bdc0459b2155a2f43429016645374019cf4f7/icon",
    "chainId": 42161
  },
  "0xe28ed3A8FE92fc7Ad6078bAB28B1A34aEFfE857f": {
    "address": "0xe28ed3A8FE92fc7Ad6078bAB28B1A34aEFfE857f",
    "name": "Moo Ramses frxETH-ETH",
    "symbol": "mooRamsesfrxETH-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe28ed3a8fe92fc7ad6078bab28b1a34aeffe857f/icon",
    "chainId": 42161
  },
  "0x8165c70b01b7807351EF0c5ffD3EF010cAbC16fB": {
    "address": "0x8165c70b01b7807351EF0c5ffD3EF010cAbC16fB",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8165c70b01b7807351ef0c5ffd3ef010cabc16fb/icon",
    "chainId": 42161
  },
  "0xe19bf4aB08E22ce081F2C308c80d73CAeF89cC20": {
    "address": "0xe19bf4aB08E22ce081F2C308c80d73CAeF89cC20",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe19bf4ab08e22ce081f2c308c80d73caef89cc20/icon",
    "chainId": 42161
  },
  "0xD65Ef54B1ff5D9a452B32Ac0c304d1674F761061": {
    "address": "0xD65Ef54B1ff5D9a452B32Ac0c304d1674F761061",
    "name": "ArbDex LPs",
    "symbol": "ARX-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd65ef54b1ff5d9a452b32ac0c304d1674f761061/icon",
    "chainId": 42161
  },
  "0xf0c4Af5BE52B52f9512d34c1AF88553D25d7b802": {
    "address": "0xf0c4Af5BE52B52f9512d34c1AF88553D25d7b802",
    "name": "DYOR",
    "symbol": "DYOR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf0c4af5be52b52f9512d34c1af88553d25d7b802/icon",
    "chainId": 42161
  },
  "0x0F8dC1Ee93238100cB0c1D4Cf369B966b449B661": {
    "address": "0x0F8dC1Ee93238100cB0c1D4Cf369B966b449B661",
    "name": "LAN Network",
    "symbol": "LAN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0f8dc1ee93238100cb0c1d4cf369b966b449b661/icon",
    "chainId": 42161
  },
  "0x48D26588dd4a236B12c848A85AEDf6613d4b51Ad": {
    "address": "0x48D26588dd4a236B12c848A85AEDf6613d4b51Ad",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x48d26588dd4a236b12c848a85aedf6613d4b51ad/icon",
    "chainId": 42161
  },
  "0x07F54E527979e81ed7cB7814B0fA59E25c198f13": {
    "address": "0x07F54E527979e81ed7cB7814B0fA59E25c198f13",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x07f54e527979e81ed7cb7814b0fa59e25c198f13/icon",
    "chainId": 42161
  },
  "0xE6FA7c65cc9ddc90C58AA4CAa0e768FccD5BA44e": {
    "address": "0xE6FA7c65cc9ddc90C58AA4CAa0e768FccD5BA44e",
    "name": "Angry Birds",
    "symbol": "Bird",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe6fa7c65cc9ddc90c58aa4caa0e768fccd5ba44e/icon",
    "chainId": 42161
  },
  "0x35F66E6d3A3B432d575D55783344aDB925Ae4Dd3": {
    "address": "0x35F66E6d3A3B432d575D55783344aDB925Ae4Dd3",
    "name": "The_Herd_Mentality",
    "symbol": "SHEEP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x35f66e6d3a3b432d575d55783344adb925ae4dd3/icon",
    "chainId": 42161
  },
  "0x6481312a29D11D49814C6850901766617b3F45Bc": {
    "address": "0x6481312a29D11D49814C6850901766617b3F45Bc",
    "name": "OMM",
    "symbol": "OMM",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6481312a29d11d49814c6850901766617b3f45bc/icon",
    "chainId": 42161
  },
  "0xf82105aA473560CfBF8Cbc6Fd83dB14Eb4028117": {
    "address": "0xf82105aA473560CfBF8Cbc6Fd83dB14Eb4028117",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf82105aa473560cfbf8cbc6fd83db14eb4028117/icon",
    "chainId": 42161
  },
  "0x4Ca517083788890B0A6ecC3ad7e751A19254A6E3": {
    "address": "0x4Ca517083788890B0A6ecC3ad7e751A19254A6E3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4ca517083788890b0a6ecc3ad7e751a19254a6e3/icon",
    "chainId": 42161
  },
  "0xAD435674417520aeeED6b504bBe654d4f556182F": {
    "address": "0xAD435674417520aeeED6b504bBe654d4f556182F",
    "name": "Jarvis Synthetic Euro",
    "symbol": "jEUR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xad435674417520aeeed6b504bbe654d4f556182f/icon",
    "chainId": 42161
  },
  "0x6ECc3348F256a7EA20235B57612A907ace43f098": {
    "address": "0x6ECc3348F256a7EA20235B57612A907ace43f098",
    "name": "Value ERC20",
    "symbol": "VERC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6ecc3348f256a7ea20235b57612a907ace43f098/icon",
    "chainId": 42161
  },
  "0x399142B1AddEbAe810DA82933c7C0e2E7a8eA6e4": {
    "address": "0x399142B1AddEbAe810DA82933c7C0e2E7a8eA6e4",
    "name": "zArbFaucet3M(ARB)",
    "symbol": "zFAUCET3MARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x399142b1addebae810da82933c7c0e2e7a8ea6e4/icon",
    "chainId": 42161
  },
  "0xecAa7A1Cb9fAD0e90A0c177224aB41333d125956": {
    "address": "0xecAa7A1Cb9fAD0e90A0c177224aB41333d125956",
    "name": "Robotoken Three Orbits",
    "symbol": "ROOO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xecaa7a1cb9fad0e90a0c177224ab41333d125956/icon",
    "chainId": 42161
  },
  "0x939d7c12ce6b8a8F51514F87812325aD4348B1A8": {
    "address": "0x939d7c12ce6b8a8F51514F87812325aD4348B1A8",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x939d7c12ce6b8a8f51514f87812325ad4348b1a8/icon",
    "chainId": 42161
  },
  "0x8b7E5D16ea7Fc0a130940fCdEc092BFa02A461c2": {
    "address": "0x8b7E5D16ea7Fc0a130940fCdEc092BFa02A461c2",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8b7e5d16ea7fc0a130940fcdec092bfa02a461c2/icon",
    "chainId": 42161
  },
  "0xD2E5b81A5755279F0ba25B9d1d8EB2E2efa80Aa5": {
    "address": "0xD2E5b81A5755279F0ba25B9d1d8EB2E2efa80Aa5",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd2e5b81a5755279f0ba25b9d1d8eb2e2efa80aa5/icon",
    "chainId": 42161
  },
  "0xbc21DaAaB8bc03d952Df0E13372dAA2840522af6": {
    "address": "0xbc21DaAaB8bc03d952Df0E13372dAA2840522af6",
    "name": "tulipfever",
    "symbol": "TULIP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbc21daaab8bc03d952df0e13372daa2840522af6/icon",
    "chainId": 42161
  },
  "0x2e516BA5Bf3b7eE47fb99B09eaDb60BDE80a82e0": {
    "address": "0x2e516BA5Bf3b7eE47fb99B09eaDb60BDE80a82e0",
    "name": "Arbitrum Eggs",
    "symbol": "aEGGS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2e516ba5bf3b7ee47fb99b09eadb60bde80a82e0/icon",
    "chainId": 42161
  },
  "0xCF72f2d2aE3191FBfD84BCcE2cd101bD80B5f5b9": {
    "address": "0xCF72f2d2aE3191FBfD84BCcE2cd101bD80B5f5b9",
    "name": "Broke",
    "symbol": "BROKE",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcf72f2d2ae3191fbfd84bcce2cd101bd80b5f5b9/icon",
    "chainId": 42161
  },
  "0xDfcD9117eBcdE0D658eEdf0898419638F56B6980": {
    "address": "0xDfcD9117eBcdE0D658eEdf0898419638F56B6980",
    "name": "sohi token",
    "symbol": "sohi ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdfcd9117ebcde0d658eedf0898419638f56b6980/icon",
    "chainId": 42161
  },
  "0x52f462F92a9AB7EcC1Ab03D3Ec0A6bCedB7b4894": {
    "address": "0x52f462F92a9AB7EcC1Ab03D3Ec0A6bCedB7b4894",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x52f462f92a9ab7ecc1ab03d3ec0a6bcedb7b4894/icon",
    "chainId": 42161
  },
  "0xDAd3ABce6Fb87FA0355203b692723A7EE8aa9D63": {
    "address": "0xDAd3ABce6Fb87FA0355203b692723A7EE8aa9D63",
    "name": "Plunge",
    "symbol": "PLG",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdad3abce6fb87fa0355203b692723a7ee8aa9d63/icon",
    "chainId": 42161
  },
  "0x73DF54500E52343516C0110B4863afaD77423B9C": {
    "address": "0x73DF54500E52343516C0110B4863afaD77423B9C",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x73df54500e52343516c0110b4863afad77423b9c/icon",
    "chainId": 42161
  },
  "0xd7D73D0d07c3c1FCEb8a493AbDa1773d23643f13": {
    "address": "0xd7D73D0d07c3c1FCEb8a493AbDa1773d23643f13",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd7d73d0d07c3c1fceb8a493abda1773d23643f13/icon",
    "chainId": 42161
  },
  "0xeFea15B4b6E9b830DBaFa7761108519B253D251A": {
    "address": "0xeFea15B4b6E9b830DBaFa7761108519B253D251A",
    "name": "Zyber LP",
    "symbol": "ZLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xefea15b4b6e9b830dbafa7761108519b253d251a/icon",
    "chainId": 42161
  },
  "0x968f56dCbb7d870dDFbC7Ea053Ce27eA50D1c0F0": {
    "address": "0x968f56dCbb7d870dDFbC7Ea053Ce27eA50D1c0F0",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x968f56dcbb7d870ddfbc7ea053ce27ea50d1c0f0/icon",
    "chainId": 42161
  },
  "0x51d370e11F3F00907071B7a3Ea9EEf00d24CDcA1": {
    "address": "0x51d370e11F3F00907071B7a3Ea9EEf00d24CDcA1",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x51d370e11f3f00907071b7a3ea9eef00d24cdca1/icon",
    "chainId": 42161
  },
  "0xFcc0351f3a1ff72409Df66a7589c1F9efBf53386": {
    "address": "0xFcc0351f3a1ff72409Df66a7589c1F9efBf53386",
    "name": "Corn",
    "symbol": "CORN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfcc0351f3a1ff72409df66a7589c1f9efbf53386/icon",
    "chainId": 42161
  },
  "0xe73394F6a157A0Fa656Da2b73BbEDA85c38dfDeC": {
    "address": "0xe73394F6a157A0Fa656Da2b73BbEDA85c38dfDeC",
    "name": "XIRTAM",
    "symbol": "XIRTAM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe73394f6a157a0fa656da2b73bbeda85c38dfdec/icon",
    "chainId": 42161
  },
  "0x55F654502a5905C90E777C3f564443CA01E81075": {
    "address": "0x55F654502a5905C90E777C3f564443CA01E81075",
    "name": "BOB",
    "symbol": "BOB",
    "decimals": 9,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x55f654502a5905c90e777c3f564443ca01e81075/icon",
    "chainId": 42161
  },
  "0x07789A7C489788Fd23eE599386859D9c32aAAaaa": {
    "address": "0x07789A7C489788Fd23eE599386859D9c32aAAaaa",
    "name": "ARB.e",
    "symbol": "ARB.e",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x07789a7c489788fd23ee599386859d9c32aaaaaa/icon",
    "chainId": 42161
  },
  "0xAC6a07aFa77aBB31C68E094AF4b496d81737Ff53": {
    "address": "0xAC6a07aFa77aBB31C68E094AF4b496d81737Ff53",
    "name": "Derived Token",
    "symbol": "DVDX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xac6a07afa77abb31c68e094af4b496d81737ff53/icon",
    "chainId": 42161
  },
  "0x3BFB1ac033ff0aE278Be0583FCCc900FBD9382c6": {
    "address": "0x3BFB1ac033ff0aE278Be0583FCCc900FBD9382c6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3bfb1ac033ff0ae278be0583fccc900fbd9382c6/icon",
    "chainId": 42161
  },
  "0xF09699a534a3a7B1377fFE2299f9750FD15a6917": {
    "address": "0xF09699a534a3a7B1377fFE2299f9750FD15a6917",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf09699a534a3a7b1377ffe2299f9750fd15a6917/icon",
    "chainId": 42161
  },
  "0x1E9AfeCd0312773F0Ce1d6f9B4D502aA707226bD": {
    "address": "0x1E9AfeCd0312773F0Ce1d6f9B4D502aA707226bD",
    "name": "Fry Kids Token",
    "symbol": "FRYKIDS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1e9afecd0312773f0ce1d6f9b4d502aa707226bd/icon",
    "chainId": 42161
  },
  "0x1C8f9aCC60DEe78BB0B72d75e86c9FD7eAba7997": {
    "address": "0x1C8f9aCC60DEe78BB0B72d75e86c9FD7eAba7997",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1c8f9acc60dee78bb0b72d75e86c9fd7eaba7997/icon",
    "chainId": 42161
  },
  "0x739e93844ADaBFD58b00b2BEd540d1661d9aF682": {
    "address": "0x739e93844ADaBFD58b00b2BEd540d1661d9aF682",
    "name": "GO!",
    "symbol": "GO!",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x739e93844adabfd58b00b2bed540d1661d9af682/icon",
    "chainId": 42161
  },
  "0xD89746AFfa5483627a87E55713Ec190511439495": {
    "address": "0xD89746AFfa5483627a87E55713Ec190511439495",
    "name": "DUSDDAI Pool",
    "symbol": "DUSDDAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd89746affa5483627a87e55713ec190511439495/icon",
    "chainId": 42161
  },
  "0xF0B5cEeFc89684889e5F7e0A7775Bd100FcD3709": {
    "address": "0xF0B5cEeFc89684889e5F7e0A7775Bd100FcD3709",
    "name": "DigitalDollar",
    "symbol": "DUSD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf0b5ceefc89684889e5f7e0a7775bd100fcd3709/icon",
    "chainId": 42161
  },
  "0x59B7867F6B127070378feeb328e2Ffe6AAb67525": {
    "address": "0x59B7867F6B127070378feeb328e2Ffe6AAb67525",
    "name": "3x ETH/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-ETH+USDC 33 3S-ETH+USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x59b7867f6b127070378feeb328e2ffe6aab67525/icon",
    "chainId": 42161
  },
  "0x4d00c6dD5D5299082a1062C9B480af2FC698f6Eb": {
    "address": "0x4d00c6dD5D5299082a1062C9B480af2FC698f6Eb",
    "name": "3L-ETH/USD+USDC",
    "symbol": "3L-ETH/USD+USDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4d00c6dd5d5299082a1062c9b480af2fc698f6eb/icon",
    "chainId": 42161
  },
  "0x7fF6132ef2Abf89B6eC509947eB2c1ee9Da29F26": {
    "address": "0x7fF6132ef2Abf89B6eC509947eB2c1ee9Da29F26",
    "name": "3S-ETH/USD+USDC",
    "symbol": "3S-ETH/USD+USDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7ff6132ef2abf89b6ec509947eb2c1ee9da29f26/icon",
    "chainId": 42161
  },
  "0x7c82A23B4C48D796dee36A9cA215b641C6a8709d": {
    "address": "0x7c82A23B4C48D796dee36A9cA215b641C6a8709d",
    "name": "Balancer Aave v3 Boosted Pool (USDC)",
    "symbol": "bb-a-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7c82a23b4c48d796dee36a9ca215b641c6a8709d/icon",
    "chainId": 42161
  },
  "0xE719Aef17468c7e10c0c205be62C990754DFF7E5": {
    "address": "0xE719Aef17468c7e10c0c205be62C990754DFF7E5",
    "name": "Wrapped aUSDC",
    "symbol": "waUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe719aef17468c7e10c0c205be62c990754dff7e5/icon",
    "chainId": 42161
  },
  "0x284EB68520C8fA83361C1A3a5910aEC7f873C18b": {
    "address": "0x284EB68520C8fA83361C1A3a5910aEC7f873C18b",
    "name": "Balancer Boosted USD+",
    "symbol": "bb-USD+",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x284eb68520c8fa83361c1a3a5910aec7f873c18b/icon",
    "chainId": 42161
  },
  "0xB86fb1047A955C0186c77ff6263819b37B32440D": {
    "address": "0xB86fb1047A955C0186c77ff6263819b37B32440D",
    "name": "Wrapped USD+",
    "symbol": "wUSD+",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb86fb1047a955c0186c77ff6263819b37b32440d/icon",
    "chainId": 42161
  },
  "0xFd29298041eA355cF7e15652689F2865443C3144": {
    "address": "0xFd29298041eA355cF7e15652689F2865443C3144",
    "name": "90fxUSD-10USDC",
    "symbol": "90fxUSD-10USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfd29298041ea355cf7e15652689f2865443c3144/icon",
    "chainId": 42161
  },
  "0x4739E50B59B552D490d3FDc60D200977A38510c0": {
    "address": "0x4739E50B59B552D490d3FDc60D200977A38510c0",
    "name": "Balancer Aave v3 Boosted Pool (USDT)",
    "symbol": "bb-a-USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4739e50b59b552d490d3fdc60d200977a38510c0/icon",
    "chainId": 42161
  },
  "0x3c7680DFE7f732ca0279c39FF30fE2eafdaE49db": {
    "address": "0x3c7680DFE7f732ca0279c39FF30fE2eafdaE49db",
    "name": "Wrapped aUSDT",
    "symbol": "waUSDT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3c7680dfe7f732ca0279c39ff30fe2eafdae49db/icon",
    "chainId": 42161
  },
  "0x045c5480131EeF51AA1a74F34e62e7DE23136f24": {
    "address": "0x045c5480131EeF51AA1a74F34e62e7DE23136f24",
    "name": "3x BTC/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-BTC+USDC 33 3S-BTC+USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x045c5480131eef51aa1a74f34e62e7de23136f24/icon",
    "chainId": 42161
  },
  "0x6e5f70E345b4aFd271491290e026dd3d34CBb9f2": {
    "address": "0x6e5f70E345b4aFd271491290e026dd3d34CBb9f2",
    "name": "3S-BTC/USD+USDC",
    "symbol": "3S-BTC/USD+USDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6e5f70e345b4afd271491290e026dd3d34cbb9f2/icon",
    "chainId": 42161
  },
  "0xAC278Be0b5AD810EE3DCF79dd2933C33cc234258": {
    "address": "0xAC278Be0b5AD810EE3DCF79dd2933C33cc234258",
    "name": "3L-BTC/USD+USDC",
    "symbol": "3L-BTC/USD+USDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xac278be0b5ad810ee3dcf79dd2933c33cc234258/icon",
    "chainId": 42161
  },
  "0x7A3d900902c465bC8Fa030977B7571746000A314": {
    "address": "0x7A3d900902c465bC8Fa030977B7571746000A314",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7a3d900902c465bc8fa030977b7571746000a314/icon",
    "chainId": 42161
  },
  "0xFE23e933B88508a306D4603EC510131dA026A3f9": {
    "address": "0xFE23e933B88508a306D4603EC510131dA026A3f9",
    "name": "33BAL-33USDT-33USDC",
    "symbol": "33BAL-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfe23e933b88508a306d4603ec510131da026a3f9/icon",
    "chainId": 42161
  },
  "0x8a0bAD9A5e839D85845BfC26531246DA7575227b": {
    "address": "0x8a0bAD9A5e839D85845BfC26531246DA7575227b",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8a0bad9a5e839d85845bfc26531246da7575227b/icon",
    "chainId": 42161
  },
  "0x2dd2f949d82b8223c6ac2A2c193d5a21D9E3eDB5": {
    "address": "0x2dd2f949d82b8223c6ac2A2c193d5a21D9E3eDB5",
    "name": "50GMX-50USDT",
    "symbol": "50GMX-50USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2dd2f949d82b8223c6ac2a2c193d5a21d9e3edb5/icon",
    "chainId": 42161
  },
  "0x2C2179abce3413E27BDA6917f60ae37F96D01826": {
    "address": "0x2C2179abce3413E27BDA6917f60ae37F96D01826",
    "name": "80XEX-20USDC",
    "symbol": "80XEX-20USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2c2179abce3413e27bda6917f60ae37f96d01826/icon",
    "chainId": 42161
  },
  "0xa41A879bcFdd75983a987FD6b68fae37777e8b28": {
    "address": "0xa41A879bcFdd75983a987FD6b68fae37777e8b28",
    "name": "XEX Crypto",
    "symbol": "XEX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa41a879bcfdd75983a987fd6b68fae37777e8b28/icon",
    "chainId": 42161
  },
  "0x5d2a3d5984001342A13208A210dC0Db50427B9Ec": {
    "address": "0x5d2a3d5984001342A13208A210dC0Db50427B9Ec",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5d2a3d5984001342a13208a210dc0db50427b9ec/icon",
    "chainId": 42161
  },
  "0xA0D2d230B6ebfef5a66588EdA5b44e00B1a20C33": {
    "address": "0xA0D2d230B6ebfef5a66588EdA5b44e00B1a20C33",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa0d2d230b6ebfef5a66588eda5b44e00b1a20c33/icon",
    "chainId": 42161
  },
  "0x08a025D8eb6d7d6C6a5A24D5048061b33462E9bb": {
    "address": "0x08a025D8eb6d7d6C6a5A24D5048061b33462E9bb",
    "name": "50LINK-50USDT",
    "symbol": "50LINK-50USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x08a025d8eb6d7d6c6a5a24d5048061b33462e9bb/icon",
    "chainId": 42161
  },
  "0x5b0C1b84566708Dd391Ae0FecE1a32e33682EE3d": {
    "address": "0x5b0C1b84566708Dd391Ae0FecE1a32e33682EE3d",
    "name": "DAI-USDC",
    "symbol": "DAI-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5b0c1b84566708dd391ae0fece1a32e33682ee3d/icon",
    "chainId": 42161
  },
  "0x8D810dD6024Ad76aac3D25780834049B6Bc334D1": {
    "address": "0x8D810dD6024Ad76aac3D25780834049B6Bc334D1",
    "name": "33wstETH-33USDT-33USDC.e",
    "symbol": "33wstETH-33USDT-33USDC.e",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8d810dd6024ad76aac3d25780834049b6bc334d1/icon",
    "chainId": 42161
  },
  "0xDD3054cC8ec97Aa5293B8D3a9aEcd5A0864EFE95": {
    "address": "0xDD3054cC8ec97Aa5293B8D3a9aEcd5A0864EFE95",
    "name": "50DAI-50DUSD",
    "symbol": "50DAI-50DUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdd3054cc8ec97aa5293b8d3a9aecd5a0864efe95/icon",
    "chainId": 42161
  },
  "0xDCC497412c767B8485C224584955b774eebB312a": {
    "address": "0xDCC497412c767B8485C224584955b774eebB312a",
    "name": "50VSTA-50DUSD",
    "symbol": "50VSTA-50DUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdcc497412c767b8485c224584955b774eebb312a/icon",
    "chainId": 42161
  },
  "0x1DEBd73E752bEaF79865Fd6446b0c970EaE7732f": {
    "address": "0x1DEBd73E752bEaF79865Fd6446b0c970EaE7732f",
    "name": "Coinbase Wrapped Staked ETH",
    "symbol": "cbETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1debd73e752beaf79865fd6446b0c970eae7732f/icon",
    "chainId": 42161
  },
  "0x154128A50026e0e47eBd9639b8146d246A5CF742": {
    "address": "0x154128A50026e0e47eBd9639b8146d246A5CF742",
    "name": "SVY Fjord Foundry LBP",
    "symbol": "SVY_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x154128a50026e0e47ebd9639b8146d246a5cf742/icon",
    "chainId": 42161
  },
  "0x53c0880Dd4D40A9133e9b955027DEb6b64D7A610": {
    "address": "0x53c0880Dd4D40A9133e9b955027DEb6b64D7A610",
    "name": "pcAMBR Fjord Foundry LBP",
    "symbol": "pcAMBR_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x53c0880dd4d40a9133e9b955027deb6b64d7a610/icon",
    "chainId": 42161
  },
  "0x3e990A863f476CC219436c474bA4C2707a691c5B": {
    "address": "0x3e990A863f476CC219436c474bA4C2707a691c5B",
    "name": "Placeholder Convertible Ambrosia",
    "symbol": "pcAMBR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3e990a863f476cc219436c474ba4c2707a691c5b/icon",
    "chainId": 42161
  },
  "0x2dB615Fe592EC8B147a40df788C829D08Fbb6F65": {
    "address": "0x2dB615Fe592EC8B147a40df788C829D08Fbb6F65",
    "name": "DBL Copper LBP",
    "symbol": "DBL_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2db615fe592ec8b147a40df788c829d08fbb6f65/icon",
    "chainId": 42161
  },
  "0xd3f1Da62CAFB7E7BC6531FF1ceF6F414291F03D3": {
    "address": "0xd3f1Da62CAFB7E7BC6531FF1ceF6F414291F03D3",
    "name": "Doubloon Token",
    "symbol": "DBL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd3f1da62cafb7e7bc6531ff1cef6f414291f03d3/icon",
    "chainId": 42161
  },
  "0xEB80C89204BbE46E0D666aA651a4dCE4D751F537": {
    "address": "0xEB80C89204BbE46E0D666aA651a4dCE4D751F537",
    "name": "MOZ Fjord Foundry LBP",
    "symbol": "MOZ_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xeb80c89204bbe46e0d666aa651a4dce4d751f537/icon",
    "chainId": 42161
  },
  "0xe05A08226c49b636ACf99c40Da8DC6aF83CE5bB3": {
    "address": "0xe05A08226c49b636ACf99c40Da8DC6aF83CE5bB3",
    "name": "Ankr Staked ETH",
    "symbol": "ankrETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe05a08226c49b636acf99c40da8dc6af83ce5bb3/icon",
    "chainId": 42161
  },
  "0x1405BA8d41b8534f73d002990137584dEE3F30A5": {
    "address": "0x1405BA8d41b8534f73d002990137584dEE3F30A5",
    "name": "LUNAS",
    "symbol": "Swing-DAI-MKR-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1405ba8d41b8534f73d002990137584dee3f30a5/icon",
    "chainId": 42161
  },
  "0x45C4D1376943Ab28802B995aCfFC04903Eb5223f": {
    "address": "0x45C4D1376943Ab28802B995aCfFC04903Eb5223f",
    "name": "Balancer wstETH Boosted Aave WETH StablePool",
    "symbol": "wstETH-bb-a-WETH-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x45c4d1376943ab28802b995acffc04903eb5223f/icon",
    "chainId": 42161
  },
  "0xa8C0141334e9dd7B14eD03DF45810F8e79f9ed12": {
    "address": "0xa8C0141334e9dd7B14eD03DF45810F8e79f9ed12",
    "name": "KIN Fjord Foundry LBP",
    "symbol": "KIN_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa8c0141334e9dd7b14ed03df45810f8e79f9ed12/icon",
    "chainId": 42161
  },
  "0x65e5b3b5b709865A35Fe588780CC80091B68663a": {
    "address": "0x65e5b3b5b709865A35Fe588780CC80091B68663a",
    "name": "Kinance",
    "symbol": "KIN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x65e5b3b5b709865a35fe588780cc80091b68663a/icon",
    "chainId": 42161
  },
  "0xEAD7e0163e3b33bF0065C9325fC8fb9B18cc8213": {
    "address": "0xEAD7e0163e3b33bF0065C9325fC8fb9B18cc8213",
    "name": "Balancer STAR/USDC StablePool",
    "symbol": "STAR/USDC-BPT ",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xead7e0163e3b33bf0065c9325fc8fb9b18cc8213/icon",
    "chainId": 42161
  },
  "0xA5EaACB68Fa70CcB099aa5F93B3F7be44Df683db": {
    "address": "0xA5EaACB68Fa70CcB099aa5F93B3F7be44Df683db",
    "name": "pcAMBRb Fjord Foundry LBP",
    "symbol": "pcAMBRb_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa5eaacb68fa70ccb099aa5f93b3f7be44df683db/icon",
    "chainId": 42161
  },
  "0xf4Ac3919266252004CfCED7687906E0F306f522b": {
    "address": "0xf4Ac3919266252004CfCED7687906E0F306f522b",
    "name": "Placeholder Convertible Ambrosia Fjord",
    "symbol": "pcAMBRb",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf4ac3919266252004cfced7687906e0f306f522b/icon",
    "chainId": 42161
  },
  "0x1704296ea53EbC11FF7B507C8e851AbA3995814b": {
    "address": "0x1704296ea53EbC11FF7B507C8e851AbA3995814b",
    "name": "BestUSDCPool",
    "symbol": "50USDC-50USDC.e",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1704296ea53ebc11ff7b507c8e851aba3995814b/icon",
    "chainId": 42161
  },
  "0x81A1601e9AeB659530f2785C716C8d3DF8F412b3": {
    "address": "0x81A1601e9AeB659530f2785C716C8d3DF8F412b3",
    "name": "CRT Fjord Foundry LBP",
    "symbol": "CRT_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x81a1601e9aeb659530f2785c716c8d3df8f412b3/icon",
    "chainId": 42161
  },
  "0x4cdbAD719AC94A701B821E155aDE500fd2B79750": {
    "address": "0x4cdbAD719AC94A701B821E155aDE500fd2B79750",
    "name": "Carrots",
    "symbol": "CRT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4cdbad719ac94a701b821e155ade500fd2b79750/icon",
    "chainId": 42161
  },
  "0x3CaFF0E4eF5aB37081503AcA2C65e859Aa026AB5": {
    "address": "0x3CaFF0E4eF5aB37081503AcA2C65e859Aa026AB5",
    "name": "20WETH-80BICO",
    "symbol": "20WETH-80BICO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3caff0e4ef5ab37081503aca2c65e859aa026ab5/icon",
    "chainId": 42161
  },
  "0xa68Ec98D7ca870cF1Dd0b00EBbb7c4bF60A8e74d": {
    "address": "0xa68Ec98D7ca870cF1Dd0b00EBbb7c4bF60A8e74d",
    "name": "Biconomy Token",
    "symbol": "BICO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa68ec98d7ca870cf1dd0b00ebbb7c4bf60a8e74d/icon",
    "chainId": 42161
  },
  "0x40af308e3d07ec769D85EB80aFb116525fF4aC99": {
    "address": "0x40af308e3d07ec769D85EB80aFb116525fF4aC99",
    "name": "Balancer Aave v3 Boosted Pool (USDCe)",
    "symbol": "bb-a-USDCe",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x40af308e3d07ec769d85eb80afb116525ff4ac99/icon",
    "chainId": 42161
  },
  "0x3A301e7917689b8E8A19498b8A28fc912583490C": {
    "address": "0x3A301e7917689b8E8A19498b8A28fc912583490C",
    "name": "Static Aave Arbitrum USDC",
    "symbol": "stataArbUSDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3a301e7917689b8e8a19498b8a28fc912583490c/icon",
    "chainId": 42161
  },
  "0xB78bd24FC7C60c6F8E9e5811184753c1F1630D33": {
    "address": "0xB78bd24FC7C60c6F8E9e5811184753c1F1630D33",
    "name": "503S-ETH/USD+USDC-50USDC",
    "symbol": "503S-ETH/USD+USDC-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb78bd24fc7c60c6f8e9e5811184753c1f1630d33/icon",
    "chainId": 42161
  },
  "0x466598c279C2e2B7c7f2cd591Ac539720A205582": {
    "address": "0x466598c279C2e2B7c7f2cd591Ac539720A205582",
    "name": "3S-ETH/USD+USDC",
    "symbol": "3S-ETH/USD+USDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x466598c279c2e2b7c7f2cd591ac539720a205582/icon",
    "chainId": 42161
  },
  "0x4160AF6C9E1Eb553D8da54E7f83a797e21Ff7E7a": {
    "address": "0x4160AF6C9E1Eb553D8da54E7f83a797e21Ff7E7a",
    "name": "TSU Fjord Foundry LBP",
    "symbol": "TSU_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4160af6c9e1eb553d8da54e7f83a797e21ff7e7a/icon",
    "chainId": 42161
  },
  "0x3A3207B4a33a93fA84ac9b04440A05E6d029A1dB": {
    "address": "0x3A3207B4a33a93fA84ac9b04440A05E6d029A1dB",
    "name": "kintsugi.finance",
    "symbol": "TSU",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3a3207b4a33a93fa84ac9b04440a05e6d029a1db/icon",
    "chainId": 42161
  },
  "0xDa1CD1711743e57Dd57102E9e61b75f3587703da": {
    "address": "0xDa1CD1711743e57Dd57102E9e61b75f3587703da",
    "name": "Balancer Aave v3 Boosted Pool (WETH)",
    "symbol": "bb-a-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xda1cd1711743e57dd57102e9e61b75f3587703da/icon",
    "chainId": 42161
  },
  "0x3F44aF47a8fabbaABc9933E0b217f61707d89ab8": {
    "address": "0x3F44aF47a8fabbaABc9933E0b217f61707d89ab8",
    "name": "503S-BTC/USD+USDC-50USDC",
    "symbol": "503S-BTC/USD+USDC-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3f44af47a8fabbaabc9933e0b217f61707d89ab8/icon",
    "chainId": 42161
  },
  "0x00F70af6D1148E3127DB138ce633895e5eF6Bdb2": {
    "address": "0x00F70af6D1148E3127DB138ce633895e5eF6Bdb2",
    "name": "3S-BTC/USD+USDC",
    "symbol": "3S-BTC/USD+USDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x00f70af6d1148e3127db138ce633895e5ef6bdb2/icon",
    "chainId": 42161
  },
  "0x4cCbe7eAc8C3D5496737089d2195F0D544E420C0": {
    "address": "0x4cCbe7eAc8C3D5496737089d2195F0D544E420C0",
    "name": "503S-BTC/USD+USDC-503S-ETH/USD+USDC",
    "symbol": "503S-BTC/USD+USDC-503S-ETH/USD+USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4ccbe7eac8c3d5496737089d2195f0d544e420c0/icon",
    "chainId": 42161
  },
  "0x247b8b257BEA69688333284Fde9C26c9403D73b7": {
    "address": "0x247b8b257BEA69688333284Fde9C26c9403D73b7",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x247b8b257bea69688333284fde9c26c9403d73b7/icon",
    "chainId": 42161
  },
  "0xbc786D01dC2ABF3B5707f6C67EBeB084be39dA6E": {
    "address": "0xbc786D01dC2ABF3B5707f6C67EBeB084be39dA6E",
    "name": "2Stable",
    "symbol": "2Stable",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbc786d01dc2abf3b5707f6c67ebeb084be39da6e/icon",
    "chainId": 42161
  },
  "0x1f4999BbE800d67226A3abF73dD315eE787Ff2eF": {
    "address": "0x1f4999BbE800d67226A3abF73dD315eE787Ff2eF",
    "name": "AY Fjord Foundry LBP",
    "symbol": "AY_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1f4999bbe800d67226a3abf73dd315ee787ff2ef/icon",
    "chainId": 42161
  },
  "0x1a571d472DdE5655566DcC63E6669182363a7aFB": {
    "address": "0x1a571d472DdE5655566DcC63E6669182363a7aFB",
    "name": "ARBIYIELD",
    "symbol": "AY",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1a571d472dde5655566dcc63e6669182363a7afb/icon",
    "chainId": 42161
  },
  "0xa1a5E2483Bb47F9F796bF10157CEE8819D03eC45": {
    "address": "0xa1a5E2483Bb47F9F796bF10157CEE8819D03eC45",
    "name": "GLIZZIES Fjord Foundry LBP",
    "symbol": "GLIZZIES_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa1a5e2483bb47f9f796bf10157cee8819d03ec45/icon",
    "chainId": 42161
  },
  "0xaE35e2F40f24754135D85e01773732F706291500": {
    "address": "0xaE35e2F40f24754135D85e01773732F706291500",
    "name": "Glizzies",
    "symbol": "GLIZZIES",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xae35e2f40f24754135d85e01773732f706291500/icon",
    "chainId": 42161
  },
  "0x43796Deeed9E882C742F979b503669fAe73e9D80": {
    "address": "0x43796Deeed9E882C742F979b503669fAe73e9D80",
    "name": "503S-ETH/USD+USDC-50USDC",
    "symbol": "503S-ETH/USD+USDC-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x43796deeed9e882c742f979b503669fae73e9d80/icon",
    "chainId": 42161
  },
  "0x82917cc4097d38BE313Aa4A4d0989739E3447Fc5": {
    "address": "0x82917cc4097d38BE313Aa4A4d0989739E3447Fc5",
    "name": "THREE Fjord Foundry LBP",
    "symbol": "THREE_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x82917cc4097d38be313aa4a4d0989739e3447fc5/icon",
    "chainId": 42161
  },
  "0x39e069B579D47C0c03A200B55b1b24feCC32f1d8": {
    "address": "0x39e069B579D47C0c03A200B55b1b24feCC32f1d8",
    "name": "3hree",
    "symbol": "THREE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x39e069b579d47c0c03a200b55b1b24fecc32f1d8/icon",
    "chainId": 42161
  },
  "0x563655Ab3EFbA8Bf8f635D03f1860328b1AA93d2": {
    "address": "0x563655Ab3EFbA8Bf8f635D03f1860328b1AA93d2",
    "name": "LSD-Fund",
    "symbol": "LSD-Maxed",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x563655ab3efba8bf8f635d03f1860328b1aa93d2/icon",
    "chainId": 42161
  },
  "0xBe0f30217BE1e981aDD883848D0773A86d2d2CD4": {
    "address": "0xBe0f30217BE1e981aDD883848D0773A86d2d2CD4",
    "name": "Balancer rETH-Boosted Aave WETH StablePool",
    "symbol": "rETH-bb-a-WETH-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbe0f30217be1e981add883848d0773a86d2d2cd4/icon",
    "chainId": 42161
  },
  "0x3D87B6A7d3D4411A69949671e0c4806D671b34A6": {
    "address": "0x3D87B6A7d3D4411A69949671e0c4806D671b34A6",
    "name": "50wstETH-50ankrETH",
    "symbol": "50wstETH-50ankrETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3d87b6a7d3d4411a69949671e0c4806d671b34a6/icon",
    "chainId": 42161
  },
  "0x6ee86e032173716a41818e6d6D320a752176D697": {
    "address": "0x6ee86e032173716a41818e6d6D320a752176D697",
    "name": "33 1S-ETH 33 1L-ETH 33 USDC",
    "symbol": "33 1S-ETH 33 1L-ETH 33 USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6ee86e032173716a41818e6d6d320a752176d697/icon",
    "chainId": 42161
  },
  "0xf581571DBcCeD3A59AaaCbf90448E7B3E1704dcD": {
    "address": "0xf581571DBcCeD3A59AaaCbf90448E7B3E1704dcD",
    "name": "1S-ETH/USD",
    "symbol": "1S-ETH/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf581571dbcced3a59aaacbf90448e7b3e1704dcd/icon",
    "chainId": 42161
  },
  "0x38c0a5443c7427e65A9Bf15AE746a28BB9a052cc": {
    "address": "0x38c0a5443c7427e65A9Bf15AE746a28BB9a052cc",
    "name": "1L-ETH/USD",
    "symbol": "1L-ETH/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x38c0a5443c7427e65a9bf15ae746a28bb9a052cc/icon",
    "chainId": 42161
  },
  "0x180daeB2d378E086D472B233087308Aa0da56318": {
    "address": "0x180daeB2d378E086D472B233087308Aa0da56318",
    "name": "67LDO-29WBTC-2wstETH-2WETH",
    "symbol": "67LDO-29WBTC-2wstETH-2WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x180daeb2d378e086d472b233087308aa0da56318/icon",
    "chainId": 42161
  },
  "0x312E86A5b7eE52858135a23898Dd40D6344CF7fe": {
    "address": "0x312E86A5b7eE52858135a23898Dd40D6344CF7fe",
    "name": "sRBTM Fjord Foundry LBP",
    "symbol": "sRBTM_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x312e86a5b7ee52858135a23898dd40d6344cf7fe/icon",
    "chainId": 42161
  },
  "0x68B73189c5E1D92C76c70001904Adc48A5027A19": {
    "address": "0x68B73189c5E1D92C76c70001904Adc48A5027A19",
    "name": "SaleRBTM",
    "symbol": "sRBTM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x68b73189c5e1d92c76c70001904adc48a5027a19/icon",
    "chainId": 42161
  },
  "0x842AB31995c0d731D19ec1b00fe2b8619590ae88": {
    "address": "0x842AB31995c0d731D19ec1b00fe2b8619590ae88",
    "name": "CUS Fjord Foundry LBP",
    "symbol": "CUS_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x842ab31995c0d731d19ec1b00fe2b8619590ae88/icon",
    "chainId": 42161
  },
  "0x4e9FA232675Be99C181Eb96d1b702BA4250791Bc": {
    "address": "0x4e9FA232675Be99C181Eb96d1b702BA4250791Bc",
    "name": "Custo Finance",
    "symbol": "CUS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4e9fa232675be99c181eb96d1b702ba4250791bc/icon",
    "chainId": 42161
  },
  "0x0052688295413b32626D226a205b95cDB337DE86": {
    "address": "0x0052688295413b32626D226a205b95cDB337DE86",
    "name": "20ARB-80USDC",
    "symbol": "20ARB-80USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0052688295413b32626d226a205b95cdb337de86/icon",
    "chainId": 42161
  },
  "0x8a88C1f44854C61a466aB55614F6A7778473418b": {
    "address": "0x8a88C1f44854C61a466aB55614F6A7778473418b",
    "name": "29WBTC-4wstETH-67LINK",
    "symbol": "29WBTC-4wstETH-67LINK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8a88c1f44854c61a466ab55614f6a7778473418b/icon",
    "chainId": 42161
  },
  "0x0A6eB487db5a1aEb35d3d9Fce9a32fbB943d186D": {
    "address": "0x0A6eB487db5a1aEb35d3d9Fce9a32fbB943d186D",
    "name": "Perpetuals",
    "symbol": "PERPETUALS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0a6eb487db5a1aeb35d3d9fce9a32fbb943d186d/icon",
    "chainId": 42161
  },
  "0x164731CD270daA4A94bc70761E53320e48367B8B": {
    "address": "0x164731CD270daA4A94bc70761E53320e48367B8B",
    "name": "Array",
    "symbol": "Array",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x164731cd270daa4a94bc70761e53320e48367b8b/icon",
    "chainId": 42161
  },
  "0x996616BDe0CB4974e571f17d31c844da2BD177f8": {
    "address": "0x996616BDe0CB4974e571f17d31c844da2BD177f8",
    "name": "50 wETH 33 3S-ETH 17 3L-ETH",
    "symbol": "50 wETH 33 3S-ETH 17 3L-ETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x996616bde0cb4974e571f17d31c844da2bd177f8/icon",
    "chainId": 42161
  },
  "0x7d7E4f49a29dDA8b1eCDcf8a8bc85EdcB234E997": {
    "address": "0x7d7E4f49a29dDA8b1eCDcf8a8bc85EdcB234E997",
    "name": "3S-ETH/USD",
    "symbol": "3S-ETH/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7d7e4f49a29dda8b1ecdcf8a8bc85edcb234e997/icon",
    "chainId": 42161
  },
  "0xaA846004Dc01b532B63FEaa0b7A0cB0990f19ED9": {
    "address": "0xaA846004Dc01b532B63FEaa0b7A0cB0990f19ED9",
    "name": "3L-ETH/USD",
    "symbol": "3L-ETH/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa846004dc01b532b63feaa0b7a0cb0990f19ed9/icon",
    "chainId": 42161
  },
  "0xd1566767047Dd97395f0Ec1d88Ec614d0A93ADF0": {
    "address": "0xd1566767047Dd97395f0Ec1d88Ec614d0A93ADF0",
    "name": "LDO-BTC-wstETH",
    "symbol": "LDO-WBTC-wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd1566767047dd97395f0ec1d88ec614d0a93adf0/icon",
    "chainId": 42161
  },
  "0x3e651D82e44efb69AE8014d2F1A7b1E1A351499d": {
    "address": "0x3e651D82e44efb69AE8014d2F1A7b1E1A351499d",
    "name": "fGT Fjord Foundry LBP",
    "symbol": "fGT_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3e651d82e44efb69ae8014d2f1a7b1e1a351499d/icon",
    "chainId": 42161
  },
  "0xb1F4B783F6b9D2a6f29AAc55eDED017afaa57A7d": {
    "address": "0xb1F4B783F6b9D2a6f29AAc55eDED017afaa57A7d",
    "name": "froGPT",
    "symbol": "fGT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb1f4b783f6b9d2a6f29aac55eded017afaa57a7d/icon",
    "chainId": 42161
  },
  "0xB5B77F1AD2B520df01612399258E7787aF63025D": {
    "address": "0xB5B77F1AD2B520df01612399258E7787aF63025D",
    "name": "MCB Weighted Pool",
    "symbol": "MWP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb5b77f1ad2b520df01612399258e7787af63025d/icon",
    "chainId": 42161
  },
  "0xF17F1E67bc384E43b4acf69cc032AD086f15f262": {
    "address": "0xF17F1E67bc384E43b4acf69cc032AD086f15f262",
    "name": "20WETH-80AI",
    "symbol": "20WETH-80AI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf17f1e67bc384e43b4acf69cc032ad086f15f262/icon",
    "chainId": 42161
  },
  "0x8d7c2588c365b9e98Ea464b63DBCCDf13ECd9809": {
    "address": "0x8d7c2588c365b9e98Ea464b63DBCCDf13ECd9809",
    "name": "Flourishing AI Token",
    "symbol": "AI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8d7c2588c365b9e98ea464b63dbccdf13ecd9809/icon",
    "chainId": 42161
  },
  "0x2D430F33F07f08A2F2992dE94FDEee572f112f61": {
    "address": "0x2D430F33F07f08A2F2992dE94FDEee572f112f61",
    "name": "33WBTC-33WETH-33DAI",
    "symbol": "33WBTC-33WETH-33DAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2d430f33f07f08a2f2992de94fdeee572f112f61/icon",
    "chainId": 42161
  },
  "0x8f023508dB7ED646a5AD44f48A1B3A384FAfa9Cc": {
    "address": "0x8f023508dB7ED646a5AD44f48A1B3A384FAfa9Cc",
    "name": "80BAL-20WETH",
    "symbol": "80BAL-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8f023508db7ed646a5ad44f48a1b3a384fafa9cc/icon",
    "chainId": 42161
  },
  "0x971A8dE8f375dEA995C87126Ed7178407883B889": {
    "address": "0x971A8dE8f375dEA995C87126Ed7178407883B889",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x971a8de8f375dea995c87126ed7178407883b889/icon",
    "chainId": 42161
  },
  "0x2655c2fCe63132e4C510B249Dc455012D9264B03": {
    "address": "0x2655c2fCe63132e4C510B249Dc455012D9264B03",
    "name": "WICA Fjord Foundry LBP",
    "symbol": "WICA_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2655c2fce63132e4c510b249dc455012d9264b03/icon",
    "chainId": 42161
  },
  "0x7127Fe0D7413AE50AbA6521B5085d76D7FFf4a3C": {
    "address": "0x7127Fe0D7413AE50AbA6521B5085d76D7FFf4a3C",
    "name": "WixCare",
    "symbol": "WICA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7127fe0d7413ae50aba6521b5085d76d7fff4a3c/icon",
    "chainId": 42161
  },
  "0x85a7023F3d287F849b6c8223aF1E783383A391a8": {
    "address": "0x85a7023F3d287F849b6c8223aF1E783383A391a8",
    "name": "lvrlDAI",
    "symbol": "50LEVR-50DAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x85a7023f3d287f849b6c8223af1e783383a391a8/icon",
    "chainId": 42161
  },
  "0x77De4df6F2d87Cc7708959bCEa45d58B0E8b8315": {
    "address": "0x77De4df6F2d87Cc7708959bCEa45d58B0E8b8315",
    "name": "LEVR - levr.ly Logistics Token",
    "symbol": "LEVR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x77de4df6f2d87cc7708959bcea45d58b0e8b8315/icon",
    "chainId": 42161
  },
  "0x85f2C2E8a01055D45a469C3f53b2EBB7b6540eB5": {
    "address": "0x85f2C2E8a01055D45a469C3f53b2EBB7b6540eB5",
    "name": "WICA Fjord Foundry LBP",
    "symbol": "WICA_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x85f2c2e8a01055d45a469c3f53b2ebb7b6540eb5/icon",
    "chainId": 42161
  },
  "0xf43AB4CbE4999309D7c8077Ad99f52C78Cc495E6": {
    "address": "0xf43AB4CbE4999309D7c8077Ad99f52C78Cc495E6",
    "name": "Altcoin",
    "symbol": "ALTCOIN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf43ab4cbe4999309d7c8077ad99f52c78cc495e6/icon",
    "chainId": 42161
  },
  "0xC1889C72D99917FD7b957fEd80d4Ea1eBd9e2618": {
    "address": "0xC1889C72D99917FD7b957fEd80d4Ea1eBd9e2618",
    "name": "25BAL-25WBTC-25PHONON-25WETH",
    "symbol": "25BAL-25WBTC-25PHONON-25WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc1889c72d99917fd7b957fed80d4ea1ebd9e2618/icon",
    "chainId": 42161
  },
  "0x39A49bc5017Fc668299Cd32e734C9269aCc35295": {
    "address": "0x39A49bc5017Fc668299Cd32e734C9269aCc35295",
    "name": "Phonon DAO",
    "symbol": "PHONON",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x39a49bc5017fc668299cd32e734c9269acc35295/icon",
    "chainId": 42161
  },
  "0x6F3b31296FD2457eba6Dca3BED65ec79e06c1295": {
    "address": "0x6F3b31296FD2457eba6Dca3BED65ec79e06c1295",
    "name": "17RDNT-17wstETH-17STG-17ARB-17GMX-17USDC",
    "symbol": "17RDNT-17wstETH-17STG-17ARB-17GMX-17USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6f3b31296fd2457eba6dca3bed65ec79e06c1295/icon",
    "chainId": 42161
  },
  "0x05794E143cC23b4F1c801f0865d91115d92ce5f5": {
    "address": "0x05794E143cC23b4F1c801f0865d91115d92ce5f5",
    "name": "87WBTC-13wstETH",
    "symbol": "87WBTC-13wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x05794e143cc23b4f1c801f0865d91115d92ce5f5/icon",
    "chainId": 42161
  },
  "0xFdcC5c65E4BB4e73D61cecaDEF049751FbD4D74e": {
    "address": "0xFdcC5c65E4BB4e73D61cecaDEF049751FbD4D74e",
    "name": "50WBTC-50WETH",
    "symbol": "50WBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xfdcc5c65e4bb4e73d61cecadef049751fbd4d74e/icon",
    "chainId": 42161
  },
  "0x12318eFB1680bD20059A1fF1D28a021AE036b8c9": {
    "address": "0x12318eFB1680bD20059A1fF1D28a021AE036b8c9",
    "name": "bFOREX",
    "symbol": "balancerFOREX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x12318efb1680bd20059a1ff1d28a021ae036b8c9/icon",
    "chainId": 42161
  },
  "0x2D42910D826e5500579D121596E98A6eb33C0a1b": {
    "address": "0x2D42910D826e5500579D121596E98A6eb33C0a1b",
    "name": "50WETH-50ARB",
    "symbol": "50WETH-50ARB",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2d42910d826e5500579d121596e98a6eb33c0a1b/icon",
    "chainId": 42161
  },
  "0x055242438D0Eca5DD98878c32a3033d19f73C935": {
    "address": "0x055242438D0Eca5DD98878c32a3033d19f73C935",
    "name": "lvrlETH",
    "symbol": "50LEVR-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x055242438d0eca5dd98878c32a3033d19f73c935/icon",
    "chainId": 42161
  },
  "0x994090b78Bd22296C04708718a9fA5F9A38806B4": {
    "address": "0x994090b78Bd22296C04708718a9fA5F9A38806B4",
    "name": "87WBTC-13wstETH",
    "symbol": "87WBTC-13wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x994090b78bd22296c04708718a9fa5f9a38806b4/icon",
    "chainId": 42161
  },
  "0xc46be4B8Bb6B5A3d3120660efae9C5416318ED40": {
    "address": "0xc46be4B8Bb6B5A3d3120660efae9C5416318ED40",
    "name": "Balancer Aave v3 Boosted Pool (USDT)",
    "symbol": "bb-a-USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc46be4b8bb6b5a3d3120660efae9c5416318ed40/icon",
    "chainId": 42161
  },
  "0x8B5541B773DD781852940490b0c3dC1a8CDb6A87": {
    "address": "0x8B5541B773DD781852940490b0c3dC1a8CDb6A87",
    "name": "Static Aave Arbitrum USDT",
    "symbol": "stataArbUSDT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x8b5541b773dd781852940490b0c3dc1a8cdb6a87/icon",
    "chainId": 42161
  },
  "0xB340B6b1a34019853Cb05B2De6eE8ffD0B89a008": {
    "address": "0xB340B6b1a34019853Cb05B2De6eE8ffD0B89a008",
    "name": "DPX-RDPX-WETH",
    "symbol": "33DPX-33RDPX-33WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb340b6b1a34019853cb05b2de6ee8ffd0b89a008/icon",
    "chainId": 42161
  },
  "0xE1B40094F1446722c424C598aC412D590e0b3ffb": {
    "address": "0xE1B40094F1446722c424C598aC412D590e0b3ffb",
    "name": "20WETH-80CRE8R",
    "symbol": "20WETH-80CRE8R",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe1b40094f1446722c424c598ac412d590e0b3ffb/icon",
    "chainId": 42161
  },
  "0xb96B904ba83DdEeCE47CAADa8B40EE6936D92091": {
    "address": "0xb96B904ba83DdEeCE47CAADa8B40EE6936D92091",
    "name": "CRE8R DAO",
    "symbol": "CRE8R",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb96b904ba83ddeece47caada8b40ee6936d92091/icon",
    "chainId": 42161
  },
  "0xE91602EB4827CD016C192a55F96822Ac7f962ce6": {
    "address": "0xE91602EB4827CD016C192a55F96822Ac7f962ce6",
    "name": "DAI-USDC",
    "symbol": "DAI-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe91602eb4827cd016c192a55f96822ac7f962ce6/icon",
    "chainId": 42161
  },
  "0xF69d5E7C0eB43127D5874121867FB763F2967dBB": {
    "address": "0xF69d5E7C0eB43127D5874121867FB763F2967dBB",
    "name": "Arbitrum Ecosystem ",
    "symbol": "aECO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf69d5e7c0eb43127d5874121867fb763f2967dbb/icon",
    "chainId": 42161
  },
  "0x6d0781212a62E99f5eF04B78C9B9cF3531D4a7e6": {
    "address": "0x6d0781212a62E99f5eF04B78C9B9cF3531D4a7e6",
    "name": "Defi 20",
    "symbol": "DEFI20",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6d0781212a62e99f5ef04b78c9b9cf3531d4a7e6/icon",
    "chainId": 42161
  },
  "0x70b8e0F1D5C3d1f0315A9eff459ec900b09E57b0": {
    "address": "0x70b8e0F1D5C3d1f0315A9eff459ec900b09E57b0",
    "name": "50PHONON-50WETH",
    "symbol": "50PHONON-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x70b8e0f1d5c3d1f0315a9eff459ec900b09e57b0/icon",
    "chainId": 42161
  },
  "0xa1abb2ad3F821d37730d7Fd61EEEf30f999aB6B5": {
    "address": "0xa1abb2ad3F821d37730d7Fd61EEEf30f999aB6B5",
    "name": "FURO Fjord Foundry LBP",
    "symbol": "FURO_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa1abb2ad3f821d37730d7fd61eeef30f999ab6b5/icon",
    "chainId": 42161
  },
  "0xE8d4fdfcEa206E50afcDEafeCa1793d98C719a34": {
    "address": "0xE8d4fdfcEa206E50afcDEafeCa1793d98C719a34",
    "name": "Furo",
    "symbol": "FURO",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe8d4fdfcea206e50afcdeafeca1793d98c719a34/icon",
    "chainId": 42161
  },
  "0x5cEd962AfbFb7E13Fb215DeFc2b027678237AA3A": {
    "address": "0x5cEd962AfbFb7E13Fb215DeFc2b027678237AA3A",
    "name": "Balancer 80 NDX 20 WETH",
    "symbol": "B-80NDX-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5ced962afbfb7e13fb215defc2b027678237aa3a/icon",
    "chainId": 42161
  },
  "0xB965029343D55189c25a7f3e0c9394DC0F5D41b1": {
    "address": "0xB965029343D55189c25a7f3e0c9394DC0F5D41b1",
    "name": "Indexed",
    "symbol": "NDX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb965029343d55189c25a7f3e0c9394dc0f5d41b1/icon",
    "chainId": 42161
  },
  "0xE7ec5216ff485abffd9d390B82A5D742155f3A6f": {
    "address": "0xE7ec5216ff485abffd9d390B82A5D742155f3A6f",
    "name": "80ACID-20WETH",
    "symbol": "80ACID-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe7ec5216ff485abffd9d390b82a5d742155f3a6f/icon",
    "chainId": 42161
  },
  "0xbD724Eb087d4cc0f61a5fED1fFFaF937937E14DE": {
    "address": "0xbD724Eb087d4cc0f61a5fED1fFFaF937937E14DE",
    "name": "Balancer Aave v3 Boosted Pool (USDC)",
    "symbol": "bb-a-USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbd724eb087d4cc0f61a5fed1fffaf937937e14de/icon",
    "chainId": 42161
  },
  "0xbdE67e089886EC0E615D6f054BC6f746189A3d56": {
    "address": "0xbdE67e089886EC0E615D6f054BC6f746189A3d56",
    "name": "Static Aave Arbitrum USDCn",
    "symbol": "stataArbUSDCn",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xbde67e089886ec0e615d6f054bc6f746189a3d56/icon",
    "chainId": 42161
  },
  "0x9Dc8934fB2A2765DC5943384Ab84050A760d4c5c": {
    "address": "0x9Dc8934fB2A2765DC5943384Ab84050A760d4c5c",
    "name": "80WETH-20FOREX",
    "symbol": "80WETH-20FOREX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9dc8934fb2a2765dc5943384ab84050a760d4c5c/icon",
    "chainId": 42161
  },
  "0x0510cCF9eB3AB03C1508d3b9769E8Ee2CFd6FDcF": {
    "address": "0x0510cCF9eB3AB03C1508d3b9769E8Ee2CFd6FDcF",
    "name": "MAI Stablepool BPT",
    "symbol": "MAI-BSP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf/icon",
    "chainId": 42161
  },
  "0x01aD736DfE0C6f2f4A67b817f6B48D346b32c1dE": {
    "address": "0x01aD736DfE0C6f2f4A67b817f6B48D346b32c1dE",
    "name": "VCT Fjord Foundry LBP",
    "symbol": "VCT_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x01ad736dfe0c6f2f4a67b817f6b48d346b32c1de/icon",
    "chainId": 42161
  },
  "0xEA70b39D79b22932aA92a096BF41E5330e1BA907": {
    "address": "0xEA70b39D79b22932aA92a096BF41E5330e1BA907",
    "name": "VisionaryCraft",
    "symbol": "VCT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xea70b39d79b22932aa92a096bf41e5330e1ba907/icon",
    "chainId": 42161
  },
  "0x410daA041d607372DB596Bc4079A91A35fd5e57f": {
    "address": "0x410daA041d607372DB596Bc4079A91A35fd5e57f",
    "name": "sRBTM Fjord Foundry LBP",
    "symbol": "sRBTM_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x410daa041d607372db596bc4079a91a35fd5e57f/icon",
    "chainId": 42161
  },
  "0x4A65564B5E65F141910e774b5726a5AdFcc5f871": {
    "address": "0x4A65564B5E65F141910e774b5726a5AdFcc5f871",
    "name": "SaleRBTM",
    "symbol": "sRBTM",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4a65564b5e65f141910e774b5726a5adfcc5f871/icon",
    "chainId": 42161
  },
  "0x97C2A5CFDB1c97f9CC76C9DDeA029771b540E6EF": {
    "address": "0x97C2A5CFDB1c97f9CC76C9DDeA029771b540E6EF",
    "name": "HACHI Fjord Foundry LBP",
    "symbol": "HACHI_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x97c2a5cfdb1c97f9cc76c9ddea029771b540e6ef/icon",
    "chainId": 42161
  },
  "0x9dB3c17F8E0B054D223AfE5b2A7772dDC8CFe976": {
    "address": "0x9dB3c17F8E0B054D223AfE5b2A7772dDC8CFe976",
    "name": "Hachiko",
    "symbol": "HACHI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9db3c17f8e0b054d223afe5b2a7772ddc8cfe976/icon",
    "chainId": 42161
  },
  "0x69A670BcBF82E8099BBD70Bb2CDB16e05a928f6c": {
    "address": "0x69A670BcBF82E8099BBD70Bb2CDB16e05a928f6c",
    "name": "Arbitrum Derivatives",
    "symbol": "DRVT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x69a670bcbf82e8099bbd70bb2cdb16e05a928f6c/icon",
    "chainId": 42161
  },
  "0xb28670b3E7Ad27bd41Fb5938136BF9E9cBa90d65": {
    "address": "0xb28670b3E7Ad27bd41Fb5938136BF9E9cBa90d65",
    "name": "Balancer 80 TCR 20 WETH",
    "symbol": "B-80TCR-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb28670b3e7ad27bd41fb5938136bf9e9cba90d65/icon",
    "chainId": 42161
  },
  "0xA72159FC390f0E3C6D415e658264c7c4051E9b87": {
    "address": "0xA72159FC390f0E3C6D415e658264c7c4051E9b87",
    "name": "Tracer",
    "symbol": "TCR",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa72159fc390f0e3c6d415e658264c7c4051e9b87/icon",
    "chainId": 42161
  },
  "0x542e4F8F7f2206637b5e6bFd6358f59218cdfbD9": {
    "address": "0x542e4F8F7f2206637b5e6bFd6358f59218cdfbD9",
    "name": "18TOKEN Copper LBP",
    "symbol": "18TOKEN_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x542e4f8f7f2206637b5e6bfd6358f59218cdfbd9/icon",
    "chainId": 42161
  },
  "0xAA1C0244cEF89d594458C306717C0BE672Bfb093": {
    "address": "0xAA1C0244cEF89d594458C306717C0BE672Bfb093",
    "name": "18TOKEN",
    "symbol": "18TOKEN",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaa1c0244cef89d594458c306717c0be672bfb093/icon",
    "chainId": 42161
  },
  "0xB47FF1E7780B8f1Ea148e1f2Ac9dC52cE40b0329": {
    "address": "0xB47FF1E7780B8f1Ea148e1f2Ac9dC52cE40b0329",
    "name": "UPDOGE BPT",
    "symbol": "BPT-UPDOGE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb47ff1e7780b8f1ea148e1f2ac9dc52ce40b0329/icon",
    "chainId": 42161
  },
  "0xB4b34001bB84Ff025471251d651A2620930f7734": {
    "address": "0xB4b34001bB84Ff025471251d651A2620930f7734",
    "name": "UPDOGE",
    "symbol": "UPDOGE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb4b34001bb84ff025471251d651a2620930f7734/icon",
    "chainId": 42161
  },
  "0xcb71c482240FA9f2EC6525D4f3a019c8f5CA02B9": {
    "address": "0xcb71c482240FA9f2EC6525D4f3a019c8f5CA02B9",
    "name": "67LDO-29WBTC-4wstETH",
    "symbol": "67LDO-29WBTC-4wstETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcb71c482240fa9f2ec6525d4f3a019c8f5ca02b9/icon",
    "chainId": 42161
  },
  "0x432502A764ABEC914f940916652ce55885323cDA": {
    "address": "0x432502A764ABEC914f940916652ce55885323cDA",
    "name": "20WETH-80MYC",
    "symbol": "20WETH-80MYC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x432502a764abec914f940916652ce55885323cda/icon",
    "chainId": 42161
  },
  "0x5A7f39435fD9c381e4932fa2047C9a5136A5E3E7": {
    "address": "0x5A7f39435fD9c381e4932fa2047C9a5136A5E3E7",
    "name": "Balancer wstETH-Boosted Aave WETH StablePool",
    "symbol": "wstETH-bb-a-WETH-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7/icon",
    "chainId": 42161
  },
  "0xcF3AE4b9235B1C203457E472a011C12c3a2fDe93": {
    "address": "0xcF3AE4b9235B1C203457E472a011C12c3a2fDe93",
    "name": "50 wBTC 33 3S-BTC 17 3L-BTC",
    "symbol": "50 wBTC 33 3S-BTC 17 3L-BTC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcf3ae4b9235b1c203457e472a011c12c3a2fde93/icon",
    "chainId": 42161
  },
  "0x05A131B3Cd23Be0b4F7B274B3d237E73650e543d": {
    "address": "0x05A131B3Cd23Be0b4F7B274B3d237E73650e543d",
    "name": "3L-BTC/USD",
    "symbol": "3L-BTC/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x05a131b3cd23be0b4f7b274b3d237e73650e543d/icon",
    "chainId": 42161
  },
  "0x85700dC0bfD128DD0e7B9eD38496A60baC698fc8": {
    "address": "0x85700dC0bfD128DD0e7B9eD38496A60baC698fc8",
    "name": "3S-BTC/USD",
    "symbol": "3S-BTC/USD",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x85700dc0bfd128dd0e7b9ed38496a60bac698fc8/icon",
    "chainId": 42161
  },
  "0x93877781F57Fb12Cb9048685444e34A3f5B5798d": {
    "address": "0x93877781F57Fb12Cb9048685444e34A3f5B5798d",
    "name": "1wstETH-99USDC",
    "symbol": "1wstETH-99USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x93877781f57fb12cb9048685444e34a3f5b5798d/icon",
    "chainId": 42161
  },
  "0x507f8456Aa170285fe33b80757FEca82b8103e77": {
    "address": "0x507f8456Aa170285fe33b80757FEca82b8103e77",
    "name": "lvrlDETH",
    "symbol": "50LEVR-50dEth",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x507f8456aa170285fe33b80757feca82b8103e77/icon",
    "chainId": 42161
  },
  "0xBA98da6EF5EeB1a66B91B6608E0e2Bb6E9020607": {
    "address": "0xBA98da6EF5EeB1a66B91B6608E0e2Bb6E9020607",
    "name": "Derived Ether",
    "symbol": "dEth",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xba98da6ef5eeb1a66b91b6608e0e2bb6e9020607/icon",
    "chainId": 42161
  },
  "0x5A5884FC31948D59DF2aEcCCa143dE900d49e1a3": {
    "address": "0x5A5884FC31948D59DF2aEcCCa143dE900d49e1a3",
    "name": "VST-USDC-USDT-DAI Stable BPT",
    "symbol": "VST-USDC-USDT-DAI-BSP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5a5884fc31948d59df2aeccca143de900d49e1a3/icon",
    "chainId": 42161
  },
  "0x2DE9cF1E8f823F0586b1e11664FC05144a02f059": {
    "address": "0x2DE9cF1E8f823F0586b1e11664FC05144a02f059",
    "name": "80RDNT-20WETH",
    "symbol": "80RDNT-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2de9cf1e8f823f0586b1e11664fc05144a02f059/icon",
    "chainId": 42161
  },
  "0xF93579002DBE8046c43FEfE86ec78b1112247BB8": {
    "address": "0xF93579002DBE8046c43FEfE86ec78b1112247BB8",
    "name": "Balancer 50wstETH-50TENDIE",
    "symbol": "50wstETH-50TENDIE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf93579002dbe8046c43fefe86ec78b1112247bb8/icon",
    "chainId": 42161
  },
  "0x22c8fD06710d10f62710364E5bC42064AC3DabBA": {
    "address": "0x22c8fD06710d10f62710364E5bC42064AC3DabBA",
    "name": "TendieBets.io",
    "symbol": "TENDIE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x22c8fd06710d10f62710364e5bc42064ac3dabba/icon",
    "chainId": 42161
  },
  "0x7d890e2c7eECa435298880c083061A60DCa8A897": {
    "address": "0x7d890e2c7eECa435298880c083061A60DCa8A897",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7d890e2c7eeca435298880c083061a60dca8a897/icon",
    "chainId": 42161
  },
  "0xaded8Fc87501b794D4062F4Df2a5a9c2E1a15d43": {
    "address": "0xaded8Fc87501b794D4062F4Df2a5a9c2E1a15d43",
    "name": "NOVA",
    "symbol": "NOVA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaded8fc87501b794d4062f4df2a5a9c2e1a15d43/icon",
    "chainId": 42161
  },
  "0xD0dC20e6342DB2dE82692B8Dc842301ff9121805": {
    "address": "0xD0dC20e6342DB2dE82692B8Dc842301ff9121805",
    "name": "NFTFi on Layer2",
    "symbol": "80NFTE-20WETH-bb-BPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd0dc20e6342db2de82692b8dc842301ff9121805/icon",
    "chainId": 42161
  },
  "0xB261104A83887aE92392Fb5CE5899fCFe5481456": {
    "address": "0xB261104A83887aE92392Fb5CE5899fCFe5481456",
    "name": "NFTEarth",
    "symbol": "NFTE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb261104a83887ae92392fb5ce5899fcfe5481456/icon",
    "chainId": 42161
  },
  "0xF81d702698E24D3343aaA5f2167d8046004c140D": {
    "address": "0xF81d702698E24D3343aaA5f2167d8046004c140D",
    "name": "70YFI-30USDC",
    "symbol": "70YFI-30USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf81d702698e24d3343aaa5f2167d8046004c140d/icon",
    "chainId": 42161
  },
  "0x82e3A8F066a6989666b031d916c43672085b1582": {
    "address": "0x82e3A8F066a6989666b031d916c43672085b1582",
    "name": "yearn.finance",
    "symbol": "YFI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x82e3a8f066a6989666b031d916c43672085b1582/icon",
    "chainId": 42161
  },
  "0x65Fff6d24ec5A4F2dB2BC3B354EEC833226593D9": {
    "address": "0x65Fff6d24ec5A4F2dB2BC3B354EEC833226593D9",
    "name": "Real Yield",
    "symbol": "RealYield",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x65fff6d24ec5a4f2db2bc3b354eec833226593d9/icon",
    "chainId": 42161
  },
  "0x183D73dA7adC5011EC3C46e33BB50271e59EC976": {
    "address": "0x183D73dA7adC5011EC3C46e33BB50271e59EC976",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x183d73da7adc5011ec3c46e33bb50271e59ec976/icon",
    "chainId": 42161
  },
  "0x66ce08e46a3cD4eB4f861645EE80322CeB0ff844": {
    "address": "0x66ce08e46a3cD4eB4f861645EE80322CeB0ff844",
    "name": "80MOD-20MAI",
    "symbol": "80MOD-20MAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x66ce08e46a3cd4eb4f861645ee80322ceb0ff844/icon",
    "chainId": 42161
  },
  "0x26d23ec319cAd4ad99E237511e792EE326ca1070": {
    "address": "0x26d23ec319cAd4ad99E237511e792EE326ca1070",
    "name": "Balancer 33 DEFI5 33 WBTC 33 WETH",
    "symbol": "B-33DEFI5-33WBTC-33WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x26d23ec319cad4ad99e237511e792ee326ca1070/icon",
    "chainId": 42161
  },
  "0xdeBa25AF35e4097146d7629055E0EC3C71706324": {
    "address": "0xdeBa25AF35e4097146d7629055E0EC3C71706324",
    "name": "DEFI Top 5 Tokens Index",
    "symbol": "DEFI5",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xdeba25af35e4097146d7629055e0ec3c71706324/icon",
    "chainId": 42161
  },
  "0x58E923d22F92469a583abfB6bC5C49246a3D9D04": {
    "address": "0x58E923d22F92469a583abfB6bC5C49246a3D9D04",
    "name": "50WBTC-50WETH",
    "symbol": "50WBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x58e923d22f92469a583abfb6bc5c49246a3d9d04/icon",
    "chainId": 42161
  },
  "0x4d997a27A64c0c04ef697033b1a3121C674Fa5f2": {
    "address": "0x4d997a27A64c0c04ef697033b1a3121C674Fa5f2",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4d997a27a64c0c04ef697033b1a3121c674fa5f2/icon",
    "chainId": 42161
  },
  "0x342c7DC91B0456E2d93884C39348b4324bDc435D": {
    "address": "0x342c7DC91B0456E2d93884C39348b4324bDc435D",
    "name": "50MAGIC-50USDT",
    "symbol": "50MAGIC-50USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x342c7dc91b0456e2d93884c39348b4324bdc435d/icon",
    "chainId": 42161
  },
  "0x9Be7dE742865d021c0E8Fb9D64311b2c040c1ec1": {
    "address": "0x9Be7dE742865d021c0E8Fb9D64311b2c040c1ec1",
    "name": "Balancer USDT-USDC StablePool",
    "symbol": "B-staBAL-2",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9be7de742865d021c0e8fb9d64311b2c040c1ec1/icon",
    "chainId": 42161
  },
  "0x943FE99e6129CB72b3F9F52059Fe46ffEDa42265": {
    "address": "0x943FE99e6129CB72b3F9F52059Fe46ffEDa42265",
    "name": "50MAGIC-50USDC",
    "symbol": "50MAGIC-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x943fe99e6129cb72b3f9f52059fe46ffeda42265/icon",
    "chainId": 42161
  },
  "0xC3564276520e643511EdfA568e6adFbFA5f83A5C": {
    "address": "0xC3564276520e643511EdfA568e6adFbFA5f83A5C",
    "name": "30WETH-70XCAL",
    "symbol": "30WETH-70XCAL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc3564276520e643511edfa568e6adfbfa5f83a5c/icon",
    "chainId": 42161
  },
  "0xd2568acCD10A4C98e87c44E9920360031ad89fCB": {
    "address": "0xd2568acCD10A4C98e87c44E9920360031ad89fCB",
    "name": "3xcalibur Ecosystem Token",
    "symbol": "XCAL",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd2568accd10a4c98e87c44e9920360031ad89fcb/icon",
    "chainId": 42161
  },
  "0x333F9F9e28792B88DBD3882268a3e9C5772376DF": {
    "address": "0x333F9F9e28792B88DBD3882268a3e9C5772376DF",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x333f9f9e28792b88dbd3882268a3e9c5772376df/icon",
    "chainId": 42161
  },
  "0xd0e18545C6B02Fa3CB812859b0D8CBFA105d0b61": {
    "address": "0xd0e18545C6B02Fa3CB812859b0D8CBFA105d0b61",
    "name": "50BAL-50POI$ON",
    "symbol": "50BAL-50POI$ON",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd0e18545c6b02fa3cb812859b0d8cbfa105d0b61/icon",
    "chainId": 42161
  },
  "0xc69771058481551261709D8DB44977e9afDE6450": {
    "address": "0xc69771058481551261709D8DB44977e9afDE6450",
    "name": "40WBTC-40wstETH-bb-a-WETH-BPT-20bb-a-USD",
    "symbol": "40WBTC-40wstETH-bb-a-WETH-BPT-20bb-a-USD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc69771058481551261709d8db44977e9afde6450/icon",
    "chainId": 42161
  },
  "0xEE02583596AEE94ccCB7e8ccd3921d955f17982A": {
    "address": "0xEE02583596AEE94ccCB7e8ccd3921d955f17982A",
    "name": "Balancer Aave v3 Boosted StablePool",
    "symbol": "bb-a-USD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xee02583596aee94cccb7e8ccd3921d955f17982a/icon",
    "chainId": 42161
  },
  "0xE5d4B82e1386163d179B2e2c5cEc2656ad87e780": {
    "address": "0xE5d4B82e1386163d179B2e2c5cEc2656ad87e780",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe5d4b82e1386163d179b2e2c5cec2656ad87e780/icon",
    "chainId": 42161
  },
  "0x56b3e8f7f82D7ACA8CC23CEF1956a42F25c2802b": {
    "address": "0x56b3e8f7f82D7ACA8CC23CEF1956a42F25c2802b",
    "name": "NOVA",
    "symbol": "NOVA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x56b3e8f7f82d7aca8cc23cef1956a42f25c2802b/icon",
    "chainId": 42161
  },
  "0x4CB5e8175aA1D4b08dC899721e0535F41E9A033F": {
    "address": "0x4CB5e8175aA1D4b08dC899721e0535F41E9A033F",
    "name": "40wstETH-30WETH-30rETH",
    "symbol": "40wstETH-30WETH-30rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4cb5e8175aa1d4b08dc899721e0535f41e9a033f/icon",
    "chainId": 42161
  },
  "0x322d3D0320b35667D3B9f18FF89536b385A67631": {
    "address": "0x322d3D0320b35667D3B9f18FF89536b385A67631",
    "name": "50WETH-50LUSD",
    "symbol": "50WETH-50LUSD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x322d3d0320b35667d3b9f18ff89536b385a67631/icon",
    "chainId": 42161
  },
  "0x1779900c7707885720d39aA741F4086886307e9E": {
    "address": "0x1779900c7707885720d39aA741F4086886307e9E",
    "name": "80MAGIC-20WETH",
    "symbol": "80MAGIC-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1779900c7707885720d39aa741f4086886307e9e/icon",
    "chainId": 42161
  },
  "0xd497784cBc396e66b40A3Ae9C290DFB795a654e0": {
    "address": "0xd497784cBc396e66b40A3Ae9C290DFB795a654e0",
    "name": "253L-BTC/USD-253S-ETH/USD-253S-BTC/USD-253L-ETH/USD",
    "symbol": "253L-BTC/USD-253S-ETH/USD-253S-BTC/USD-253L-ETH/USD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd497784cbc396e66b40a3ae9c290dfb795a654e0/icon",
    "chainId": 42161
  },
  "0xC48C8724a16BF223A51958de27F791a93B9a56AC": {
    "address": "0xC48C8724a16BF223A51958de27F791a93B9a56AC",
    "name": "ETH-CRV-CVX",
    "symbol": "ETH-CRV-CVX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc48c8724a16bf223a51958de27f791a93b9a56ac/icon",
    "chainId": 42161
  },
  "0xb952A807345991BD529FDded05009F5e80Fe8F45": {
    "address": "0xb952A807345991BD529FDded05009F5e80Fe8F45",
    "name": "Convex Token",
    "symbol": "CVX",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb952a807345991bd529fdded05009f5e80fe8f45/icon",
    "chainId": 42161
  },
  "0xA6625F741400f90D31e39a17B0D429a92e347A60": {
    "address": "0xA6625F741400f90D31e39a17B0D429a92e347A60",
    "name": "Balancer 80 COMP 20 WETH",
    "symbol": "B-80COMP-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa6625f741400f90d31e39a17b0d429a92e347a60/icon",
    "chainId": 42161
  },
  "0xC999678122cbf8A30cb72C53D4BDd72abd96AF88": {
    "address": "0xC999678122cbf8A30cb72C53D4BDd72abd96AF88",
    "name": "3x BTC/USD+USDC 12hr Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-BTC+USDC-12h 33 3S-BTC+USDC-12h",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc999678122cbf8a30cb72c53d4bdd72abd96af88/icon",
    "chainId": 42161
  },
  "0x66B4DCd9944A32C2b0Eac79D029C3B43E9EC8510": {
    "address": "0x66B4DCd9944A32C2b0Eac79D029C3B43E9EC8510",
    "name": "3S-BTC/USD+USDC-12h",
    "symbol": "3S-BTC/USD+USDC-12h",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x66b4dcd9944a32c2b0eac79d029c3b43e9ec8510/icon",
    "chainId": 42161
  },
  "0x5f3723A56D2Bf60bD81bbd4A6D23bC66D200833d": {
    "address": "0x5f3723A56D2Bf60bD81bbd4A6D23bC66D200833d",
    "name": "3L-BTC/USD+USDC-12h",
    "symbol": "3L-BTC/USD+USDC-12h",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5f3723a56d2bf60bd81bbd4a6d23bc66d200833d/icon",
    "chainId": 42161
  },
  "0xCFe36989ba9a5896D957368FA5b5E17273A57de2": {
    "address": "0xCFe36989ba9a5896D957368FA5b5E17273A57de2",
    "name": "33WETH-33DAI-33UNI",
    "symbol": "33WETH-33DAI-33UNI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xcfe36989ba9a5896d957368fa5b5e17273a57de2/icon",
    "chainId": 42161
  },
  "0x0d9fEC3a621387A3ceC87DA24c4aeC7cA261C856": {
    "address": "0x0d9fEC3a621387A3ceC87DA24c4aeC7cA261C856",
    "name": "3x BTC/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-BTC+USDC 33 3S-BTC+USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0d9fec3a621387a3cec87da24c4aec7ca261c856/icon",
    "chainId": 42161
  },
  "0x2Dc6B0D6580f3E2d6107D41A6ada0d8c6c605F88": {
    "address": "0x2Dc6B0D6580f3E2d6107D41A6ada0d8c6c605F88",
    "name": "3L-BTC/USD+USDC",
    "symbol": "3L-BTC/USD+USDC",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2dc6b0d6580f3e2d6107d41a6ada0d8c6c605f88/icon",
    "chainId": 42161
  },
  "0xd1c070eBc7Ec77f2134b3Ef75283b6C1fb31a157": {
    "address": "0xd1c070eBc7Ec77f2134b3Ef75283b6C1fb31a157",
    "name": "30WBTC-30wstETH-20ARB-20USDC",
    "symbol": "30WBTC-30wstETH-20ARB-20USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xd1c070ebc7ec77f2134b3ef75283b6c1fb31a157/icon",
    "chainId": 42161
  },
  "0x5582b457bEbc3Cd3f88035f7F54B65fec27b3f44": {
    "address": "0x5582b457bEbc3Cd3f88035f7F54B65fec27b3f44",
    "name": "70WBTC-30WETH",
    "symbol": "70WBTC-30WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x5582b457bebc3cd3f88035f7f54b65fec27b3f44/icon",
    "chainId": 42161
  },
  "0x00E7CcB0e16fC07D0cB528Efea2c130c41c2fc16": {
    "address": "0x00E7CcB0e16fC07D0cB528Efea2c130c41c2fc16",
    "name": "25LDO-25wstETH-25RPL-25rETH",
    "symbol": "25LDO-25wstETH-25RPL-25rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x00e7ccb0e16fc07d0cb528efea2c130c41c2fc16/icon",
    "chainId": 42161
  },
  "0xF6Ea7915d71a4c18f87B41ea4A31C6884c20d5A8": {
    "address": "0xF6Ea7915d71a4c18f87B41ea4A31C6884c20d5A8",
    "name": "50DBL-50USDC",
    "symbol": "50DBL-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf6ea7915d71a4c18f87b41ea4a31c6884c20d5a8/icon",
    "chainId": 42161
  },
  "0x83B59330b62931e0EC0ce9EF894d2099E24c6c0B": {
    "address": "0x83B59330b62931e0EC0ce9EF894d2099E24c6c0B",
    "name": "1Y2K-99USDC",
    "symbol": "1Y2K-99USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x83b59330b62931e0ec0ce9ef894d2099e24c6c0b/icon",
    "chainId": 42161
  },
  "0xc3143F76f11b1DBD75a0FE848d24511608f8B3aB": {
    "address": "0xc3143F76f11b1DBD75a0FE848d24511608f8B3aB",
    "name": "253L-BTC/USD-253S-ETH/USD-253S-BTC/USD-253L-ETH/USD",
    "symbol": "253L-BTC/USD-253S-ETH/USD-253S-BTC/USD-253L-ETH/USD",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc3143f76f11b1dbd75a0fe848d24511608f8b3ab/icon",
    "chainId": 42161
  },
  "0xc736821A9CB04561417da3dD4e19Ba1e0436B38c": {
    "address": "0xc736821A9CB04561417da3dD4e19Ba1e0436B38c",
    "name": "Balancer 80 RGT 20 WETH",
    "symbol": "B-80RGT-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc736821a9cb04561417da3dd4e19ba1e0436b38c/icon",
    "chainId": 42161
  },
  "0xef888bcA6AB6B1d26dbeC977C455388ecd794794": {
    "address": "0xef888bcA6AB6B1d26dbeC977C455388ecd794794",
    "name": "Rari Governance Token",
    "symbol": "RGT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xef888bca6ab6b1d26dbec977c455388ecd794794/icon",
    "chainId": 42161
  },
  "0xb286b923A4Ed32eF1Eae425e2b2753F07A517708": {
    "address": "0xb286b923A4Ed32eF1Eae425e2b2753F07A517708",
    "name": "Balancer 80 BAL 20 WETH",
    "symbol": "B-80BAL-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb286b923a4ed32ef1eae425e2b2753f07a517708/icon",
    "chainId": 42161
  },
  "0x9D568DFa51611409566d54c5A50fdA8F4EbDA419": {
    "address": "0x9D568DFa51611409566d54c5A50fdA8F4EbDA419",
    "name": "1VSTA-99USDC",
    "symbol": "1VSTA-99USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9d568dfa51611409566d54c5a50fda8f4ebda419/icon",
    "chainId": 42161
  },
  "0x463615C74f26FC801eFb442d0Ae659Dc8713322a": {
    "address": "0x463615C74f26FC801eFb442d0Ae659Dc8713322a",
    "name": "25aArbLINK-25WETH-25aArbWETH-25LINK",
    "symbol": "25aArbLINK-25WETH-25aArbWETH-25LINK",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x463615c74f26fc801efb442d0ae659dc8713322a/icon",
    "chainId": 42161
  },
  "0xA67Da094e0a29038eAf8Dfff5d41C4FE6CcdD930": {
    "address": "0xA67Da094e0a29038eAf8Dfff5d41C4FE6CcdD930",
    "name": "33WETH-33DAI-33USDC",
    "symbol": "33WETH-33DAI-33USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa67da094e0a29038eaf8dfff5d41c4fe6ccdd930/icon",
    "chainId": 42161
  },
  "0x536f2b3c8607aA5bC16e25a194E93e5bBA8C2FaF": {
    "address": "0x536f2b3c8607aA5bC16e25a194E93e5bBA8C2FaF",
    "name": "50VST-50USDC",
    "symbol": "50VST-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x536f2b3c8607aa5bc16e25a194e93e5bba8c2faf/icon",
    "chainId": 42161
  },
  "0xad6011f5630CAb2Ad0738960dcBF795bAbE3739D": {
    "address": "0xad6011f5630CAb2Ad0738960dcBF795bAbE3739D",
    "name": "50WETH-50DICE",
    "symbol": "50WETH-50DICE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xad6011f5630cab2ad0738960dcbf795babe3739d/icon",
    "chainId": 42161
  },
  "0xAeEBa475eDC438f8Eeb6BFBc3164c1C7716Fb304": {
    "address": "0xAeEBa475eDC438f8Eeb6BFBc3164c1C7716Fb304",
    "name": "Party Dice",
    "symbol": "DICE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xaeeba475edc438f8eeb6bfbc3164c1c7716fb304/icon",
    "chainId": 42161
  },
  "0x87CE4a47aE1e1ae8c09E439fed64de508fcE53d6": {
    "address": "0x87CE4a47aE1e1ae8c09E439fed64de508fcE53d6",
    "name": "50VST-50WETH",
    "symbol": "50VST-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x87ce4a47ae1e1ae8c09e439fed64de508fce53d6/icon",
    "chainId": 42161
  },
  "0x36365dA262dB3965Ba2E1C4411409Bf22508e0A1": {
    "address": "0x36365dA262dB3965Ba2E1C4411409Bf22508e0A1",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x36365da262db3965ba2e1c4411409bf22508e0a1/icon",
    "chainId": 42161
  },
  "0x082a911bedFBcE2bA2a56721A19A631d0C5d2fd5": {
    "address": "0x082a911bedFBcE2bA2a56721A19A631d0C5d2fd5",
    "name": "NOVA",
    "symbol": "NOVA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x082a911bedfbce2ba2a56721a19a631d0c5d2fd5/icon",
    "chainId": 42161
  },
  "0x33BcAa8A390e6DcF2f18AE5fDd9e38fD248219eB": {
    "address": "0x33BcAa8A390e6DcF2f18AE5fDd9e38fD248219eB",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x33bcaa8a390e6dcf2f18ae5fdd9e38fd248219eb/icon",
    "chainId": 42161
  },
  "0x0c1A2a18c39FF0Fd3E8f8EaAFA0fDeDc0e7D1E06": {
    "address": "0x0c1A2a18c39FF0Fd3E8f8EaAFA0fDeDc0e7D1E06",
    "name": "NOVA",
    "symbol": "NOVA",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c1a2a18c39ff0fd3e8f8eaafa0fdedc0e7d1e06/icon",
    "chainId": 42161
  },
  "0x556B2DB3E8EbFa672F2DD7Ccd8Fff8fe5F13AFcf": {
    "address": "0x556B2DB3E8EbFa672F2DD7Ccd8Fff8fe5F13AFcf",
    "name": "45wstETH-55rETH",
    "symbol": "45wstETH-55rETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x556b2db3e8ebfa672f2dd7ccd8fff8fe5f13afcf/icon",
    "chainId": 42161
  },
  "0x6CB787a419c3e6Ee2e9FF365856c29CD10659113": {
    "address": "0x6CB787a419c3e6Ee2e9FF365856c29CD10659113",
    "name": "Balancer Aave v3 Boosted Pool (DAI)",
    "symbol": "bb-a-DAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x6cb787a419c3e6ee2e9ff365856c29cd10659113/icon",
    "chainId": 42161
  },
  "0x426e8778bf7F54b0e4fc703DccA6f26a4E5B71dE": {
    "address": "0x426e8778bf7F54b0e4fc703DccA6f26a4E5B71dE",
    "name": "Static Aave Arbitrum DAI",
    "symbol": "stataArbDAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x426e8778bf7f54b0e4fc703dcca6f26a4e5b71de/icon",
    "chainId": 42161
  },
  "0x4550594E8971a4d89678bfd85ae1d761E4dC9350": {
    "address": "0x4550594E8971a4d89678bfd85ae1d761E4dC9350",
    "name": "33WETH-33USDT-33USDC",
    "symbol": "33WETH-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4550594e8971a4d89678bfd85ae1d761e4dc9350/icon",
    "chainId": 42161
  },
  "0x58778555D4Bf0857FDC7c133B8AB9143E171d52B": {
    "address": "0x58778555D4Bf0857FDC7c133B8AB9143E171d52B",
    "name": "70RDNT-30USDC",
    "symbol": "70RDNT-30USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x58778555d4bf0857fdc7c133b8ab9143e171d52b/icon",
    "chainId": 42161
  },
  "0x2FCAd6F25d8005f9d8F25e5812e582Da5810b8D0": {
    "address": "0x2FCAd6F25d8005f9d8F25e5812e582Da5810b8D0",
    "name": "50WETH-50DICE",
    "symbol": "50WETH-50DICE",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x2fcad6f25d8005f9d8f25e5812e582da5810b8d0/icon",
    "chainId": 42161
  },
  "0x4BA0938c821324b7827249f7E276A4c25D09F013": {
    "address": "0x4BA0938c821324b7827249f7E276A4c25D09F013",
    "name": "1Y2K-99USDC",
    "symbol": "1Y2K-99USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4ba0938c821324b7827249f7e276a4c25d09f013/icon",
    "chainId": 42161
  },
  "0x4a3a22A3e7fee0FfBB66f1C28BfAC50f75546Fc7": {
    "address": "0x4a3a22A3e7fee0FfBB66f1C28BfAC50f75546Fc7",
    "name": "Balancer 80 GNO 20 WETH",
    "symbol": "B-80GNO-20WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4a3a22a3e7fee0ffbb66f1c28bfac50f75546fc7/icon",
    "chainId": 42161
  },
  "0xe1Fb90D0d3b47E551d494d7eBe8f209753526B01": {
    "address": "0xe1Fb90D0d3b47E551d494d7eBe8f209753526B01",
    "name": "Balancer Reaper Boosted Pool (DAI)",
    "symbol": "bb-rf-DAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe1fb90d0d3b47e551d494d7ebe8f209753526b01/icon",
    "chainId": 42161
  },
  "0x12f256109E744081F633a827BE80E06d97ff7447": {
    "address": "0x12f256109E744081F633a827BE80E06d97ff7447",
    "name": "DAI Granary Vault",
    "symbol": "rf-grainDAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x12f256109e744081f633a827be80e06d97ff7447/icon",
    "chainId": 42161
  },
  "0x78Ee263867Da191d07b86294B5549813f4f8B10F": {
    "address": "0x78Ee263867Da191d07b86294B5549813f4f8B10F",
    "name": "2Y2K-98USDC",
    "symbol": "2Y2K-98USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x78ee263867da191d07b86294b5549813f4f8b10f/icon",
    "chainId": 42161
  },
  "0xc0A7BBD4dc4d820Dc717D98797ECA003305b1F34": {
    "address": "0xc0A7BBD4dc4d820Dc717D98797ECA003305b1F34",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc0a7bbd4dc4d820dc717d98797eca003305b1f34/icon",
    "chainId": 42161
  },
  "0x16a6Dd20a40805d7f621E43AEb58A378327a86B3": {
    "address": "0x16a6Dd20a40805d7f621E43AEb58A378327a86B3",
    "name": "50WBTC-50WETH",
    "symbol": "50WBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x16a6dd20a40805d7f621e43aeb58a378327a86b3/icon",
    "chainId": 42161
  },
  "0x54fF0FC92Fc15dABF43bAAb652d1Bb92e6d41526": {
    "address": "0x54fF0FC92Fc15dABF43bAAb652d1Bb92e6d41526",
    "name": "1Y2K-99USDC",
    "symbol": "1Y2K-99USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x54ff0fc92fc15dabf43baab652d1bb92e6d41526/icon",
    "chainId": 42161
  },
  "0x894c82800526E0391E709c0983a5AeA3718b7F6D": {
    "address": "0x894c82800526E0391E709c0983a5AeA3718b7F6D",
    "name": "Balancer Reaper Boosted Pool (USDT)",
    "symbol": "bb-rf-USDT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x894c82800526e0391e709c0983a5aea3718b7f6d/icon",
    "chainId": 42161
  },
  "0x0179baC7493a92AC812730a4C64A0b41B7eA0ecf": {
    "address": "0x0179baC7493a92AC812730a4C64A0b41B7eA0ecf",
    "name": "USDT Granary Vault",
    "symbol": "rf-grainUSDT",
    "decimals": 6,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0179bac7493a92ac812730a4c64a0b41b7ea0ecf/icon",
    "chainId": 42161
  },
  "0xA83c30327B7176756b8689C7BE475841Fcb39446": {
    "address": "0xA83c30327B7176756b8689C7BE475841Fcb39446",
    "name": "1MAGIC-99USDC",
    "symbol": "1MAGIC-99USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa83c30327b7176756b8689c7be475841fcb39446/icon",
    "chainId": 42161
  },
  "0x1ca030f14396f7f346E288Bcc970f87f6F72E2D6": {
    "address": "0x1ca030f14396f7f346E288Bcc970f87f6F72E2D6",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1ca030f14396f7f346e288bcc970f87f6f72e2d6/icon",
    "chainId": 42161
  },
  "0x9f20de1fc9b161b34089cbEAE888168B44b03461": {
    "address": "0x9f20de1fc9b161b34089cbEAE888168B44b03461",
    "name": "ARBIS | We have the yields",
    "symbol": "ARBIS",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x9f20de1fc9b161b34089cbeae888168b44b03461/icon",
    "chainId": 42161
  },
  "0x119990bc25598C4f14F98f6c45b06e75821FC48e": {
    "address": "0x119990bc25598C4f14F98f6c45b06e75821FC48e",
    "name": "50WETH-50ALI",
    "symbol": "50WETH-50ALI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x119990bc25598c4f14f98f6c45b06e75821fc48e/icon",
    "chainId": 42161
  },
  "0xeF6124368c0B56556667e0de77eA008DfC0a71d1": {
    "address": "0xeF6124368c0B56556667e0de77eA008DfC0a71d1",
    "name": "Artificial Liquid Intelligence Token",
    "symbol": "ALI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xef6124368c0b56556667e0de77ea008dfc0a71d1/icon",
    "chainId": 42161
  },
  "0xf2683d640f4b563c02DAAf474Bf3ed3a768485e6": {
    "address": "0xf2683d640f4b563c02DAAf474Bf3ed3a768485e6",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf2683d640f4b563c02daaf474bf3ed3a768485e6/icon",
    "chainId": 42161
  },
  "0x7436422bE6A633f804f70a0Fd2C92876fEf83735": {
    "address": "0x7436422bE6A633f804f70a0Fd2C92876fEf83735",
    "name": "40WETH-60DAI",
    "symbol": "40WETH-60DAI",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7436422be6a633f804f70a0fd2c92876fef83735/icon",
    "chainId": 42161
  },
  "0x7B952450F3711DA1bb9F46f5f95d062ed915207F": {
    "address": "0x7B952450F3711DA1bb9F46f5f95d062ed915207F",
    "name": "WINR Multi Asset Bankroll Pool",
    "symbol": "wBPT",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x7b952450f3711da1bb9f46f5f95d062ed915207f/icon",
    "chainId": 42161
  },
  "0xa904269924b6430e918DbAB6A494e34447106268": {
    "address": "0xa904269924b6430e918DbAB6A494e34447106268",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xa904269924b6430e918dbab6a494e34447106268/icon",
    "chainId": 42161
  },
  "0x4069E9881B36d28522536f12B57900e0C52D33c0": {
    "address": "0x4069E9881B36d28522536f12B57900e0C52D33c0",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x4069e9881b36d28522536f12b57900e0c52d33c0/icon",
    "chainId": 42161
  },
  "0x0C80Bed70c1c938d8f47b8427571E99faE4cF8b4": {
    "address": "0x0C80Bed70c1c938d8f47b8427571E99faE4cF8b4",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x0c80bed70c1c938d8f47b8427571e99fae4cf8b4/icon",
    "chainId": 42161
  },
  "0x54DC47E051c6C6A0aDCF57311E85c32Ed57efE08": {
    "address": "0x54DC47E051c6C6A0aDCF57311E85c32Ed57efE08",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x54dc47e051c6c6a0adcf57311e85c32ed57efe08/icon",
    "chainId": 42161
  },
  "0xf99393C56d213bcA85455996a7104b33B28D920a": {
    "address": "0xf99393C56d213bcA85455996a7104b33B28D920a",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf99393c56d213bca85455996a7104b33b28d920a/icon",
    "chainId": 42161
  },
  "0xc81B0f2c71a3FC40879804F99d0F10358cb98d3C": {
    "address": "0xc81B0f2c71a3FC40879804F99d0F10358cb98d3C",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xc81b0f2c71a3fc40879804f99d0f10358cb98d3c/icon",
    "chainId": 42161
  },
  "0xE15f93eC61D8443F862e2cD75De391c92b4Ce61A": {
    "address": "0xE15f93eC61D8443F862e2cD75De391c92b4Ce61A",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xe15f93ec61d8443f862e2cd75de391c92b4ce61a/icon",
    "chainId": 42161
  },
  "0x1f7c9d8eD305420aAD47097a21af1EcD19B713C5": {
    "address": "0x1f7c9d8eD305420aAD47097a21af1EcD19B713C5",
    "name": "JustBet MultiAsset Bankroll Pool",
    "symbol": "JBbpt",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x1f7c9d8ed305420aad47097a21af1ecd19b713c5/icon",
    "chainId": 42161
  },
  "0xED59fD7d09830528e9066c364392293b0fcFEa9d": {
    "address": "0xED59fD7d09830528e9066c364392293b0fcFEa9d",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xed59fd7d09830528e9066c364392293b0fcfea9d/icon",
    "chainId": 42161
  },
  "0xF13d3e906E69508E32706BeB9f94Bd7495dBb948": {
    "address": "0xF13d3e906E69508E32706BeB9f94Bd7495dBb948",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xf13d3e906e69508e32706beb9f94bd7495dbb948/icon",
    "chainId": 42161
  },
  "0x3323E5c789f377713af70E87972C246CEf1f59D2": {
    "address": "0x3323E5c789f377713af70E87972C246CEf1f59D2",
    "name": "50BAL-50CRV",
    "symbol": "50BAL-50CRV",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0x3323e5c789f377713af70e87972c246cef1f59d2/icon",
    "chainId": 42161
  },
  "0xb08B2921963c73521B536Fe33072ce5BF75e7d33": {
    "address": "0xb08B2921963c73521B536Fe33072ce5BF75e7d33",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://metadata-service.herokuapp.com/api/token/42161/0xb08b2921963c73521b536fe33072ce5bf75e7d33/icon",
    "chainId": 42161
  },
  "0x001eDE6e2744caD2e9477bD58471Ca09cC657766": {
    "address": "0x001eDE6e2744caD2e9477bD58471Ca09cC657766",
    "name": "SSOVDPX",
    "symbol": "SSOVDPXMUL",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0021e01B9fAb840567a8291b864fF783894EabC6": {
    "address": "0x0021e01B9fAb840567a8291b864fF783894EabC6",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0032D65F0f13e2B8157e1a9cF356eC58Aee30C65": {
    "address": "0x0032D65F0f13e2B8157e1a9cF356eC58Aee30C65",
    "name": "50wstETH-50VST",
    "symbol": "50wstETH-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x006EA1CFF165d84a18fD0aE56F6544058096c0f3": {
    "address": "0x006EA1CFF165d84a18fD0aE56F6544058096c0f3",
    "name": "50DAI-50USDT",
    "symbol": "50DAI-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x00877b8fc17b6e65675653Bd85C7696bdB767Ff7": {
    "address": "0x00877b8fc17b6e65675653Bd85C7696bdB767Ff7",
    "name": "High Risk ",
    "symbol": "HIGH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x00Ab79a3bE3AacDD6f85C623f63222A07d3463DB": {
    "address": "0x00Ab79a3bE3AacDD6f85C623f63222A07d3463DB",
    "name": "90HEGIC-10USDT",
    "symbol": "90HEGIC-10USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x00caaeDaB8b9a984FA7CdE48991A6888991FC84F": {
    "address": "0x00caaeDaB8b9a984FA7CdE48991A6888991FC84F",
    "name": "30WETH-70USDC",
    "symbol": "30WETH-70USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x00FCD3d55085e998e291a0005cedeCF58aC14c40": {
    "address": "0x00FCD3d55085e998e291a0005cedeCF58aC14c40",
    "name": "STG/Boosted Aave v3 USD",
    "symbol": "50STG-50bbaUSD ",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0116fF81DDD6F541e89d017b75E810cC0325b44f": {
    "address": "0x0116fF81DDD6F541e89d017b75E810cC0325b44f",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0149e95bFC4623C9388d194bDaA67Fadb6E28A04": {
    "address": "0x0149e95bFC4623C9388d194bDaA67Fadb6E28A04",
    "name": "50VSTA-50DAI",
    "symbol": "50VSTA-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x017a3C76fa7Ad9F54Bf48B66D5F402Eb950e9162": {
    "address": "0x017a3C76fa7Ad9F54Bf48B66D5F402Eb950e9162",
    "name": "50LINK-50USDC",
    "symbol": "50LINK-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x01990f1e6f7F32296f125eE9469705C1C070054D": {
    "address": "0x01990f1e6f7F32296f125eE9469705C1C070054D",
    "name": "Balancer Stafi rETH/WETH ",
    "symbol": "Stafi rETH/WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x01A9502C11f411b494c62746D37e89d6f7078657": {
    "address": "0x01A9502C11f411b494c62746D37e89d6f7078657",
    "name": "50BAL-50wstETH",
    "symbol": "50BAL-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x01b5B8fd68BAE15Ac8047b881a00f5aA54A04534": {
    "address": "0x01b5B8fd68BAE15Ac8047b881a00f5aA54A04534",
    "name": "50GMX-50WETH",
    "symbol": "50GMX-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x01e648d9D37dF577BC3509d4152EfC5590Bcb832": {
    "address": "0x01e648d9D37dF577BC3509d4152EfC5590Bcb832",
    "name": "33ABAS-33bForge-330xBTC",
    "symbol": "33ABAS-33bForge-330xBTC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x022C6a8400801fAf57ACA2C27e876AD8C1061D92": {
    "address": "0x022C6a8400801fAf57ACA2C27e876AD8C1061D92",
    "name": "50wstETH-50VST",
    "symbol": "50wstETH-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x02A3C1f7f6aAFE2CFDdBf6F9C96C6841Cb1DdF4c": {
    "address": "0x02A3C1f7f6aAFE2CFDdBf6F9C96C6841Cb1DdF4c",
    "name": "50DAI-50USDC",
    "symbol": "50DAI-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x02e5D5Ee8208A774Ac346773f61FB0eD98F8358F": {
    "address": "0x02e5D5Ee8208A774Ac346773f61FB0eD98F8358F",
    "name": "50BAL-50MAGIC",
    "symbol": "50BAL-50MAGIC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x02FDf850DeDC97b69D584D3f245c85895fC2ff7c": {
    "address": "0x02FDf850DeDC97b69D584D3f245c85895fC2ff7c",
    "name": "17MAGIC-17DPX-17VSTA-17MYC-17LINK-17USDC",
    "symbol": "17MAGIC-17DPX-17VSTA-17MYC-17LINK-17USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x036AB5aa25EC7FDD2caAE215a924069d812419dA": {
    "address": "0x036AB5aa25EC7FDD2caAE215a924069d812419dA",
    "name": "50BAL-50B-33WETH-33WBTC-33USDC",
    "symbol": "50BAL-50B-33WETH-33WBTC-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0374F6Cb5d843dB52C39DA2eD868BA232cB5F079": {
    "address": "0x0374F6Cb5d843dB52C39DA2eD868BA232cB5F079",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x03aEaBBb199FCfa0c5215d19d5cae8a0cd05f49A": {
    "address": "0x03aEaBBb199FCfa0c5215d19d5cae8a0cd05f49A",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x03e143F4943849267c9602eD486289C079171bD2": {
    "address": "0x03e143F4943849267c9602eD486289C079171bD2",
    "name": "33VST-33TCR-33GMX",
    "symbol": "33VST-33TCR-33GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x03F3919407b9ef2Df36436C256029A16A51B107b": {
    "address": "0x03F3919407b9ef2Df36436C256029A16A51B107b",
    "name": "3x ETH/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-ETH+USDC 33 3S-ETH+USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x04a86C2a70f3501dfB57ABE7801E3931a0F7906E": {
    "address": "0x04a86C2a70f3501dfB57ABE7801E3931a0F7906E",
    "name": "75VST-25USDC",
    "symbol": "75VST-25USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x04e2c6B5B75cBA16BBC7856402BB858e81940f29": {
    "address": "0x04e2c6B5B75cBA16BBC7856402BB858e81940f29",
    "name": "17BAL-17ARB-17SUSHI-17LINK-17UNI-17GMX",
    "symbol": "17BAL-17ARB-17SUSHI-17LINK-17UNI-17GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x055a2dB5D86fD569bccae044a92e09f6F3C1D555": {
    "address": "0x055a2dB5D86fD569bccae044a92e09f6F3C1D555",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x055EB4dC5E68DA5aF6049e3bc7a178885595645f": {
    "address": "0x055EB4dC5E68DA5aF6049e3bc7a178885595645f",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0568769dAA67997AeEF2Ff812de963D7Bff76650": {
    "address": "0x0568769dAA67997AeEF2Ff812de963D7Bff76650",
    "name": "RDPX-DPX-WETH",
    "symbol": "33RDPX-33DPX-33WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x059f298837062D3a651cab5aF85C6F30D947305e": {
    "address": "0x059f298837062D3a651cab5aF85C6F30D947305e",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x064B3A51a730e70E2Bc9f1E333BADCC7D4037D08": {
    "address": "0x064B3A51a730e70E2Bc9f1E333BADCC7D4037D08",
    "name": "50WBTC-50ARB",
    "symbol": "50WBTC-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x077794c30AFECcdF5ad2Abc0588E8CEE7197b71a": {
    "address": "0x077794c30AFECcdF5ad2Abc0588E8CEE7197b71a",
    "name": "bb-rf-USD",
    "symbol": "bb-rf-USD-BPT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x07Dd9aF83C98e5ab4cbad720e3949e1BcaAC91a6": {
    "address": "0x07Dd9aF83C98e5ab4cbad720e3949e1BcaAC91a6",
    "name": "3x BTC/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-BTC 33 3S-BTC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x083d39A702C2fabeA086C5f63d4fD97a60DDfB2b": {
    "address": "0x083d39A702C2fabeA086C5f63d4fD97a60DDfB2b",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0847218abdAB6779125E229aBb37Cf9cD19eB448": {
    "address": "0x0847218abdAB6779125E229aBb37Cf9cD19eB448",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0851D2DEA249351C8935aF604fe7D44b6fDAd13F": {
    "address": "0x0851D2DEA249351C8935aF604fe7D44b6fDAd13F",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x088373A91AD7923Ca342c20eE8555998abdC33CA": {
    "address": "0x088373A91AD7923Ca342c20eE8555998abdC33CA",
    "name": "ARBIS Copper Launch",
    "symbol": "ARBIS_TLA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x088F073C4FC2f5d7aF474cBb37FbE16B17fC2239": {
    "address": "0x088F073C4FC2f5d7aF474cBb37FbE16B17fC2239",
    "name": "Arbitrum XDO/XUSD Weighted Pool",
    "symbol": "XDOWP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x08b7486c0f66F5df29d78E89dfc3B22F5eA690Ef": {
    "address": "0x08b7486c0f66F5df29d78E89dfc3B22F5eA690Ef",
    "name": "50MAGIC-50WETH",
    "symbol": "50MAGIC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x08ef21291dbBBb26728F1E65dDB6AA57EFb9E3df": {
    "address": "0x08ef21291dbBBb26728F1E65dDB6AA57EFb9E3df",
    "name": "33VST-33WETH-33USDC",
    "symbol": "33VST-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x090bAF9b679E9a2eeAB799F304BC30D25752d3C9": {
    "address": "0x090bAF9b679E9a2eeAB799F304BC30D25752d3C9",
    "name": "50ABAS-50WETH",
    "symbol": "50ABAS-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x091e74D4898586530A1842627Ce12dc1b75C93c0": {
    "address": "0x091e74D4898586530A1842627Ce12dc1b75C93c0",
    "name": "333S-BTC/USD+USDC-333L-BTC/USD+USDC-33USDC",
    "symbol": "333S-BTC/USD+USDC-333L-BTC/USD+USDC-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x09Ae6CdAfBBEf25483005A12CF44071F37F73bD9": {
    "address": "0x09Ae6CdAfBBEf25483005A12CF44071F37F73bD9",
    "name": "50WETH-50USDT",
    "symbol": "50WETH-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x09AFEc27F5A6201617aAd014CeEa8deb572B0608": {
    "address": "0x09AFEc27F5A6201617aAd014CeEa8deb572B0608",
    "name": "50wstETH-50STG",
    "symbol": "50wstETH-50STG",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x09C44803125e22fb745980e6ED37Cd897B7A87F6": {
    "address": "0x09C44803125e22fb745980e6ED37Cd897B7A87F6",
    "name": "50WETH-50ATG",
    "symbol": "50WETH-50ATG",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0aD5376Cb4BD5396Ee714883DB859DD065B28B3f": {
    "address": "0x0aD5376Cb4BD5396Ee714883DB859DD065B28B3f",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0B0DAc4AD77864eeBf8edCF45795CDa165bD2434": {
    "address": "0x0B0DAc4AD77864eeBf8edCF45795CDa165bD2434",
    "name": "50RDNT-50USDT",
    "symbol": "50RDNT-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0b5caDa4241EeEfdc8CA3775DcFc59686edE7650": {
    "address": "0x0b5caDa4241EeEfdc8CA3775DcFc59686edE7650",
    "name": "50VSTA-50LINK",
    "symbol": "50VSTA-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0B72713E81e1515E8598D494689a6F89407185E6": {
    "address": "0x0B72713E81e1515E8598D494689a6F89407185E6",
    "name": "1MAGIC-99VSTA",
    "symbol": "1MAGIC-99VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0b75783ed7D15e4f051b1CE2346eE0428f43C650": {
    "address": "0x0b75783ed7D15e4f051b1CE2346eE0428f43C650",
    "name": "10WETH-90VSTA",
    "symbol": "10WETH-90VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0b7E26E584B59Af62a86520Ea78AedaF105Be388": {
    "address": "0x0b7E26E584B59Af62a86520Ea78AedaF105Be388",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0ba1Bc835236cB0054CFd1ab4aa004143D4dF16d": {
    "address": "0x0ba1Bc835236cB0054CFd1ab4aa004143D4dF16d",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0bbF137251be220bCa50B660d0E889a3F795eA63": {
    "address": "0x0bbF137251be220bCa50B660d0E889a3F795eA63",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0bFE50f798f981bE378A2ae0807Fab56e30513D1": {
    "address": "0x0bFE50f798f981bE378A2ae0807Fab56e30513D1",
    "name": "50WETH-50GMX",
    "symbol": "50WETH-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0c2B3E31639bbC8c7eE3F1dCf86aDBE658377e50": {
    "address": "0x0c2B3E31639bbC8c7eE3F1dCf86aDBE658377e50",
    "name": "Balancer 80 MKR 20 WETH",
    "symbol": "B-80MKR-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0c5A8De75e0cf91bA39CD888f70C8C621117cf21": {
    "address": "0x0c5A8De75e0cf91bA39CD888f70C8C621117cf21",
    "name": "50WETH-50VSTA",
    "symbol": "50WETH-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0c8972437a38b389ec83d1E666b69b8a4fcf8bfd": {
    "address": "0x0c8972437a38b389ec83d1E666b69b8a4fcf8bfd",
    "name": "Balancer wstETH/rETH/sfrxETH CSP",
    "symbol": "wstETH/rETH/sfrxETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0D3600A43eB2D1EF38Fa4b99A6305468fEce949B": {
    "address": "0x0D3600A43eB2D1EF38Fa4b99A6305468fEce949B",
    "name": "30MAGIC-70USDC",
    "symbol": "30MAGIC-70USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0d56E15F2857709Dc501a4254ae8355Fd18C653f": {
    "address": "0x0d56E15F2857709Dc501a4254ae8355Fd18C653f",
    "name": "80Y2K-20B-stETH-Stable",
    "symbol": "80Y2K-20B-stETH-Stable",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0e1cDc10a131d07636Fb4Cf322F79B8dF551dd9E": {
    "address": "0x0e1cDc10a131d07636Fb4Cf322F79B8dF551dd9E",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0E1ea7C0ceD14E1e55C8E6582C4f50859d3C8c9B": {
    "address": "0x0E1ea7C0ceD14E1e55C8E6582C4f50859d3C8c9B",
    "name": "50VST-50VSTA",
    "symbol": "50VST-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0E87D8dD0DDD7b0c6E70C3E1Ca45144DAE5F2163": {
    "address": "0x0E87D8dD0DDD7b0c6E70C3E1Ca45144DAE5F2163",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0EF139583849e8C6b7c64ab487b4A6137f230855": {
    "address": "0x0EF139583849e8C6b7c64ab487b4A6137f230855",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x0f4aF410368033Eb611BF6AF99e2503775880c33": {
    "address": "0x0f4aF410368033Eb611BF6AF99e2503775880c33",
    "name": "9LDO-29WBTC-4wstETH-15YFI-43GNO",
    "symbol": "9LDO-29WBTC-4wstETH-15YFI-43GNO",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x108761483f159B6eF0E432F0e8d6f103A1C6B9ee": {
    "address": "0x108761483f159B6eF0E432F0e8d6f103A1C6B9ee",
    "name": "33VST-33VSTA-33USDC",
    "symbol": "33VST-33VSTA-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x10a361766e64D7983a97202ac3a0F4cee06Eb717": {
    "address": "0x10a361766e64D7983a97202ac3a0F4cee06Eb717",
    "name": "50BAL-50wstETH",
    "symbol": "50BAL-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x10ba3039D67296D03B93B95a89644E1f12CaAfc6": {
    "address": "0x10ba3039D67296D03B93B95a89644E1f12CaAfc6",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x11545B8A4a40a3B80Ad4e8101Ba36953a426839b": {
    "address": "0x11545B8A4a40a3B80Ad4e8101Ba36953a426839b",
    "name": "50ARB-50USDC.e",
    "symbol": "50ARB-50USDC.e",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x117a3d474976274B37B7b94aF5DcAde5c90C6e85": {
    "address": "0x117a3d474976274B37B7b94aF5DcAde5c90C6e85",
    "name": "Balancer Boosted DAI+",
    "symbol": "bb-DAI+",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x11884dA90FB4221b3aa288a7741C51eC4Fc43B2f": {
    "address": "0x11884dA90FB4221b3aa288a7741C51eC4Fc43B2f",
    "name": "DO NOT USE - Mock Linear Pool",
    "symbol": "TEST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x11c70d4E54B811548e2CaC4267611DB43b5b175A": {
    "address": "0x11c70d4E54B811548e2CaC4267611DB43b5b175A",
    "name": "25USDC-50STAR-25USDC.e",
    "symbol": "25USDC-50STAR-25USDC.e",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x11Ff498C7c2A29fc4638BF45D9fF995C3297fcA5": {
    "address": "0x11Ff498C7c2A29fc4638BF45D9fF995C3297fcA5",
    "name": "20WETH-80ARB",
    "symbol": "20WETH-80ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x122cBA80eD5fC0290E9C86c4De36F5402732071A": {
    "address": "0x122cBA80eD5fC0290E9C86c4De36F5402732071A",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1249c510e066731FF14422500466A7102603da9e": {
    "address": "0x1249c510e066731FF14422500466A7102603da9e",
    "name": "50ACID-50USDC",
    "symbol": "50ACID-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x124Fe02D150f1E8dc67332840B9aB9f0F0da3884": {
    "address": "0x124Fe02D150f1E8dc67332840B9aB9f0F0da3884",
    "name": "80WETH-20USDC",
    "symbol": "80WETH-20USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x129C6402FF88611Aa59BF2e14B39e091822e2C9c": {
    "address": "0x129C6402FF88611Aa59BF2e14B39e091822e2C9c",
    "name": "DO NOT USE - Mock Weighted Pool",
    "symbol": "TEST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x12d8E495320030d9411AE8E2Fe6dA15a417bd56b": {
    "address": "0x12d8E495320030d9411AE8E2Fe6dA15a417bd56b",
    "name": "50SUSHI-50USDC",
    "symbol": "50SUSHI-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x132D35E4bA616e446E108b974e4c1E957701981A": {
    "address": "0x132D35E4bA616e446E108b974e4c1E957701981A",
    "name": "50WBTC-50VST",
    "symbol": "50WBTC-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1388e043FCFc289D520625A519867d18C4b36213": {
    "address": "0x1388e043FCFc289D520625A519867d18C4b36213",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x13c3b4A204723EF411A39aa7766b56E0f0A31986": {
    "address": "0x13c3b4A204723EF411A39aa7766b56E0f0A31986",
    "name": "LUNAS",
    "symbol": "LUNAS",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x13D3B17dE2284BcC7E4D3C0037Ebaca38df427Fa": {
    "address": "0x13D3B17dE2284BcC7E4D3C0037Ebaca38df427Fa",
    "name": "50DAI-50USDC",
    "symbol": "50DAI-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x13F2f70A951FB99d48ede6E25B0bdF06914db33F": {
    "address": "0x13F2f70A951FB99d48ede6E25B0bdF06914db33F",
    "name": "Balancer 50wstETH-50LDO",
    "symbol": "50wstETH-50LDO",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x13FfB514E9DeE60065AdB70DFFb7FD273B347d21": {
    "address": "0x13FfB514E9DeE60065AdB70DFFb7FD273B347d21",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x14a900E14Cf6Fd2f7dA0Ab739be990536Ab7acc8": {
    "address": "0x14a900E14Cf6Fd2f7dA0Ab739be990536Ab7acc8",
    "name": "90USDT-10USDC",
    "symbol": "90USDT-10USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x14D162E10eCCe3935c1F64cd49faB28b3cC2B527": {
    "address": "0x14D162E10eCCe3935c1F64cd49faB28b3cC2B527",
    "name": "3x ETH/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-ETH+USDC 33 3S-ETH+USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x181d8532e828A9767258296c90662f5050baeA4E": {
    "address": "0x181d8532e828A9767258296c90662f5050baeA4E",
    "name": "Correlated rAMM - frxETH/wstETH",
    "symbol": "crAMM-frxETH/wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/ramses-exchange.jpg",
    "chainId": 42161
  },
  "0x0CB75413A9Be84D0Ab502c121BD603b1BF8f788F": {
    "address": "0x0CB75413A9Be84D0Ab502c121BD603b1BF8f788F",
    "name": "Correlated rAMM - wstETH/swETH",
    "symbol": "crAMM-wstETH/swETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/ramses-exchange.jpg",
    "chainId": 42161
  },
  "0xCb2C8210e7dAd0d8793dA18c7c3a548b51AC7E8a": {
    "address": "0xCb2C8210e7dAd0d8793dA18c7c3a548b51AC7E8a",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x3711b82C441F2EB89cd14910aD41214C7832Bf1f": {
    "address": "0x3711b82C441F2EB89cd14910aD41214C7832Bf1f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x45A5db2d1bE66fA40DA8fA5B2Fed4Ac3b2182788": {
    "address": "0x45A5db2d1bE66fA40DA8fA5B2Fed4Ac3b2182788",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x2e8Ea681FD59c9dc5f32B29de31F782724EF4DcB": {
    "address": "0x2e8Ea681FD59c9dc5f32B29de31F782724EF4DcB",
    "name": "Balancer 50GOLD-25USDC-25WSTETH",
    "symbol": "50GOLD-25USDC-25WSTETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x613607386257338239E4D60ac6a8ecB3528C0fe9": {
    "address": "0x613607386257338239E4D60ac6a8ecB3528C0fe9",
    "name": "Moo Uniswap Gamma USDC-DAI",
    "symbol": "mooUniswapGammaUSDC-DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0xa568b3e32452E873513Ead050B05076809786916": {
    "address": "0xa568b3e32452E873513Ead050B05076809786916",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x82441F1c9BA9412661115fEdeaf1ACC6F5d450Ff": {
    "address": "0x82441F1c9BA9412661115fEdeaf1ACC6F5d450Ff",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xEf51D5832A45532785F31899F147CbfF07b85e4e": {
    "address": "0xEf51D5832A45532785F31899F147CbfF07b85e4e",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x957d283173e1f862D6Ca32b17b41f05b457Bb6cf": {
    "address": "0x957d283173e1f862D6Ca32b17b41f05b457Bb6cf",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xB45A382E6c50c71376fC54F902Eb6C4C57436b68": {
    "address": "0xB45A382E6c50c71376fC54F902Eb6C4C57436b68",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x5a5b903C7DDfFfdFc35Ea1F17A250bcf51FF17Ed": {
    "address": "0x5a5b903C7DDfFfdFc35Ea1F17A250bcf51FF17Ed",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xf9e7d49dcD47a199b48701498b97d56d477cEabf": {
    "address": "0xf9e7d49dcD47a199b48701498b97d56d477cEabf",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xc2Df07F7A1446d20eC39CD846C89dE2b0CEd0D7d": {
    "address": "0xc2Df07F7A1446d20eC39CD846C89dE2b0CEd0D7d",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x88E2c969e2a1C69c16d1dcd9f8ACdE4c6Ab3838a": {
    "address": "0x88E2c969e2a1C69c16d1dcd9f8ACdE4c6Ab3838a",
    "name": "80FOX-20WETH",
    "symbol": "80FOX-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb6911f80B1122f41C19B299a69dCa07100452bf9": {
    "address": "0xb6911f80B1122f41C19B299a69dCa07100452bf9",
    "name": "Gyroscope ECLP USDC/USDT",
    "symbol": "ECLP-USDC-USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x93981d31ADE2C84882a9A1ABA9Cb49978C83389a": {
    "address": "0x93981d31ADE2C84882a9A1ABA9Cb49978C83389a",
    "name": "Moo Aura Arb RDNT-WETH",
    "symbol": "mooAuraArbRDNT-WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0x49b2De7d214070893c038299a57BaC5ACb8B8A34": {
    "address": "0x49b2De7d214070893c038299a57BaC5ACb8B8A34",
    "name": "Balancer 25GOLD-25BAL-25AURA-25wstETH",
    "symbol": "GOLD-BAL-AURA-wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9f4B86928E2650703C9Ad51ccF683E98FF7f54E9": {
    "address": "0x9f4B86928E2650703C9Ad51ccF683E98FF7f54E9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xd9aCa315856233579536C4A504dB23e9897A884A": {
    "address": "0xd9aCa315856233579536C4A504dB23e9897A884A",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xc8336858f2E68d1bcE7e19FF9c724009153820FA": {
    "address": "0xc8336858f2E68d1bcE7e19FF9c724009153820FA",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x95B3dfcf11401b1448684156728D677Dd032380d": {
    "address": "0x95B3dfcf11401b1448684156728D677Dd032380d",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x85Ec6ae01624aE0d2a04D0Ffaad3A25884C7d0f3": {
    "address": "0x85Ec6ae01624aE0d2a04D0Ffaad3A25884C7d0f3",
    "name": "Balancer 80OVN/20wUSD+",
    "symbol": "80OVN/20wUSD+",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x034FE8ae571a88eCf69ee48DFa255e5dA14a409f": {
    "address": "0x034FE8ae571a88eCf69ee48DFa255e5dA14a409f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xbf793018D14923D59d26815eb2F46533b886dD7e": {
    "address": "0xbf793018D14923D59d26815eb2F46533b886dD7e",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x00cd6F5f6dbc47C481c585208f49E12203Bb2908": {
    "address": "0x00cd6F5f6dbc47C481c585208f49E12203Bb2908",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xc85Da166B85b1612AEAB60fd8b02c03882E394fF": {
    "address": "0xc85Da166B85b1612AEAB60fd8b02c03882E394fF",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x3E46B44eefa232f76693dF3bEfF575b96Dc8501a": {
    "address": "0x3E46B44eefa232f76693dF3bEfF575b96Dc8501a",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xDe49B64FF9bbB04D15479847BFcfF6851C29118F": {
    "address": "0xDe49B64FF9bbB04D15479847BFcfF6851C29118F",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xc19B5d05e252808D62a721f235527583E57cf974": {
    "address": "0xc19B5d05e252808D62a721f235527583E57cf974",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xDfa2924C693beCb722C4f71a1Ee27387277c97Fb": {
    "address": "0xDfa2924C693beCb722C4f71a1Ee27387277c97Fb",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x6f42b64623b8B9E436b8555A98EfEa6eCAECACA6": {
    "address": "0x6f42b64623b8B9E436b8555A98EfEa6eCAECACA6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x9A2ef889401135399f7aF5e95500390153E9280E": {
    "address": "0x9A2ef889401135399f7aF5e95500390153E9280E",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x848a7ff84Cf73D2534c3Dac6ab381E177A1Cff24": {
    "address": "0x848a7ff84Cf73D2534c3Dac6ab381E177A1Cff24",
    "name": "33108-33WETH-33USDC",
    "symbol": "33108-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8a54E6553d0B0672C272EDc1571db44693999148": {
    "address": "0x8a54E6553d0B0672C272EDc1571db44693999148",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x69719cAd3E54033B616CBdA4cBE795e9d143bE29": {
    "address": "0x69719cAd3E54033B616CBdA4cBE795e9d143bE29",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x726701D35C65ce9817704eea04ec32F105a183d1": {
    "address": "0x726701D35C65ce9817704eea04ec32F105a183d1",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x1505c655d43f45b4FC792a22Fd01fA9811A17a1F": {
    "address": "0x1505c655d43f45b4FC792a22Fd01fA9811A17a1F",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x12eDfe19B3F2ffA8e5c6D048F6bE02CBC6EEcaE7": {
    "address": "0x12eDfe19B3F2ffA8e5c6D048F6bE02CBC6EEcaE7",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x108dB5F7dB6CE4F9dc30Bf65EdB9040F63540669": {
    "address": "0x108dB5F7dB6CE4F9dc30Bf65EdB9040F63540669",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x006a9EeEd8160b470F2E10b12e7C9A4EfE1f3157": {
    "address": "0x006a9EeEd8160b470F2E10b12e7C9A4EfE1f3157",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/camelot-v2.png",
    "chainId": 42161
  },
  "0x0eCc4c4c8249509Cfe2C88BE8fB53F83cd7aD66f": {
    "address": "0x0eCc4c4c8249509Cfe2C88BE8fB53F83cd7aD66f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x2a7c3D34373ECf345D4945a63A7a5fD329261e5A": {
    "address": "0x2a7c3D34373ECf345D4945a63A7a5fD329261e5A",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x5f8e55ad78387FF6397c803Ae85D6e2bEB700563": {
    "address": "0x5f8e55ad78387FF6397c803Ae85D6e2bEB700563",
    "name": "Moo Sushi Gamma ARB-ETH",
    "symbol": "mooSushiGammaARB-ETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0xc43A17074967fFf3231134C387c0f3144dDF5D46": {
    "address": "0xc43A17074967fFf3231134C387c0f3144dDF5D46",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x22b7116C9410F12C6Cc7F3A80897263989E099E7": {
    "address": "0x22b7116C9410F12C6Cc7F3A80897263989E099E7",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x8910Dd0d2C0823f8Bb6D2494c896FFbc7740e4B6": {
    "address": "0x8910Dd0d2C0823f8Bb6D2494c896FFbc7740e4B6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x9Dcc8C611BBb2B983c65557dfd58692978BD9A38": {
    "address": "0x9Dcc8C611BBb2B983c65557dfd58692978BD9A38",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/camelot-v2.png",
    "chainId": 42161
  },
  "0x2532a664A135FafDC2B0B679ca37118dA127E1eA": {
    "address": "0x2532a664A135FafDC2B0B679ca37118dA127E1eA",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xB4c90dCfc64245b1BDdaE9E1a5aB6c712602C2B6": {
    "address": "0xB4c90dCfc64245b1BDdaE9E1a5aB6c712602C2B6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xA283450EbEF8e3F78a067D83336a6e88D5e4D1FC": {
    "address": "0xA283450EbEF8e3F78a067D83336a6e88D5e4D1FC",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xca1376DC8D1083f9C603505cE07DF3381865Eb2B": {
    "address": "0xca1376DC8D1083f9C603505cE07DF3381865Eb2B",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x57b85FEf094e10b5eeCDF350Af688299E9553378": {
    "address": "0x57b85FEf094e10b5eeCDF350Af688299E9553378",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xa53CFd8A27e48f87885F12E8F79160F56fDc4AC6": {
    "address": "0xa53CFd8A27e48f87885F12E8F79160F56fDc4AC6",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x98dF396f3617019fcdF8AaD7267fa5e794B5D410": {
    "address": "0x98dF396f3617019fcdF8AaD7267fa5e794B5D410",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5": {
    "address": "0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5",
    "name": "Aave Arbitrum FRAX",
    "symbol": "aArbFRAX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/aave-v3.png",
    "chainId": 42161
  },
  "0x45C2e34D26aCD02c487A47f991172C357701466F": {
    "address": "0x45C2e34D26aCD02c487A47f991172C357701466F",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x864b3dC46AC2B3CD444ab54680c4afCec16d6AcE": {
    "address": "0x864b3dC46AC2B3CD444ab54680c4afCec16d6AcE",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xb9A27ba529634017b12e3cbbbFFb6dB7908a8C8B": {
    "address": "0xb9A27ba529634017b12e3cbbbFFb6dB7908a8C8B",
    "name": "Moo Compound Arb USDC",
    "symbol": "mooCompoundArbUSDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0x68e0efd53dC94B037850f90b8eFD48b32F7fF7FC": {
    "address": "0x68e0efd53dC94B037850f90b8eFD48b32F7fF7FC",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xc3073647D8fE5B4f281515BeEF3fD92B1422eb63": {
    "address": "0xc3073647D8fE5B4f281515BeEF3fD92B1422eb63",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/camelot-v2.png",
    "chainId": 42161
  },
  "0x31342307bdCF1528Be1F4E7D675Ce418C500A4d8": {
    "address": "0x31342307bdCF1528Be1F4E7D675Ce418C500A4d8",
    "name": "Moo Sushi Gamma USDC-ETH",
    "symbol": "mooSushiGammaUSDC-ETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0x7e45487eA905471aa9067507121199B586Fa8A57": {
    "address": "0x7e45487eA905471aa9067507121199B586Fa8A57",
    "name": "Moo Uniswap Gamma wstETH-ETH",
    "symbol": "mooUniswapGammawstETH-ETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0x728C4f7C2ff43e6c069CDA03e3c5BD48436DE40C": {
    "address": "0x728C4f7C2ff43e6c069CDA03e3c5BD48436DE40C",
    "name": "Moo Convex tBTC",
    "symbol": "mooConvexTBTC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0x931Ccee78dEF8762935F8b5D3c3e3D1988a51256": {
    "address": "0x931Ccee78dEF8762935F8b5D3c3e3D1988a51256",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x8acba6F955575f630BE0bbAAF4eD528D1d78D6b9": {
    "address": "0x8acba6F955575f630BE0bbAAF4eD528D1d78D6b9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xb4Ace3DAaAA5B1cA9b96177595FA31f6E8774a79": {
    "address": "0xb4Ace3DAaAA5B1cA9b96177595FA31f6E8774a79",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/camelot-v2.png",
    "chainId": 42161
  },
  "0x451Cca89D9DdfE5e4235C14Cb818A7Ff8dc98253": {
    "address": "0x451Cca89D9DdfE5e4235C14Cb818A7Ff8dc98253",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x3716664878f0F236f0509BA1662920DBd6268d9f": {
    "address": "0x3716664878f0F236f0509BA1662920DBd6268d9f",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x347F739cf550712FaB7d876130447F0BA2451FD7": {
    "address": "0x347F739cf550712FaB7d876130447F0BA2451FD7",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xb833Fa857312C246b38deFd492d7bf828153949B": {
    "address": "0xb833Fa857312C246b38deFd492d7bf828153949B",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x37DE2870342f9DED449Eb6fed0fCDEF6e4aE4EC5": {
    "address": "0x37DE2870342f9DED449Eb6fed0fCDEF6e4aE4EC5",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x31440D82F14e36Be8EDE9E47137E3dfFEEf32C51": {
    "address": "0x31440D82F14e36Be8EDE9E47137E3dfFEEf32C51",
    "name": "VolatileV1 AMM - WETH/ACS",
    "symbol": "vAMM-WETH/ACS",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/chronos.png",
    "chainId": 42161
  },
  "0x0c03AA7826FeD6181A262d19E89C4089E8fCB176": {
    "address": "0x0c03AA7826FeD6181A262d19E89C4089E8fCB176",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x0b288D880a8d14dfEe8464Ab66F404899391f34E": {
    "address": "0x0b288D880a8d14dfEe8464Ab66F404899391f34E",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x64Aad1D74eB39f6BeaC4EEE201Ff5963ef5Fd8D9": {
    "address": "0x64Aad1D74eB39f6BeaC4EEE201Ff5963ef5Fd8D9",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0xC977492506E6516102a5687154394Ed747A617ff": {
    "address": "0xC977492506E6516102a5687154394Ed747A617ff",
    "name": "Volatile rAMM - GMD/gmUSD",
    "symbol": "vrAMM-GMD/gmUSD",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/ramses-exchange.jpg",
    "chainId": 42161
  },
  "0x11ab3d15a7D04d9BBA1207563AC23E45064cD3Ba": {
    "address": "0x11ab3d15a7D04d9BBA1207563AC23E45064cD3Ba",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x25F602aFf028531Cc40b5fdabD16647c692fA2D4": {
    "address": "0x25F602aFf028531Cc40b5fdabD16647c692fA2D4",
    "name": "Volatile rAMM - DUSD/ankrETH",
    "symbol": "vrAMM-DUSD/ankrETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/ramses-exchange.jpg",
    "chainId": 42161
  },
  "0xF506D81f4e2A89994B7B14f3bd419D5d0fc6793e": {
    "address": "0xF506D81f4e2A89994B7B14f3bd419D5d0fc6793e",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x32B253b24B2c63Ef639F62672A2D51898725185A": {
    "address": "0x32B253b24B2c63Ef639F62672A2D51898725185A",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/camelot-v2.png",
    "chainId": 42161
  },
  "0xBe2C25E5F21D8329a032500542cb0d09fC9438a0": {
    "address": "0xBe2C25E5F21D8329a032500542cb0d09fC9438a0",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x38A912FBD313833637602c4862da0998FEFD2aF3": {
    "address": "0x38A912FBD313833637602c4862da0998FEFD2aF3",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x661E9DAC23357759DEB5810d11877176B4799B3A": {
    "address": "0x661E9DAC23357759DEB5810d11877176B4799B3A",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x27853De296b6f46713EBDD07223F4743AF9cB5E5": {
    "address": "0x27853De296b6f46713EBDD07223F4743AF9cB5E5",
    "name": "Camelot LP",
    "symbol": "CMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/camelot-v2.png",
    "chainId": 42161
  },
  "0x1D0D0d58Fa46D7EB6db6836E662CD234565c7dBD": {
    "address": "0x1D0D0d58Fa46D7EB6db6836E662CD234565c7dBD",
    "name": "Moo Sushi Gamma SUSHI-ETH",
    "symbol": "mooSushiGammaSUSHI-ETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/beefy.png",
    "chainId": 42161
  },
  "0xa9C7580793a46441581867cF6F5f26D5228c5cD7": {
    "address": "0xa9C7580793a46441581867cF6F5f26D5228c5cD7",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x201b2860dD3f24E5B2c40d1e60d602b0B6b0B73d": {
    "address": "0x201b2860dD3f24E5B2c40d1e60d602b0B6b0B73d",
    "name": "SushiSwap LP Token",
    "symbol": "SLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/sushiswap.png",
    "chainId": 42161
  },
  "0x051ddfbd30BEA7326646bd027a8A7AC0C3626f3C": {
    "address": "0x051ddfbd30BEA7326646bd027a8A7AC0C3626f3C",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x12cB40D5e31DBe6D61891B2332A473a4a71d2283": {
    "address": "0x12cB40D5e31DBe6D61891B2332A473a4a71d2283",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEd420D58D6eFA85d63926966CD1eC9ebA4e57b11": {
    "address": "0xEd420D58D6eFA85d63926966CD1eC9ebA4e57b11",
    "name": "VST-USDC-USDT-DAI Stable BPT",
    "symbol": "VST BSP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC0014a5a11294c2af12e38967233F4C09D668bdb": {
    "address": "0xC0014a5a11294c2af12e38967233F4C09D668bdb",
    "name": "33WETH-33USDT-33USDC",
    "symbol": "33WETH-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xec2aDDE329532ED7e35aDc18748b9aDb372adc4F": {
    "address": "0xec2aDDE329532ED7e35aDc18748b9aDb372adc4F",
    "name": "MoonFolio",
    "symbol": "MF",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xbfA759E734ACC2A279030812E639a3B34ebBe1fa": {
    "address": "0xbfA759E734ACC2A279030812E639a3B34ebBe1fa",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3B58Ecf7496c21F90Dde49e106BBc2f7C60aAe74": {
    "address": "0x3B58Ecf7496c21F90Dde49e106BBc2f7C60aAe74",
    "name": "50DPX-50USDC",
    "symbol": "50DPX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5BAe72B75CaAb1f260D21BC028c630140607D6e8": {
    "address": "0x5BAe72B75CaAb1f260D21BC028c630140607D6e8",
    "name": "Balancer Reaper Boosted Pool (USDC)",
    "symbol": "bb-rf-USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3f09C77B19AD8Bb527355ec32d5ce98421fec2E3": {
    "address": "0x3f09C77B19AD8Bb527355ec32d5ce98421fec2E3",
    "name": "Balancer axlBAL/BAL StablePool",
    "symbol": "axlBAL/BAL",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6Dfda1489E2AC66be621Ea7F59456A3F831e1767": {
    "address": "0x6Dfda1489E2AC66be621Ea7F59456A3F831e1767",
    "name": "50GOLD-50USDC",
    "symbol": "50GOLD-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEE9e1B1a73AA471308486E69a4Abd7c1486c010A": {
    "address": "0xEE9e1B1a73AA471308486E69a4Abd7c1486c010A",
    "name": "50WETH-50GOLD",
    "symbol": "50WETH-50GOLD",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x835772Bab114563746da80806930A9E37aa85344": {
    "address": "0x835772Bab114563746da80806930A9E37aa85344",
    "name": "D2D / rETH",
    "symbol": "D2D-rETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xDEB317eCdac19DE9dd342f46D2A6D3a578Bed521": {
    "address": "0xDEB317eCdac19DE9dd342f46D2A6D3a578Bed521",
    "name": "33FRY-33WETH-33DAI",
    "symbol": "33FRY-33WETH-33DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8f97c6DdF16f75eEfCa0fAf44864Fc1f8fC9a131": {
    "address": "0x8f97c6DdF16f75eEfCa0fAf44864Fc1f8fC9a131",
    "name": "50WBTC-50LINK",
    "symbol": "50WBTC-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf13DF9563dc9268A773ad852fFF80f5e913EBAF6": {
    "address": "0xf13DF9563dc9268A773ad852fFF80f5e913EBAF6",
    "name": "Balancer 80 UNI 20 WETH",
    "symbol": "B-80UNI-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6B9f3f6b9054A45702D3F2C6e3D32A60204934cb": {
    "address": "0x6B9f3f6b9054A45702D3F2C6e3D32A60204934cb",
    "name": "Balancer USDF/USDC",
    "symbol": "USDF/USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/aura.png",
    "chainId": 42161
  },
  "0x49f3040f6E4dc7Ff8fD85502BC40877311ff13d7": {
    "address": "0x49f3040f6E4dc7Ff8fD85502BC40877311ff13d7",
    "name": "50WETH-50DFX",
    "symbol": "50WETH-50DFX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5d6Be336cDE29F7eC6dC7B736f716ac270238C4c": {
    "address": "0x5d6Be336cDE29F7eC6dC7B736f716ac270238C4c",
    "name": "USDC/USDC.e",
    "symbol": "baUSDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xDA7C8a951c405A8C2eDc8f7cEb7cD08D47557696": {
    "address": "0xDA7C8a951c405A8C2eDc8f7cEb7cD08D47557696",
    "name": "50MAGIC-50USDC",
    "symbol": "50MAGIC-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7435E7250238E65D8Ccb1B6398f402f7cB550D48": {
    "address": "0x7435E7250238E65D8Ccb1B6398f402f7cB550D48",
    "name": "80WBTC-20USDC",
    "symbol": "80WBTC-20USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x38355dD97940f0F5EC6b60FaF8A66D429f379360": {
    "address": "0x38355dD97940f0F5EC6b60FaF8A66D429f379360",
    "name": "MyPool",
    "symbol": "33MAI-33USDC-33USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1691260A030702F1a24053a142D6C1F21405EbD6": {
    "address": "0x1691260A030702F1a24053a142D6C1F21405EbD6",
    "name": "50RDNT-50WETH",
    "symbol": "50RDNT-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEeDEd342aa2Cc1b48ECcAfeB663fdf2c1d166934": {
    "address": "0xEeDEd342aa2Cc1b48ECcAfeB663fdf2c1d166934",
    "name": "50WETH-50ARB",
    "symbol": "50WETH-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD2C1BFE1C24b3AB2590325e91e3dE28359e68158": {
    "address": "0xD2C1BFE1C24b3AB2590325e91e3dE28359e68158",
    "name": "Balancer 80 DXD 20 WETH",
    "symbol": "B-80DXD-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x57D5A0fBA0cB8Df1654cb4CD7904b3546125C897": {
    "address": "0x57D5A0fBA0cB8Df1654cb4CD7904b3546125C897",
    "name": "90USDT-10USDC",
    "symbol": "90USDT-10USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE695B4a75F7DDbE8ca57468ABDE97BEbA535F362": {
    "address": "0xE695B4a75F7DDbE8ca57468ABDE97BEbA535F362",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xed8C41c832c47552D521511760F872ED7c2DdE17": {
    "address": "0xed8C41c832c47552D521511760F872ED7c2DdE17",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc7a2C6b6F61A532E1525307CCe9c86182f1DCB39": {
    "address": "0xc7a2C6b6F61A532E1525307CCe9c86182f1DCB39",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x96A6AD4531b853D874Ab7507fA1203DDCf104771": {
    "address": "0x96A6AD4531b853D874Ab7507fA1203DDCf104771",
    "name": "Balancer 80 YFI 20 WETH",
    "symbol": "B-80YFI-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3951658E9986d7194a3a35A1F5FeAb92F66E03E0": {
    "address": "0x3951658E9986d7194a3a35A1F5FeAb92F66E03E0",
    "name": "Arbitrum LSDFi",
    "symbol": "LSDFi",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x79b79BB722De0a3bd4b5261037D5A5026FE59d27": {
    "address": "0x79b79BB722De0a3bd4b5261037D5A5026FE59d27",
    "name": "10WETH-90noiseGPT",
    "symbol": "10WETH-90noiseGPT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7bceaa9c5E7f4836Fec3bCe2d5346637c9B13970": {
    "address": "0x7bceaa9c5E7f4836Fec3bCe2d5346637c9B13970",
    "name": "VST-USDC-USDT-DAI Stable BPT",
    "symbol": "VST BSP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x70Ba7DC356B41c849e74c679932c852CC0331a90": {
    "address": "0x70Ba7DC356B41c849e74c679932c852CC0331a90",
    "name": "gDAI-MAI-USDC Stable Pool",
    "symbol": "gDAI-MAI-USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc26Dd666209Ed59346a577b7FFf2EE94A1453e8b": {
    "address": "0xc26Dd666209Ed59346a577b7FFf2EE94A1453e8b",
    "name": "50WBTC-50WETH",
    "symbol": "50WBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x66d6A5350207859D595e992c53c281251512B643": {
    "address": "0x66d6A5350207859D595e992c53c281251512B643",
    "name": "5050STG-50USDC-50USDC",
    "symbol": "5050STG-50USDC-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4F4839540B68c7013ea25E7E93940384f358c76B": {
    "address": "0x4F4839540B68c7013ea25E7E93940384f358c76B",
    "name": "1VSTA-99USDC",
    "symbol": "1VSTA-99USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa4A90301BE0ba9a91F7eB45BC1f1b127D38DF513": {
    "address": "0xa4A90301BE0ba9a91F7eB45BC1f1b127D38DF513",
    "name": "1VSTA-99USDC",
    "symbol": "1VSTA-99USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf26DFEF835C8590818D432Ba3C685C333F443f17": {
    "address": "0xf26DFEF835C8590818D432Ba3C685C333F443f17",
    "name": "50WBTC-50WETH",
    "symbol": "50WBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x75146bC66be95Fed02191810b225150a152b8D8f": {
    "address": "0x75146bC66be95Fed02191810b225150a152b8D8f",
    "name": "33WBTC-33WETH-33USDT",
    "symbol": "33WBTC-33WETH-33USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE1135c0027912F6d1Ff6F2b0d6F6E696f15d5557": {
    "address": "0xE1135c0027912F6d1Ff6F2b0d6F6E696f15d5557",
    "name": "33WETH-33LINK-33USDC",
    "symbol": "33WETH-33LINK-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5A97B3C1046e040085E7540c89fb476Fb2c6cA00": {
    "address": "0x5A97B3C1046e040085E7540c89fb476Fb2c6cA00",
    "name": "50WETH-50PBTWT2",
    "symbol": "50WETH-50PBTWT2",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x70c6A653e273523FADfB4dF99558737906c230c6": {
    "address": "0x70c6A653e273523FADfB4dF99558737906c230c6",
    "name": "80ARB-20XEX",
    "symbol": "80ARB-20XEX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x386b5d43BA8b97c43d4AfB4cDaE7877a1B295E8a": {
    "address": "0x386b5d43BA8b97c43d4AfB4cDaE7877a1B295E8a",
    "name": "Balancer TUSD Stablepool",
    "symbol": "BPSP-TUSD",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1D4F9C12a1c2CCCB502c8FeFF34e2d734DEd4876": {
    "address": "0x1D4F9C12a1c2CCCB502c8FeFF34e2d734DEd4876",
    "name": "TEST Fjord Foundry LBP",
    "symbol": "TEST_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2b2DA14C95B6DD31851Bd2993CD11BdDBE5510F6": {
    "address": "0x2b2DA14C95B6DD31851Bd2993CD11BdDBE5510F6",
    "name": "Balancer wstETH-WETH Stable Pool",
    "symbol": "B-wstETH-WETH-Stable",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xCe34C867D7053bEFB3421D6ADabcB5CE55FF777b": {
    "address": "0xCe34C867D7053bEFB3421D6ADabcB5CE55FF777b",
    "name": "Wen Moon Pool",
    "symbol": "CRV-WBTC-wstETH-gDAI-LINK-UNI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7Ec9019680EAB3E65b3723114cb24FC9e100479F": {
    "address": "0x7Ec9019680EAB3E65b3723114cb24FC9e100479F",
    "name": "343L-BTC/USD-163S-BTC/USD-50USDC",
    "symbol": "343L-BTC/USD-163S-BTC/USD-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xbea626026794c6C09971316679Ac5D6922ADFE6a": {
    "address": "0xbea626026794c6C09971316679Ac5D6922ADFE6a",
    "name": "Balancer 80 GRT 20 WETH",
    "symbol": "B-80GRT-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD3D5d45f4Edf82ba0dFaf061d230766032a10e07": {
    "address": "0xD3D5d45f4Edf82ba0dFaf061d230766032a10e07",
    "name": "50STG-50bbaUSD",
    "symbol": "50STG-50bbaUSD",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3c8cD3e78920d26FfF266CEFCdFa3497B00DB954": {
    "address": "0x3c8cD3e78920d26FfF266CEFCdFa3497B00DB954",
    "name": "50wstETH-50GMX",
    "symbol": "50wstETH-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3BBC6C76B3fe21e84C3783c3EDB1e4735974008A": {
    "address": "0x3BBC6C76B3fe21e84C3783c3EDB1e4735974008A",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAa936F13fea4e2b6A7e4703cd11DAf5bcFD9Bca7": {
    "address": "0xAa936F13fea4e2b6A7e4703cd11DAf5bcFD9Bca7",
    "name": "50MAGIC-50USDT",
    "symbol": "50MAGIC-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9cc5d63aa18E6d33180453D5831acdd6B483E823": {
    "address": "0x9cc5d63aa18E6d33180453D5831acdd6B483E823",
    "name": "67LDO-29WBTC-4wstETH",
    "symbol": "67LDO-29WBTC-4wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x96601B968B52AaB638d088B7440AAd6fA5388c29": {
    "address": "0x96601B968B52AaB638d088B7440AAd6fA5388c29",
    "name": "333L-BTC/USD-173S-BTC/USD-50USDC",
    "symbol": "333L-BTC/USD-173S-BTC/USD-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD9a667Cc6f4f7F1d77aAddcbc3AbcD86db755303": {
    "address": "0xD9a667Cc6f4f7F1d77aAddcbc3AbcD86db755303",
    "name": "50WBTC-50USDC",
    "symbol": "50WBTC-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x87012b0C3257423fD74a5986F81a0f1954C17a1d": {
    "address": "0x87012b0C3257423fD74a5986F81a0f1954C17a1d",
    "name": "50Silo-50WETH",
    "symbol": "50Silo-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x89dc7e71e362faF88D92288fE2311D25c6a1B5E0": {
    "address": "0x89dc7e71e362faF88D92288fE2311D25c6a1B5E0",
    "name": "50WETH-50OHM",
    "symbol": "50WETH-50OHM",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2Dc7A0A958B5EA50C2DAb252f8F601CC3bDb7CcD": {
    "address": "0x2Dc7A0A958B5EA50C2DAb252f8F601CC3bDb7CcD",
    "name": "50WETH-50USDT",
    "symbol": "50WETH-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6c47fa6873A510f80Ee9c4DAbe71049e5Cf11C03": {
    "address": "0x6c47fa6873A510f80Ee9c4DAbe71049e5Cf11C03",
    "name": "MyPool",
    "symbol": "14GMX-14JONES-14BIFI-14MATTER-14DEFI5-14PICKLE-14DXD",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3d6BA6eC593da3F00d901d338297269991cC3d3A": {
    "address": "0x3d6BA6eC593da3F00d901d338297269991cC3d3A",
    "name": "50MAGIC-50GFLY",
    "symbol": "50MAGIC-50GFLY",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xbFc7Deb97C6AAF9e21e1C3Fe000c187448D505D1": {
    "address": "0xbFc7Deb97C6AAF9e21e1C3Fe000c187448D505D1",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xB66e378fd28714410Ed19d3A06baF1DD95A59848": {
    "address": "0xB66e378fd28714410Ed19d3A06baF1DD95A59848",
    "name": "50VST-50VSTA",
    "symbol": "50VST-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x53c7940728EF895069A4F5A6B30E60c6652C910c": {
    "address": "0x53c7940728EF895069A4F5A6B30E60c6652C910c",
    "name": "Balancer 80 CREAM 20 WETH",
    "symbol": "B-80CREAM-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3661a7aAe7db8a25d66D1668aC55cEb96f636a61": {
    "address": "0x3661a7aAe7db8a25d66D1668aC55cEb96f636a61",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8C736743f77F6c49dAcE55AD8719b78a0F62B3Be": {
    "address": "0x8C736743f77F6c49dAcE55AD8719b78a0F62B3Be",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x281979D31844FF4cc6d94dAf8D78EE293561EfFf": {
    "address": "0x281979D31844FF4cc6d94dAf8D78EE293561EfFf",
    "name": "50 1S-BTC 25 1L-BTC 25 wBTC",
    "symbol": "50 1S-BTC 25 1L-BTC 25 wBTC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf134aBC13f5cd1bBe6386E423c77B4031faE60CD": {
    "address": "0xf134aBC13f5cd1bBe6386E423c77B4031faE60CD",
    "name": "50BAL-50USDC",
    "symbol": "50BAL-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA9A63971c55c132aF0e6B39a081e604F07f4e234": {
    "address": "0xA9A63971c55c132aF0e6B39a081e604F07f4e234",
    "name": "RDNT-WETH",
    "symbol": "RDNT-WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1f181696E86882c317F5A6cF433666476A75ae65": {
    "address": "0x1f181696E86882c317F5A6cF433666476A75ae65",
    "name": "50RDNT-50USDT",
    "symbol": "50RDNT-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf969257E5D1f76eBDf3c2979280f240ae3ba9db0": {
    "address": "0xf969257E5D1f76eBDf3c2979280f240ae3ba9db0",
    "name": "50MAGIC-50USDT",
    "symbol": "50MAGIC-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7242800620374bFd7F0059E9c38C84dd45c58b18": {
    "address": "0x7242800620374bFd7F0059E9c38C84dd45c58b18",
    "name": "1WETH-99USDC",
    "symbol": "1WETH-99USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6eba41eAda135dA58eCe2758f1D956288765E51C": {
    "address": "0x6eba41eAda135dA58eCe2758f1D956288765E51C",
    "name": "50WETH-50LINK",
    "symbol": "50WETH-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x837fbB7E89a2BE780CF8C48863a50F8cd715e256": {
    "address": "0x837fbB7E89a2BE780CF8C48863a50F8cd715e256",
    "name": "33DAI-33USDT-33USDC",
    "symbol": "33DAI-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2F8c403a4D363d536eDE5bbE22A6Fc50632D540b": {
    "address": "0x2F8c403a4D363d536eDE5bbE22A6Fc50632D540b",
    "name": "70BAL-30USDC",
    "symbol": "70BAL-30USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x739e84E01ea79e20E67FFaC9f5f850bb7a8FEEeb": {
    "address": "0x739e84E01ea79e20E67FFaC9f5f850bb7a8FEEeb",
    "name": "ARBIS Fjord Foundry LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb7b592A96C4f5E52563E36458e45af32528c3d7b": {
    "address": "0xb7b592A96C4f5E52563E36458e45af32528c3d7b",
    "name": "50ABAS-50WETH",
    "symbol": "50ABAS-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAdb3c884134aa5Af0764B5d297E5d16b45D89D23": {
    "address": "0xAdb3c884134aa5Af0764B5d297E5d16b45D89D23",
    "name": "VestaTest",
    "symbol": "VTEST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc0245Ce0b1aecCD93D74B0a9f0077a7c7257a54F": {
    "address": "0xc0245Ce0b1aecCD93D74B0a9f0077a7c7257a54F",
    "name": "OG-DEFI",
    "symbol": "OG-DEFI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x818744E08Bc81ccB34B010e92cb5ea3b89545351": {
    "address": "0x818744E08Bc81ccB34B010e92cb5ea3b89545351",
    "name": "50UMAMI-50TCR",
    "symbol": "50UMAMI-50TCR",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5f838591A5A8048F0E4C4c7fCca8fD9A25BF0590": {
    "address": "0x5f838591A5A8048F0E4C4c7fCca8fD9A25BF0590",
    "name": "50ARB-50USDC",
    "symbol": "50ARB-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC720d790Dc6062a7f19501Dc8aBbFb3041C52eA6": {
    "address": "0xC720d790Dc6062a7f19501Dc8aBbFb3041C52eA6",
    "name": "Balancer 80 CRV 20 WETH",
    "symbol": "B-80CRV-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc2ad78196D8A956fE41e5BDf17A53725E92CC856": {
    "address": "0xc2ad78196D8A956fE41e5BDf17A53725E92CC856",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xcf8b555B7754556cF2aC2165e77ee23eD8517D79": {
    "address": "0xcf8b555B7754556cF2aC2165e77ee23eD8517D79",
    "name": "ChadAura",
    "symbol": "ChadAura",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x351D826C01A900F7087930dfC34D235E64F33D21": {
    "address": "0x351D826C01A900F7087930dfC34D235E64F33D21",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x454eb2f12242397688DbfdA241487e67ed80507a": {
    "address": "0x454eb2f12242397688DbfdA241487e67ed80507a",
    "name": "85ARB-15USDT",
    "symbol": "85ARB-15USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xCAffc904684771C9841E0B60e7C52566D4BAa4A8": {
    "address": "0xCAffc904684771C9841E0B60e7C52566D4BAa4A8",
    "name": "DUSDDAI Pool",
    "symbol": "DUSDDAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x923D6dfEe5bBEFE1A6DCdd84455BF24d181af520": {
    "address": "0x923D6dfEe5bBEFE1A6DCdd84455BF24d181af520",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4d1a015cf3D95b1DC39408824e0a86eC3Fa5f245": {
    "address": "0x4d1a015cf3D95b1DC39408824e0a86eC3Fa5f245",
    "name": "33WBTC-33VST-33USDC",
    "symbol": "33WBTC-33VST-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4714F04bf9305a27b200c86b0243A33f3Bc33BE6": {
    "address": "0x4714F04bf9305a27b200c86b0243A33f3Bc33BE6",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF9aF4f8e51cAB641eD37B5df4D023cF554ac0896": {
    "address": "0xF9aF4f8e51cAB641eD37B5df4D023cF554ac0896",
    "name": "20WETH-80FXS",
    "symbol": "20WETH-80FXS",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xce6195089B302633eD60f3F427D1380F6A2BFBC7": {
    "address": "0xce6195089B302633eD60f3F427D1380F6A2BFBC7",
    "name": "50OHM-50USDC",
    "symbol": "50OHM-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x21cf9324D5B1AC739B7E6922B69500F1eEDB52e0": {
    "address": "0x21cf9324D5B1AC739B7E6922B69500F1eEDB52e0",
    "name": "50WETH-50ARB",
    "symbol": "50WETH-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE1230E4f97D61Cf1Ce935bA16920792041Cc45d2": {
    "address": "0xE1230E4f97D61Cf1Ce935bA16920792041Cc45d2",
    "name": "50CAP-50WETH",
    "symbol": "50CAP-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD9cde95eFeD2d426F2741E2c44De9573116B8F07": {
    "address": "0xD9cde95eFeD2d426F2741E2c44De9573116B8F07",
    "name": "33WETH-33USDT-33USDC",
    "symbol": "33WETH-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x249034A0EA97E76c2b4AB7a1727CBC52548c531c": {
    "address": "0x249034A0EA97E76c2b4AB7a1727CBC52548c531c",
    "name": "50ZOO-50WETH",
    "symbol": "50ZOO-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8851f5eb05Bf56671a2D28AD4b399986b64033f7": {
    "address": "0x8851f5eb05Bf56671a2D28AD4b399986b64033f7",
    "name": "Derivatives Pool",
    "symbol": "Derivatives Pool",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe9eAb44B8D5d077f5d87474E6274a77284fC13E0": {
    "address": "0xe9eAb44B8D5d077f5d87474E6274a77284fC13E0",
    "name": "10WETH-90USDC",
    "symbol": "10WETH-90USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x49EBDEac7C52cfC2c977B92C5A081dCd3729d888": {
    "address": "0x49EBDEac7C52cfC2c977B92C5A081dCd3729d888",
    "name": "50WBTC-50USDC",
    "symbol": "50WBTC-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb11CdA903e809E453F00BFeA56453be322392169": {
    "address": "0xb11CdA903e809E453F00BFeA56453be322392169",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x15b172ffFeBb5b97AAB97824a8a61ACACa7b5C50": {
    "address": "0x15b172ffFeBb5b97AAB97824a8a61ACACa7b5C50",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8A9F8B5334DACB052cd62797e2Bdf68d89c0bfD8": {
    "address": "0x8A9F8B5334DACB052cd62797e2Bdf68d89c0bfD8",
    "name": "Balancer 80 DHT 20 WETH",
    "symbol": "B-80DHT-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x585E5BB724712C8CC1De5971a36B21F995D665cB": {
    "address": "0x585E5BB724712C8CC1De5971a36B21F995D665cB",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4a5A0006191ac28Abb2d352fa36c084034edE9b3": {
    "address": "0x4a5A0006191ac28Abb2d352fa36c084034edE9b3",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE5f24cD43f77fadF4dB33Dab44EB25774159AC66": {
    "address": "0xE5f24cD43f77fadF4dB33Dab44EB25774159AC66",
    "name": "80DF-20USDC",
    "symbol": "80DF-20USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF49DDeD65145D3FBb0370BDD3361E4fAc1f95c70": {
    "address": "0xF49DDeD65145D3FBb0370BDD3361E4fAc1f95c70",
    "name": "Dai Stablecoin",
    "symbol": "DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBF923309567dD104A0f58fE2EC4F2Afb5387FC22": {
    "address": "0xBF923309567dD104A0f58fE2EC4F2Afb5387FC22",
    "name": "50MAGIC-50GMX",
    "symbol": "50MAGIC-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5028b5d18B4ceA374206FEA55dF236619A110438": {
    "address": "0x5028b5d18B4ceA374206FEA55dF236619A110438",
    "name": "50MAGIC-50WETH",
    "symbol": "50MAGIC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x36942963e3b6F37eCC45a4e72349558514233F00": {
    "address": "0x36942963e3b6F37eCC45a4e72349558514233F00",
    "name": "Balancer Aave v3 Boosted Pool (MAI)",
    "symbol": "bb-a-MAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x44F382DD3eBE7Ba634Bb3073b445887A7730b867": {
    "address": "0x44F382DD3eBE7Ba634Bb3073b445887A7730b867",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x60E78F5Da69d56ba1238f0c703534f4430764800": {
    "address": "0x60E78F5Da69d56ba1238f0c703534f4430764800",
    "name": "50WETH-50VSTA",
    "symbol": "50WETH-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA20043EFfCC2c964d60E4D6B1Ce259894997aD70": {
    "address": "0xA20043EFfCC2c964d60E4D6B1Ce259894997aD70",
    "name": "Balancer MIM/FRAX/DAI stableswap",
    "symbol": "b-s-MIM-FRAX-DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEDd952135a5893E9bF61Fe0a93DEf0e56D56c12d": {
    "address": "0xEDd952135a5893E9bF61Fe0a93DEf0e56D56c12d",
    "name": "Balancer 50WETH/50-4Pool ",
    "symbol": "50WETH/50-4Pool",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa1C4A6544DA2733EAd6aFFe71fF3C3F4CF88127f": {
    "address": "0xa1C4A6544DA2733EAd6aFFe71fF3C3F4CF88127f",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7DEf78fDEb9694846360682D9D825F859d97b432": {
    "address": "0x7DEf78fDEb9694846360682D9D825F859d97b432",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd96082269C3Ea1b70888Ca42d47c1EB8C2DF3E47": {
    "address": "0xd96082269C3Ea1b70888Ca42d47c1EB8C2DF3E47",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa576e4B7f5b4c275B5b051f5Be93C9dF7D56f015": {
    "address": "0xa576e4B7f5b4c275B5b051f5Be93C9dF7D56f015",
    "name": "50VST-50WETH",
    "symbol": "50VST-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x24Fd5E369cbD897835f1Cf3a793176F725ABE0E5": {
    "address": "0x24Fd5E369cbD897835f1Cf3a793176F725ABE0E5",
    "name": "13BAL-13BAL-13CRV-13LDO-13ARB-13LINK-13UNI-13GMX",
    "symbol": "13BAL-13BAL-13CRV-13LDO-13ARB-13LINK-13UNI-13GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAAA10590912Cb8c3D50c93BB419707C36C418001": {
    "address": "0xAAA10590912Cb8c3D50c93BB419707C36C418001",
    "name": "33WBTC-33WETH-33USDC",
    "symbol": "33WBTC-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x87C47dA73B144d12c564DdD1f039840f0A9C5f90": {
    "address": "0x87C47dA73B144d12c564DdD1f039840f0A9C5f90",
    "name": "49DAI-51USDC",
    "symbol": "49DAI-51USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF28f60977Aa50C81E5382F8D082af8385A079c20": {
    "address": "0xF28f60977Aa50C81E5382F8D082af8385A079c20",
    "name": "50WETH-50GFLY",
    "symbol": "50WETH-50GFLY",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC7B2f32E33a4aF92bdFb7023BDD0fbc89f1aF9A9": {
    "address": "0xC7B2f32E33a4aF92bdFb7023BDD0fbc89f1aF9A9",
    "name": "50BAL-50USDC",
    "symbol": "50BAL-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE1073222C13aa9c86A15b62930Fc8540c72993c8": {
    "address": "0xE1073222C13aa9c86A15b62930Fc8540c72993c8",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb116E876e60636dE03038f19d6b3B0CC01130aB7": {
    "address": "0xb116E876e60636dE03038f19d6b3B0CC01130aB7",
    "name": "ARBIS Copper Launch",
    "symbol": "ARBIS_TLA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9f30F327446923d73E6922e4151DdDf6d681B4dd": {
    "address": "0x9f30F327446923d73E6922e4151DdDf6d681B4dd",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5b6f0Fa55D1a532D0f75c2B1b3Fc2eec9Caf9f9c": {
    "address": "0x5b6f0Fa55D1a532D0f75c2B1b3Fc2eec9Caf9f9c",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xFCa2425442CF47cfa1834FFaF65bFACb0F890C82": {
    "address": "0xFCa2425442CF47cfa1834FFaF65bFACb0F890C82",
    "name": "33DAI-33USDT-33USDC",
    "symbol": "33DAI-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x36d7cD617e68AD6a73634130a2c68C55CA45E452": {
    "address": "0x36d7cD617e68AD6a73634130a2c68C55CA45E452",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x318Cd966dD084D08677015DB4601133B61EcBAD8": {
    "address": "0x318Cd966dD084D08677015DB4601133B61EcBAD8",
    "name": "80RDNT-20wstETH",
    "symbol": "80RDNT-20wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x298BfB692E2E765c01DeAb6F48aA521ff10b80db": {
    "address": "0x298BfB692E2E765c01DeAb6F48aA521ff10b80db",
    "name": "50BAL-50CRV",
    "symbol": "50BAL-50CRV",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6AB026B3f9d7c55b871901B1a5c19Ea5e6c5fDB9": {
    "address": "0x6AB026B3f9d7c55b871901B1a5c19Ea5e6c5fDB9",
    "name": "80RDNT-20WETH",
    "symbol": "80RDNT-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xCE2Da1D3e5b5e4E1913F9fF65eE029d38682d8b9": {
    "address": "0xCE2Da1D3e5b5e4E1913F9fF65eE029d38682d8b9",
    "name": "Balancer 50ACID-50WETH ",
    "symbol": "B-50ACID-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2cF5cA433729413AB50ccf654ABbaBAA2c8E7B5c": {
    "address": "0x2cF5cA433729413AB50ccf654ABbaBAA2c8E7B5c",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb0ed5fe66fC2F88e8a8E16C8d02fE59520947Bc5": {
    "address": "0xb0ed5fe66fC2F88e8a8E16C8d02fE59520947Bc5",
    "name": "LINK-DAI",
    "symbol": "Stinky Pool",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x939f4F9346679962DB1BFb9328485fFdfAD7eD59": {
    "address": "0x939f4F9346679962DB1BFb9328485fFdfAD7eD59",
    "name": "ABTEST",
    "symbol": "BalTest23",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x84A1038D55e887c2ABb8cB02ccf4C9d3871C859a": {
    "address": "0x84A1038D55e887c2ABb8cB02ccf4C9d3871C859a",
    "name": "Balancer Stafi rETH/WETH",
    "symbol": "Stafi rETH/WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7e3a0D7E2B223fF2892fB70cae45eF1670d27De8": {
    "address": "0x7e3a0D7E2B223fF2892fB70cae45eF1670d27De8",
    "name": "50GIT-50USDC",
    "symbol": "50GIT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe4009af105CC0C6F3138568207c18D0dd728f11C": {
    "address": "0xe4009af105CC0C6F3138568207c18D0dd728f11C",
    "name": "50VST-50USDC",
    "symbol": "50VST-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb2264061ecFCC5c43191214f404dDC89d92d6352": {
    "address": "0xb2264061ecFCC5c43191214f404dDC89d92d6352",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD7621e87FeA8771e91b7ba75882c21C71A6a24aC": {
    "address": "0xD7621e87FeA8771e91b7ba75882c21C71A6a24aC",
    "name": "Balancer DOLA-USDC StablePool",
    "symbol": "B-DOLA-USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBA4719c23fFAA338546AE93AF3c298335549cDE1": {
    "address": "0xBA4719c23fFAA338546AE93AF3c298335549cDE1",
    "name": "ARBIS Copper Launch",
    "symbol": "ARBIS_TLA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2d943EAa54c0900D24738aDF5389d88f5ad73210": {
    "address": "0x2d943EAa54c0900D24738aDF5389d88f5ad73210",
    "name": "RSS Copper LBP",
    "symbol": "RSS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xFC0da8AF39F9260eF2Dd63b132Df56f2A56580F6": {
    "address": "0xFC0da8AF39F9260eF2Dd63b132Df56f2A56580F6",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8aeB19b068872C87CccD333B7E169220d5E16fDa": {
    "address": "0x8aeB19b068872C87CccD333B7E169220d5E16fDa",
    "name": "50VST-50USDT",
    "symbol": "50VST-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9C0E4D0D42aA5c011e307D6f858d2d286256E392": {
    "address": "0x9C0E4D0D42aA5c011e307D6f858d2d286256E392",
    "name": "50wstETH-50USDT",
    "symbol": "50wstETH-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xB9Ed8d2473aE6534B32f658df490355b484fA24F": {
    "address": "0xB9Ed8d2473aE6534B32f658df490355b484fA24F",
    "name": "lvrlDAI",
    "symbol": "50LEVR-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF3e34bC98A769CfAa58654E79B7Fc8C8a30357F5": {
    "address": "0xF3e34bC98A769CfAa58654E79B7Fc8C8a30357F5",
    "name": "50LINK-50USDC",
    "symbol": "50LINK-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x910FCc344BD7be4bB0043604c79A1b733fBaBCFd": {
    "address": "0x910FCc344BD7be4bB0043604c79A1b733fBaBCFd",
    "name": "50MAGIC-50VST",
    "symbol": "50MAGIC-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x541CC010fD2e06a34dB4733f9D763612eA17c450": {
    "address": "0x541CC010fD2e06a34dB4733f9D763612eA17c450",
    "name": "lvrlWETH",
    "symbol": "50LEVR-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x68579FD2C1724eE07c0Bb7e418Bbaf3285dF9b01": {
    "address": "0x68579FD2C1724eE07c0Bb7e418Bbaf3285dF9b01",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x52B520C7CAbF47fFd8c328E597a560493f6bd374": {
    "address": "0x52B520C7CAbF47fFd8c328E597a560493f6bd374",
    "name": "50ARB-50USDC",
    "symbol": "50ARB-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3921433B0198f56a94393b46B68735Ea25bc8446": {
    "address": "0x3921433B0198f56a94393b46B68735Ea25bc8446",
    "name": "50VST-50GMX",
    "symbol": "50VST-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x21A944F77af7FDBAF969E591AEcB07c479Afc234": {
    "address": "0x21A944F77af7FDBAF969E591AEcB07c479Afc234",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAA4fc9523502709A85b89684b1138c1328eAa434": {
    "address": "0xAA4fc9523502709A85b89684b1138c1328eAa434",
    "name": "50STG-50ARB",
    "symbol": "50STG-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x53c9094A8564F92b22cB2Ca636ECAfaA0b205B34": {
    "address": "0x53c9094A8564F92b22cB2Ca636ECAfaA0b205B34",
    "name": "50LDO-50WETH",
    "symbol": "50LDO-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4AFd6E74A5cf5c2c7Bd90CE5014F7551496E7f4E": {
    "address": "0x4AFd6E74A5cf5c2c7Bd90CE5014F7551496E7f4E",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd3DE2b06Af1A19B9e4cF2fC7Fd54f7eD378FEd4f": {
    "address": "0xd3DE2b06Af1A19B9e4cF2fC7Fd54f7eD378FEd4f",
    "name": "Balancer 80 SUSHI 20 WETH",
    "symbol": "B-80SUSHI-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4BA0FDC2107cD4D02f724dF0F7F64fAF42118578": {
    "address": "0x4BA0FDC2107cD4D02f724dF0F7F64fAF42118578",
    "name": "50WBTC-50WETH",
    "symbol": "50WBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x296F8944DdD9428911A8F17cbefa2C1cb3296DBE": {
    "address": "0x296F8944DdD9428911A8F17cbefa2C1cb3296DBE",
    "name": "50wstETH-50VSTA",
    "symbol": "50wstETH-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8080ddf6735477333bFC38DE4F984c489Fcd1680": {
    "address": "0x8080ddf6735477333bFC38DE4F984c489Fcd1680",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAcf318F56Fa1D35B5E47dFbF47BB183aC3B3A7e4": {
    "address": "0xAcf318F56Fa1D35B5E47dFbF47BB183aC3B3A7e4",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1A971237d0CEFD78467287550122E02C8eDA7A04": {
    "address": "0x1A971237d0CEFD78467287550122E02C8eDA7A04",
    "name": "50ARB-50DAI",
    "symbol": "50ARB-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5420EA94B31F201153FA5c51917Eb7e23f5C4C3f": {
    "address": "0x5420EA94B31F201153FA5c51917Eb7e23f5C4C3f",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1DAA2F2273eEdb8a5d270Ad69dAf975f2F21DA91": {
    "address": "0x1DAA2F2273eEdb8a5d270Ad69dAf975f2F21DA91",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc0D25AcCD71dE30A0DF8578B41b1608aE19f10ED": {
    "address": "0xc0D25AcCD71dE30A0DF8578B41b1608aE19f10ED",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x37A16ADDF2d873f5e2930a92f7e883C1A1e3b4C0": {
    "address": "0x37A16ADDF2d873f5e2930a92f7e883C1A1e3b4C0",
    "name": "40WETH-60USDC",
    "symbol": "40WETH-60USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8515618a4eCf654B4254Cf3ccd20dFF6E000b73c": {
    "address": "0x8515618a4eCf654B4254Cf3ccd20dFF6E000b73c",
    "name": "33DAI-33USDT-33USDC",
    "symbol": "33DAI-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x879C41cA7E01734446f21382f83FB3E3DFFE55F2": {
    "address": "0x879C41cA7E01734446f21382f83FB3E3DFFE55F2",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc96F7a9C937663c91a09401b8b0B512957d0B1a2": {
    "address": "0xc96F7a9C937663c91a09401b8b0B512957d0B1a2",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa6f74e9f04AAbD2596e2e60D7EAc042b5b15f9e9": {
    "address": "0xa6f74e9f04AAbD2596e2e60D7EAc042b5b15f9e9",
    "name": "50WBTC-50tBTC",
    "symbol": "50WBTC-50tBTC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xDc37AA16C59Ab9243202ee986B9a926709e7a01e": {
    "address": "0xDc37AA16C59Ab9243202ee986B9a926709e7a01e",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3f8047F075F8BC024b59c557716e3369aA849506": {
    "address": "0x3f8047F075F8BC024b59c557716e3369aA849506",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA70dFECc047287339e24ABa1A21a463D8C14e90F": {
    "address": "0xA70dFECc047287339e24ABa1A21a463D8C14e90F",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x71894B7D1bb41bCe3A80211d77e371C2F3d9882A": {
    "address": "0x71894B7D1bb41bCe3A80211d77e371C2F3d9882A",
    "name": "50ARB-50USDC",
    "symbol": "50ARB-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x939fDD1E910f47401766463E483ddEEf00dB62A9": {
    "address": "0x939fDD1E910f47401766463E483ddEEf00dB62A9",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x69F1077AeCE23D5b0344330B5eB13f05d5e410a1": {
    "address": "0x69F1077AeCE23D5b0344330B5eB13f05d5e410a1",
    "name": "50ARB-50USDC",
    "symbol": "50ARB-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x358761B442b13438327a2E9C5c21CaE262413E0f": {
    "address": "0x358761B442b13438327a2E9C5c21CaE262413E0f",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x14D73c3159bc29164C3060A7a4e3D72dCe928730": {
    "address": "0x14D73c3159bc29164C3060A7a4e3D72dCe928730",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6eC68b7AC347f067c0936f863ad887cF94D7A3bd": {
    "address": "0x6eC68b7AC347f067c0936f863ad887cF94D7A3bd",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA7F1820fa29157486e652DF4869b07323A641B3d": {
    "address": "0xA7F1820fa29157486e652DF4869b07323A641B3d",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x539AEdcFB6dD177Aa2ef382FcCf644d8CD78678f": {
    "address": "0x539AEdcFB6dD177Aa2ef382FcCf644d8CD78678f",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xCbB6D8D53e23c3d127Cfe494328D0981b0296e3A": {
    "address": "0xCbB6D8D53e23c3d127Cfe494328D0981b0296e3A",
    "name": "50VST-50WETH",
    "symbol": "50VST-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7bFd23b68B3b59bDb6Fd4370649f6fDE57513dc0": {
    "address": "0x7bFd23b68B3b59bDb6Fd4370649f6fDE57513dc0",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF30B4f80bde82E574e45e4e9DA3a366961A18F4d": {
    "address": "0xF30B4f80bde82E574e45e4e9DA3a366961A18F4d",
    "name": "50VST-50GMX",
    "symbol": "50VST-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa35Cb2539E6885df99afC123C98f6B492c8675A8": {
    "address": "0xa35Cb2539E6885df99afC123C98f6B492c8675A8",
    "name": "50wstETH-50ARB",
    "symbol": "50wstETH-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xed22494f85995766A161ed77770e011C7A646bc7": {
    "address": "0xed22494f85995766A161ed77770e011C7A646bc7",
    "name": "ARBITRUM'S FUTURE",
    "symbol": "25MAGIC-25WETH-25GMX-25USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x45b54cB6D912C9AAFF9De8074100b7b485809F0B": {
    "address": "0x45b54cB6D912C9AAFF9De8074100b7b485809F0B",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x31AE071Bb07d8a64e94E812E74381E2aDe38064A": {
    "address": "0x31AE071Bb07d8a64e94E812E74381E2aDe38064A",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9f1aC9CEe0Bf48E7a6739aaA1118C090FcC7E0F5": {
    "address": "0x9f1aC9CEe0Bf48E7a6739aaA1118C090FcC7E0F5",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xae3954C724970689995a0E655992bBa25d074682": {
    "address": "0xae3954C724970689995a0E655992bBa25d074682",
    "name": "LINK Copper LBP",
    "symbol": "LINK_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe49A755530e1b61C84AC7B5BE4516729341Cb67f": {
    "address": "0xe49A755530e1b61C84AC7B5BE4516729341Cb67f",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x166c41daFE78eC4Cfa49Fe1aa73Afff6682CA3D3": {
    "address": "0x166c41daFE78eC4Cfa49Fe1aa73Afff6682CA3D3",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5ac311fB06c3Bd30c87b4e13C079D17C94325ddD": {
    "address": "0x5ac311fB06c3Bd30c87b4e13C079D17C94325ddD",
    "name": "Balancer StablePool",
    "symbol": "B-SP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1C73B3aDFcB71618F1647A2A74De1D7915750012": {
    "address": "0x1C73B3aDFcB71618F1647A2A74De1D7915750012",
    "name": "33DAI-33USDT-33USDC",
    "symbol": "33DAI-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd3Bb3a37b9f2c743CBD2cB58697426820d108E4B": {
    "address": "0xd3Bb3a37b9f2c743CBD2cB58697426820d108E4B",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xfE7b8F8FcA690AB0CD2B8D979ABEeaC94C06805D": {
    "address": "0xfE7b8F8FcA690AB0CD2B8D979ABEeaC94C06805D",
    "name": "3x WTI/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-WTI+USDC 33 3S-WTI+USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xaFcFf49ED3ad3C78a64F52a4b2E413F369944eB5": {
    "address": "0xaFcFf49ED3ad3C78a64F52a4b2E413F369944eB5",
    "name": "50QI-50USDC",
    "symbol": "50QI-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd332aA4E95662CF958b7ECA500EDfC81d145d31e": {
    "address": "0xd332aA4E95662CF958b7ECA500EDfC81d145d31e",
    "name": "50BAL-50VST",
    "symbol": "50BAL-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x996e410991EefcE35C79413D456442ba21b91E7A": {
    "address": "0x996e410991EefcE35C79413D456442ba21b91E7A",
    "name": "50VST-50DAI",
    "symbol": "50VST-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5B336b2D5bfD3631468cA0EE910722aC4E3c6ead": {
    "address": "0x5B336b2D5bfD3631468cA0EE910722aC4E3c6ead",
    "name": "20STG-80USDC",
    "symbol": "20STG-80USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xcB540613811E784f822B79d51e60BEE92009B4B9": {
    "address": "0xcB540613811E784f822B79d51e60BEE92009B4B9",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x970712708a08e8Fb152be4D81b2dC586923F5369": {
    "address": "0x970712708a08e8Fb152be4D81b2dC586923F5369",
    "name": "50ARB-50bb-a-USD",
    "symbol": "50ARB-50bb-a-USD",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2d81eac7514814F1bba0DbC821f6f375349d4193": {
    "address": "0x2d81eac7514814F1bba0DbC821f6f375349d4193",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5e2f08dbf023e0bC9A113904fD3A56B1f06E3a83": {
    "address": "0x5e2f08dbf023e0bC9A113904fD3A56B1f06E3a83",
    "name": "50RDNT-50ARB",
    "symbol": "50RDNT-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2D8141Cb8F86923145E1076cCcc3eEd8e914c5e0": {
    "address": "0x2D8141Cb8F86923145E1076cCcc3eEd8e914c5e0",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x60a3532091e47eB7caDaf8Fa008a6Ffa50fADEa0": {
    "address": "0x60a3532091e47eB7caDaf8Fa008a6Ffa50fADEa0",
    "name": "33WBTC-33DAI-33USDT",
    "symbol": "33WBTC-33DAI-33USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE882Ee85791B7A1631AB760a111338EAC9158159": {
    "address": "0xE882Ee85791B7A1631AB760a111338EAC9158159",
    "name": "50PNG-50PNG",
    "symbol": "50PNG-50PNG",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9C7E593922A141Ff59D421F57A0b9730b48f53dd": {
    "address": "0x9C7E593922A141Ff59D421F57A0b9730b48f53dd",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAaFEC0A8c8a3394B673e31424262fd0E4D79e759": {
    "address": "0xAaFEC0A8c8a3394B673e31424262fd0E4D79e759",
    "name": "33BAL-33MAGIC-33VST",
    "symbol": "33BAL-33MAGIC-33VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xcC686B8b4B217576BFc0A0B4D744335B813A8E10": {
    "address": "0xcC686B8b4B217576BFc0A0B4D744335B813A8E10",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xcc422Bc8181F3Fe321B04981259Bb2516d9a64Ba": {
    "address": "0xcc422Bc8181F3Fe321B04981259Bb2516d9a64Ba",
    "name": "50WETH-50DAI",
    "symbol": "50WETH-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xbF952634C7ecC4784223956Cea78fEB48db034ab": {
    "address": "0xbF952634C7ecC4784223956Cea78fEB48db034ab",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3c1b8D4FAA796393fC7bFEb98dD7A59131351797": {
    "address": "0x3c1b8D4FAA796393fC7bFEb98dD7A59131351797",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE989eB884C3992780B4227e961d2eA6720b572ea": {
    "address": "0xE989eB884C3992780B4227e961d2eA6720b572ea",
    "name": "50MAGIC-50VSTA",
    "symbol": "50MAGIC-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4A063Bbc6422421e24e1d741B6f2A6F1D8bbFa08": {
    "address": "0x4A063Bbc6422421e24e1d741B6f2A6F1D8bbFa08",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x748951B8730Da625d35a9A983d83B1A46AFb7cA6": {
    "address": "0x748951B8730Da625d35a9A983d83B1A46AFb7cA6",
    "name": "50ABAS-50WETH",
    "symbol": "50ABAS-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd5C1D87d9A28918Db3d64F207387f969658a4DC6": {
    "address": "0xd5C1D87d9A28918Db3d64F207387f969658a4DC6",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe9062F7eFfDD8cDbf67A225c7E5590C0B13e3C55": {
    "address": "0xe9062F7eFfDD8cDbf67A225c7E5590C0B13e3C55",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd8191A3496a1520c2B5C81D04B26F8556Fc62d7b": {
    "address": "0xd8191A3496a1520c2B5C81D04B26F8556Fc62d7b",
    "name": "Whole GRAIN",
    "symbol": "wGRAIN",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x393fb2Fdfd2aFB08fB466274116792B86fa169cE": {
    "address": "0x393fb2Fdfd2aFB08fB466274116792B86fa169cE",
    "name": "50LINK-50USDC",
    "symbol": "50LINK-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4689122d360C4725D244c5cFeA22861333d862e6": {
    "address": "0x4689122d360C4725D244c5cFeA22861333d862e6",
    "name": "SuperAura",
    "symbol": "SuperAura",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xFa6414e19187366d4A266890238BFf4349b62596": {
    "address": "0xFa6414e19187366d4A266890238BFf4349b62596",
    "name": "50wstETH-50USDC",
    "symbol": "50wstETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7987DA4667D3E85C6c02d0ea8B3Eac4E9886699E": {
    "address": "0x7987DA4667D3E85C6c02d0ea8B3Eac4E9886699E",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x247aDC8437496Fc16d05892e6967252291647267": {
    "address": "0x247aDC8437496Fc16d05892e6967252291647267",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xdf4A17132bbAD1c1e313C7877171af9Ad0B5C804": {
    "address": "0xdf4A17132bbAD1c1e313C7877171af9Ad0B5C804",
    "name": "50CRV-50wstETH",
    "symbol": "50CRV-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC744C4E29DDc6dE50F1Afd354A57D35f35c6A907": {
    "address": "0xC744C4E29DDc6dE50F1Afd354A57D35f35c6A907",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x40a9F865D9b41ce22Eb5f7fC14b62629d2ffA7e5": {
    "address": "0x40a9F865D9b41ce22Eb5f7fC14b62629d2ffA7e5",
    "name": "70MAGIC-30USDC",
    "symbol": "70MAGIC-30USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd27d2DB5e7DaA6D2D28e74519716bffEDFE05F7d": {
    "address": "0xd27d2DB5e7DaA6D2D28e74519716bffEDFE05F7d",
    "name": "50RDNT-50wstETH",
    "symbol": "50RDNT-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3308f66989335715F230cF3C14B04B19C33BC96B": {
    "address": "0x3308f66989335715F230cF3C14B04B19C33BC96B",
    "name": "50VST-50VSTA",
    "symbol": "50VST-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6cd8F98A784e346f40171eB4Aa603004c7279b7d": {
    "address": "0x6cd8F98A784e346f40171eB4Aa603004c7279b7d",
    "name": "50MAGIC-50VST",
    "symbol": "50MAGIC-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4fD51dCa0dAE52D90852dEC076Be56BbDc83BF8B": {
    "address": "0x4fD51dCa0dAE52D90852dEC076Be56BbDc83BF8B",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe27f3Af3b1998a03F6Ed5668E00Bc5a64F52FAc5": {
    "address": "0xe27f3Af3b1998a03F6Ed5668E00Bc5a64F52FAc5",
    "name": "RSS Copper LBP",
    "symbol": "RSS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x79ee85981B96B3529FfE0614a9eaDBd9A766Fea9": {
    "address": "0x79ee85981B96B3529FfE0614a9eaDBd9A766Fea9",
    "name": "33VST-33WETH-33USDC",
    "symbol": "33VST-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3dd0843A028C86e0b760b1A76929d1C5Ef93a2dd": {
    "address": "0x3dd0843A028C86e0b760b1A76929d1C5Ef93a2dd",
    "name": "Python Test Weighted Pool V2",
    "symbol": "PTWPv2",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/aura.png",
    "chainId": 42161
  },
  "0xd35A8C02fd414aad5191981A387092777127d5C1": {
    "address": "0xd35A8C02fd414aad5191981A387092777127d5C1",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6a623fFC039B1923A3Fd9B6eB0172F3fa18bB7a8": {
    "address": "0x6a623fFC039B1923A3Fd9B6eB0172F3fa18bB7a8",
    "name": "80wstETH-20WETH",
    "symbol": "80wstETH-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x844D2320df5177B206A24e87A97abE907b8b1600": {
    "address": "0x844D2320df5177B206A24e87A97abE907b8b1600",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf34b4d3A6D61cE1a64CDF55A8d7496ecF453F7FF": {
    "address": "0xf34b4d3A6D61cE1a64CDF55A8d7496ecF453F7FF",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5257FF31eD154dC60db418A1E8A35Df6Be9a75fE": {
    "address": "0x5257FF31eD154dC60db418A1E8A35Df6Be9a75fE",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8302BC3B1151ab30775609b24918E6c665b2B370": {
    "address": "0x8302BC3B1151ab30775609b24918E6c665b2B370",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x984B9565cf3299c3556981adC25D86AcA1515E3E": {
    "address": "0x984B9565cf3299c3556981adC25D86AcA1515E3E",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc20b04534Ab809948549DAFc373fa2C684f9bfb6": {
    "address": "0xc20b04534Ab809948549DAFc373fa2C684f9bfb6",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xFfFCc8d78c419E937Fc2168777AF5502DD53D524": {
    "address": "0xFfFCc8d78c419E937Fc2168777AF5502DD53D524",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xCF749C29543e6C20D3E87f751b4FF73a0850BA69": {
    "address": "0xCF749C29543e6C20D3E87f751b4FF73a0850BA69",
    "name": "LOL Fjord Foundry LBP",
    "symbol": "LOL_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7f84D848CB071047200F133A4bfB19744cc4e991": {
    "address": "0x7f84D848CB071047200F133A4bfB19744cc4e991",
    "name": "25VST-25DAI-25USDT-25USDC",
    "symbol": "25VST-25DAI-25USDT-25USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD2d43eb7f3150f5659a7df5C74E7CB57c23a25d9": {
    "address": "0xD2d43eb7f3150f5659a7df5C74E7CB57c23a25d9",
    "name": "50UNI-50USDC",
    "symbol": "50UNI-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb6AAb961F9cC1900f1dB13F4EA7496F915eEa8aB": {
    "address": "0xb6AAb961F9cC1900f1dB13F4EA7496F915eEa8aB",
    "name": "LOL Fjord Foundry LBP",
    "symbol": "LOL_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x801baDb59BeA0165bA32151Bd759350F3b016E19": {
    "address": "0x801baDb59BeA0165bA32151Bd759350F3b016E19",
    "name": "tCHEESE",
    "symbol": "tCHEESE",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe949C53CF5C366771b93c9bC765FA45Faa9D040d": {
    "address": "0xe949C53CF5C366771b93c9bC765FA45Faa9D040d",
    "name": "UPDOGE BPT",
    "symbol": "BPT-UPDOGE",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF370B36694546CAFB86cA919D850810FEC3D24Ed": {
    "address": "0xF370B36694546CAFB86cA919D850810FEC3D24Ed",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8AAC5Bd713Ed5563c5c8fEba05b38d3B4281382F": {
    "address": "0x8AAC5Bd713Ed5563c5c8fEba05b38d3B4281382F",
    "name": "50wstETH-50USDC",
    "symbol": "50wstETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7Ef80D6C6B62e194AB3465F10d97F4c48E623025": {
    "address": "0x7Ef80D6C6B62e194AB3465F10d97F4c48E623025",
    "name": "20WETH-80ARB",
    "symbol": "20WETH-80ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9d242CE369Cb7C030EE9b639539AbE3559E67BCE": {
    "address": "0x9d242CE369Cb7C030EE9b639539AbE3559E67BCE",
    "name": "25MAGIC-25wstETH-25DAI-25USDC",
    "symbol": "25MAGIC-25wstETH-25DAI-25USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x646eCa7369C13Ef9136F6AFa15A7e8329A4c91f2": {
    "address": "0x646eCa7369C13Ef9136F6AFa15A7e8329A4c91f2",
    "name": "GMX Fjord Foundry LBP",
    "symbol": "GMX_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xda3D5118A4E924Da6Cce37379290cBfA255d0BE3": {
    "address": "0xda3D5118A4E924Da6Cce37379290cBfA255d0BE3",
    "name": "50RDNT-50USDC",
    "symbol": "50RDNT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x90DDD66c2B79ce55c324ef985369bb272531c363": {
    "address": "0x90DDD66c2B79ce55c324ef985369bb272531c363",
    "name": "50wstETH-50DAI",
    "symbol": "50wstETH-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9fd7C63C09E00BaA65c1179e26f38F73c61a6c67": {
    "address": "0x9fd7C63C09E00BaA65c1179e26f38F73c61a6c67",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x22d6C39f5b22845D375aE10dB2cfd1628E48f7d9": {
    "address": "0x22d6C39f5b22845D375aE10dB2cfd1628E48f7d9",
    "name": "50VSTA-50LINK",
    "symbol": "50VSTA-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9Bd567851d654161741467dD39643EBbE374443E": {
    "address": "0x9Bd567851d654161741467dD39643EBbE374443E",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEE7E36B8b24a1c60C28E7336e937D43F74AAD740": {
    "address": "0xEE7E36B8b24a1c60C28E7336e937D43F74AAD740",
    "name": "STAR Stable Pool",
    "symbol": "STAR-USDCe-BPT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa4001f09ff8bBE90918DD79f57c61A46D546A7fc": {
    "address": "0xa4001f09ff8bBE90918DD79f57c61A46D546A7fc",
    "name": "50ARB-50VSTA",
    "symbol": "50ARB-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4d14Ca3E5675c0b6030e9ed9d6a7ac574FE108De": {
    "address": "0x4d14Ca3E5675c0b6030e9ed9d6a7ac574FE108De",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF0715FDba7a7a817CEb02F4Eb403cAaF6B5f7054": {
    "address": "0xF0715FDba7a7a817CEb02F4Eb403cAaF6B5f7054",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4834dF86AB695FcB84b95A21e09239E6ea9c52B1": {
    "address": "0x4834dF86AB695FcB84b95A21e09239E6ea9c52B1",
    "name": "50WETH-50DAI",
    "symbol": "50WETH-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x716eAD38d27c082313f6d9bAa303cB16aC28270E": {
    "address": "0x716eAD38d27c082313f6d9bAa303cB16aC28270E",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEEeb364F5431C1F6d9996FF44F01723fe15C44C8": {
    "address": "0xEEeb364F5431C1F6d9996FF44F01723fe15C44C8",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x38727B907046818135c9a865D5C40BE6cd1c0514": {
    "address": "0x38727B907046818135c9a865D5C40BE6cd1c0514",
    "name": "50DPX-50USDC",
    "symbol": "50DPX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x59E7DBfF74B2B76957E6a3f25cCEe40b2f3421D0": {
    "address": "0x59E7DBfF74B2B76957E6a3f25cCEe40b2f3421D0",
    "name": "50ACID-50WETH",
    "symbol": "50ACID-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2c22C890C37643FE4868A23cF5075669688d2Fb2": {
    "address": "0x2c22C890C37643FE4868A23cF5075669688d2Fb2",
    "name": "33VST-33DPX-33USDC",
    "symbol": "33VST-33DPX-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9ECcd843146374dBe846ab98d91b4210C2B661e6": {
    "address": "0x9ECcd843146374dBe846ab98d91b4210C2B661e6",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x262d875ED0d11728e7cFEE8e981527713caD08bA": {
    "address": "0x262d875ED0d11728e7cFEE8e981527713caD08bA",
    "name": "33VST-33DAI-33USDC",
    "symbol": "33VST-33DAI-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x16B345eD6781B68458EEC3Bb23d897dAa81057a8": {
    "address": "0x16B345eD6781B68458EEC3Bb23d897dAa81057a8",
    "name": "UPDOGE BPT",
    "symbol": "BPT-UPDOGE",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8AF40a3F1FB1DB4E21eaA06A0e1c47632803fCD9": {
    "address": "0x8AF40a3F1FB1DB4E21eaA06A0e1c47632803fCD9",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x91Cb759b6f628b12e06282d8D9bB092DbAFf476B": {
    "address": "0x91Cb759b6f628b12e06282d8D9bB092DbAFf476B",
    "name": "70VST-30USDC",
    "symbol": "70VST-30USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x73DbC925e8DB075c6176f05FBd72164868d13b56": {
    "address": "0x73DbC925e8DB075c6176f05FBd72164868d13b56",
    "name": "50MAGIC-50VSTA",
    "symbol": "50MAGIC-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x873e3fD93693d3fAbe21Bf9940B813DcD75483E7": {
    "address": "0x873e3fD93693d3fAbe21Bf9940B813DcD75483E7",
    "name": "99BAL-1WETH",
    "symbol": "99BAL-1WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x79630DE51AA5008F471Ec2C4a07Ca30B5e401B61": {
    "address": "0x79630DE51AA5008F471Ec2C4a07Ca30B5e401B61",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc40911A977f02942039856B1e2537b7D452152D1": {
    "address": "0xc40911A977f02942039856B1e2537b7D452152D1",
    "name": "100HOP-LP-USDC-0USDC",
    "symbol": "100HOP-LP-USDC-0USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8A65136BF8cb749A227e1e0dfc0694cCC16f124c": {
    "address": "0x8A65136BF8cb749A227e1e0dfc0694cCC16f124c",
    "name": "33MAGIC-33VSTA-33USDC",
    "symbol": "33MAGIC-33VSTA-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x85a64c5411BEc5A3F534EFc30474f95783Bf992f": {
    "address": "0x85a64c5411BEc5A3F534EFc30474f95783Bf992f",
    "name": "50DAI-50USDT",
    "symbol": "50DAI-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x760975D3D8b02C202C8EE9d6Fa6c904ceCFa3b6e": {
    "address": "0x760975D3D8b02C202C8EE9d6Fa6c904ceCFa3b6e",
    "name": "BasedAura",
    "symbol": "BasedAura",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa88cba57C50fE49E5e6649701D45Aef557E4d194": {
    "address": "0xa88cba57C50fE49E5e6649701D45Aef557E4d194",
    "name": "50MAGIC-50USDT",
    "symbol": "50MAGIC-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb64AfB992BabF48c8680F4218775710e1f84380c": {
    "address": "0xb64AfB992BabF48c8680F4218775710e1f84380c",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x295a75eC05a1B762281f8FA5E120B4f869e7590B": {
    "address": "0x295a75eC05a1B762281f8FA5E120B4f869e7590B",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1516B3654B505719D5Dd9F9dff831b099A07ac55": {
    "address": "0x1516B3654B505719D5Dd9F9dff831b099A07ac55",
    "name": "5050BAL-50USDC-50GMX",
    "symbol": "5050BAL-50USDC-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x38decAD79AC54385AC3257eDe3a6eC0ed8c38a08": {
    "address": "0x38decAD79AC54385AC3257eDe3a6eC0ed8c38a08",
    "name": "50WETH-50UNI",
    "symbol": "50WETH-50UNI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6673400E053Cc20237461DFe589eAaFc90785566": {
    "address": "0x6673400E053Cc20237461DFe589eAaFc90785566",
    "name": "10LINK-90USDC",
    "symbol": "10LINK-90USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5eEDF2019d63959734B5C5976793A80a4C910465": {
    "address": "0x5eEDF2019d63959734B5C5976793A80a4C910465",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2EeBd17f143498d8aeeC8Ce23B4514938d8e50F0": {
    "address": "0x2EeBd17f143498d8aeeC8Ce23B4514938d8e50F0",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x52fb2085b9eE49928435e9D11ACF643858B56399": {
    "address": "0x52fb2085b9eE49928435e9D11ACF643858B56399",
    "name": "20WBTC-80WETH",
    "symbol": "20WBTC-80WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x807Cf2F850677Ec9f4988Fc29b141C7bAa94Baf4": {
    "address": "0x807Cf2F850677Ec9f4988Fc29b141C7bAa94Baf4",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC5a19c890e0Afd17341D95b88a6943EA1bF1B956": {
    "address": "0xC5a19c890e0Afd17341D95b88a6943EA1bF1B956",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2CbF015270F35a8Cb0d847932f0EB42B13c2c37d": {
    "address": "0x2CbF015270F35a8Cb0d847932f0EB42B13c2c37d",
    "name": "45USDT-55USDC",
    "symbol": "45USDT-55USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD259027Cea522A0545778F8Ea5dEbddF20feA826": {
    "address": "0xD259027Cea522A0545778F8Ea5dEbddF20feA826",
    "name": "33WBTC-33WETH-33USDC",
    "symbol": "33WBTC-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x52a125FeB1d88171dbe8E5870A4Aae99287024BD": {
    "address": "0x52a125FeB1d88171dbe8E5870A4Aae99287024BD",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7a49C6Cd2960cc85cdF6b2e5FA574Df6Db435B30": {
    "address": "0x7a49C6Cd2960cc85cdF6b2e5FA574Df6Db435B30",
    "name": "333L-ETH/USD+USDC-333S-ETH/USD+USDC-33USDC",
    "symbol": "333L-ETH/USD+USDC-333S-ETH/USD+USDC-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC15D887599356eCBE0EC1c178Cd16397B271298f": {
    "address": "0xC15D887599356eCBE0EC1c178Cd16397B271298f",
    "name": "LOL Fjord Foundry LBP",
    "symbol": "LOL_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x78a54C8F4eAba82e45cBC20B9454a83CB296e09E": {
    "address": "0x78a54C8F4eAba82e45cBC20B9454a83CB296e09E",
    "name": "50WETH-50ARB",
    "symbol": "50WETH-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2AEe6F1D63dB9c0F3692dcb61CBaeA240BD415f1": {
    "address": "0x2AEe6F1D63dB9c0F3692dcb61CBaeA240BD415f1",
    "name": "50BAL-50USDC",
    "symbol": "50BAL-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x973fb174Cdf9b1652e4213125a186f66684D899c": {
    "address": "0x973fb174Cdf9b1652e4213125a186f66684D899c",
    "name": "Balancer 800000000000000000 LOL 200000000000000000 USDC",
    "symbol": "B-800000000000000000LOL-200000000000000000USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4001C8481100583E2ed8f765266BE90Ae9cf413a": {
    "address": "0x4001C8481100583E2ed8f765266BE90Ae9cf413a",
    "name": "Optimized wstETH-USDC-70/30",
    "symbol": "70wstETH-30USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x212c3095f9c62c3348bF02DDb00C4352854aEE90": {
    "address": "0x212c3095f9c62c3348bF02DDb00C4352854aEE90",
    "name": "ARBIS Copper LBP",
    "symbol": "ARBIS_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6d9CF7c1366852730bA1974C4239eE38E7cF7619": {
    "address": "0x6d9CF7c1366852730bA1974C4239eE38E7cF7619",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1D8eeD436235a06Bb4E59F52bd803Cf16ba49f40": {
    "address": "0x1D8eeD436235a06Bb4E59F52bd803Cf16ba49f40",
    "name": "50BAL-50USDC",
    "symbol": "50BAL-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6E7B9A1746a7eD4b23edFf0975B726E5aA673E21": {
    "address": "0x6E7B9A1746a7eD4b23edFf0975B726E5aA673E21",
    "name": "2Y2K-98USDC",
    "symbol": "2Y2K-98USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x21C25D8c9F7203D03b65829fc51FA7b96bD5c60E": {
    "address": "0x21C25D8c9F7203D03b65829fc51FA7b96bD5c60E",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5ee45A36611142f77D0EE9cc50DADb1fD37699b7": {
    "address": "0x5ee45A36611142f77D0EE9cc50DADb1fD37699b7",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x84B420B8FE385Ee7fc2f0CBb8Acd951bfD390EeA": {
    "address": "0x84B420B8FE385Ee7fc2f0CBb8Acd951bfD390EeA",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5F17138Dd9ce739fC7e3BE38f44B066D307E42dA": {
    "address": "0x5F17138Dd9ce739fC7e3BE38f44B066D307E42dA",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3fF51DE6D96d4A88182b7006b8E8d9DB7D43931c": {
    "address": "0x3fF51DE6D96d4A88182b7006b8E8d9DB7D43931c",
    "name": "3x BTC/USD+USDC Perpetual Pools Tokens",
    "symbol": "33 USDC 33 3L-BTC+USDC 33 3S-BTC+USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x79915a9805Ac4666bC622708C78dCE83D269E87E": {
    "address": "0x79915a9805Ac4666bC622708C78dCE83D269E87E",
    "name": "33DPX-33WETH-33USDC",
    "symbol": "33DPX-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x33A0Fb14DFA6e56A72B788cCe1aB1973e63072Dc": {
    "address": "0x33A0Fb14DFA6e56A72B788cCe1aB1973e63072Dc",
    "name": "50WETH-50BTC",
    "symbol": "50WETH-50BTC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x954d9D6E02aDa19aE1e7F25d22001e4553917e77": {
    "address": "0x954d9D6E02aDa19aE1e7F25d22001e4553917e77",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x15049deBC468745Fc4e9278DE672E6641d9371f2": {
    "address": "0x15049deBC468745Fc4e9278DE672E6641d9371f2",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb2b5a77A647d227b0faa27b549480763247A28dE": {
    "address": "0xb2b5a77A647d227b0faa27b549480763247A28dE",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x46Cd168A23A1D8F50dD6Adced25400e52d107355": {
    "address": "0x46Cd168A23A1D8F50dD6Adced25400e52d107355",
    "name": "50MAGIC-50wstETH",
    "symbol": "50MAGIC-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xbD8C61BBb1efB5610bfe4daF1C902a8c9cf34517": {
    "address": "0xbD8C61BBb1efB5610bfe4daF1C902a8c9cf34517",
    "name": "50LINK-50USDC",
    "symbol": "50LINK-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb05941E822B786Ab076413328248229E6bd0fEa7": {
    "address": "0xb05941E822B786Ab076413328248229E6bd0fEa7",
    "name": "33wstETH-33WETH-33USDT",
    "symbol": "33wstETH-33WETH-33USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1bCB70556D581F63562581284DAE3Ab18DB60077": {
    "address": "0x1bCB70556D581F63562581284DAE3Ab18DB60077",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2d011aDf89f0576C9B722c28269FcB5D50C2d179": {
    "address": "0x2d011aDf89f0576C9B722c28269FcB5D50C2d179",
    "name": "Balancer 50wstETH-50WETH",
    "symbol": "50WSTETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x161cD105034ac000D2AAD75f06C26e943130Bc0E": {
    "address": "0x161cD105034ac000D2AAD75f06C26e943130Bc0E",
    "name": "NFTFi On L2",
    "symbol": "20WETH-80NFTE",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x59cf453C3569629ce8bdeF6fdA5e6aC56a1a2A19": {
    "address": "0x59cf453C3569629ce8bdeF6fdA5e6aC56a1a2A19",
    "name": "50VST-50B-stETH-Stable",
    "symbol": "50VST-50B-stETH-Stable",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe0aec10F70486A2898DbaB72128f741A71345fa0": {
    "address": "0xe0aec10F70486A2898DbaB72128f741A71345fa0",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x31bDcC600c46837596f859181AE1B71e7743F189": {
    "address": "0x31bDcC600c46837596f859181AE1B71e7743F189",
    "name": "50RDNT-50WETH",
    "symbol": "50RDNT-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA719080Abf5105738Ac470a81D8EFE09d15Fa644": {
    "address": "0xA719080Abf5105738Ac470a81D8EFE09d15Fa644",
    "name": "50STG-50USDC.e",
    "symbol": "50STG-50USDC.e",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBd566aaE6c2D7B778B4DC2009719932282b8df6F": {
    "address": "0xBd566aaE6c2D7B778B4DC2009719932282b8df6F",
    "name": "25DPX-25VSTA-25DAI-25LINK",
    "symbol": "25DPX-25VSTA-25DAI-25LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x708794EFce6C2BbedE031640468890821f85F18b": {
    "address": "0x708794EFce6C2BbedE031640468890821f85F18b",
    "name": "50GMX-50USDC",
    "symbol": "50GMX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD973e86547e810117Db131B94708F429A463535E": {
    "address": "0xD973e86547e810117Db131B94708F429A463535E",
    "name": "80LOL-20WETH",
    "symbol": "80LOL-20WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x75DA97f1D3ADd584C6069ED8241E861683Bba706": {
    "address": "0x75DA97f1D3ADd584C6069ED8241E861683Bba706",
    "name": "50VST-50DPX",
    "symbol": "50VST-50DPX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x94f4F1f8c19177766B4044032b4Cfd7ABeE4e38D": {
    "address": "0x94f4F1f8c19177766B4044032b4Cfd7ABeE4e38D",
    "name": "33WETH-33GMX-33USDT",
    "symbol": "33WETH-33GMX-33USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf46FD013Acc2c6988BB2f773bd879101eB5d4573": {
    "address": "0xf46FD013Acc2c6988BB2f773bd879101eB5d4573",
    "name": "50WETH-50XEX",
    "symbol": "50WETH-50XEX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2EAF027e01CfbF401A3567aCF08cB80CAa0F2B16": {
    "address": "0x2EAF027e01CfbF401A3567aCF08cB80CAa0F2B16",
    "name": "60VST-40USDC",
    "symbol": "60VST-40USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9b6E8612D8bE25370bD15796Ea1D0267839Bf5d8": {
    "address": "0x9b6E8612D8bE25370bD15796Ea1D0267839Bf5d8",
    "name": "50MAGIC-50WETH",
    "symbol": "50MAGIC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x80393C6Ff3384FaAc1147250184cCDc1d9a2EE2B": {
    "address": "0x80393C6Ff3384FaAc1147250184cCDc1d9a2EE2B",
    "name": "70wstETH-30WETH",
    "symbol": "70wstETH-30WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8298E0063CA9CcDE05f5F22ebF81e9482e785746": {
    "address": "0x8298E0063CA9CcDE05f5F22ebF81e9482e785746",
    "name": "50MAGIC-50SUSHI",
    "symbol": "50MAGIC-50SUSHI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x79c5962Ab076C3Fdf05459B20F22debBd633D4fA": {
    "address": "0x79c5962Ab076C3Fdf05459B20F22debBd633D4fA",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x31b124AA410E290c93118640BdbC658724A61788": {
    "address": "0x31b124AA410E290c93118640BdbC658724A61788",
    "name": "50RDNT-50USDC",
    "symbol": "50RDNT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAE5F5aFcCf039f6505EE8bD5F18C9B21F79881BE": {
    "address": "0xAE5F5aFcCf039f6505EE8bD5F18C9B21F79881BE",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xebdeb52B2a46CD2806eF2B714D777dFbF8A79c60": {
    "address": "0xebdeb52B2a46CD2806eF2B714D777dFbF8A79c60",
    "name": "50wstETH-50USDC",
    "symbol": "50wstETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1F5549ba8131fc5dE1b8238042FD001Ba5324ACD": {
    "address": "0x1F5549ba8131fc5dE1b8238042FD001Ba5324ACD",
    "name": "50wstETH-50VST",
    "symbol": "50wstETH-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x820284aE779E46b7eceb9a4C77a4062B9F970E68": {
    "address": "0x820284aE779E46b7eceb9a4C77a4062B9F970E68",
    "name": "25wstETH-25VST-25USDT-25USDC.e",
    "symbol": "25wstETH-25VST-25USDT-25USDC.e",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC7a27C4B61CC72b8D2D986Ab3099b982634B3494": {
    "address": "0xC7a27C4B61CC72b8D2D986Ab3099b982634B3494",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6D93338Db86623BAfE66C72217344A206601e171": {
    "address": "0x6D93338Db86623BAfE66C72217344A206601e171",
    "name": "55VST-45VSTA",
    "symbol": "55VST-45VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x53f892Af49508a39E9261F4D976660cA70663520": {
    "address": "0x53f892Af49508a39E9261F4D976660cA70663520",
    "name": "50BAL-50VST",
    "symbol": "50BAL-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf7B0751Fea697cf1A541A5f57D11058a8fB794ee": {
    "address": "0xf7B0751Fea697cf1A541A5f57D11058a8fB794ee",
    "name": "20LOL-80WETH",
    "symbol": "20LOL-80WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5aF3B93Fb82ab8691b82a09CBBae7b8D3eB5Ac11": {
    "address": "0x5aF3B93Fb82ab8691b82a09CBBae7b8D3eB5Ac11",
    "name": "ARB-DEX-CORE",
    "symbol": "ARB-DEX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd549df6E4513a47F98C00F868D2dC095F86e1B6e": {
    "address": "0xd549df6E4513a47F98C00F868D2dC095F86e1B6e",
    "name": "50BAL-50VSTA",
    "symbol": "50BAL-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x75fBbcBa85985d9493cE00413e82f5961B2b5A73": {
    "address": "0x75fBbcBa85985d9493cE00413e82f5961B2b5A73",
    "name": "50VSTA-50GMX",
    "symbol": "50VSTA-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x27efe9E56D190E9CD52Cf615066CFD0818652B5D": {
    "address": "0x27efe9E56D190E9CD52Cf615066CFD0818652B5D",
    "name": "50ARB-50USDT",
    "symbol": "50ARB-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3B8f9Ac5641b8301747cF1e82b84723c12DC3b45": {
    "address": "0x3B8f9Ac5641b8301747cF1e82b84723c12DC3b45",
    "name": "51DAI-49USDC",
    "symbol": "51DAI-49USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x732717a5FdB5599E0836Fbf087bdB42c597A65c3": {
    "address": "0x732717a5FdB5599E0836Fbf087bdB42c597A65c3",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc878998d4F890eA50e9bf1e6D4C42fBA831056Dc": {
    "address": "0xc878998d4F890eA50e9bf1e6D4C42fBA831056Dc",
    "name": "50BAL-50GMX",
    "symbol": "50BAL-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4858f5723D95A544777e3a39efC3f3765569f40E": {
    "address": "0x4858f5723D95A544777e3a39efC3f3765569f40E",
    "name": "33PLS-33MAGIC-33GMX",
    "symbol": "33PLS-33MAGIC-33GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x508eD651a8638085B94e4be8e619E8392c12453C": {
    "address": "0x508eD651a8638085B94e4be8e619E8392c12453C",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd148A194F215eD989bb1c8624A5823b6920943AA": {
    "address": "0xd148A194F215eD989bb1c8624A5823b6920943AA",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x320eB58F97b9872FEfED670fC8db504667468662": {
    "address": "0x320eB58F97b9872FEfED670fC8db504667468662",
    "name": "50MAGIC-50wstETH",
    "symbol": "50MAGIC-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8B70F9d3fA71148585C8973eDe64d77609184Fcc": {
    "address": "0x8B70F9d3fA71148585C8973eDe64d77609184Fcc",
    "name": "50VST-50DPX",
    "symbol": "50VST-50DPX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb9614C8c8Ca24ba64e98eeeE0fD0bF1147156c65": {
    "address": "0xb9614C8c8Ca24ba64e98eeeE0fD0bF1147156c65",
    "name": "33WETH-33LINK-33USDC",
    "symbol": "33WETH-33LINK-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xB1EBae70dEa593cEee975a629fcC824Fc2928D5c": {
    "address": "0xB1EBae70dEa593cEee975a629fcC824Fc2928D5c",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4fe4fBc83ac8aBd984327f51029f07cf45a1cd82": {
    "address": "0x4fe4fBc83ac8aBd984327f51029f07cf45a1cd82",
    "name": "50SUSHI-50USDC",
    "symbol": "50SUSHI-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x151F0E0e41a7D3a5e13aEDB1D58f88Bb43ED85ac": {
    "address": "0x151F0E0e41a7D3a5e13aEDB1D58f88Bb43ED85ac",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEa9a15B83128B4448aAcAf17F6eFd8b9670E28a2": {
    "address": "0xEa9a15B83128B4448aAcAf17F6eFd8b9670E28a2",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x59cC634b340845b36630D006Ac8151343743F8E0": {
    "address": "0x59cC634b340845b36630D006Ac8151343743F8E0",
    "name": "50DAI-50USDC",
    "symbol": "50DAI-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x64223cBA5ca8697b48d24C2E6bd4Fb9a2cCC3c2d": {
    "address": "0x64223cBA5ca8697b48d24C2E6bd4Fb9a2cCC3c2d",
    "name": "80VST-20DAI",
    "symbol": "80VST-20DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x76B6de1774Fa792F7A18D38CeAa74fa5c4C4514a": {
    "address": "0x76B6de1774Fa792F7A18D38CeAa74fa5c4C4514a",
    "name": "50GNO-50USDC",
    "symbol": "50GNO-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBe7530b4009963292cf219dC09BCedD4Be5a92Db": {
    "address": "0xBe7530b4009963292cf219dC09BCedD4Be5a92Db",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe4fc05D75451AEE2496825D406a1aEB67CF027eE": {
    "address": "0xe4fc05D75451AEE2496825D406a1aEB67CF027eE",
    "name": "90WETH-10USDC",
    "symbol": "90WETH-10USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9E38f72Be61F1B87AE89CBC2b57e688d71917F16": {
    "address": "0x9E38f72Be61F1B87AE89CBC2b57e688d71917F16",
    "name": "50VSTA-50LINK",
    "symbol": "50VSTA-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x876B74c43e20E66fDCc68088F5Eb86eDE36A3FC9": {
    "address": "0x876B74c43e20E66fDCc68088F5Eb86eDE36A3FC9",
    "name": "333L-ETH/USD+USDC-333S-ETH/USD+USDC-33USDC",
    "symbol": "333L-ETH/USD+USDC-333S-ETH/USD+USDC-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE721ed12a6Da5ae3FDe8F4071e14018981A33543": {
    "address": "0xE721ed12a6Da5ae3FDe8F4071e14018981A33543",
    "name": "50wstETH-50ARB",
    "symbol": "50wstETH-50ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb63C94E0A3c2062Ef763Bf8483a932c0f800671D": {
    "address": "0xb63C94E0A3c2062Ef763Bf8483a932c0f800671D",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2d98286b9a98c4335ff7C575A7B1d222e8B7145d": {
    "address": "0x2d98286b9a98c4335ff7C575A7B1d222e8B7145d",
    "name": "50VST-50USDC",
    "symbol": "50VST-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8B6Fb08F95Bdd3e74967fA41be69ef329ea8726F": {
    "address": "0x8B6Fb08F95Bdd3e74967fA41be69ef329ea8726F",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x93cCdC65Dec1d9Dd61F11DBb2C8291200c334518": {
    "address": "0x93cCdC65Dec1d9Dd61F11DBb2C8291200c334518",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x22Dbf69b0Fdf92D1dB06f50C02E10921559b3bb3": {
    "address": "0x22Dbf69b0Fdf92D1dB06f50C02E10921559b3bb3",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2ED6f4bbEC47D37787016eb88C7f4debf607e252": {
    "address": "0x2ED6f4bbEC47D37787016eb88C7f4debf607e252",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE4c3e9496ea894aaba9cA35B85A61d2a4F8a2709": {
    "address": "0xE4c3e9496ea894aaba9cA35B85A61d2a4F8a2709",
    "name": "50MAI-50DAI",
    "symbol": "50MAI-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6fe48F77884Bc15B9f7342cb8AcEC5afb506DA7c": {
    "address": "0x6fe48F77884Bc15B9f7342cb8AcEC5afb506DA7c",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD4F915f915aFDaF7e77bEB96CB18266aD711ED7F": {
    "address": "0xD4F915f915aFDaF7e77bEB96CB18266aD711ED7F",
    "name": "50MAGIC-50DAI",
    "symbol": "50MAGIC-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xDbFD9174A960F01AfE390B5429DA55fc41275D76": {
    "address": "0xDbFD9174A960F01AfE390B5429DA55fc41275D76",
    "name": "50LINK-50USDC",
    "symbol": "50LINK-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6EB2E951d84A7Dc02525cBbe7C0f82d504BC9Ca4": {
    "address": "0x6EB2E951d84A7Dc02525cBbe7C0f82d504BC9Ca4",
    "name": "50WETH-50VSTA",
    "symbol": "50WETH-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xe2b680A8d02fbf48C7D9465398C4225d7b7A7f87": {
    "address": "0xe2b680A8d02fbf48C7D9465398C4225d7b7A7f87",
    "name": "50GMX-50USDT",
    "symbol": "50GMX-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x526F30faf9cF74A30db6d6188C32C4c4b777358f": {
    "address": "0x526F30faf9cF74A30db6d6188C32C4c4b777358f",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4dE95FdC042d0F34C164062c0a594758ae1cFa7C": {
    "address": "0x4dE95FdC042d0F34C164062c0a594758ae1cFa7C",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x416f74A238cE6a789d3AfF90c22a1fcCacA9d1CA": {
    "address": "0x416f74A238cE6a789d3AfF90c22a1fcCacA9d1CA",
    "name": "50BAL-50USDT",
    "symbol": "50BAL-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x366F70cF82661DA1F6Ba483C6fCa70ea22A1a2Fb": {
    "address": "0x366F70cF82661DA1F6Ba483C6fCa70ea22A1a2Fb",
    "name": "50VST-50USDT",
    "symbol": "50VST-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA39fE91dC225Bb2CB03E7f8D82195dFebb8BdAb2": {
    "address": "0xA39fE91dC225Bb2CB03E7f8D82195dFebb8BdAb2",
    "name": "50MAGIC-50WETH",
    "symbol": "50MAGIC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF4De50fadE2F967B9D74b33C83cD8943fDa02a76": {
    "address": "0xF4De50fadE2F967B9D74b33C83cD8943fDa02a76",
    "name": "50MAGIC-50DPX",
    "symbol": "50MAGIC-50DPX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x51b98f7F9caE9452923eCD9d3Fb7106C38CEa3C6": {
    "address": "0x51b98f7F9caE9452923eCD9d3Fb7106C38CEa3C6",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x26aDcf4Ffb7a7a77529404CC9857d178BCC81a25": {
    "address": "0x26aDcf4Ffb7a7a77529404CC9857d178BCC81a25",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF43caEeF8211e74F379b0c81D54903275f154768": {
    "address": "0xF43caEeF8211e74F379b0c81D54903275f154768",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x15Ed89e37eC6661a73B2f2d5E3a988692807e731": {
    "address": "0x15Ed89e37eC6661a73B2f2d5E3a988692807e731",
    "name": "50RDNT-50DAI",
    "symbol": "50RDNT-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBf255D16827aCf2E6EeDAd8c504F1Ce6795b288a": {
    "address": "0xBf255D16827aCf2E6EeDAd8c504F1Ce6795b288a",
    "name": "50MAGIC-50VSTA",
    "symbol": "50MAGIC-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3204c4ce3D8B0a714a457510e9638cC93dEBD491": {
    "address": "0x3204c4ce3D8B0a714a457510e9638cC93dEBD491",
    "name": "LOL Fjord Foundry LBP",
    "symbol": "LOL_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xdfEb435e38744f2EcF2892c7dB8B9201FCc4c915": {
    "address": "0xdfEb435e38744f2EcF2892c7dB8B9201FCc4c915",
    "name": "50BAL-50VST",
    "symbol": "50BAL-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xdfC9B2D6251eC5460AFD75Edb2E6445E8F02a00D": {
    "address": "0xdfC9B2D6251eC5460AFD75Edb2E6445E8F02a00D",
    "name": "90wstETH-10WETH",
    "symbol": "90wstETH-10WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBE5FCd50602136DB20158E994ceAC770B6b7dCd0": {
    "address": "0xBE5FCd50602136DB20158E994ceAC770B6b7dCd0",
    "name": "50VST-50USDT",
    "symbol": "50VST-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xbBb9037a6540565FaEd846257F3A0c50EE89597a": {
    "address": "0xbBb9037a6540565FaEd846257F3A0c50EE89597a",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x901A1Ac3BdC7930cdA988133367c1acD9f36ed70": {
    "address": "0x901A1Ac3BdC7930cdA988133367c1acD9f36ed70",
    "name": "50BAL-50DAI",
    "symbol": "50BAL-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf4DFA0A7Fd3b42a23364fF8D086940Fad27B48F2": {
    "address": "0xf4DFA0A7Fd3b42a23364fF8D086940Fad27B48F2",
    "name": "33MAGIC-33DPX-33GMX",
    "symbol": "33MAGIC-33DPX-33GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9fB4ABe9d610F032Be38ecCa913a45dF9DD9b3bb": {
    "address": "0x9fB4ABe9d610F032Be38ecCa913a45dF9DD9b3bb",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xcCe2AFBf64583366160B916e5e11754De5691289": {
    "address": "0xcCe2AFBf64583366160B916e5e11754De5691289",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2C0842D63A4f822dFb67010cD78696ab31FfD541": {
    "address": "0x2C0842D63A4f822dFb67010cD78696ab31FfD541",
    "name": "50DAI-50USDT",
    "symbol": "50DAI-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2FA1BD0201D4CAe25E864a7Bd1B5a6C2c4039cD3": {
    "address": "0x2FA1BD0201D4CAe25E864a7Bd1B5a6C2c4039cD3",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1d617432F58b578A025aB315aF6B3672CDC0a769": {
    "address": "0x1d617432F58b578A025aB315aF6B3672CDC0a769",
    "name": "50USDT-50USDC",
    "symbol": "50USDT-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF683B45dC9fE101aE88E6c71D22BB6343786bc2D": {
    "address": "0xF683B45dC9fE101aE88E6c71D22BB6343786bc2D",
    "name": "50VST-50USDT",
    "symbol": "50VST-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x429C7b5173aE85B4Cc72777524d40055a78C1028": {
    "address": "0x429C7b5173aE85B4Cc72777524d40055a78C1028",
    "name": "50GMX-50USDC",
    "symbol": "50GMX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x30C9d0D05A8f57226dCA7FbcAC00cB57B6D3dB7c": {
    "address": "0x30C9d0D05A8f57226dCA7FbcAC00cB57B6D3dB7c",
    "name": "33WBTC-33WETH-33USDC",
    "symbol": "33WBTC-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xf3BE386FD62ADe4cB8c1585F6B108E258079E0Ed": {
    "address": "0xf3BE386FD62ADe4cB8c1585F6B108E258079E0Ed",
    "name": "50MAGIC-50USDC",
    "symbol": "50MAGIC-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x72D7C8E49C276f97291eE14A37d2eD8eB328BA35": {
    "address": "0x72D7C8E49C276f97291eE14A37d2eD8eB328BA35",
    "name": "50MAGIC-50DAI",
    "symbol": "50MAGIC-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x91920728107AB3bEA826365e976E774825f61aEE": {
    "address": "0x91920728107AB3bEA826365e976E774825f61aEE",
    "name": "87WBTC-7wstETH-7WETH",
    "symbol": "87WBTC-7wstETH-7WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2286793cFaF319822d34dB8ddb6292068FC85C45": {
    "address": "0x2286793cFaF319822d34dB8ddb6292068FC85C45",
    "name": "50GMX-50USDC",
    "symbol": "50GMX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc8bcb62028647DBB00d66BF5f5B4868EdC99391B": {
    "address": "0xc8bcb62028647DBB00d66BF5f5B4868EdC99391B",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x473B078AD1cf957B8d2B165b045B379cAD8aE42a": {
    "address": "0x473B078AD1cf957B8d2B165b045B379cAD8aE42a",
    "name": "LOL Fjord Foundry LBP",
    "symbol": "LOL_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5f269578a01832FBCbCc29F7CBdC8a4bebBF9961": {
    "address": "0x5f269578a01832FBCbCc29F7CBdC8a4bebBF9961",
    "name": "50RDNT-50RDPX",
    "symbol": "50RDNT-50RDPX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBF35Ff9fCE1CDff404B31aAfcDC5d696693726AD": {
    "address": "0xBF35Ff9fCE1CDff404B31aAfcDC5d696693726AD",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4Aa81E9F195dFfB321ED442cc1D4757B44603926": {
    "address": "0x4Aa81E9F195dFfB321ED442cc1D4757B44603926",
    "name": "50VST-50LINK",
    "symbol": "50VST-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1b8135A211E42C7307aEC63A88B9E2c052D53Da1": {
    "address": "0x1b8135A211E42C7307aEC63A88B9E2c052D53Da1",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3d60feCA5250F4201074be5ff716B124ae269948": {
    "address": "0x3d60feCA5250F4201074be5ff716B124ae269948",
    "name": "50BAL-50B-stETH-Stable",
    "symbol": "50BAL-50B-stETH-Stable",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4E8d4cFb44507a8c528aFaaBc29512Eeafc840C1": {
    "address": "0x4E8d4cFb44507a8c528aFaaBc29512Eeafc840C1",
    "name": "33VSTA-33GMX-33USDC",
    "symbol": "33VSTA-33GMX-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD04D0f7B5AABAFEbda944Bf84E459b615213AED0": {
    "address": "0xD04D0f7B5AABAFEbda944Bf84E459b615213AED0",
    "name": "50DPX-50UNI",
    "symbol": "50DPX-50UNI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x47c56A900295df5224EC5e6751dC31eb900321D5": {
    "address": "0x47c56A900295df5224EC5e6751dC31eb900321D5",
    "name": "80XEX-20USDC",
    "symbol": "80XEX-20USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x83e4D7E4979508595DF0699F142f164fE53C1A66": {
    "address": "0x83e4D7E4979508595DF0699F142f164fE53C1A66",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xeE45F7AFe47BCaA66a39D03e298547E6666c1FA7": {
    "address": "0xeE45F7AFe47BCaA66a39D03e298547E6666c1FA7",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x489a7A4d566991714308CA626Ca6Bb3F3F37D71C": {
    "address": "0x489a7A4d566991714308CA626Ca6Bb3F3F37D71C",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xfCC9a8d58E41CBF582CFF798148750637EADB1ff": {
    "address": "0xfCC9a8d58E41CBF582CFF798148750637EADB1ff",
    "name": "50RDNT-50USDC.e",
    "symbol": "50RDNT-50USDC.e",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x224FaAB06d2Bcd0Bf688994B71C35864e2977BF4": {
    "address": "0x224FaAB06d2Bcd0Bf688994B71C35864e2977BF4",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF922b0B4a93bCA546ed69e3b5bb97585066503F2": {
    "address": "0xF922b0B4a93bCA546ed69e3b5bb97585066503F2",
    "name": "50GMX-50USDT",
    "symbol": "50GMX-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x96729025e23EAAaEd59e95594150E5D940c45e53": {
    "address": "0x96729025e23EAAaEd59e95594150E5D940c45e53",
    "name": "33VST-33VSTA-33LINK",
    "symbol": "33VST-33VSTA-33LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x27Fd581E9D0b2690C2f808cd40f7fe667714b575": {
    "address": "0x27Fd581E9D0b2690C2f808cd40f7fe667714b575",
    "name": "25WBTC-25STG-25USDT-25USDC",
    "symbol": "25WBTC-25STG-25USDT-25USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6c00D5F53fCbE5b454fc103cA1c50aeeb8EB96F2": {
    "address": "0x6c00D5F53fCbE5b454fc103cA1c50aeeb8EB96F2",
    "name": "50ARB-50USDC",
    "symbol": "50ARB-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xea0d73c6d1677ad911009cb77DB44B59A1cF7d2c": {
    "address": "0xea0d73c6d1677ad911009cb77DB44B59A1cF7d2c",
    "name": "40WETH-60VSTA",
    "symbol": "40WETH-60VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x70Fa62CAB5950172007f25d2dCfdfdcC1F720028": {
    "address": "0x70Fa62CAB5950172007f25d2dCfdfdcC1F720028",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x322ca68e7379E099477A87Ca935f6D066275F26D": {
    "address": "0x322ca68e7379E099477A87Ca935f6D066275F26D",
    "name": "50WETH-50VSTA",
    "symbol": "50WETH-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xcABA08e1cBCBF396A6949F2B8Ea0eDc09C2bA8E6": {
    "address": "0xcABA08e1cBCBF396A6949F2B8Ea0eDc09C2bA8E6",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7537d60fE6FA6fE044B62d55DfD3Eae87481dfc7": {
    "address": "0x7537d60fE6FA6fE044B62d55DfD3Eae87481dfc7",
    "name": "50VST-50WETH",
    "symbol": "50VST-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE6b66114b588C9d1f36f261AB1b2A6Ce5C89585D": {
    "address": "0xE6b66114b588C9d1f36f261AB1b2A6Ce5C89585D",
    "name": "50BAL-50USDC",
    "symbol": "50BAL-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8e2E38889C486888ff7b0fe35C37A686e488019A": {
    "address": "0x8e2E38889C486888ff7b0fe35C37A686e488019A",
    "name": "25VSTA-25DAI-25USDT-25USDC",
    "symbol": "25VSTA-25DAI-25USDT-25USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x16E3E51aa1b48D38d3c4D331672403C10D5F74cf": {
    "address": "0x16E3E51aa1b48D38d3c4D331672403C10D5F74cf",
    "name": "25MAGIC-75USDC",
    "symbol": "25MAGIC-75USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x863683EF46Ad753FcE5539421901e245eC1bB022": {
    "address": "0x863683EF46Ad753FcE5539421901e245eC1bB022",
    "name": "50VST-50STG",
    "symbol": "50VST-50STG",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD81db356dB39E2B9DCE04D93A09b66003Ad3FC1D": {
    "address": "0xD81db356dB39E2B9DCE04D93A09b66003Ad3FC1D",
    "name": "50DPX-50USDC",
    "symbol": "50DPX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x330a68754fE4F297bE00a6762b745Ac524d5654A": {
    "address": "0x330a68754fE4F297bE00a6762b745Ac524d5654A",
    "name": "50DAI-50GMX",
    "symbol": "50DAI-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5e46b992b6dEC34EF159B671cDb5a21889bC19A7": {
    "address": "0x5e46b992b6dEC34EF159B671cDb5a21889bC19A7",
    "name": "90VST-10USDT",
    "symbol": "90VST-10USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7656aD5aba464B6dcF462B921cB8643092b4b164": {
    "address": "0x7656aD5aba464B6dcF462B921cB8643092b4b164",
    "name": "25VSTA-75GMX",
    "symbol": "25VSTA-75GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x39D78987933477eC0886968F85E00f4617706ae8": {
    "address": "0x39D78987933477eC0886968F85E00f4617706ae8",
    "name": "50MAGIC-50VSTA",
    "symbol": "50MAGIC-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7bffb5B1440179d9893ECD9a032D7d74a655D443": {
    "address": "0x7bffb5B1440179d9893ECD9a032D7d74a655D443",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x822A72c5e0F6cBc92C3d407A11782d93BDa2d294": {
    "address": "0x822A72c5e0F6cBc92C3d407A11782d93BDa2d294",
    "name": "50DPX-50USDC",
    "symbol": "50DPX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7543De183090904887A320e3332d71D71f57f89A": {
    "address": "0x7543De183090904887A320e3332d71D71f57f89A",
    "name": "50STG-50LINK",
    "symbol": "50STG-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAe488f345bae188D41ae6b98bC2D7ef8A0Df4F11": {
    "address": "0xAe488f345bae188D41ae6b98bC2D7ef8A0Df4F11",
    "name": "50LINK-50GMX",
    "symbol": "50LINK-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4e4f9Cc2fCc4D989E000A4261f61FEedF8c5B28B": {
    "address": "0x4e4f9Cc2fCc4D989E000A4261f61FEedF8c5B28B",
    "name": "50VST-50DPX",
    "symbol": "50VST-50DPX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xB61AdD50cEA270A022d987D6B570576d07d12678": {
    "address": "0xB61AdD50cEA270A022d987D6B570576d07d12678",
    "name": "50VSTA-50GMX",
    "symbol": "50VSTA-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4A5aE7cffcC25d3D7Be210b79DFf2Bc108864338": {
    "address": "0x4A5aE7cffcC25d3D7Be210b79DFf2Bc108864338",
    "name": "25BAL-25MAGIC-25WETH-25USDC",
    "symbol": "25BAL-25MAGIC-25WETH-25USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBBF0150E64240e3eaE254C9d9401Be4afDeCCdf7": {
    "address": "0xBBF0150E64240e3eaE254C9d9401Be4afDeCCdf7",
    "name": "50STG-50USDC",
    "symbol": "50STG-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9728e7717e21984832d8329402C6358D3E2a4716": {
    "address": "0x9728e7717e21984832d8329402C6358D3E2a4716",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4F75fcA4B02C737437aC4EBF9788Aa5262BFcD57": {
    "address": "0x4F75fcA4B02C737437aC4EBF9788Aa5262BFcD57",
    "name": "40STG-60USDC",
    "symbol": "40STG-60USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x48BD6549173683D50bC9A302c18d3ee98B32bff5": {
    "address": "0x48BD6549173683D50bC9A302c18d3ee98B32bff5",
    "name": "50DPX-50VSTA",
    "symbol": "50DPX-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x50f0A24e3b8Bac08dD1BE443A4bD76FE42f7F59d": {
    "address": "0x50f0A24e3b8Bac08dD1BE443A4bD76FE42f7F59d",
    "name": "50VSTA-50GMX",
    "symbol": "50VSTA-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA2a9Ebd6f4dEA4802083F2C8D08066A4e695e64B": {
    "address": "0xA2a9Ebd6f4dEA4802083F2C8D08066A4e695e64B",
    "name": "50wstETH-50LINK",
    "symbol": "50wstETH-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6cd9b67D7407b2ba583bD105920f839aa73d7B7d": {
    "address": "0x6cd9b67D7407b2ba583bD105920f839aa73d7B7d",
    "name": "50MAGIC-50USDC",
    "symbol": "50MAGIC-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1FD081A7b1C2Bb965B958D410c43db39552374CE": {
    "address": "0x1FD081A7b1C2Bb965B958D410c43db39552374CE",
    "name": "50WETH-50DAI",
    "symbol": "50WETH-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD933C7a68be8C8856dBb409477ced799BC2a11c6": {
    "address": "0xD933C7a68be8C8856dBb409477ced799BC2a11c6",
    "name": "50WETH-50GMX",
    "symbol": "50WETH-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xC6f3Ab55E963740eA3B0A540cD4d2a5669e1a527": {
    "address": "0xC6f3Ab55E963740eA3B0A540cD4d2a5669e1a527",
    "name": "50DPX-50VSTA",
    "symbol": "50DPX-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb32Ae42524d38be7E7eD9E02b5F9330fCEf07f3F": {
    "address": "0xb32Ae42524d38be7E7eD9E02b5F9330fCEf07f3F",
    "name": "50BAL-50wstETH",
    "symbol": "50BAL-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x585d95DF0231fA08aEEe35FF0c16b92FD0ECDc33": {
    "address": "0x585d95DF0231fA08aEEe35FF0c16b92FD0ECDc33",
    "name": "ChadUSD",
    "symbol": "ChadUSD",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xcD6E194Cfcbf9e60571C6Dac7C2d3A474F5D3B16": {
    "address": "0xcD6E194Cfcbf9e60571C6Dac7C2d3A474F5D3B16",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3e51aEedf2CC7e94a592E2244F826ddFb2e05bc8": {
    "address": "0x3e51aEedf2CC7e94a592E2244F826ddFb2e05bc8",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA0D0B6f41cc9cd828eD67654D15A9F5A72204368": {
    "address": "0xA0D0B6f41cc9cd828eD67654D15A9F5A72204368",
    "name": "50VSTA-50DAI",
    "symbol": "50VSTA-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4a82A1404c55906c052Bfc5d2EA33C1C887546fa": {
    "address": "0x4a82A1404c55906c052Bfc5d2EA33C1C887546fa",
    "name": "50BAL-50TCR",
    "symbol": "50BAL-50TCR",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3598aE8a9f6A3Bd83c7Eae320F7b7780E47dd35d": {
    "address": "0x3598aE8a9f6A3Bd83c7Eae320F7b7780E47dd35d",
    "name": "60VST-40GMX",
    "symbol": "60VST-40GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x86e5cc6d4AA157F8eBC513de1280407c0048F655": {
    "address": "0x86e5cc6d4AA157F8eBC513de1280407c0048F655",
    "name": "13WBTC-13wstETH-75USDC",
    "symbol": "13WBTC-13wstETH-75USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBC02eF87f4E15EF78A571f3B2aDcC726Fee70d8b": {
    "address": "0xBC02eF87f4E15EF78A571f3B2aDcC726Fee70d8b",
    "name": "50BAL-50wstETH",
    "symbol": "50BAL-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x557217D8F45f4A8C844ee65E368D6D9f2d050226": {
    "address": "0x557217D8F45f4A8C844ee65E368D6D9f2d050226",
    "name": "50DPX-50GMX",
    "symbol": "50DPX-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA908414606739de6314106E7AA109002C767A343": {
    "address": "0xA908414606739de6314106E7AA109002C767A343",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xAb400c30C661Dad86bF8CC2D147C2644D9cCe438": {
    "address": "0xAb400c30C661Dad86bF8CC2D147C2644D9cCe438",
    "name": "50DAI-50USDT",
    "symbol": "50DAI-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2C404fcbD37d17C3C1305B8FF6e1AF798BBfA920": {
    "address": "0x2C404fcbD37d17C3C1305B8FF6e1AF798BBfA920",
    "name": "50DPX-50VSTA",
    "symbol": "50DPX-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2Be3114c427956C398b619737a45D35f32A7068f": {
    "address": "0x2Be3114c427956C398b619737a45D35f32A7068f",
    "name": "33WBTC-33WETH-33USDC",
    "symbol": "33WBTC-33WETH-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xE07c4777070D9ac416F8d5D383af86254db6cC92": {
    "address": "0xE07c4777070D9ac416F8d5D383af86254db6cC92",
    "name": "33WETH-33MYC-33USDT",
    "symbol": "33WETH-33MYC-33USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1Be8Fe1513b74906Fa824c78F9D956A72C3518E6": {
    "address": "0x1Be8Fe1513b74906Fa824c78F9D956A72C3518E6",
    "name": "50MYC-50GMX",
    "symbol": "50MYC-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7F989B38B9de3305FB74f47952bCeD3Aa95d4620": {
    "address": "0x7F989B38B9de3305FB74f47952bCeD3Aa95d4620",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x90A153c7f88e8C5eD61a94Ad5EC603DDd50ce9AC": {
    "address": "0x90A153c7f88e8C5eD61a94Ad5EC603DDd50ce9AC",
    "name": "33WETH-33VSTA-33USDT",
    "symbol": "33WETH-33VSTA-33USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xaE1b93f42B34a299a32101bD4ad704e80330884b": {
    "address": "0xaE1b93f42B34a299a32101bD4ad704e80330884b",
    "name": "50VST-50DPX",
    "symbol": "50VST-50DPX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4999cA20809a882fF22D9558446669BcC8cBA3D6": {
    "address": "0x4999cA20809a882fF22D9558446669BcC8cBA3D6",
    "name": "50TCR-50LINK",
    "symbol": "50TCR-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6661136537dfDCA26EEA05c8500502d7D5796E5E": {
    "address": "0x6661136537dfDCA26EEA05c8500502d7D5796E5E",
    "name": "80AI-20USDC",
    "symbol": "80AI-20USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x2ecEA5d155Ee2F29ea757a6F070f03dd557b87a4": {
    "address": "0x2ecEA5d155Ee2F29ea757a6F070f03dd557b87a4",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xd30C7448FA2844b5C7e7b5e649b5B5263Fb234d9": {
    "address": "0xd30C7448FA2844b5C7e7b5e649b5B5263Fb234d9",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7C777eEA1dC264e71E567Fcc9B6DdaA9064Eff51": {
    "address": "0x7C777eEA1dC264e71E567Fcc9B6DdaA9064Eff51",
    "name": "50BAL-50wstETH",
    "symbol": "50BAL-50wstETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x329aa019aE4DaB37C77b7268Cd40d0ea262B4c17": {
    "address": "0x329aa019aE4DaB37C77b7268Cd40d0ea262B4c17",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xa781Ef4A5C7E6876ab311B49aeEe40638ccB693E": {
    "address": "0xa781Ef4A5C7E6876ab311B49aeEe40638ccB693E",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xCf8fC65a6a4FB5FE9a9E45410373DcFf3394c1D2": {
    "address": "0xCf8fC65a6a4FB5FE9a9E45410373DcFf3394c1D2",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x370cAB118186aC60Af080c2de7CEFCCa5c165eDF": {
    "address": "0x370cAB118186aC60Af080c2de7CEFCCa5c165eDF",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x877253eA619fe9C8F91D7e6206FD1286C8d62dad": {
    "address": "0x877253eA619fe9C8F91D7e6206FD1286C8d62dad",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x5D08dC671DbE854D135465B3c8072250ebcd7277": {
    "address": "0x5D08dC671DbE854D135465B3c8072250ebcd7277",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4968E0c0fF8f6e7f300487F92c6dD5f7A38e80c8": {
    "address": "0x4968E0c0fF8f6e7f300487F92c6dD5f7A38e80c8",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x20D1Fce3a41c9e9220892AF5eE56C2Ee8B8da647": {
    "address": "0x20D1Fce3a41c9e9220892AF5eE56C2Ee8B8da647",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA49e4452e9a8F6f3cA28a19441d9eb2E7759c927": {
    "address": "0xA49e4452e9a8F6f3cA28a19441d9eb2E7759c927",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x605A13718217437EBa2A9789f17d79E4263Bd42D": {
    "address": "0x605A13718217437EBa2A9789f17d79E4263Bd42D",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x8FA3214142f65748fC2d84343bC19f7E97CBFdeC": {
    "address": "0x8FA3214142f65748fC2d84343bC19f7E97CBFdeC",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9f60Eb05BE331013cb7890E7711eFeC6d054f9a5": {
    "address": "0x9f60Eb05BE331013cb7890E7711eFeC6d054f9a5",
    "name": "33BAL-33VST-33USDC",
    "symbol": "33BAL-33VST-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x478cdcD82a8E1C3aC49D028553A92c9DA907F695": {
    "address": "0x478cdcD82a8E1C3aC49D028553A92c9DA907F695",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6f058064A082D1A97b67b0B4e0fA581325Eb658d": {
    "address": "0x6f058064A082D1A97b67b0B4e0fA581325Eb658d",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xef3D85841c50061cC3b38f62Df363F4cd50d2dE1": {
    "address": "0xef3D85841c50061cC3b38f62Df363F4cd50d2dE1",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6a207c7Ee57Dc36dfa011196388F26E25a6a7B4D": {
    "address": "0x6a207c7Ee57Dc36dfa011196388F26E25a6a7B4D",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4E138506BB89962F6b7DDF3D99d1230b9809B4ad": {
    "address": "0x4E138506BB89962F6b7DDF3D99d1230b9809B4ad",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc17F90c80ef0f17722Ab31585eC42B527772BFc5": {
    "address": "0xc17F90c80ef0f17722Ab31585eC42B527772BFc5",
    "name": "50WETH-50USDC",
    "symbol": "50WETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xD48Ef8D8316E3b8cE44adC6B8027414c07707F1E": {
    "address": "0xD48Ef8D8316E3b8cE44adC6B8027414c07707F1E",
    "name": "50GMX-50USDC",
    "symbol": "50GMX-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x72e47b879A6940BC02E151e7EaF64F43d68f5f6C": {
    "address": "0x72e47b879A6940BC02E151e7EaF64F43d68f5f6C",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xF28828bdAb791476F866E38bE62c2C08EcAb34C6": {
    "address": "0xF28828bdAb791476F866E38bE62c2C08EcAb34C6",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBC5F0f29883f1e2556D14c90fE84b91a945b4080": {
    "address": "0xBC5F0f29883f1e2556D14c90fE84b91a945b4080",
    "name": "50WETH-50USDT",
    "symbol": "50WETH-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3E6FF8A4950C915991660F155485fc6232325677": {
    "address": "0x3E6FF8A4950C915991660F155485fc6232325677",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x38153744ADF09d91cDf8BB148DEcBf1f00750FeF": {
    "address": "0x38153744ADF09d91cDf8BB148DEcBf1f00750FeF",
    "name": "50VSTA-50USDT",
    "symbol": "50VSTA-50USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x695771e2BE9D378242a66e7B61e344154cB2FDe7": {
    "address": "0x695771e2BE9D378242a66e7B61e344154cB2FDe7",
    "name": "33MAGIC-33wstETH-33LINK",
    "symbol": "33MAGIC-33wstETH-33LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3B661a637fc1D9EcE129d0298C8Cccd48e2127b7": {
    "address": "0x3B661a637fc1D9EcE129d0298C8Cccd48e2127b7",
    "name": "50WETH-50VSTA",
    "symbol": "50WETH-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc386d678b30BbB835a6D22cDd8b7B1789d7D7Fd3": {
    "address": "0xc386d678b30BbB835a6D22cDd8b7B1789d7D7Fd3",
    "name": "50VST-50WETH",
    "symbol": "50VST-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x900045E8429a667da8a41E22feaA426eA7bcCc19": {
    "address": "0x900045E8429a667da8a41E22feaA426eA7bcCc19",
    "name": "50FRAX-50VST",
    "symbol": "50FRAX-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xB81AF990d32526B9E7e3e27Ba55eF76b34499296": {
    "address": "0xB81AF990d32526B9E7e3e27Ba55eF76b34499296",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4629a8bd258Db5120a88b1de2600F245bDAF04E1": {
    "address": "0x4629a8bd258Db5120a88b1de2600F245bDAF04E1",
    "name": "50WBTC-50WETH",
    "symbol": "50WBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xb66c4013A2EcA24D46Bb94BeaeaCeCD60BDE542B": {
    "address": "0xb66c4013A2EcA24D46Bb94BeaeaCeCD60BDE542B",
    "name": "50BAL-50WETH",
    "symbol": "50BAL-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x215fd54bd163bE3B314ae3aDf9c2E48EfEd6E073": {
    "address": "0x215fd54bd163bE3B314ae3aDf9c2E48EfEd6E073",
    "name": "50BAL-50DAI",
    "symbol": "50BAL-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x3f6Bb0c4bbdDc9d2800Ea96eEA08792f02B08Bc8": {
    "address": "0x3f6Bb0c4bbdDc9d2800Ea96eEA08792f02B08Bc8",
    "name": "50VST-50DAI",
    "symbol": "50VST-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9811B1EdC7Cf26E626EC94074693526A7eC80E85": {
    "address": "0x9811B1EdC7Cf26E626EC94074693526A7eC80E85",
    "name": "TCR Dai Weighted pool",
    "symbol": "TCR-DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc474511015ACd65Aaf908c76Dca14fc59f0eF560": {
    "address": "0xc474511015ACd65Aaf908c76Dca14fc59f0eF560",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x6B2f3378E3040784e98f65962c3157648CCa837E": {
    "address": "0x6B2f3378E3040784e98f65962c3157648CCa837E",
    "name": "50MAGIC-50LINK",
    "symbol": "50MAGIC-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x1561B8E4033161bdEf300f5bD07Eb4c60A4C898F": {
    "address": "0x1561B8E4033161bdEf300f5bD07Eb4c60A4C898F",
    "name": "50VST-50LINK",
    "symbol": "50VST-50LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x663803d5a1539525a333CdB270684bD2d1E387ED": {
    "address": "0x663803d5a1539525a333CdB270684bD2d1E387ED",
    "name": "50DPX-50VSTA",
    "symbol": "50DPX-50VSTA",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xBC6A8Da891fa70093C6cc00655d3d9B52c7D3835": {
    "address": "0xBC6A8Da891fa70093C6cc00655d3d9B52c7D3835",
    "name": "50LINK-50GMX",
    "symbol": "50LINK-50GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xA90179d11fA92116FeFCf84926deB661a7d7a62b": {
    "address": "0xA90179d11fA92116FeFCf84926deB661a7d7a62b",
    "name": "50BAL-50USDC",
    "symbol": "50BAL-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x4B6dd482CA3B8507B94cD6C9E3A861C651FA20eB": {
    "address": "0x4B6dd482CA3B8507B94cD6C9E3A861C651FA20eB",
    "name": "50wstETH-50WETH",
    "symbol": "50wstETH-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x21eddB61B3dcdad3F06EaeCbbBEcA704401e0f57": {
    "address": "0x21eddB61B3dcdad3F06EaeCbbBEcA704401e0f57",
    "name": "LOL Fjord Foundry LBP",
    "symbol": "LOL_LBP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x9468fE1960CbE42446EcD0bd83bD653ac99f76d5": {
    "address": "0x9468fE1960CbE42446EcD0bd83bD653ac99f76d5",
    "name": "50GRT-50DAI",
    "symbol": "50GRT-50DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xeFc9E601Db33dA649b7d879c7AF8FF589a7722e1": {
    "address": "0xeFc9E601Db33dA649b7d879c7AF8FF589a7722e1",
    "name": "50BAL-50VST",
    "symbol": "50BAL-50VST",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xDB92eca1bF4fB7713C25E02d0da51bD3d307296A": {
    "address": "0xDB92eca1bF4fB7713C25E02d0da51bD3d307296A",
    "name": "50VSTA-50USDC",
    "symbol": "50VSTA-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x16E1ce21e45215bB1e428F793f29e25b6AF5050b": {
    "address": "0x16E1ce21e45215bB1e428F793f29e25b6AF5050b",
    "name": "33VSTA-33USDT-33USDC",
    "symbol": "33VSTA-33USDT-33USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0x7b675B25AA787597A9e2E8cD287ef11FFA47Fd7f": {
    "address": "0x7b675B25AA787597A9e2E8cD287ef11FFA47Fd7f",
    "name": "50VSTA-50TCR",
    "symbol": "50VSTA-50TCR",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xc4c96196e8d91b3C08f0Aa9dc5c4e30b5c4a244B": {
    "address": "0xc4c96196e8d91b3C08f0Aa9dc5c4e30b5c4a244B",
    "name": "33DPX-33WETH-33LINK",
    "symbol": "33DPX-33WETH-33LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/balancer-v2.png",
    "chainId": 42161
  },
  "0xEbCb1881165DEC931BF113025fBd115e31da6aA5": {
    "address": "0xEbCb1881165DEC931BF113025fBd115e31da6aA5",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xf8b14d9f2B477E916082Cd633E114C2cfC555B0F": {
    "address": "0xf8b14d9f2B477E916082Cd633E114C2cfC555B0F",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x85a78E8EAb33daF25b4E18D84D6FBc2eC05b6C40": {
    "address": "0x85a78E8EAb33daF25b4E18D84D6FBc2eC05b6C40",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xc62001b3595882aa26942b3C731a989007c18936": {
    "address": "0xc62001b3595882aa26942b3C731a989007c18936",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x82F77E43bC514525e01B0c0ce896214C00869b08": {
    "address": "0x82F77E43bC514525e01B0c0ce896214C00869b08",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x049e1a97882fcd5f852Be65b3002102B16f879CB": {
    "address": "0x049e1a97882fcd5f852Be65b3002102B16f879CB",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xeE0b2F18cE69b718Ea6499fC62C5Eed132C819dC": {
    "address": "0xeE0b2F18cE69b718Ea6499fC62C5Eed132C819dC",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x4b5998d2cd44baae27e44abF4F6cD2118D38d412": {
    "address": "0x4b5998d2cd44baae27e44abF4F6cD2118D38d412",
    "name": "FARM_USDC",
    "symbol": "fUSDC",
    "decimals": 6,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x1d8D049CFC65695aa37b17B4Fbc8c5861263C027": {
    "address": "0x1d8D049CFC65695aa37b17B4Fbc8c5861263C027",
    "name": "FARM_DOLA/USDC BPT",
    "symbol": "fDOLA/USDC BPT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x1131f2c2E4Ba7E63e1fD5E9E8e0e0D2E560DC9eB": {
    "address": "0x1131f2c2E4Ba7E63e1fD5E9E8e0e0D2E560DC9eB",
    "name": "FARM_80PAL-20OHM",
    "symbol": "f80PAL-20OHM",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x7fDEF5A949AE0DE32462632ddC5fb31Ea42130D1": {
    "address": "0x7fDEF5A949AE0DE32462632ddC5fb31Ea42130D1",
    "name": "FARM_55auraBal-45wsteth",
    "symbol": "f55auraBal-45wsteth",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xF35f0B288bE527855f954ABCf7E38604Ea11d92D": {
    "address": "0xF35f0B288bE527855f954ABCf7E38604Ea11d92D",
    "name": "FARM_50MAGIC-50USDC",
    "symbol": "f50MAGIC-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x57E627a98F26c6B9887C44AEd7845b18c7142BC1": {
    "address": "0x57E627a98F26c6B9887C44AEd7845b18c7142BC1",
    "name": "FARM_2BTC",
    "symbol": "f2BTC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xF05309297B6E41713C23B0F61b1Ea0C6a7fcCa81": {
    "address": "0xF05309297B6E41713C23B0F61b1Ea0C6a7fcCa81",
    "name": "FARM_50tBTC-50WETH",
    "symbol": "f50tBTC-50WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x45f2a09E2FFb04CD108e0804155aF4ef963dFA19": {
    "address": "0x45f2a09E2FFb04CD108e0804155aF4ef963dFA19",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xE7B837739aA0E499355792C65650AC92b6D5e81d": {
    "address": "0xE7B837739aA0E499355792C65650AC92b6D5e81d",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x62B5cAf42A430b05A89073372ECC69Fb4448E6E6": {
    "address": "0x62B5cAf42A430b05A89073372ECC69Fb4448E6E6",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x5AbB6Ee1A21E9a0209b97F375128bE2B2fB4E6a9": {
    "address": "0x5AbB6Ee1A21E9a0209b97F375128bE2B2fB4E6a9",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x63cBC29A77ca33E86Ca6fC9d055ca4DA8fc78FC1": {
    "address": "0x63cBC29A77ca33E86Ca6fC9d055ca4DA8fc78FC1",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x906cfc845f257c656b786B43927218CB6c76bA0c": {
    "address": "0x906cfc845f257c656b786B43927218CB6c76bA0c",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xc05374A286143BA88984AF1a103aceD8b587c96b": {
    "address": "0xc05374A286143BA88984AF1a103aceD8b587c96b",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x822E250B529969b4D9eEB422797Eb23F7EC95B25": {
    "address": "0x822E250B529969b4D9eEB422797Eb23F7EC95B25",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x270b593c6A67a4AF0B6501a3FDeb54fB85958938": {
    "address": "0x270b593c6A67a4AF0B6501a3FDeb54fB85958938",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x2A15a59648eD09F14fb87A740199831a43031319": {
    "address": "0x2A15a59648eD09F14fb87A740199831a43031319",
    "name": "FARM_CMLT-LP",
    "symbol": "fCMLT-LP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xFA10759780304c2B8d34B051C039899dFBbcad7f": {
    "address": "0xFA10759780304c2B8d34B051C039899dFBbcad7f",
    "name": "FARM_xGRAIL",
    "symbol": "fxGRAIL",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xde3Bd06C0fF5B6c497d7037Cd3A1861D2caab2ab": {
    "address": "0xde3Bd06C0fF5B6c497d7037Cd3A1861D2caab2ab",
    "name": "FARM_rETH-bb-a-WETH-BPT",
    "symbol": "frETH-bb-a-WETH-BPT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x9Af5E84e56D818ee9DFf66d8E496F5cEe9f9CcC4": {
    "address": "0x9Af5E84e56D818ee9DFf66d8E496F5cEe9f9CcC4",
    "name": "FARM_RDNT-WETH",
    "symbol": "fRDNT-WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x8F4D59C403a61EC197535f53E86Fdd3113DF2557": {
    "address": "0x8F4D59C403a61EC197535f53E86Fdd3113DF2557",
    "name": "FARM_SLP",
    "symbol": "fSLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x9F65E93209EFAe76a716ffF7d40089d2aA1b9ad1": {
    "address": "0x9F65E93209EFAe76a716ffF7d40089d2aA1b9ad1",
    "name": "FARM_iPOI$ON",
    "symbol": "fiPOI$ON",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x52de41ccd17A6663A4e237fF62ab674d779ab7E8": {
    "address": "0x52de41ccd17A6663A4e237fF62ab674d779ab7E8",
    "name": "FARM_SLP",
    "symbol": "fSLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xD7A02843d67DdEfbd4d8195FCA3fE1835BC03e70": {
    "address": "0xD7A02843d67DdEfbd4d8195FCA3fE1835BC03e70",
    "name": "FARM_B-wstETH-WETH-Stable",
    "symbol": "fB-wstETH-WETH-Stable",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xE9EAE6A3e1822458eDB811B17160d4554B424C6F": {
    "address": "0xE9EAE6A3e1822458eDB811B17160d4554B424C6F",
    "name": "FARM_50WSTETH-50USDC",
    "symbol": "f50WSTETH-50USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x7FEBd439C00339C377031001048B556C085f100E": {
    "address": "0x7FEBd439C00339C377031001048B556C085f100E",
    "name": "FARM_2CRV",
    "symbol": "f2CRV",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xcF1F62c17fcd5027d6810D76697F228FE44074FD": {
    "address": "0xcF1F62c17fcd5027d6810D76697F228FE44074FD",
    "name": "FARM_crv3crypto",
    "symbol": "fcrv3crypto",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xfC2640ca71B1724B89dc2714E661B0089f8c0EED": {
    "address": "0xfC2640ca71B1724B89dc2714E661B0089f8c0EED",
    "name": "FARM_S*USDC",
    "symbol": "fS*USDC",
    "decimals": 6,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x6d8ed5dace7C74e2d83AE09bB29d548c964EEBc5": {
    "address": "0x6d8ed5dace7C74e2d83AE09bB29d548c964EEBc5",
    "name": "FARM_S*USDT",
    "symbol": "fS*USDT",
    "decimals": 6,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xc6f4A360732a53Cec7b7f2eF82F9DB34dF3593A7": {
    "address": "0xc6f4A360732a53Cec7b7f2eF82F9DB34dF3593A7",
    "name": "FARM_SLP",
    "symbol": "fSLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x358cDb55B3bc792d51190Cf4D3B6C8ABa450f863": {
    "address": "0x358cDb55B3bc792d51190Cf4D3B6C8ABa450f863",
    "name": "FARM_SLP",
    "symbol": "fSLP",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xc2eEE8782B74289774Fe08DA85292fFD22198925": {
    "address": "0xc2eEE8782B74289774Fe08DA85292fFD22198925",
    "name": "FARM_aARB-USDC",
    "symbol": "faARB-USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x6aDEBe9a4c8dF4E6BFd09263Ab7e2EdF67288763": {
    "address": "0x6aDEBe9a4c8dF4E6BFd09263Ab7e2EdF67288763",
    "name": "FARM_aWETH-USDT",
    "symbol": "faWETH-USDT",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x7f7e98E5FA2ef1dE3b747b55dd81f73960Ce92C2": {
    "address": "0x7f7e98E5FA2ef1dE3b747b55dd81f73960Ce92C2",
    "name": "FARM_aWETH-USDC",
    "symbol": "faWETH-USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xF1cB30700f55DaB9f5DB853715AD96935344B09F": {
    "address": "0xF1cB30700f55DaB9f5DB853715AD96935344B09F",
    "name": "FARM_aWETH-ARB",
    "symbol": "faWETH-ARB",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x95087E1BcA260a2c306cBAaa27D94584Ee648d57": {
    "address": "0x95087E1BcA260a2c306cBAaa27D94584Ee648d57",
    "name": "FARM_aUSDC-DAI",
    "symbol": "faUSDC-DAI",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x0ffDC684cb69FaE92F26631614f9d6632bb658A8": {
    "address": "0x0ffDC684cb69FaE92F26631614f9d6632bb658A8",
    "name": "FARM_aWETH-GMX",
    "symbol": "faWETH-GMX",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xd3Fa687F1F6E2384Ef92873Bed87533483a2ab37": {
    "address": "0xd3Fa687F1F6E2384Ef92873Bed87533483a2ab37",
    "name": "FARM_aGRAIL-WETH",
    "symbol": "faGRAIL-WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x8303509e16e7E0C194cC7BBA7f404b05A5503CEa": {
    "address": "0x8303509e16e7E0C194cC7BBA7f404b05A5503CEa",
    "name": "FARM_aWETH-LINK",
    "symbol": "faWETH-LINK",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x98bf083806B657EAF6B89Ab418Ccf9332F78E1fF": {
    "address": "0x98bf083806B657EAF6B89Ab418Ccf9332F78E1fF",
    "name": "FARM_aLUSD-USDC",
    "symbol": "faLUSD-USDC",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x03947616afaEDE57520E6564d63D4Eb11140a723": {
    "address": "0x03947616afaEDE57520E6564d63D4Eb11140a723",
    "name": "FARM_aUSDT-USDCe",
    "symbol": "faUSDT-USDCe",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0xb48eAD9B1A8Ade15cf4e562ebf0B49C384e3A832": {
    "address": "0xb48eAD9B1A8Ade15cf4e562ebf0B49C384e3A832",
    "name": "FARM_aWBTC-WETH",
    "symbol": "faWBTC-WETH",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x283D712e32B9465b1B9AFf14e902C75C8B999cF5": {
    "address": "0x283D712e32B9465b1B9AFf14e902C75C8B999cF5",
    "name": "FARM_wjAura",
    "symbol": "fwjAura",
    "decimals": 18,
    "logoURI": "https://icons.llama.fi/harvest-finance.png",
    "chainId": 42161
  },
  "0x2D0483FefAbA4325c7521539a3DFaCf94A19C472": {
    "address": "0x2D0483FefAbA4325c7521539a3DFaCf94A19C472",
    "name": "Interest Bearing FRAX",
    "symbol": "ibFRAX",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/FRAX.png",
    "chainId": 42161
  },
  "0x59a696bF34Eae5AD8Fd472020e3Bed410694a230": {
    "address": "0x59a696bF34Eae5AD8Fd472020e3Bed410694a230",
    "name": "VCX Call Option Token",
    "symbol": "oVCX",
    "decimals": 18,
    "logoURI": "https://app.vaultcraft.io/images/tokens/oVcx.svg",
    "chainId": 42161
  },
  "0xaF33642938172011f711bA530acc900Ae17620A7": {
    "address": "0xaF33642938172011f711bA530acc900Ae17620A7",
    "name": "Wrapped oVCX",
    "symbol": "woVCX",
    "decimals": 18,
    "logoURI": "https://app.vaultcraft.io/images/tokens/oVcx.svg",
    "chainId": 42161
  },
  "0xC1A6Db6793967Ff7fb7f211E044A4c285A0eB7FB": {
    "address": "0xC1A6Db6793967Ff7fb7f211E044A4c285A0eB7FB",
    "name": "Vote Locked VCX",
    "symbol": "veVCX",
    "decimals": 18,
    "logoURI": "https://app.vaultcraft.io/images/tokens/vcx.svg",
    "chainId": 42161
  },
  "0x18445923592be303fbd3BC164ee685C7457051b4": {
    "address": "0x18445923592be303fbd3BC164ee685C7457051b4",
    "name": "xVCX",
    "symbol": "xVCX",
    "decimals": 18,
    "logoURI": "https://app.vaultcraft.io/images/tokens/vcx.svg",
    "chainId": 42161
  },
  "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe": {
    "address": "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
    "name": "Wrapped eETH",
    "symbol": "weETH",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/etherfiweeth_32.png",
    "chainId": 42161
  },
  "0x02dB67e732748027293C2eaeb21C949d8DF3F6a8": {
    "address": "0x02dB67e732748027293C2eaeb21C949d8DF3F6a8",
    "name": "Beefy eUSD-USDC",
    "symbol": "moo-eUSD-USDC",
    "decimals": 18,
    "logoURI": "https://app.beefy.com/assets/BIFI-37d31208.png",
    "chainId": 42161
  },
  "0x42189E9E398fD830CFcca2FC1B2c84823d72C658": {
    "address": "0x42189E9E398fD830CFcca2FC1B2c84823d72C658",
    "name": "Beefy USD+/USDT+",
    "symbol": "moo-USD+USDT+",
    "decimals": 18,
    "logoURI": "https://app.beefy.com/assets/BIFI-37d31208.png",
    "chainId": 42161
  },
  "0xF2d3C18a13E0860de55B7201411D790473DF3caB": {
    "address": "0xF2d3C18a13E0860de55B7201411D790473DF3caB",
    "name": "Beefy USD+/FRAX/​USDC.e",
    "symbol": "moo-USD+FRAXUSDC.e",
    "decimals": 18,
    "logoURI": "https://app.beefy.com/assets/BIFI-37d31208.png",
    "chainId": 42161
  },
  "0x485cAC13E6492CcF4d47764b0E4e07b5272B0167": {
    "address": "0x485cAC13E6492CcF4d47764b0E4e07b5272B0167",
    "name": "Ipor USDC",
    "symbol": "ipUSDC",
    "decimals": 18,
    "logoURI": "https://app.ipor.io/tokens/usdc.svg",
    "chainId": 42161
  },
  "0x34a2b066AF16409648eF15d239E656edB8790ca0": {
    "address": "0x34a2b066AF16409648eF15d239E656edB8790ca0",
    "name": "Yearn PT-USDe",
    "symbol": "yPT-USDe",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/ethenausde_32.png",
    "chainId": 42161
  },
  "0x88cD2e60A549525e13bE59daED9E2F8eBb74174a": {
    "address": "0x88cD2e60A549525e13bE59daED9E2F8eBb74174a",
    "name": "Beefy MIM-USDC",
    "symbol": "moo-MIM-USDC",
    "decimals": 18,
    "logoURI": "https://app.beefy.com/assets/BIFI-37d31208.png",
    "chainId": 42161
  },
  "0x2651D82Bf8Cd7b2Eb021d97A34f059B47BA9A272": {
    "address": "0x2651D82Bf8Cd7b2Eb021d97A34f059B47BA9A272",
    "name": "Beefy MIM-USDT",
    "symbol": "moo-MIM-USDT",
    "decimals": 18,
    "logoURI": "https://app.beefy.com/assets/BIFI-37d31208.png",
    "chainId": 42161
  },
  "0x503ebD3E15A19C43F76A27263466be0C7fB4b401": {
    "address": "0x503ebD3E15A19C43F76A27263466be0C7fB4b401",
    "name": "Beefy sFRAX-4Pool",
    "symbol": "moo-sFRAX-4Pool",
    "decimals": 18,
    "logoURI": "https://app.beefy.com/assets/BIFI-37d31208.png",
    "chainId": 42161
  },
  "0xC66F3928D2653B82367B4B7B2d3E3B43f4A1f647": {
    "address": "0xC66F3928D2653B82367B4B7B2d3E3B43f4A1f647",
    "name": "Beefy USDe-USDC CLM",
    "symbol": "moo-USDe-USDC CLM",
    "decimals": 18,
    "logoURI": "https://app.beefy.com/assets/BIFI-37d31208.png",
    "chainId": 42161
  },
  "0x281fE15fd3E08A282f52D5cf09a4d13c3709E66D": {
    "address": "0x281fE15fd3E08A282f52D5cf09a4d13c3709E66D",
    "name": "Pendle USDe LP",
    "symbol": "pUSDE-LP",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/ethenausde_32.png",
    "chainId": 42161
  },
  "0xa877a0E177b54A37066c1786F91a1DAb68F094AF": {
    "address": "0xa877a0E177b54A37066c1786F91a1DAb68F094AF",
    "name": "Pendle gUSD LP",
    "symbol": "pgUSD-LP",
    "decimals": 18,
    "logoURI": "https://arbiscan.io/token/images/gainsgusdc_32.png",
    "chainId": 42161
  },
  "0xFeae6470A79b7779888f4a64af315Ca997D6cF33": {
    "address": "0xFeae6470A79b7779888f4a64af315Ca997D6cF33",
    "name": "wVCX",
    "symbol": "wVCX",
    "decimals": 18,
    "logoURI": "https://app.vaultcraft.io/images/tokens/vcx.svg",
    "chainId": 42161
  }
}

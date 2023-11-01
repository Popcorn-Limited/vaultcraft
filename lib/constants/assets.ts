import { TokenConstant } from "../types";

const assets: TokenConstant[] = [
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "1337": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "42161": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
    },
    "name": "Dai Stablecoin",
    "symbol": "DAI",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/DAI.png"
  },
  {
    "chains": [1, 1337, 42161, 137],
    "address": {
      "1": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "1337": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "42161": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      "137": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    },
    "name": "USD Coin",
    "symbol": "USDC",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png"
  },
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "1337": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "42161": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
    },
    "name": "Tether USD",
    "symbol": "USDT",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDT.png"
  },
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0x853d955aCEf822Db058eb8505911ED77F175b99e",
      "1337": "0x853d955aCEf822Db058eb8505911ED77F175b99e",
      "42161": "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F"
    },
    "name": "Frax",
    "symbol": "FRAX",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/FRAX.png"
  },
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
      "1337": "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
      "42161": "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b"
    },
    "name": "LUSD Stablecoin",
    "symbol": "LUSD",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/LUSD.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3",
      "1337": "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3",
      "42161": "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A"
    },
    "name": "Magic Internet Money",
    "symbol": "MIM",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/MIM.png"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
      "1337": "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51"
    },
    "name": "Synth USD",
    "symbol": "sUSD",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/SynthetixsUSD_32.png"
  },
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "1337": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "42161": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"
    },
    "name": "Wrapped BTC",
    "symbol": "WBTC",
    "decimals": 8,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/WBTC.png"
  },
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "1337": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "42161": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
    },
    "name": "Wrapped Ether",
    "symbol": "WETH",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/WETH.svg"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
      "1337": "0xae7ab96520de3a18e5e111b5eaab095312d7fe84"
    },
    "name": "Staked Ether",
    "symbol": "stETH",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/stETH.svg"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x383518188C0C6d7730D91b2c03a03C837814a899",
      "1337": "0x383518188C0C6d7730D91b2c03a03C837814a899"
    },
    "name": "Olympus",
    "symbol": "OHM",
    "decimals": 9,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/OHM.png"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0x2a8e1e676ec238d8a992307b495b45b3feaa5e86",
      "1337": "0x2a8e1e676ec238d8a992307b495b45b3feaa5e86"
    },
    "name": "Origin Dollar",
    "symbol": "oUSD",
    "decimals": 18,
    "logoURI": "https://icons.llamao.fi/icons/protocols/origin-dollar"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3",
      "1337": "0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3"
    },
    "name": "Origin Ether",
    "symbol": "oETH",
    "decimals": 18,
    "logoURI": "https://icons.llamao.fi/icons/protocols/origin-ether"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0xD533a949740bb3306d119CC777fa900bA034cd52",
      "1337": "0xD533a949740bb3306d119CC777fa900bA034cd52"
    },
    "name": "Curve",
    "symbol": "CRV",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/Curvefi_32.png"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0xba100000625a3754423978a60c9317c58a424e3D",
      "1337": "0xba100000625a3754423978a60c9317c58a424e3D"
    },
    "name": "Balancer",
    "symbol": "BAL",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/Balancer_32.png"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d",
      "1337": "0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d"
    },
    "name": "Stargate DAI",
    "symbol": "stgDAI",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/DAI.png"
  },
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56",
      "1337": "0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56",
      "42161": "0x892785f33CdeE22A30AEF750F285E18c18040c3e"
    },
    "name": "Stargate USDC",
    "symbol": "stgUSDC",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png"
  },
  {
    "chains": [1, 1337, 42161],
    "address": {
      "1": "0x38EA452219524Bb87e18dE1C24D3bB59510BD783",
      "1337": "0x38EA452219524Bb87e18dE1C24D3bB59510BD783",
      "42161": "0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641"
    },
    "name": "Stargate USDT",
    "symbol": "stgUSDT",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDT.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xfA0F307783AC21C39E939ACFF795e27b650F6e68",
      "1337": "0xfA0F307783AC21C39E939ACFF795e27b650F6e68",
      "42161": "0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C"
    },
    "name": "Stargate FRAX",
    "symbol": "stgFRAX",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/FRAX.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xE8F55368C82D38bbbbDb5533e7F56AfC2E978CC2",
      "1337": "0xE8F55368C82D38bbbbDb5533e7F56AfC2E978CC2",
      "42161": "0x600E576F9d853c95d58029093A16EE49646F3ca5"
    },
    "name": "Stargate LUSD",
    "symbol": "stgLUSD",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/LUSD.png"
  },
  {
    "chains": [],
    "address": {
      "42161": "0x68f5d998F00bB2460511021741D098c05721d8fF"
    },
    "name": "Hop DAI",
    "symbol": "hDAI",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/DAI.png"
  },
  {
    "chains": [],
    "address": {
      "42161": "0xB67c014FA700E69681a673876eb8BAFAA36BFf71"
    },
    "name": "Hop USDC",
    "symbol": "hUSDC",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png"
  },
  {
    "chains": [42161],
    "address": {
      "42161": "0xCe3B19D820CB8B9ae370E423B0a329c4314335fE"
    },
    "name": "Hop USDT",
    "symbol": "hUSDT",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDT.png"
  },
  {
    "chains": [],
    "address": {
      "1": "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",
      "1337": "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4"
    },
    "name": "Popcorn",
    "symbol": "POP",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/WETH.svg"
  },
  {
    "chains": [],
    "address": {
      "1": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
      "1337": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"
    },
    "name": "Matic",
    "symbol": "oETH",
    "decimals": 18,
    "logoURI": "https://icons.llamao.fi/icons/chains/rsz_polygon"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0x76FCf0e8C7Ff37A47a799FA2cd4c13cDe0D981C9",
      "1337": "0x76FCf0e8C7Ff37A47a799FA2cd4c13cDe0D981C9"
    },
    "name": "OHM / DAI LP ",
    "symbol": "b-ohm-dai-lp",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/OHM.png"
  }
]
export default assets;
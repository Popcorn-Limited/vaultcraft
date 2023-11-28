import { Asset } from "../types";

const assets: Asset[] = [
  {
    "chains": [1, 1337, 10, 42161],
    "address": {
      "1": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "1337": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "10": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      "42161": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
    },
    "name": "Dai Stablecoin",
    "symbol": "DAI",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/DAI.png"
  },
  {
    "chains": [1, 1337, 10, 42161, 137],
    "address": {
      "1": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "1337": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "42161": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      "10": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      "137": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    },
    "name": "USD Coin",
    "symbol": "USDC",
    "decimals": 6,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/USDC.png"
  },
  {
    "chains": [1, 1337, 10, 42161],
    "address": {
      "1": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "1337": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "10": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
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
    "chains": [1, 1337, 10, 42161],
    "address": {
      "1": "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
      "1337": "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
      "10": "0xc40F949F8a4e094D1b49a23ea9241D289B7b2819",
      "42161": "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b"
    },
    "name": "LUSD",
    "symbol": "LUSD",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/LUSD.png"
  },
  {
    "chains": [],
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
    "chains": [1, 1337, 10, 42161],
    "address": {
      "1": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "1337": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "10": "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
      "42161": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"
    },
    "name": "Wrapped BTC",
    "symbol": "WBTC",
    "decimals": 8,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/WBTC.png"
  },
  {
    "chains": [1, 1337, 10, 42161],
    "address": {
      "1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "1337": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "10": "0x4200000000000000000000000000000000000006",
      "42161": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
    },
    "name": "Wrapped Ether",
    "symbol": "WETH",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/WETH.svg"
  },
  {
    "chains": [],
    "address": {
      "1": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
      "1337": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
    },
    "name": "Matic Token",
    "symbol": "MATIC",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/MATIC.png"
  },
  {
    "chains": [],
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
    "chains": [],
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
    "chains": [],
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
    "chains": [42161],
    "address": {
      "42161": "0x68f5d998F00bB2460511021741D098c05721d8fF"
    },
    "name": "Hop DAI",
    "symbol": "hDAI",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/DAI.png"
  },
  {
    "chains": [42161],
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
    "logoURI": "/images/tokens/oEth.png"
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
    "chains": [1, 1337],
    "address": {
      "1": "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
      "1337": "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0"
    },
    "name": "Wrapped Staked Ether",
    "symbol": "wstETH",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/stETH.svg"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x514910771AF9Ca656af840dff83E8264EcF986CA"
    },
    "name": "Chainlink",
    "symbol": "LINK",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/chainlinktoken_32.png?v=6"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0x76FCf0e8C7Ff37A47a799FA2cd4c13cDe0D981C9",
      "1337": "0x76FCf0e8C7Ff37A47a799FA2cd4c13cDe0D981C9"
    },
    "name": "OHM / DAI LP",
    "symbol": "b-ohm-dai-lp",
    "decimals": 18,
    "logoURI": "https://cdn.furucombo.app/assets/img/token/OHM.png"
  },
  {
    "chains": [1, 1337],
    "address": {
      "1": "0xFCc5c47bE19d06BF83eB04298b026F81069ff65b",
      "1337": "0xFCc5c47bE19d06BF83eB04298b026F81069ff65b"
    },
    "name": "yCRV",
    "symbol": "yCRV",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/yearncrvnew_32.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x3175df0976dfa876431c2e9ee6bc45b65d3473cc"
    },
    "name": "FRAX / USDC LP",
    "symbol": "crvFRAX",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  }, {
    "chains": [1],
    "address": {
      "1": "0x06325440d014e39736583c165c2963ba99faf14e"
    },
    "name": "ETH / stETH LP",
    "symbol": "steCRV",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  }, {
    "chains": [1],
    "address": {
      "1": "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490"
    },
    "name": "3Pool",
    "symbol": "3CRV",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/3pool_32.png"
  }, {
    "chains": [1],
    "address": {
      "1": "0xf43211935c781d5ca1a41d2041f397b8a7366c7a"
    },
    "name": "ETH / frxETH LP ",
    "symbol": "crvFrxETH",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xc4ad29ba4b3c580e6d59105fff484999997675ff"
    },
    "name": "TryCripto2",
    "symbol": "crv3crypto",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x94b17476a93b3262d87b9a326965d1e91f9c13e7"
    },
    "name": "ETH / OETH LP",
    "symbol": "crvOETH",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x21e27a5e5513d6e65c4f830167390997aa84843a"
    },
    "name": "stETH-ng",
    "symbol": "crvStETH-ng",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xb30da2376f63de30b42dc055c93fa474f31330a5"
    },
    "name": "alUSDFRAXBP",
    "symbol": "alUSD FRAX USDC",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x4dece678ceceb27446b35c672dc7d61f30bad69e"
    },
    "name": "crvUSD/USDC",
    "symbol": "USDC crvUSD",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x390f3595bca2df7d23783dfd126427cceb997bf4"
    },
    "name": "crvUSD/USDT",
    "symbol": "USDT crvUSD",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xf5f5b97624542d72a9e06f04804bf81baa15e2b4"
    },
    "name": "TricryptoUSDT",
    "symbol": "USDT WBTC ETH",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x7f86bf177dd4f3494b841a37e810a34dd56c829b"
    },
    "name": "TricryptoUSDC",
    "symbol": "USDC WBTC ETH",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x971add32ea87f10bd192671630be3be8a11b8623"
    },
    "name": "cvxCrv/Crv",
    "symbol": "CRV cvxCRV",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x4704ab1fb693ce163f7c9d3a31b3ff4eaf797714"
    },
    "name": "FPI2Pool",
    "symbol": "FRAX FPI",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x5a6a4d54456819380173272a5e8e9b9904bdf41b"
    },
    "name": "mim",
    "symbol": "MIM DAI USDC USDT",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xc9c32cd16bf7efb85ff14e0c8603cc90f6f2ee49"
    },
    "name": "Bean",
    "symbol": "BEAN DAI USDC USDT",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/bean3crv_32.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xed279fdd11ca84beef15af5d39bb4d4bee23f0ca"
    },
    "name": "lusd",
    "symbol": "LUSD DAI USDC USDT",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xc25a3a3b969415c80451098fa907ec722572917f"
    },
    "name": "susd",
    "symbol": "DAI USDC USDT sUSD",
    "decimals": 18,
    "logoURI": "https://etherscan.io/token/images/Curvefi_sCrv_32.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xfd2a8fa60abd58efe3eee34dd494cd491dc14900"
    },
    "name": "aave",
    "symbol": "DAI USDC USDT",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xe57180685e3348589e9521aa53af0bcd497e884d"
    },
    "name": "DOLA/FRAXBP",
    "symbol": "DOLA FRAX USDC",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c"
    },
    "name": "alusd",
    "symbol": "alUSD DAI USDC USDT",
    "decimals": 18,
    "logoURI": "/images/icons/curve-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56"
    },
    "name": "Bal 80 Eth 20",
    "symbol": "BAL WETH",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x1E19CF2D73a72Ef1332C882F20534B6519Be0276"
    },
    "name": "rETH wETH",
    "symbol": "rETH WETH",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x20a61B948E33879ce7F23e535CC7BAA3BC66c5a9"
    },
    "name": "R DAI",
    "symbol": "R DAI",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x42ED016F826165C2e5976fe5bC3df540C5aD0Af7"
    },
    "name": "wstETH sfrxETH rETH",
    "symbol": "wstETH sfrxETH rETH",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x1ee442b5326009Bb18F2F472d3e0061513d1A0fF"
    },
    "name": "BADGER 50 rETH 50",
    "symbol": "BADGER rETH",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x87a867f5D240a782d43D90b6B06DEa470F3f8F22"
    },
    "name": "wstETH 50 COMP 50",
    "symbol": "wstETH COMP",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x3ff3a210e57cFe679D9AD1e9bA6453A716C56a2e"
    },
    "name": "USDC 50 STG 50",
    "symbol": "USDC STG",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x3dd0843A028C86e0b760b1A76929d1C5Ef93a2dd"
    },
    "name": "AuraBAL Stable Pool",
    "symbol": "B-80BAL-20WETH auraBAL",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0xE7e2c68d3b13d905BBb636709cF4DfD21076b9D2"
    },
    "name": "WETH swETH",
    "symbol": "WETH swETH",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  },
  {
    "chains": [1],
    "address": {
      "1": "0x32296969Ef14EB0c6d29669C550D4a0449130230"
    },
    "name": "wstETH WETH",
    "symbol": "wstETH WETH",
    "decimals": 18,
    "logoURI": "/images/icons/balancer-lp.png"
  }
]
export default assets;
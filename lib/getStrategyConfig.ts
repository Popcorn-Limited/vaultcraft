import { AdapterConfig, Asset, Strategy } from "@/lib/atoms";
import { constants, ethers } from "ethers";
import { mainnet } from "wagmi";

const CURVE_ROUTER = "0x99a58482BD75cbab83b27EC03CA68fF489b5788f"
const STARGATE_ROUTER = "0x8731d54E9D02c286767d56ac03e8037C07e01e98"

const STG = "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6"
const STG_USDC_POOL = "0x3211C6cBeF1429da3D0d58494938299C92Ad5860"
const THREE_POOL = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7"

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"


// SwapParam [i,j,swapType]
const CURVE_ROUTE_TYPE = "tuple(address[9] route, uint256[3][4] swapParams)"
const CURVE_COMPOUNDER_TYPE = [
  "address",
  "address",
  `${CURVE_ROUTE_TYPE}[]`,
  CURVE_ROUTE_TYPE,
  "uint256[]",
  "bytes"
]

interface CurveRoute { route: string[], swapParams: [number[], number[], number[], number[]] }

const BASE_STARGATE_DATA: [string, string, [CurveRoute], CurveRoute, [number], string] = [
  USDC,
  CURVE_ROUTER,
  [{
    route: [
      STG,
      STG_USDC_POOL,
      USDC,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero
    ],
    swapParams: [[0, 1, 3], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
  }],
  {
    route: [
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero,
      constants.AddressZero
    ],
    swapParams: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
  },
  [0],
  ethers.utils.defaultAbiCoder.encode(["address"], [STARGATE_ROUTER])
]

export default function getStrategyConfig(strategy: Strategy, adapter: string, asset: Asset, chainId: number): AdapterConfig {
  if (strategy.key === "none") return { id: "", data: "0x" }

  if (strategy.key === "CurveStargateCompounder" && chainId === mainnet.id && adapter === "StargateLpStakingAdapter") {
    let data: any;
    switch (asset.symbol) {
      case "stgUSDC":
        data = BASE_STARGATE_DATA;
        break;
      case "stgUSDT":
        data = BASE_STARGATE_DATA;
        data[0] = USDT;
        data[2][0].route[3] = THREE_POOL;
        data[2][0].route[4] = USDT;
        data[4][0] = 1;
        break;
      case "stgDAI":
        data = BASE_STARGATE_DATA;
        data[0] = DAI;
        data[2][0].route[3] = THREE_POOL;
        data[2][0].route[4] = DAI;
        data[4][0] = 3;
        break;
    }
    return {
      id: ethers.utils.formatBytes32String("CurveStargateCompounder"),
      data: ethers.utils.defaultAbiCoder.encode(
        CURVE_COMPOUNDER_TYPE,
        data
      )
    }
  }
  
  return { id: "", data: "0x" }
}
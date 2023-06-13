import { AdapterConfig, Asset, Strategy } from "@/lib/atoms";
import { constants, ethers } from "ethers";
import { mainnet } from "wagmi";

const CURVE_ROUTER = "0x99a58482BD75cbab83b27EC03CA68fF489b5788f"
const STARGATE_ROUTER = "0x8731d54E9D02c286767d56ac03e8037C07e01e98"

const STG = "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6"
const STG_USDC_POOL = "0x3211C6cBeF1429da3D0d58494938299C92Ad5860"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

const CURVE_ROUTE_TYPE = "tuple(address[9] route, uint256[3][4] swapParams)"
const CURVE_COMPOUNDER_TYPE = [
  "address",
  "address",
  `${CURVE_ROUTE_TYPE}[]`,
  CURVE_ROUTE_TYPE,
  "uint256[]",
  "bytes"
]

export default function getStrategyConfig(strategy: Strategy, adapter: string, asset: Asset, chainId: number): AdapterConfig {
  console.log("getStrategyConfig")
  console.log({ key: strategy.key === "CurveStargateCompounder", chainId: chainId === mainnet.id, adapter: adapter === "StargateLpStakingAdapter", asset: asset.symbol === "stgUSDC" })
  if (strategy.key === "none") return { id: "", data: "0x" }
  if (strategy.key === "CurveStargateCompounder" && chainId === mainnet.id && adapter === "StargateLpStakingAdapter" && asset.symbol === "stgUSDC") return {
    id: ethers.utils.formatBytes32String("CurveStargateCompounder"),
    data: ethers.utils.defaultAbiCoder.encode(
      CURVE_COMPOUNDER_TYPE,
      [
        asset.address[chainId],
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
      ])
  }
  return { id: "", data: "0x" }
}
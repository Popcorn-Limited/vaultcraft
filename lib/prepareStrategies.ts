import { Address, erc20Abi, PublicClient } from "viem";
import axios from "axios";
import { LlamaApy, VaultDataByAddress, StrategyByAddress, Strategy } from "@/lib/types";
import { AnyToAnyDepositorAbi, VaultAbi, LeverageLooperAbi } from "@/lib/constants";
import { EMPTY_LLAMA_APY_ENTRY, getApy, getCustomApy } from "@/lib/resolver/apy";

export default async function prepareStrategies(vaults: VaultDataByAddress, chainId: number, client: PublicClient): Promise<StrategyByAddress> {
  const uniqueStrategyAdresses: Address[] = [];
  Object.values(vaults).forEach((vault) => {
    vault.strategies.forEach((strategy: any) => {
      if (!uniqueStrategyAdresses.includes(strategy.address)) {
        uniqueStrategyAdresses.push(strategy.address);
      }
    })
  });

  const { data: strategyDescriptions } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${chainId}.json`
  );

  // @ts-ignore
  const strategyRes = await client.multicall({
    contracts: uniqueStrategyAdresses
      .map((address: Address) => {
        return [
          {
            address: address,
            abi: VaultAbi,
            functionName: "totalAssets"
          },
          {
            address: address,
            abi: VaultAbi,
            functionName: "totalSupply"
          },
          {
            address: strategyDescriptions[address].asset,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address]
          },
          {
            address,
            abi: AnyToAnyDepositorAbi,
            functionName: "totalReservedAssets",
          },
          {
            address,
            abi: LeverageLooperAbi,
            functionName: "getLTV"
          }
        ]
      })
      .flat(),
    allowFailure: true,
  });

  let strategies: StrategyByAddress = {}

  await Promise.all(
    // We use map here since Promise.all doesnt work on a forEach
    uniqueStrategyAdresses.map(async (address, i) => {
      if (i > 0) i = i * 5;

      const totalAssets = strategyRes[i].result as bigint || BigInt(0);
      const totalSupply = strategyRes[i + 1].result as bigint || BigInt(0);
      const assetsPerShare =
        totalSupply > 0 ? Number(totalAssets) / Number(totalSupply) : 1;

      const desc = strategyDescriptions[address]
      let apy: LlamaApy;
      let apyHist: LlamaApy[] = []

      try {
        const strategyApy = desc.apySource === "custom" ? await getCustomApy(address, desc.apyId, chainId) : await getApy(desc.apyId)
        apy = strategyApy[strategyApy.length - 1];
        apyHist = strategyApy;
      } catch (e) {
        console.log(`ERROR FETCHING APY: ${address} - ${desc.apySource}=${desc.apyId}`)
        console.log(e)
        apy = EMPTY_LLAMA_APY_ENTRY
        apyHist = [EMPTY_LLAMA_APY_ENTRY]
      }
      const descriptionSplit = desc.description.split("** - ");

      strategies[address] = {
        address,
        asset: desc.asset,
        yieldToken: desc.yieldToken || undefined,
        metadata: {
          name: descriptionSplit[0].slice(2),
          protocol: desc.name,
          description: descriptionSplit[1],
          type: desc.type ?? "Vanilla",
        },
        apyData: {
          targetApy: apy.apy,
          baseApy: apy.apyBase,
          rewardApy: apy.apyReward,
          totalApy: apy.apy,
          apyHist: apyHist,
          apyId: desc.apyId,
          apySource: desc.apySource
        },
        resolver: desc.resolver,
        allocation: BigInt(0),
        allocationPerc: 0,
        totalAssets: totalAssets,
        totalSupply: totalSupply,
        assetsPerShare: assetsPerShare,
        idle: ["AnyToAnyV1", "AnyToAnyCompounderV1"].includes(desc.type) ? (strategyRes[i + 2].result as bigint || BigInt(0)) - (strategyRes[i + 3].result as bigint || BigInt(0)) : totalAssets,
        leverage: desc.type === "LeverageV1" ? 1e18 / (1e18 - Number(strategyRes[i + 4].result)) : undefined
      } as Strategy
    })
  )
  return strategies
}
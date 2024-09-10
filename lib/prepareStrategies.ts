import { Address, erc20Abi, PublicClient } from "viem";
import { LlamaApy, VaultDataByAddress, StrategyByAddress } from "@/lib/types";
import { AnyToAnyDepositorAbi, VaultAbi } from "@/lib/constants";
import axios from "axios";
import { EMPTY_LLAMA_APY_ENTRY, getApy, getCustomApy } from "@/lib/resolver/apy";
import { LeverageLooperAbi } from "./constants/abi/LeverageLooper";

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

      const totalAssets = Number(strategyRes[i].result!);
      const totalSupply = Number(strategyRes[i + 1].result!);
      const assetsPerShare =
        totalSupply > 0 ? totalAssets / totalSupply : Number(1);

      const desc = strategyDescriptions[address]
      let apy = 0;
      let apyHist: LlamaApy[] = []

      try {
        const strategyApy = desc.apySource === "custom" ? await getCustomApy(address, desc.apyId, chainId) : await getApy(desc.apyId)
        apy = strategyApy[strategyApy.length - 1].apy;
        apyHist = strategyApy;
      } catch (e) {
        console.log(`ERROR FETCHING APY: ${address} - ${desc.apySource}=${desc.apyId}`)
        console.log(e)
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
        resolver: desc.resolver,
        allocation: 0,
        allocationPerc: 0,
        apy,
        apyHist,
        apyId: desc.apyId,
        apySource: desc.apySource,
        totalAssets,
        totalSupply,
        assetsPerShare,
        idle: ["AnyToAnyV1", "AnyToAnyCompounderV1"].includes(desc.type) ? Number(strategyRes[i + 2].result!) - Number(strategyRes[i + 3].result!) : totalAssets,
        leverage: desc.type === "LeverageV1" ? 1e18 / (1e18 - Number(strategyRes[i + 4].result)) : undefined
      }
    })
  )
  return strategies
}
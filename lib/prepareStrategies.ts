import { Address, erc20Abi, PublicClient } from "viem";
import { LlamaApy, Strategy, VaultDataByAddress, StrategyByAddress } from "@/lib/types";
import { VaultAbi } from "@/lib/constants";
import axios from "axios";
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

  // Get TotalAssets and TotalSupply and idle cash
  // @ts-ignore
  const taAndTs = await client.multicall({
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
          }
        ]
      })
      .flat(),
    allowFailure: false,
  });

  let strategies: StrategyByAddress = {}

  await Promise.all(
    // We use map here since Promise.all doesnt work on a forEach
    uniqueStrategyAdresses.map(async (address, i) => {
      if (i > 0) i = i * 3;

      const totalAssets = Number(taAndTs[i]);
      const totalSupply = Number(taAndTs[i + 1]);
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
        yieldAsset: desc.yieldAsset || undefined,
        metadata: {
          name: descriptionSplit[0],
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
        idle: desc.type === "AnyToAnyV1" ? Number(taAndTs[i + 2]) : totalAssets
      }
    })
  )
  return strategies
}
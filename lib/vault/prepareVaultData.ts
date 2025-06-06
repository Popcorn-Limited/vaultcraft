import {
  Address,
  PublicClient,
  createPublicClient,
  erc20Abi,
  formatEther,
  getAddress,
  http,
  parseAbiItem,
  parseEther,
  zeroAddress,
} from "viem";
import axios from "axios";
import { VaultAbi } from "@/lib/constants/abi/Vault";
import {
  ApyData,
  Strategy,
  TokenByAddress,
  VaultData,
  VaultDataByAddress,
  VaultLabel,
  VaultMetadata,
  StrategyMetadata,
  LlamaApy,
} from "@/lib/types";
import {
  ERC20Abi,
  OracleVaultAbi,
  SECONDS_PER_YEAR,
  VaultOracleByChain,
  VeTokenByChain,
  ORACLES_DEPLOY_BLOCK,
  AssetPushOracleAbi,
  VaultOracleV2ByChain,
} from "@/lib/constants";
import getGaugesData from "@/lib/gauges/getGaugeData";
import { EMPTY_LLAMA_APY_ENTRY, getApy } from "@/lib/resolver/apy";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { daysDifferenceUTC, getLogsFromBlock, returnBigIntResult } from "@/lib/utils/helpers";

export async function getInitialVaultsData(
  chainId: number,
  client: PublicClient
): Promise<VaultDataByAddress> {
  const { data: allVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/${chainId}.json`
  );

  const { data: hiddenVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/hidden/${chainId}.json`
  );

  const filteredVaults = Object.values(allVaults)
    .filter((vault: any) => !hiddenVaults.includes(vault.address))
    .filter((vault: any) => vault.type !== "single-asset-lock-vault-v1");

  let result: VaultDataByAddress = {};
  filteredVaults.forEach((vault: any, i: number) => {
    result[getAddress(vault.address)] = {
      address: getAddress(vault.address),
      vault: getAddress(vault.address),
      asset: getAddress(vault.assetAddress),
      gauge: getAddress(vault.gauge || zeroAddress),
      safes: vault.safes
        ? vault.safes.map((safe: Address) => getAddress(safe))
        : [zeroAddress],
      chainId: vault.chainId,
      fees: vault.fees,
      totalAssets: BigInt(0),
      totalSupply: BigInt(0),
      assetsPerShare: 0,
      depositLimit: BigInt(0),
      withdrawalLimit: BigInt(0),
      minLimit: BigInt(0),
      tvl: 0,
      apyData: {
        targetApy: 0,
        baseApy: 0,
        rewardApy: 0,
        totalApy: 0,
        apyHist: [],
        apyId: vault.apyId,
        apySource: vault.apyId ? "defillama" : undefined,
      } as ApyData,
      gaugeData: undefined,
      metadata: {
        vaultName: vault.name ? vault.name : undefined,
        labels: vault.labels
          ? vault.labels.map((label: string) => <VaultLabel>label)
          : undefined,
        description: vault.description || undefined,
        riskDescription: vault.riskDescription || undefined,
        otherDescription: vault.otherDescription || undefined,
        type: vault.type,
        creator: getAddress(vault.creator || zeroAddress),
        feeRecipient: getAddress(vault.feeRecipient || zeroAddress),
      } as VaultMetadata,
      strategies: vault.strategies.map((strategy: Address) => {
        return {
          address: getAddress(strategy),
          asset: getAddress(vault.assetAddress),
          yieldToken: undefined,
          metadata: {
            name: "",
            protocol: "",
            description: "",
            type: "Vanilla",
          } as StrategyMetadata,
          resolver: "",
          allocation: BigInt(0),
          allocationPerc: 0,
          apyData: {
            targetApy: 0,
            baseApy: 0,
            rewardApy: 0,
            totalApy: 0,
            apyHist: [EMPTY_LLAMA_APY_ENTRY],
            apyId: "",
            apySource: "custom",
          } as ApyData,
          totalAssets: BigInt(0),
          totalSupply: BigInt(0),
          assetsPerShare: 0,
          idle: BigInt(0),
        } as Strategy;
      }),
      idle: BigInt(0),
      liquid: BigInt(0),
      points: vault.points ? vault.points : [],
    };
  });

  return result;
}

export async function addDynamicVaultsData(
  vaults: VaultDataByAddress,
  client: PublicClient
): Promise<VaultDataByAddress> {
  // @ts-ignore
  const dynamicValues = await client.multicall({
    contracts: Object.values(vaults)
      .map((vault: VaultData) => {
        return vaults[vault.address].metadata.type.includes("safe-vault")
          ? [
              {
                address: vault.address,
                abi: VaultAbi,
                functionName: "totalAssets",
              },
              {
                address: vault.address,
                abi: VaultAbi,
                functionName: "totalSupply",
              },
              {
                address: vault.address,
                abi: OracleVaultAbi,
                functionName: "limits",
              },
              {
                address: vault.asset,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [vault.safes![0]],
              },
            ]
          : [
              {
                address: vault.address,
                abi: VaultAbi,
                functionName: "totalAssets",
              },
              {
                address: vault.address,
                abi: VaultAbi,
                functionName: "totalSupply",
              },
              {
                address: vault.address,
                abi: VaultAbi,
                functionName: "depositLimit",
              },
              {
                address: vault.asset,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [vault.address],
              },
            ];
      })
      .flat(),
    allowFailure: true,
  });

  Object.values(vaults).forEach((vault: any, i: number) => {
    if (i > 0) i = i * 4;
    const totalSupply = vault.address === "0x77e88cA17A6D384DCBB13747F6767F30e3753e63" ? BigInt(0) : returnBigIntResult(dynamicValues[i + 1]);

    let totalAssets = vault.address === "0x77e88cA17A6D384DCBB13747F6767F30e3753e63" ? BigInt(0) : returnBigIntResult(dynamicValues[i]);
  
    vaults[vault.address].totalAssets = totalAssets;
    vaults[vault.address].totalSupply = totalSupply;
    vaults[vault.address].withdrawalLimit = totalSupply;
    vaults[vault.address].assetsPerShare =
      totalSupply > 0 ? Number(totalAssets) / Number(totalSupply) : 1;
    vaults[vault.address].idle = returnBigIntResult(dynamicValues[i + 3]);

    if (vaults[vault.address].metadata.type.includes("safe-vault")) {
      // @ts-ignore
      vaults[vault.address].depositLimit =
        dynamicValues[i + 2].status === "success"
          ? // @ts-ignore
            (dynamicValues[i + 2].result[0] as unknown as bigint)
          : BigInt(0);
      // @ts-ignore
      vaults[vault.address].minLimit =
        dynamicValues[i + 2].status === "success"
          ? // @ts-ignore
            (dynamicValues[i + 2].result[1] as unknown as bigint)
          : BigInt(0);
      vaults[vault.address].liquid = returnBigIntResult(dynamicValues[i + 3]);
    } else {
      vaults[vault.address].depositLimit = returnBigIntResult(
        dynamicValues[i + 2]
      );
    }
  });

  return vaults;
}

async function getSafeVaultApy(vault: VaultData): Promise<LlamaApy[]> {
  const client = createPublicClient({
    chain: ChainById[vault.chainId],
    transport: http(RPC_URLS[vault.chainId]),
  });

  const latestBlock = await client.getBlockNumber();
  const initialBlock = await getLogsFromBlock(latestBlock, ORACLES_DEPLOY_BLOCK[vault.chainId], vault.chainId);
  const fromBlock = initialBlock === BigInt(0) ? "earliest" : initialBlock;

  const logs = await client.getContractEvents({
    address:
      vault.metadata.type === "safe-vault-v1.5"
        ? VaultOracleV2ByChain[vault.chainId]
        : VaultOracleByChain[vault.chainId],
    abi: AssetPushOracleAbi,
    eventName: "PriceUpdated",
    fromBlock,
    toBlock: latestBlock
  });

  if (logs.length === 0) return [];

  const filteredLogs = logs.filter(
    (log) => log.args.base === vault.address && log.args.quote === vault.asset
  );

  let firstTimestamp = Number(
    (
      await client.getBlock({
        blockNumber: filteredLogs[0].blockNumber,
      })
    ).timestamp
  );

  // If there is only one log, we can't calculate the apy, so we use the base apy and reward apy from the vault address
  if (filteredLogs.length === 1)
    return [
      {
        apy:
          (vaultAddressToBaseApy[vault.address] || 0) +
          (vaultAddressToRewardApy[vault.address] || 0),
        apyBase: vaultAddressToBaseApy[vault.address] || 0,
        apyReward: vaultAddressToRewardApy[vault.address] || 0,
        tvl: vault.tvl,
        date: new Date(firstTimestamp * 1000),
      },
    ];

  const daysPast = daysDifferenceUTC(
    new Date(firstTimestamp * 1000),
    new Date()
  );
  const entries: LlamaApy[] = Array.from({ length: daysPast }, (_, i) => ({
    apy:
      (vaultAddressToBaseApy[vault.address] || 0) +
      (vaultAddressToRewardApy[vault.address] || 0),
    apyBase: vaultAddressToBaseApy[vault.address] || 0,
    apyReward: vaultAddressToRewardApy[vault.address] || 0,
    tvl: vault.tvl,
    date: new Date(firstTimestamp * 1000 - i * 86400 * 1000),
  }));

  return entries;
}

const vaultAddressToBaseApy: { [key: Address]: number } = {
  "0xEF4a9Ee0CD2a897bC0aF93E5aCD0C0324568A065": 6.09,
  "0x27d47664e034f3F2414d647DE7Cd1c1e8E72a89c": 10.16,
  "0xFdBa40D5502CbA8163b09955c7AbbBAFC349BCbE": 10.09,
  "0xcF9273BA04b875F94E4A9D8914bbD6b3C1f08EDb": 10.09,
  "0xB64D29F6AB71A11e55953a6EE030A92E6ACB8814": 10.09,
};

const vaultAddressToRewardApy: { [key: Address]: number } = {
  "0xEF4a9Ee0CD2a897bC0aF93E5aCD0C0324568A065": 9.81,
  "0x27d47664e034f3F2414d647DE7Cd1c1e8E72a89c": 2.04,
};

export async function addApyHist(
  vaults: VaultDataByAddress
): Promise<VaultDataByAddress> {
  const apyHistAll = await Promise.all(
    Object.values(vaults).map(async (vault: VaultData) => {
      if (vault.apyData.apyId?.length > 0) {
        return getApy(vault.apyData.apyId);
      } else if (vault.metadata.type.includes("safe-vault")) {
        return getSafeVaultApy(vault);
      } else {
        return [];
      }
    })
  );

  Object.values(vaults).forEach((vault: any, i: number) => {
    let hist = apyHistAll[i];

    // // Cut off the first few days to normalise the apy chart (first few days of a new vault with low deposits arent representable)
    // if (hist.length > 10) {
    //   hist = hist.slice(10, hist.length - 1)
    // }

    vaults[vault.address].apyData.apyHist = hist;
    if (hist.length > 0) {
      vaults[vault.address].apyData.baseApy = hist[hist.length - 1].apyBase;
      vaults[vault.address].apyData.rewardApy = hist[hist.length - 1].apyReward;
      vaults[vault.address].apyData.totalApy = hist[hist.length - 1].apy;
      vaults[vault.address].apyData.targetApy = hist[hist.length - 1].apy;
    }
  });

  return vaults;
}

export async function addStrategyData(
  vaults: VaultDataByAddress,
  strategies: { [key: Address]: Strategy },
  client: PublicClient
): Promise<VaultDataByAddress> {
  const strategyBalances = await client.multicall({
    contracts: Object.values(vaults)
      .map((vault: any) =>
        vault.strategies.map((strategy: any) => {
          return {
            address: strategy.address,
            abi: ERC20Abi,
            functionName: "balanceOf",
            args: [vault.address],
          };
        })
      )
      .flat(),
    allowFailure: true,
  });

  let n = 0;
  Object.keys(vaults).forEach((address: any) => {
    if (vaults[address].metadata.type.includes("safe-vault")) {
      const safeVault = vaults[address];
      const lastApy =
        safeVault.apyData.apyHist.length > 0
          ? safeVault.apyData.apyHist[safeVault.apyData.apyHist.length - 1]
          : EMPTY_LLAMA_APY_ENTRY;

      safeVault.apyData.baseApy = lastApy.apyBase;
      safeVault.apyData.rewardApy = lastApy.apyReward;
      safeVault.apyData.totalApy = lastApy.apy;
      safeVault.apyData.targetApy = lastApy.apy;
      return;
    }

    let apyBase = 0;
    let apyRewards = 0;
    let liquid = BigInt(0);

    if (vaults[address].strategies.length === 0) {
      vaults[address].strategies[0] = {
        address: zeroAddress,
        asset: vaults[address].asset,
        yieldToken: undefined,
        metadata: {
          name: "Stake",
          protocol: "VaultCraft",
          description: "This vault holds funds to incentivise via gauges.",
          type: "Vanilla",
        },
        resolver: "",
        allocation: vaults[address].totalAssets,
        allocationPerc: 1,
        apyData: {
          targetApy: 0,
          baseApy: 0,
          rewardApy: 0,
          totalApy: 0,
          apyHist: [EMPTY_LLAMA_APY_ENTRY],
          apyId: "",
          apySource: "custom",
        },
        totalAssets: vaults[address].totalAssets,
        totalSupply: vaults[address].totalSupply,
        assetsPerShare: vaults[address].assetsPerShare,
        idle: vaults[address].totalAssets,
      };
      liquid = vaults[address].totalAssets;
    } else {
      vaults[address].strategies.forEach((strategy: any, i: number) => {
        const strategyData = strategies[strategy.address];
        // calc allocation in assets
        const allocation =
          strategyData.totalSupply === BigInt(0)
            ? BigInt(0)
            : (returnBigIntResult(strategyBalances[n]) *
                strategyData.totalAssets) /
              strategyData.totalSupply;

        // calc allocation percentage
        const allocationPerc =
          Number(allocation) / Number(vaults[address].totalAssets) || 0;

        // Idle assets in the strategy accessiable by the vault
        const idle = ["AnyToAnyV1", "AnyToAnyCompounderV1"].includes(
          strategyData.metadata.type
        )
          ? strategyData.idle
          : allocation;

        // add strategy metadata
        vaults[address].strategies[i] = {
          ...strategyData,
          allocation,
          allocationPerc,
          idle,
        };

        // calc blended apy of the vault
        if (vaults[address].totalSupply === BigInt(0)) {
          // Assume even allocation if the vault doesnt have allocations yet
          apyBase +=
            strategyData.apyData.baseApy *
            (1 / vaults[address].strategies.length);
          apyRewards +=
            strategyData.apyData.rewardApy *
            (1 / vaults[address].strategies.length);
        } else {
          apyBase += strategyData.apyData.baseApy * allocationPerc;
          apyRewards += strategyData.apyData.rewardApy * allocationPerc;
          liquid += idle;
        }

        n += 1;
      });
    }

    // assign apy
    vaults[address].apyData.baseApy = apyBase;
    vaults[address].apyData.rewardApy = apyRewards;
    vaults[address].apyData.totalApy = apyBase + apyRewards;
    vaults[address].apyData.targetApy = apyBase + apyRewards;
    vaults[address].liquid = liquid + vaults[address].idle;
    vaults[address].withdrawalLimit = BigInt(
      Math.ceil(
        Number(liquid + vaults[address].idle) / vaults[address].assetsPerShare
      )
        .toLocaleString("fullwide", { useGrouping: false })
        .replace(",", ".")
    );
  });

  return vaults;
}

export async function addSafeStrategyData(
  vaults: VaultDataByAddress,
  chainId: number,
  client: PublicClient
): Promise<VaultDataByAddress> {
  const { data: safeStrategies } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/strategies/safe/${chainId}.json`
  );

  Object.keys(safeStrategies).forEach((address: string) => {
    const vaultAddress = getAddress(address);
    const strategies = safeStrategies[address];

    if (!vaults[vaultAddress]) return;

    vaults[vaultAddress].strategies = strategies.map((strategy: any) => {
      const allocation =
        (vaults[vaultAddress].totalAssets * BigInt(strategy.allocationPerc)) /
        BigInt(100);
      return {
        address: strategy.address,
        asset: vaults[vaultAddress].asset,
        yieldToken:
          strategy.yieldToken === zeroAddress ? undefined : strategy.yieldToken,
        metadata: strategy.metadata,
        resolver: strategy.resolver,
        allocation: allocation,
        allocationPerc: strategy.allocationPerc / 100,
        apyData: {
          targetApy: 0,
          baseApy: 0,
          rewardApy: 0,
          totalApy: 0,
          apyHist: [EMPTY_LLAMA_APY_ENTRY],
          apyId: "",
          apySource: "custom",
        },
        totalAssets: allocation,
        totalSupply: allocation,
        assetsPerShare: 1,
        idle: BigInt(0),
        leverage: strategy.leverage,
        type: strategy.type,
      } as Strategy;
    });
  });

  return vaults;
}

export async function addGaugeData(
  vaultsData: VaultDataByAddress,
  assets: TokenByAddress,
  gauges: TokenByAddress,
  account: Address,
  chainId: number
): Promise<VaultDataByAddress> {
  const gaugesData = await getGaugesData({
    vaultsData,
    assets,
    account,
    chainId,
    veToken: assets[VeTokenByChain[chainId]],
    gauges,
    addUserData: true,
  });

  gaugesData.forEach((gaugeData) => {
    const vault = vaultsData[gaugeData.vault];

    if (vault) {
      vault.apyData.totalApy +=
        gaugeData.upperAPR + gaugeData.rewardApy.apy || 0;
      vault.gaugeData = gaugeData;

      vaultsData[vault.address] = vault;
    }
  });

  return vaultsData;
}

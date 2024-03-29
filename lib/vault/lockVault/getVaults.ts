import {
  FraxLendAbi,
  StakingVaultAbi,
  VaultAbi,
  VaultRegistryAbi,
} from "@/lib/constants";
import {
  Address,
  Chain,
  PublicClient,
  createPublicClient,
  http,
  zeroAddress,
} from "viem";
import axios from "axios";
import { LockVaultData, Token, VaultLabel } from "@/lib/types";
import { RPC_URLS } from "@/lib/utils/connectors";

interface CalcRewardProps {
  accruedRewards: number;
  rewardShares: number;
  userIndex: number;
  globalIndex: number;
  decimals: number;
}

function calcRewards({
  accruedRewards,
  rewardShares,
  userIndex,
  globalIndex,
  decimals,
}: CalcRewardProps) {
  if (rewardShares == 0) return 0;

  const delta = globalIndex - userIndex;

  return accruedRewards + (rewardShares * delta) / 10 ** decimals;
}

export default async function getLockVaultsByChain({
  chain,
  account,
}: {
  chain: Chain;
  account: Address;
}): Promise<LockVaultData[]> {
  const publicClient = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id]),
  });
  return getVaults({ account, publicClient });
}

async function getVaults({
  account,
  publicClient,
}: {
  account: Address;
  publicClient: PublicClient;
}): Promise<LockVaultData[]> {
  let depracatedAddresses = (await publicClient.readContract({
    address: "0x25172C73958064f9ABc757ffc63EB859D7dc2219",
    abi: VaultRegistryAbi,
    functionName: "getRegisteredAddresses",
  })) as Address[];
  let addresses = (await publicClient.readContract({
    address: "0x58A2704deA4168D307EFF593E897eC73C6670F6A",
    abi: VaultRegistryAbi,
    functionName: "getRegisteredAddresses",
  })) as Address[];

  // @dev -- remove test vault
  addresses = [
    ...addresses,
    ...depracatedAddresses.filter(
      (address) => address !== "0x355d6ee7a1386d0659495d249E3cC085eC90Ba18"
    ),
  ];

  const { data: vaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/42161.json`
  );
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/42161.json`
  );
  const { data: assets } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/42161.json`
  );

  let result: any[] = addresses
    .map((address) => vaults[address])
    .map((vault) => {
      return {
        address: vault.address,
        vault: { ...vaultTokens[vault.address], balance: 0 },
        asset: { ...assets[vault.assetAddress], balance: 0 },
        chainId: vault.chainId,
        fees: vault.fees,
        strategies: vault.strategies,
        lock: {
          unlockTime: 0,
          rewardIndex: 0,
          amount: 0,
          rewardShares: 0,
        },
        metadata: {
          vaultName: vaultTokens[vault.address].name,
          creator: vault.creator,
          feeRecipient: vault.feeRecipient,
          optionalMetadata: {
            protocol: {
              name: "Frax",
              description:
                "**Lending** - The vault supplies assets into Fraxlend to earn interest.",
            },
          },
          labels: vault.labels
            ? vault.labels.map((label: string) => <VaultLabel>label)
            : undefined,
          description: vault.description || undefined,
          type: vault.type,
        },
      };
    });

  const uniqueAssetAdresses: Address[] = [];
  result.forEach((vault) => {
    if (!uniqueAssetAdresses.includes(vault.asset.address)) {
      uniqueAssetAdresses.push(vault.asset.address);
    }
  });

  const res1 = (await publicClient.multicall({
    contracts: result
      .map((vaultData) => {
        return [
          {
            address: vaultData.address,
            abi: StakingVaultAbi,
            functionName: "totalSupply",
          },
          {
            address: vaultData.strategies[0],
            abi: StakingVaultAbi,
            functionName: "balanceOf",
            args: [vaultData.address],
          },
          {
            address: vaultData.address,
            abi: StakingVaultAbi,
            functionName: "getRewardTokens",
          },
          {
            address: vaultData.address,
            abi: StakingVaultAbi,
            functionName: "getCurrIndices",
          },
          {
            address: vaultData.strategies[0],
            abi: FraxLendAbi,
            functionName: "currentRateInfo",
          },
        ];
      })
      .flat(),
    allowFailure: false,
  })) as any[];
  result.forEach((vaultData, i) => {
    if (i > 0) i = i * 5;
    vaultData.totalSupply = res1[i];
    vaultData.strategyShares = res1[i + 1];

    const rewardAddresses = res1[i + 2];
    vaultData.rewardAddresses = rewardAddresses;

    vaultData.rewards = rewardAddresses.map((address: Address, n: number) => {
      return {
        ...(assets[address] as Token),
        balance: 0,
        globalIndex: Number(res1[i + 3][n]),
      };
    });

    rewardAddresses.forEach((address: Address) => {
      if (!uniqueAssetAdresses.includes(address))
        uniqueAssetAdresses.push(address);
    });

    const apy = (Number(res1[i + 4][3]) * 31557600) / 1e16; // (borrowRate per second * seconds per year) / 1e18 * 100
    vaultData.apy = apy;
    vaultData.totalApy = apy;
  });

  const res2 = await publicClient.multicall({
    contracts: result
      .map((vaulData, i) => {
        return {
          address: vaulData.strategies[0],
          abi: VaultAbi,
          functionName: "previewRedeem",
          args: [vaulData.strategyShares],
        };
      })
      .flat(),
    allowFailure: false,
  });

  const { data: priceData } = await axios.get(
    `https://coins.llama.fi/prices/current/${String(
      uniqueAssetAdresses.map(
        // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
        (address) => `arbitrum:${address}`
      )
    )}`
  );
  result.forEach((vaultData, i) => {
    const totalAssets = res2[i];
    const assetsPerShare =
      Number(vaultData.totalSupply) > 0
        ? Number(totalAssets) / Number(vaultData.totalSupply)
        : 1;

    let assetPrice;
    // @dev -- manual override for ibFRAX
    if (
      vaultData.asset.address === "0x2D0483FefAbA4325c7521539a3DFaCf94A19C472"
    ) {
      assetPrice = 1.0149;
    } else {
      assetPrice = priceData.coins[`arbitrum:${vaultData.asset.address}`].price;
    }

    const pricePerShare = assetsPerShare * assetPrice;

    vaultData.totalAssets = totalAssets;
    vaultData.assetsPerShare = assetsPerShare;
    vaultData.assetPrice = assetPrice;
    vaultData.pricePerShare = pricePerShare;
    vaultData.tvl =
      Number(totalAssets) > 0
        ? (Number(totalAssets) * assetPrice) / 10 ** vaultData.asset.decimals
        : 0;

    vaultData.vault.price = pricePerShare;
    vaultData.asset.price = assetPrice;

    vaultData.rewards.forEach((reward: any) => {
      const rewardPrice = priceData.coins[`arbitrum:${reward.address}`].price;
      const rewardValuePerShare =
        ((reward.globalIndex / 10 ** reward.decimals) * rewardPrice) / 2;
      const rewardApy = (rewardValuePerShare / pricePerShare) * 100;

      reward.price = rewardPrice;
      reward.rewardApy = rewardApy;
      vaultData.totalApy += rewardApy;
    });
  });

  if (account !== zeroAddress) {
    const res3 = (await publicClient.multicall({
      contracts: result
        .map((vaultData, i) => {
          return [
            {
              address: vaultData.address,
              abi: StakingVaultAbi,
              functionName: "balanceOf",
              args: [account],
            },
            {
              address: vaultData.asset.address,
              abi: StakingVaultAbi,
              functionName: "balanceOf",
              args: [account],
            },
            {
              address: vaultData.address,
              abi: StakingVaultAbi,
              functionName: "locks",
              args: [account],
            },
            {
              address: vaultData.address,
              abi: StakingVaultAbi,
              functionName: "getAccruedRewards",
              args: [account],
            },
            {
              address: vaultData.address,
              abi: StakingVaultAbi,
              functionName: "getUserIndices",
              args: [account],
            },
          ];
        })
        .flat(),
      allowFailure: false,
    })) as any[];
    result.forEach(async (vaultData, i) => {
      if (i > 0) i = i * 5;
      vaultData.vault.balance = Number(res3[i]);
      vaultData.asset.balance = Number(res3[i + 1]);

      const unlockTime = Number(res3[i + 2][0]) * 1000;
      const rewardShares = Number(res3[i + 2][2]);
      vaultData.lock = {
        unlockTime: unlockTime,
        amount: Number(res3[i + 2][1]),
        rewardShares: rewardShares,
        daysToUnlock:
          unlockTime > 0 ? (unlockTime - Number(new Date())) / 86400000 : 0, // timeDiff / secondsPerDay * 1000 (ms)
      };

      vaultData.rewards.forEach(async (reward: any, n: number) => {
        const accruedRewards =
          res3[i + 3].length === 0 ? 0 : Number(res3[i + 3][n]);
        const userIndex = res3[i + 4].length === 0 ? 0 : Number(res3[i + 4][n]);
        reward.rewardBalance = calcRewards({
          accruedRewards,
          rewardShares,
          userIndex,
          globalIndex: reward.globalIndex,
          decimals: reward.decimals,
        });
        reward.balance = Number(
          await publicClient.readContract({
            address: reward.address,
            abi: VaultAbi,
            functionName: "balanceOf",
            args: [account],
          })
        );
      });
    });
  }
  return result;
}

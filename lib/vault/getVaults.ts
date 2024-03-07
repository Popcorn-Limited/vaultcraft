import {
  Address,
  Chain,
  ReadContractParameters,
  createPublicClient,
  getAddress,
  http,
  validateTypedData,
  zeroAddress,
} from "viem";
import { PublicClient } from "wagmi";
import axios from "axios";
import { VaultAbi } from "@/lib/constants/abi/Vault";
import { GaugeData, VaultData, VaultLabel } from "@/lib/types";
import { ADDRESS_ZERO, GAUGE_CONTROLLER } from "@/lib/constants";
import { RPC_URLS, networkMap } from "@/lib/utils/connectors";
import getGauges, { Gauge } from "@/lib/gauges/getGauges";
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";

const HIDDEN_VAULTS: Address[] = [
  "0xb6cED1C0e5d26B815c3881038B88C829f39CE949",
  "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340",
  "0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0x8bd3D95Ec173380AD546a4Bd936B9e8eCb642de1", // Sample Stargate Vault
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
  "0x860b717B360378E44A241b23d8e8e171E0120fF0", // R/Dai
  "0xBae30fBD558A35f147FDBaeDbFF011557d3C8bd2", // 50OHM - 50 DAI
  "0xa6fcC7813d9D394775601aD99874c9f8e95BAd78", // Automated Pool Token - Oracle Vault 3
];

function prepareVaultContract(
  vault: Address,
  asset: Address,
  account: Address
): ReadContractParameters[] {
  const vaultContract = {
    address: vault,
    abi: VaultAbi,
  };

  return [
    {
      ...vaultContract,
      functionName: "totalAssets",
    },
    {
      ...vaultContract,
      functionName: "totalSupply",
    },
    {
      ...vaultContract,
      functionName: "depositLimit",
    },
    {
      ...vaultContract,
      functionName: "balanceOf",
      args: [account],
    },
    {
      ...vaultContract,
      address: asset,
      functionName: "balanceOf",
      args: [account],
    },
  ];
}

interface GetVaultsByChainProps {
  chain: Chain;
  account?: Address;
  yieldOptions: YieldOptions;
}

export async function getVaultsByChain({
  chain,
  account,
  yieldOptions,
}: GetVaultsByChainProps): Promise<VaultData[]> {
  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id]),
  });
  return getVaults({ account, client, yieldOptions });
}

interface GetVaultsProps {
  account?: Address;
  client: PublicClient;
  yieldOptions: YieldOptions;
}

export async function getVaults({
  account = ADDRESS_ZERO,
  client,
  yieldOptions,
}: GetVaultsProps): Promise<VaultData[]> {
  const chainId = client.chain.id;

  const { data: allVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${chainId}.json`
  );
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/${chainId}.json`
  );
  const { data: assets } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/${chainId}.json`
  );
  const { data: strategyDescriptions } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${chainId}.json`
  );

  const result: any[] = Object.values(allVaults)
    .filter(
      (vault: any) =>
        vault.type === "single-asset-vault-v1" ||
        vault.type === "multi-strategy-vault-v1"
    )
    .filter((vault: any) => !HIDDEN_VAULTS.includes(vault.address))
    .map((vault: any) => {
      const stratDesc = strategyDescriptions[vault.strategies[0]];
      return {
        address: vault.address,
        vault: { ...vaultTokens[vault.address], balance: 0 },
        asset: { ...assets[vault.assetAddress], balance: 0 },
        chainId: vault.chainId,
        fees: vault.fees,
        metadata: {
          vaultName: vault.name ? vault.name : undefined,
          creator: vault.creator,
          feeRecipient: vault.feeRecipient,
          optionalMetadata: {
            protocol: {
              name: stratDesc.name,
              description: stratDesc.description,
            },
            resolver: stratDesc.resolver,
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

  const { data: priceData } = await axios.get(
    `https://coins.llama.fi/prices/current/${String(
      uniqueAssetAdresses.map(
        // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
        (address) => `${networkMap[chainId].toLowerCase()}:${address}`
      )
    )}`
  );

  const { data: beefyTokens } = await axios.get(
    "https://api.beefy.finance/tokens"
  );
  const { data: beefyPrices } = await axios.get(
    "https://api.beefy.finance/lps"
  );

  // Get vault addresses
  const res1 = await client.multicall({
    contracts: result
      .map((vault: any) =>
        prepareVaultContract(vault.address, vault.asset.address, account)
      )
      .flat(),
    allowFailure: false,
  });

  result.forEach((vault, i) => {
    if (i > 0) i = i * 5;
    const totalAssets = Number(res1[i]);
    const totalSupply = Number(res1[i + 1]);
    const assetsPerShare =
      totalSupply > 0 ? (totalAssets + 1) / (totalSupply + 1e9) : Number(1e-9);

    vault.totalAssets = totalAssets;
    vault.totalSupply = totalSupply;
    vault.assetsPerShare = assetsPerShare;
    vault.depositLimit = Number(res1[i + 2]);

    if (account !== zeroAddress) {
      vault.vault.balance = Number(res1[i + 3]);
      vault.asset.balance = Number(res1[i + 4]);
    }

    const key = `${networkMap[chainId].toLowerCase()}:${vault.asset.address}`;
    let assetPrice = Number(priceData.coins[key]?.price || 10);

    if (assetPrice === 10 && client.chain.id === 10) {
      const lpFound: any | undefined = Object.entries(beefyTokens["optimism"])
        .map((entry) => entry[1])
        .find(
          (token: any) =>
            getAddress(token.address) === getAddress(vault.asset.address)
        );

      if (!lpFound) assetPrice = 1;
      const beefyKey = Object.keys(beefyPrices).find(
        (key) => key === lpFound.oracleId
      );
      // @ts-ignore
      assetPrice = beefyPrices[beefyKey];
    }

    const pricePerShare = assetsPerShare * assetPrice;

    vault.assetPrice = assetPrice;
    vault.pricePerShare = pricePerShare;
    vault.tvl = (totalSupply * pricePerShare) / 10 ** vault.asset.decimals;
    vault.vault.price = pricePerShare * 1e9; // @dev normalize vault price for previews (watch this if errors occur)
    vault.asset.price = assetPrice;
  });

  // Add apy
  await Promise.all(
    result.map(async (vault, i) => {
      let apy = 0;
      try {
        const vaultYield = await yieldOptions.getApy({
          chainId: vault.chainId,
          protocol: vault.metadata.optionalMetadata.resolver as ProtocolName,
          asset: vault.asset.address,
        });
        apy = vaultYield.total;
      } catch (e) {}
      vault.apy = apy;
      vault.totalApy = apy;
    })
  );

  // Add gauges
  if (client.chain.id === 1) {
    const gauges = await getGauges({
      address: GAUGE_CONTROLLER,
      account: account,
      publicClient: client,
    });
    const gaugeApyData = (
      await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/gauge-apy-data.json`
      )
    ).data as GaugeData;
    await Promise.all(
      result.map(async (vault, i) => {
        const foundGauge = gauges.find(
          (gauge: Gauge) => gauge.lpToken === vault.address
        );
        const gauge = foundGauge
          ? {
              address: foundGauge.address,
              name: `${vault.vault.name}-gauge`,
              symbol: `st-${vault.vault.name}`,
              decimals: foundGauge.decimals,
              logoURI: "/images/tokens/vcx.svg", // wont be used, just here for consistency
              balance: account === zeroAddress ? 0 : foundGauge.balance,
              price: vault.pricePerShare * 1e9,
            }
          : undefined;

        let gaugeMinApy;
        let gaugeMaxApy;
        let totalApy = vault.totalApy;

        if (!!gauge) {
          gaugeMinApy = gaugeApyData[gauge.address]?.lowerAPR || 0;
          gaugeMaxApy = gaugeApyData[gauge.address]?.upperAPR || 0;
          totalApy += gaugeMaxApy;
        }

        vault.gauge = gauge;
        vault.totalApy = totalApy;
        vault.gaugeMinApy = gaugeMinApy;
        vault.gaugeMaxApy = gaugeMaxApy;
      })
    );
  }

  return result;
}

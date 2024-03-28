import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { FeeConfiguration, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount } from "wagmi";
import axios from "axios";
import { createPublicClient, extractChain, http, zeroAddress } from "viem";
import { VaultAbi } from "@/lib/constants";
import { RPC_URLS } from "@/lib/utils/connectors";
import * as chains from "viem/chains";
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import TabSelector from "@/components/common/TabSelector";
import VaultStrategyConfiguration from "@/components/vault/management/vault/strategy";
import VaultPausing from "@/components/vault/management/vault/pausing";
import VaultDepositLimit from "@/components/vault/management/vault/depositLimit";
import VaultFeeRecipient from "@/components/vault/management/vault/feeRecipient";
import VaultFeeConfiguration from "@/components/vault/management/vault/feeConfiguration";
import VaultFees from "@/components/vault/management/vault/fees";

export type Strategy = {
  name: string;
  description: string;
  resolver: string;
  apy: number;
};

export interface VaultSettings {
  proposedAdapter: Strategy;
  proposedAdapterTime: number;
  proposedFees: FeeConfiguration;
  proposedFeeTime: number;
  paused: boolean;
  feeBalance: number;
  accruedFees: number;
}

async function getVaultSettings(
  vault: VaultData,
  yieldOptions: YieldOptions
): Promise<VaultSettings> {
  const { data: strategyDescriptions } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${vault.chainId}.json`
  );

  const client = createPublicClient({
    chain: extractChain({
      chains: Object.values(chains),
      // @ts-ignore
      id: vault.chainId,
    }),
    transport: http(RPC_URLS[vault.chainId]),
  });

  const vaultContract = {
    address: vault.address,
    abi: VaultAbi,
  };

  const res = await client.multicall({
    contracts: [
      {
        ...vaultContract,
        functionName: "proposedAdapter",
      },
      {
        ...vaultContract,
        functionName: "proposedAdapterTime",
      },
      {
        ...vaultContract,
        functionName: "proposedFees",
      },
      {
        ...vaultContract,
        functionName: "proposedFeeTime",
      },
      {
        ...vaultContract,
        functionName: "paused",
      },
      {
        ...vaultContract,
        functionName: "balanceOf",
        args: [vault.metadata.feeRecipient],
      },
      {
        ...vaultContract,
        functionName: "accruedManagementFee",
      },
      {
        ...vaultContract,
        functionName: "accruedPerformanceFee",
      },
    ],
    allowFailure: false,
  });

  let proposedAdapter = {
    name: "None",
    description: "None",
    resolver: "None",
    apy: 0,
  };

  if (res[0] !== zeroAddress) {
    proposedAdapter = {
      name: strategyDescriptions[res[0]].name,
      description: strategyDescriptions[res[0]].description,
      resolver: strategyDescriptions[res[0]].resolver,
      apy: (
        await yieldOptions.getApy({
          chainId: vault.chainId,
          protocol: strategyDescriptions[res[0]].resolver as ProtocolName,
          asset: vault.asset,
        })
      ).total,
    };
  }

  return {
    proposedAdapter: proposedAdapter,
    proposedAdapterTime: Number(res[1]),
    proposedFees: {
      deposit: Number(res[2][0]),
      withdrawal: Number(res[2][1]),
      management: Number(res[2][2]),
      performance: Number(res[2][3]),
    },
    proposedFeeTime: Number(res[3]),
    paused: res[4],
    feeBalance: Number(res[5]),
    accruedFees: Number(res[6]) + Number(res[7]),
  };
}

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const { address: account } = useAccount();

  const [vaults, setVaults] = useAtom(vaultsAtom);
  const [vault, setVault] = useState<VaultData>();

  useEffect(() => {
    if (!vault && query && Object.keys(vaults).length > 0) {
      setVault(
        vaults[Number(query?.chainId)].find(vault => vault.address === query?.id)
      );
    }
  }, [vaults, query, vault]);

  const [settings, setSettings] = useState<VaultSettings>();

  useEffect(() => {
    if (vault && yieldOptions && !settings) {
      getVaultSettings(vault, yieldOptions).then((res) => setSettings(res));
    }
  }, [vault, yieldOptions, settings]);

  const [tab, setTab] = useState<string>("Strategy");

  function changeTab(tab: string) {
    setTab(tab);
  }

  return (
    <NoSSR>
      {vault ? (
        <section className="py-10 px-4 md:px-8 text-white">
          <AssetWithName vault={vault} />
          <>
            {account === vault.metadata.creator ? (
              <>
                <TabSelector
                  className="mt-6 mb-12"
                  availableTabs={[
                    "Strategy",
                    "Fee Configuration",
                    "Fee Recipient",
                    "Take Fees",
                    "Deposit Limit",
                    "Pausing",
                  ]}
                  activeTab={tab}
                  setActiveTab={changeTab}
                />
                {settings ? (
                  <div>
                    {tab === "Strategy" && (
                      <VaultStrategyConfiguration
                        vaultData={vault}
                        settings={settings}
                      />
                    )}
                    {tab === "Fee Configuration" && (
                      <VaultFeeConfiguration
                        vaultData={vault}
                        settings={settings}
                      />
                    )}
                    {tab === "Fee Recipient" && (
                      <VaultFeeRecipient
                        vaultData={vault}
                        settings={settings}
                      />
                    )}
                    {tab === "Deposit Limit" && (
                      <VaultDepositLimit
                        vaultData={vault}
                        settings={settings}
                      />
                    )}
                    {tab === "Take Fees" && (
                      <VaultFees vaultData={vault} settings={settings} />
                    )}
                    {tab === "Pausing" && (
                      <VaultPausing vaultData={vault} settings={settings} />
                    )}
                  </div>
                ) : (
                  <p className="text-white">Loading...</p>
                )}
              </>
            ) : (
              <p className="text-white">
                Only the Vault Creator ({vault.metadata.creator}) has access to
                this page.
              </p>
            )}
          </>
        </section>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </NoSSR>
  );
}

import TabSelector from "@/components/common/TabSelector";
import { AdminProxyByChain, MultiStrategyVaultAbi, VaultAbi, VaultControllerByChain } from "@/lib/constants";
import { VaultData, VaultV1Settings } from "@/lib/types";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { useEffect, useState } from "react";
import { createPublicClient, http, Address } from "viem";
import { useAccount } from "wagmi";
import VaultRebalance from "@/components/vault/management/vault/Rebalance";
import VaultStrategiesConfiguration from "@/components/vault/management/vault/Strategies";
import VaultStrategyConfiguration from "@/components/vault/management/vault/Strategy";
import VaultFeeConfiguration from "@/components/vault/management/vault/FeeConfiguration";
import VaultFeeRecipient from "@/components/vault/management/vault/FeeRecipient";
import VaultDepositLimit from "@/components/vault/management/vault/DepositLimit";
import VaultTakeFees from "@/components/vault/management/vault/Fees";
import VaultPausing from "@/components/vault/management/vault/Pausing";

const DEFAULT_TABS = [
  "Strategy",
  "Deposit Limit",
  "Pausing",
  "Fee Configuration",
  "Fee Recipient",
];

function getMulticalls(vault: VaultData) {
  const vaultContract = {
    address: vault.address,
    abi: vault.strategies.length > 1 ? MultiStrategyVaultAbi : VaultAbi,
  };
  const result = [
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
    {
      ...vaultContract,
      functionName: "owner",
    },
  ];

  if (vault.strategies.length > 1) {
    return [
      {
        ...vaultContract,
        functionName: "getProposedStrategies",
      },
      {
        ...vaultContract,
        functionName: "proposedStrategyTime",
      },
      ...result,
    ];
  } else {
    return [
      {
        ...vaultContract,
        functionName: "proposedAdapter",
      },
      {
        ...vaultContract,
        functionName: "proposedAdapterTime",
      },
      ...result,
    ];
  }
}

async function getVaultSettings(vault: VaultData,): Promise<VaultV1Settings> {
  const client = createPublicClient({
    chain: ChainById[vault.chainId],
    transport: http(RPC_URLS[vault.chainId]),
  });

  // @ts-ignore
  const res: any[] = await client.multicall({
    contracts: getMulticalls(vault),
    allowFailure: false,
  });

  return {
    proposedStrategies: vault.strategies.length > 1 ? res[0] : [res[0]],
    proposedStrategyTime: Number(res[1]),
    proposedFees: {
      deposit: res[2][0],
      withdrawal: res[2][1],
      management: res[2][2],
      performance: res[2][3],
    },
    proposedFeeTime: Number(res[3]),
    paused: res[4],
    feeBalance: Number(res[5]),
    accruedFees: Number(res[6]) + Number(res[7]),
    owner: res[8],
  };
}

export default function VaultsV1Settings({ vaultData }: { vaultData: VaultData, }): JSX.Element {
  const { address: account } = useAccount();
  const [settings, setSettings] = useState<VaultV1Settings>();
  const [callAddress, setCallAddress] = useState<Address>();

  const [availableTabs, setAvailableTabs] = useState<string[]>(DEFAULT_TABS);
  const [tab, setTab] = useState<string>("Strategy");

  useEffect(() => {
    getVaultSettings(vaultData).then(res => {
      setCallAddress(
        res.owner === AdminProxyByChain[vaultData.chainId]
          ? VaultControllerByChain[vaultData.chainId]
          : vaultData.address
      );
      setSettings(res);
    });

    let tabs = DEFAULT_TABS
    if (vaultData.metadata.type !== "multi-strategy-vault-v1") {
      tabs.push("Take Fees")
    }

    if (vaultData.strategies.length > 1) {
      tabs = ["Rebalance", ...tabs]
      setAvailableTabs(tabs)
      setTab("Rebalance");
    } else {
      setAvailableTabs(tabs);
    }
  }, [vaultData]);


  function changeTab(tab: string) {
    setTab(tab);
  }

  return (
    <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0 text-white">
      <h2 className="text-white font-bold text-2xl">Vault Settings</h2>
      <TabSelector
        className="mt-6 mb-12"
        availableTabs={availableTabs}
        activeTab={tab}
        setActiveTab={changeTab}
      />
      {settings && callAddress ? (
        <div>
          {tab === "Rebalance" && (
            <VaultRebalance
              vaultData={vaultData}
            />
          )}
          {tab === "Strategy" && (
            <>
              {vaultData.strategies.length > 1 ? (
                <VaultStrategiesConfiguration
                  vaultData={vaultData}
                  proposedStrategies={settings.proposedStrategies}
                  proposedStrategyTime={settings.proposedStrategyTime}
                  callAddress={callAddress}
                  disabled={account !== vaultData.metadata.creator}
                />
              ) : (
                <VaultStrategyConfiguration
                  vaultData={vaultData}
                  proposedStrategies={settings.proposedStrategies}
                  proposedStrategyTime={settings.proposedStrategyTime}
                  callAddress={callAddress}
                  disabled={account !== vaultData.metadata.creator}
                />
              )}
            </>
          )}
          {tab === "Fee Configuration" && (
            <VaultFeeConfiguration
              vaultData={vaultData}
              proposedFeeTime={settings.proposedFeeTime}
              callAddress={callAddress}
              disabled={account !== vaultData.metadata.creator}
            />
          )}
          {tab === "Fee Recipient" && (
            <VaultFeeRecipient
              vaultData={vaultData}
              callAddress={callAddress}
              disabled={account !== vaultData.metadata.creator}
            />
          )}
          {tab === "Deposit Limit" && (
            <VaultDepositLimit
              vaultData={vaultData}
              callAddress={callAddress}
              disabled={account !== vaultData.metadata.creator}
            />
          )}
          {tab === "Take Fees" && (
            <VaultTakeFees
              vaultData={vaultData}
              accruedFees={settings.accruedFees}
              callAddress={callAddress}
            />
          )}
          {tab === "Pausing" && (
            <VaultPausing
              vaultData={vaultData}
              paused={settings.paused}
              callAddress={callAddress}
              disabled={account !== vaultData.metadata.creator}
            />
          )}
        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </section>
  )
}
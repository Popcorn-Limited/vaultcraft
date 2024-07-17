import TabSelector from "@/components/common/TabSelector";
import { MultiStrategyVaultV2Abi } from "@/lib/constants";
import { VaultData, VaultV2Settings } from "@/lib/types";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { useAccount } from "wagmi";
import VaultRebalance from "@/components/vault/management/vault/Rebalance";
import VaultDepositLimit from "@/components/vault/management/vault/DepositLimit";
import VaultPausing from "@/components/vault/management/vault/Pausing";
import VaultDepositIndex from "@/components/vault/management/vault/DepositIndex";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import VaultWithdrawalQueue from "./WithdrawalQueue";

const DEFAULT_TABS = [
  "Rebalance",
  "Strategy",
  "Withdrawal Queue",
  "Deposit Index",
  "Deposit Limit",
  "Pausing"
];

function getMulticalls(vault: VaultData) {
  const vaultContract = {
    address: vault.address,
    abi: MultiStrategyVaultV2Abi,
  };
  return [
    {
      ...vaultContract,
      functionName: "getProposedStrategies",
    },
    {
      ...vaultContract,
      functionName: "proposedStrategyTime",
    },
    {
      ...vaultContract,
      functionName: "getWithdrawalQueue",
    },
    {
      ...vaultContract,
      functionName: "getProposedWithdrawalQueue",
    },
    {
      ...vaultContract,
      functionName: "depositIndex",
    },
    {
      ...vaultContract,
      functionName: "proposedDepositIndex",
    },
    {
      ...vaultContract,
      functionName: "paused",
    },
    {
      ...vaultContract,
      functionName: "owner",
    }
  ];
}

async function getVaultSettings(vault: VaultData): Promise<VaultV2Settings> {
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
    proposedStrategies: res[0],
    proposedStrategyTime: Number(res[1]),
    withdrawalQueue: res[2],
    proposedWithdrawalQueue: res[3],
    depositIndex: Number(res[4]),
    proposedDepositIndex: Number(res[5]),
    paused: res[6],
    owner: res[7],
  };
}

export default function VaultsV2Settings({ vaultData }: { vaultData: VaultData, }): JSX.Element {
  const { address: account } = useAccount();
  const [tokens] = useAtom(tokensAtom)
  const [settings, setSettings] = useState<VaultV2Settings>();

  const [tab, setTab] = useState<string>("Rebalance");

  useEffect(() => {
    getVaultSettings(vaultData).then(res => setSettings(res));
  }, [vaultData]);


  function changeTab(tab: string) {
    setTab(tab);
  }

  return (
    <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0 text-white">
      <h2 className="text-white font-bold text-2xl">Vault Settings</h2>
      <TabSelector
        className="mt-6 mb-12"
        availableTabs={DEFAULT_TABS}
        activeTab={tab}
        setActiveTab={changeTab}
      />
      {Object.keys(tokens).length > 0 && settings ? (
        <div>
          {tab === "Rebalance" && (
            <VaultRebalance
              vaultData={vaultData}
            />
          )}
          {tab === "Strategy" && (
            <>

            </>
          )}
          {tab === "Withdrawal Queue" && (
            <VaultWithdrawalQueue
              vaultData={vaultData}
              asset={tokens[vaultData.chainId][vaultData.asset]}
              withdrawalQueue={settings.withdrawalQueue}
              disabled={account !== vaultData.metadata.creator}
            />
          )}
          {tab === "Deposit Index" && (
            <VaultDepositIndex
              vaultData={vaultData}
              asset={tokens[vaultData.chainId][vaultData.asset]}
              depositIndex={settings.depositIndex}
              disabled={account !== vaultData.metadata.creator}
            />
          )}
          {tab === "Deposit Limit" && (
            <VaultDepositLimit
              vaultData={vaultData}
              callAddress={vaultData.address}
              disabled={account !== vaultData.metadata.creator}
            />
          )}
          {tab === "Pausing" && (
            <VaultPausing
              vaultData={vaultData}
              paused={settings.paused}
              callAddress={vaultData.address}
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
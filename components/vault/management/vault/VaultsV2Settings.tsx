import TabSelector from "@/components/common/TabSelector";
import { MultiStrategyVaultV2_1Abi, MultiStrategyVaultV2Abi } from "@/lib/constants";
import { VaultData, VaultV2Settings } from "@/lib/types";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { useAccount } from "wagmi";
import VaultRebalance from "@/components/vault/management/vault/Rebalance";
import VaultDepositLimit from "@/components/vault/management/vault/DepositLimit";
import VaultPausing from "@/components/vault/management/vault/Pausing";
import VaultAutoDeposit from "@/components/vault/management/vault/AutoDeposit";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import VaultWithdrawalQueue from "./WithdrawalQueue";
import VaultTakeFees from "./Fees";
import VaultV2FeeConfiguration from "./VaultV2FeeConfiguration";
import VaultV2Strategies from "./VaultV2Strategies";

const DEFAULT_TABS = [
  "Rebalance",
  "Strategies",
  "Withdrawal Queue",
  "Auto Deposit",
  "Deposit Limit",
  "Pausing",
  "Fees"
];

function getMulticalls(vault: VaultData) {
  const vaultContract = {
    address: vault.address,
    abi: MultiStrategyVaultV2_1Abi,
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
    },
    {
      ...vaultContract,
      functionName: "accruedPerformanceFee"
    },
    {
      ...vaultContract,
      functionName: "accruedManagementFee"
    },
    {
      ...vaultContract,
      functionName: "performanceFee"
    },
    {
      ...vaultContract,
      functionName: "managementFee"
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
    allowFailure: true,
  });

  const hasManagementFee = res[11].status === "success"

  return {
    proposedStrategies: res[0].result,
    proposedStrategyTime: Number(res[1].result),
    withdrawalQueue: res[2].result.map((e: bigint) => Number(e)),
    proposedWithdrawalQueue: res[3].result,
    depositIndex: Number(res[4].result),
    proposedDepositIndex: Number(res[5].result),
    paused: res[6].result,
    owner: res[7].result,
    fees: {
      performance: {
        value: Number(res[10].result),
        exists: true
      },
      management: {
        value: hasManagementFee ? Number(res[11].result) : 0,
        exists: hasManagementFee
      }
    },
    accruedFees: Number(res[8].result) + Number(hasManagementFee ? res[9].result : 0)
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
      <p className="text-customGray500">Owner: {settings?.owner}</p>
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
          {tab === "Strategies" && (
            <>
              <VaultV2Strategies
                vaultData={vaultData}
                settings={settings}
                disabled={account !== vaultData.metadata.creator}
              />
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
          {tab === "Auto Deposit" && (
            <VaultAutoDeposit
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
          {tab === "Fees" && (
            <>
              <VaultTakeFees
                vaultData={vaultData}
                accruedFees={settings.accruedFees / (10 ** tokens[vaultData.chainId][vaultData.asset].decimals)}
                callAddress={vaultData.address}
              />
              <VaultV2FeeConfiguration
                vaultData={vaultData}
                fees={settings.fees}
                callAddress={vaultData.address}
                disabled={account !== vaultData.metadata.creator}
              />
            </>
          )}
        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </section>
  )
}
import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultFees, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount } from "wagmi";
import axios from "axios";
import { Address, createPublicClient, extractChain, http, zeroAddress } from "viem";
import { AdminProxyByChain, MultiStrategyVaultAbi, VaultAbi, VaultControllerByChain } from "@/lib/constants";
import { RPC_URLS } from "@/lib/utils/connectors";
import * as chains from "viem/chains";
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import TabSelector from "@/components/common/TabSelector";
import VaultStrategyConfiguration from "@/components/vault/management/vault/Strategy";
import VaultPausing from "@/components/vault/management/vault/Pausing";
import VaultDepositLimit from "@/components/vault/management/vault/DepositLimit";
import VaultFeeRecipient from "@/components/vault/management/vault/FeeRecipient";
import VaultFeeConfiguration from "@/components/vault/management/vault/FeeConfiguration";
import VaultTakeFees from "@/components/vault/management/vault/Fees";
import VaultStrategiesConfiguration from "@/components/vault/management/vault/Strategies";
import VaultRebalance from "@/components/vault/management/vault/Rebalance";

export interface VaultSettings {
  proposedStrategies: Address[];
  proposedStrategyTime: number;
  proposedFees: VaultFees;
  proposedFeeTime: number;
  paused: boolean;
  feeBalance: number;
  accruedFees: number;
  owner: Address;
}

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
      functionName: "owner"
    }
  ]

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
      ...result
    ]
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
      ...result
    ]
  }
}

async function getVaultSettings(
  vault: VaultData,
  yieldOptions: YieldOptions
): Promise<VaultSettings> {
  const client = createPublicClient({
    chain: extractChain({
      chains: Object.values(chains),
      // @ts-ignore
      id: vault.chainId,
    }),
    transport: http(RPC_URLS[vault.chainId]),
  });

  const res: any[] = await client.multicall({
    contracts: getMulticalls(vault),
    allowFailure: false,
  });

  return {
    proposedStrategies: vault.strategies.length > 1 ? res[0] : [res[0]],
    proposedStrategyTime: Number(res[1]),
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
    owner: res[8]
  };
}

const DEFAULT_TABS = [
  "Strategy",
  "Fee Configuration",
  "Fee Recipient",
  "Take Fees",
  "Deposit Limit",
  "Pausing",
]

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const { address: account } = useAccount();

  const [vaults, setVaults] = useAtom(vaultsAtom);
  const [vault, setVault] = useState<VaultData>();
  const [settings, setSettings] = useState<VaultSettings>();
  const [callAddress, setCallAddress] = useState<Address>();
  const [availableTabs, setAvailableTabs] = useState<string[]>(DEFAULT_TABS)
  const [tab, setTab] = useState<string>("Strategy");

  useEffect(() => {
    async function setupVault() {
      const vault_ = vaults[Number(query?.chainId)].find(vault => vault.address === query?.id)
      if (vault_) {
        const settings_ = await getVaultSettings(vault_, yieldOptions!)
        setVault(vault_);
        setSettings(settings_);
        setCallAddress(settings_.owner === AdminProxyByChain[vault_.chainId] ? VaultControllerByChain[vault_.chainId] : vault_.address)
        if (vault_.strategies.length > 1) {
          setAvailableTabs(["Rebalance", ...DEFAULT_TABS])
          setTab("Rebalance")
        }
      }
    }
    if (!vault && query && Object.keys(vaults).length > 0 && yieldOptions) setupVault()
  }, [vaults, query, vault, yieldOptions]);

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
                  availableTabs={availableTabs}
                  activeTab={tab}
                  setActiveTab={changeTab}
                />
                {(settings && callAddress) ? (
                  <div>
                    {tab === "Rebalance" && (
                      <VaultRebalance vaultData={vault}
                        settings={settings}
                        callAddress={callAddress} />
                    )}
                    {tab === "Strategy" && (
                      <>
                        {vault.strategies.length > 1
                          ? <VaultStrategiesConfiguration
                            vaultData={vault}
                            settings={settings}
                            callAddress={callAddress}
                          />
                          : <VaultStrategyConfiguration
                            vaultData={vault}
                            settings={settings}
                            callAddress={callAddress}
                          />
                        }
                      </>
                    )}
                    {tab === "Fee Configuration" && (
                      <VaultFeeConfiguration
                        vaultData={vault}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Fee Recipient" && (
                      <VaultFeeRecipient
                        vaultData={vault}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Deposit Limit" && (
                      <VaultDepositLimit
                        vaultData={vault}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Take Fees" && (
                      <VaultTakeFees vaultData={vault} settings={settings} callAddress={callAddress} />
                    )}
                    {tab === "Pausing" && (
                      <VaultPausing vaultData={vault} settings={settings} callAddress={callAddress} />
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

import MainActionButton from "@/components/button/MainActionButton";
import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData } from "@/lib/types";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { ArrowRightCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import axios from "axios"
import { Address, PublicClient, createPublicClient, extractChain, http, zeroAddress } from "viem";
import { VaultAbi } from "@/lib/constants";
import { RPC_URLS } from "@/lib/utils/connectors";
import * as chains from 'viem/chains'
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import TabSelector from "@/components/common/TabSelector";
import VaultStrategyConfiguration from "@/components/vault/management/vault/strategy";

// TODO
// - Change Fees
// -- Propose
// -- Accept
// - Change Strategy
// -- Propose
// -- Accept
// - Take Fees
// - Change FeeRecipient
// - Change DepositLimit
// - Pause / Unpause



async function getData(vault: VaultData, yieldOptions: YieldOptions) {
  const { data: strategyDescriptions } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${vault.chainId}.json`)

  const client = createPublicClient({
    chain: extractChain({
      chains: Object.values(chains),
      // @ts-ignore
      id: vault.chainId,
    }),
    transport: http(RPC_URLS[vault.chainId])
  })

  const vaultContract = {
    address: vault.address,
    abi: VaultAbi
  }

  const res = await client.multicall({
    contracts: [
      {
        ...vaultContract,
        functionName: "proposedAdapter"
      },
      {
        ...vaultContract,
        functionName: "proposedAdapterTime"
      },
      {
        ...vaultContract,
        functionName: "proposedFees"
      },
      {
        ...vaultContract,
        functionName: "proposedFeeTime"
      },
      {
        ...vaultContract,
        functionName: "paused"
      },
      {
        ...vaultContract,
        functionName: "balanceOf",
        args: [vault.metadata.feeRecipient]
      },
      {
        ...vaultContract,
        functionName: "accruedManagementFee"
      },
      {
        ...vaultContract,
        functionName: "accruedPerformanceFee"
      },
    ],
    allowFailure: false
  })

  let proposedAdapter = {
    name: "None",
    description: "None",
    resolver: "None",
    apy: 0
  }

  if (res[0] !== zeroAddress) {
    proposedAdapter = {
      name: strategyDescriptions[res[0]].name,
      description: strategyDescriptions[res[0]].description,
      resolver: strategyDescriptions[res[0]].resolver,
      apy: (await yieldOptions.getApy({
        chainId: vault.chainId,
        protocol: strategyDescriptions[res[0]].resolver as ProtocolName,
        asset: vault.asset.address
      })).total
    }
  }

  return {
    proposedAdapter: proposedAdapter,
    proposedAdapterTime: res[1],
    proposedFees: {
      deposit: Number(res[2][0]),
      withdrawal: Number(res[2][1]),
      management: Number(res[2][2]),
      performance: Number(res[2][3])
    },
    proposedFeeTime: res[3],
    paused: res[4],
    feeBalance: Number(res[5]),
    accruedFees: Number(res[6]) + Number(res[7])
  }
}

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const [yieldOptions] = useAtom(yieldOptionsAtom)

  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [vaults, setVaults] = useAtom(vaultsAtom)
  const [vault, setVault] = useState<VaultData>()

  useEffect(() => {
    if (!vault && query && vaults.length > 0) {
      setVault(vaults.find(vault => vault.address === query?.id && vault.chainId === Number(query?.chainId)))
    }
  }, [vaults, query, vault])

  const [settings, setSettings] = useState<any>()

  useEffect(() => {
    if (vault && yieldOptions && !settings) {
      getData(vault, yieldOptions).then(res => setSettings(res))
    }
  }, [vault, yieldOptions, settings])

  const [tab, setTab] = useState<string>("Strategy")

  function changeTab(tab: string) {
    setTab(tab)
  }

  console.log({ settings })

  return <NoSSR>
    {
      vault ? (
        <section className="py-10 px-4 md:px-8 text-white">
          <AssetWithName vault={vault} />
          <TabSelector
            className="my-6"
            availableTabs={["Strategy", "Fee Configuration", "Fee Recipient", "Take Fees", "Deposit Limit", "Pausing"]}
            activeTab={tab}
            setActiveTab={changeTab}
          />
          <div>
            {tab === "Strategy" && <VaultStrategyConfiguration vaultData={vault} settings={settings} />}
            {tab === "Fee Configuration" && <div className="flex flex-row justify-between items-center">
              <div>
                <h2 className="text-xl">Current Fee Configuration</h2>
                <p>Deposit: {vault.fees.deposit / 1e16} %</p>
                <p>Withdrawal: {vault.fees.withdrawal / 1e16} %</p>
                <p>Management: {vault.fees.management / 1e16} %</p>
                <p>Performance: {vault.fees.performance / 1e16} %</p>
                <p>Propose new Fee in: 3d</p>
                <div className="w-40">
                  <MainActionButton label="Propose new Fee" />
                </div>
              </div>
              <div>
                <ArrowRightIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl">Proposed Fee Configuration</h2>
                <p>Deposit: {vault.fees.deposit / 1e16} %</p>
                <p>Withdrawal: {vault.fees.withdrawal / 1e16} %</p>
                <p>Management: {vault.fees.management / 1e16} %</p>
                <p>Performance: {vault.fees.performance / 1e16} %</p>
                <p>Accept in: 0s</p>
                <div className="w-40">
                  <MainActionButton label="Accept new Fee" />
                </div>
              </div>
            </div>}
            {tab === "Fee Recipient" && <div>
              <p>Fee recipient: {vault.metadata.feeRecipient}</p>
              <div className="w-40">
                <MainActionButton label="Change Fee Recipient" />
              </div>
            </div>}
            {tab === "Deposit Limit" && <div>
              <p>Deposit Limit: {vault.depositLimit / (10 ** vault.asset.decimals)} {vault.asset.symbol}</p>
              <div className="w-40">
                <MainActionButton label="Change Deposit Limit" />
              </div>
            </div>}
            {tab === "Take Fees" && <div>
              <p>Accumulated Fees: {settings?.accruedFees / (10 ** vault.asset.decimals)} {vault.asset.symbol}</p>
              <div className="w-40">
                <MainActionButton label="Take Fees" />
              </div>
            </div>}
            {tab === "Pausing" && <div>
              <div className="w-40">
                <MainActionButton label={settings?.paused ? "Unpause Vault" : "Pause Vault"} />
              </div>
            </div>}
          </div>
        </section>
      ) :
        <p className="text-white">Loading...</p>
    }
  </NoSSR>
}
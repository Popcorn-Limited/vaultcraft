import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultFees, VaultData, Token, Strategy, TokenByAddress } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import NoSSR from "react-no-ssr";
import { createConfig, erc20ABI, useAccount } from "wagmi";
import axios from "axios";
import { Address, createPublicClient, extractChain, http, isAddress, zeroAddress } from "viem";
import { AdminProxyByChain, GaugeAbi, MultiStrategyVaultAbi, VaultAbi, VaultControllerByChain } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
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
import { tokensAtom } from "@/lib/atoms";
import InputNumber from "@/components/input/InputNumber";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import Modal from "@/components/modal/Modal";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ApyChart from "@/components/vault/management/vault/ApyChart";
import NetFlowChart from "@/components/vault/management/vault/NetFlowChart";

async function getLogs(vault: VaultData, asset: Token) {
  const client = createPublicClient({
    chain: ChainById[vault.chainId],
    transport: http(RPC_URLS[vault.chainId]),
  })

  const initLog = await client.getContractEvents({
    address: vault.address,
    abi: VaultAbi,
    eventName: "VaultInitialized",
    fromBlock: "earliest",
    toBlock: "latest"
  })
  const creationBlockNumber = initLog[0].blockNumber
  const creationBlock = await client.getBlock({ blockNumber: creationBlockNumber })
  const creationTime = new Date(Number(creationBlock.timestamp) * 1000)
  const creationDate = Date.UTC(
    creationTime.getFullYear(),
    creationTime.getMonth(),
    creationTime.getDate(),
    0,
    0,
    0
  )

  const depositLogs = await client.getContractEvents({
    address: vault.address,
    abi: VaultAbi,
    eventName: "Deposit",
    fromBlock: creationBlockNumber,
    toBlock: "latest"
  })
  const withdrawLogs = await client.getContractEvents({
    address: vault.address,
    abi: VaultAbi,
    eventName: "Withdraw",
    fromBlock: creationBlockNumber,
    toBlock: "latest"
  })

  const latestBlock = await client.getBlock({ blockTag: "latest" })

  let result = []
  let startBlock = creationBlockNumber - BigInt(Math.floor((Number(creationBlock.timestamp) - (creationDate / 1000)) / 13))
  let day = 0
  while (startBlock < latestBlock.number) {
    const newBlock = startBlock + BigInt(7200)

    const deposits = depositLogs.filter(log => log.blockNumber > startBlock && log.blockNumber < newBlock)
    const withdrawals = withdrawLogs.filter(log => log.blockNumber > startBlock && log.blockNumber < newBlock)

    const totalDeposits = deposits.reduce((acc, obj) => acc + Number(obj.args.assets), 0) / (10 ** asset.decimals)
    const totalWithdrawals = withdrawals.reduce((acc, obj) => acc + Number(obj.args.assets), 0) / (10 ** asset.decimals)
    const netFlows = totalDeposits - totalWithdrawals
    result.push({
      day,
      logs: [
        ...deposits,
        ...withdrawals
      ],
      deposits: totalDeposits,
      withdrawals: totalWithdrawals,
      net: netFlows
    });


    startBlock = newBlock
    day += 1
  }
  return result
}

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
  const [tokens] = useAtom(tokensAtom);

  const [asset, setAsset] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [vault, setVault] = useState<Token>();

  const [vaultData, setVaultData] = useState<VaultData>();
  const [settings, setSettings] = useState<VaultSettings>();
  const [callAddress, setCallAddress] = useState<Address>();

  const [logs, setLogs] = useState<any[]>([])
  const [availableTabs, setAvailableTabs] = useState<string[]>(DEFAULT_TABS)
  const [tab, setTab] = useState<string>("Strategy");


  useEffect(() => {
    async function setupVault() {
      const vault_ = vaults[Number(query?.chainId)].find(vault => vault.address === query?.id)

      if (vault_) {

        const logs_ = await getLogs(vault_, tokens[vault_.chainId][vault_.asset])
        const settings_ = await getVaultSettings(vault_, yieldOptions!)

        setAsset(tokens[vault_.chainId][vault_.asset])
        setVault(tokens[vault_.chainId][vault_.vault])
        if (vault_.gauge) setGauge(tokens[vault_.chainId][vault_.gauge])

        setVaultData(vault_);
        setSettings(settings_);
        setCallAddress(settings_.owner === AdminProxyByChain[vault_.chainId] ? VaultControllerByChain[vault_.chainId] : vault_.address)
        setLogs(logs_)

        if (vault_.strategies.length > 1) {
          setAvailableTabs(["Rebalance", ...DEFAULT_TABS])
          setTab("Rebalance")
        }
      }
    }
    if (!vaultData && query && Object.keys(vaults).length > 0 && Object.keys(tokens).length > 0 && yieldOptions) setupVault()
  }, [vaults, tokens, query, vaultData, yieldOptions]);

  function changeTab(tab: string) {
    setTab(tab);
  }

  return (
    <NoSSR>
      {vaultData ? (
        <div className="min-h-screen">
          <button
            className="border border-customGray500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-8 mt-10"
            type="button"
            onClick={() => router.push((!!query?.ref && isAddress(query.ref as string)) ? `/manage/vaults?ref=${query.ref}` : "/manage/vaults")}
          >
            <div className="w-5 h-5">
              <LeftArrowIcon color="#FFF" />
            </div>
            <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
          </button>

          <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-8">
            <div className="w-full mb-8">
              <AssetWithName vault={vaultData} size={3} />
            </div>

            <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
              <div className="flex flex-wrap md:flex-row md:pr-10 md:w-fit gap-y-4 md:gap-10">

                <div className="w-1/2 md:w-[120px]">
                  <p className="leading-6 text-base text-customGray100 md:text-white">
                    Your Wallet
                  </p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white leading-0">
                    {asset ? `$ ${formatAndRoundNumber(
                      asset.balance * asset.price,
                      asset.decimals
                    )}` : "$ 0"}
                  </p>
                  <p className="text-xl whitespace-nowrap text-customGray300 -mt-2">
                    {asset ? `${formatAndRoundNumber(
                      asset.balance,
                      asset.decimals
                    )} TKN` : "0 TKN"}
                  </p>
                </div>

                <div className="w-1/2 md:w-[120px]">
                  <p className="leading-6 text-base text-customGray100 md:text-white">
                    Deposits
                  </p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white">
                    {vaultData ?
                      `${!!gauge ?
                        NumberFormatter.format(((gauge.balance * gauge.price) / 10 ** gauge.decimals) + ((vault?.balance! * vault?.price!) / 10 ** vault?.decimals!))
                        : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
                      }` : "0"}
                  </p>
                  <p className="text-xl whitespace-nowrap text-customGray300 -mt-2">
                    {`${!!gauge ?
                      NumberFormatter.format(((gauge.balance) / 10 ** gauge.decimals) + ((vault?.balance!) / 10 ** vault?.decimals!))
                      : formatAndRoundNumber(vault?.balance!, vault?.decimals!)
                      } TKN`}
                  </p>
                </div>

                <div className="w-1/2 md:w-max">
                  <p className="leading-6 text-base text-customGray100 md:text-white">TVL</p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white">
                    $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
                  </p>
                  <p className="text-xl whitespace-nowrap text-customGray300 -mt-2">
                    {asset ? `${formatAndRoundNumber(vaultData.totalAssets, asset.decimals)} TKN` : "0 TKN"}
                  </p>
                </div>

                <div className="w-1/2 md:w-max">
                  <p className="w-max leading-6 text-base text-customGray100 md:text-white">vAPY</p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white">
                    {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))} %`}
                  </p>
                </div>
                {
                  vaultData.minGaugeApy ? (
                    <div className="w-1/2 md:w-max">
                      <p className="w-max leading-6 text-base text-customGray100 md:text-white">Min Rewards</p>
                      <p className="text-3xl font-bold whitespace-nowrap text-white">
                        {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.minGaugeApy))} %`}
                      </p>
                    </div>
                  )
                    : <></>
                }
                {
                  vaultData.maxGaugeApy ? (
                    <div className="w-1/2 md:w-max">
                      <p className="w-max leading-6 text-base text-customGray100 md:text-white">Max Rewards</p>
                      <p className="text-3xl font-bold whitespace-nowrap text-white">
                        {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.maxGaugeApy))} %`}
                      </p>
                    </div>
                  )
                    : <></>
                }
              </div>
            </div>
          </section>

          <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8 text-white">
            <h2 className="text-white font-bold text-2xl">Informations</h2>
            <p className="text-white">
              {vaultData.metadata.description && vaultData.metadata.description?.split("-LINK- ").length > 0 ?
                <>{vaultData.metadata.description?.split("-LINK- ")[0]}{" "}
                  <a href={vaultData.metadata.description?.split("-LINK- ")[1]} target="_blank" className="text-secondaryBlue">here</a></>
                : <>{vaultData.metadata.description}</>
              }
            </p>

            <div className="flex flex-row items-center">
              <ApyChart strategy={vaultData.strategies[0]} />
              <NetFlowChart logs={logs} asset={asset} />
            </div>

            <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4">

              <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                <p className="text-white font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-white">
                    {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/vaultAddress'>
                    <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                <p className="text-white font-normal">Asset address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-white">
                    {vaultData.asset.slice(0, 6)}...{vaultData.asset.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/vaultAddress'>
                    <CopyToClipboard text={vaultData.asset} onCopy={() => showSuccessToast("Asset address copied!")}>
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>

              {vaultData.gauge &&
                <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                  <p className="text-white font-normal">Gauge address:</p>
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-white">
                      {vaultData.gauge.slice(0, 6)}...{vaultData.gauge.slice(-4)}
                    </p>
                    <div className='w-6 h-6 group/gaugeAddress'>
                      <CopyToClipboard text={vaultData.gauge} onCopy={() => showSuccessToast("Gauge address copied!")}>
                        <Square2StackIcon className="text-white group-hover/gaugeAddress:text-primaryYellow" />
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              }

            </div>
          </section>

          <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8 text-white">
            <h2 className="text-white font-bold text-2xl">Vault Settings</h2>
            {account === vaultData.metadata.creator ? (
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
                      <VaultRebalance vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress} />
                    )}
                    {tab === "Strategy" && (
                      <>
                        {vaultData.strategies.length > 1
                          ? <VaultStrategiesConfiguration
                            vaultData={vaultData}
                            settings={settings}
                            callAddress={callAddress}
                          />
                          : <VaultStrategyConfiguration
                            vaultData={vaultData}
                            settings={settings}
                            callAddress={callAddress}
                          />
                        }
                      </>
                    )}
                    {tab === "Fee Configuration" && (
                      <VaultFeeConfiguration
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Fee Recipient" && (
                      <VaultFeeRecipient
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Deposit Limit" && (
                      <VaultDepositLimit
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Take Fees" && (
                      <VaultTakeFees vaultData={vaultData} settings={settings} callAddress={callAddress} />
                    )}
                    {tab === "Pausing" && (
                      <VaultPausing vaultData={vaultData} settings={settings} callAddress={callAddress} />
                    )}
                  </div>
                ) : (
                  <p className="text-white">Loading...</p>
                )}
              </>
            ) : (
              <p className="text-white">
                Only the Vault Creator ({vaultData.metadata.creator}) has access to
                this page.
              </p>
            )}
          </section>


          {vaultData.gauge &&
            <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8 text-white">
              <h2 className="text-white font-bold text-2xl">Manage Gauge Rewards</h2>

            </section>
          }
        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </NoSSR>
  );
}

async function getRewardData(gauge: Address, chainId: number, tokens: TokenByAddress) {
  const client = createPublicClient({
    chain: extractChain({
      chains: Object.values(chains),
      // @ts-ignore
      id: chainId,
    }),
    transport: http(RPC_URLS[chainId]),
  });

  const rewardLogs = await client.getContractEvents({
    address: gauge,
    abi: GaugeAbi,
    eventName: "RewardDistributorUpdated",
    fromBlock: "earliest",
    toBlock: "latest"
  })

  if (rewardLogs.length > 0) {
    const rewardData = await client.multicall({
      contracts: rewardLogs.map(log => {
        return {
          address: gauge,
          abi: GaugeAbi,
          functionName: "reward_data",
          args: [log.args.reward_token]
        }
      }),
      allowFailure: false
    }) as any[]


  }
}

function RewardBlob() {
  return (
    <div>
      <p>Reward Token</p>
      <p>Rate</p>
      <p>Remaining Rewards</p>
      <p>Period Finish</p>
      <p>Distributor</p>
      <div>
        <p>Add Rewards</p>
        <p>Amount:</p>
        <p>New period Finish</p>
        <p>New rate</p>
        <p>Total Payout</p>
      </div>
    </div>
  )
}
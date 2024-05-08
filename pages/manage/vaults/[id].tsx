import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultFees, VaultData, Token } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import NoSSR from "react-no-ssr";
import { createConfig, erc20ABI, useAccount } from "wagmi";
import axios from "axios";
import { Address, createPublicClient, extractChain, http, zeroAddress } from "viem";
import { AdminProxyByChain, MultiStrategyVaultAbi, VaultAbi, VaultControllerByChain } from "@/lib/constants";
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
import Highcharts, { chart } from "highcharts";
import InputNumber from "@/components/input/InputNumber";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import Modal from "@/components/modal/Modal";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";

async function getLogs(vault: VaultData, asset: Token) {
  const client = createPublicClient({
    chain: ChainById[vault.chainId],
    transport: http(RPC_URLS[vault.chainId]),
  })
  const creationBlockNumber = BigInt("19075227")
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
        <div className="py-10 px-4 md:px-8 text-white">
          <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8">

            <div className="w-full mb-8">
              <AssetWithName vault={vaultData} size={3} />
            </div>

            <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
              <div className="flex flex-wrap md:flex-row md:items-center md:pr-10 gap-4 md:gap-10 md:w-fit">

                <div className="w-[120px] md:w-max">
                  <p className="leading-6 text-base text-customGray100 md:text-white">
                    Your Wallet
                  </p>
                  <div className="text-3xl font-bold whitespace-nowrap text-white">
                    {asset ? `${formatAndRoundNumber(
                      asset.balance,
                      asset.decimals
                    )}` : "0"}
                  </div>
                </div>

                <div className="w-[120px] md:w-max">
                  <p className="leading-6 text-base text-customGray100 md:text-white">
                    Deposits
                  </p>
                  <div className="text-3xl font-bold whitespace-nowrap text-white">
                    {vaultData ?
                      `${!!gauge ?
                        NumberFormatter.format(((gauge.balance * gauge.price) / 10 ** gauge.decimals) + ((vault?.balance! * vault?.price!) / 10 ** vault?.decimals!))
                        : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
                      }` : "0"}
                  </div>
                </div>

                <div className="w-[120px] md:w-max">
                  <p className="leading-6 text-base text-customGray100 md:text-white">TVL</p>
                  <div className="text-3xl font-bold whitespace-nowrap text-white">
                    $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
                  </div>
                </div>

                <div className="w-[120px] md:w-max">
                  <p className="w-max leading-6 text-base text-customGray100 md:text-white">vAPY</p>
                  <div className="text-3xl font-bold whitespace-nowrap text-white">
                    {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))} %`}
                  </div>
                </div>
                {
                  vaultData.minGaugeApy ? (
                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-customGray100 md:text-white">Min Rewards</p>
                      <div className="text-3xl font-bold whitespace-nowrap text-white">
                        {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.minGaugeApy))} %`}
                      </div>
                    </div>
                  )
                    : <></>
                }
                {
                  vaultData.maxGaugeApy ? (
                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-customGray100 md:text-white">Max Rewards</p>
                      <div className="text-3xl font-bold whitespace-nowrap text-white">
                        {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.maxGaugeApy))} %`}
                      </div>
                    </div>
                  )
                    : <></>
                }
              </div>
            </div>
          </section>
          <NetFlowChart logs={logs} asset={asset} />
          <section>

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
        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </NoSSR>
  );
}

function initBarChart(elem: null | HTMLElement, data: any[], setShowModal: Function, setModalContent: Function) {
  if (!elem) return;

  Highcharts.chart(elem,
    {
      chart: {
        type: 'column',
        backgroundColor: "transparent",
      },
      title: {
        text: '',
        style: { color: "#fff" }
      },
      xAxis: {
        categories: data.map(entry => String(entry.day)),
        labels: {
          style: {
            color: "#fff",
          },
        }
      },
      yAxis: {
        labels: {
          style: {
            color: "#fff",
          },
        },
        title: {
          text: "",
        },
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        column: {
          borderRadius: '25%',
          point: {
            events: {
              click: function () {
                console.log(
                  'Category: ' + this.category + ', value: ' + this.y + ', stuff: ' + this.name
                );
                setModalContent(data[Number(this.category)].logs)
                setShowModal(true)
              }
            }
          }
        }
      },
      series: [
        {
          name: 'Deposit',
          data: data.map(entry => entry.deposits),
          type: "column"
        },
        {
          name: 'Withdrawal',
          data: data.map(entry => -entry.withdrawals),
          type: "column"
        },
        {
          name: 'Net',
          data: data.map(entry => entry.net),
          type: "column"
        }
      ]
    },
    () => ({})
  );
}

function NetFlowChart({ logs, asset }: { logs: any[], asset?: Token }): JSX.Element {
  const chartElem = useRef(null);

  const [filterAddress, setFilterAddress] = useState<string>("0x")
  const [from, setFrom] = useState<number>(0)
  const [to, setTo] = useState<number>(logs.length - 1)

  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<any[]>([])

  useEffect(() => {
    initBarChart(chartElem.current, logs.filter(log => log.deposits > 0 || log.withdrawals > 0), setShowModal, setModalContent)
  }, [logs])

  console.log(modalContent)

  return (
    <>
      <Modal visibility={[showModal, setShowModal]}>
        {modalContent.length > 0 ?
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">Value</th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">Address</th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {modalContent.map(log =>
                <tr key={log.transactionHash}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium sm:pl-0">
                    <h2 className="text-lg text-white text-start">
                      {log.eventName}
                    </h2>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-gray-500 text-start">
                    {Number(log.args.assets) / (10 ** asset?.decimals!)} {asset?.symbol!}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-gray-500 text-start">
                    {log.args.owner}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-gray-500">
                    <div className="flex flex-row items-center justify-between">
                      {log.transactionHash.slice(0, 4)}...{log.transactionHash.slice(-4)}
                      <div className='w-6 h-6 cursor-pointer group/txHash'>
                        <CopyToClipboard text={log.transactionHash} onCopy={() => showSuccessToast("Tx Hash copied!")}>
                          <Square2StackIcon className="text-white group-hover/txHash:text-primaryYellow" />
                        </CopyToClipboard>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          : <></>
        }
      </Modal>
      <section>
        <h2>Vault In- and Outflows</h2>
        <div className="flex flex-row items-end px-12 pt-12 pb-4 space-x-4">
          <div>
            <p>User Address</p>
            <div className="border border-customGray500 rounded-md p-1">
              <InputNumber
                value={filterAddress}
                onChange={(e) => setFilterAddress(e.currentTarget.value)}
                type="text"
              />
            </div>
          </div>
          <div>
            <p>From</p>
            <div className="border border-customGray500 rounded-md p-1">
              <InputNumber
                value={from}
                onChange={(e) => setFrom(Number(e.currentTarget.value))}
                type="number"
              />
            </div>
          </div>
          <div>
            <p>To</p>
            <div className="border border-customGray500 rounded-md p-1">
              <InputNumber
                value={to}
                onChange={(e) => setTo(Number(e.currentTarget.value))}
                type="number"
              />
            </div>
          </div>
          <div className="w-40">
            <MainActionButton
              label="Filter"
              handleClick={() =>
                initBarChart(
                  chartElem.current,
                  logs.filter((_, i) => i >= from && i <= to)
                    .filter(entry => filterAddress === "" ? true : entry.logs.some((log: any) => log.args.owner.toLowerCase().includes(filterAddress)))
                    .filter(log => log.deposits > 0 || log.withdrawals > 0),
                  setShowModal,
                  setModalContent
                )
              }
            />
          </div>
          <div className="w-40">
            <SecondaryActionButton
              label="Reset"
              handleClick={() => {
                setFilterAddress("0x");
                setFrom(0);
                setTo(logs.length - 1);
                initBarChart(
                  chartElem.current,
                  logs.filter(log => log.deposits > 0 || log.withdrawals > 0),
                  setShowModal,
                  setModalContent
                )
              }}
            />
          </div>

        </div>
        <div className={`flex justify-center`} ref={chartElem} />
      </section>
    </>
  )
}
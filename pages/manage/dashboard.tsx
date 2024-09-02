import AssetWithName from "@/components/common/AssetWithName";
import CardStat from "@/components/common/CardStat";
import { IconByProtocol } from "@/components/common/ProtocolIcon";
import TabSelector from "@/components/common/TabSelector";
import { tokensAtom } from "@/lib/atoms";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { AssetPushOracleAbi, AssetPushOracleByChain, BalancerOracleAbi, ExerciseByChain, ExerciseOracleByChain, OptionTokenByChain, OVCX_ORACLE, VCX, VcxByChain, WETH, XVCXByChain } from "@/lib/constants";
import { thisPeriodTimestamp } from "@/lib/gauges/utils";
import { vcx } from "@/lib/resolver/price/resolver";
import { loadingStyle } from "@/lib/toasts/toastStyles";
import { TokenByAddress, VaultData } from "@/lib/types";
import { ChainById, GAUGE_NETWORKS, RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { formatNumber, formatTwoDecimals } from "@/lib/utils/formatBigNumber";
import { previousFriday, previousThursday } from "date-fns";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { createPublicClient, erc20Abi, http, parseAbi, parseAbiItem, PublicClient, zeroAddress } from "viem";

async function loadDashboardData(tokens: { [key: number]: TokenByAddress }) {
  const vcxData = await loadVCXData(tokens);
  const assetOracleData = await loadAssetOracleData()
  return { vcxData, assetOracleData }
}

async function loadVCXData(tokens: { [key: number]: TokenByAddress }) {
  const mainnetClient = createPublicClient({ chain: ChainById[1], transport: http(RPC_URLS[1]) })
  const minPrice = await mainnetClient.readContract({
    address: OVCX_ORACLE,
    abi: BalancerOracleAbi,
    functionName: "minPrice",
  });

  const vcxDataByChain: { [key: number]: any } = {}
  await Promise.all(
    GAUGE_NETWORKS.map(async (chain) => {
      vcxDataByChain[chain] = await loadVCXDataByChain(chain, mainnetClient, tokens, minPrice)
    })
  )
  return vcxDataByChain
}

async function loadVCXDataByChain(chainId: number, mainnetClient: PublicClient, tokens: { [key: number]: TokenByAddress }, minPrice: bigint) {
  const client = createPublicClient({ chain: ChainById[chainId], transport: http(RPC_URLS[chainId]) })

  const strikePriceRes = await client.readContract({
    address: ExerciseOracleByChain[chainId],
    abi: BalancerOracleAbi,
    functionName: "getPrice",
  });
  const vcxPrice = tokens[1][VCX].price
  const strikePrice = (Number(strikePriceRes) * tokens[1][WETH].price) / 1e18;
  const ovcxPrice = vcxPrice - strikePrice
  const discount = ((1 - (strikePrice / vcxPrice)) * 100)
  const minPriceInUsd = (Number(minPrice) * tokens[1][WETH].price) / 1e18;

  let oVCXInCirculation;
  let exercisableVCX;
  let lastUpdate;
  let lastBridge;
  if (chainId === 1) {
    const balanceRes = await client.multicall({
      contracts: [
        {
          address: OptionTokenByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [zeroAddress]
        },
        {
          address: VcxByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [ExerciseByChain[chainId]]
        }
      ],
      allowFailure: false
    })
    const bridgedOVCX = GAUGE_NETWORKS.filter(chain => chain !== chainId).reduce((amount, chain) => tokens[chain][OptionTokenByChain[chain]].totalSupply + amount, 0)
    oVCXInCirculation = tokens[chainId][OptionTokenByChain[chainId]].totalSupply - Number(balanceRes[0]) - bridgedOVCX
    exercisableVCX = Number(balanceRes[1])

    const block = await client.getBlock()
    lastUpdate = block.timestamp
    lastBridge = 0
  } else {
    const balanceRes = await client.multicall({
      contracts: [
        {
          address: OptionTokenByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [ExerciseByChain[chainId]]
        },
        {
          address: VcxByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [ExerciseByChain[chainId]]
        }
      ],
      allowFailure: false
    })

    oVCXInCirculation = tokens[chainId][OptionTokenByChain[chainId]].totalSupply - Number(balanceRes[0])
    exercisableVCX = Number(balanceRes[1])

    const updateLogs = await client.getLogs({
      address: ExerciseOracleByChain[chainId],
      event: parseAbiItem("event PriceUpdate(uint oldPrice, uint newPrice)"),
      fromBlock: "earliest",
      toBlock: "latest",
    });
    const block = await client.getBlock({ blockNumber: updateLogs[updateLogs.length - 1].blockNumber })
    lastUpdate = block.timestamp

    let bridgeLogs: any[] = []
    if (chainId === 10) {
      bridgeLogs = await mainnetClient.getLogs({
        address: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
        event: parseAbiItem("event ERC20BridgeInitiated(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 amount, bytes extraData)"),
        fromBlock: "earliest",
        toBlock: "latest",
        args: {
          localToken: OptionTokenByChain[1]
        }
      });
    } else if (chainId === 42161) {
      bridgeLogs = await mainnetClient.getLogs({
        address: "0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef",
        event: parseAbiItem("event TransferRouted(address indexed token, address indexed _userFrom, address indexed _userTo, address gateway)"),
        fromBlock: "earliest",
        toBlock: "latest",
        args: {
          token: OptionTokenByChain[1]
        }
      });
    }
    const bridgeBlock = await mainnetClient.getBlock({ blockNumber: bridgeLogs[bridgeLogs.length - 1].blockNumber })
    lastBridge = bridgeBlock.timestamp
  }

  return { oVCXInCirculation, exercisableVCX, vcxPrice, strikePrice, minPrice: minPriceInUsd, ovcxPrice, discount, lastUpdate, lastBridge }
}

async function loadAssetOracleData() {
  const chains = Object.keys(AssetPushOracleByChain).filter(chain => AssetPushOracleByChain[Number(chain)] !== zeroAddress).map(chain => Number(chain))

  const assetOracleData: { [key: number]: any } = {}
  await Promise.all(
    chains.map(async (chain) => {
      assetOracleData[chain] = await loadAssetOracleDataByChain(chain)
    })
  )
  return assetOracleData
}

async function loadAssetOracleDataByChain(chainId: number) {
  const client = createPublicClient({ chain: ChainById[chainId], transport: http(RPC_URLS[chainId]) })

  const logs = await client.getLogs({
    address: AssetPushOracleByChain[chainId],
    event: AssetPushOracleAbi[6],
    fromBlock: "earliest",
    toBlock: "latest"
  });
  return logs
}

const DEFAULT_TABS = ["Vaults", "VCX", "Oracles", "Automation"]

export default function Dashboard() {
  const [tokens] = useAtom(tokensAtom);
  const [tab, setTab] = useState<string>("Vaults")
  const [dashboardData, setDashboardData] = useState<any>()

  useEffect(() => {
    if (Object.keys(tokens).length > 0) loadDashboardData(tokens).then(res => setDashboardData(res))
  }, [tokens])
  return (
    <>
      <AlertSection dashboardData={dashboardData} />
      <TabSelector
        className="mt-6 mb-12"
        availableTabs={DEFAULT_TABS}
        activeTab={tab}
        setActiveTab={(t: string) => setTab(t)}
      />
      {
        tab === "Vaults" && <VaultsDashboard dashboardData={dashboardData} />
      }
      {
        tab === "VCX" && <VCXDashboard dashboardData={dashboardData} />
      }
      {
        tab === "Oracles" && <OraclesDashboard dashboardData={dashboardData} />
      }
      {
        tab === "Automation" && <AutomationDashboard dashboardData={dashboardData} />
      }
    </>
  )
}

function AlertSection({ dashboardData }: { dashboardData: any }) {
  // TODO
  // - Add alert for stale asset oracle
  // - Add alert for stale harvest
  // - Add alert for low 1Balance + eth bal gelato
  // - Add alert for low balance trade bot
  // - Add alert for large fee amount in vaults

  if (!dashboardData || Object.keys(dashboardData).length === 0) return <></>
  return (
    <div className="flex flex-row flex-wrap">
      {GAUGE_NETWORKS.map(chainId => <OptionTokenOracleAlert key={"ovcxOracleAlert-" + chainId} chainId={chainId} vcxData={dashboardData.vcxData[chainId]} />)}
      {GAUGE_NETWORKS.map(chainId => <OptionTokenAlert key={"ovcxAlert-" + chainId} chainId={chainId} vcxData={dashboardData.vcxData[chainId]} />)}
      <VaultsAlert />
    </div>
  )
}

function OptionTokenOracleAlert({ chainId, vcxData }: { chainId: number, vcxData: any }) {
  const lastUpdate = Number(vcxData.lastUpdate) * 1000
  const updateFrequency = 3600000 // 60 minutes
  return (
    <>
      {/* Check that the price isnt lower/equal minPrice */}
      {vcxData.strikePrice <= vcxData.minPrice &&
        <div className="w-1/3 p-4">
          <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-red-500 text-lg">MinPrice: {ChainById[chainId].name}</p>
            <p className="text-red-500 text-sm">
              {`Adjust the minPrice of the OVCX Oracle. The current strike price is lower or equal to the min price. (${vcxData.strikePrice} <= ${vcxData.minPrice})`}
            </p>
          </div>
        </div>
      }

      {/* Check that the update isnt longer than 15min ago */}
      {(lastUpdate + updateFrequency) < Number(new Date()) &&
        <div className="w-1/3 p-4">
          <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
            <p className="text-secondaryYellow text-lg">Stale Oracle: {ChainById[chainId].name}</p>
            <p className="text-secondaryYellow text-sm">
              Oracle has been stale. Last update occured {new Date(lastUpdate).toLocaleString()}
            </p>
          </div>
        </div>
      }
    </>
  )
}

function OptionTokenAlert({ chainId, vcxData }: { chainId: number, vcxData: any }) {
  const lastBridge = Number(vcxData.lastBridge) * 1000
  const lastEpochEnd = (thisPeriodTimestamp() * 1000) - (604800 * 1000)
  const minExercisableVCX = 100_000e18
  return (
    <>
      {/* Check that oVCX have been bridged after epoch end */}
      {chainId !== 1 && lastBridge <= lastEpochEnd &&
        <div className="w-1/3 p-4">
          <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
            <p className="text-secondaryYellow text-lg">OVCX Bridge: {ChainById[chainId].name}</p>
            <p className="text-secondaryYellow text-sm">
              OVCX havent been bridged recently. Last bridge occured {new Date(lastBridge).toLocaleString()} | {new Date(lastEpochEnd).toLocaleString()}
            </p>
          </div>
        </div>
      }

      {/* Check that Exercise contract is funded */}
      {vcxData.exercisableVCX < 1000e18 ?
        <div className="w-1/3 p-4">
          <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-red-500 text-lg">Exercisable oVCX: {ChainById[chainId].name}</p>
            <p className="text-red-500 text-sm">
              {`Fund the exercise contract. VCX balance of the exercise contract is runnign low (${formatNumber(vcxData.exercisableVCX / 1e18)} VCX < 1000 VCX)`}
            </p>
          </div>
        </div>
        : <>
          {vcxData.exercisableVCX < minExercisableVCX &&
            <div className="w-1/3 p-4">
              <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
                <p className="text-secondaryYellow text-lg">Exercisable oVCX: {ChainById[chainId].name}</p>
                <p className="text-secondaryYellow text-sm">
                  {`Fund the exercise contract. VCX balance of the exercise contract is runnign low (${formatNumber(vcxData.exercisableVCX / 1e18)} VCX < ${formatNumber(minExercisableVCX / 1e18)} VCX)`}
                </p>
              </div>
            </div>
          }
        </>
      }
    </>
  )
}

// TODO Add alert for stale asset oracle

function VaultsAlert() {
  const [vaultsData] = useAtom(vaultsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [vaults, setVaults] = useState<VaultData[]>([]);

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat());
    }
  }, [vaultsData, vaults]);

  return vaults.length > 0 && Object.keys(tokens).length > 0 ? (
    <>
      {vaults.map(vault =>
        <>
          {/* Check that Vaults have enough liquid cash */}
          {(vault.liquid * tokens[vault.chainId][vault.asset].price / (10 ** tokens[vault.chainId][vault.asset].decimals)) < 100_000 ?
            <div className="w-1/3 p-4">
              <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
                <p className="text-red-500 text-lg">
                  Low Cash: {ChainById[vault.chainId].name} {tokens[vault.chainId][vault.asset].symbol}-{vault.strategies.length > 1
                    ? "Multistrategy"
                    : vault.strategies[0].metadata.protocol}
                </p>
                <p className="text-red-500 text-sm">
                  {`Free up cash for withdrawals! Either deallocate funds from strategies or convert YieldTokens in strategies. ( $${formatNumber(vault.liquid * tokens[vault.chainId][vault.asset].price / (10 ** tokens[vault.chainId][vault.asset].decimals))} < $100k )`}
                </p>
              </div>
            </div>
            : <>
              {((vault.liquid / vault.totalAssets) * 100) < 20 &&
                <div className="w-1/3 p-4">
                  <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
                    <p className="text-secondaryYellow text-lg">
                      Low Cash: {ChainById[vault.chainId].name} {tokens[vault.chainId][vault.asset].symbol}-{vault.strategies.length > 1
                        ? "Multistrategy"
                        : vault.strategies[0].metadata.protocol}
                    </p>
                    <p className="text-secondaryYellow text-sm">
                      {`Free up cash for withdrawals. Either deallocate funds from strategies or convert YieldTokens in strategies. (${formatTwoDecimals(vault.liquid / vault.totalAssets * 100)}% < 20% )`}
                    </p>
                  </div>
                </div>
              }
            </>
          }
        </>
      )}
    </>
  )
    : <></>
}

function VaultsDashboard({ dashboardData }: { dashboardData: any }) {
  const [vaultsData] = useAtom(vaultsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [vaults, setVaults] = useState<VaultData[]>([]);

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat());
    }
  }, [vaultsData, vaults]);

  // TODO
  // - add strategy into its own atom
  // - fees
  // - last harvested
  return vaults.length > 0 && Object.keys(tokens).length > 0 ?
    (
      <div className="flex flex-row flex-wrap w-full">
        {vaults.sort((a, b) => (b.totalAssets - b.liquid) - (a.totalAssets - a.liquid)).map(vault =>
          <div key={vault.address} className="w-1/2 p-2">
            <div className="group border rounded-lg w-full px-8 py-4 bg-customNeutral300 border-customNeutral100 border-opacity-75">
              <div className="w-full flex flex-row items-center justify-center">
                <AssetWithName vault={vault} />
              </div>
              <div className="text-white flex flex-row py-2 border-b border-customGray500">
                <CardStat
                  id={`wallet`}
                  label="TotalAssets"
                  value={`${formatNumber(vault.totalAssets / (10 ** tokens[vault.chainId][vault.asset].decimals))}`}
                />
                <CardStat
                  id={`Liquid`}
                  label="Liquid"
                  value={`${formatNumber(vault.liquid / (10 ** tokens[vault.chainId][vault.asset].decimals))}`}
                  secondaryValue={`${formatTwoDecimals((vault.liquid / vault.totalAssets) * 100)} %`}
                />
                <CardStat
                  id={`wallet`}
                  label="Idle"
                  value={`${formatNumber(vault.idle / (10 ** tokens[vault.chainId][vault.asset].decimals))}`}
                />
              </div>
              <div className="mt-4 space-y-4">
                {vault.strategies.map(strategy =>
                  <div className="text-white" key={strategy.address}>
                    <div className="w-max flex flex-row items-center">
                      <img
                        src={IconByProtocol[strategy.metadata.protocol] || "/images/tokens/vcx.svg"}
                        className={`h-4 w-4 mr-2 mb-1.5 rounded-full border border-white`}
                      />
                      <h2 className="text-lg text-white">
                        {strategy.metadata.protocol} - {strategy.metadata.name}
                      </h2>
                    </div>
                    <div className="flex flex-row items-center">
                      <CardStat
                        id={`wallet`}
                        label="Allocation"
                        value={formatNumber(strategy.allocation / (10 ** tokens[vault.chainId][vault.asset].decimals))}
                        secondaryValue={`${formatTwoDecimals(strategy.allocationPerc * 100)} %`}
                      />
                      <CardStat
                        id={`wallet`}
                        label="Liquid"
                        value={formatNumber(strategy.allocation / (10 ** tokens[vault.chainId][vault.asset].decimals))}
                        secondaryValue={`${formatTwoDecimals((strategy.idle / strategy.allocation) * 100)} %`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div >
    )
    : <p className="text-white">Loading...</p>
}

function VCXDashboard({ dashboardData }: { dashboardData: any }) {
  return dashboardData && Object.keys(dashboardData).length > 0 && Object.keys(dashboardData?.vcxData).length > 0 ? (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                  Value
                </th>
                {GAUGE_NETWORKS.map(chain =>
                  <th key={ChainById[chain].name + "header"} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    {ChainById[chain].name}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(dashboardData.vcxData[1]).map((key) => (
                <tr key={key}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                    {String(key)}
                  </td>
                  {GAUGE_NETWORKS.map(chain =>
                    <td key={chain + key} className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                      {key.includes("Price") && "$ "}
                      {key === "lastUpdate" &&
                        `${new Date(Number(dashboardData.vcxData[chain][key]) * 1000).toLocaleString()}`
                      }
                      {key === "lastBridge" &&
                        <>
                          {
                            Number(dashboardData.vcxData[chain][key]) > 0
                              ? `${new Date(Number(dashboardData.vcxData[chain][key]) * 1000).toLocaleString()}`
                              : 0
                          }
                        </>
                      }
                      {!key.includes("last") && formatNumber(Number(dashboardData.vcxData[chain][key]) / (["oVCXInCirculation", "exercisableVCX"].includes(key) ? 1e18 : 1))}
                      {key === "discount" && " %"}
                      {key === "oVCXInCirculation" && " oVCX"}
                      {key === "exercisableVCX" && " VCX"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  )
    : <p className="text-white">Loading...</p>
}

function OraclesDashboard({ dashboardData }: { dashboardData: any }) {
  const [chain, setChain] = useState<number>(1)

  function selectTab(val: string) {
    const selected = SUPPORTED_NETWORKS.find(network => network.name === val)
    setChain(selected?.id || 1)
  }

  // TODO
  // - Sort the values by active strategies
  // - Add token metadata

  return dashboardData && Object.keys(dashboardData).length > 0 && Object.keys(dashboardData?.vcxData).length > 0 && Object.keys(dashboardData?.assetOracleData).length > 0 ? (
    <>
      <TabSelector
        className="mt-6 mb-12"
        availableTabs={GAUGE_NETWORKS.map(chain => ChainById[chain].name)}
        activeTab={ChainById[chain].name}
        setActiveTab={(t: string) => selectTab(t)}
      />
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                    Base
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Quote
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Price
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                    {OptionTokenByChain[chain]}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                    USD
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                    {dashboardData?.vcxData[chain].ovcxPrice}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                    {Number(dashboardData?.vcxData[chain].lastUpdate)}
                  </td>
                </tr>
                {!!dashboardData?.assetOracleData[chain]
                  ? dashboardData?.assetOracleData[chain].map((log: any) =>
                    <>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                          {log.args.base}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                          {log.args.quote}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                          {Number(log.args.bqPrice)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                          {Number(log.blockNumber)}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                          {log.args.quote}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                          {log.args.base}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                          {Number(log.args.qbPrice)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                          {Number(log.blockNumber)}
                        </td>
                      </tr>
                    </>
                  )
                  : <p className="text-white">No Asset Oracles</p>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div >
    </>
  )
    : <p className="text-white">Loading...</p>
}

function AutomationDashboard({ dashboardData }: { dashboardData: any }) {
  // TODO
  // - show last update asset oracles per active pair
  // - show last update ovcx oracle
  // - show trade bot balances + last trade
  // - show gelato 1balance + eth balance
  // - (show last harvests?)
  return (
    <>
      <p className="text-white">Coming Soon. Check out the other Dashboards in the mean time...</p>
    </>
  )
}
import TabSelector from "@/components/common/TabSelector";
import { tokensAtom } from "@/lib/atoms";
import { BalancerOracleAbi, ExerciseByChain, ExerciseOracleByChain, OptionTokenByChain, OVCX_ORACLE, VCX, VcxByChain, WETH, XVCXByChain } from "@/lib/constants";
import { TokenByAddress } from "@/lib/types";
import { ChainById, GAUGE_NETWORKS, RPC_URLS } from "@/lib/utils/connectors";
import { formatNumber } from "@/lib/utils/formatBigNumber";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { createPublicClient, erc20Abi, http, parseAbi, parseAbiItem, zeroAddress } from "viem";

async function loadDashboardData(tokens: { [key: number]: TokenByAddress }) {
  const vcxData = await loadVCXData(tokens);
  return { vcxData }
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
      vcxDataByChain[chain] = await loadVCXDataByChain(chain, tokens, minPrice)
    })
  )
  return vcxDataByChain
}

async function loadVCXDataByChain(chainId: number, tokens: { [key: number]: TokenByAddress }, minPrice: bigint) {
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
  }

  return { oVCXInCirculation, exercisableVCX, vcxPrice, strikePrice, minPrice: minPriceInUsd, ovcxPrice, discount, lastUpdate }
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
  return (
    <>
    </>
  )
}

function VaultsDashboard({ dashboardData }: { dashboardData: any }) {
  return (
    <>
    </>
  )
}

function VCXDashboard({ dashboardData }: { dashboardData: any }) {
  return Object.keys(dashboardData?.vcxData).length > 0 ? (
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
                      {key === "lastUpdate"
                        ? `${new Date(Number(dashboardData.vcxData[chain][key]) * 1000).toLocaleTimeString()} ${new Date(Number(dashboardData.vcxData[chain][key]) * 1000).toLocaleDateString()}`
                        : formatNumber(Number(dashboardData.vcxData[chain][key]) / (["oVCXInCirculation", "exercisableVCX"].includes(key) ? 1e18 : 1))}
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
    </div>
  )
    : <p className="text-white">Loading...</p>
}

// Optimism Gateway (0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1)
// Event: ERC20BridgeInitiated (index_topic_1 address localToken, index_topic_2 address remoteToken, index_topic_3 address from, address to, uint256 amount, bytes extraData)
// filter by localToken + to (gauge)
// show time, gauge

// Arbitrum Gateway (0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef)
// Event: TransferRouted (index_topic_1 address token, index_topic_2 address _userFrom, index_topic_3 address _userTo, address gateway)
// filter by token + userTo (gauge)
// show time, gauge

function OraclesDashboard({ dashboardData }: { dashboardData: any }) {
  return (
    <>
    </>
  )
}

function AutomationDashboard({ dashboardData }: { dashboardData: any }) {
  return (
    <>
    </>
  )
}
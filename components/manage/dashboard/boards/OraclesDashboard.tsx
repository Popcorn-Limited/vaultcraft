import TabSelector from "@/components/common/TabSelector"
import { strategiesAtom, tokensAtom } from "@/lib/atoms"
import { vaultsAtom } from "@/lib/atoms/vaults"
import { ChainById, GAUGE_NETWORKS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors"
import { NumberFormatter } from "@/lib/utils/helpers"
import { useAtom } from "jotai"
import { useState } from "react"

export default function OraclesDashboard({ dashboardData }: { dashboardData: any }) {
  const [chain, setChain] = useState<number>(1)
  const [vaultsData] = useAtom(vaultsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [strategies] = useAtom(strategiesAtom)

  function selectTab(val: string) {
    const selected = SUPPORTED_NETWORKS.find(network => network.name === val)
    setChain(selected?.id || 1)
  }

  if (!dashboardData
    || Object.keys(dashboardData).length === 0
    || Object.keys(dashboardData?.vcxData).length === 0
    || Object.keys(dashboardData?.assetOracleData).length === 0
    || Object.keys(vaultsData).length === 0
    || Object.keys(tokens).length === 0
    || Object.keys(strategies).length === 0
  ) return <p className="text-white">Loading...</p>
  return (
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
                    Price in Quote
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                    oVCX
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                    $ {NumberFormatter.format(dashboardData?.vcxData[chain].ovcxPrice)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                    {new Date(Number(dashboardData?.vcxData[chain].lastUpdate) * 1000).toLocaleString()}
                  </td>
                </tr>
                {!!dashboardData?.assetOracleData[chain]
                  ? dashboardData?.assetOracleData[chain]
                    .filter((log: any) =>
                      !!Object.values(strategies[chain])
                        .filter(strategy => strategy.yieldToken)
                        .find(strategy =>
                          (strategy.yieldToken === log.log.args.quote && strategy.asset === log.log.args.base)
                          || (strategy.asset === log.log.args.quote && strategy.yieldToken === log.log.args.base))
                    )
                    .map((log: any) =>
                      <>
                        <tr>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            {tokens[chain][log.log.args.base].symbol}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                            {NumberFormatter.format(Number(log.log.args.bqPrice) / 1e18)} {tokens[chain][log.log.args.quote].symbol}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                            {new Date(Number(log.lastUpdate) * 1000).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            {tokens[chain][log.log.args.quote].symbol}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                            {NumberFormatter.format(Number(log.log.args.qbPrice) / 1e18)} {tokens[chain][log.log.args.base].symbol}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-customGray200">
                            {new Date(Number(log.lastUpdate) * 1000).toLocaleString()}
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
}
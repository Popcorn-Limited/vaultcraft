import { GAUGE_NETWORKS, ChainById } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/helpers";

export default function VCXDashboard({ dashboardData }: { dashboardData: any }) {
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
                      {!key.includes("last") && NumberFormatter.format(Number(dashboardData.vcxData[chain][key]) / (["oVCXInCirculation", "exercisableVCX"].includes(key) ? 1e18 : 1))}
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
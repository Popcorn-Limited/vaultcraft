import SpinningLogo from "@/components/common/SpinningLogo";
import { NumberFormatter } from "@/lib/utils/helpers";

export default function AutomationDashboard({ dashboardData }: { dashboardData: any }) {
  // TODO
  // - show last update asset oracles per active pair
  // - show last update ovcx oracle
  // - (show last harvests?)

  if (!dashboardData
    || Object.keys(dashboardData).length === 0
    || Object.keys(dashboardData?.automationData).length === 0
  ) return <SpinningLogo />
  return (
    <div className="flex flex-row flex-wrap w-full">

      <div className="w-1/2 p-5">
        <div className="group border rounded-lg w-full h-40 p-4 relative flex flex-col bg-customNeutral300 border-customNeutral100 border-opacity-75"
        >
          <h2 className="mt-2 text-white text-3xl font-bold">
            Gelato
          </h2>
          <p className="mt-2 text-white">Balance: ${NumberFormatter.format(dashboardData?.automationData.gelatoBalance)}</p>
        </div>
      </div>

      <div className="w-1/2 p-5">
        <div className="group border rounded-lg w-full h-40 p-4 relative flex flex-col bg-customNeutral300 border-customNeutral100 border-opacity-75"
        >
          <h2 className="mt-2 text-white text-3xl font-bold">
            Trade Bot
          </h2>
          <p className="mt-2 text-white">Gas Balance: {NumberFormatter.format(Number(dashboardData?.automationData.tradebot.eth) / 1e18)} ETH</p>
          <p className="mt-2 text-white">Buy Balance: {NumberFormatter.format(Number(dashboardData?.automationData.tradebot.weth) / 1e18)} WETH</p>
        </div>
      </div>

    </div>
  )
}
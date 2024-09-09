import { GAUGE_NETWORKS } from "@/lib/utils/connectors"
import AssetTokenOracleAlert from "./AssetOracleAlert"
import OptionTokenOracleAlert from "./OptionTokenOracleAlert"
import OptionTokenAlert from "./OptionTokenAlert"
import VaultsAlert from "./VaultsAlert"
import GelatoBalanceAlert from "./GelatoBalanceAlert"
import TradeBothBalanceAlert from "./TradeBothBalanceAlert"

export default function AlertSection({ dashboardData }: { dashboardData: any }) {
  // TODO
  // - Add alert for stale harvest
  // - Add alert for large fee amount in vaults

  if (!dashboardData || Object.keys(dashboardData).length === 0) return <></>
  return (
    <div className="flex flex-row flex-wrap">
      <VaultsAlert />
      <GelatoBalanceAlert automationData={dashboardData.automationData} />
      {GAUGE_NETWORKS.map(chainId => <AssetTokenOracleAlert key={"assetOracleAlert-" + chainId} chainId={chainId} assetOracleData={dashboardData.assetOracleData[chainId]} />)}
      {GAUGE_NETWORKS.map(chainId => <OptionTokenOracleAlert key={"ovcxOracleAlert-" + chainId} chainId={chainId} vcxData={dashboardData.vcxData[chainId]} />)}
      {GAUGE_NETWORKS.map(chainId => <OptionTokenAlert key={"ovcxAlert-" + chainId} chainId={chainId} vcxData={dashboardData.vcxData[chainId]} />)}
      <TradeBothBalanceAlert automationData={dashboardData.automationData} />
    </div>
  )
}
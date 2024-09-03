import TabSelector from "@/components/common/TabSelector";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import loadDashboardData from "@/lib/dashboard";
import AlertSection from "@/components/manage/dashboard/alerts/AlertSection";
import VaultsDashboard from "@/components/manage/dashboard/boards/VaultsDashboard";
import VCXDashboard from "@/components/manage/dashboard/boards/VCXDashboard";
import OraclesDashboard from "@/components/manage/dashboard/boards/OraclesDashboard";
import AutomationDashboard from "@/components/manage/dashboard/boards/AutomationsDashboard";

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
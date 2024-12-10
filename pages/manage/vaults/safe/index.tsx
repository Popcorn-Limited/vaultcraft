import { useState } from "react";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import SpinningLogo from "@/components/common/SpinningLogo";
import WithdrawalProcessingContainer from "@/components/vault/management/safe/WithdrawalProcessingContainer";
import SafeVaultConfigurationContainer from "@/components/vault/management/safe/SafeVaultConfigurationContainer";
import TabSelector from "@/components/common/TabSelector";

const DEFAULT_TABS = ["Withdrawals", "Vaults"]

export default function SafeVaultsOverview() {
  const [tokens] = useAtom(tokensAtom)
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TABS[0])
  return (
    <>
      <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-top justify-between py-4 md:py-10 px-4 md:px-0 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
            Safe Vaults
          </h1>
          <p className="text-customGray100 md:text-white md:opacity-80">
            Manage Safe Vaults.
          </p>
        </div>
      </section>

      {Object.keys(tokens).length > 0
        ? <section className="mt-4">
          <TabSelector availableTabs={DEFAULT_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "Vaults" && <SafeVaultConfigurationContainer />}
          {activeTab === "Withdrawals" && <WithdrawalProcessingContainer />}
        </section>
        : <SpinningLogo />
      }
    </>
  )
}
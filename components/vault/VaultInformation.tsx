import { showSuccessToast } from "@/lib/toasts";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { VaultData } from "@/lib/types";
import TabSelector from "../common/TabSelector";
import HtmlRenderer from "../common/HtmlRenderer";
import CopyToClipboard from "react-copy-to-clipboard";
import { zeroAddress } from "viem";
import { useEffect, useState } from "react";

export default function VaultInformation({ vaultData }: { vaultData: VaultData }) {
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  const [tabs, setTabs] = useState<string[]>([]);

  useEffect(() => {
    if (String((vaultData.metadata.description || "") + (vaultData.metadata.riskDescription || "") + (vaultData.metadata.otherDescription || "")).length > 0) {
      setShowDescription(true);
      const _tabs = [];
      if (vaultData.metadata.description && vaultData.metadata.description.length > 0) {
        _tabs.push("General");
      }
      if (vaultData.metadata.riskDescription && vaultData.metadata.riskDescription.length > 0) {
        _tabs.push("Risk");
      }
      if (vaultData.metadata.otherDescription && vaultData.metadata.otherDescription.length > 0) {
        _tabs.push("Other");
      }
      setTabs(_tabs);
      setActiveTab(_tabs[0]);
    }
  }, [vaultData]);

  return (
    <div className="bg-customNeutral200 p-6 rounded-lg">
      <p className="text-white text-2xl font-bold">Information</p>
      {showDescription &&
        <>
          {tabs.length > 1 &&
            <div className="mb-4 mt-4 border-b border-customGray500">
              <div className="w-72">
                <TabSelector
                  availableTabs={tabs}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          }
          <div className="text-white">
            <HtmlRenderer
              // @ts-ignore
              htmlContent={activeTab === "General" ? vaultData.metadata.description : activeTab === "Risk" ? vaultData.metadata.riskDescription : vaultData.metadata.otherDescription}
            />
          </div>
        </>
      }
      <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4">

        <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
          <p className="text-white font-normal">Vault address:</p>
          <div className="flex flex-row items-center justify-between">
            <p className="font-bold text-white">
              {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
            </p>
            <div className='w-6 h-6 group/vaultAddress'>
              <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryGreen" />
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
                <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryGreen" />
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {vaultData.safes && vaultData.safes![0] !== zeroAddress &&
          <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
            <p className="text-white font-normal">Safe address:</p>
            <div className="flex flex-row items-center justify-between">
              <p className="font-bold text-white">
                {vaultData.safes[0].slice(0, 6)}...{vaultData.safes[0].slice(-4)}
              </p>
              <div className='w-6 h-6 group/safeAddress'>
                <CopyToClipboard text={vaultData.safes[0]} onCopy={() => showSuccessToast("Safe address copied!")}>
                  <Square2StackIcon className="text-white group-hover/safeAddress:text-primaryGreen" />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        }

        {vaultData.gauge && vaultData.gauge !== zeroAddress &&
          <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
            <p className="text-white font-normal">Gauge address:</p>
            <div className="flex flex-row items-center justify-between">
              <p className="font-bold text-white">
                {vaultData.gauge.slice(0, 6)}...{vaultData.gauge.slice(-4)}
              </p>
              <div className='w-6 h-6 group/gaugeAddress'>
                <CopyToClipboard text={vaultData.gauge} onCopy={() => showSuccessToast("Gauge address copied!")}>
                  <Square2StackIcon className="text-white group-hover/gaugeAddress:text-primaryGreen" />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  );
}
import { showSuccessToast } from "@/lib/toasts";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import CopyToClipboard from "react-copy-to-clipboard";
import VaultStats from "./VaultStats";
import VaultInteraction from "./VaultInteraction";
import Accordion from "@/components/common/Accordion";
import Modal from "@/components/modal/Modal";
import { useState } from "react";
import AssetWithName from "../AssetWithName";
import { LockVaultData } from "@/lib/types";

export default function LockVault({ vaultData, mutateTokenBalance, searchTerm }: { vaultData: LockVaultData, mutateTokenBalance: () => {}, searchTerm: string }): JSX.Element {
  const [showModal, setShowModal] = useState(false)

  if (!vaultData) return <></>
  if (searchTerm !== "" &&
    !vaultData.vault.name.toLowerCase().includes(searchTerm) &&
    !vaultData.vault.symbol.toLowerCase().includes(searchTerm))
    return <></>
  return (
    <>
      <Modal visibility={[showModal, setShowModal]} title={<AssetWithName vault={vaultData} />} >
        <div className="flex flex-col md:flex-row w-full md:gap-8 min-h-128">
          <div className="w-full md:w-1/2 text-start flex flex-col justify-between">

            <div className="space-y-4">
              <VaultStats
                vaultData={vaultData}
              />
            </div>

            <div className="hidden md:block space-y-4">
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Asset address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.asset.address.slice(0, 6)}...{vaultData.asset.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/assetAddress'>
                    <CopyToClipboard text={vaultData.asset.address} onCopy={() => showSuccessToast("Asset address copied!")}>
                      <Square2StackIcon className="text-white group-hover/assetAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/vaultAddress'>
                    <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="w-full md:w-1/2 mt-4 md:mt-0 flex-grow rounded-lg border border-[#353945] bg-[#141416] p-6">
            <VaultInteraction
              vaultData={vaultData}
              hideModal={() => setShowModal(false)}
              mutateTokenBalance={mutateTokenBalance}
            />
          </div>

        </div>
      </Modal>
      <Accordion handleClick={() => setShowModal(true)}>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>
          <VaultStats vaultData={vaultData} />
        </div>
      </Accordion >
    </>
  )
}
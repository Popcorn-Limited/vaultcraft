

import MainActionButton from "@/components/button/MainActionButton";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import FeeConfiguration from "@/components/deploymentSections/FeeConfiguration";
import InputNumber from "@/components/input/InputNumber";
import { feeAtom } from "@/lib/atoms";
import { VaultData, VaultsV2Fee, VaultsV2FeeConfig } from "@/lib/types";
import { validateInput } from "@/lib/utils/helpers";
import { acceptFees, proposeFees, setV2Fees } from "@/lib/vault/management/interactions";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, formatEther, parseEther, parseUnits, zeroAddress } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

export default function VaultV2FeeConfiguration({
  vaultData,
  callAddress,
  fees,
  disabled
}: {
  vaultData: VaultData;
  callAddress: Address;
  fees: VaultsV2FeeConfig;
  disabled: boolean;
}): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient();

  const [newFees, setNewFees] = useState<VaultsV2FeeConfig>()

  useEffect(() => {
    if (fees) {
      setNewFees({
        performance: {
          value: String(Number(fees.performance.value) / 1e18),
          exists: fees.performance.exists
        },
        management: {
          value: String(Number(fees.management.value) / 1e18),
          exists: fees.management.exists
        }
      })
    }
  }, [fees])

  function handleChangeInput(e: any, key: "management" | "performance") {
    if (!newFees) return
    const value = e.currentTarget.value;
    const numVal = validateInput(value).isValid ? value : "0"
    setNewFees({ ...newFees, [key]: { value: numVal, exists: fees[key].exists } });
  }

  function handleMainAction() {
    if (!newFees) return
    const param = { ...newFees }
    param.performance.value = Number(parseEther(String(param.performance.value))) / 100
    param.management.value = Number(parseEther(String(param.management.value))) / 100

    setV2Fees({
      fees: param,
      vaultData,
      address: vaultData.address,
      account: account!,
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!,
      },
    })
  }

  return newFees && Object.keys(newFees).length > 0 ? (
    <div className="flex flex-row justify-center">
      <div className="w-full">
        <p className="text-customGray500">
          Change the fees for this vault. Some Vaults support management and performance fees other just performance fees.
        </p>
        <div className="">
          <div className="mb-8 mt-4">
            <p className="font-bold text-start">Current Fee Configuration:</p>
            <p className={fees.performance.exists ? "text-white" : "text-gray-500 line-through"}>Performance Fee: {Number(fees.performance.value) / 1e18} %</p>
            <p className={fees.management.exists ? "text-white" : "text-gray-500 line-through"}>Management Fee: {Number(fees.management.value) / 1e18} %</p>
          </div>
          <div className="mt-4">
            <p className="font-bold text-start">New Fee Configuration:</p>
            <span>
              <p className={fees.performance.exists ? "text-white" : "text-gray-500 line-through"}>Performance Fee:</p>
              <span className="flex flex-row items-center">
                <div className="mt-1 border border-customGray500 p-4 rounded-md w-60">
                  <InputNumber
                    value={String(newFees.performance.value)}
                    onChange={(e) => handleChangeInput(e, "performance")}
                    type="text"
                    disabled={!fees.performance.exists}
                  />
                </div>
                <p className="text-white ml-2 text-xl">= {newFees.performance.value} %</p>
              </span>
            </span>
            <span>
              <p className={fees.management.exists ? "text-white" : "text-gray-500 line-through"}>Management Fee:</p>
              <span className="flex flex-row items-center">
                <div className="mt-1 border border-customGray500 p-4 rounded-md w-60">
                  <InputNumber
                    value={String(newFees.management.value)}
                    onChange={(e) => handleChangeInput(e, "management")}
                    type="text"
                    disabled={!fees.management.exists}
                  />
                </div>
                <p className="text-white ml-2 text-xl">= {newFees.management.value} %</p>
              </span>
            </span>
          </div>
          <div className="w-60 mt-4">
            <MainButtonGroup
              label="Set Fees"
              mainAction={handleMainAction}
              chainId={vaultData.chainId}
              disabled={disabled}
            />
          </div>
        </div>
      </div >
    </div >
  )
    : <></>
}

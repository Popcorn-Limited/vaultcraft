import MainActionButton from "@/components/button/MainActionButton";
import { tokensAtom } from "@/lib/atoms";
import { Token, VaultData, VaultV2Settings } from "@/lib/types";
import { useAtom } from "jotai";
import { useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ArrowDownIcon, ArrowUpIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { changeVaultV2NewStrategies, proposeVaultV2NewStrategies, setWithdrawalQueue } from "@/lib/vault/management/interactions";
import StrategyName from "@/components/common/StrategyName";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import { Address, getAddress, isAddress, maxUint256 } from "viem";
import InputNumber from "@/components/input/InputNumber";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import CopyToClipboard from "react-copy-to-clipboard";

export default function VaultV2Strategies({
  vaultData,
  settings,
  disabled
}: {
  vaultData: VaultData;
  settings: VaultV2Settings;
  disabled: boolean;
}): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const [tokens] = useAtom(tokensAtom);

  const [newStrategy, setNewStrategy] = useState<string>("")
  const [newStrategies, setNewStrategies] = useState<Address[]>([])
  const [newDepositIndex, setNewDepositIndex] = useState<number>(Number(maxUint256));

  function addStrategy() {
    if (!isAddress(newStrategy)) {
      showErrorToast("Not a valid address")
      return
    }
    if (newStrategies.includes(getAddress(newStrategy))) {
      showErrorToast("Address already included")
      return
    }

    setNewStrategies([...newStrategies, getAddress(newStrategy)])
    setNewStrategy("")
  }

  function removeStrategy(current: number) {
    const newQueue = [...newStrategies]
    newQueue.splice(current, 1)

    setNewStrategies(newQueue)
  }

  function adjustQueuePosition(current: number, target: number) {
    if (target < 0) target = 0;
    if (target === newStrategies.length) target = newStrategies.length - 1

    const newQueue = [...newStrategies]
    const removed = newQueue.splice(current, 1)
    newQueue.splice(target, 0, removed[0])
    setNewStrategies(newQueue)
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="w-full">
        <p className="text-customGray500">
          Propose new strategies and set their withdrawal queue + auto deposit.
        </p>
        <div className="mb-8 mt-4">
          <p className="font-bold text-start">Current Strategies:</p>
          {vaultData.strategies.map((strategy, i) =>
            <div key={strategy.address} className="w-max px-4 py-2 flex flex-row items-center">
              <div>
                <StrategyName
                  strategy={strategy}
                  asset={tokens[vaultData.chainId][strategy.asset]}
                  yieldToken={strategy.yieldToken ? tokens[vaultData.chainId][strategy.yieldToken!] : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {settings.proposedStrategyTime > 0 ?
          <div>
            <div>
              <p className="font-bold text-start">Proposed Strategies:</p>
              <div className="text-white space-y-2">
                {settings.proposedStrategies
                  .map(strategy =>
                    <CopyToClipboard
                      key={strategy}
                      text={strategy}
                      onCopy={() => showSuccessToast(`${strategy} address copied!`)}
                    >
                      <div className="flex flex-row items-center justify-between group/address cursor-pointer w-108">
                        <p className="group-hover/address:text-primaryYellow">
                          {strategy}
                        </p>
                        <div className={`w-6 h-6`}>
                          <Square2StackIcon className={`group-hover/address:text-primaryYellow`} />
                        </div>
                      </div>
                    </CopyToClipboard>
                  )}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-bold text-start">Proposed Auto Deposit:</p>
              <div className="text-white space-y-2">
                {settings.proposedDepositIndex === Number(maxUint256) ?
                  <p className="text-white">Disabled Auto-Deposit</p>
                  : <CopyToClipboard
                    text={settings.proposedStrategies[settings.proposedDepositIndex]}
                    onCopy={() => showSuccessToast(`${settings.proposedStrategies[settings.proposedDepositIndex]} address copied!`)}
                  >
                    <div className="flex flex-row items-center justify-between group/address cursor-pointer w-108">
                      <p className="group-hover/address:text-primaryYellow">
                        {settings.proposedStrategies[settings.proposedDepositIndex]}
                      </p>
                      <div className={`w-6 h-6`}>
                        <Square2StackIcon className={`group-hover/address:text-primaryYellow`} />
                      </div>
                    </div>
                  </CopyToClipboard>
                }
              </div>
            </div>
            <div className="mt-4">
              <p className="font-bold text-start">Set proposed change at:</p>
              <p className="text-white">{(new Date(settings.proposedStrategyTime * 1000)).toLocaleString()} UTC</p>
            </div>

            <div className="w-60 py-6">
              <MainButtonGroup
                label="Change new strategies"
                mainAction={() =>
                  changeVaultV2NewStrategies({
                    vaultData,
                    address: vaultData.address,
                    account,
                    clients: {
                      publicClient: publicClient!,
                      walletClient: walletClient!,
                    },
                  })}
                chainId={vaultData.chainId}
                disabled={disabled}
              />
            </div>
          </div>

          : <div>
            <p className="font-bold text-start">New Strategies:</p>
            <div>
              <p className="text-customGray500">Enter the address of a viable ERC-4626</p>
              <span className="flex flex-row items-center">
                <div className="mt-1 border border-customGray500 p-4 rounded-md w-1/2">
                  <InputNumber
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.currentTarget.value)}
                    type="text"
                  />
                </div>
                <div className="ml-4 w-60">
                  <MainActionButton label="Add" handleClick={addStrategy} />
                </div>
              </span>
            </div>
            {newStrategies.map((strategy, i) =>
              <div key={strategy + "-new"} className="w-max px-4 py-2 flex flex-row items-center">
                <div className="mr-4">
                  <ArrowUpIcon
                    className="text-white h-5 w-5 cursor-pointer hover:text-primaryYellow"
                    onClick={() => adjustQueuePosition(i, i - 1)}
                  />
                  <ArrowDownIcon
                    className="text-white h-5 w-5 cursor-pointer hover:text-primaryYellow"
                    onClick={() => adjustQueuePosition(i, i + 1)}
                  />
                </div>
                <div className="mr-4">
                  <p>{strategy}</p>
                </div>
                <SecondaryActionButton label="Remove" handleClick={() => removeStrategy(i)} />
              </div>
            )}

            <div className="mt-12">
              <p className="font-bold text-start">Auto Deposit Options:</p>
              <div className="">
                <div
                  className={`${settings.depositIndex === Number(maxUint256) ? "hidden" : ""} ${newDepositIndex === Number(maxUint256) ? "border border-white" : ""} flex flex-row py-2 px-4 cursor-pointer rounded-lg hover:bg-gray-500`}
                  onClick={() => setNewDepositIndex(Number(maxUint256))}
                >
                  <div className="flex flex-row items-center">
                    <p className=" text-white">
                      Disable Auto-Deposit
                    </p>
                  </div>
                </div>
                {newStrategies.map((strategy, i) =>
                  <div
                    key={`${strategy}-index`}
                    className={`${newDepositIndex === i ? "border border-white" : ""} py-2 px-4 cursor-pointer rounded-lg hover:bg-gray-500`}
                    onClick={() => setNewDepositIndex(i)}
                  >
                    <p>{strategy}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-60 py-6">
              <MainButtonGroup
                label="Propose new strategies"
                mainAction={() =>
                  proposeVaultV2NewStrategies({
                    strategies: newStrategies,
                    withdrawalQueue: newStrategies.map((s, i) => i),
                    depositIndex: newDepositIndex,
                    vaultData,
                    address: vaultData.address,
                    account,
                    clients: {
                      publicClient: publicClient!,
                      walletClient: walletClient!,
                    },
                  })}
                chainId={vaultData.chainId}
                disabled={disabled}
              />
            </div>
          </div>
        }
      </div>
    </div>
  );
}

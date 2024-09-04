import MainActionButton from "@/components/button/MainActionButton";
import { tokensAtom } from "@/lib/atoms";
import { Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { handleSwitchChain } from "@/lib/utils/helpers";
import { setWithdrawalQueue } from "@/lib/vault/management/interactions";
import StrategyName from "@/components/common/StrategyName";
import MainButtonGroup from "@/components/common/MainButtonGroup";

export default function VaultWithdrawalQueue({
  vaultData,
  asset,
  withdrawalQueue,
  disabled
}: {
  vaultData: VaultData;
  asset: Token;
  withdrawalQueue: number[];
  disabled: boolean;
}): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const [tokens] = useAtom(tokensAtom);

  const [newWithdrawalQueue, setNewWithdrawalQueue] = useState<number[]>(withdrawalQueue);

  function adjustQueuePosition(current: number, target: number) {
    if (target < 0) target = 0;
    if (target === newWithdrawalQueue.length) target = newWithdrawalQueue.length - 1

    const newQueue = [...newWithdrawalQueue]
    const removed = newQueue.splice(current, 1)
    newQueue.splice(target, 0, removed[0])
    setNewWithdrawalQueue(newQueue)
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="w-full">
        <p className="text-customGray500">
          Change the withdrawal queue for this vault. Users will withdraw funds from the first to the last strategy until their withdrawal amount is reached.
        </p>
        <div className="mb-8 mt-4">
          <p className="font-bold text-start">Current Withdrawal Queue:</p>
          {withdrawalQueue.map((index, i) =>
            <div key={vaultData.strategies[index].address} className="w-max px-4 py-2 flex flex-row items-center">
              <div>
                <StrategyName
                  strategy={vaultData.strategies[index]}
                  asset={tokens[vaultData.chainId][vaultData.strategies[index].asset]}
                  yieldAsset={vaultData.strategies[index].yieldAsset ? tokens[vaultData.chainId][vaultData.strategies[index].yieldAsset!] : undefined}
                />
              </div>
            </div>
          )
          }
        </div>
        <div>
          <p className="font-bold text-start">New Withdrawal Queue:</p>
          {asset &&
            newWithdrawalQueue.map((index, i) =>
              <div key={vaultData.strategies[index].address + "-new"} className="w-max px-4 py-2 flex flex-row">
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
                <div>
                  <StrategyName
                    strategy={vaultData.strategies[index]}
                    asset={tokens[vaultData.chainId][vaultData.strategies[index].asset]}
                    yieldAsset={vaultData.strategies[index].yieldAsset ? tokens[vaultData.chainId][vaultData.strategies[index].yieldAsset!] : undefined}
                  />
                </div>
              </div>
            )}
          <div className="w-60 py-6">
            <MainButtonGroup
              label="Set Withdrawal Queue"
              mainAction={() =>
                setWithdrawalQueue({
                  withdrawalQueue: newWithdrawalQueue,
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
      </div>
    </div>
  );
}

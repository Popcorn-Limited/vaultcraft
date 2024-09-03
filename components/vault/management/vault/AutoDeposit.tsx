import MainActionButton from "@/components/button/MainActionButton";
import Input from "@/components/input/Input";
import { tokensAtom } from "@/lib/atoms";
import { Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { FormEventHandler, useState } from "react";
import { Address, maxUint256 } from "viem";
import { IconByProtocol } from "@/components/common/ProtocolIcon";
import { setDepositIndex } from "@/lib/vault/management/interactions";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { handleSwitchChain } from "@/lib/utils/helpers";
import StrategyName from "@/components/common/StrategyName";

export default function VaultAutoDeposit({
  vaultData,
  asset,
  depositIndex,
  disabled
}: {
  vaultData: VaultData;
  asset: Token;
  depositIndex: number;
  disabled: boolean;
}): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: vaultData.chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [tokens] = useAtom(tokensAtom);
  const [newDepositIndex, setNewDepositIndex] = useState<number>(depositIndex);

  return Object.keys(tokens).length > 0 ? (
    <div className="flex flex-row justify-center">
      <div className="w-full">
        <p className="text-customGray500">
          Select if user deposits get deposited into a strategy or stay idle. If auto-deposit is on you can choose in which strategy they will deposit automatically.
        </p>
        <div className="">
          <div className="mb-8 mt-4">
            <p className="font-bold text-start">Current Auto Deposit:</p>
            {depositIndex === Number(maxUint256)
              ? <h2 className="text-xl font-bold text-white">
                Auto Deposit Off
              </h2>
              : <StrategyName
                strategy={vaultData.strategies[depositIndex]}
                asset={tokens[vaultData.chainId][vaultData.strategies[depositIndex].asset]}
                yieldAsset={vaultData.strategies[depositIndex].yieldAsset ? tokens[vaultData.chainId][vaultData.strategies[depositIndex].yieldAsset!] : undefined}
              />
            }
          </div>
          <div>
            <p className="font-bold text-start">Auto Deposit Options:</p>
            <div className="">
              <div
                className={`${depositIndex === Number(maxUint256) ? "hidden" : ""} ${newDepositIndex === Number(maxUint256) ? "border border-white" : ""} flex flex-row py-2 px-4 cursor-pointer rounded-lg hover:bg-gray-500`}
                onClick={() => setNewDepositIndex(Number(maxUint256))}
              >
                <div className="flex flex-row items-center">
                  <img
                    src={"/images/tokens/vcx.svg"}
                    className={`h-6 w-6 mr-2 mb-1.5 rounded-full border border-white`}
                  />
                  <h2 className="text-xl font-bold text-white">
                    Disable Auto-Deposit
                  </h2>
                </div>
              </div>
              {asset &&
                vaultData.strategies.map((strategy, i) =>
                  <div
                    key={`${strategy.resolver}-${i}`}
                    className={`${depositIndex === i ? "hidden" : ""} ${newDepositIndex === i ? "border border-white" : ""} py-2 px-4 cursor-pointer rounded-lg hover:bg-gray-500`}
                    onClick={() => setNewDepositIndex(i)}
                  >
                    <StrategyName
                      strategy={strategy}
                      asset={tokens[vaultData.chainId][strategy.asset]}
                      yieldAsset={strategy.yieldAsset ? tokens[vaultData.chainId][strategy.yieldAsset] : undefined}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="w-60 py-6">
          {!account &&
            <MainActionButton
              label={"Connect Wallet"}
              handleClick={openConnectModal}
            />
          }
          {(account && chain?.id !== Number(vaultData.chainId)) &&
            <MainActionButton
              label="Switch Chain"
              handleClick={() => handleSwitchChain(vaultData.chainId, switchChainAsync)}
            />
          }
          {(account && chain?.id === Number(vaultData.chainId)) &&
            <MainActionButton label="Change Deposit Limit"
              handleClick={() =>
                setDepositIndex({
                  depositIndex: BigInt(newDepositIndex),
                  vaultData,
                  address: vaultData.address,
                  account,
                  clients: {
                    publicClient: publicClient!,
                    walletClient: walletClient!,
                  },
                })
              }
              disabled={disabled}
            />
          }
        </div>
      </div>
    </div >
  )
    : <p className="text-white">Loading...</p>
}

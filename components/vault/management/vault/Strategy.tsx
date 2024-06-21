import MainActionButton from "@/components/button/MainActionButton";
import InputNumber from "@/components/input/InputNumber";
import { VaultData } from "@/lib/types";
import { acceptStrategy, proposeStrategy } from "@/lib/vault/management/interactions";
import { useState } from "react";
import { Address, getAddress, isAddress, zeroAddress } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function VaultStrategyConfiguration({
  vaultData,
  callAddress,
  proposedStrategies,
  proposedStrategyTime
}: {
  vaultData: VaultData;
  callAddress: Address;
  proposedStrategies: Address[];
  proposedStrategyTime: number;
}): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [newStrategy, setNewStrategy] = useState<string>(zeroAddress)

  return (
    <>
      <div className="flex flex-row justify-center">
        <div className="w-1/2">
          <p className="text-customGray500">
            Change the strategy used by this vault. The new strategy MUST use
            the same asset as the current and it MUST adhere to the ERC-4626 standard.
            This process of changing strategies happens in two steps.
            First a new strategy must be proposed. Users now have three days to
            withdraw their funds if they dislike the change. After three days
            the change can be accepted. When accepting all funds from the old
            strategy will be withdrawn and deposited into the new strategy.
          </p>
          <div className="mt-4">
            <h2 className="text-xl">Current Strategy</h2>
            <div className="mt-1 border border-customGray500 p-4 rounded-md">
              <p>{vaultData.strategies[0].address}</p>
            </div>

            {proposedStrategies[0] !== zeroAddress && (
              <div className="mt-4">
                <h2 className="text-xl">Proposed Strategy</h2>
                <div className="mt-1 border border-customGray500 p-4 rounded-md">
                  <p>{proposedStrategies[0]}</p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h2 className="text-xl">Propose Strategy</h2>
              <p className="text-customGray500">Enter a viable ERC-4626 strategy address</p>
              <div className="mt-1 border border-customGray500 p-4 rounded-md">
                <InputNumber
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.currentTarget.value)}
                  type="text"
                />
              </div>
            </div>

          </div>
          <div className="flex flex-row items-center gap-x-4">
            <div className="w-60 mt-4">
              <MainActionButton
                label="Accept Proposed Strategy"
                handleClick={() => acceptStrategy({
                  address: callAddress,
                  vaultData,
                  account,
                  clients: {
                    publicClient,
                    walletClient: walletClient!,
                  }
                })}
                disabled={proposedStrategyTime === 0}
              />
            </div>
            <div className="w-60 mt-4">
              <MainActionButton
                label="Propose new Strategy"
                handleClick={() =>
                  proposeStrategy({
                    strategy: getAddress(newStrategy),
                    address: callAddress,
                    vaultData,
                    account,
                    clients: {
                      publicClient,
                      walletClient: walletClient!,
                    },
                  })
                }
                disabled={newStrategy === zeroAddress || !isAddress(newStrategy)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

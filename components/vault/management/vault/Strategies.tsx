import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import ProtocolIcon from "@/components/common/ProtocolIcon";
import InputNumber from "@/components/input/InputNumber";
import Modal from "@/components/modal/Modal";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { ADDRESS_ZERO, AdminProxyByChain, VaultControllerByChain } from "@/lib/constants";
import { VaultData } from "@/lib/types";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { acceptStrategies, acceptStrategy, proposeStrategies, proposeStrategy } from "@/lib/vault/management/interactions";
import axios from "axios";
import { useAtom } from "jotai";
import { VaultSettings } from "pages/manage/vaults/[id]";
import { useEffect, useState } from "react";
import { ProtocolName, VaultController, YieldOptions } from "vaultcraft-sdk";
import { Address, WalletClient, getAddress, isAddress, zeroAddress } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function VaultStrategiesConfiguration({
  vaultData,
  callAddress,
  settings,
}: {
  vaultData: VaultData;
  callAddress: Address;
  settings: VaultSettings;
}): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [inputValue, setInputValue] = useState<string>("")

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
            <h2 className="text-xl">Current Strategies</h2>
            <div className="mt-1 border border-customGray500 p-4 rounded-md">
              {vaultData.strategies.map(strategy => <p key={strategy.address}>{strategy.address}</p>)}
            </div>

            {settings.proposedStrategies.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xl">Proposed Strategy</h2>
                <div className="mt-1 border border-customGray500 p-4 rounded-md">
                  {settings.proposedStrategies.map(strategy => <p key={strategy}>{strategy}</p>)}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h2 className="text-xl">Propose Strategy</h2>
              <p className="text-customGray500">Enter the addresses of viable ERC-4626 seperated by comma. (address1,address2)</p>
              <div className="mt-1 border border-customGray500 p-4 rounded-md">
                <InputNumber
                  value={inputValue}
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                  type="text"
                />
              </div>
            </div>

          </div>
          <div className="flex flex-row items-center gap-x-4">
            <div className="w-60 mt-4">
              <MainActionButton
                label="Accept Proposed Strategy"
                handleClick={() => acceptStrategies({
                  address: callAddress,
                  vaultData,
                  account,
                  clients: {
                    publicClient,
                    walletClient: walletClient!,
                  }
                })}
                disabled={Number(settings.proposedStrategyTime) === 0}
              />
            </div>
            <div className="w-60 mt-4">
              <MainActionButton
                label="Propose new Strategy"
                handleClick={() =>
                  proposeStrategies({
                    strategies: inputValue.split(",").map(addr => getAddress(addr)),
                    address: callAddress,
                    vaultData,
                    account,
                    clients: {
                      publicClient,
                      walletClient: walletClient!,
                    },
                  })
                }
                disabled={!inputValue.split(",").every(addr => isAddress(addr) && getAddress(addr) !== zeroAddress)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

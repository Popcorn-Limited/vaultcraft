import MainActionButton from "@/components/button/MainActionButton";
import Input from "@/components/input/Input";
import { tokensAtom } from "@/lib/atoms";
import { Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { FormEventHandler, useState } from "react";
import { Address, maxUint256 } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import StrategyDescription from "../../StrategyDescription";

export default function VaultDepositIndex({
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
  const [newDepositIndex, setNewDepositIndex] = useState<number>(depositIndex);

  return (
    <div className="flex flex-row justify-center">
      <div className="w-full">
        <p className="text-customGray500">
          Change the deposit index for this vault.
        </p>
        <div className="mb-8 mt-4">
          <p className="font-bold">Old Deposit Index</p>
          <p className="">
            {depositIndex}
          </p>
          {
            depositIndex === Number(maxUint256)
              ? <p>Auto Deposit Off</p>
              : <StrategyDescription
                strategy={vaultData.strategies[depositIndex]}
                asset={asset}
                chainId={vaultData.chainId}
                i={0}
                stratLen={vaultData.strategies.length}
              />
          }
        </div>
        <div>
          <p className="font-bold text-start">New Deposit Index</p>
          <p className="text-white text-2xl font-bold">Strategies</p>
          {asset &&
            vaultData.strategies.map((strategy, i) =>
              <StrategyDescription
                key={`${strategy.resolver}-${i}`}
                strategy={strategy}
                asset={asset}
                chainId={vaultData.chainId}
                i={i}
                stratLen={vaultData.strategies.length}
              />
            )}
        </div>
        {/* <div className="w-60 mt-4">
          <MainActionButton
            label="Change Deposit Limit"
            handleClick={() =>
              changeDepositLimit({
                depositLimit: Number(depositLimit),
                vaultData,
                address: callAddress,
                account,
                clients: {
                  publicClient: publicClient!,
                  walletClient: walletClient!,
                },
              })
            }
            disabled={ }
          />
        </div> */}
      </div>
    </div>
  );
}

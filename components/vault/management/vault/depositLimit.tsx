import MainActionButton from "@/components/button/MainActionButton";
import Input from "@/components/input/Input";
import { tokensAtom } from "@/lib/atoms";
import { VaultData } from "@/lib/types";
import { changeDepositLimit } from "@/lib/vault/management/interactions";
import { useAtom } from "jotai";
import { VaultSettings } from "pages/manage/vaults/[id]";
import { FormEventHandler, useState } from "react";
import { Address, WalletClient, maxUint256 } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function VaultDepositLimit({
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

  const [tokens] = useAtom(tokensAtom)

  const [depositLimit, setDepositLimit] = useState<string>(
    String(vaultData.depositLimit / 10 ** tokens[vaultData.chainId][vaultData.asset].decimals)
  );

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    setDepositLimit(value);
  };

  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/2">
        <p className="text-customGray500">
          Change the deposit limit for this vault. The deposit limit controls
          the maximum amount of assets that can be deposited across all users.
          If a new deposit would breach the deposit limit it will revert. The
          new deposit limit does not affect already deposited assets.
        </p>
        <div className="mb-8 mt-4">
          <p className="font-bold">Old Deposit Limit</p>
          <p className="">
            {vaultData.depositLimit === Number(maxUint256)
              ? "∞"
              : vaultData.depositLimit / 10 ** tokens[vaultData.chainId][vaultData.asset].decimals}{" "}
            {tokens[vaultData.chainId][vaultData.asset].symbol}
          </p>
        </div>
        <div>
          <p className="font-bold text-start">New Deposit Limit</p>
          <Input value={String(depositLimit)} onChange={handleChangeInput} />
        </div>
        <div className="w-60 mt-4">
          <MainActionButton
            label="Change Deposit Limit"
            disabled={
              Number(depositLimit) ===
              vaultData.depositLimit / 10 ** tokens[vaultData.chainId][vaultData.asset].decimals ||
              Number(depositLimit) === 0
            }
            handleClick={() =>
              changeDepositLimit({
                depositLimit: Number(depositLimit),
                vaultData,
                address: callAddress,
                account,
                clients: {
                  publicClient,
                  walletClient: walletClient!,
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

import MainActionButton from "@/components/button/MainActionButton";
import Input from "@/components/input/Input";
import { VaultData } from "@/lib/types";
import { FormEventHandler, useState } from "react";
import { Address, isAddress, zeroAddress } from "viem";

export default function VaultFeeRecipient({ vaultData, settings }: { vaultData: VaultData, settings: any }): JSX.Element {
  const [feeRecipient, setFeeRecipient] = useState<string>(vaultData.metadata.feeRecipient)

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setFeeRecipient(value);
  };

  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/2">
        <p className="text-gray-500">
          Change the address receiving fees from this vault. 
          Fee shares that got minted already will not be transfered to the new fee recipient.
        </p>
        <div className="mb-8 mt-4">
          <p className="font-bold">Old Fee Fecipient</p>
          <p className="">{vaultData.metadata.feeRecipient}</p>
        </div>
        <div>
          <p className="font-bold text-start">
            New Fee Recipient
          </p>
          <Input
            value={String(feeRecipient)}
            onChange={handleChangeInput}
          />
        </div>
        <div className="w-60 mt-4">
          <MainActionButton
            label="Change Fee Recipient"
            disabled={feeRecipient === vaultData.metadata.feeRecipient || !isAddress(feeRecipient) || feeRecipient === zeroAddress}
          />
        </div>
      </div>
    </div>
  )
}
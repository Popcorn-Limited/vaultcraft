import MainActionButton from "@/components/button/MainActionButton";
import FeeConfiguration from "@/components/deploymentSections/FeeConfiguration";
import { feeAtom } from "@/lib/atoms";
import { VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function VaultFeeConfiguration({ vaultData, settings }: { vaultData: VaultData, settings: any }): JSX.Element {
  const [, setFee] = useAtom(feeAtom);

  useEffect(() => {
    if (vaultData) setFee({
      deposit: String(vaultData.fees.deposit / 1e16),
      withdrawal: String(vaultData.fees.withdrawal / 1e16),
      management: String(vaultData.fees.management / 1e16),
      performance: String(vaultData.fees.performance / 1e16),
      recipient: String(vaultData.metadata.feeRecipient),
    })
  }, [vaultData])

  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/2">
        <p className="text-gray-500">
          Change the fees for this vault.
          This process happens in two steps. First new fees must be proposed.
          Users now have three days to withdraw their funds if they dislike the change.
          After three days the change can be accepted.
        </p>
        {Number(settings.proposedFeeTime) > 0 ?
          <div className="mt-4">
            <p className="font-bold">Proposed Fee Configuration</p>
            <p>Deposit: {vaultData.fees.deposit / 1e16} %</p>
            <p>Withdrawal: {vaultData.fees.withdrawal / 1e16} %</p>
            <p>Performance: {vaultData.fees.performance / 1e16} %</p>
            <p>Management: {vaultData.fees.management / 1e16} %</p>
          </div>
          : <FeeConfiguration showFeeRecipient={false} />
        }
        <div className="w-60 mt-4">
          {Number(settings.proposedFeeTime) > 0 ? <MainActionButton label="Propose new Fee" /> : <MainActionButton label="Accept new Fee" />}
        </div>
      </div>
    </div>
  )
}
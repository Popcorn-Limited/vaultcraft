import { VaultData } from "@/lib/types";
import { formatUnits } from "viem";

export default function VaultFeeBreakdown({vaultData}:{vaultData:VaultData}):JSX.Element {
  return (
    <div className="mt-4">
        <p className="text-white font-bold mb-2 text-start">Fee Breakdown</p>
        <div className="bg-customNeutral200 py-2 px-4 rounded-lg space-y-2">
          <span className="flex flex-row items-center justify-between text-white">
            <p>Deposit Fee</p>
            <p>{formatUnits(vaultData.fees.deposit, 16)} %</p>
          </span>
          <span className="flex flex-row items-center justify-between text-white">
            <p>Withdrawal Fee</p>
            <p>{formatUnits(vaultData.fees.withdrawal, 16)} %</p>
          </span>
          <span className="flex flex-row items-center justify-between text-white">
            <p>Management Fee</p>
            <p>{formatUnits(vaultData.fees.management, 16)} %</p>
          </span>
          <span className="flex flex-row items-center justify-between text-white">
            <p>Performance Fee</p>
            <p>{formatUnits(vaultData.fees.performance, 16)} %</p>
          </span>
        </div>
      </div>
  )
}
import { calcDaysToUnlock, calcUnlockTime, calculateVeOut } from "@/lib/gauges/utils"

export default function IncreaseTimePreview({ days, lockedBal }: { days: number, lockedBal: { amount: bigint, end: bigint } }): JSX.Element {
  const totalDays = calcDaysToUnlock(Number(lockedBal?.end)) + days
  const amount = Number(lockedBal?.amount) / 1e18

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Preview Lock</h2>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Lock Time</p>
          <p className="text-[#141416]">{days} Days</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p className="text-[#141416]">{new Date(calcUnlockTime(totalDays)).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Lock Amount</p>
          <p className="text-[#141416]">{lockedBal && amount.toFixed(2)}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>New Voting Power</p>
          <p className="text-[#141416]">{amount > 0 ? calculateVeOut(amount, totalDays).toFixed(2) : "0"} vePOP</p>
        </div>
      </div>

      <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
        <p className="text-primaryDark">Important: vePOP is not transferrable and unlocking POP LP early results in a penalty of up to 75% of your POP LP</p>
      </div>

    </div >
  )
}
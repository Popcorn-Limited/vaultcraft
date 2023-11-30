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
          <p>{days} Days</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p>{new Date(calcUnlockTime(totalDays)).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Lock Amount</p>
          <p>{lockedBal && amount.toFixed(2)}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>New Voting Power</p>
          <p>{amount > 0 ? calculateVeOut(amount, totalDays).toFixed(2) : "0"} veVCX</p>
        </div>
      </div>

      <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
        <p className="text-primaryDark">Important: veVCX is not transferrable and unlocking VCX-LP early results in a penalty of up to 75% of your VCX-LP</p>
      </div>

    </div >
  )
}
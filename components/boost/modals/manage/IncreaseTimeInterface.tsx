import { Dispatch, FormEventHandler, SetStateAction } from "react";
import InputNumber from "@/components/input/InputNumber";
import { calcDaysToUnlock, calcUnlockTime, calculateVeOut } from "@/lib/gauges/utils";


function LockTimeButton({ label, isActive, handleClick }: { label: string, isActive: boolean, handleClick: Function }): JSX.Element {
  return (
    <button
      className={`w-10 h-10 border border-[#C8C8C8] rounded-lg ${isActive ? "bg-[#D7D5BC] text-[#645F4B]" : "text-[#969696]"}`}
      onClick={() => handleClick()}
    >
      {label}
    </button>
  )
}

export default function IncreaseTimeInterface({ daysState, lockedBal }:
  { daysState: [number, Dispatch<SetStateAction<number>>], lockedBal: { amount: bigint, end: bigint } }): JSX.Element {
  const [days, setDays] = daysState

  const handleSetDays: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setDays(Number(value));
  };

  const totalDays = calcDaysToUnlock(Number(lockedBal?.end)) + days

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Increase lock time</h2>

      <div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-primary font-semibold mb-1">Lockup Time</p>
          <p className="w-32 text-secondaryLight">Custom Time</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <LockTimeButton label="1W" isActive={days === 7} handleClick={() => setDays(7)} />
          <LockTimeButton label="1M" isActive={days === 30} handleClick={() => setDays(30)} />
          <LockTimeButton label="3M" isActive={days === 90} handleClick={() => setDays(90)} />
          <LockTimeButton label="6M" isActive={days === 180} handleClick={() => setDays(180)} />
          <LockTimeButton label="1Y" isActive={days === 365} handleClick={() => setDays(365)} />
          <LockTimeButton label="2Y" isActive={days === 730} handleClick={() => setDays(730)} />
          <LockTimeButton label="4Y" isActive={days === 1460} handleClick={() => setDays(1460)} />
          <div className="w-32 flex px-5 py-2 items-center rounded-lg border border-customLightGray">
            <InputNumber
              onChange={handleSetDays}
              value={days}
              autoComplete="off"
              autoCorrect="off"
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder={"0.0"}
              minLength={1}
              maxLength={79}
              spellCheck="false"
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlocks at:</p>
          <p>{new Date(calcUnlockTime(totalDays)).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <p className="text-primary font-semibold mb-1">New Voting Power</p>
        <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
          <p className="text-primaryDark">{Number(lockedBal?.amount) > 0 ? calculateVeOut(Number(lockedBal?.amount) / 1e18, totalDays).toFixed(2) : "0"}</p>
        </div>
      </div>

    </div>
  )
}
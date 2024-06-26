import { calcDaysToUnlock, calculateVeOut } from "@/lib/gauges/utils";

export default function IncreaseStakePreview({
  amount,
  lockedBal,
}: {
  amount: string;
  lockedBal: { amount: bigint; end: bigint };
}): JSX.Element {
  const val = Number(amount);
  const totalLocked = Number(lockedBal?.amount) / 1e18 + val;

  return (
    <div className="space-y-8 mb-8 text-start">
      <h2 className="text-start text-5xl">Preview Lock</h2>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-customGray300">
          <p>Lock Amount</p>
          <p>{val > 0 ? val.toFixed(2) : "0"} VCX-LP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-customGray300">
          <p>Total Locked</p>
          <p>{lockedBal ? totalLocked.toFixed(2) : ""} VCX-LP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-customGray300">
          <p>Unlock Date</p>
          <p>
            {lockedBal && lockedBal?.end.toString() !== "0"
              ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString()
              : "-"}
          </p>
        </div>
        <div className="flex flex-row items-center justify-between text-customGray300">
          <p>New Voting Power</p>
          <p>
            {val > 0
              ? calculateVeOut(
                  Number(lockedBal?.amount) / 1e18 + val,
                  calcDaysToUnlock(Number(lockedBal?.end))
                ).toFixed(2)
              : "0"}{" "}
            veVCX
          </p>
        </div>
      </div>

      <div className="w-full border border-customGray100 rounded-lg p-4">
        <p className="text-customGray100">
          Important: veVCX is not transferrable and unlocking VCX-LP early
          results in a penalty of up to 25% of your VCX-LP
        </p>
      </div>
    </div>
  );
}

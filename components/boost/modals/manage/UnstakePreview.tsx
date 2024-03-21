export default function UnstakePreview({
  amount,
  isExpired,
}: {
  amount: number;
  isExpired: boolean;
}): JSX.Element {
  return (
    <div className="space-y-8 mb-8 text-start">
      <h2 className="text-start text-5xl">Preview Unlock</h2>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Amount</p>
          <p>{amount > 0 ? amount.toFixed(2) : "0"} VCX-LP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Penalty</p>
          <p>{isExpired ? "0%" : "25%"}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Returned Amount</p>
          <p>
            {amount > 0 ? (amount * (isExpired ? 1 : 0.75)).toFixed(2) : "0"}{" "}
            VCX-LP
          </p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>New Voting Power</p>
          <p>0</p>
        </div>
      </div>

      {isExpired ?
        <div className="w-full bg-green-500 bg-opacity-30 border border-green-500 rounded-lg p-4">
          <p className="text-green-500">
            You can unlock without any penalty
          </p>
        </div>
        : <div className="w-full bg-[#fa5a6e26] border border-customRed rounded-lg p-4">
          <p className="text-customRed">
            Important: Unlocking your VCX-LP early will results in a penalty of{" "}
            {(amount * 0.25).toFixed(2)} VCX-LP
          </p>
        </div>}
    </div>
  );
}

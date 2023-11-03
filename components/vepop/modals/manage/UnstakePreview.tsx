export default function UnstakePreview({ amount }: { amount: number }): JSX.Element {
  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Preview Unlock</h2>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Amount</p>
          <p className="text-[#141416]">{amount > 0 ? amount.toFixed(2) : "0"} POP LP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Penalty</p>
          <p className="text-[#141416]">25%</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Returned Amount</p>
          <p className="text-[#141416]">{amount > 0 ? (amount * 0.75).toFixed(2) : "0"} POP LP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>New Voting Power</p>
          <p className="text-[#141416]">0</p>
        </div>
      </div>

      <div className="w-full bg-[#fa5a6e26] border border-customRed rounded-lg p-4">
        <p className="text-customRed">Important: Unlocking your POP LP early will results in a penalty of {(amount * 0.25).toFixed(2)} POP LP</p>
      </div>

    </div >
  )
}
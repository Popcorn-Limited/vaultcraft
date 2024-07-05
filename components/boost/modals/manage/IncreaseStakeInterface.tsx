import { Dispatch, SetStateAction } from "react";
import {
  formatAndRoundBigNumber,
} from "@/lib/utils/formatBigNumber";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { calcDaysToUnlock, calculateVeOut } from "@/lib/gauges/utils";
import { handleChangeInput, handleMaxClick, validateInput } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { VCX_LP } from "@/lib/constants/addresses";

interface IncreaseStakeInterfaceProps {
  amountState: [string, Dispatch<SetStateAction<string>>];
  lockedBal: { amount: bigint; end: bigint };
  showLpModal: () => void;
}

export default function IncreaseStakeInterface({
  amountState,
  lockedBal,
  showLpModal,
}: IncreaseStakeInterfaceProps): JSX.Element {
  const [tokens] = useAtom(tokensAtom);
  const [amount, setAmount] = amountState;

  return (
    <div className="space-y-8 mb-8 text-start">
      <h2 className="text-start text-5xl">Lock your VCX</h2>

      <div>
        <p className="text-white font-semibold">Amount VCX</p>
        <InputTokenWithError
          captionText={``}
          onSelectToken={() => { }}
          onMaxClick={() => handleMaxClick(tokens[1][VCX_LP], setAmount)}
          chainId={1}
          value={String(amount)}
          onChange={(e) => handleChangeInput(e, setAmount)}
          selectedToken={tokens[1][VCX_LP]}
          errorMessage={
            Number(amount) > (tokens[1][VCX_LP].balance / 1e18)
              ? "Insufficient Balance"
              : ""
          }
          allowInput
          tokenList={[]}
          getToken={() =>
            window.open(
              "https://app.balancer.fi/#/ethereum/pool/0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633/add-liquidity",
              "_blank"
            )
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-customGray300">
          <p>Current Lock Amount</p>
          <p>
            {lockedBal ? formatAndRoundBigNumber(lockedBal?.amount, 18) : ""}{" "}
            VCX
          </p>
        </div>
        <div className="flex flex-row items-center justify-between text-customGray300">
          <p>Unlock Date</p>
          <p>
            {lockedBal && lockedBal?.end.toString() !== "0"
              ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-white font-semibold mb-1">New Voting Power</p>
        <div className="w-full bg-customGray600 border border-customGray100 rounded-lg p-4">
          <p className="text-customGray100">
            {Number(amount) > 0
              ? calculateVeOut(
                Number(amount) + Number(lockedBal?.amount) / 1e18,
                calcDaysToUnlock(Number(lockedBal?.end))
              ).toFixed(2)
              : "Enter the amount to view your voting power"}
          </p>
        </div>
      </div>
    </div>
  );
}

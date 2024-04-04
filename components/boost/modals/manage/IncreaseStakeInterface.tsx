import { Dispatch, FormEventHandler, SetStateAction, useMemo } from "react";
import { Address, useAccount, useBalance, useToken } from "wagmi";
import {
  formatAndRoundBigNumber,
  safeRound,
} from "@/lib/utils/formatBigNumber";
import { VCX_LP, ZERO } from "@/lib/constants";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { calcDaysToUnlock, calculateVeOut } from "@/lib/gauges/utils";
import { validateInput } from "@/lib/utils/helpers";
import { formatEther } from "viem";

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
  const { address: account } = useAccount();
  const { data: lpToken } = useToken({
    chainId: 1,
    address: VCX_LP,
  });
  const { data: lpBal } = useBalance({
    chainId: 1,
    address: account,
    token: VCX_LP,
  });

  const [amount, setAmount] = amountState;

  const errorMessage = useMemo(() => {
    return (Number(amount) || 0) > Number(lpBal?.formatted)
      ? "* Balance not available"
      : "";
  }, [amount, lpBal?.formatted]);

  const handleMaxClick = () =>
    setAmount(formatEther(safeRound(lpBal?.value || ZERO, 18)));

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    setAmount(validateInput(value).isValid ? value : "0");
  };

  return (
    <div className="space-y-8 mb-8 text-start">
      <h2 className="text-start text-5xl">Lock your VCX</h2>

      <div>
        <p className="text-white font-semibold">Amount VCX</p>
        <InputTokenWithError
          captionText={``}
          onSelectToken={() => {}}
          onMaxClick={handleMaxClick}
          chainId={1}
          value={String(amount)}
          onChange={handleChangeInput}
          selectedToken={
            {
              ...lpToken,
              name: "VCX-LP",
              symbol: "VCX-LP",
              decimals: 18,
              price: 1,
              balance: Number(lpBal?.value || 0),
            } as any
          }
          errorMessage={errorMessage}
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

import { Dispatch, FormEventHandler, SetStateAction, useMemo } from "react";
import { getVeAddresses } from "@/lib/utils/addresses";
import { Address, useAccount, useBalance, useToken } from "wagmi";
import { formatAndRoundBigNumber, safeRound } from "@/lib/utils/formatBigNumber";
import { ZERO } from "@/lib/constants";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { calcDaysToUnlock, calculateVeOut } from "@/lib/gauges/utils";
import { validateInput } from "@/lib/utils/helpers";
import { formatEther } from "viem";

const { BalancerPool: POP_LP } = getVeAddresses();

interface IncreaseStakeInterfaceProps {
  amountState: [string, Dispatch<SetStateAction<string>>];
  lockedBal: { amount: bigint, end: bigint }
}

export default function IncreaseStakeInterface({ amountState, lockedBal }: IncreaseStakeInterfaceProps): JSX.Element {
  const { address: account } = useAccount()
  const { data: popLp } = useToken({ chainId: 1, address: POP_LP as Address });
  const { data: popLpBal } = useBalance({ chainId: 1, address: account, token: POP_LP })

  const [amount, setAmount] = amountState

  const errorMessage = useMemo(() => {
    return (Number(amount) || 0) > Number(popLpBal?.formatted) ? "* Balance not available" : "";
  }, [amount, popLpBal?.formatted]);

  const handleMaxClick = () => setAmount(formatEther(safeRound(popLpBal?.value || ZERO, 18)));

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setAmount(validateInput(value).isValid ? value : "0");
  };

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Lock your POP</h2>

      <div>
        <p className="text-primary font-semibold">Amount POP</p>
        <InputTokenWithError
          captionText={``}
          onSelectToken={() => { }}
          onMaxClick={handleMaxClick}
          chainId={1}
          value={String(amount)}
          onChange={handleChangeInput}
          selectedToken={
            {
              ...popLp,
              balance: Number(popLpBal?.value || 0) || 0,
            } as any
          }
          errorMessage={errorMessage}
          allowInput
          tokenList={[]}
          getTokenUrl="https://app.balancer.fi/#/ethereum/pool/0xd5a44704befd1cfcca67f7bc498a7654cc092959000200000000000000000609" // temp link
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Current Lock Amount</p>
          <p className="text-[#141416]">{lockedBal ? formatAndRoundBigNumber(lockedBal?.amount, 18) : ""} POP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p className="text-[#141416]">{lockedBal && lockedBal?.end.toString() !== "0" ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString() : "-"}</p>
        </div>
      </div>

      <div>
        <p className="text-primary font-semibold mb-1">New Voting Power</p>
        <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
          <p className="text-primaryDark">
            {Number(amount) > 0 ?
              calculateVeOut(Number(amount) + (Number(lockedBal?.amount) / 1e18), calcDaysToUnlock(Number(lockedBal?.end))).toFixed(2)
              : "Enter the amount to view your voting power"}
          </p>
        </div>
      </div>

    </div>
  )
}
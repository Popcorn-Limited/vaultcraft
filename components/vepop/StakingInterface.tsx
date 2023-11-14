import { intervalToDuration } from "date-fns";
import { Dispatch, SetStateAction } from "react";
import { Address, useAccount, useBalance } from "wagmi";
import { getVotePeriodEndTime } from "@/lib/gauges/utils";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import useLockedBalanceOf from "@/lib/gauges/useLockedBalanceOf";
import { getVeAddresses } from "@/lib/utils/addresses";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { formatEther } from "viem";
import { ZERO } from "@/lib/constants";

function votingPeriodEnd(): number[] {
  const periodEnd = getVotePeriodEndTime();
  const interval = { start: new Date(), end: periodEnd };
  const timeUntilEnd = intervalToDuration(interval);
  const formattedTime = [
    (timeUntilEnd.days || 0) % 7,
    timeUntilEnd.hours || 0,
    timeUntilEnd.minutes || 0,
    timeUntilEnd.seconds || 0,
  ];
  return formattedTime;
}

const {
  BalancerPool: POP_LP,
  VotingEscrow: VOTING_ESCROW,
} = getVeAddresses();

interface StakingInterfaceProps {
  setShowLockModal: Dispatch<SetStateAction<boolean>>;
  setShowMangementModal: Dispatch<SetStateAction<boolean>>;
}

export default function StakingInterface({ setShowLockModal, setShowMangementModal }: StakingInterfaceProps): JSX.Element {
  const { address: account } = useAccount()

  const { data: lockedBal } = useLockedBalanceOf({ chainId: 1, address: VOTING_ESCROW, account: account as Address })
  const { data: veBal } = useBalance({ chainId: 1, address: account, token: VOTING_ESCROW, watch: true })
  const { data: popLpBal } = useBalance({ chainId: 1, address: account, token: POP_LP, watch: true })

  return (
    <>
      <div className="w-full lg:w-1/2 bg-transparent border border-[#353945] rounded-3xl p-8 text-primary">
        <h3 className="text-2xl pb-6 border-b border-[#353945]">vePOP</h3>
        <div className="flex flex-col mt-6 gap-4">
          <span className="flex flex-row items-center justify-between">
            <p className="">My POP LP</p>
            <p className="font-bold">{NumberFormatter.format(Number(formatEther(popLpBal?.value || ZERO))) || "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="">My Locked POP LP</p>
            <p className="font-bold">{lockedBal ? NumberFormatter.format(Number(formatEther(lockedBal?.amount))) : "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="">Locked Until</p>
            <p className="font-bold">{lockedBal && lockedBal?.end.toString() !== "0" ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString() : "-"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="">My vePOP</p>
            <p className="font-bold">{NumberFormatter.format(Number(formatEther(veBal?.value || ZERO))) || "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between pb-6 border-b border-[#353945]">
            <p className="">Voting period ends</p>
            <p className="font-bold">{votingPeriodEnd()[0]}d : {votingPeriodEnd()[1]}h<span className="hidden lg:inline">: {votingPeriodEnd()[2]}m</span></p>
          </span>
        </div>
        <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6 lg:max-h-12">
          <div className="w-full md:w-60">
            {Number(veBal?.value) === 0 ?
              <MainActionButton label="Lock VCX" handleClick={() => setShowLockModal(true)} /> :
              <MainActionButton label="Manage Stake" handleClick={() => setShowMangementModal(true)} />
            }
          </div>
        </div>
      </div>
    </>
  )
}

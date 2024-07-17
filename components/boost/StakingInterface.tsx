import { intervalToDuration } from "date-fns";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { getVotePeriodEndTime } from "@/lib/gauges/utils";
import MainActionButton from "@/components/button/MainActionButton";
import useLockedBalanceOf from "@/lib/gauges/useLockedBalanceOf";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { Address, formatEther } from "viem";
import { OptionTokenByChain, VCX_LP, VOTING_ESCROW } from "@/lib/constants/addresses";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { ZERO } from "@/lib/constants";

export function votingPeriodEnd(timestamp?: number): number[] {
  const periodEnd = timestamp ? timestamp : getVotePeriodEndTime();
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
interface StakingInterfaceProps {
  setShowLockModal: Dispatch<SetStateAction<boolean>>;
  setShowMangementModal: Dispatch<SetStateAction<boolean>>;
  setShowLpModal: Dispatch<SetStateAction<boolean>>;
  setShowBridgeModal: Dispatch<SetStateAction<boolean>>;
  setShowSyncModal: Dispatch<SetStateAction<boolean>>;
}

export default function StakingInterface({
  setShowLockModal,
  setShowMangementModal,
  setShowLpModal,
  setShowBridgeModal,
  setShowSyncModal,
}: StakingInterfaceProps): JSX.Element {
  const { address: account } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [tokens] = useAtom(tokensAtom);

  const { data: lockedBal } = useLockedBalanceOf({
    chainId: 1,
    address: VOTING_ESCROW,
    account: account as Address,
  });
  const { data: veBal, refetch: refetchVeBal } = useBalance({
    chainId: 1,
    address: account,
    token: VOTING_ESCROW,
  });
  const { data: LpBal, refetch: refetchLpBal } = useBalance({
    chainId: 1,
    address: account,
    token: VCX_LP
  });

  useEffect(() => {
    refetchVeBal();
    refetchLpBal();
  }, [blockNumber])

  return (
    <>
      <div className="w-full lg:w-1/2 bg-transparent border border-customNeutral100 rounded-3xl p-8 text-white">
        <h3 className="text-2xl pb-6 border-b border-customNeutral100">
          veVCX
        </h3>
        <div className="flex flex-col mt-6 gap-4">
          <span className="flex flex-row items-center justify-between ml-2">
            <div className="flex flex-row items-center">
              <div className="relative mb-0.5">
                <NetworkSticker chainId={1} size={1} />
                <TokenIcon
                  token={tokens?.[1]?.[VCX_LP]}
                  chainId={1}
                  imageSize={"w-8 h-8"}
                />
              </div>
              <p className="ml-2">My VCX-LP</p>
            </div>
            <p className="font-bold">
              {NumberFormatter.format(
                Number(formatEther(LpBal?.value || ZERO))
              ) || "0"}
            </p>
          </span>
          <span className="flex flex-row items-center justify-between ml-2">
            <div className="flex flex-row items-center">
              <div className="relative mb-0.5">
                <NetworkSticker chainId={1} size={1} />
                <TokenIcon
                  token={tokens?.[1]?.[VCX_LP]}
                  chainId={1}
                  imageSize={"w-8 h-8"}
                />
              </div>
              <p className="ml-2">My Locked VCX-LP 🔒</p>
            </div>
            <p className="font-bold">
              {lockedBal
                ? NumberFormatter.format(Number(formatEther(lockedBal?.amount)))
                : "0"}
            </p>
          </span>
          <span className="flex flex-row items-center justify-between ml-2">
            <div className="flex flex-row items-center">
              <div className="relative mb-0.5">
                <NetworkSticker chainId={1} size={1} />
                <TokenIcon
                  token={tokens?.[1]?.[OptionTokenByChain[1]]}
                  icon={"/images/tokens/veVCX.svg"}
                  chainId={1}
                  imageSize={"w-8 h-8"}
                />
              </div>
              <p className="ml-2">My veVCX</p>
            </div>
            <p className="font-bold">
              {NumberFormatter.format(
                Number(formatEther(veBal?.value || ZERO))
              ) || "0"}
            </p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="">Locked Until</p>
            <p className="font-bold">
              {lockedBal && lockedBal?.end.toString() !== "0"
                ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString()
                : "-"}
            </p>
          </span>
          <span className="flex flex-row items-center justify-between pb-6 border-b border-customNeutral100">
            <p className="">Voting period ends</p>
            <p className="font-bold">
              {votingPeriodEnd()[0]}d : {votingPeriodEnd()[1]}h
              <span className="hidden lg:inline">
                : {votingPeriodEnd()[2]}m
              </span>
            </p>
          </span>
        </div>
        <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6 lg:max-h-12">
          {Number(lockedBal?.amount) === 0 ? (
            <MainActionButton
              label="Lock VCX-LP"
              handleClick={() => setShowLockModal(true)}
            />
          ) : (
            <MainActionButton
              label="Manage Stake"
              handleClick={() => setShowMangementModal(true)}
            />
          )}
          <SecondaryActionButton
            label="Get VCX-LP Token"
            handleClick={() => setShowLpModal(true)}
          />
          <SecondaryActionButton
            label="Bridge your VCX"
            handleClick={() => setShowBridgeModal(true)}
          />
          <SecondaryActionButton
            label="Sync veBalance"
            handleClick={() => setShowSyncModal(true)}
          />
        </div>
      </div>
    </>
  );
}

import { type Address } from "viem";
import { useAccount } from "wagmi";
import Slider from "rc-slider";
import { formatAndRoundNumber, formatTwoDecimals, NumberFormatter } from "@/lib/utils/formatBigNumber";
import { VaultLabel, type VaultData } from "@/lib/types";
import { cn } from "@/lib/utils/helpers";
import AssetWithName from "@/components/common/AssetWithName";
import { type PropsWithChildren, useEffect, useState } from "react";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";
import TokenIcon from "@/components/common/TokenIcon";
import useWeeklyEmissions from "@/lib/gauges/useWeeklyEmissions";
import CardStat from "@/components/common/CardStat";
import { VE_VCX } from "@/lib/constants";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";

export default function BoostVaultCard({
  isDeprecated,
  isVotingAvailable,
  handleVotes,
  votes,
  ...vaultData
}: VaultData & {
  isDeprecated?: boolean;
  isVotingAvailable?: boolean;
  votes: { [key: string]: number };
  handleVotes: (value: number, address: Address) => void;
}) {
  const baseTooltipId = vaultData.address.slice(1);
  if (
    isDeprecated &&
    !vaultData.metadata?.labels?.includes(VaultLabel.deprecated)
  ) {
    // Include the deprecated label in the metadata
    vaultData.metadata.labels = vaultData.metadata?.labels || [];
    vaultData.metadata.labels.push(VaultLabel.deprecated);
  }

  const {
    gauge,
    gaugeData,
    tvl,
  } = vaultData;

  const { address: account } = useAccount();
  const [tokens] = useAtom(tokensAtom);
  const weeklyEmissions = useWeeklyEmissions();

  const { data: weights } = useGaugeWeights({
    address: vaultData.gauge as any,
    account: account as any,
    chainId: vaultData.chainId,
  });

  const allocations = {
    current: Number(weights?.[0] || 0) / 1e16,
    upcoming: Number(weights?.[1] || 0) / 1e16,
  };

  const actualUserPower = Number(weights?.[2].power || 0);
  const totalWeight = Number(weights?.[3] || 0) / 1e18;

  const [amount, setAmount] = useState(actualUserPower);
  const [relativeWeight, setRelativeWeight] = useState(0);

  useEffect(() => {
    if (relativeWeight === 0) setRelativeWeight(Number(weights?.[1] || 0) / 1e18)
  }, [weights])

  function onChange(value: number) {
    // As long as you keep moving the slider, `value` continues to count to the max value(10000). This sometimes makes the
    // potentialNewTotalVotes to be greater than the cumulative total max, 10000. Whenever this happens,
    // the potentialNewTotalVotes can never be exactly 10000, therefore, we never achieve 100% votes. To resolve this,
    // whenever the value potentialNewTotalVotes spills over 10000, we normalize the value that caused the spill to only
    // be as high as it needs to be to make the potentialNewTotalVotes (cumulative total max) = 10000, therefor reaching
    // 100% votes.

    const gaugeVotes = votes[gauge!] || 0;
    const potentialNewTotalVotes =
      Object.values(votes).reduce((a, b) => a + b, 0) -
      gaugeVotes +
      Number(value);

    if (potentialNewTotalVotes > 10000) {
      value = value - (potentialNewTotalVotes - 10000);
    }

    const veBal = Number(tokens[1][VE_VCX].balance.formatted)
    const userWeightImpact = (value / 10_000) * veBal
    const currentWeight = (Number(weights?.[1] || 0) / 1e18) * totalWeight
    const newRelativeWeight = (currentWeight + userWeightImpact) / totalWeight

    handleVotes(value, gauge!);
    setAmount(value);
    setRelativeWeight(newRelativeWeight)
  }

  return (
    <div className="p-8 overflow-hidden rounded-3xl border border-customNeutral100 group">
      <AssetWithName className="-mt-1 -translate-x-0.5" vault={vaultData} />

      <div className="flex flex-col sm:grid mt-8 md:mt-6 gap-4 xs:grid-cols-3">
        <CardStat
          id={`${baseTooltipId}-tvl`}
          label="TVL"
          value={`$ ${tvl < 1 ? "0" : NumberFormatter.format(tvl)}`}
          tooltip="Total value of all assets deposited into the vault"
        />
        <CardStat
          id={`${baseTooltipId}-boost`}
          label="Current Boost"
          value={`${formatTwoDecimals(gaugeData?.upperAPR || 0)} %`}
          secondaryValue={`${formatTwoDecimals(gaugeData?.lowerAPR || 0)} %`}
          tooltip={`Earn between ${formatTwoDecimals(gaugeData?.lowerAPR || 0)}-${formatTwoDecimals(gaugeData?.upperAPR || 0)} % oVCX boost APR depending your balance of veVCX. (Based on the current emissions of ${formatTwoDecimals((gaugeData?.annualEmissions || 0) / 5)}-${formatTwoDecimals(gaugeData?.annualEmissions || 0)} oVCX p.Year)`}
        />
        <CardStat
          id={`${baseTooltipId}-vote-weight`}
          label="Vote Allocation"
          value={`${(Number(weights?.[0]) / 1e16).toFixed(2) || 0} %`}
          secondaryValue={`${((Number(weights?.[1]) / 1e16) + relativeWeight).toFixed(2) || 0} %`}
          tooltip={`Currently there are ${(Number(weights?.[0]) / 1e16).toFixed(2) || 0}% of all votes assigned to this vault. Next week it will be ${((Number(weights?.[1]) / 1e16) + relativeWeight).toFixed(2) || 0}%`}
        />
        <CardStat
          id={`${baseTooltipId}-emission`}
          label="Emmissions"
          value={`${NumberFormatter.format(weeklyEmissions * (allocations.current / 100))}`}
          secondaryValue={`${NumberFormatter.format((weeklyEmissions * relativeWeight))}`}
          tooltip={`This week this vault will receive ${NumberFormatter.format(weeklyEmissions * (allocations.current / 100))} oVCX. Based on votes for the next week the vaut will receive ${NumberFormatter.format((weeklyEmissions * relativeWeight))} oVCX next week`}
        />
        <CardStat
          id={`${baseTooltipId}-your-votes`}
          label="Your Votes"
          value={`${amount ? (amount / 100).toFixed(2) : 0} %`}
        />
        <fieldset className="select-none w-full mb-4 mt-2 sm:col-span-3 flex items-center">
          <Slider
            railStyle={{
              backgroundColor: isVotingAvailable ? "#FFFFFF" : "#AFAFAF",
              height: 4,
            }}
            trackStyle={{
              backgroundColor: isVotingAvailable ? "#FFFFFF" : "#AFAFAF",
              height: 4,
            }}
            handleStyle={{
              height: 22,
              width: 22,
              marginLeft: 0,
              marginTop: -9,
              borderWidth: 4,
              opacity: 1,
              boxShadow: "none",
              borderColor: isVotingAvailable ? "#C391FF" : "#AFAFAF",
              backgroundColor: "#fff",
              zIndex: 0,
            }}
            value={amount}
            onChange={
              isVotingAvailable ? (val: any) => onChange(Number(val)) : () => { }
            }
            max={10000}
          />
        </fieldset>
      </div>
    </div>
  );
}

function Content({
  title,
  children,
  className,
}: PropsWithChildren<{
  title: string | JSX.Element;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "text-white [&_p]:text-xl [&_p]:sm:text-2xl flex items-center justify-between sm:block",
        className
      )}
    >
      <h2>{title}</h2>
      {children}
    </div>
  );
}

import { type Address } from "viem";
import { useAccount } from "wagmi";
import Slider from "rc-slider";
import {
  NumberFormatter,
  formatTwoDecimals,
} from "@/lib/utils/formatBigNumber";
import { VaultLabel, type VaultData } from "@/lib/types";
import { cn } from "@/lib/utils/helpers";
import AssetWithName from "@/components/common/AssetWithName";
import { type PropsWithChildren, useState } from "react";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";
import TokenIcon from "@/components/common/TokenIcon";
import useWeeklyEmissions from "@/lib/gauges/useWeeklyEmissions";
import { LABELS_WITH_TOOLTIP } from "@/components/boost/BoostVaultsTable";

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
  const weeklyEmissions = useWeeklyEmissions();

  if (
    isDeprecated &&
    !vaultData.metadata?.labels?.includes(VaultLabel.deprecated)
  ) {
    // Include the deprecated label in the metadata
    vaultData.metadata.labels = vaultData.metadata?.labels || [];
    vaultData.metadata.labels.push(VaultLabel.deprecated);
  }

  const { address: account } = useAccount();

  const { gaugeData, tvl } = vaultData;

  const maxGaugeApy = gaugeData?.upperAPR || 0;
  const minGaugeApy = gaugeData?.lowerAPR || 0;

  const { data: weights } = useGaugeWeights({
    address: vaultData.gauge as any,
    account: account as any,
    chainId: vaultData.chainId,
  });

  const GAUGE_ADDRESS = vaultData.gauge!;

  const allocations = {
    current: Number(weights?.[0] || 0) / 1e16,
    upcoming: Number(weights?.[1] || 0) / 1e16,
  };

  const totalWeight = Number(weights?.[3] || 0) / 1e16;
  const actualUserPower = Number(weights?.[2].power || 0);

  const [amount, setAmount] = useState(actualUserPower);

  const relativeWeight = (amount / totalWeight) * 100;

  function onChange(value: number) {
    // As long as you keep moving the slider, `value` continues to count to the max value(10000). This sometimes makes the
    // potentialNewTotalVotes to be greater than the cumulative total max, 10000. Whenever this happens,
    // the potentialNewTotalVotes can never be exactly 10000, therefore, we never achieve 100% votes. To resolve this,
    // whenever the value potentialNewTotalVotes spills over 10000, we normalize the value that caused the spill to only
    // be as high as it needs to be to make the potentialNewTotalVotes (cumulative total max) = 10000, therefor reaching
    // 100% votes.

    const gaugeVotes = votes[GAUGE_ADDRESS] || 0;
    console.debug({ gaugeVotes, value });
    const potentialNewTotalVotes =
      Object.values(votes).reduce((a, b) => a + b, 0) -
      gaugeVotes +
      Number(value);

    if (potentialNewTotalVotes > 10000) {
      value = value - (potentialNewTotalVotes - 10000);
    }

    handleVotes(value, GAUGE_ADDRESS);
    setAmount(value);
  }

  const TOKENTS_EMITED = (
    <nav className="flex [&_img]:brightness-125 [&_img]:saturate-150 gap-2 items-center">
      <TokenIcon
        chainId={1}
        token={{} as any}
        icon="/images/tokens/oVcx.svg"
        imageSize="w-6 h-6"
      />
      <span className="pt-0.5 text-xl">
        {NumberFormatter.format(weeklyEmissions * (allocations.current / 100))}
      </span>
    </nav>
  );

  const MY_VOTES = (
    <p>
      {actualUserPower != amount
        ? `${amount ? (amount / 100).toFixed(2) : 0}%`
        : "-"}
    </p>
  );

  return (
    <div className="p-8 overflow-hidden rounded-3xl border border-customNeutral100 group">
      <AssetWithName className="-mt-1 -translate-x-0.5" vault={vaultData} />

      <div className="flex flex-col sm:grid mt-8 md:mt-6 gap-4 xs:grid-cols-3">
        <Content title={LABELS_WITH_TOOLTIP.tvl}>
          <p>$ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}</p>
        </Content>

        <Content title={LABELS_WITH_TOOLTIP.minBoost}>
          <p>{formatTwoDecimals(minGaugeApy)}%</p>
        </Content>

        <Content title={LABELS_WITH_TOOLTIP.maxBoost}>
          <p>{formatTwoDecimals(maxGaugeApy)}%</p>
        </Content>

        <Content
          className="hidden sm:block"
          title={LABELS_WITH_TOOLTIP.tokensEmitted}
        >
          {TOKENTS_EMITED}
        </Content>

        <Content title={LABELS_WITH_TOOLTIP.currentWeight}>
          <p>{allocations.current.toFixed(2)}%</p>
        </Content>

        <Content title={LABELS_WITH_TOOLTIP.upcomingWeight}>
          <p>{allocations.upcoming.toFixed(2)}%</p>
        </Content>

        <div className="border-t border-customNeutral100 my-4 -mx-2 sm:hidden" />

        <Content
          className="sm:hidden"
          title={LABELS_WITH_TOOLTIP.tokensEmitted}
        >
          {TOKENTS_EMITED}
        </Content>

        <Content title={LABELS_WITH_TOOLTIP.upcomingTokens}>
          <nav className="flex [&_img]:brightness-125 [&_img]:saturate-150 gap-2 items-center">
            <TokenIcon
              chainId={1}
              token={{} as any}
              icon="/images/tokens/oVcx.svg"
              imageSize="w-6 h-6"
            />
            <span className="pt-0.5 text-xl">
              {NumberFormatter.format(
                weeklyEmissions * (allocations.upcoming / 100)
              )}
            </span>
          </nav>
        </Content>

        <Content
          className="hidden sm:block col-span-2"
          title={LABELS_WITH_TOOLTIP.myVotes}
        >
          {MY_VOTES}
        </Content>
      </div>

      <div className="border-t border-customNeutral100 mt-8 -mx-2" />

      <div className="grid mt-8 gap-4 sm:grid-cols-3">
        <Content
          className="whitespace-nowrap"
          title={LABELS_WITH_TOOLTIP.emittedTokens}
        >
          <p>
            {relativeWeight > 0
              ? NumberFormatter.format(weeklyEmissions * relativeWeight)
              : "-"}
          </p>
        </Content>

        <Content
          className="whitespace-nowrap"
          title={LABELS_WITH_TOOLTIP.newAllocation}
        >
          <p>
            {actualUserPower != amount ? `${relativeWeight.toFixed(2)}%` : "-"}
          </p>
        </Content>

        <Content className="sm:hidden" title={LABELS_WITH_TOOLTIP.myVotes}>
          {MY_VOTES}
        </Content>

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

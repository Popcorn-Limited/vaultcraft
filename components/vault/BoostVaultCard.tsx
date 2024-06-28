import { type Address } from "viem";
import { useAtom } from "jotai";
import { useAccount } from "wagmi";

import Slider from "rc-slider";

import {
  NumberFormatter,
  formatTwoDecimals,
} from "@/lib/utils/formatBigNumber";
import { VaultLabel, type VaultData } from "@/lib/types";
import { tokensAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils/helpers";
import AssetWithName from "./AssetWithName";
import { type PropsWithChildren, useState } from "react";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";

import TokenIcon from "../common/TokenIcon";
import Badge from "./Badge";

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
  if (
    isDeprecated &&
    !vaultData.metadata?.labels?.includes(VaultLabel.deprecated)
  ) {
    // Include the deprecated label in the metadata
    vaultData.metadata.labels = vaultData.metadata?.labels || [];
    vaultData.metadata.labels.push(VaultLabel.deprecated);
  }

  const { address: account } = useAccount();

  const {
    asset,
    gauge,
    gaugeData,
    tvl,
    vault: vaultAddress,
    chainId,
  } = vaultData;

  const maxGaugeApy = gaugeData?.upperAPR || 0;
  const minGaugeApy = gaugeData?.lowerAPR || 0;

  const { data: weights } = useGaugeWeights({
    address: vaultData.gauge as any,
    account: account as any,
    chainId: vaultData.chainId,
  });

  const [tokens] = useAtom(tokensAtom);

  const vault = tokens[chainId]?.[vaultAddress] ?? {};
  const dataAsset = tokens[chainId]?.[asset] ?? {};
  const dataGauge = tokens[chainId]?.[gauge!] ?? {};

  console.debug({ vault, dataAsset, dataGauge, vaultData });
  const GAUGE_ADDRESS = vaultData.gauge!;

  let boost = Math.round(maxGaugeApy / minGaugeApy) || 0;
  if (boost <= 1) boost = 1;

  const actualUserPower = Number(weights?.[2].power);
  const [amount, setAmount] = useState(Number(weights?.[2].power));

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

  return (
    <div className="p-8 overflow-hidden rounded-3xl border border-customNeutral100 group">
      <AssetWithName
        className="pl-2 [&_h2]:text-lg flex-nowrap [&_.flex-wrap]:flex-nowrap"
        vault={vaultData}
      />

      <div className="grid mt-6 gap-4 grid-cols-2">
        <Content title="TVL">
          <p className="text-2xl">
            $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
          </p>
        </Content>

        <Content title="Min Boost">
          <p className="text-2xl">{formatTwoDecimals(minGaugeApy)}%</p>
        </Content>

        <Content title="Max Boost">
          <p className="text-2xl">{formatTwoDecimals(maxGaugeApy)}%</p>
        </Content>

        <Content title="Current Weight">
          <p className="text-2xl">5%</p>
        </Content>

        <Content title="Tokens Emitted">
          <nav className="flex [&_img]:brightness-125 [&_img]:saturate-150 gap-2 items-center">
            <TokenIcon
              chainId={1}
              token={{} as any}
              icon="/images/tokens/oVcx.svg"
              imageSize="w-6 h-6"
            />
            <span className="pt-0.5 text-xl">2,500</span>
          </nav>
        </Content>

        <Content title="Upcoming Weight">
          <p className="text-2xl">5%</p>
        </Content>

        <Content title="Upcoming Tokens">
          <nav className="flex [&_img]:brightness-125 [&_img]:saturate-150 gap-2 items-center">
            <TokenIcon
              chainId={1}
              token={{} as any}
              icon="/images/tokens/oVcx.svg"
              imageSize="w-6 h-6"
            />
            <span className="pt-0.5 text-xl">2,500</span>
          </nav>
        </Content>
      </div>

      <div className="border-t border-customNeutral100 w-full mt-6" />

      <div className="grid mt-6 gap-4 grid-cols-2">
        <Content title="Emitted Tokens">
          <p className="text-2xl">
            $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
          </p>
        </Content>

        <Content title="New allocation">
          <p className="text-2xl">{formatTwoDecimals(minGaugeApy)}%</p>
        </Content>

        <Content className="col-span-2" title="My Votes">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <strong className="text-lg mr-1">
              {amount ? (amount / 100).toFixed(2) : 0}%
            </strong>
            <Badge>x{boost}</Badge>
          </div>
        </Content>

        <fieldset className="select-none mb-4 mt-2 col-span-2 w-full flex items-center">
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
              isVotingAvailable ? (val: any) => onChange(Number(val)) : () => {}
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
  title: string;
  className?: string;
}>) {
  return (
    <div className={cn("text-white", className)}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

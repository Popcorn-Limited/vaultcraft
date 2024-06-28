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
import { Fragment, useState } from "react";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";

import TokenIcon from "../common/TokenIcon";
import Badge from "./Badge";

export default function BoostVaultRow({
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
    <Fragment>
      <style>
        {`
        .vault-${vaultAddress}:has(+ .vault-dep-${vaultAddress}:hover),
        .vault-${vaultAddress}:hover + .vault-dep-${vaultAddress} {
          background-color: rgb(35 38 47 / 0.8);
        }`}
      </style>
      <tr
        className={cn(
          "hover:bg-customNeutral200/80 border-customNeutral100",
          `vault-${vaultAddress}`
        )}
      >
        <td className="relative">
          <AssetWithName
            className="[&_h2]:font-normal relative hover:z-10 pl-3 [&_h2]:text-lg"
            vault={vaultData}
          />
        </td>

        <td className="whitespace-nowrap text-lg">
          $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
        </td>

        <td className="text-right text-lg">
          {formatTwoDecimals(minGaugeApy)}%
        </td>

        <td className="text-right text-lg">
          {formatTwoDecimals(maxGaugeApy)}%
        </td>

        <td className="text-right text-lg">
          {(Number(weights?.[0]) / 1e16).toFixed(2) || 0}%
        </td>

        <td className="text-right text-lg">
          {(Number(weights?.[1]) / 1e16).toFixed(2) || 0}%
        </td>

        <td className="text-right text-lg">
          <nav className="flex [&_img]:brightness-125 [&_img]:saturate-150 gap-2 items-center">
            <TokenIcon
              chainId={1}
              token={{} as any}
              icon="/images/tokens/oVcx.svg"
              imageSize="w-6 h-6"
            />
            <span className="pt-0.5">2,500</span>
          </nav>
        </td>

        <td className="text-right text-lg">
          <nav className="flex [&_img]:brightness-125 [&_img]:saturate-150 gap-2 items-center">
            <TokenIcon
              chainId={1}
              token={{} as any}
              icon="/images/tokens/oVcx.svg"
              imageSize="w-6 h-6"
            />
            <span className="pt-0.5">2,500</span>
          </nav>
        </td>
      </tr>

      <tr
        className={cn(
          "border-b hover:bg-customNeutral200/80 border-customNeutral100",
          `vault-dep-${vaultAddress}`
        )}
      >
        <td />
        <td colSpan={2} className="border-t border-customNeutral100 !pr-0">
          <nav className="flex whitespace-nowrap gap-2 items-center">
            <span>Emitted tokens:</span>
            <strong className="text-lg">
              {actualUserPower != amount
                ? `${amount ? (amount / 100).toFixed(2) : 0}%`
                : "-"}
            </strong>
          </nav>
        </td>

        <td colSpan={2} className="border-t border-customNeutral100 !pr-0">
          <nav className="flex whitespace-nowrap gap-2 items-center">
            <span>New allocation:</span>
            <strong className="text-lg">
              {actualUserPower != amount
                ? `${amount ? (amount / 100).toFixed(2) : 0}%`
                : "-"}
            </strong>
          </nav>
        </td>

        <td colSpan={3} className="border-t border-customNeutral100">
          <nav className="flex items-center gap-4">
            <div className="flex items-center gap-2 whitespace-nowrap min-w-[12rem]">
              <span>My Votes:</span>
              <strong className="text-lg mr-1">
                {amount ? (amount / 100).toFixed(2) : 0}%
              </strong>
              <Badge>x{boost}</Badge>
            </div>

            <span className="whitespace-nowrap">Vote %</span>
            <fieldset className="select-none w-full flex items-center pr-2">
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
                  isVotingAvailable
                    ? (val: any) => onChange(Number(val))
                    : () => {}
                }
                max={10000}
              />
            </fieldset>
          </nav>
        </td>
      </tr>
    </Fragment>
  );
}

import { useEffect, useState } from "react";
import { Address, useAccount } from "wagmi";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import AssetWithName from "@/components/vault/AssetWithName";
import { Token, VaultData, VaultLabel } from "@/lib/types";
import Accordion from "@/components/common/Accordion";
import CardStat from "@/components/common/CardStat";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";

interface GaugeProps {
  vaultData: VaultData;
  index: Address;
  votes: { [key: Address]: number };
  handleVotes: Function;
  canVote: boolean;
  searchTerm: string;
  deprecated: boolean;
}

export default function Gauge({
  vaultData,
  index,
  votes,
  handleVotes,
  canVote,
  searchTerm,
  deprecated
}: GaugeProps): JSX.Element {
  const baseTooltipId = vaultData.address.slice(1);

  const { address: account } = useAccount();

  const { data: weights } = useGaugeWeights({
    address: vaultData.gauge as Address,
    account: account as Address,
    chainId: vaultData.chainId,
  });
  const [amount, setAmount] = useState(Number(weights?.[2].power));

  function onChange(value: number) {
    const currentVoteForThisGauge = votes[index];

    // As long as you keep moving the slider, `value` continues to count to the max value(10000). This sometimes makes the
    // potentialNewTotalVotes to be greater than the cumulative total max, 10000. Whenever this happens,
    // the potentialNewTotalVotes can never be exactly 10000, therefore, we never achieve 100% votes. To resolve this,
    // whenever the value potentialNewTotalVotes spills over 10000, we normalize the value that caused the spill to only
    // be as high as it needs to be to make the potentialNewTotalVotes (cumulative total max) = 10000, therefor reaching
    // 100% votes.
    const potentialNewTotalVotes =
      Object.values(votes).reduce((a, b) => a + b, 0) -
      currentVoteForThisGauge +
      Number(value);

    if (potentialNewTotalVotes > 10000) {
      value = value - (potentialNewTotalVotes - 10000);
    }

    handleVotes(value, index);
    setAmount(value);
  }

  const [tokens] = useAtom(tokensAtom)

  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();

  useEffect(() => {
    if (vaultData) {
      setAsset(tokens[vaultData.chainId][vaultData.asset])
      setVault(tokens[vaultData.chainId][vaultData.vault])
      if (deprecated) {
        if (vaultData.metadata.labels && !vaultData.metadata.labels.includes(VaultLabel.deprecated)) {
          vaultData.metadata.labels.push(VaultLabel.deprecated)
        } else {
          vaultData.metadata.labels = [VaultLabel.deprecated]
        }
      }
    }
  }, [vaultData])

  // Is loading / error
  if (!vaultData) return <></>;
  // Vault is not in search term
  if (
    searchTerm !== "" &&
    !vault?.name.toLowerCase().includes(searchTerm) &&
    !vault?.symbol.toLowerCase().includes(searchTerm) &&
    !asset?.symbol.toLowerCase().includes(searchTerm) &&
    !vaultData.strategies.map(strategy =>
      strategy.metadata.name.toLowerCase())
      .includes(searchTerm)
  )
    return <></>;
  return (
    <Accordion>
      <>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>
          <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4">
            <CardStat
              id={`${baseTooltipId}-tvl`}
              label="TVL"
              value={`$ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}`}
              tooltip="Total value of all assets deposited into the vault"
            />
            <CardStat
              id={`${baseTooltipId}-minRewards`}
              label="Min Rewards Apy"
              value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData?.gaugeData?.lowerAPR!))} %`}
              tooltip="Minimum oVCX boost APR based on most current epoch&apos;s distribution"
            />
            <CardStat
              id={`${baseTooltipId}-maxRewards`}
              label="Max Rewards Apy"
              value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData?.gaugeData?.upperAPR!))} %`}
              tooltip="Maximum oVCX boost APR based on most current epoch&apos;s distribution"
            />
            <CardStat
              id={`${baseTooltipId}-currAlloc`}
              label="Current Allocation"
              value={`${(Number(weights?.[0]) / 1e16).toFixed(2) || 0} %`}
              tooltip="Current allocation of weekly rewards for this gauge"
            />
            <CardStat
              id={`${baseTooltipId}-upcAlloc`}
              label="Upcoming Allocation"
              value={`${(Number(weights?.[1]) / 1e16).toFixed(2) || 0} %`}
              tooltip="Upcoming allocation of weekly rewards for this gauge"
            />
            <CardStat
              id={`${baseTooltipId}-myVotes`}
              label="Your Votes"
              value={`${(Number(weights?.[2].power) / 100).toFixed(2)} %`}
              tooltip="Percentage of your votes allocated to this gauge"
            />
          </div>

          <div className="w-full flex justify-between my-4">
            <div className="w-full">
              <p className="text-white font-normal text-sm">New Vote: {(amount || 0) / 100} %</p>
              <div className="flex flex-row items-center justify-between">
                <div className="w-full mt-4 ml-4">
                  <Slider
                    railStyle={{
                      backgroundColor: canVote ? "#FFFFFF" : "#AFAFAF",
                      height: 4,
                    }}
                    trackStyle={{
                      backgroundColor: canVote ? "#FFFFFF" : "#AFAFAF",
                      height: 4,
                    }}
                    handleStyle={{
                      height: 22,
                      width: 22,
                      marginLeft: 0,
                      marginTop: -9,
                      borderWidth: 4,
                      opacity: 1,
                      borderColor: canVote ? "#C391FF" : "#AFAFAF",
                      backgroundColor: "#fff",
                      zIndex: 0,
                    }}
                    value={amount}
                    onChange={
                      canVote ? (val: any) => onChange(Number(val)) : () => { }
                    }
                    max={10000}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </Accordion>
  );
}

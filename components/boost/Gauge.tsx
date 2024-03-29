import { useEffect, useState } from "react";
import { Address, useAccount, usePublicClient } from "wagmi";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import AssetWithName from "@/components/vault/AssetWithName";
import { VaultData } from "@/lib/types";
import Accordion from "@/components/common/Accordion";
import Title from "@/components/common/Title";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";
import getAPR from "@/lib/gauges/getGaugeAPR";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";

interface GaugeProps {
  vaultData: VaultData;
  index: Address;
  votes: { [key: Address]: number };
  handleVotes: Function;
  canVote: boolean;
  searchTerm: string;
}

export default function Gauge({
  vaultData,
  index,
  votes,
  handleVotes,
  canVote,
  searchTerm,
}: GaugeProps): JSX.Element {
  const { address: account } = useAccount();

  const { data: weights } = useGaugeWeights({
    address: vaultData.gauge?.address as Address,
    account: account as Address,
    chainId: vaultData.chainId,
  });
  const [amount, setAmount] = useState(Number(weights?.[2].power));
  const [gaugeApr, setGaugeApr] = useState<number[]>([]);

  useEffect(() => {
    if (vaultData?.vault.price && gaugeApr.length === 0) {
      getAPR({ vaultData }).then((res) => setGaugeApr(res));
    }
  }, [vaultData, gaugeApr]);

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

  // Vault is not in search term
  if (
    searchTerm !== "" &&
    !vaultData.vault.name.toLowerCase().includes(searchTerm) &&
    !vaultData.vault.symbol.toLowerCase().includes(searchTerm) &&
    !vaultData.metadata.optionalMetadata.protocol?.name
      .toLowerCase()
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
          <div className="w-full flex justify-between gap-8 xs:gap-4">
            <div className="w-full mt-6 xs:mt-0">
              <p className="text-primary font-normal xs:text-[14px]">TVL</p>
              <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
                <Title
                  level={2}
                  fontWeight="font-normal"
                  as="span"
                  className="mr-1 text-primary"
                >
                  $ {NumberFormatter.format(vaultData.tvl)}
                </Title>
              </p>
            </div>

            <div className="w-full mt-6 xs:mt-0">
              {gaugeApr.length > 0 && (
                <>
                  <p className="font-normal text-primary xs:text-[14px]">
                    Min Boost
                  </p>
                  <Title
                    as="span"
                    level={2}
                    fontWeight="font-normal"
                    className="text-primary"
                  >
                    {NumberFormatter.format(
                      roundToTwoDecimalPlaces(gaugeApr[0])
                    )}{" "}
                    %
                  </Title>
                </>
              )}
            </div>
            <div className="w-full mt-6 xs:mt-0">
              {gaugeApr.length > 0 && (
                <>
                  <p className="font-normal text-primary xs:text-[14px]">
                    Max Boost
                  </p>
                  <Title
                    as="span"
                    level={2}
                    fontWeight="font-normal"
                    className="text-primary"
                  >
                    {NumberFormatter.format(
                      roundToTwoDecimalPlaces(gaugeApr[1])
                    )}{" "}
                    %
                  </Title>
                </>
              )}
            </div>
          </div>

          <div className="w-full flex justify-between gap-8 xs:gap-4">
            <div className="w-full mt-6 xs:mt-0">
              <p className="font-normal text-primary xs:text-[14px]">
                Current Weight
              </p>
              <Title
                as="span"
                level={2}
                fontWeight="font-normal"
                className="text-primary"
              >
                {(Number(weights?.[0]) / 1e16).toFixed(2) || 0} %
              </Title>
            </div>
            <div className="w-full mt-6 xs:mt-0">
              <p className="font-normal text-primary xs:text-[14px]">
                Upcoming Weight
              </p>
              <Title
                as="span"
                level={2}
                fontWeight="font-normal"
                className="text-primary"
              >
                {(Number(weights?.[1]) / 1e16).toFixed(2) || 0} %
              </Title>
            </div>
            <div className="w-full mt-6 xs:mt-0">
              <p className="font-normal text-primary xs:text-[14px]">
                My Votes
              </p>
              <Title
                as="span"
                level={2}
                fontWeight="font-normal"
                className="text-primary"
              >
                {(Number(weights?.[2].power) / 100).toFixed(2)} %
              </Title>
            </div>
          </div>

          <div className="w-full flex justify-between gap-8 xs:gap-4">
            <div className="w-full">
              <p className="text-primary font-normal text-sm">My Vote: {amount/100} %</p>
              <div className="flex flex-row items-center justify-between">
                <div className="w-full mt-4 ml-[11px]">
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
                      canVote ? (val: any) => onChange(Number(val)) : () => {}
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

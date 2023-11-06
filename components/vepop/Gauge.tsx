import { useEffect, useState } from "react";
import { Address, useAccount, usePublicClient } from "wagmi";
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';
import AssetWithName from "@/components/vault/AssetWithName";
import { VaultData } from "@/lib/types";
import Accordion from "@/components/common/Accordion";
import Title from "@/components/common/Title";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";
import calculateAPR from "@/lib/gauges/calculateGaugeAPR";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { useAtom } from "jotai";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";

interface GaugeProps {
  vaultData: VaultData;
  index: number;
  votes: number[];
  handleVotes: Function;
  canVote: boolean;
}

export default function Gauge({ vaultData, index, votes, handleVotes, canVote }: GaugeProps): JSX.Element {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const { data: weights } = useGaugeWeights({ address: vaultData.gauge?.address as Address, account: account as Address, chainId: vaultData.chainId })
  const [amount, setAmount] = useState(0);

  // const [apy, setApy] = useState<number | undefined>(0);

  // useEffect(() => {
  //   if (!apy) {
  //     // @ts-ignore
  //     yieldOptions?.getApy(vaultData.chainId, vaultData.metadata.optionalMetadata.resolver, vaultData.asset.address).then(res => setApy(!!res ? res.total : 0))
  //   }
  // }, [apy])

  // const [gaugeApr, setGaugeApr] = useState<number[]>([]);

  // useEffect(() => {
  //   if (vaultData?.vault.price && gaugeApr.length === 0) {
  //     calculateAPR({ vaultPrice: vaultData.vault.price, gauge: vaultData.gauge?.address as Address, publicClient }).then(res => setGaugeApr(res))
  //   }
  // }, [vaultData, gaugeApr])

  function onChange(value: number) {
    const currentVoteForThisGauge = votes[index];
    const potentialNewTotalVotes = votes.reduce((a, b) => a + b, 0) - currentVoteForThisGauge + Number(value);

    if (potentialNewTotalVotes <= 10000) {
      handleVotes(value, index);
      setAmount(value);
    }
  }

  return (
    <Accordion
      header={<>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">

          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>

          <div className="grid xs:grid-cols-2 smmd:grid-cols-3 w-full gap-8 xs:gap-4 pb-4 border-b-[1px] border-[#353945]">
            <div>
              <p className="text-primary font-normal">APY</p>
              <p className="text-primary font-medium text-[22px]">
                <Title level={2} fontWeight="font-medium" as="span" className="text-primary">
                  {"7%"}
                </Title>
              </p>
            </div>
            <div>
              <p className="text-primary font-normal">TVL</p>
              <p className="text-primary font-medium text-[22px]">
                <Title level={2} fontWeight="font-medium" as="span" className="text-primary">
                  $ {NumberFormatter.format(vaultData.tvl)}
                </Title>
              </p>
            </div>
          </div>

          <div className="grid xs:grid-cols-2 smmd:grid-cols-3 w-full gap-8 xs:gap-4">
            <div className="w-full">
              <p className="text-primary font-normal text-sm">Current Weight</p>
              <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
                <Title level={2} fontWeight="font-medium" as="span" className="text-primary">
                  {(Number(weights?.[0]) / 1e16).toFixed() || 0} %
                </Title>
              </p>
            </div>

            <div className="w-full">
              <p className="text-primary font-normal text-sm">Upcoming Weight</p>
              <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
                <Title level={2} fontWeight="font-medium" as="span" className="mr-1 text-primary">
                  {(Number(weights?.[1]) / 1e16).toFixed() || 0} %
                </Title>
              </p>
            </div>

            <div className="w-full">
              <p className="text-primary font-normal text-sm">Votes</p>
              <p className="text-primary font-normal">
                <Title level={2} fontWeight="font-medium" as="span" className="mr-1 text-primary">
                  3%
                </Title>
              </p>
            </div>

            <div className="w-full xs:block smmd:hidden">
              <p className="text-primary font-normal text-sm">My Votes</p>
              <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
                <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                  {(Number(weights?.[2].power) / 100).toFixed()} %
                </Title>
              </p>
            </div>
          </div>

          <div className="smmd:grid grid-cols-3 w-full gap-8 xs:gap-4">
            <div className="w-full xs:hidden smmd:block">
              <p className="text-primary font-normal text-sm">My Votes</p>
              <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
                <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                  {(Number(weights?.[2].power) / 100).toFixed()} %
                </Title>
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-primary font-normal text-sm">My Vote</p>
              <div className="flex flex-row items-center justify-between">
                <div className="w-full mt-4 ml-[11px]">
                  <Slider
                    railStyle={{ backgroundColor: canVote ? '#FFFFFF' : "#AFAFAF", height: 4 }}
                    trackStyle={{ backgroundColor: canVote ? '#FFFFFF' : "#AFAFAF", height: 4 }}
                    handleStyle={{
                      height: 22,
                      width: 22,
                      marginLeft: 0,
                      marginTop: -9,
                      borderWidth: 4,
                      opacity: 1,
                      borderColor: canVote ? '#C391FF' : "#AFAFAF",
                      backgroundColor: '#fff',
                      zIndex:0
                    }}
                    value={amount}
                    onChange={canVote ? (val: any) => onChange(Number(val)) : () => { }}
                    max={10000}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between w-full">
            <div className="w-1/4"></div>
            <div className="w-1/4"></div>
            <div className="w-1/4"></div>
            <div className="w-1/4"></div>
          </div>

        </ div>
      </>}
    >
    </Accordion>
  );
}

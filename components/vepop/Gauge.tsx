import { useState } from "react";
import { Address, useAccount } from "wagmi";
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';
import AssetWithName from "@/components/vault/AssetWithName";
import { VaultData } from "@/lib/types";
import Accordion from "@/components/common/Accordion";
import Title from "@/components/common/Title";
import useGaugeWeights from "@/lib/gauges/useGaugeWeights";

export default function Gauge({ vault, index, votes, handleVotes, canVote }: { vault: VaultData, index: number, votes: number[], handleVotes: Function, canVote: boolean }): JSX.Element {
  const { address: account } = useAccount()

  const { data: weights } = useGaugeWeights({ address: vault.gauge?.address as Address, account: account as Address, chainId: vault.chainId })

  const [amount, setAmount] = useState(0);

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
            <AssetWithName vault={vault} />
          </div>

          <div className="grid xs:grid-cols-2 smmd:grid-cols-3 w-full gap-8 xs:gap-4 pb-4 border-b-[1px] border-[#353945]">
            <div>
              <p className="text-primary font-normal">APY</p>
              <p className="text-primary font-medium text-[22px]">
                <Title level={2} fontWeight="font-medium" as="span" className="text-primary">
                  7.7%
                </Title>
              </p>
            </div>
            <div>
              <p className="text-primary font-normal">TVL</p>
              <p className="text-primary font-medium text-[22px]">
                <Title level={2} fontWeight="font-medium" as="span" className="text-primary">
                  $764K
                </Title>
              </p>
            </div>
            <div className="xs:hidden smmd:block w-full h-fit mt-auto">
              <p className="font-normal text-primary text-[15px] mb-1">⚡ Zap available</p>
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
      {/* Accordion Content */}
      <div className="lg:flex lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0 mt-8">
        <div className="border border-[#F0EEE0] rounded-lg bg-white lg:w-1/2 p-6">
          <span className="flex flex-row flex-wrap items-center justify-between">
            <p className="text-primary font-normal">Gauge address:</p>
            <p className="font-bold text-primary">
              {vault.gauge?.address}
            </p>
          </span>
        </div>
        <div className="border border-[#F0EEE0] rounded-lg bg-white lg:w-1/2 p-6">
          <span className="flex flex-row flex-wrap items-center justify-between">
            <p className="text-primary font-normal">Vault address:</p>
            <p className="font-bold text-primary">
              {vault.address}
            </p>
          </span>
        </div>
      </div>
    </Accordion>
  );
}

import { Address } from "viem";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import Title from "@/components/common/Title";
import { VaultData } from "@/lib/types";
import { usePublicClient } from "wagmi";
import { useAtom } from "jotai";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { useEffect, useState } from "react";
import calculateAPR from "@/lib/gauges/calculateGaugeAPR";

interface VaultStatProps {
  vaultData: VaultData
  account?: Address
}

export default function VaultStats({ vaultData, account }: VaultStatProps): JSX.Element {
  const publicClient = usePublicClient()
  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const { asset, vault, gauge } = vaultData

  const [apy, setApy] = useState<number | undefined>(0);

  useEffect(() => {
    if (!apy) {
      // @ts-ignore
      yieldOptions?.getApy(vaultData.chainId, vaultData.metadata.optionalMetadata.resolver, vaultData.asset.address).then(res => setApy(!!res ? res.total : 0))
    }
  }, [apy])

  const [gaugeApr, setGaugeApr] = useState<number[]>([]);

  useEffect(() => {
    if (vault?.price && gaugeApr.length === 0 && !!gauge) {
      calculateAPR({ vaultPrice: vault?.price, gauge: gauge?.address, publicClient }).then(res => setGaugeApr(res))
    }
  }, [vault, gaugeApr])

  return (
    <>
      <div className="w-full flex justify-between gap-8 xs:gap-4">
        <div className="w-full mt-6 xs:mt-0">
          <p className="text-primary font-normal xs:text-[14px]">Your Wallet</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {`${formatAndRoundNumber(asset.balance, asset.decimals)}`}
            </Title>
          </p>
        </div>

        <div className="w-full mt-6 xs:mt-0">
          <p className="text-primary font-normal xs:text-[14px]">Your Deposit</p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {account ? '$ ' + (!!gauge ?
                formatAndRoundNumber(gauge?.balance || 0, vault.decimals) :
                formatAndRoundNumber(vault.balance, vault.decimals)
              ) : "-"}
            </Title>
          </div>
        </div>

        <div className="w-full mt-6 xs:mt-0">
          <p className="leading-6 text-primary xs:text-[14px]">TVL</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
          </Title>
        </div>
      </div>

      <div className="w-full flex justify-between gap-8 xs:gap-4">
        <div className="w-full mt-6 xs:mt-0">
          <p className="font-normal text-primary xs:text-[14px]">vAPY</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {apy ? `${NumberFormatter.format(apy)} %` : "0 %"}
          </Title>
        </div>
        <div className="w-full mt-6 xs:mt-0">
          {gaugeApr.length > 0 &&
            <>
              <p className="font-normal text-primary xs:text-[14px]">Min Boost</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {NumberFormatter.format(gaugeApr[0])} %
              </Title>
            </>
          }
        </div>
        <div className="w-full mt-6 xs:mt-0">
          {gaugeApr.length > 0 &&
            <>
              <p className="font-normal text-primary xs:text-[14px]">Max Boost</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {NumberFormatter.format(gaugeApr[1])} %
              </Title>
            </>
          }
        </div>
      </div>
      <div className="w-full h-fit mt-auto">
        <p className="font-normal text-primary text-[15px] mb-1">⚡ Zap available</p>
      </div>
    </>
  )
}
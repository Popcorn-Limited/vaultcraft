import { Address } from "viem";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import Title from "@/components/common/Title";
import { VaultData } from "@/lib/types";

interface VaultStatProps {
  vaultData: VaultData
  account?: Address
  apy?: number;
}

export default function VaultStats({ vaultData, account, apy }: VaultStatProps): JSX.Element {
  const { asset, vault, gauge } = vaultData
  return (
    <>
      <div className="w-full flex justify-between gap-8 xs:gap-4">
        <div className="w-full mt-6 xs:mt-0">
          <p className="text-primary font-normal xs:text-[14px]">Your Wallet</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {`${formatAndRoundNumber(asset.balance, asset.decimals)} %`}
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
            $ {NumberFormatter.format(vaultData.tvl)}
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
          <p className="font-normal text-primary xs:text-[14px]">Boost APY</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {'3 - 7%'}
          </Title>
        </div>
        <div className="w-full h-fit mt-auto xs:opacity-0">
          <p className="font-normal text-primary text-[15px] mb-1">⚡ Zap available</p>
        </div>
      </div>
    </>
  )
}
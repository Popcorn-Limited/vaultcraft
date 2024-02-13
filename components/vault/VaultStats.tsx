import { Address, formatEther, formatUnits } from "viem";
import { NumberFormatter, formatAndRoundNumber, formatToFixedDecimals } from "@/lib/utils/formatBigNumber";
import Title from "@/components/common/Title";
import { UserAccountData, VaultData } from "@/lib/types";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";

interface VaultStatProps {
  vaultData: VaultData
  account?: Address
  zapAvailable?: boolean
}

export default function VaultStats({ vaultData, account, zapAvailable }: VaultStatProps): JSX.Element {
  const { asset, vault, gauge, apy, gaugeMinApy, gaugeMaxApy } = vaultData
  return (
    <>
      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Your Wallet</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {`${formatAndRoundNumber(asset.balance, asset.decimals)}`}
            </Title>
          </p>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Your Deposit</p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {account ? '$ ' +
                formatAndRoundNumber((!!gauge ? gauge.balance : vault.balance) * vault.price, vault.decimals)
                : "-"}
            </Title>
          </div>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="leading-6 text-primary md:text-[14px]">TVL</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
          </Title>
        </div>
      </div>

      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">vAPY</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {apy ? `${NumberFormatter.format(roundToTwoDecimalPlaces(apy))} %` : "0 %"}
          </Title>
        </div>
        <div className="w-full mt-6 md:mt-0">
          {gaugeMinApy ? (
            <>
              <p className="font-normal text-primary md:text-[14px]">Min Boost</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {gaugeMinApy.toFixed(2)} %
              </Title>
            </>) : <></>
          }
        </div>
        <div className="w-full mt-6 md:mt-0">
          {gaugeMaxApy ?
            <>
              <p className="font-normal text-primary md:text-[14px]">Max Boost</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {gaugeMaxApy.toFixed(2)} %
              </Title>
            </> : <></>
          }
        </div>
      </div>
      {zapAvailable && (
        <div className="w-full h-fit mt-auto">
          <p className="font-normal text-primary text-[15px] mb-1">⚡ Zap available</p>
        </div>
      )}
    </>
  )
}
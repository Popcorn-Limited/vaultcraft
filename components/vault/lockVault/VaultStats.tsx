import Title from "@/components/common/Title";
import { LockVaultData } from "@/lib/types";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";

interface VaultStatsProps {
  vaultData: LockVaultData;
  zapAvailable: boolean;
}

export default function VaultStats({ vaultData, zapAvailable }: VaultStatsProps): JSX.Element {
  const totalRewardApy = vaultData.rewards.reduce((a, b) => a + b.rewardApy, 0)
  return (
    <>
      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Your Wallet</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {`${formatAndRoundNumber(vaultData.asset.balance, vaultData.asset.decimals)}`}
            </Title>
          </p>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Your Deposit</p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {`${formatAndRoundNumber(vaultData.vault.balance * vaultData.vault.price, vaultData.vault.decimals)}`}
            </Title>
          </div>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="leading-6 text-primary md:text-[14px]">TVL</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            $ {vaultData.tvl < 0.1 ? "0" : NumberFormatter.format(vaultData.tvl)}
          </Title>
        </div>
      </div>

      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">vAPY</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {vaultData.apy.toFixed(2)} %
          </Title>
        </div>
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Min Rewards</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {totalRewardApy ? (totalRewardApy / 4).toFixed(2) : "-"} %
          </Title>
        </div>
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Max Rewards</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            {totalRewardApy ? totalRewardApy.toFixed(2) : "-"} %
          </Title>
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
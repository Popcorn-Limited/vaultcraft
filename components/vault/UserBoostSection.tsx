import { formatTwoDecimals } from "@/lib/utils/formatBigNumber";
import CardStat from "@/components/common/CardStat";
import { Token, VaultData } from "@/lib/types";

export default function UserBoostSection({ vaultData, gauge, veToken }: { vaultData: VaultData, gauge: Token, veToken: Token }): JSX.Element {
  const boostApy = (vaultData.gaugeData?.workingBalance! / (gauge?.balance || 0)) * 5 * vaultData.gaugeData?.lowerAPR!
  const boost = (vaultData.gaugeData?.workingBalance! / (gauge?.balance || 0)) * 5
  const missingVeBalance = (((gauge?.balance || 0) / vaultData.gaugeData?.workingSupply!) * (veToken.totalSupply / 1e18)) - (veToken.balance / 1e18)
  return (
    <div className="bg-customNeutral200 p-6 rounded-lg">
      <p className="text-white text-2xl font-bold mb-4">Your Boost 🚀</p>
      <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4">
        <CardStat
          id="your-apy"
          label="Your Rewards APY"
          value={`${formatTwoDecimals(boostApy)} %`}
          tooltip={`Your rewards APY depends on the proportion of locked liquidity, veVCX, you provide relative to the total veVCX held by all gauge holders. For instance, to receive the maximum rewards APY, if you own 10% of the supply of Gauge A you also would need to own 10% of cumulative veVCX supply of all gauge share holders to earn the maximum rewards apy of ${formatTwoDecimals(vaultData.gaugeData?.upperAPR!)} %. Liquidity providers are guaranteed a minimum rewards apy of ${formatTwoDecimals(vaultData.gaugeData?.lowerAPR!)}`}
        />
        <CardStat
          id="your-boost"
          label="Your Boost"
          value={`${formatTwoDecimals(boost)} X`}
          tooltip="Your Boost depends on the proportion of locked liquidity, veVCX, you provide relative to the total veVCX held by all gauge holders. For instance, to receive the maximum 5x boost, if you own 10% of the supply of Gauge A you also would need to own 10% of cumulative veVCX supply of all gauge share holders to earn the maximum boost of 5x. Liquidity providers are guaranteed a minimum boost of 1x."
        />
        <CardStat
          id="ve-missing"
          label="VeVCX for max Boost"
          value={`${missingVeBalance < 0 ? 0 : formatTwoDecimals(missingVeBalance)} VeVCX`}
          tooltip="The amount of locked liquidity, veVCX, required to earn the maximum boost in oVCX rewards per epoch."
        />
      </div>
    </div>
  )
}
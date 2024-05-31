import { Address } from "viem";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import CardStat from "@/components/common/CardStat";
import { Token, VaultData } from "@/lib/types";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";

interface VaultStatProps {
  vaultData: VaultData;
  asset: Token;
  vault: Token;
  gauge?: Token;
  account?: Address;
  zapAvailable?: boolean;
}

export default function VaultStats({
  vaultData,
  asset,
  vault,
  gauge,
  account,
  zapAvailable,
}: VaultStatProps): JSX.Element {
  const baseTooltipId = vault.address.slice(1);

  return (
    <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4">
      <CardStat
        id={`${baseTooltipId}-wallet`}
        label="Your Wallet"
        value={`$ ${formatAndRoundNumber(asset.balance * asset.price, asset.decimals)}`}
        secondaryValue={`${formatAndRoundNumber(asset.balance, asset.decimals)} TKN`}
        tooltip="Deposit assets held in your wallet"
      />
      <CardStat
        id={`${baseTooltipId}-deposit`}
        label="Your Deposit"
        value={`$ ${account
          ?
          `${!!gauge ?
            NumberFormatter.format(((gauge.balance * gauge.price) / 10 ** gauge.decimals) + ((vault?.balance! * vault?.price!) / 10 ** vault?.decimals!))
            : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
          }`
          : "0"}`}
        secondaryValue={`${!!gauge ?
          NumberFormatter.format(((gauge.balance) / 10 ** gauge.decimals) + ((vault?.balance!) / 10 ** vault?.decimals!))
          : formatAndRoundNumber(vault?.balance!, vault?.decimals!)
          } TKN`}
        tooltip="Value of your vault deposits"
      />
      <CardStat
        id={`${baseTooltipId}-tvl`}
        label="TVL"
        value={`$ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}`}
        secondaryValue={`${formatAndRoundNumber(vaultData.totalAssets, asset.decimals)} TKN`}
        tooltip="Total value of all assets deposited into the vault"
      />
      <CardStat
        id={`${baseTooltipId}-vApy`}
        label="vAPY"
        value={`${vaultData.apy ? `${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))}` : "0"} %`}
        tooltip="Current variable apy of the vault"
      />
      {vaultData?.minGaugeApy > 0 &&
        <CardStat
          id={`${baseTooltipId}-minRewards`}
          label="Min Rewards Apy"
          value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData?.minGaugeApy))} %`}
          tooltip="Minimum oVCX boost APR based on most current epoch&apos;s distribution"
        />}
      {vaultData?.maxGaugeApy > 0 &&
        <CardStat
          id={`${baseTooltipId}-maxRewards`}
          label="Max Rewards Apy"
          value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData?.maxGaugeApy))} %`}
          tooltip="Maximum oVCX boost APR based on most current epoch&apos;s distribution"
        />}
    </div>
  );
}


import { Address } from "viem";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import CardStat from "@/components/common/CardStat";
import { Token, VaultData } from "@/lib/types";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";

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
  const [tokens] = useAtom(tokensAtom);
  const baseTooltipId = vault.address.slice(1);

  return (
    <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4">
      <CardStat
        id={`${baseTooltipId}-wallet`}
        label="Your Wallet"
        value={`$ ${formatAndRoundNumber(asset.balance * asset.price, asset.decimals)}`}
        secondaryValue={`${formatAndRoundNumber(asset.balance, asset.decimals)} ${asset.symbol}`}
        tooltip="Value of deposit assets held in your wallet"
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
          } ${asset.symbol}`}
        tooltip="Value of your vault deposits"
      />
      <CardStat
        id={`${baseTooltipId}-tvl`}
        label="TVL"
        value={`$ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}`}
        secondaryValue={`${formatAndRoundNumber(vaultData.totalAssets, asset.decimals)} ${asset.symbol}`}
        tooltip="Total value of all assets deposited into the vault"
      />
      <CardStat
        id={`${baseTooltipId}-vApy`}
        label="vAPY"
        value={`${vaultData.apy ? `${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))}` : "0"} %`}
        tooltip="Current variable APY of the vault"
      />
      {vaultData?.gaugeData?.upperAPR && vaultData?.gaugeData?.upperAPR > 0
        ? <>
          <CardStat
            id={`${baseTooltipId}-minBoost`}
            label="Min Boost APR"
            value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData?.gaugeData?.lowerAPR))} %`}
            tooltip={`Minimum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of ${NumberFormatter.format(vaultData?.gaugeData.annualEmissions / 5)} oVCX p. year)`}
          />
          <CardStat
            id={`${baseTooltipId}-maxBoost`}
            label="Max Boost APR"
            value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData?.gaugeData?.upperAPR))} %`}
            tooltip={`Maximum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of ${NumberFormatter.format(vaultData?.gaugeData.annualEmissions)} oVCX p. year)`}
          />
        </>
        : <></>
      }
      {vaultData?.gaugeData?.rewardApy && vaultData?.gaugeData?.rewardApy.apy > 0
        ? <CardStat
          id={`${baseTooltipId}-rewardApy`}
          label="Reward APR"
          value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData?.gaugeData?.rewardApy.apy))} %`}
          tooltipChild={
            <div className="w-28">
              <p className="font-bold">Annual Rewards</p>
              {vaultData.gaugeData?.rewardApy.rewards.map((reward) => (
                <p key={reward.address}>
                  {NumberFormatter.format(reward.emissions)}{" "}
                  {tokens[vaultData.chainId][reward.address].symbol}
                </p>
              ))}
            </div>
          }
        />
        : <></>
      }
    </div>
  );
}


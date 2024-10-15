import { useEffect, useState } from "react";
import { isAddress, zeroAddress } from "viem";
import { useAtom } from "jotai";
import {
  NumberFormatter,
  formatAndRoundNumber,
  formatTwoDecimals,
} from "@/lib/utils/formatBigNumber";
import type { Token, VaultData } from "@/lib/types";
import { tokensAtom } from "@/lib/atoms";
import { cn, formatBalance } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import AssetWithName from "@/components/common/AssetWithName";
import CardStat from "@/components/common/CardStat";

export default function VaultCard({
  searchTerm,
  ...vaultData
}: VaultData & {
  searchTerm?: string;
}) {
  const { query, ...router } = useRouter();

  const {
    asset: assetAddress,
    gaugeData,
    gauge: gaugeAddress,
    vault: vaultAddress,
    chainId,
  } = vaultData;

  const [tokens] = useAtom(tokensAtom);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [walletValue, setWalletValue] = useState<number>(0)
  const [depositValue, setDepositValue] = useState<number>(0)

  useEffect(() => {
    if (vaultData) {
      const asset_ = tokens[chainId][assetAddress];
      const vault_ = tokens[chainId][vaultAddress];
      const gauge_ = gaugeAddress && gaugeAddress !== zeroAddress ? tokens[chainId][gaugeAddress] : undefined

      let depositValue_ = Number(vault!.balance.formattedUSD)
      if (gauge_) depositValue_ += Number(gauge!.balance.formattedUSD)

      setWalletValue(Number(asset!.balance.formattedUSD))
      setDepositValue(depositValue_)

      setAsset(asset_);
      setVault(vault_);
      setGauge(gauge_);
    }
  }, [vaultData])

  const boost = ((vaultData.gaugeData?.workingBalance! / Number(gauge?.balance.value || 0)) * 5) || 1

  const baseTooltipId = vaultData.address.slice(1);

  const searchData = [
    vaultData.metadata?.vaultName,
    asset?.symbol,
    asset?.name,
    gauge?.symbol,
    gauge?.name,
    ...(vaultData.metadata?.labels ?? []),
    ...vaultData.strategies.map(
      ({ metadata }) => `${metadata?.name}${metadata?.description}`
    ),
  ]
    .join()
    .toLowerCase();

  if (!vaultData || !asset || !vault) return <></>;
  return (
    <div
      role="button"
      onClick={() => {
        router.push(
          !!query?.ref && isAddress(query.ref as string)
            ? `/vaults/${vaultData.vault}?chainId=${vaultData.chainId}&ref=${query.ref}`
            : `/vaults/${vaultData.vault}?chainId=${vaultData.chainId}`
        );
      }}
      className={cn(
        "p-8 overflow-hidden rounded-3xl border border-customNeutral100 group hover:bg-customNeutral200 cursor-pointer",
        {
          hidden: searchTerm
            ? !searchData.includes(searchTerm.toLowerCase())
            : false,
        }
      )}
    >
      <AssetWithName
        className="pl-2 [&_.relative]:shrink-0 [&_h2]:text-lg flex-nowrap [&_.flex-wrap]:flex-nowrap"
        vault={vaultData}
      />

      <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4">
        <CardStat
          id={`${baseTooltipId}-wallet`}
          label="Your Wallet"
          value={`$ ${walletValue < 1 ? "0" : walletValue}`}
          secondaryValue={`${walletValue < 1 ? "0" : asset.balance.formatted} ${asset.symbol}`}
          tooltip="Value of deposit assets held in your wallet"
        />
        <CardStat
          id={`${baseTooltipId}-deposit`}
          label="Your Deposit"
          value={`$ ${depositValue < 1 ? "0" : depositValue}`}
          secondaryValue={`${depositValue < 1 ? "0" :
            (
              !!gauge ?
                Number(gauge.balance.formatted) + Number(vault!.balance.formatted)
                : vault!.balance.formatted
            )
            } ${asset.symbol}`}
          tooltip="Value of your vault deposits"
        />
        <CardStat
          id={`${baseTooltipId}-tvl`}
          label="TVL"
          value={`$ ${vaultData.tvl < 1 ? "0" : vaultData.tvl}`}
          secondaryValue={`${formatBalance(vaultData.totalAssets, asset.decimals)} ${asset.symbol}`}
          tooltip="Total value of all assets deposited into the vault"
        />
        <CardStat
          id={`${baseTooltipId}-vApy`}
          label="vAPY"
          value={`${formatTwoDecimals(vaultData.apyData.totalApy)} %`}
          tooltip="Current variable APY of the vault"
        />
        {vaultData?.gaugeData?.upperAPR && vaultData?.gaugeData?.upperAPR > 0
          ?
          <>
            <CardStat
              id={`${baseTooltipId}-minBoost`}
              label="Min Boost APR"
              value={`${formatTwoDecimals(vaultData?.gaugeData?.lowerAPR)} %`}
              secondaryValue={gaugeData && gaugeData?.rewardApy.apy > 0 ? `+ ${formatTwoDecimals(gaugeData?.rewardApy.apy)}%` : undefined}
              tooltip={`Minimum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of ${NumberFormatter.format(vaultData?.gaugeData.annualEmissions / 5)} oVCX p. year)`}
            />
            <CardStat
              id={`${baseTooltipId}-maxBoost`}
              label="Max Boost APR"
              value={`${formatTwoDecimals(vaultData?.gaugeData?.upperAPR)} %`}
              secondaryValue={gaugeData && gaugeData?.rewardApy.apy > 0 ? `+ ${formatTwoDecimals(gaugeData?.rewardApy.apy)}%` : undefined}
              tooltip={`Maximum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of ${NumberFormatter.format(vaultData?.gaugeData.annualEmissions)} oVCX p. year)`}
            />
            <CardStat
              id="boost"
              label="Your Boost"
              value={`${formatTwoDecimals(boost)} X`}
              tooltip="Your Boost depends on the proportion of locked liquidity, veVCX, you provide relative to the total veVCX held by all gauge holders. For instance, to receive the maximum 5x boost, if you own 10% of the supply of Gauge A you also would need to own 10% of cumulative veVCX supply of all gauge share holders to earn the maximum boost of 5x. Liquidity providers are guaranteed a minimum boost of 1x."
            />
            <CardStat
              id="your-apy"
              label="Your Boost APY"
              value={`${formatTwoDecimals(boost * vaultData.gaugeData?.lowerAPR!)} %`}
              tooltip={`Your rewards APY depends on the proportion of locked liquidity, veVCX, you provide relative to the total veVCX held by all gauge holders. For instance, to receive the maximum rewards APY, if you own 10% of the supply of Gauge A you also would need to own 10% of cumulative veVCX supply of all gauge share holders to earn the maximum rewards apy of ${formatTwoDecimals(vaultData.gaugeData?.upperAPR!)} %. Liquidity providers are guaranteed a minimum rewards apy of ${formatTwoDecimals(vaultData.gaugeData?.lowerAPR!)}`}
            />
          </>
          : <></>
        }
      </div>
    </div>
  );
}
import type { PropsWithChildren } from "react";

import { isAddress } from "viem";
import { useAtom } from "jotai";

import {
  NumberFormatter,
  formatAndRoundNumber,
  formatTwoDecimals,
} from "@/lib/utils/formatBigNumber";
import type { VaultData } from "@/lib/types";
import { tokensAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import AssetWithName from "./AssetWithName";
import CardStat from "../common/CardStat";

export default function VaultCard({
  searchTerm,
  ...vaultData
}: VaultData & {
  searchTerm?: string;
}) {
  const { query, ...router } = useRouter();

  const {
    asset,
    gauge,
    gaugeData,
    tvl,
    apy,
    vault: vaultAddress,
    chainId,
  } = vaultData;
  const [tokens] = useAtom(tokensAtom);

  const vault = tokens[chainId]?.[vaultAddress] ?? {};
  const dataAsset = tokens[chainId]?.[asset] ?? {};
  const dataGauge = tokens[chainId]?.[gauge!] ?? {};

  const boost = ((vaultData.gaugeData?.workingBalance! / (dataGauge?.balance || 0)) * 5) || 1

  const baseTooltipId = vault.address.slice(1);

  const searchData = [
    vaultData.metadata?.vaultName,
    dataAsset?.symbol,
    dataAsset?.name,
    dataGauge?.symbol,
    dataGauge?.name,
    ...(vaultData.metadata?.labels ?? []),
    ...vaultData.strategies.map(
      ({ metadata }) => `${metadata?.name}${metadata?.description}`
    ),
  ]
    .join()
    .toLowerCase();

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
          value={`$ ${formatAndRoundNumber(dataAsset.balance * dataAsset.price, dataAsset.decimals)}`}
          secondaryValue={`${formatAndRoundNumber(dataAsset.balance, dataAsset.decimals)} ${dataAsset.symbol}`}
          tooltip="Value of deposit assets held in your wallet"
        />
        <CardStat
          id={`${baseTooltipId}-deposit`}
          label="Your Deposit"
          value={`$ ${!!gauge ?
            NumberFormatter.format(((dataGauge.balance * dataGauge.price) / 10 ** dataGauge.decimals) + ((vault?.balance! * vault?.price!) / 10 ** vault?.decimals!))
            : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
            }`}
          secondaryValue={`${!!gauge ?
            NumberFormatter.format(((dataGauge.balance) / 10 ** dataGauge.decimals) + ((vault?.balance!) / 10 ** vault?.decimals!))
            : formatAndRoundNumber(vault?.balance!, vault?.decimals!)
            } ${dataAsset.symbol}`}
          tooltip="Value of your vault deposits"
        />
        <CardStat
          id={`${baseTooltipId}-tvl`}
          label="TVL"
          value={`$ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}`}
          secondaryValue={`${formatAndRoundNumber(vaultData.totalAssets, dataAsset.decimals)} ${dataAsset.symbol}`}
          tooltip="Total value of all assets deposited into the vault"
        />
        <CardStat
          id={`${baseTooltipId}-vApy`}
          label="vAPY"
          value={`${formatTwoDecimals(vaultData.apy)} %`}
          tooltip="Current variable APY of the vault"
        />
        {vaultData?.gaugeData?.upperAPR && vaultData?.gaugeData?.upperAPR > 0
          ?
          <>
            <CardStat
              id={`${baseTooltipId}-minBoost`}
              label="Min Boost APR"
              value={`${formatTwoDecimals(vaultData?.gaugeData?.lowerAPR)} %`}
              tooltip={`Minimum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of ${NumberFormatter.format(vaultData?.gaugeData.annualEmissions / 5)} oVCX p. year)`}
            />
            <CardStat
              id={`${baseTooltipId}-maxBoost`}
              label="Max Boost APR"
              value={`${formatTwoDecimals(vaultData?.gaugeData?.upperAPR)} %`}
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
import { isAddress, zeroAddress } from "viem";
import { useAtom } from "jotai";

import {
  NumberFormatter,
  formatAndRoundNumber,
  formatTwoDecimals,
} from "@/lib/utils/formatBigNumber";
import type { Token, VaultData } from "@/lib/types";
import { tokensAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import AssetWithName from "@/components/common/AssetWithName";
import { useEffect, useState } from "react";
import { WithTooltip } from "@/components/common/Tooltip";

export default function VaultRow({
  searchTerm,
  link,
  ...vaultData
}: VaultData & {
  searchTerm?: string;
  link: string;
}) {
  const { ...router } = useRouter();

  const {
    asset: assetAddress,
    gaugeData,
    gauge: gaugeAddress,
    tvl,
    apy,
    vault: vaultAddress,
    chainId,
  } = vaultData;

  const [tokens] = useAtom(tokensAtom);

  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [walletValue, setWalletValue] = useState<number>(0)
  const [depositValue, setDepositValue] = useState<number>(0)
  const [boost, setBoost] = useState<number>(1);
  const [vAPR, setVAPR] = useState<number>(0);

  useEffect(() => {
    if (vaultData) {
      const asset_ = tokens[chainId][assetAddress];
      const vault_ = tokens[chainId][vaultAddress];
      const gauge_ = gaugeAddress && gaugeAddress !== zeroAddress ? tokens[chainId][gaugeAddress] : undefined

      let depositValue_ = (vault_.balance * vault_.price) / (10 ** vault_.decimals)
      if (gauge_) depositValue_ += (gauge_.balance * gauge_.price) / (10 ** gauge_.decimals)

      setWalletValue((asset_.balance * asset_.price) / (10 ** asset_.decimals))
      setDepositValue(depositValue_)

      let vAPR_ = apy;
      if (gaugeData && gauge) {
        let boost_ = (gaugeData.workingBalance / (gauge.balance || 0)) * 5;
        if (boost_ > 1) setBoost(boost_);

        if (gaugeData.rewardApy.apy) vAPR_ += gaugeData.rewardApy.apy
        if (gaugeData.lowerAPR) vAPR_ += (gaugeData.lowerAPR * boost)
      }
      setVAPR(vAPR_)

      setAsset(asset_);
      setVault(vault_);
      setGauge(gauge_);
    }
  }, [vaultData])


  const searchData = [
    vaultData.metadata?.vaultName,
    asset?.symbol,
    asset?.name,
    gauge?.symbol,
    gauge?.name,
    ...(vaultData.metadata?.labels ?? []),
    ...vaultData.strategies.map(strategy => strategy.metadata.protocol),
  ]
    .join()
    .toLowerCase();

  if (!vaultData || !asset || !vault || Object.keys(tokens).length === 0) return <></>;
  return (
    <tr
      onClick={() => router.push(link)}
      role="button"
      className={cn(
        "border-b cursor-pointer hover:bg-customNeutral200/80 border-customNeutral100",
        {
          hidden: searchTerm
            ? !searchData.includes(searchTerm.toLowerCase())
            : false,
        }
      )}
    >
      <td>
        <AssetWithName
          className="[&_h2]:font-normal [&_.relative]:shrink-0 [&_.relative]:whitespace-nowrap pl-3 [&_h2]:text-lg"
          vault={vaultData}
        />
      </td>

      <td className="text-right">
        <p className="text-lg">
          $ {walletValue < 1 ? "0" : NumberFormatter.format(walletValue)}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">
          {walletValue < 1 ? "0" : formatAndRoundNumber(asset.balance, asset.decimals)} {asset.symbol}
        </p>
      </td>

      <td className="text-right">
        <p className="text-lg">
          $ {depositValue < 1 ? "0" : NumberFormatter.format(depositValue)}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">
          {depositValue < 1 ? "0" :
            (
              !!gauge ?
                NumberFormatter.format(((gauge.balance) / 10 ** gauge.decimals) + ((vault?.balance!) / 10 ** vault?.decimals!))
                : formatAndRoundNumber(vault?.balance!, vault?.decimals!)
            )
          } {asset.symbol}
        </p>
      </td>

      <td className="text-right whitespace-nowrap">
        <WithTooltip content={`This Vault deploys its TVL $ ${tvl < 1 ? "0" : NumberFormatter.format(tvl)}
        (${formatAndRoundNumber(vaultData.totalAssets, asset.decimals)} ${asset.symbol}) 
        in $ ${formatTwoDecimals(vaultData.strategies.reduce((a, b) => a + b.apyHist[b.apyHist.length - 1].tvl, 0))} TVL of underlying protocols`}>
          <p className="text-lg">
            $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
          </p>
          <p className="text-sm -mt-0.5 text-customGray200">
            {formatAndRoundNumber(vaultData.totalAssets, asset.decimals)} {asset.symbol}
          </p>
        </WithTooltip>
      </td>

      <td className="text-right text-lg">
        <WithTooltip
          content={`vAPR-${vaultAddress}`}
          tooltipChild={
            <div className="w-42">
              <p>Vault APR: {formatTwoDecimals(apy)} %</p>
              {gaugeData?.lowerAPR && gaugeData?.lowerAPR > 0 ? <p>Your Boost: {formatTwoDecimals(gaugeData?.lowerAPR * boost)} %</p> : <></>}
              {gaugeData?.rewardApy.apy && gaugeData?.rewardApy.apy > 0 ? <p>Additional Rewards: {formatTwoDecimals(gaugeData?.rewardApy.apy)} %</p> : <></>}
            </div>
          }
        >
          <p className="text-lg">
            {formatTwoDecimals(vAPR)}%
          </p>
        </WithTooltip>
      </td>

      <td className="text-right text-lg">
        <WithTooltip content={`Earn between ${formatTwoDecimals(gaugeData?.lowerAPR || 0)}-${formatTwoDecimals(gaugeData?.upperAPR || 0)} % oVCX boost APR depending your balance of veVCX. (Based on the current emissions of ${formatTwoDecimals((gaugeData?.annualEmissions || 0) / 5)}-${formatTwoDecimals(gaugeData?.annualEmissions || 0)} oVCX p.Year)`}>
          <p className="text-lg">
            {formatTwoDecimals(gaugeData?.upperAPR || 0)}%
          </p>
          <p className="text-sm -mt-0.5 text-customGray200">
            {formatTwoDecimals(gaugeData?.lowerAPR || 0)}%
          </p>
        </WithTooltip>
      </td>
    </tr>
  );
}
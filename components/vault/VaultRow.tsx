import { zeroAddress } from "viem";
import { useAtom } from "jotai";
import type { Token, VaultData } from "@/lib/types";
import { tokensAtom } from "@/lib/atoms";
import { cn, formatBalance, NumberFormatter } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import AssetWithName from "@/components/common/AssetWithName";
import { useEffect, useState } from "react";
import LargeCardStat from "@/components/common/LargeCardStat";
import CardStat from "../common/CardStat";
import { WithTooltip } from "../common/Tooltip";

function depositValue(vault: Token, gauge?: Token): number {
  let result = Number(vault.balance.formattedUSD)
  if (gauge) result += Number(gauge.balance.formattedUSD)
  return result
}

function boostValue(vaultData: VaultData, gauge?: Token): number {
  if (!vaultData || !gauge) return 1
  let boost = (vaultData.gaugeData!.workingBalance / Number(gauge.balance.value || 0)) * 5;
  return boost > 1 ? boost : 1
}

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
    apyData,
    vault: vaultAddress,
    chainId,
  } = vaultData;

  const [tokens] = useAtom(tokensAtom);

  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();

  useEffect(() => {
    if (vaultData) {
      const asset_ = tokens[chainId][assetAddress];
      const vault_ = tokens[chainId][vaultAddress];
      const gauge_ = gaugeAddress && gaugeAddress !== zeroAddress ? tokens[chainId][gaugeAddress] : undefined

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
          {Number(asset.balance.formattedUSD) < 1 ? "$ 0" : `$ ${NumberFormatter.format(Number(asset.balance.formattedUSD))}`}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">
          {Number(asset.balance.formattedUSD) < 1 ? `0 ${asset.symbol}` : `${NumberFormatter.format(Number(asset.balance.formatted))} ${asset.symbol}`}
        </p>
      </td>

      <td className="text-right">
        <p className="text-lg">
          {depositValue(vault, gauge) < 1 ? "$ 0" : `$ ${NumberFormatter.format(depositValue(vault, gauge))}`}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">
          {depositValue(vault, gauge) < 1 ? "0" :
            `${NumberFormatter.format(
              !!gauge ?
                Number(gauge.balance.formatted) + Number(vault!.balance.formatted)
                : Number(vault!.balance.formatted)
            )} ${asset.symbol}`}
        </p>
      </td>

      <td className="text-right">
        <WithTooltip
          content={`This Vault deploys its TVL $ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
                      (${NumberFormatter.format(Number(formatBalance(vaultData.totalAssets, asset?.decimals || 0)))} ${asset?.symbol || "TKN"}) 
                      in $ ${NumberFormatter.format(vaultData.strategies.reduce((a, b) => a + b.apyData.apyHist[b.apyData.apyHist.length - 1].tvl, 0))} 
                      TVL of underlying protocols`}
        >
          <p className="text-lg">
            {vaultData.tvl < 1 ? "$ 0" : `$ ${NumberFormatter.format(vaultData.tvl)}`}
          </p>
          <p className="text-sm -mt-0.5 text-customGray200">
            {vaultData.tvl < 1 ? "0" :
              `${NumberFormatter.format(Number(formatBalance(vaultData.totalAssets, asset.decimals)))} ${asset.symbol}`}
          </p>
        </WithTooltip>
      </td>

      <td className="text-right whitespace-nowrap">
        <WithTooltip
          content={`vAPR-${vaultAddress}`}
          tooltipChild={
            <div className="w-40">
              {vaultData.apyData.targetApy !== (vaultData.apyData.baseApy + vaultData.apyData.rewardApy) &&
                <span className="w-full flex justify-between">
                  <p className="font-bold text-lg">Target vAPY:</p>
                  <p className="font-bold text-lg">{NumberFormatter.format(vaultData.apyData.targetApy)} %</p>
                </span>
              }
              <span className="w-full flex justify-between">
                <p className="font-bold text-lg">Total vAPY:</p>
                <p className="font-bold text-lg">{NumberFormatter.format(vaultData.apyData.baseApy + vaultData.apyData.rewardApy)} %</p>
              </span>
              <span className="w-full flex justify-between">
                <p className="">Base vAPY:</p>
                <p className="">{NumberFormatter.format(vaultData.apyData.baseApy)} %</p>
              </span>
              {vaultData.apyData.rewardApy && vaultData.apyData.rewardApy > 0
                ? <span className="w-full flex justify-between">
                  <p className="">Reward vAPY:</p>
                  <p className="">{NumberFormatter.format(vaultData.apyData.rewardApy)} %</p>
                </span>
                : <></>
              }
            </div>
          }
        >
          <p className="text-lg">
            {`${NumberFormatter.format(vaultData.apyData.targetApy)} %`}
          </p>
          <p className="text-sm -mt-0.5 text-customGray200">
            {`${NumberFormatter.format(vaultData.apyData.baseApy + vaultData.apyData.rewardApy)} %`}
          </p>
        </WithTooltip>
      </td>

      <td className="text-right text-lg">
        <WithTooltip
          content={`Earn between ${NumberFormatter.format(gaugeData?.lowerAPR || 0)}-${NumberFormatter.format(gaugeData?.upperAPR || 0)} % oVCX boost APR depending your balance of veVCX. (Based on the current emissions of ${NumberFormatter.format((gaugeData?.annualEmissions || 0) / 5)}-${NumberFormatter.format(gaugeData?.annualEmissions || 0)} oVCX p.Year)`}>
          <p className="text-lg">
            {NumberFormatter.format(gaugeData?.upperAPR || 0)}%
          </p>
          <p className="text-sm -mt-0.5 text-customGray200">
            {NumberFormatter.format(gaugeData?.lowerAPR || 0)}%
          </p>
        </WithTooltip>
      </td>
    </tr >
  );
}
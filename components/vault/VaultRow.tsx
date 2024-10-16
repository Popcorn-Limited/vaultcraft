import { zeroAddress } from "viem";
import { useAtom } from "jotai";
import type { Token, VaultData } from "@/lib/types";
import { tokensAtom } from "@/lib/atoms";
import { cn, formatBalance, NumberFormatter } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import AssetWithName from "@/components/common/AssetWithName";
import { useEffect, useState } from "react";
import LargeCardStat from "@/components/common/LargeCardStat";

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

      <td>
        <LargeCardStat
          id={"wallet"}
          label="Your Wallet"
          value={Number(asset.balance.formattedUSD) < 1 ? "$ 0" : `$ ${asset.balance.formattedUSD}`}
          secondaryValue={Number(asset.balance.formattedUSD) < 1 ? `0 ${asset.symbol}` : `${asset.balance.formatted} ${asset.symbol}`}
          tooltip="Value of deposit assets held in your wallet"
        />
      </td>
      <td>
        <LargeCardStat
          id={"deposits"}
          label="Deposits"
          value={depositValue(vault, gauge) < 1 ? "$ 0" : `$ ${NumberFormatter.format(depositValue(vault, gauge))}`}
          secondaryValue={depositValue(vault, gauge) < 1 ? "0" :
            `${(
              !!gauge ?
                Number(gauge.balance.formatted) + Number(vault!.balance.formatted)
                : vault!.balance.formatted
            )} ${asset.symbol}`}
          tooltip="Value of your vault deposits"
        />
      </td>
      <td>
        <LargeCardStat
          id={"tvl"}
          label="TVL"
          value={`$ ${vaultData.tvl < 1 ? "0" : vaultData.tvl}`}
          secondaryValue={
            asset
              ? `${formatBalance(vaultData.totalAssets, asset.decimals)} ${asset.symbol}`
              : "0 TKN"
          }
          tooltip={`This Vault deploys its TVL $ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
                      (${formatBalance(vaultData.totalAssets, asset?.decimals || 0)} ${asset?.symbol || "TKN"}) 
                      in $ ${NumberFormatter.format(vaultData.strategies.reduce((a, b) => a + b.apyData.apyHist[b.apyData.apyHist.length - 1].tvl, 0))} 
                      TVL of underlying protocols`}
        />
      </td>
      <td>
        <LargeCardStat
          id={"vapy"}
          label="vAPY"
          value={`${NumberFormatter.format(vaultData.apyData.targetApy)} %`}
          secondaryValue={`${NumberFormatter.format(vaultData.apyData.baseApy + vaultData.apyData.rewardApy)} %`}
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
        />
      </td>
      {vaultData.gaugeData?.lowerAPR ?
        (
          <td className="w-1/2 md:w-max">
            <LargeCardStat
              id={"boost"}
              label="Boost APR"
              value={`${NumberFormatter.format(vaultData.gaugeData?.lowerAPR * boostValue(vaultData, gauge))} %`}
              tooltip={`Minimum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of
                     ${NumberFormatter.format((vaultData?.gaugeData.annualEmissions / 5) * boostValue(vaultData, gauge))} oVCX p. year)`}
            />
          </td>
        )
        : <></>
      }
      {vaultData.gaugeData?.rewardApy.apy ?
        (
          <td className="w-1/2 md:w-max">
            <LargeCardStat
              id={"add-rewards"}
              label="Add. Rewards"
              value={`${NumberFormatter.format(vaultData.gaugeData?.rewardApy.apy)} %`}
              tooltipChild={
                <div className="w-42">
                  <p className="font-bold">Annual Rewards</p>
                  {vaultData.gaugeData?.rewardApy.rewards
                    .filter(reward => reward.emissions > 0)
                    .map(reward =>
                      <p key={reward.address}>{NumberFormatter.format(reward.emissions)} {tokens[vaultData.chainId][reward.address].symbol} | ${NumberFormatter.format(reward.emissionsValue)} | {NumberFormatter.format(reward.apy)}%</p>
                    )}
                </div>
              }
            />
          </td>
        )
        : <></>
      }
    </tr >
  );
}
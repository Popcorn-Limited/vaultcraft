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
import AssetWithName from "./AssetWithName";
import { useEffect, useState } from "react";

export default function VaultRow({
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

  useEffect(() => {
    if (vaultData) {
      const asset_ = tokens[chainId][assetAddress];
      const vault_ = tokens[chainId][vaultAddress];
      const gauge_ = gaugeAddress && gaugeAddress !== zeroAddress ? tokens[chainId][gaugeAddress] : undefined

      let depositValue_ = (vault_.balance * vault_.price) / (10 ** vault_.decimals)
      if (gauge_) depositValue_ += (gauge_.balance * gauge_.price) / (10 ** gauge_.decimals)

      setWalletValue((asset_.balance * asset_.price) / (10 ** asset_.decimals))
      setDepositValue(depositValue_)

      setAsset(asset_);
      setVault(vault_);
      setGauge(gauge_);
    }
  }, [vaultData])

  const boost = ((vaultData.gaugeData?.workingBalance! / (gauge?.balance || 0)) * 5) || 1

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
    <tr
      onClick={() => {
        router.push(
          !!query?.ref && isAddress(query.ref as string)
            ? `/vaults/${vaultData.vault}?chainId=${vaultData.chainId}&ref=${query.ref}`
            : `/vaults/${vaultData.vault}?chainId=${vaultData.chainId}`
        );
      }}
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
        <p className="text-sm -mt-0.5 text-customGray200">{walletValue < 1 ? "0" : formatAndRoundNumber(asset.balance, asset.decimals)} {asset.symbol}</p>
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
        <p className="text-lg">
          $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">{formatAndRoundNumber(vaultData.totalAssets, asset.decimals)} {asset.symbol}</p>
      </td>

      <td className="text-right text-lg">{formatTwoDecimals(apy)}%</td>

      <td className="text-right text-lg">{formatTwoDecimals(gaugeData?.lowerAPR || 0)}%</td>

      <td className="text-right text-lg">{formatTwoDecimals(gaugeData?.upperAPR || 0)}%</td>

      <td className="text-right text-lg text-primaryGreen">x{formatTwoDecimals(boost)}</td>
    </tr>
  );
}
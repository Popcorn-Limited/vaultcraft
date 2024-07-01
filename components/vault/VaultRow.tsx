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

export default function VaultRow({
  searchTerm,
  ...vaultData
}: VaultData & {
  searchTerm?: string;
}) {
  const { query, ...router } = useRouter();

  const {
    asset,
    gaugeData,
    gauge,
    tvl,
    apy,
    vault: vaultAddress,
    chainId,
  } = vaultData;

  const maxGaugeApy = gaugeData?.upperAPR || 0;
  const minGaugeApy = gaugeData?.lowerAPR || 0;

  const [tokens] = useAtom(tokensAtom);

  const vault = tokens[chainId]?.[vaultAddress] ?? {};
  const dataAsset = tokens[chainId]?.[asset] ?? {};
  const dataGauge = tokens[chainId]?.[gauge!] ?? {};

  const boost = ((vaultData.gaugeData?.workingBalance! / (dataGauge?.balance || 0)) * 5) || 1

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
          ${" "}{formatAndRoundNumber(dataAsset.balance * dataAsset.price, dataAsset.decimals)}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">{formatAndRoundNumber(dataAsset.balance, dataAsset.decimals)} {dataAsset.symbol}</p>
      </td>

      <td className="text-right">
        <p className="text-lg">
          ${" "}
          {!!gauge ?
            NumberFormatter.format(((dataGauge.balance * dataGauge.price) / 10 ** dataGauge.decimals) + ((vault?.balance! * vault?.price!) / 10 ** vault?.decimals!))
            : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
          }
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">
          {!!gauge ?
            NumberFormatter.format(((dataGauge.balance) / 10 ** dataGauge.decimals) + ((vault?.balance!) / 10 ** vault?.decimals!))
            : formatAndRoundNumber(vault?.balance!, vault?.decimals!)
          } {dataAsset.symbol}
        </p>
      </td>

      <td className="text-right whitespace-nowrap">
        <p className="text-lg">
          $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200">{formatAndRoundNumber(vaultData.totalAssets, dataAsset.decimals)} {dataAsset.symbol}</p>
      </td>

      <td className="text-right text-lg">{formatTwoDecimals(apy)}%</td>

      <td className="text-right text-lg">{formatTwoDecimals(minGaugeApy)}%</td>

      <td className="text-right text-lg">{formatTwoDecimals(maxGaugeApy)}%</td>

      <td className="text-right text-lg text-primaryGreen">x{formatTwoDecimals(boost)}</td>
    </tr>
  );
}
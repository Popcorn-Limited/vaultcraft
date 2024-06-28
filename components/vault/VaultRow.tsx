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
    gauge,
    maxGaugeApy = 0,
    minGaugeApy = 0,
    tvl,
    apy,
    vault: vaultAddress,
    chainId,
  } = vaultData;

  const [tokens] = useAtom(tokensAtom);

  const vault = tokens[chainId]?.[vaultAddress] ?? {};
  const dataAsset = tokens[chainId]?.[asset] ?? {};
  const dataGauge = tokens[chainId]?.[gauge!] ?? {};

  let boost = Math.round(maxGaugeApy / minGaugeApy) || 0;
  if (boost <= 1) boost = 1;

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
          className="[&_h2]:font-normal whitespace-nowrap pl-3 [&_h2]:text-lg"
          vault={vaultData}
        />
      </td>

      <td className="text-right">
        <p className="text-lg">
          {formatAndRoundNumber(dataAsset.balance, dataAsset.decimals)}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200"># TKN</p>
      </td>

      <td className="text-right">
        <p className="text-lg">
          ${" "}
          {dataGauge
            ? NumberFormatter.format(
                (dataGauge.balance * dataGauge.price) /
                  10 ** dataGauge.decimals +
                  (vault?.balance! * vault?.price!) / 10 ** vault?.decimals!
              )
            : formatAndRoundNumber(
                vault?.balance! * vault?.price!,
                vault?.decimals!
              )}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200"># TKN</p>
      </td>

      <td className="text-right whitespace-nowrap">
        <p className="text-lg">
          $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
        </p>
        <p className="text-sm -mt-0.5 text-customGray200"># TKN</p>
      </td>

      <td className="text-right text-lg">{formatTwoDecimals(apy)}%</td>

      <td className="text-right text-lg">{formatTwoDecimals(minGaugeApy)}%</td>

      <td className="text-right text-lg">{formatTwoDecimals(maxGaugeApy)}%</td>

      <td className="text-right text-lg text-primaryGreen">x{boost}</td>
    </tr>
  );
}

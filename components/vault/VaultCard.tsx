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
        className="pl-2 [&_h2]:text-lg flex-nowrap [&_.flex-wrap]:flex-nowrap"
        vault={vaultData}
      />

      <div className="grid mt-6 gap-4 grid-cols-3">
        <Content title="Your Wallet">
          <p className="text-2xl">
            {formatAndRoundNumber(dataAsset.balance, dataAsset.decimals)}
          </p>
          <p className="text-sm -mt-0.5 text-customGray200"># TKN</p>
        </Content>

        <Content title="Your Deposit">
          <p className="text-2xl">
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
        </Content>

        <Content title="TVL">
          <p className="text-2xl">
            $ {tvl < 1 ? "0" : NumberFormatter.format(tvl)}
          </p>
          <p className="text-sm -mt-0.5 text-customGray200"># TKN</p>
        </Content>

        <Content title="vAPR">
          <p className="text-2xl">{formatTwoDecimals(apy)}%</p>
        </Content>

        <Content className="col-span-2" title="Min Boost APY">
          <p className="text-2xl">{formatTwoDecimals(minGaugeApy)}%</p>
        </Content>

        <Content title="Boost">
          <p className="text-2xl text-primaryGreen">x{boost}</p>
        </Content>

        <Content className="col-span-2" title="Max Boost APY">
          <p className="text-2xl">{formatTwoDecimals(maxGaugeApy)}%</p>
        </Content>
      </div>
    </div>
  );
}

function Content({
  title,
  children,
  className,
}: PropsWithChildren<{
  title: string;
  className?: string;
}>) {
  return (
    <div className={cn("text-white", className)}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

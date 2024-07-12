import { Token, VaultData } from "@/lib/types";
import LargeCardStat from "@/components/common/LargeCardStat";
import AssetWithName from "@/components/common/AssetWithName";
import {
  NumberFormatter,
  formatAndRoundNumber,
  formatTwoDecimals,
} from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import VaultClaimSection from "@/components/vault/VaultClaimSection";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";

export default function VaultHero({
  vaultData,
  asset,
  vault,
  gauge,
  showClaim = false,
}: {
  vaultData: VaultData;
  asset?: Token;
  vault?: Token;
  gauge?: Token;
  showClaim?: boolean;
}): JSX.Element {
  const [tokens] = useAtom(tokensAtom);
  const boost = ((vaultData.gaugeData?.workingBalance! / (gauge?.balance || 0)) * 5) || 1

  return (
    <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-0 ">
      <div className="w-full mb-8">
        <AssetWithName vault={vaultData} size={3} />
      </div>

      <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-6 md:pr-10  gap-4 md:gap-10">
          <div>
            <LargeCardStat
              id={"wallet"}
              label="Your Wallet"
              value={
                asset
                  ? `$ ${NumberFormatter.format(
                    (asset.balance * asset.price) / 10 ** asset.decimals
                  )}`
                  : "$ 0"
              }
              secondaryValue={
                asset
                  ? `$ ${NumberFormatter.format(
                    asset.balance / 10 ** asset.decimals
                  )} ${asset.symbol}`
                  : "0 TKN"
              }
              tooltip="Value of deposit assets held in your wallet"
            />
          </div>
          <div>
            <LargeCardStat
              id={"deposits"}
              label="Deposits"
              value={vaultData ?
                `$ ${!!gauge ?
                  NumberFormatter.format(((gauge.balance * gauge.price) / 10 ** gauge?.decimals!) + ((vault?.balance! * vault?.price!) / 10 ** vault?.decimals!))
                  : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
                }` : "0"}
              secondaryValue={`${!!gauge ?
                NumberFormatter.format((gauge.balance * vaultData.assetsPerShare / (10 ** asset?.decimals!)) + (vault?.balance! * vaultData.assetsPerShare / (10 ** asset?.decimals!)))
                : formatAndRoundNumber(vault?.balance! * vaultData.assetsPerShare, asset?.decimals!)
                } ${asset?.symbol!}`}
              tooltip="Value of your vault deposits"
            />
          </div>
          <div>
            <LargeCardStat
              id={"tvl"}
              label="TVL"
              value={`$ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)
                }`}
              secondaryValue={
                asset
                  ? `${NumberFormatter.format(
                    vaultData.totalAssets / 10 ** asset.decimals
                  )} ${asset?.symbol!}`
                  : "0 TKN"
              }
              tooltip={`This Vault deploys its TVL $ ${vaultData.tvl < 1 ? "0" : formatTwoDecimals(vaultData.tvl)}
                      (${formatAndRoundNumber(vaultData.totalAssets, asset?.decimals || 0)} ${asset?.symbol || "TKN"}) 
                      in $ ${formatTwoDecimals(vaultData.strategies.reduce((a, b) => a + b.apyHist[b.apyHist.length - 1].tvl, 0))} 
                      TVL of underlying protocols`}
            />
          </div>
          <div>
            <LargeCardStat
              id={"vapy"}
              label="vAPY"
              value={`${NumberFormatter.format(
                roundToTwoDecimalPlaces(vaultData.apy)
              )} %`}
              tooltip="Current variable APY of the vault"
            />
          </div>
          {vaultData.gaugeData?.lowerAPR ?
            (
              <div className="w-1/2 md:w-max">
                <LargeCardStat
                  id={"min-boost"}
                  label="Boost APR"
                  value={`${formatTwoDecimals(vaultData.gaugeData?.lowerAPR || 0 * boost)} %`}
                  tooltip={`Minimum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of
                     ${formatTwoDecimals((vaultData?.gaugeData.annualEmissions / 5) * boost)} oVCX p. year)`}
                />
              </div>
            )
            : <></>
          }
          {vaultData.gaugeData?.rewardApy.apy ?
            (
              <div className="w-1/2 md:w-max">
                <LargeCardStat
                  id={"add-rewards"}
                  label="Add. Rewards"
                  value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.gaugeData?.rewardApy.apy))} %`}
                  tooltipChild={
                    <div className="w-42">
                      <p className="font-bold">Annual Rewards</p>
                      {vaultData.gaugeData?.rewardApy.rewards
                        .filter(reward => reward.emissions > 0)
                        .map(reward =>
                          <p key={reward.address}>{NumberFormatter.format(reward.emissions)} {tokens[vaultData.chainId][reward.address].symbol} | ${NumberFormatter.format(reward.emissionsValue)} | {NumberFormatter.format(roundToTwoDecimalPlaces(reward.apy))}%</p>
                        )}
                    </div>
                  }
                />
              </div>
            )
            : <></>
          }
        </div>

        {showClaim && <VaultClaimSection vaultData={vaultData} />}
      </div>
    </section>
  );
}

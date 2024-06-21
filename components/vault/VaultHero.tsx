import { Token, VaultData } from "@/lib/types";
import LargeCardStat from "@/components/common/LargeCardStat";
import AssetWithName from "@/components/vault/AssetWithName";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import VaultClaimSection from "@/components/vault/VaultClaimSection";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";

export default function VaultHero({ vaultData, asset, vault, gauge, showClaim = false }: { vaultData: VaultData, asset?: Token, vault?: Token, gauge?: Token, showClaim?: boolean }): JSX.Element {
  const [tokens] = useAtom(tokensAtom);
  return (
    <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-8 ">

      <div className="w-full mb-8">
        <AssetWithName vault={vaultData} size={3} />
      </div>

      <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
        <div className="flex flex-wrap md:flex-row md:pr-10 md:w-fit gap-y-4 md:gap-10">
          <div className="w-1/2 md:w-max">
            <LargeCardStat
              id={"wallet"}
              label="Your Wallet"
              value={asset ? `$ ${NumberFormatter.format(asset.balance * asset.price / (10 ** asset.decimals))}` : "$ 0"}
              secondaryValue={asset ? `$ ${NumberFormatter.format(asset.balance / (10 ** asset.decimals))} ${asset.symbol}` : "0 TKN"}
              tooltip=""
            />
          </div>
          <div className="w-1/2 md:w-max">
            <LargeCardStat
              id={"deposits"}
              label="Deposits"
              value={vaultData ?
                `${!!gauge ?
                  NumberFormatter.format(((gauge.balance * gauge.price) / 10 ** gauge.decimals) + ((vault?.balance! * vault?.price!) / 10 ** vault?.decimals!))
                  : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
                }` : "0"}
              secondaryValue={`${!!gauge ?
                NumberFormatter.format(((gauge.balance) / 10 ** gauge.decimals) + ((vault?.balance!) / 10 ** vault?.decimals!))
                : formatAndRoundNumber(vault?.balance!, vault?.decimals!)
                } ${asset?.symbol!}`}
              tooltip=""
            />
          </div>
          <div className="w-1/2 md:w-max">
            <LargeCardStat
              id={"tvl"}
              label="TVL"
              value={`$ ${vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}`}
              secondaryValue={asset ? `${NumberFormatter.format(vaultData.totalAssets / (10 ** asset.decimals))} ${asset?.symbol!}` : "0 TKN"}
              tooltip=""
            />
          </div>
          <div className="w-1/2 md:w-max">
            <LargeCardStat
              id={"vapy"}
              label="vAPY"
              value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))} %`}
              tooltip=""
            />
          </div>
          {vaultData.gaugeData?.lowerAPR ?
            (
              <div className="w-1/2 md:w-max">
                <LargeCardStat
                  id={"min-rewards"}
                  label="Min Rewards"
                  value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.gaugeData?.lowerAPR))} %`}
                  tooltip=""
                />
              </div>
            )
            : <></>
          }
          {vaultData.gaugeData?.upperAPR ?
            (
              <div className="w-1/2 md:w-max">
                <LargeCardStat
                  id={"max-rewards"}
                  label="Max Rewards"
                  value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.gaugeData?.upperAPR))} %`}
                  tooltip={`${vaultData.gaugeData.annualEmissions}`}
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
                  tooltip=""
                />
              </div>
            )
            : <></>
          }
        </div>

        {
          showClaim && <VaultClaimSection vaultData={vaultData} />
        }

      </div>
    </section>
  )
}
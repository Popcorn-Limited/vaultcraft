import { Token, VaultData } from "@/lib/types";
import LargeCardStat from "@/components/common/LargeCardStat";
import AssetWithName from "@/components/common/AssetWithName";
import {
  NumberFormatter,
  formatAndRoundNumber,
  formatNumber,
  formatTwoDecimals,
} from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import VaultClaimSection from "@/components/vault/VaultClaimSection";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { IconByProtocol } from "../common/ProtocolIcon";


function walletValue(asset: Token): number {
  return (asset.balance * asset.price) / (10 ** asset.decimals)
}

function depositValue(vault: Token, gauge?: Token): number {
  let result = (vault.balance * vault.price) / (10 ** vault.decimals)
  if (gauge) result += (gauge.balance * gauge.price) / (10 ** gauge.decimals)
  return result
}

function boostValue(vaultData: VaultData, gauge?: Token): number {
  if (!vaultData || !gauge) return 1
  let boost = (vaultData.gaugeData!.workingBalance / (gauge.balance || 0)) * 5;
  return boost > 1 ? boost : 1
}

export default function VaultHero({
  vaultData,
  asset,
  vault,
  gauge,
  showClaim = false,
  isManaged = false
}: {
  vaultData: VaultData;
  asset: Token;
  vault: Token;
  gauge?: Token;
  showClaim?: boolean;
  isManaged?: boolean
}): JSX.Element {
  const [tokens] = useAtom(tokensAtom);

  return (
    <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-0 ">
      <div className="w-full mb-12 flex flex-row items-center">
        <AssetWithName vault={vaultData} size={3} />
        <div className="flex flex-row items-center space-x-4">
          {vaultData.points.map(point =>
            <div
              key={point.provider}
              className="flex flex-col justify-center items-center"
            >
              <img
                src={
                  point.provider
                    ? IconByProtocol[point.provider]
                    : "/images/tokens/vcx.svg"
                }
                className={`w-8 h-8 rounded-full border border-gray-400`}
              />
              <p className="text-white text-lg mt-2" >{point.multiplier}x</p>
            </div>
          )}
        </div>
      </div>


      <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-6 md:pr-10  gap-4 md:gap-10">
          <div>
            <LargeCardStat
              id={"wallet"}
              label="Your Wallet"
              value={walletValue(asset) < 0.1 ? "$ 0" : `$ ${formatTwoDecimals(walletValue(asset))}`}
              secondaryValue={walletValue(asset) < 0.1 ? `0 ${asset.symbol}` : `${formatTwoDecimals(asset.balance / 10 ** asset.decimals)} ${asset.symbol}`}
              tooltip="Value of deposit assets held in your wallet"
            />
          </div>
          <div>
            <LargeCardStat
              id={"deposits"}
              label="Deposits"
              value={depositValue(vault, gauge) < 0.1 ? "$ 0" : `$ ${NumberFormatter.format(depositValue(vault, gauge))}`}
              secondaryValue={depositValue(vault, gauge) < 0.1 ? "$ 0" : `${!!gauge ?
                NumberFormatter.format(((gauge.balance) / 10 ** gauge.decimals) + ((vault?.balance!) / 10 ** vault?.decimals!))
                : formatAndRoundNumber(vault?.balance!, vault?.decimals!)} ${asset.symbol}`}
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
                      in $ ${formatTwoDecimals(vaultData.strategies.reduce((a, b) => a + b.apyData.apyHist[b.apyData.apyHist.length - 1].tvl, 0))} 
                      TVL of underlying protocols`}
            />
          </div>
          {isManaged && vaultData.strategies.filter(strategy => ["AnyToAnyV1", "AnyToAnyCompounderV1"].includes(strategy.metadata.type)).length > 0 &&
            <div>
              <LargeCardStat
                id={"utilization"}
                label="Utilization"
                value={`${formatTwoDecimals(100 - (vaultData.liquid / vaultData.totalAssets) * 100)} %`}
                secondaryValue={`${formatNumber(vaultData.liquid / (10 ** asset?.decimals))} ${asset?.symbol}`}
                tooltip={`This Vault has deployed ${formatTwoDecimals(100 - (vaultData.liquid / vaultData.totalAssets) * 100)} % of assets in managed strategies. ${formatNumber(vaultData.liquid / (10 ** asset?.decimals))} ${asset?.symbol} are instantly available for withdrawal. Additional funds need to be freed up by the vault manager.`}
              />
            </div>
          }
          {vaultData.strategies.filter(strategy => strategy.metadata.type === "LeverageV1").length > 0 &&
            <div>
              <LargeCardStat
                id={"leverage"}
                label="Leverage"
                value={vaultData.metadata.vaultName?.includes("10X") ? "10X" : "5X"}
                secondaryValue={`${formatTwoDecimals(vaultData.strategies.find(strategy => strategy.metadata.type === "LeverageV1")?.leverage || 0)}X`}
                tooltip={`This strategy levers its assets to earn additional yield. It targets a leverage ratio of ${vaultData.metadata.vaultName?.includes("10X") ? "10X" : "5X"}. The actual rate currently is ${formatTwoDecimals(vaultData.strategies.find(strategy => strategy.metadata.type === "LeverageV1")?.leverage || 0)}X. Leverage is adjusted every 30min but can be adjusted manually.`}
              />
            </div>
          }
          <div>
            <LargeCardStat
              id={"vapy"}
              label="vAPY"
              value={`${formatTwoDecimals(vaultData.apyData.targetApy)} %`}
              secondaryValue={`${formatTwoDecimals(vaultData.apyData.baseApy + vaultData.apyData.rewardApy)} %`}
              tooltipChild={
                <div className="w-40">
                  {vaultData.apyData.targetApy !== (vaultData.apyData.baseApy + vaultData.apyData.rewardApy) &&
                    <span className="w-full flex justify-between">
                      <p className="font-bold text-lg">Target vAPY:</p>
                      <p className="font-bold text-lg">{formatTwoDecimals(vaultData.apyData.targetApy)} %</p>
                    </span>
                  }
                  <span className="w-full flex justify-between">
                    <p className="font-bold text-lg">Total vAPY:</p>
                    <p className="font-bold text-lg">{formatTwoDecimals(vaultData.apyData.baseApy + vaultData.apyData.rewardApy)} %</p>
                  </span>
                  <span className="w-full flex justify-between">
                    <p className="">Base vAPY:</p>
                    <p className="">{formatTwoDecimals(vaultData.apyData.baseApy)} %</p>
                  </span>
                  {vaultData.apyData.rewardApy && vaultData.apyData.rewardApy > 0
                    ? <span className="w-full flex justify-between">
                      <p className="">Reward vAPY:</p>
                      <p className="">{formatTwoDecimals(vaultData.apyData.rewardApy)} %</p>
                    </span>
                    : <></>
                  }
                </div>
              }
            />
          </div>
          {vaultData.gaugeData?.lowerAPR ?
            (
              <div className="w-1/2 md:w-max">
                <LargeCardStat
                  id={"boost"}
                  label="Boost APR"
                  value={`${formatTwoDecimals(vaultData.gaugeData?.lowerAPR * boostValue(vaultData, gauge))} %`}
                  tooltip={`Minimum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of
                     ${formatTwoDecimals((vaultData?.gaugeData.annualEmissions / 5) * boostValue(vaultData, gauge))} oVCX p. year)`}
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

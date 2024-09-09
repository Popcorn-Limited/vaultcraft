import { strategiesAtom, tokensAtom } from "@/lib/atoms"
import { ChainById } from "@/lib/utils/connectors"
import { useAtom } from "jotai"

export default function AssetTokenOracleAlert({ chainId, assetOracleData }: { chainId: number, assetOracleData: any }) {
  const [strategies] = useAtom(strategiesAtom)
  const [tokens] = useAtom(tokensAtom)

  const updateFrequency = 3600000 // 60 minutes

  if (
    Object.keys(strategies).length === 0 ||
    Object.keys(strategies).length === 0 ||
    !assetOracleData ||
    assetOracleData?.length === 0
  ) return <></>
  return assetOracleData
    .filter((log: any) =>
      !!Object.values(strategies[chainId])
        .filter(strategy => strategy.yieldToken)
        .find(strategy =>
          (strategy.yieldToken === log.log.args.quote && strategy.asset === log.log.args.base)
          || (strategy.asset === log.log.args.quote && strategy.yieldToken === log.log.args.base))
    )
    .map((log: any) =>
      <>
        {/* Check that the update isnt longer than 60min ago */}
        {((Number(log.lastUpdate) * 1000) + updateFrequency) < Number(new Date()) &&
          <div className="w-1/3 p-4">
            <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
              <p className="text-secondaryYellow text-lg">
                Stale Asset Oracle: {ChainById[chainId].name} {tokens[chainId][log.log.args.base].symbol}-{tokens[chainId][log.log.args.quote].symbol}
              </p>
              <p className="text-secondaryYellow text-sm">
                Oracle has been stale. Last update occured {new Date(Number(log.lastUpdate) * 1000).toLocaleString()}
              </p>
            </div>
          </div>
        }
      </>
    )
}
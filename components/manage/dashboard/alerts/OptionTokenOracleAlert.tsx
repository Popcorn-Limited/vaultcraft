import { ChainById } from "@/lib/utils/connectors"

export default function OptionTokenOracleAlert({ chainId, vcxData }: { chainId: number, vcxData: any }) {
  const lastUpdate = Number(vcxData.lastUpdate) * 1000
  const updateFrequency = 3600000 // 60 minutes
  return (
    <>
      {/* Check that the price isnt lower/equal minPrice */}
      {vcxData.strikePrice <= vcxData.minPrice &&
        <div className="w-1/3 p-4">
          <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-red-500 text-lg">MinPrice: {ChainById[chainId].name}</p>
            <p className="text-red-500 text-sm">
              {`Adjust the minPrice of the OVCX Oracle. The current strike price is lower or equal to the min price. (${vcxData.strikePrice} <= ${vcxData.minPrice})`}
            </p>
          </div>
        </div>
      }

      {/* Check that the update isnt longer than 60min ago */}
      {(lastUpdate + updateFrequency) < Number(new Date()) &&
        <div className="w-1/3 p-4">
          <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
            <p className="text-secondaryYellow text-lg">Stale oVCX Oracle: {ChainById[chainId].name}</p>
            <p className="text-secondaryYellow text-sm">
              Oracle has been stale. Last update occured {new Date(lastUpdate).toLocaleString()}
            </p>
          </div>
        </div>
      }
    </>
  )
}

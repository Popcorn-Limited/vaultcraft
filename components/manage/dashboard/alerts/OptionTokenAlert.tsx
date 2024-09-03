import { thisPeriodTimestamp } from "@/lib/gauges/utils"
import { ChainById } from "@/lib/utils/connectors"
import { formatNumber } from "@/lib/utils/formatBigNumber"

export default function OptionTokenAlert({ chainId, vcxData }: { chainId: number, vcxData: any }) {
  const lastBridge = Number(vcxData.lastBridge) * 1000
  const lastEpochEnd = (thisPeriodTimestamp() * 1000) - (604800 * 1000)
  const minExercisableVCX = 100_000e18
  return (
    <>
      {/* Check that oVCX have been bridged after epoch end */}
      {chainId !== 1 && lastBridge <= lastEpochEnd &&
        <div className="w-1/3 p-4">
          <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
            <p className="text-secondaryYellow text-lg">OVCX Bridge: {ChainById[chainId].name}</p>
            <p className="text-secondaryYellow text-sm">
              OVCX havent been bridged recently. Last bridge occured {new Date(lastBridge).toLocaleString()} | {new Date(lastEpochEnd).toLocaleString()}
            </p>
          </div>
        </div>
      }

      {/* Check that Exercise contract is funded */}
      {vcxData.exercisableVCX < 1000e18 ?
        <div className="w-1/3 p-4">
          <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-red-500 text-lg">Exercisable oVCX: {ChainById[chainId].name}</p>
            <p className="text-red-500 text-sm">
              {`Fund the exercise contract. VCX balance of the exercise contract is running low (${formatNumber(vcxData.exercisableVCX / 1e18)} VCX < 1000 VCX)`}
            </p>
          </div>
        </div>
        : <>
          {vcxData.exercisableVCX < minExercisableVCX &&
            <div className="w-1/3 p-4">
              <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
                <p className="text-secondaryYellow text-lg">Exercisable oVCX: {ChainById[chainId].name}</p>
                <p className="text-secondaryYellow text-sm">
                  {`Fund the exercise contract. VCX balance of the exercise contract is running low (${formatNumber(vcxData.exercisableVCX / 1e18)} VCX < ${formatNumber(minExercisableVCX / 1e18)} VCX)`}
                </p>
              </div>
            </div>
          }
        </>
      }
    </>
  )
}
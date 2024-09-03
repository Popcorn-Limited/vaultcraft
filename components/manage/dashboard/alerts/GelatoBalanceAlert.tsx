import { formatNumber } from "@/lib/utils/formatBigNumber";

export default function GelatoBalanceAlert({ automationData }: { automationData: any }) {
  return (
    <>
      {/* Check the 1Balance */}
      {automationData.gelatoBalance < 30 ?
        <div className="w-1/3 p-4">
          <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-red-500 text-lg">Gelato Balance</p>
            <p className="text-red-500 text-sm">
              {`Fund the gelato balance. Gelato balance is running low ($${formatNumber(automationData.gelatoBalance)} < $30)`}
            </p>
          </div>
        </div>
        : <>
          {automationData.gelatoBalance < 100 ?
            <div className="w-1/3 p-4">
              <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
                <p className="text-secondaryYellow text-lg">Gelato Balance</p>
                <p className="text-secondaryYellow text-sm">
                  {`Fund the gelato balance. Gelato balance is running low ($${formatNumber(automationData.gelatoBalance)} < $100)`}
                </p>
              </div>
            </div>
            : <></>
          }
        </>
      }
    </>
  )
}
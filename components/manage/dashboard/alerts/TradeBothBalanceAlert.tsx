import { NumberFormatter } from "@/lib/utils/helpers";
import { parseEther } from "viem";

export default function TradeBothBalanceAlert({ automationData }: { automationData: any }) {
  return (
    <>
      {/* Check the eth balance */}
      {automationData.tradebot.eth < parseEther("0.01") ?
        <div className="w-1/3 p-4">
          <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-red-500 text-lg">Trade Bot Gas Balance</p>
            <p className="text-red-500 text-sm">
              {`Fund the trade bot with ETH. Trade bots gas balance is running low (${NumberFormatter.format(Number(automationData.tradebot.eth) / 1e18)} ETH < 0.01 ETH)`}
            </p>
          </div>
        </div>
        : <>
          {automationData.tradebot.eth < parseEther("0.1") ?
            <div className="w-1/3 p-4">
              <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
                <p className="text-secondaryYellow text-lg">Trade Bot Gas Balance</p>
                <p className="text-secondaryYellow text-sm">
                  {`Fund the trade bot with ETH. Trade bots gas balance is running low (${NumberFormatter.format(Number(automationData.tradebot.eth) / 1e18)} ETH < 0.1 ETH)`}
                </p>
              </div>
            </div>
            : <></>
          }
        </>
      }

      {/* Check the weth balance */}
      {automationData.tradebot.weth < parseEther("0.1") ?
        <div className="w-1/3 p-4">
          <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-red-500 text-lg">Trade Bot Buy Balance</p>
            <p className="text-red-500 text-sm">
              {`Fund the trade bot with WETH. Trade bots buy balance is running low (${NumberFormatter.format(Number(automationData.tradebot.weth) / 1e18)} WETH < 0.1 WETH)`}
            </p>
          </div>
        </div>
        : <>
          {automationData.tradebot.weth < parseEther("1") ?
            <div className="w-1/3 p-4">
              <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
                <p className="text-secondaryYellow text-lg">Trade Both Buy Balance</p>
                <p className="text-secondaryYellow text-sm">
                  {`Fund the trade bot with WETH. Trade bots buy balance is running low (${NumberFormatter.format(Number(automationData.tradebot.weth) / 1e18)} WETH < 1 WETH)`}
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
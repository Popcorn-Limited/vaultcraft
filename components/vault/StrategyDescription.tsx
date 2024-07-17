import { IconByProtocol } from "@/components/common/ProtocolIcon";
import CardStat from "@/components/common/CardStat";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { Strategy, Token } from "@/lib/types";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";

export default function StrategyDescription({ strategy, asset, i, stratLen }: { strategy: Strategy, asset: Token, i: number, stratLen: number }) {
  return <div
    className={`py-4 ${i + 1 < stratLen ? "border-b border-customGray500" : ""}`}
  >
    <div className="w-max flex flex-row items-center mb-2">
      <img
        src={IconByProtocol[strategy.metadata.protocol] || "/images/tokens/vcx.svg"}
        className={`h-7 w-7 mr-2 mb-1.5 rounded-full border border-white`}
      />
      <h2 className="text-2xl font-bold text-white">
        {strategy.metadata.protocol} - {strategy.metadata.name}
      </h2>
    </div>

    <p className='text-white'>
      {strategy.metadata.description && strategy.metadata.description?.split("-LINK- ").length > 1 ?
        <>{strategy.metadata.description?.split("-LINK- ")[0]}{" "}
          <a href={strategy.metadata.description?.split("-LINK- ")[1]} target="_blank" className="text-secondaryBlue">here</a></>
        : <>{strategy.metadata.description}</>
      } { }
    </p>
    {strategy.apySource === "defillama" &&
      <p className='text-white'>
        View on <a href={`https://defillama.com/yields/pool/${strategy.apyId}`} target="_blank" className="text-secondaryBlue">Defillama</a>
      </p>
    }
    <div className='flex flex-row items-center'>
      <p className="text-white">{strategy.address.slice(0, 6)}...{strategy.address.slice(-4)}</p>
      <CopyToClipboard text={strategy.address} onCopy={() => showSuccessToast("Strategy address copied!")}>
        <Square2StackIcon className="w-4 h-4 ml-1 mb-0.5 cursor-pointer text-white hover:text-primaryYellow" />
      </CopyToClipboard>
    </div>
    <div className="mt-2 md:flex md:flex-row md:items-center">
      <CardStat
        id={`${strategy.resolver}-${i}-allocation`}
        label="Allocation"
        tooltip="Total value of all assets deposited into this strategy"
      >
        <span className="md:flex md:flex-row md:items-center w-full md:space-x-2">
          <p className="text-white text-xl leading-6 md:leading-8 text-end md:text-start">
            $ {formatAndRoundNumber(strategy.allocation * asset?.price!, asset?.decimals!)}
          </p>
          <p className="hidden md:block text-white">|</p>
          <p className="text-white text-xl leading-6 md:leading-8 text-end md:text-start">
            {NumberFormatter.format(roundToTwoDecimalPlaces(strategy.allocationPerc * 100))} %
          </p>
        </span>
      </CardStat>
      <CardStat
        id={`${strategy.resolver}-${i}-apy`}
        label="APY"
        value={`${NumberFormatter.format(roundToTwoDecimalPlaces(strategy.apy))} %`}
        tooltip="Current variable apy of the strategy"
      />
    </div>
  </div>
}
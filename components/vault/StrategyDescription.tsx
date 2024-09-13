import { IconByProtocol } from "@/components/common/ProtocolIcon";
import CardStat from "@/components/common/CardStat";
import { NumberFormatter, formatAndRoundNumber, formatNumber, formatTwoDecimals } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { Strategy, Token } from "@/lib/types";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import SecondaryActionButton from "../button/SecondaryActionButton";
import { adjustLeverage } from "@/lib/vault/management/strategyInteractions";
import { getPublicClient } from "@wagmi/core";
import MainButtonGroup from "../common/MainButtonGroup";
import SecondaryButtonGroup from "../common/SecondaryButtonGroup";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

interface StrategyDescriptionProps {
  strategy: Strategy;
  asset: Token;
  chainId: number;
  i: number;
  stratLen: number;
}

export default function StrategyDescription({ strategy, asset, chainId, i, stratLen }: StrategyDescriptionProps) {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const [tokens] = useAtom(tokensAtom);

  return Object.keys(tokens).length > 0 ? (
    <div
      className={`py-4 ${i + 1 < stratLen ? "border-b border-customGray500" : ""}`}
    >
      <div className="w-max flex flex-row items-center mb-2">
        <img
          src={IconByProtocol[strategy.metadata.protocol] || "/images/tokens/vcx.svg"}
          className={`h-7 w-7 mr-2 mb-1.5 rounded-full border border-white`}
        />
        <h2 className="text-2xl font-bold text-white">
          {strategy.metadata.protocol} - {strategy.metadata.name} ({tokens[chainId][strategy.yieldToken ? strategy.yieldToken : strategy.asset].symbol})
        </h2>
      </div>

      <p className='text-white'>
        {strategy.metadata.description && strategy.metadata.description?.split("-LINK- ").length > 1 ?
          <>{strategy.metadata.description?.split("-LINK- ")[0]}{" "}
            <a href={strategy.metadata.description?.split("-LINK- ")[1]} target="_blank" className="text-secondaryBlue">here</a></>
          : <>{strategy.metadata.description}</>
        } { }
      </p>
      {strategy.apyData.apySource === "defillama" &&
        <p className='text-white'>
          View on <a href={`https://defillama.com/yields/pool/${strategy.apyData.apyId}`} target="_blank" className="text-secondaryBlue">Defillama</a>
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
          value={`${NumberFormatter.format(roundToTwoDecimalPlaces(strategy.apyData.totalApy))} %`}
          tooltip="Current variable apy of the strategy"
        />
        {["AnyToAnyV1", "AnyToAnyCompounderV1"].includes(strategy.metadata.type) &&
          <CardStat
            id={`${strategy.resolver}-${i}-utilization`}
            label="Utilization"
            value={`${formatTwoDecimals(100 - (strategy.idle / strategy.totalAssets) * 100)} %`}
            secondaryValue={`${formatNumber(strategy.idle / (10 ** asset?.decimals))} ${asset?.symbol}`}
            tooltip={`This Vault has deployed ${formatTwoDecimals(100 - (strategy.idle / strategy.totalAssets) * 100)} % of assets in managed strategies. ${formatNumber(strategy.idle / (10 ** asset?.decimals))} ${asset?.symbol} are instantly available for withdrawal. Additional funds need to be freed up by the vault manager.`}
          />
        }
        {strategy.metadata.type === "LeverageV1" &&
          <CardStat
            id={`${strategy.resolver}-${i}-leverage`}
            label="Leverage"
            value={`${formatTwoDecimals(strategy.leverage || 0)}X`}
            tooltip={`This strategy levers its assets ${formatTwoDecimals(strategy.leverage || 0)}X to earn additional yield.`}
          />
        }
      </div>
      {strategy.metadata.type === "LeverageV1" &&
        <div className="w-60 mt-2">
          <SecondaryButtonGroup
            label="Adjust Leverage"
            mainAction={() => adjustLeverage(
              {
                account: account!,
                address: strategy.address,
                clients: {
                  publicClient: publicClient!,
                  walletClient: walletClient!
                }
              }
            )}
            chainId={chainId}
            disabled={false}
          />
        </div>
      }
    </div>
  )
    : <></>
}
import { Strategy, Token } from "@/lib/types";
import { IconByProtocol } from "@/components/common/ProtocolIcon";
import CopyAddress from "@/components/common/CopyAddress";

export default function StrategyName({ strategy, asset, yieldToken }: { strategy: Strategy, asset: Token, yieldToken?: Token }): JSX.Element {
  return (
    <>
      <div className="w-max flex flex-row items-center mb-2">
        <img
          src={IconByProtocol[strategy.metadata.protocol] || "/images/tokens/vcx.svg"}
          className={`h-5 w-5 mr-2 mb-1.5 rounded-full border border-white`}
        />
        <h2 className="text-xl font-bold text-white">
          {strategy.metadata.protocol} - {strategy.metadata.name} ({yieldToken ? yieldToken.symbol : asset.symbol})
        </h2>
      </div>
      <div className="text-gray-500 w-40">
        <CopyAddress address={strategy.address} label={`${strategy.metadata.protocol} - ${strategy.metadata.name}`} />
      </div>
    </>
  )
}
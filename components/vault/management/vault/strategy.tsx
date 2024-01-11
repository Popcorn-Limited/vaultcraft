import MainActionButton from "@/components/button/MainActionButton";
import { VaultData } from "@/lib/types";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function VaultStrategyConfiguration({ vaultData, settings }: { vaultData: VaultData, settings: any }): JSX.Element {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <div>
          <h2 className="text-xl">Current Strategy</h2>
          <p>Name: {vaultData.metadata.optionalMetadata.protocol.name}</p>
          <p>Description: {vaultData.metadata.optionalMetadata.protocol.description}</p>
          <p>Apy: {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.totalApy))} %`}</p>
          <p>Propose new Strategy in: 3d</p>
          <div className="w-40">
            <MainActionButton label="Propose new Strategy" />
          </div>
        </div>
        <div>
          <ArrowRightIcon className="text-white w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl">Proposed Strategy</h2>
          <p>Name: {vaultData.metadata.optionalMetadata.protocol.name}</p>
          <p>Description: {vaultData.metadata.optionalMetadata.protocol.description}</p>
          <p>Apy: {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.totalApy))} %`}</p>
          <p>Accept in: 0s</p>
          <div className="w-40">
            <MainActionButton label="Accept new Strategy" />
          </div>
        </div>
      </div>
    </div>
  )
}
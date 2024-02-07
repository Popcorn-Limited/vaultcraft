import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { VaultData, VaultLabel } from "@/lib/types";
import ProtocolIcon from "@/components/common/ProtocolIcon";
import ResponsiveTooltip from "../common/Tooltip";

const vaultLabelColor: { [key: string]: string } = {
  Experimental: "bg-yellow-500",
  Deprecated: "bg-red-500"
}

const vaultLabelTooltip: { [key: string]: string } = {
  Experimental: "Unaudited strategy in testing stage",
  Deprecated: "This strategy got deprecated. Only withdrawals are open"
}


const iconSize: { [key: number]: string } = {
  1: "w-8 h-8",
  2: "w-10 h-10",
  3: "w-12 h-12"
}

const textSize: { [key: number]: string } = {
  1: "text-base",
  2: "text-lg",
  3: "text-xl"
}

const vaultTextSize: { [key: number]: string } = {
  1: "text-2xl",
  2: "text-3xl",
  3: "text-4xl"
}

function VaultLabelPill({ label, id, size = 1 }: { label: VaultLabel, id: string, size?: number }): JSX.Element {
  const tooltipId = `${id}-${String(label)}`
  return (
    <>
      <div className="flex align-middle justify-between w-full md:block md:w-max cursor-pointer" id={tooltipId}>
        <div className={`${vaultLabelColor[String(label)]} bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2`}>
          <p className={`text-primary ${textSize[size]}`}>{String(label)}</p>
        </div>
      </div>
      <ResponsiveTooltip id={tooltipId} content={<p className="text-white">{vaultLabelTooltip[String(label)]}</p>} />
    </>
  )
}

export default function AssetWithName({ vault, size = 1 }: { vault: VaultData, size?: number }) {
  const tooltipId = vault.address.slice(1);

  return <div className="flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1">
    <div className="relative">
      <NetworkSticker chainId={vault.chainId} size={size} />
      <TokenIcon token={vault.asset} icon={vault.asset.logoURI} chainId={vault.chainId} imageSize={iconSize[size]} />
    </div>
    <h2 className={`${vaultTextSize[size]} font-bold text-primary mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}>
      {vault.metadata.vaultName || vault.asset.name}
    </h2>
    <ProtocolIcon
      protocolName={vault.metadata.optionalMetadata?.protocol?.name}
      tooltip={{
        id: tooltipId,
        content: <p className="w-60">{vault.metadata.optionalMetadata?.protocol?.description.split("** - ")[1]}</p>
      }}
      size={size}
    />
    {vault.metadata.labels && vault.metadata.labels.length > 0 &&
      vault.metadata.labels.map(label => <VaultLabelPill key={`${tooltipId}-${label}`} label={label} id={tooltipId} />)
    }
  </div>
}

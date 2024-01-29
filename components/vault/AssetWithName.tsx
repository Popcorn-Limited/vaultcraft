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

function VaultLabelPill({ label, id }: { label: VaultLabel, id: string }): JSX.Element {
  const tooltipId = `${id}-${String(label)}`
  return (
    <>
      <div className="flex align-middle justify-between w-full md:block md:w-max cursor-pointer" id={tooltipId}>
        <div className={`${vaultLabelColor[String(label)]} bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2`}>
          <p className="text-primary">{String(label)}</p>
        </div>
      </div>
      <ResponsiveTooltip id={tooltipId} content={<p className="text-white">{vaultLabelTooltip[String(label)]}</p>} />
    </>
  )
}

export default function AssetWithName({ vault }: { vault: VaultData }) {
  const tooltipId = vault.address.slice(1);

  return <div className="flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1">
    <div className="relative w-8">
      <NetworkSticker chainId={vault.chainId} />
      <TokenIcon token={vault.asset} icon={vault.asset.logoURI} chainId={vault.chainId} imageSize="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-bold text-primary mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block">
      {vault.metadata.vaultName || vault.asset.name}
    </h2>
    <ProtocolIcon
      protocolName={vault.metadata.optionalMetadata?.protocol?.name}
      tooltip={{
        id: tooltipId,
        content: <p>{vault.metadata.optionalMetadata?.protocol?.description.split("** - ")[1]}</p>
      }}
    />
    {vault.metadata.labels && vault.metadata.labels.length > 0 &&
      vault.metadata.labels.map(label => <VaultLabelPill key={`${tooltipId}-${label}`} label={label} id={tooltipId} />)
    }
  </div>
}

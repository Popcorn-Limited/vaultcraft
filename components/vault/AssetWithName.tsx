import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { VaultData } from "@/lib/types";
import ProtocolIcon from "@/components/common/ProtocolIcon";

export default function AssetWithName({ vault }: { vault: VaultData }) {
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
        id: vault.address.slice(1),
        content: <p>{vault.metadata.optionalMetadata?.protocol?.description.split("** - ")[1]}</p>
      }}
    />
  </div>
}

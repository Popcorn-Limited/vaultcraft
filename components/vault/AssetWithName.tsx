import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { VaultData } from "@/lib/types";

const protocolNameToLlamaProtocol: { [key: string]: string } = {
  "Aave": "aave",
  "Aura": "aura",
  "Balancer": "balancer",
  "Beefy": "beefy",
  "Compound": "compound",
  "Convex": "convex",
  "Curve": "curve",
  "Flux": "flux-finance",
  "Idle": "idle",
  "Origin": "origin-defi",
  "Stargate": "stargate",
  "Yearn": "yearn-finance",
}

export default function AssetWithName({ vault }: { vault: VaultData }) {
  const protocolName = vault.metadata.optionalMetadata?.protocol?.name
  const protocolIcon = protocolName ? protocolNameToLlamaProtocol[protocolName] : "popcorn"

  return <div className="flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1">
    <div className="relative w-8">
      <NetworkSticker chainId={vault.chainId} />
      <TokenIcon token={vault.asset} icon={vault.asset.logoURI} chainId={vault.chainId} imageSize="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-bold text-primary mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block">
      {vault.metadata.vaultName || vault.asset.name}
    </h2>
    <div className="flex align-middle justify-between w-full md:block md:w-max">
      <div className="bg-gray-700 bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2">
        <img
            src={protocolIcon ? `https://icons.llamao.fi/icons/protocols/${protocolIcon}?w=48&h=48` : "/images/icons/POP.svg"}
            className="w-6 h-6 mr-1 rounded-full border border-[#ebe7d4cc]"
        />
        <p className="text-primary">{protocolName}</p>
      </div>
    </div>
  </div>
}

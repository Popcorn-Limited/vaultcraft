import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { ChainId } from "@/lib/utils/connectors";
import { Vault } from "@/lib/vault/getVault";
import { Token } from "@/lib/types";

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

export default function AssetWithName({ vault }: { vault: Vault }) {
  const protocolName = vault.metadata.optionalMetadata?.protocol?.name
  const protocolIcon = protocolName ? protocolNameToLlamaProtocol[protocolName] : "popcorn"

  return <div className="flex items-center gap-4 max-w-full xs:flex-wrap smmd:flex-nowrap flex-1">
    <div className="relative w-8">
      <NetworkSticker chainId={vault.chainId} />
      <TokenIcon token={vault.asset} icon={vault.asset.logoURI} chainId={vault.chainId} imageSize="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-bold text-primary mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] sssmd:max-w-fit ssmd:block">
      {vault.metadata.vaultName || vault.asset.name}
    </h2>
    <div className="xs:flex xs:align-middle xs:justify-between xs:w-full smmd:block smmd:w-max">
      <div className="bg-gray-700 bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2">
        <img
            src={protocolIcon ? `https://icons.llamao.fi/icons/protocols/${protocolIcon}?w=48&h=48` : "/images/icons/POP.svg"}
            className="w-6 h-6 mr-1 rounded-full border border-[#ebe7d4cc]"
        />
        <p className="text-primary font-medium">{protocolName}</p>
      </div>
      <div className="h-fit mt-auto smmd:hidden">
        <p className="font-normal text-primary text-[15px] mb-1">⚡ Zap available</p>
      </div>
    </div>
  </div>
}

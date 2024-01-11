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
  "Pirex": "pirex",
  "Sommelier": "sommelier",
  "Frax": "frax"
}

export default function ProtocolIcon({ protocolName }: { protocolName: string }): JSX.Element {
  const protocolIcon = protocolName ? protocolNameToLlamaProtocol[protocolName] : "popcorn"
  return (
    <div className="flex align-middle justify-between w-full md:block md:w-max">
      <div className="bg-gray-700 bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2">
        <img
          src={protocolIcon ? `https://icons.llamao.fi/icons/protocols/${protocolIcon}?w=48&h=48` : "/images/tokens/vcx.svg"}
          className="w-6 h-6 mr-1 rounded-full border border-[#ebe7d4cc]"
        />
        <p className="text-primary">{protocolName}</p>
      </div>
    </div>
  )
}
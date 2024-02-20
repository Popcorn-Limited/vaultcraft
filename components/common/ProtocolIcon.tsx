import { Address } from "viem"
import ResponsiveTooltip from "./Tooltip"

const protocolNameToLlamaProtocol: { [key: string]: string } = {
  "Aave": "aave",
  "Aura": "aura",
  "Balancer": "balancer",
  "Beefy": "beefy",
  "Compound": "compound",
  "Convex": "convex-finance",
  "Curve": "curve",
  "Flux": "flux-finance",
  "Idle": "idle",
  "Origin": "origin-defi",
  "Stargate": "stargate",
  "Yearn": "yearn-finance",
  "Pirex": "pirex",
  "Sommelier": "sommelier",
  "Frax": "frax",
  "Velodrome": "velodrome",
  "Stader": "stader",
  "KelpDAO": "kelp-dao"
}

const iconSize: { [key: number]: string } = {
  1: "w-6 h-6",
  2: "w-7 h-7",
  3: "w-8 h-8"
}

const textSize: { [key: number]: string } = {
  1: "text-base",
  2: "text-lg",
  3: "text-xl"
}

export default function ProtocolIcon({ protocolName, tooltip, size = 1 }: { protocolName: string, tooltip?: { id: string, content: JSX.Element }, size?: number }): JSX.Element {
  const protocolIcon = protocolName ? protocolNameToLlamaProtocol[protocolName] : "popcorn"
  return (
    <>
      <div className="flex align-middle justify-between w-full md:block md:w-max cursor-pointer" id={tooltip?.id}>
        <div className="bg-gray-700 bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2">
          <img
            src={protocolIcon ? `https://icons.llamao.fi/icons/protocols/${protocolIcon}?w=48&h=48` : "/images/tokens/vcx.svg"}
            className={`${iconSize[size]} mr-1 rounded-full border border-[#ebe7d4cc]`}
          />
          <p className={`text-primary ${textSize[size]}`}>{protocolName}</p>
        </div>
      </div>
      {tooltip && <ResponsiveTooltip id={tooltip.id} content={tooltip.content} />}
    </>
  )
}
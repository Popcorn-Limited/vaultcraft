import ResponsiveTooltip from "./Tooltip";

const IconByProtocol: { [key: string]: string } = {
  Aave: "https://icons.llamao.fi/icons/protocols/aave?w=48&h=48",
  Aura: "https://icons.llamao.fi/icons/protocols/aura?w=48&h=48",
  Balancer: "https://icons.llamao.fi/icons/protocols/balancer?w=48&h=48",
  Beefy: "https://icons.llamao.fi/icons/protocols/beefy?w=48&h=48",
  Compound: "https://icons.llamao.fi/icons/protocols/compound?w=48&h=48",
  Convex: "https://icons.llamao.fi/icons/protocols/convex-finance?w=48&h=48",
  Curve: "https://icons.llamao.fi/icons/protocols/curve?w=48&h=48",
  Flux: "https://icons.llamao.fi/icons/protocols/flux-finance?w=48&h=48",
  Idle: "https://icons.llamao.fi/icons/protocols/idle?w=48&h=48",
  Origin: "https://icons.llamao.fi/icons/protocols/origin-defi?w=48&h=48",
  Stargate: "https://icons.llamao.fi/icons/protocols/stargate?w=48&h=48",
  Yearn: "https://icons.llamao.fi/icons/protocols/yearn-finance?w=48&h=48",
  Pirex: "https://icons.llamao.fi/icons/protocols/pirex?w=48&h=48",
  Sommelier: "https://icons.llamao.fi/icons/protocols/sommelier?w=48&h=48",
  Frax: "https://icons.llamao.fi/icons/protocols/frax?w=48&h=48",
  Velodrome: "https://icons.llamao.fi/icons/protocols/velodrome?w=48&h=48",
  Stader: "https://icons.llamao.fi/icons/protocols/stader?w=48&h=48",
  KelpDAO: "https://icons.llamao.fi/icons/protocols/kelp-dao?w=48&h=48",
  Ion: "https://www.app.ionprotocol.io/logo.svg"
};

const iconSize: { [key: number]: string } = {
  1: "w-6 h-6",
  2: "w-7 h-7",
  3: "w-8 h-8",
};

const textSize: { [key: number]: string } = {
  1: "text-base",
  2: "text-lg",
  3: "text-xl",
};

export default function ProtocolIcon({
  protocolName,
  tooltip,
  size = 1,
}: {
  protocolName: string;
  tooltip?: { id: string; content: JSX.Element };
  size?: number;
}): JSX.Element {

  return (
    <>
      <div
        className="flex align-middle justify-between w-full md:block md:w-max cursor-pointer"
        id={tooltip?.id}
      >
        <div className="bg-gray-700 bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2">
          <img
            src={
              protocolName
                ? IconByProtocol[protocolName]
                : "/images/tokens/vcx.svg"
            }
            className={`${iconSize[size]} mr-1 rounded-full border border-[#ebe7d4cc]`}
          />
          <p className={`text-primary ${textSize[size]}`}>{protocolName}</p>
        </div>
      </div>
      {tooltip && (
        <ResponsiveTooltip id={tooltip.id} content={tooltip.content} />
      )}
    </>
  );
}

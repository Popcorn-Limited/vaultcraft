import ResponsiveTooltip from "@/components/common/Tooltip";

export const IconByProtocol: { [key: string]: string } = {
  Aave: "https://icons.llamao.fi/icons/protocols/aave?w=48&h=48",
  AaveV2: "https://icons.llamao.fi/icons/protocols/aave?w=48&h=48",
  AaveV3: "https://icons.llamao.fi/icons/protocols/aave?w=48&h=48",
  Aerodrome: "https://icons.llamao.fi/icons/protocols/aerodrome?w=48&h=48",
  Aura: "https://icons.llamao.fi/icons/protocols/aura?w=48&h=48",
  Balancer: "https://icons.llamao.fi/icons/protocols/balancer?w=48&h=48",
  Beefy: "https://icons.llamao.fi/icons/protocols/beefy?w=48&h=48",
  Bedrock: "https://icons.llamao.fi/icons/protocols/bedrock?w=48&h=48",
  Benqi: "https://icons.llamao.fi/icons/protocols/benqi?w=48&h=48",
  Compound: "https://icons.llamao.fi/icons/protocols/compound?w=48&h=48",
  CompoundV2: "https://icons.llamao.fi/icons/protocols/compound?w=48&h=48",
  CompoundV3: "https://icons.llamao.fi/icons/protocols/compound?w=48&h=48",
  Convex: "https://icons.llamao.fi/icons/protocols/convex-finance?w=48&h=48",
  Curve: "https://icons.llamao.fi/icons/protocols/curve?w=48&h=48",
  CurveGauge: "https://icons.llamao.fi/icons/protocols/curve?w=48&h=48",
  Etherfi: "https://icons.llamao.fi/icons/protocols/ether.fi?w=48&h=48",
  Flux: "https://icons.llamao.fi/icons/protocols/flux-finance?w=48&h=48",
  Idle: "https://icons.llamao.fi/icons/protocols/idle?w=48&h=48",
  Origin: "https://icons.llamao.fi/icons/protocols/origin-defi?w=48&h=48",
  Stargate: "https://icons.llamao.fi/icons/protocols/stargate?w=48&h=48",
  Yearn: "https://icons.llamao.fi/icons/protocols/yearn-finance?w=48&h=48",
  Pendle: "https://icons.llamao.fi/icons/protocols/pendle?w=48&h=48",
  Pirex: "https://icons.llamao.fi/icons/protocols/pirex?w=48&h=48",
  Peapods: "https://icons.llamao.fi/icons/protocols/peapods-finance?w=48&h=48",
  Sommelier: "https://icons.llamao.fi/icons/protocols/sommelier?w=48&h=48",
  Frax: "https://icons.llamao.fi/icons/protocols/frax?w=48&h=48",
  FraxLend: "https://icons.llamao.fi/icons/protocols/frax?w=48&h=48",
  Velodrome: "https://icons.llamao.fi/icons/protocols/velodrome?w=48&h=48",
  Stader: "https://icons.llamao.fi/icons/protocols/stader?w=48&h=48",
  KelpDAO: "https://icons.llamao.fi/icons/protocols/kelp-dao?w=48&h=48",
  Ion: "https://www.app.ionprotocol.io/logo.svg",
  Ipor: "https://icons.llamao.fi/icons/protocols/ipor?w=48&h=48",
  ZeroLend: "https://icons.llamao.fi/icons/protocols/zerolend?w=48&h=48",
  Lombard: "https://icons.llamao.fi/icons/protocols/lombard-finance?w=48&h=48",
  Babylon: "/images/icons/babylonLabs.jpeg",
  Veda: "https://app.veda.tech/tokens/veda.svg",
  Corn: "/images/icons/cornLogo.svg",
  Symbiotic: "https://icons.llamao.fi/icons/protocols/symbiotic?w=48&h=48",
  Morpho: "https://icons.llamao.fi/icons/protocols/morpho?w=48&h=48",
  Maker: "https://icons.llamao.fi/icons/protocols/maker?w=48&h=48",
  Gearbox: "https://icons.llamao.fi/icons/protocols/gearbox?w=48&h=48",
  Spark: "https://icons.llamao.fi/icons/protocols/spark?w=48&h=48",
  Fluid: "https://icons.llamao.fi/icons/protocols/fluid?w=48&h=48",
  Safe: "https://icons.llamao.fi/icons/protocols/safe?w=48&h=48",
  Eigenlayer: "https://icons.llamao.fi/icons/protocols/eigenlayer?w=48&h=48",
  Dolomite: "https://icons.llamao.fi/icons/protocols/dolomite?w=48&h=48",
  BeraBorrow: "/images/icons/beraborrow-logo.png",
  Kodiak: "/images/icons/kodiak-logo.svg",
  Goldilocks: "/images/icons/logo-goldilocks.png",
  Matrixport: "/images/icons/matrixport.png",
  Morph: "/images/networks/Morph.png",
  UltraYield: "/images/icons/ultrayield.svg",
  Keyrock: "/images/icons/keyrock.png",
  Kernel: "/images/icons/kernel.png",
  Dinero: "/images/icons/dinero.png",
  Multistrategy: "/images/tokens/vcx.svg",
  VaultCraft: "/images/tokens/vcx.svg",
  None: "/images/tokens/vcx.svg"
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
        className="flex align-middle justify-between md:block md:w-max cursor-pointer"
        id={tooltip?.id}
      >
        <div className="w-max bg-gray-700 bg-opacity-40 rounded-lg py-1 px-3 flex flex-row items-center gap-2">
          <img
            src={
              protocolName
                ? IconByProtocol[protocolName]
                : "/images/tokens/vcx.svg"
            }
            className={`${iconSize[size]} mr-1 rounded-full border border-white`}
          />
          <p className={`text-white ${textSize[size]}`}>{protocolName}</p>
        </div>
      </div>
      {tooltip && (
        <ResponsiveTooltip id={tooltip.id} content={tooltip.content} />
      )}
    </>
  );
}

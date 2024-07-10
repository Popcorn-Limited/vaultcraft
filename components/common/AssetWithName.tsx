import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { VaultData, VaultLabel } from "@/lib/types";
import ProtocolIcon from "@/components/common/ProtocolIcon";
import ResponsiveTooltip from "@/components/common/Tooltip";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils/helpers";

const vaultLabelColor: { [key: string]: string } = {
  Experimental: "text-white bg-orange-500 bg-opacity-90",
  Deprecated: "text-white bg-red-500 bg-opacity-80",
  New: "text-primaryYellow bg-primaryYellow bg-opacity-30",
};

const vaultLabelTooltip: { [key: string]: string } = {
  Experimental: "Unaudited strategy in testing stage",
  Deprecated: "This strategy got deprecated. Only withdrawals are open",
  New: "Newly deployed! ✨",
};

const iconSize: { [key: number]: string } = {
  1: "w-8 h-8",
  2: "w-10 h-10",
  3: "w-12 h-12",
};

const textSize: { [key: number]: string } = {
  1: "text-base",
  2: "text-lg",
  3: "text-xl",
};

const vaultTextSize: { [key: number]: string } = {
  1: "text-2xl",
  2: "text-3xl",
  3: "text-4xl",
};

function VaultLabelPill({
  label,
  id,
  size = 1,
}: {
  label: VaultLabel;
  id: string;
  size?: number;
}): JSX.Element {
  const tooltipId = `${id}-${String(label)}`;
  return (
    <>
      <div
        className="flex align-middle justify-between md:block md:w-max cursor-pointer"
        id={tooltipId}
      >
        <div
          className={`${
            vaultLabelColor[String(label)]
          } rounded-lg py-1 px-3 flex flex-row items-center gap-2`}
        >
          <p className={`${textSize[size]}`}>{String(label)}</p>
        </div>
      </div>
      <ResponsiveTooltip
        id={tooltipId}
        content={
          <p className="text-white">{vaultLabelTooltip[String(label)]}</p>
        }
      />
    </>
  );
}

export default function AssetWithName({
  vault,
  size = 1,
  className,
}: {
  vault: VaultData;
  className?: string;
  size?: number;
}) {
  const [tokens] = useAtom(tokensAtom);
  const tooltipId = vault.address.slice(1);

  return (
    <div
      className={cn(
        "flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1",
        className
      )}
    >
      <div className="relative">
        <NetworkSticker chainId={vault.chainId} size={size} />
        <TokenIcon
          token={tokens[vault.chainId][vault.asset]}
          icon={tokens[vault.chainId][vault.asset].logoURI}
          chainId={vault.chainId}
          imageSize={iconSize[size]}
        />
      </div>
      <h2
        className={`${vaultTextSize[size]} font-bold text-white mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}
      >
        {vault.metadata.vaultName || tokens[vault.chainId][vault.asset].name}
      </h2>
      <div className="flex flex-row flex-wrap w-max space-x-2">
        <ProtocolIcon
          protocolName={
            vault.strategies.length > 1
              ? "Multistrategy"
              : vault.strategies[0].metadata.name
          }
          tooltip={{
            id: tooltipId,
            content: (
              <p className="w-60">
                {vault.strategies.length > 1
                  ? "This vault allocates between multiple strategies"
                  : vault.strategies[0].metadata.description}
              </p>
            ),
          }}
          size={size}
        />
        {vault.metadata.labels &&
          vault.metadata.labels.length > 0 &&
          vault.metadata.labels.map((label) => (
            <VaultLabelPill
              key={`${tooltipId}-${label}`}
              label={label}
              id={tooltipId}
            />
          ))}
      </div>
    </div>
  );
}

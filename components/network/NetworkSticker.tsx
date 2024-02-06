import Image from "next/image";
import { ChainId, networkLogos } from "@/lib/utils/connectors";

const iconSize: { [key: number]: number } = {
  1: 20,
  2: 25,
  3: 30
}

export default function NetworkSticker({ chainId, size = 1 }: { chainId: ChainId, size?: number }): JSX.Element {
  return (
    <div className="absolute top-0 -left-2 md:-left-3">
      <Image
        src={networkLogos[chainId]}
        alt={ChainId[chainId]}
        height={iconSize[size]}
        width={iconSize[size]}
      />
    </div>
  );
};

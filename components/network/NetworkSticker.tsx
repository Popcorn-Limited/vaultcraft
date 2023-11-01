import Image from "next/image";
import { ChainId, networkLogos } from "@/lib/utils/connectors";

export default function NetworkSticker({ chainId }: { chainId: ChainId }): JSX.Element {
  return (
    <div className="absolute top-0 -left-2 md:-left-3">
      <Image
        src={networkLogos[chainId]}
        alt={ChainId[chainId]}
        height="20"
        width="20"
      />
    </div>
  );
};

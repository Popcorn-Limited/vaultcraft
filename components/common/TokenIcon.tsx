import { Token } from "@/lib/types";
import { ChainId } from "@/lib/utils/connectors";

interface TokenIconProps {
  token: Token;
  icon?: string;
  fullsize?: boolean;
  imageSize?: string;
  chainId: ChainId;
}

export default function TokenIcon({
  token,
  icon,
  fullsize = false,
  imageSize,
  chainId,
}: TokenIconProps): JSX.Element {
  icon = token?.logoURI || icon
  if (icon) {
    return <img src={icon} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
  }
  return (
    <img src={"/images/tokens/pop.svg"} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
  );
}
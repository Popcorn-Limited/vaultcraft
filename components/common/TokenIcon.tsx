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
  const className = `${imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} object-contain rounded-full`
  
  if (icon) {
    return <img src={icon} alt="token icon" className={className} />
  }
  return (
    <img src={"/images/tokens/vcx.svg"} alt="token icon" className={className} />
  );
}
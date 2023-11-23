import { getAssetsByChain } from "../constants";
import { Address, getAddress } from "viem";
import { Token } from "../types";

const EmptyTokenByChain: { [key: number]: string } = {
  1: "https://etherscan.io/images/main/empty-token.png",
  1337: "https://etherscan.io/images/main/empty-token.png",
  5: "https://etherscan.io/images/main/empty-token.png",
  137: "https://polygonscan.com/images/main/empty-token.png",
  10: "/images/networks/empty-op.svg",
  42161: "https://arbiscan.io/images/main/empty-token.png",
  56: "/images/networks/empty-bsc.svg",
}

function getProtocolIcon(asset: Token, adapter: Token, chainId: number): string | undefined {
  if (asset.name.includes("Aave")) {
    // TODO fill this with AaveV2 lp icon
    return undefined;
  }
  else if (asset.name.includes("Aave")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Across")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("AlpacaV1")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("AlpacaV2")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Balancer") || adapter?.name?.includes("Aura")) {
    // TODO fill this with curve lp icon
    return "/images/tokens/balancer-lp.png";
  }
  else if (asset.name.includes("Compound")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Curve") || asset?.name?.includes("Curve") || adapter?.name?.includes("Convex")) {
    // TODO fill this with curve lp icon
    return "/images/tokens/curve-lp.png";
  }
  else if (adapter?.name?.includes("DotDot") || adapter?.name?.includes("Ellipsis")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("GMD")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Ichi")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Metapool")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Radiant")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Solidly")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Stargate") || asset?.name?.includes("STG") || asset?.symbol?.includes("STG") || asset?.symbol?.includes("S*")) {
    // TODO fill this with curve lp icon
    return getIconFromTokenListBySymbol(asset?.symbol?.includes("*") ? asset?.symbol?.split("*")[1] : asset?.symbol?.split(" ")[1], chainId);
  }
  else if (adapter?.name?.includes("Sushi")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Velodrome")) {
    // TODO fill this with curve lp icon
    return "/images/tokens/velodrome-lp.svg";
  }
  else if (adapter?.name?.includes("Yearn")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (asset?.name?.includes("HOP") || asset?.symbol?.includes("HOP-LP")) {
    return getIconFromTokenListBySymbol(asset?.symbol?.includes("HOP-LP") ? asset?.symbol?.split("HOP-LP-")[1] : asset?.symbol?.split(" ")[1], chainId);
  }
}

function getIconFromAssetListByAddress(address: Address, chainId: number) {
  const token = getAssetsByChain(chainId).find(token => getAddress(token.address) === getAddress(address));
  return token ? token.logoURI : undefined;
}

function getIconFromTokenListBySymbol(symbol: string, chainId: number) {
  const token = getAssetsByChain(chainId).find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
  return token ? token.logoURI : undefined;
}

export default function getAssetIcon({ asset, adapter, chainId }: { asset: Token, adapter: Token, chainId: number }): string {
  let icon = getIconFromAssetListByAddress(asset.address, chainId);
  if (!icon) icon = getProtocolIcon(asset, adapter, chainId)
  if (!icon) icon = EmptyTokenByChain[chainId]
  return icon;
}
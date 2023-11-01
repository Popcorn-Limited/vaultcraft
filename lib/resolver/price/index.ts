
import { Address } from "viem";
import { PublicClient } from "wagmi";
import { llama, vault } from "./resolver"

export type PriceResolverParams = {
  address: Address,
  chainId: number,
  client?: PublicClient,
}

export type PriceResolvers = typeof PriceResolvers;

export const PriceResolvers: { [key: string]: ({ address, chainId, client }: PriceResolverParams) => Promise<number> } = {
  llama,
  vault,
  default: llama
};

export default PriceResolvers;
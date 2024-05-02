import { Address } from "viem";
import { PublicClient } from "wagmi";
import { llama, vcx } from "./resolver";

export type PriceResolverParams = {
  address: Address;
  chainId: number;
  client?: PublicClient;
};

export type PriceResolvers = typeof PriceResolvers;

export const PriceResolvers: {
  [key: string]: ({
    address,
    chainId,
    client,
  }: PriceResolverParams) => Promise<number>;
} = {
  llama,
  vcx,
  default: llama,
};

export default PriceResolvers;

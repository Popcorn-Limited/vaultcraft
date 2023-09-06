import { constants } from "ethers";

const CTOKEN: { [key: number]: { [key: string]: string } } = {
  1: { "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "0xc3d688B66703497DAA19211EEdff47f25384cdc3" },
  42161: { "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": "0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA" },
  137: { "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": "0xF25212E676D1F7F89Cd72fFEe66158f541246445" }
} // Just USDC on each chain at the moment

export async function compoundV3({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
  return Object.keys(CTOKEN).includes(String(chainId)) ? [(CTOKEN[chainId][address.toLowerCase()] || constants.AddressZero)] : [constants.AddressZero];
}
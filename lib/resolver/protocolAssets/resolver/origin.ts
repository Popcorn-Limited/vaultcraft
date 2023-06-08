import { constants } from "ethers";
import { mainnet } from "wagmi";

// @dev dont forget to lowercase the keys when you add a new one
const ORIGIN_TOKENS = ["0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3", "0x2a8e1e676ec238d8a992307b495b45b3feaa5e86"] // oETH, oUSD


export async function origin({ chainId }: { chainId: number }): Promise<string[]> {
  return chainId === mainnet.id ? ORIGIN_TOKENS : [constants.AddressZero];
}
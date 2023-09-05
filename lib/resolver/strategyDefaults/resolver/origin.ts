import { constants } from "ethers";
import { mainnet } from "wagmi";

// @dev dont forget to lowercase the keys when you add a new one
const WRAPPED_OTOKENS: { [key: string]: string } = {
  "0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3": "0xDcEe70654261AF21C44c093C300eD3Bb97b78192", // oETH
  "0x2a8e1e676ec238d8a992307b495b45b3feaa5e86": "0xD2af830E8CBdFed6CC11Bab697bB25496ed6FA62", // oUSD
}

export async function origin({ chainId, address }: { chainId: number, address: string }): Promise<any[]> {
  return chainId === mainnet.id ? [(WRAPPED_OTOKENS[address.toLowerCase()] || constants.AddressZero)] : [constants.AddressZero];
}
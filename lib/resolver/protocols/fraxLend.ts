import { Address, getAddress } from "viem";
import { ProtocolName, Yield } from "src/yieldOptions/types.js";
import { Clients, IProtocol } from "./index.js";
import { CTOKEN_ABI } from "./abi/compound_v2_ctoken.js";

// @dev Make sure the keys here are correct checksum addresses
const assetsToIbToken: { [chainId: number]: { [key: Address]: Address } } = {
  // DAI
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
  // TUSD
  "0x0000000000085d4780B73119b644AE5ecd22b376": "0x12392F67bdf24faE0AF363c24aC620a2f67DAd86",
  // USDC
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
  // USDT
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
  // wBTC
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "0xccF4429DB6322D5C611ee964527D42E5d685DD6a",
};

export class FraxLend implements IProtocol {
  private clients: Clients;
  constructor(clients: Clients) {
    this.clients = clients;
  }

  key(): ProtocolName {
    return "fraxLend";
  }

  async getApy(chainId: number, asset: Address): Promise<Yield> {
    const client = this.clients[chainId];
    if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

    const currentRateInfo = await client.readContract({
      address: assetToCToken[asset],
      abi: fraxLendAbi,
      functionName: 'currentRateInfo'
    });

    const apy = (Number(currentRateInfo[3]) * 31557600) / 1e16 // (borrowRate per second * seconds per year) / 1e18 * 100

    return {
      total: apy,
      apy: [{
        rewardToken: getAddress(asset),
        apy: apy
      }]
    };
  }

  getAssets(chainId: number): Promise<Address[]> {
    const client = this.clients[chainId];
    if (!client) throw new Error(`Missing public client for chain ID: ${chainId}`);

    return Promise.resolve(Object.keys(assetToCToken).map((key) => getAddress(key)));
  }
}


const fraxLendAbi = [{ "inputs": [], "name": "currentRateInfo", "outputs": [{ "internalType": "uint32", "name": "lastBlock", "type": "uint32" }, { "internalType": "uint32", "name": "feeToProtocolRate", "type": "uint32" }, { "internalType": "uint64", "name": "lastTimestamp", "type": "uint64" }, { "internalType": "uint64", "name": "ratePerSec", "type": "uint64" }, { "internalType": "uint64", "name": "fullUtilizationRate", "type": "uint64" }], "stateMutability": "view", "type": "function" }] as const
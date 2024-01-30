import { Address, getAddress } from "viem";
import { ProtocolName, Yield } from "src/yieldOptions/types.js";
import { IProtocol } from "./index.js";
import axios from "axios";

// @dev Make sure the keys here are correct checksum addresses
const ADDRESS_TO_SYMBOL: { [key: Address]: string } = {
    "0xc8C88fdF2802733f8c4cd7c0bE0557fdC5d2471c": "ousd", // pop-OUSD
    "0x95Ca391fB08F612Dc6b0CbDdcb6708C21d5A8295": "oeth", // pop-OETH
    "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86": "ousd", // OUSD
    "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3": "oeth", // OETH
    "0xD2af830E8CBdFed6CC11Bab697bB25496ed6FA62": "ousd", // wOUSD
    "0xDcEe70654261AF21C44c093C300eD3Bb97b78192": "oeth", // wOETH
};

// @dev Make sure the keys here are correct checksum addresses
const ORIGIN_TOKENS: Address[] = ["0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3", "0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86"]; // oETH, oUSD


export class Origin implements IProtocol {
    key(): ProtocolName {
        return "origin";
    }
    async getApy(chainId: number, asset: Address): Promise<Yield> {
        if (chainId !== 1) throw new Error("Origin is only supported on Ethereum mainnet");

        const res = (await axios.get(
            `https://analytics.ousd.com/api/v2/${ADDRESS_TO_SYMBOL[asset]}/apr/trailing/30`
        )).data;
        return {
            total: Number(res.apy),
            apy: [{
                rewardToken: getAddress(asset),
                apy: Number(res.apy),
            }],
        };
    }

    async getAssets(chainId: number): Promise<Address[]> {
        if (chainId !== 1) throw new Error("Origin is only supported on Ethereum mainnet");

        return ORIGIN_TOKENS.map(asset => getAddress(asset));
    }
}
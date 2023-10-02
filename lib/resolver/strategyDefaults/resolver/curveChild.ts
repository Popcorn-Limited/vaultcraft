import { Address } from "viem";
import { StrategyDefaultResolverParams } from "..";

export const CURVE_ADDRESS: { [chainId: number]: Address; } = {
    1: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    10: "0x0994206dfe8de6ec6920ff4d779b0d950605fb53",
    137: "0x172370d5cd63279efa6d502dab29171933a610af",
    250: "0x1E4F97b9f9F913c46F1632781732927B9019C68b",
    42161: "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978",
};

export async function curveChild({ chainId, client, address }: StrategyDefaultResolverParams): Promise<any[]> {
    return [ CURVE_ADDRESS[chainId] ]
}
import { BigNumber } from 'ethers';

export interface BalancerData {
    sellToken: string,
    buyToken: string,
    orderKind: "sell" | "buy",
    amount: string,
    gasPrice: string
}

export enum SwapKind {
    GIVEN_IN = "GIVEN_IN",
    GIVEN_OUT = "GIVEN_OUT"
}

export interface BatchSwapStep {
    poolId: string;
    assetInIndex: BigNumber;
    assetOutIndex: BigNumber;
    amount: BigNumber;
    userData: string;
}

export interface BatchSwapStruct {
    poolId: string;
    assetInIndex: BigNumber;
    assetOutIndex: BigNumber;
}

export interface FundManagement {
    sender: string;
    fromInternalBalancer: boolean;
    recipient: string;
    toInternalBalance: boolean;
}

export interface BalancerAdapterData {
    asset: string;
    baseAsset: string;
    vault: string;
    poolId: string;
    swapKind: SwapKind;
    toBaseAssetPaths: BatchSwapStruct[];
    toAssetPath: BatchSwapStruct;
    funds: FundManagement;
    tokens: string[];
    optionalData: string;
}


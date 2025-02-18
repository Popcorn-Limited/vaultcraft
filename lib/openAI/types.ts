import { Address, Hex } from "viem";

export type AssistantMessage = {
    role: string;
    content: string;
    timestamp: number;
    error?: boolean;
}

// {"gas":"552561","amountOut":"88751174224806531","priceImpact":0,"createdAt":21866867,"tx":
//     {"data":"0xb35d7e73000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000005f5e1000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000
//         00000000000000001200000000000000000000000000000000000000000000000000000000000000004095ea7b3010001ffffffffffa0b86991c6218b36c1d19d4a2e9eb0ce3606eb486e553f65010102ffffffff0252aef3ea0d3f93766d255a1bb0aa7f1c4
//         885e6226e7a43a3010203ffffffff027e7d64d987cab6eed08a191c4c2459daf2f8ed0b241c59120102ffffffffffff7e7d64d987cab6eed08a191c4c2459daf2f8ed0b00000000000000000000000000000000000000000000000000000000000000040000000
//         00000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000
//         0000000000000000140000000000000000000000000000000000000000000000000000000000000002000000000000000000000000052aef3ea0d3f93766d255a1bb0aa7f1c4885e62200000000000000000000000000000000000000000000000000000000000000200000000000000000000
//         000000000000000000000000000000000000005f5e10000000000000000000000000000000000000000000000000000000000000000200000000000000000000000009be75bc132923847290677328b8ffb15d3081f2c000000000000000000000000000000000000000000000000000000000
//         00000200000000000000000000000000000000000000000000000000138278916f00e01","to":"0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E","from":"0x9bE75Bc132923847290677328b8FFB15d3081f2c","value":"0"},"route":
// [{"action":"deposit","primary":"0x52aef3ea0d3f93766d255a1bb0aa7f1c4885e622","protocol":"vaultcraft","tokenIn":["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],"tokenOut":["0x52aef3ea0d3f93766d255a1bb0aa7f1c4885e622"]}]}%   

export type EnsoRoute = {
    action: string;
    primary: Address;
    protocol: string;
    tokenIn: Address[];
    tokenOut: Address[];
}

export type EnsoTx = {
    data: Hex;
    from: Address;
    to: Address; // tx target
    value: number;
}

export type EnsoCalldata = {
    gas: number;
    amountIn?: number;
    chainId?: number;
    amountOut: number;
    priceImpact: number;
    createdAt: number;
    route: EnsoRoute[];
    tx: EnsoTx;
}

export type ToolCalls = {
    id: string;
    functionName: string;
    arguments: string;
}

export type VaultDataToolCall = {
    chainId: number;
    items?: number;
    apySort?: boolean;
    asset?: string;
}

export type VaultDepositToolCall = {
    chainId: number;
    asset: string;
    amount: number;
    vault: Address;
    receiver?: Address;
}

export type VaultDataRes = {
    address: Address;
    asset: Address;
    tvl: number;
    name: string;
    apy?: string;
    strategy?: string;
}

export type RequiredActions = {
    type: string;
    toolCalls: ToolCalls[];
}

export type RunStatus = {
    status: string;
    requiredActions?: RequiredActions;
}

export type Thread = {
    threadId: string;
    runId: string;
}

export interface CreateThreadRunProps {
    agentId: string;
    message: string;
}

export interface SendMessageProps {
    threadId: string;
    message: string;
}

export interface GetMessagesProps {
    threadId: string;
}

export interface AgentReplyProps {
    threadId: string;
    agentId: string;
}

export interface PollRunProps {
    threadId: string;
    runId: string;
}
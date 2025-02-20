import { Address, Hex } from "viem";
import { Balance } from "../types";

export type AssistantMessage = {
  role: string;
  content: string;
  timestamp: number;
  error?: boolean;
};

export type EnsoRoute = {
  action: string;
  primary: Address;
  protocol: string;
  tokenIn: Address[];
  tokenOut: Address[];
};

export type EnsoTx = {
  data: Hex;
  from: Address;
  to: Address; // tx target
  value: number;
};

export type EnsoCalldata = {
  gas: number;
  amountIn?: number;
  chainId?: number;
  amountOut: number;
  priceImpact: number;
  createdAt: number;
  route: EnsoRoute[];
  tx: EnsoTx;
};

export type ToolCalls = {
  id: string;
  functionName: string;
  arguments: string;
};
export type VaultBalancesRes = {
  [key: Address]: Balance;
}

export type VaultBalanceToolCall = {
  chainId: number;
  vault?: Address;
};

export type VaultDataToolCall = {
  chainId: number;
  items?: number;
  apySort?: boolean;
  asset?: string;
};

export type VaultDepositToolCall = {
  chainId: number;
  asset: string;
  amount: number;
  vault: Address;
  receiver?: Address;
};

export type VaultDataRes = {
  address: Address;
  asset: Address;
  tvl: number;
  name: string;
  chainId: number;
  apy?: string;
  strategy?: string;
};

export type RequiredActions = {
  type: string;
  toolCalls: ToolCalls[];
};

export type RunStatus = {
  status: string;
  requiredActions?: RequiredActions;
};

export type Thread = {
  threadId: string;
  runId: string;
};

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

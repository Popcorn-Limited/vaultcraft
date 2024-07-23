import { BALANCER_QUERIES, BALANCER_VAULT, BalancerQueryAbi, BalancerVaultAbi } from "@/lib/constants";
import { type PublicClient, type WalletClient, type Address, type Account, type Hash, type Hex } from "viem";


export class Balancer {
  account: Account;
  publicClient: PublicClient;
  walletClient: WalletClient;

  private defaultFundManagement: FundManagement;
  constructor(
    account: Account,
    recipient: Address,
    publicClient: PublicClient,
    walletClient: WalletClient,
  ) {
    this.account = account;
    this.publicClient = publicClient;
    this.walletClient = walletClient;

    this.defaultFundManagement = {
      recipient,
      sender: this.account.address,
      fromInternalBalance: false,
      toInternalBalance: false,
    };
  }

  async swap(
    swap: SingleSwap,
    fundManagement: FundManagement = this.defaultFundManagement,
  ): Promise<Hash> {
    const maxOut = (await this.querySwap(swap, fundManagement)) * BigInt(99) / BigInt(100);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    const { request } = await this.publicClient.simulateContract({
      account: this.account,
      address: BALANCER_VAULT,
      abi: BalancerVaultAbi,
      functionName: "swap",
      args: [swap, fundManagement, maxOut, deadline],
    });

    return this.walletClient.writeContract(request)
  }

  async querySwap(swap: SingleSwap, fundManagement: FundManagement = this.defaultFundManagement): Promise<bigint> {
    return this.publicClient.readContract({
      address: BALANCER_QUERIES,
      abi: BalancerQueryAbi,
      functionName: "querySwap",
      args: [swap, fundManagement],
    });
  };

}

export type SingleSwap = {
  poolId: Hash;
  kind: SwapKind;
  assetIn: Address;
  assetOut: Address;
  amount: bigint;
  userData: Hex;
};

export enum SwapKind {
  GIVEN_IN = 0,
  GIVEN_OUT,
}

export type FundManagement = {
  sender: Address;
  fromInternalBalance: boolean;
  recipient: Address;
  toInternalBalance: boolean;
};
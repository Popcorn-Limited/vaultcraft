import { type Account, type PublicClient, type WalletClient, type Address, type Hash, erc20Abi } from "viem";

export class ERC20 {
  account: Account;
  publicClient: PublicClient;
  walletClient: WalletClient;

  constructor(
    account: Account,
    publicClient: PublicClient,
    walletClient: WalletClient,
  ) {
    this.account = account;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async getAllowance(token: Address, spender: Address): Promise<bigint> {
    return this.publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [this.account.address, spender]
    });
  };

  async approve(token: Address, spender: Address, amount: bigint): Promise<Hash> {
    const { request } = await this.publicClient.simulateContract({
      account: this.account,
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount]
    });

    return this.walletClient.writeContract(request);
  }
}
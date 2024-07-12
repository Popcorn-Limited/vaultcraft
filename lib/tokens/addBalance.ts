import { Address, PublicClient, erc20Abi } from "viem"
import { Token, TokenByAddress } from "@/lib/types"

export async function addBalances(tokens: TokenByAddress, account: Address, client: PublicClient): Promise<TokenByAddress> {
  const balances = await client.multicall({
    contracts:
      Object.values(tokens)
        .map((token: Token) => {
          return {
            address: token.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account]
          }
        })
        .flat(),
    allowFailure: false
  })

  Object.values(tokens).forEach((token: Token, i: number) => {
    token.balance = Number(balances[i])
  })

  return tokens
}
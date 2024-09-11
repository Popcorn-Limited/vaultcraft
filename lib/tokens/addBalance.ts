import { Address, PublicClient, erc20Abi } from "viem"
import { Token, TokenByAddress } from "@/lib/types"
import { ALT_NATIVE_ADDRESS } from "../constants"

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
    allowFailure: true
  })

  const nativeBalance = await client.getBalance({
    address: account,
  })

  Object.values(tokens)
    .forEach((token: Token, i: number) => {
      if (token.address === ALT_NATIVE_ADDRESS) {
        token.balance = Number(nativeBalance)
      } else {
        token.balance = Number(balances[i].result)
      }
    })

  return tokens
}
import { Address, createPublicClient, erc20Abi, http } from "viem";
import { TokenByAddress } from "@/lib/types";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { ALT_NATIVE_ADDRESS } from "@/lib/constants";
import { calcBalance } from "@/lib/utils/helpers";

export interface MutateTokenBalanceProps {
  tokensToUpdate: Address[],
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
  account: Address,
  chainId: number
}

export default async function mutateTokenBalance({
  tokensToUpdate,
  account,
  tokensAtom,
  chainId,
}: MutateTokenBalanceProps): Promise<boolean> {
  const [tokens, setTokens] = tokensAtom
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  })

  const balances = await client.multicall({
    contracts: tokensToUpdate.map(address => {
      return {
        address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account],
      }
    }),
    allowFailure: true,
  });

  const nativeBalance = await client.getBalance({
    address: account,
  })

  tokensToUpdate.forEach((address, i) => {
    if (address === ALT_NATIVE_ADDRESS) {
      tokens[chainId][address].balance = calcBalance(nativeBalance, tokens[chainId][address].decimals, tokens[chainId][address].price)
    } else {
      tokens[chainId][address].balance = calcBalance(balances[i].result as bigint || BigInt(0), tokens[chainId][address].decimals, tokens[chainId][address].price)
    }
  })

  setTokens((prev: any) => ({ ...tokens }))
  return true
}

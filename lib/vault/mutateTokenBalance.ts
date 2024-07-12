import { Address, createPublicClient, erc20Abi, http } from "viem";
import { TokenByAddress } from "@/lib/types";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";

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
  const data = await client.multicall({
    contracts: tokensToUpdate.map(address => {
      return {
        address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account],
      }
    }),
    allowFailure: false,
  });

  tokensToUpdate.forEach((address, i) => {
    tokens[chainId][address].balance = Number(data[i])
  })

  setTokens(tokens)
  return true
}

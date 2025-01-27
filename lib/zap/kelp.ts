import { encodeFunctionData, zeroAddress } from "viem";

import { encodeAbiParameters } from "viem";
import { BaseZapProps } from ".";
import { ALT_NATIVE_ADDRESS, RS_ETH_ADAPTER, RsETHAdapterAbi } from "../constants";
import { Transaction } from "../types";

export async function getKelpTransaction({
  chainId,
  sellToken,
  buyToken,
  amount,
  account,
  zapProvider,
  slippage = 100,
  tradeTimeout = 60
}: BaseZapProps): Promise<Transaction> {
  return chainId === 1 ?
    {
      from: account,
      to: RS_ETH_ADAPTER,
      data: sellToken.address === ALT_NATIVE_ADDRESS ?
        encodeFunctionData({
          abi: RsETHAdapterAbi,
          functionName: 'getRSETHWithETH',
          args: ['VaultCraft']
        }) :
        encodeFunctionData({
          abi: RsETHAdapterAbi,
          functionName: 'getRSETHWithERC20',
          args: [sellToken.address, BigInt(amount), 'VaultCraft']
        }),
      value: sellToken.address === ALT_NATIVE_ADDRESS ? BigInt(amount) : BigInt(0)
    }
    :
    {
      from: zeroAddress,
      to: zeroAddress,
      data: zeroAddress,
      value: BigInt(0)
    }
}
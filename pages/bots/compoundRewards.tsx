import { Address, createPublicClient, encodeFunctionData, erc20Abi, http, PublicClient } from "viem";
import { Asset, ROUTER_ADDRESS } from "./allocation";
import { ASSET } from "./allocation";
import { OperationType, MetaTransactionData } from "@safe-global/types-kit";
import { ChainById } from "@/lib/utils/connectors";
import Safe from "@safe-global/protocol-kit";
import { RPC_URLS } from "@/lib/utils/connectors";
import { ALT_NATIVE_ADDRESS } from "@/lib/constants";
import axios from "axios";

export default function Test() {
  return <div className="text-white">
    <button onClick={() => compoundRewards(
      "0x3C99dEa58119DE3962253aea656e61E5fBE21613",
      ASSET,
      8453
    )}>
      Do Stuff
    </button>
  </div>;
}


async function compoundRewards(safe: Address, asset: Asset, chainId: number): Promise<void> {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  })
  // check all farms for rewards
  // if rewards are available, claim them (check if its worth to claim)
  // create and execute a transaction to compound the rewards
}

async function createTransaction(sellToken: Address, buyToken: Address, amount: bigint, chainId: number, safeAddress: Address, client: PublicClient, slippage: number): Promise<boolean> {
  console.log(`Creating Transaction for ${sellToken} -> ${buyToken} with amount ${amount.toLocaleString()}`)

  const safe = await Safe.init({
    provider: RPC_URLS[chainId],
    signer: process.env.TEST_BOT_PRIVATE_KEY,
    safeAddress: safeAddress,
  });

  const transactions = []
  const allowance = await client.readContract({
    address: sellToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: [safeAddress, ROUTER_ADDRESS],
  })
  if (allowance < amount) {
    const approveTx = await approve(sellToken, amount)
    transactions.push(approveTx)
  }

  const sellTokenAddress = sellToken === ALT_NATIVE_ADDRESS ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : sellToken
  const buyTokenAddress = buyToken === ALT_NATIVE_ADDRESS ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : buyToken
  const ensoRes = (await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${safeAddress}&spender=${safeAddress}&receiver=${safeAddress}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellTokenAddress}&tokenOut=${buyTokenAddress}&routingStrategy=router`,
    { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
  )).data

  transactions.push({
    to: ensoRes.tx.to,
    value: ensoRes.tx.value,
    data: ensoRes.tx.data,
    operation: OperationType.Call,
  })

  const safeTx = await safe.createTransaction({
    transactions,
    onlyCalls: true,
  });
  const txResponse = await safe.executeTransaction(safeTx);
  const receipt = await client.waitForTransactionReceipt({
    hash: txResponse.hash as `0x${string}`,
  });
  console.log("Transaction executed: ", receipt.status)
  return receipt.status === "success"
}

async function approve(sellToken: Address, amount: bigint): Promise<MetaTransactionData> {
  const callDataApprove = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [ROUTER_ADDRESS, amount],
  });

  return {
    to: sellToken,
    value: "0",
    data: callDataApprove,
    operation: OperationType.Call,
  };
}
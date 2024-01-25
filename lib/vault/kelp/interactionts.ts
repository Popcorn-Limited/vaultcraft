import { Clients } from "@/lib/types"
import { handleCallResult } from "@/lib/utils/helpers"
import { Address, PublicClient } from "viem"

// pass in everything to use for mint/withdraw on both protocols
async function simulate(
  { account, address, abi, functionName, args, value, publicClient }
    : { account: Address, address: Address, abi: any, value: bigint | undefined, functionName: string, args: any[], publicClient: PublicClient }) {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi,
      functionName,
      args,
      value
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

export async function mintEthX({ amount, account, clients }: { amount: number, account: Address, clients: Clients }) {
  return await handleCallResult({
    successMessage: "Minting EthX!",
    simulationResponse: await simulate({
      account,
      address: "0xcf5EA1b38380f6aF39068375516Daf40Ed70D299", // Stader Staking Pool Manager
      abi: [{ "inputs": [{ "internalType": "address", "name": "_receiver", "type": "address" }, { "internalType": "string", "name": "_referralId", "type": "string" }], "name": "deposit", "outputs": [{ "internalType": "uint256", "name": "_shares", "type": "uint256" }], "stateMutability": "payable", "type": "function" }],
      functionName: "deposit",
      args: [account, ""], // TODO -> add refId
      value: BigInt(amount),
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function mintRsEth({ amount, account, clients }: { amount: number, account: Address, clients: Clients }) {
  return await handleCallResult({
    successMessage: "Minting rsEth!",
    simulationResponse: await simulate({
      account,
      address: "0x036676389e48133B63a802f8635AD39E752D375D", // KelpDao Deposit Pool
      abi: [{ "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }, { "internalType": "uint256", "name": "depositAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minRSETHAmountToReceive", "type": "uint256" }, { "internalType": "string", "name": "referralId", "type": "string" }], "name": "depositAsset", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
      functionName: "depositAsset",
      args: ["0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", BigInt(amount), BigInt(0), ""], // TODO -> add minAmount and refId
      value: undefined,
      publicClient: clients.publicClient
    }),
    clients
  })
}
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
    console.log(error)
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
      abi: KelpDepositPoolAbi,
      functionName: "depositAsset",
      args: ["0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", BigInt(amount), BigInt(0), ""], // TODO -> add minAmount and refId
      value: undefined,
      publicClient: clients.publicClient
    }),
    clients
  })
}


const KelpDepositPoolAbi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "AssetNotSupported", "type": "error" }, { "inputs": [], "name": "CallerNotLRTConfigAdmin", "type": "error" }, { "inputs": [], "name": "CallerNotLRTConfigManager", "type": "error" }, { "inputs": [], "name": "InvalidAmountToDeposit", "type": "error" }, { "inputs": [], "name": "InvalidMaximumNodeDelegatorLimit", "type": "error" }, { "inputs": [], "name": "MaximumDepositLimitReached", "type": "error" }, { "inputs": [], "name": "MaximumNodeDelegatorLimitReached", "type": "error" }, { "inputs": [], "name": "MinimumAmountToReceiveNotMet", "type": "error" }, { "inputs": [], "name": "NotEnoughAssetToTransfer", "type": "error" }, { "inputs": [], "name": "TokenTransferFailed", "type": "error" }, { "inputs": [], "name": "ZeroAddressNotAllowed", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "depositor", "type": "address" }, { "indexed": true, "internalType": "address", "name": "asset", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "depositAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "rsethMintAmount", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "referralId", "type": "string" }], "name": "AssetDeposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" }], "name": "Initialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "maxNodeDelegatorLimit", "type": "uint256" }], "name": "MaxNodeDelegatorLimitUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "minAmountToDeposit", "type": "uint256" }], "name": "MinAmountToDepositUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "nodeDelegatorContracts", "type": "address[]" }], "name": "NodeDelegatorAddedinQueue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "lrtConfig", "type": "address" }], "name": "UpdatedLRTConfig", "type": "event" }, { "inputs": [{ "internalType": "address[]", "name": "nodeDelegatorContracts", "type": "address[]" }], "name": "addNodeDelegatorContractToQueue", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }, { "internalType": "uint256", "name": "depositAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minRSETHAmountToReceive", "type": "uint256" }, { "internalType": "string", "name": "referralId", "type": "string" }], "name": "depositAsset", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }], "name": "getAssetCurrentLimit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }], "name": "getAssetDistributionData", "outputs": [{ "internalType": "uint256", "name": "assetLyingInDepositPool", "type": "uint256" }, { "internalType": "uint256", "name": "assetLyingInNDCs", "type": "uint256" }, { "internalType": "uint256", "name": "assetStakedInEigenLayer", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getNodeDelegatorQueue", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "getRsETHAmountToMint", "outputs": [{ "internalType": "uint256", "name": "rsethAmountToMint", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }], "name": "getTotalAssetDeposits", "outputs": [{ "internalType": "uint256", "name": "totalAssetDeposit", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lrtConfigAddr", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isNodeDelegator", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lrtConfig", "outputs": [{ "internalType": "contract ILRTConfig", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxNodeDelegatorLimit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minAmountToDeposit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "nodeDelegatorQueue", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "minAmountToDeposit_", "type": "uint256" }], "name": "setMinAmountToDeposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "ndcIndex", "type": "uint256" }, { "internalType": "address", "name": "asset", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferAssetToNodeDelegator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lrtConfigAddr", "type": "address" }], "name": "updateLRTConfig", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "maxNodeDelegatorLimit_", "type": "uint256" }], "name": "updateMaxNodeDelegatorLimit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }] as const
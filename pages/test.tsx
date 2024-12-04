import { showLoadingToast } from '@/lib/toasts';
import { Clients } from '@/lib/types';
import { custom, RPC_URLS } from '@/lib/utils/connectors';
import { simulateCall } from '@/lib/utils/helpers';
import { handleCallResult } from '@/lib/utils/helpers';
import { useState } from 'react';
import NoSSR from 'react-no-ssr';
import { createWalletClient, encodeFunctionData, erc20Abi, erc4626Abi, getAddress, http, parseUnits, WalletClient } from 'viem';
import { PublicClient } from 'viem';
import { Chain } from 'viem';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { useWalletClient } from 'wagmi';
import { useAccount } from 'wagmi';
import { createBundlerClient } from 'viem/account-abstraction'
import { arbitrum } from 'viem/chains';

export default function Test() {
  return <NoSSR><TestContainer /></NoSSR>
}

function TestContainer() {
  const publicClient = usePublicClient({ chainId: 42161 });
  const { data: walletClient } = useWalletClient()
  const { address: account, chain } = useAccount();
  const [calls, setCalls] = useState<any[]>([])


  async function getSetCalls() {
    setCalls(await getCalldata(account, chain, publicClient))
  }

  return <div className="text-white">
    <button onClick={getSetCalls}>getCalldata</button>
    <button onClick={() => executeCalls(calls, account, { publicClient, walletClient })}>executeCalls</button>
  </div>;
}

async function executeCalls(calls: any[], account: Address, clients: Clients) {
  console.log("sending calls")
  console.log(clients.walletClient.account)

  const request = await clients.walletClient.prepareTransactionRequest({
    account: account,
    chain: arbitrum,
    to: calls[0].to,
    value: calls[0].value,
    data: calls[0].data,
  })
  console.log({ request })
  const serializedTransaction = await clients.walletClient.signTransaction({
    account: account,
    chain: arbitrum,
    to: calls[0].to,
    value: calls[0].value,
    data: calls[0].data,
    gas: request.gas,
    maxFeePerGas: request.maxFeePerGas,
    maxPriorityFeePerGas: request.maxPriorityFeePerGas,
    nonce: request.nonce,
  })
  console.log({ serializedTransaction })
  // const hash = await clients.walletClient.sendRawTransaction({ serializedTransaction })
  // console.log(hash)

  // showLoadingToast("Executing calls...")
  // const success = await handleCallResult({
  //   successMessage: "Calls executed!",
  //   simulationResponse: await simulateCall({
  //     account,
  //     contract: {
  //       address: "0xcA11bde05977b3631167028862bE2a173976CA11",
  //       abi: multicallAbi,
  //     },
  //     functionName: "aggregate3",
  //     publicClient: clients.publicClient,
  //     args: [[{ target: calls[0].to, callData: calls[0].data, allowFailure: false }]],
  //   }),
  //   clients,
  // });
}

async function getCalldata(account: Address, chain: Chain, publicClient: PublicClient) {
  const inputAmount = parseUnits("1", 6)
  const tokenAddress = getAddress("0xaf88d065e77c8cC2239327C5EDb3A432268e5831")
  const vaultAddress = getAddress("0x55c4d29cCdf671cb901081dAF2e91891c95b07ba")

  const approveRawCall = {
    abi: [erc20Abi.find(fn => fn.name === "approve" && fn.type === "function")],
    functionName: 'approve',
    args: [vaultAddress, inputAmount],
  }
  const depositRawCall = {
    abi: [erc4626Abi.find(fn => fn.name === "deposit" && fn.type === "function")],
    functionName: 'deposit',
    args: [inputAmount, account],
  }
  const encodedApproveCall = encodeFunctionData(approveRawCall)
  const encodedDepositCall = encodeFunctionData(depositRawCall)

  const approveCall = {
    to: tokenAddress,
    raw: approveRawCall,
    data: encodedApproveCall,
    value: BigInt(0)
  }
  const depositCall = {
    to: vaultAddress,
    raw: depositRawCall,
    data: encodedDepositCall,
    value: BigInt(0)
  }
  console.log([approveCall, depositCall])
  return [approveCall, depositCall]
}


const multicallAbi = [{ "inputs": [{ "components": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }], "internalType": "struct Multicall3.Call[]", "name": "calls", "type": "tuple[]" }], "name": "aggregate", "outputs": [{ "internalType": "uint256", "name": "blockNumber", "type": "uint256" }, { "internalType": "bytes[]", "name": "returnData", "type": "bytes[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "bool", "name": "allowFailure", "type": "bool" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }], "internalType": "struct Multicall3.Call3[]", "name": "calls", "type": "tuple[]" }], "name": "aggregate3", "outputs": [{ "components": [{ "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "returnData", "type": "bytes" }], "internalType": "struct Multicall3.Result[]", "name": "returnData", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "bool", "name": "allowFailure", "type": "bool" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }], "internalType": "struct Multicall3.Call3Value[]", "name": "calls", "type": "tuple[]" }], "name": "aggregate3Value", "outputs": [{ "components": [{ "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "returnData", "type": "bytes" }], "internalType": "struct Multicall3.Result[]", "name": "returnData", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }], "internalType": "struct Multicall3.Call[]", "name": "calls", "type": "tuple[]" }], "name": "blockAndAggregate", "outputs": [{ "internalType": "uint256", "name": "blockNumber", "type": "uint256" }, { "internalType": "bytes32", "name": "blockHash", "type": "bytes32" }, { "components": [{ "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "returnData", "type": "bytes" }], "internalType": "struct Multicall3.Result[]", "name": "returnData", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "getBasefee", "outputs": [{ "internalType": "uint256", "name": "basefee", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "getBlockHash", "outputs": [{ "internalType": "bytes32", "name": "blockHash", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getBlockNumber", "outputs": [{ "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getChainId", "outputs": [{ "internalType": "uint256", "name": "chainid", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCurrentBlockCoinbase", "outputs": [{ "internalType": "address", "name": "coinbase", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCurrentBlockDifficulty", "outputs": [{ "internalType": "uint256", "name": "difficulty", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCurrentBlockGasLimit", "outputs": [{ "internalType": "uint256", "name": "gaslimit", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCurrentBlockTimestamp", "outputs": [{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "addr", "type": "address" }], "name": "getEthBalance", "outputs": [{ "internalType": "uint256", "name": "balance", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getLastBlockHash", "outputs": [{ "internalType": "bytes32", "name": "blockHash", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "requireSuccess", "type": "bool" }, { "components": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }], "internalType": "struct Multicall3.Call[]", "name": "calls", "type": "tuple[]" }], "name": "tryAggregate", "outputs": [{ "components": [{ "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "returnData", "type": "bytes" }], "internalType": "struct Multicall3.Result[]", "name": "returnData", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "requireSuccess", "type": "bool" }, { "components": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }], "internalType": "struct Multicall3.Call[]", "name": "calls", "type": "tuple[]" }], "name": "tryBlockAndAggregate", "outputs": [{ "internalType": "uint256", "name": "blockNumber", "type": "uint256" }, { "internalType": "bytes32", "name": "blockHash", "type": "bytes32" }, { "components": [{ "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "returnData", "type": "bytes" }], "internalType": "struct Multicall3.Result[]", "name": "returnData", "type": "tuple[]" }], "stateMutability": "payable", "type": "function" }] as const
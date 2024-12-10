import { RPC_URLS } from "@/lib/utils/connectors";
import { VaultData } from "@/lib/types";
import { ChainById } from "@/lib/utils/connectors";
import { createPublicClient, http, Address, erc20Abi } from "viem";
import { OracleVaultAbi, ORACLES_DEPLOY_BLOCK } from "@/lib/constants";

export type WithdrawalRequest = {
  user: Address,
  shares: bigint,
  requiredAssets: bigint,
}

export type WithdrawalRequests = {
  requests: WithdrawalRequest[],
  totalShares: bigint,
  totalAssets: bigint,
  availableAssets: bigint,
}

export default async function fetchWithdrawalRequests(vault: VaultData): Promise<WithdrawalRequests> {
  const client = createPublicClient({
    chain: ChainById[vault.chainId],
    transport: http(RPC_URLS[vault.chainId]),
  })

  const requestLogs = await client.getContractEvents({
    address: vault.address,
    abi: OracleVaultAbi,
    eventName: "RedeemRequested",
    fromBlock: ORACLES_DEPLOY_BLOCK[vault.chainId] === 0 ? "earliest" : BigInt(ORACLES_DEPLOY_BLOCK[vault.chainId]),
    toBlock: "latest",
  });
  const cancelLogs = await client.getContractEvents({
    address: vault.address,
    abi: OracleVaultAbi,
    eventName: "RedeemRequestCanceled",
    fromBlock: ORACLES_DEPLOY_BLOCK[vault.chainId] === 0 ? "earliest" : BigInt(ORACLES_DEPLOY_BLOCK[vault.chainId]),
    toBlock: "latest",
  });
  const fulfillLogs = await client.getContractEvents({
    address: vault.address,
    abi: OracleVaultAbi,
    eventName: "RedeemRequestFulfilled",
    fromBlock: ORACLES_DEPLOY_BLOCK[vault.chainId] === 0 ? "earliest" : BigInt(ORACLES_DEPLOY_BLOCK[vault.chainId]),
    toBlock: "latest",
  });

  // Sort and sum requests by controller
  const requests: { [key: Address]: WithdrawalRequest } = {}
  requestLogs.forEach(log => {
    if (Object.keys(requests).includes(log.args.controller!)) {
      requests[log.args.controller!].shares += log.args.shares!
    } else {
      requests[log.args.controller!] = {
        user: log.args.controller!,
        shares: log.args.shares!,
        requiredAssets: BigInt(0),
      }
    }
  })

  // Subtract canceled requests
  cancelLogs.forEach(log => {
    if (Object.keys(requests).includes(log.args.controller!)) {
      requests[log.args.controller!].shares -= log.args.shares!
    }
  })

  // Subtract fulfilled requests
  fulfillLogs.forEach(log => {
    if (Object.keys(requests).includes(log.args.controller!)) {
      requests[log.args.controller!].shares -= log.args.shares!
    }
  })

  const totalShares = Object.values(requests).reduce((acc, request) => acc + request.shares, BigInt(0))
  const res2 = await client.multicall({
    contracts: [{
      address: vault.address,
      abi: OracleVaultAbi,
      functionName: "convertToAssets",
      args: [totalShares]
    },
    {
      address: vault.asset,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [vault.safes![0]]
    }]
  })

  return {
    requests: Object.values(requests).map(request => ({
      ...request,
      requiredAssets: res2[0].result! * request.shares / (totalShares || BigInt(1))
    })),
    totalShares: totalShares,
    totalAssets: res2[0].result!,
    availableAssets: res2[1].result!
  }
}
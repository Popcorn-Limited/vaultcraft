import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { VaultData } from "@/lib/types";
import { OracleVaultAbi } from "@/lib/constants";
import fetchWithdrawalRequests, { WithdrawalRequest } from "@/lib/vault/management/safe/fetchWithdrawalRequests";
import { showLoadingToast } from "@/lib/toasts";
import { formatBalance, simulateCall } from "@/lib/utils/helpers";
import { handleCallResult } from "@/lib/utils/helpers";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import SecondaryButtonGroup from "@/components/common/SecondaryButtonGroup";
import AssetWithName from "@/components/common/AssetWithName";

export default function WithdrawalProcessing({ vault }: { vault: VaultData }) {
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [tokens] = useAtom(tokensAtom)

  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [requestShares, setRequestShares] = useState<bigint>(BigInt(0));
  const [requiredAssets, setRequiredAssets] = useState<bigint>(BigInt(0));
  const [availableAssets, setAvailableAssets] = useState<bigint>(BigInt(0));

  const [queuedAssets, setQueuedAssets] = useState<bigint>(BigInt(0));
  const [queue, setQueue] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    fetchData()
  }, [vault])

  function fetchData() {
    fetchWithdrawalRequests(vault).then(res => {
      setRequests(res.requests)
      setRequestShares(res.totalShares)
      setRequiredAssets(res.totalAssets)
      setAvailableAssets(res.availableAssets)
    })
  }

  function addToQueue(request: WithdrawalRequest) {
    setQueue([...queue, request])
    setQueuedAssets(queuedAssets + request.requiredAssets)
  }

  function removeFromQueue(request: WithdrawalRequest) {
    setQueue(queue.filter(r => r !== request))
    setQueuedAssets(queuedAssets - request.requiredAssets)
  }

  async function handleFulfillRedeem(request: WithdrawalRequest) {
    if (!account || !walletClient) return;

    showLoadingToast("Fulfilling redeem request...");

    const success = await handleCallResult({
      successMessage: "Redeem request fulfilled!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: vault.address,
          abi: OracleVaultAbi,
        },
        functionName: "fulfillRedeem",
        publicClient: publicClient!,
        args: [request.shares, request.user]
      }),
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!,
      },
    });

    if (success) {
      fetchData();
    }
  }

  async function handleFulfillRedeemMultiple(queue_: WithdrawalRequest[]) {
    if (!account || !walletClient) return;

    showLoadingToast("Fulfilling redeem request...");

    const success = await handleCallResult({
      successMessage: "Redeem request fulfilled!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: vault.address,
          abi: OracleVaultAbi,
        },
        functionName: "fulfillMultipleRedeems",
        publicClient: publicClient!,
        args: [queue_.map(request => request.shares), queue.map(request => request.user)]
      }),
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!,
      },
    });

    if (success) {
      fetchData();
    }
  }

  function handleFulfillAll() {
    handleFulfillRedeemMultiple(requests);
  }

  return (
    <div>
      <div
        className="bg-customGray600 py-2 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3 flex flex-row justify-between"
      >
        <AssetWithName vault={vault} />
        <div className="flex flex-row gap-2 w-1/2 justify-end">
          <div className="text-base">
            <p>{formatBalance(availableAssets, tokens[vault.chainId][vault.asset].decimals)} {tokens[vault.chainId][vault.asset].symbol} Available</p>
            <p>{formatBalance(requiredAssets, tokens[vault.chainId][vault.asset].decimals)} {tokens[vault.chainId][vault.asset].symbol} Required</p>
            <p>{formatBalance(queuedAssets, tokens[vault.chainId][vault.asset].decimals)} {tokens[vault.chainId][vault.asset].symbol} Queued</p>
          </div>
          <div className="h-16 w-40">
            <MainButtonGroup
              label="Withdraw All"
              mainAction={handleFulfillAll}
              chainId={vault.chainId}
              disabled={requiredAssets > availableAssets || requiredAssets === BigInt(0)}
            />
          </div>
          <div className="h-16 w-40">
            <SecondaryButtonGroup
              label="Fulfill Queue"
              mainAction={() => handleFulfillRedeemMultiple(queue)}
              chainId={vault.chainId}
              disabled={queuedAssets > availableAssets || queuedAssets === BigInt(0)}
            />
          </div>
        </div>
      </div>
      <table className="min-w-full">
        <thead className="">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3">
              User
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
              Shares
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
              Required {tokens[vault.chainId][vault.asset].symbol}
            </th>
            <th scope="col" className="px-3 py-3.5 justify-end">

            </th>
          </tr>
        </thead>
        <tbody className="">
          {requests
            .filter(request => request.shares > BigInt(0))
            .map(request => (
              <tr
                key={vault.address + request.user}
                className="border-gray-200 border-t"
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-3">
                  {request.user}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatBalance(request.shares, tokens[vault.chainId][vault.asset].decimals)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatBalance(request.requiredAssets, tokens[vault.chainId][vault.asset].decimals)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 flex flex-row justify-end gap-2">
                  <div className="h-16 w-40">
                    <MainButtonGroup
                      label="Withdraw"
                      mainAction={() => handleFulfillRedeem(request)}
                      chainId={vault.chainId}
                      disabled={request.requiredAssets > availableAssets}
                    />
                  </div>
                  <div className="h-16 w-40">
                    {queue.includes(request) ?
                      <SecondaryButtonGroup
                        label="Remove from Queue"
                        mainAction={() => removeFromQueue(request)}
                        chainId={vault.chainId}
                        disabled={false}
                      />
                      : <SecondaryButtonGroup
                        label="Add to Queue"
                        mainAction={() => addToQueue(request)}
                        chainId={vault.chainId}
                        disabled={queuedAssets + request.requiredAssets > availableAssets}
                      />}
                  </div>
                </td>
              </tr>
            ))}
        </tbody >
      </table>
    </div >
  )
}
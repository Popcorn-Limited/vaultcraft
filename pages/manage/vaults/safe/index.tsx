import AssetWithName from "@/components/common/AssetWithName";
import { handleCallResult, NumberFormatter, simulateCall } from "@/lib/utils/helpers";
import { formatBalance } from "@/lib/utils/helpers";
import TabSelector from "@/components/common/TabSelector";
import { useEffect, useState } from "react";
import { Token, TokenType, VaultData, VaultLabel } from "@/lib/types";
import { Address, http, createPublicClient, zeroAddress, erc20Abi } from "viem";
import { ChainById, RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import NetworkFilter from "@/components/network/NetworkFilter";
import SearchBar from "@/components/input/SearchBar";
import VaultsSorting from "@/components/vault/VaultsSorting";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import useNetworkFilter from "@/lib/useNetworkFilter";
import { EMPTY_LLAMA_APY_ENTRY } from "@/lib/resolver/apy";
import SpinningLogo from "@/components/common/SpinningLogo";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import SecondaryButtonGroup from "@/components/common/SecondaryButtonGroup";
import { arbitrum } from "viem/chains";
import { OracleVaultAbi } from "@/lib/constants";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { showLoadingToast } from "@/lib/toasts";
import { vaultsAtom } from "@/lib/atoms/vaults";

const DEFAULT_TABS = ["Withdrawals", "Vaults"]

export default function SafeVaultsOverview() {
  const [tokens] = useAtom(tokensAtom)
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TABS[0])
  return (
    <>
      <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-top justify-between py-4 md:py-10 px-4 md:px-0 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
            Safe Vaults
          </h1>
          <p className="text-customGray100 md:text-white md:opacity-80">
            Manage Safe Vaults.
          </p>
        </div>
      </section>

      {Object.keys(tokens).length > 0
        ? <section className="mt-4">
          <TabSelector availableTabs={DEFAULT_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "Vaults" && <SafeVaults />}
          {activeTab === "Withdrawals" && <SafeVaultsWithdrawals />}
        </section>
        : <SpinningLogo />
      }
    </>
  )
}


function SafeVaults() {
  return <p className="mt-4 text-white">Coming Soon...</p>
}


async function fetchRequests(vault: VaultData) {
  const client = createPublicClient({
    chain: ChainById[vault.chainId],
    transport: http(RPC_URLS[vault.chainId]),
  })

  const requestLogs = await client.getContractEvents({
    address: vault.address,
    abi: OracleVaultAbi,
    eventName: "RedeemRequested",
    fromBlock: "earliest",
    toBlock: "latest",
  });
  const cancelLogs = await client.getContractEvents({
    address: vault.address,
    abi: OracleVaultAbi,
    eventName: "RedeemRequestCanceled",
    fromBlock: "earliest",
    toBlock: "latest",
  });
  const fulfillLogs = await client.getContractEvents({
    address: vault.address,
    abi: OracleVaultAbi,
    eventName: "RedeemRequestFulfilled",
    fromBlock: "earliest",
    toBlock: "latest",
  });

  console.log({ chainId: vault.chainId, address: vault.address, requestLogs, cancelLogs, fulfillLogs })

  // Sort and sum requests by controller
  const requests: { [key: Address]: Request } = {}
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

type Request = {
  user: Address,
  shares: bigint,
  requiredAssets: bigint,
}

function SafeVaultsWithdrawals() {
  const [tokens] = useAtom(tokensAtom)
  const [vaultsData] = useAtom(vaultsAtom)
  const [vaults, setVaults] = useState<VaultData[]>([]);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map((network) => network.id));
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat().filter(vault => vault.metadata.type === "safe-vault-v1"));
    }
  }, [vaultsData, vaults]);

  function handleSearch(value: string) {
    setSearchTerm(value);
  }

  return (
    <div>
      <nav className="[&_>*]:shrink-0 mt-8 [&_.my-10]:my-0 whitespace-nowrap flex flex-col smmd:flex-row gap-4 mb-10">
        <NetworkFilter
          supportedNetworks={SUPPORTED_NETWORKS.map((chain) => chain.id)}
          selectNetwork={selectNetwork}
        />

        <section className="flex gap-3 flex-grow items-center justify-end">
          <SearchBar
            className="!w-full [&_input]:w-full smmd:!w-auto h-[3.5rem] !border-customGray500"
            searchTerm={searchTerm}
            handleSearch={handleSearch}
          />
          <VaultsSorting
            className="[&_button]:h-[3.5rem]"
            vaultState={[vaults, setVaults]}
          />
        </section>
      </nav>
      <section>
        {Object.keys(tokens).length > 0 &&
          vaults
            .filter(
              (vault) => selectedNetworks.includes(vault.chainId)
            )
            .filter(
              (vault) => searchTerm.length > 0 ? (
                vault.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vault.metadata.vaultName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vault.asset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tokens[vault.chainId][vault.asset].symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tokens[vault.chainId][vault.asset].name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vault.strategies.some(strategy => strategy.metadata.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                searchTerm.toLowerCase().includes("multi") && vault.strategies.length > 1
              ) : true
            ).
            map(vault => <SafeVaultWithdrawals key={vault.address} vault={vault} />)
        }
      </section>
    </div>
  )
}

function SafeVaultWithdrawals({ vault }: { vault: VaultData }) {
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [tokens] = useAtom(tokensAtom)

  const [requests, setRequests] = useState<Request[]>([]);
  const [requestShares, setRequestShares] = useState<bigint>(BigInt(0));
  const [requiredAssets, setRequiredAssets] = useState<bigint>(BigInt(0));
  const [availableAssets, setAvailableAssets] = useState<bigint>(BigInt(0));

  const [queuedAssets, setQueuedAssets] = useState<bigint>(BigInt(0));
  const [queue, setQueue] = useState<Request[]>([]);

  useEffect(() => {
    fetchData()
  }, [vault])

  function fetchData() {
    fetchRequests(vault).then(res => {
      setRequests(res.requests)
      setRequestShares(res.totalShares)
      setRequiredAssets(res.totalAssets)
      setAvailableAssets(res.availableAssets)
    })
  }

  function addToQueue(request: Request) {
    setQueue([...queue, request])
    setQueuedAssets(queuedAssets + request.requiredAssets)
  }

  function removeFromQueue(request: Request) {
    setQueue(queue.filter(r => r !== request))
    setQueuedAssets(queuedAssets - request.requiredAssets)
  }

  async function handleFulfillRedeem(request: Request) {
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

  async function handleFulfillRedeemMultiple() {
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
        args: [queue.map(request => request.shares), queue.map(request => request.user)]
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
    setQueue(requests)
    handleFulfillRedeemMultiple();
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
              mainAction={handleFulfillRedeemMultiple}
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
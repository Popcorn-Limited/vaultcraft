import AssetWithName from "@/components/common/AssetWithName";
import { handleCallResult, NumberFormatter, simulateCall } from "@/lib/utils/helpers";
import { formatBalance } from "@/lib/utils/helpers";
import TabSelector from "@/components/common/TabSelector";
import { useEffect, useState } from "react";
import { Token, TokenType, VaultData, VaultLabel } from "@/lib/types";
import { Address, http, createPublicClient, zeroAddress, erc20Abi } from "viem";
import { RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
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

const VAULT: Token = {
  address: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  name: "Vault",
  symbol: "Vault",
  decimals: 6,
  logoURI: "",
  balance: { value: BigInt(0), formatted: "0", formattedUSD: "0" },
  price: 1,
  totalSupply: BigInt(0),
  chainId: 42161,
  type: TokenType.Vault,
}

const SAFE_VAULTS: VaultData[] = [{
  address: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  vault: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  gauge: zeroAddress,
  chainId: 42161,
  fees: {
    deposit: BigInt(0),
    withdrawal: BigInt(0),
    management: BigInt(0),
    performance: BigInt(0)
  },
  totalAssets: BigInt(0),
  totalSupply: BigInt(0),
  assetsPerShare: 0,
  depositLimit: BigInt(0),
  withdrawalLimit: BigInt(0),
  tvl: 0,
  apyData: {
    targetApy: 0,
    baseApy: 0,
    rewardApy: 0,
    totalApy: 0,
    apyHist: [],
    apyId: "",
    apySource: undefined
  },
  gaugeData: undefined,
  metadata: {
    vaultName: "Test Safe Vault",
    labels: [VaultLabel.experimental],
    description: "",
    type: "multi-strategy-vault-v2",
    creator: "0x2C3B135cd7dc6C673b358BEF214843DAb3464278",
    feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E"
  },
  strategies: [
    {
      address: "0x3C99dEa58119DE3962253aea656e61E5fBE21613",
      asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      yieldToken: undefined,
      metadata: {
        name: "Safe",
        protocol: "Safe",
        description: "Experimental Gnosis Safe Vault",
        type: "Vanilla"
      },
      resolver: "",
      allocation: BigInt(0),
      allocationPerc: 0,
      apyData: {
        targetApy: 0,
        baseApy: 0,
        rewardApy: 0,
        totalApy: 0,
        apyHist: [EMPTY_LLAMA_APY_ENTRY],
        apyId: "",
        apySource: "custom"
      },
      totalAssets: BigInt(0),
      totalSupply: BigInt(0),
      assetsPerShare: 0,
      idle: BigInt(0),
    }
  ],
  idle: BigInt(0),
  liquid: BigInt(0),
  points: []
}]


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




// @dev temporary list of users to read requests from
const USERS: Address[] = ["0x22f5413C075Ccd56D575A54763831C4c27A37Bdb", "0x2C3B135cd7dc6C673b358BEF214843DAb3464278"]

async function fetchRequests() {
  const client = createPublicClient({
    chain: arbitrum,
    transport: http(RPC_URLS[arbitrum.id]),
  })

  // @ts-ignore
  const res = await client.multicall({
    contracts: USERS.map(user => ({
      address: VAULT.address,
      abi: OracleVaultAbi,
      functionName: "getRequestBalance",
      args: [user]
    }))
  })

  // TODO readd later when we have proper events
  // const requestLogs = await client.getContractEvents({
  //   address: VAULT.address,
  //   abi: OracleVaultAbi,
  //   eventName: "RedeemRequest",
  //   fromBlock: "earliest",
  //   toBlock: "latest",
  // });
  // const cancelLogs = await client.getContractEvents({
  //   address: VAULT.address,
  //   abi: OracleVaultAbi,
  //   eventName: "RedeemRequestCanceled",
  //   fromBlock: "earliest",
  //   toBlock: "latest",
  // });
  // const fulfillLogs = await client.getContractEvents({
  //   address: VAULT.address,
  //   abi: OracleVaultAbi,
  //   eventName: "RedeemRequestFulfilled",
  //   fromBlock: "earliest",
  //   toBlock: "latest",
  // });

  const requests: Request[] = res.filter(result => result.status === "success").map((result: any, index) => ({
    user: USERS[index],
    shares: result.result.pendingShares,
    requiredAssets: BigInt(0),
    requestTime: result.result.requestTime,
  }))
  const totalShares = requests.reduce((acc, request) => acc + request.shares, BigInt(0))
  const res2 = await client.multicall({
    contracts: [{
      address: VAULT.address,
      abi: OracleVaultAbi,
      functionName: "convertToAssets",
      args: [totalShares]
    },
    {
      address: SAFE_VAULTS[0].asset,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [SAFE_VAULTS[0].strategies[0].address]
    }]
  })

  return {
    requests: requests.map(request => ({
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
  requestTime: bigint
}

function SafeVaultsWithdrawals() {
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [tokens] = useAtom(tokensAtom)
  const [vaults, setVaults] = useState<VaultData[]>(SAFE_VAULTS);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map((network) => network.id));
  const [searchTerm, setSearchTerm] = useState("");

  const [requests, setRequests] = useState<Request[]>([]);
  const [requestShares, setRequestShares] = useState<bigint>(BigInt(0));
  const [requiredAssets, setRequiredAssets] = useState<bigint>(BigInt(0));
  const [availableAssets, setAvailableAssets] = useState<bigint>(BigInt(0));

  const [queuedAssets, setQueuedAssets] = useState<bigint>(BigInt(0));
  const [queue, setQueue] = useState<Request[]>([]);

  useEffect(() => {
    fetchData();
  }, [])

  function fetchData() {
    fetchRequests().then(res => {
      setRequests(res.requests)
      setRequestShares(res.totalShares)
      setRequiredAssets(res.totalAssets)
      setAvailableAssets(res.availableAssets)
    })
  }

  function handleSearch(value: string) {
    setSearchTerm(value);
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
          address: VAULT.address,
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
          address: VAULT.address,
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
    setQueue(requests);
    setQueuedAssets(requiredAssets);
    handleFulfillRedeemMultiple();
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
      {vaults
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
        )
        .map(vault =>
          <div className="" key={vault.address}>
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
                    Required Assets
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Request Time
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
                        {formatBalance(request.shares, VAULT.decimals)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatBalance(request.requiredAssets, tokens[vault.chainId][vault.asset].decimals)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {request.requestTime === BigInt(0) ? "N/A" : new Date(Number(request.requestTime) * 1000).toLocaleString()}
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
        )}
    </div>
  )
}
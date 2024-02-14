import NoSSR from "react-no-ssr";
import { sepolia, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { Address, PublicClient, ReadContractParameters, WalletClient, createPublicClient, http, maxUint256, parseEther, parseUnits, zeroAddress } from "viem";
import { useEffect, useState } from "react";
import { GaugeAbi, GaugeControllerAbi, VaultAbi, ZERO, getVeAddresses } from "@/lib/constants";
import { hasAlreadyVoted } from "@/lib/gauges/hasAlreadyVoted";
import { Token, VaultData } from "@/lib/types";
import { sendVotes } from "@/lib/gauges/interactions";
import Gauge from "@/components/boost/Gauge";
import LockModal from "@/components/boost/modals/lock/LockModal";
import ManageLockModal from "@/components/boost/modals/manage/ManageLockModal";
import OptionTokenModal from "@/components/boost/modals/optionToken/OptionTokenModal";
import MainActionButton from "@/components/button/MainActionButton";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import LpModal from "@/components/boost/modals/lp/LpModal";
import { voteUserSlopes } from "@/lib/gauges/useGaugeWeights";
import NetworkFilter from "@/components/network/NetworkFilter";
import SearchBar from "@/components/input/SearchBar";
import VaultsSorting from "@/components/vault/VaultsSorting";
import useNetworkFilter from "@/lib/useNetworkFilter";
import { ChainId, RPC_URLS } from "@/lib/utils/connectors";
import { arbitrumSepolia } from "viem/chains";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { intervalToDuration } from "date-fns";
import { Dispatch, SetStateAction } from "react";
import { getVotePeriodEndTime } from "@/lib/gauges/utils";
import useLockedBalanceOf from "@/lib/gauges/useLockedBalanceOf";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { formatEther } from "viem";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import axios from "axios";
import { showLoadingToast } from "@/lib/toasts";
import { handleCallResult } from "@/lib/utils/helpers";
import { claimOPop } from "@/lib/optionToken/interactions";
import SmartVault from "@/components/vault/SmartVault";

const { VotingEscrow: VOTING_ESCROW, WETH_VCX_LP, oVCX: OVCX, GaugeController: GAUGE_CONTROLLER, Minter: MINTER, VeBeacon: VE_BEACON } = getVeAddresses()

export const ETH_SEPOLIA_CHAIN_ID = 11155111;
export const ARB_SEPOLIA_CHAIN_ID = 421614;
const SUPPORTED_CHAINS = [ETH_SEPOLIA_CHAIN_ID as ChainId, ARB_SEPOLIA_CHAIN_ID as ChainId]

const ETH_CLIENT = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URLS[ETH_SEPOLIA_CHAIN_ID]),
});
const ARB_CLIENT = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(RPC_URLS[ARB_SEPOLIA_CHAIN_ID]),
});

function thisPeriodTimestamp() {
  const week = 604800 * 1000;
  return (Math.floor(Date.now() / week) * week) / 1000;
};

async function getTokenPrice(token: Address) {
  const { data } = await axios.get(`https://coins.llama.fi/prices/current/ethereum:${token}`);
  return data.coins[`ethereum:${token}`]?.price;
}

async function getVaultAssetPrice(vault: Address) {
  return vault === "0xd870dE4D952832de779eb770f7DfE6148064C9a7" ? 2300 : 1
}

async function calculateGaugeApr(gaugeData: any) {
  const vaultAssetPriceInUsd = await getVaultAssetPrice(gaugeData.vault);
  const vcxPriceInUsd = await getTokenPrice("0xcE246eEa10988C495B4A90a905Ee9237a0f91543");

  // calculate the lowerAPR and upperAPR
  let lowerAPR = 0;
  let upperAPR = 0;
  // 25% discount for oVCX
  const oVcxPriceUSD = vcxPriceInUsd * 0.25;

  const relative_inflation = gaugeData.inflationRate * gaugeData.cappedRelativeWeight;
  if (relative_inflation > 0) {
    const annualRewardUSD = relative_inflation * 86400 * 365 * oVcxPriceUSD;
    const workingSupplyUSD = (gaugeData.workingSupply > 0 ? gaugeData.workingSupply : 1e18) * vaultAssetPriceInUsd;

    lowerAPR = annualRewardUSD / workingSupplyUSD / (100 / gaugeData.tokenlessProduction);
    upperAPR = annualRewardUSD / workingSupplyUSD;
  }

  return {
    lowerAPR,
    upperAPR,
  };
}

async function getGaugeData(gauge: Address, childGauge?: Address) {
  const gaugeContract = {
    address: gauge,
    abi: GaugeAbi
  }

  let data: any[];
  if (childGauge) {
    data = await ETH_CLIENT.multicall({
      contracts: [
        {
          ...gaugeContract,
          functionName: 'inflation_params', // root
        },
        {
          ...gaugeContract,
          functionName: 'getCappedRelativeWeight', // root
          args: [BigInt(thisPeriodTimestamp())]
        }
      ],
      allowFailure: false
    })
    const childData = await ARB_CLIENT.multicall({
      contracts: [
        {
          ...gaugeContract,
          functionName: 'tokenless_production', // child
        },
        {
          ...gaugeContract,
          functionName: 'decimals', // child
        },
        {
          address: childGauge,
          abi: GaugeAbi,
          functionName: 'lp_token', // child
        },
        {
          address: childGauge,
          abi: GaugeAbi,
          functionName: 'working_supply', // child
        },
      ],
      allowFailure: false
    });
    data.push(...childData)
  } else {
    data = await ETH_CLIENT.multicall({
      contracts: [
        {
          ...gaugeContract,
          functionName: 'inflation_rate', // root
        },
        {
          ...gaugeContract,
          functionName: 'getCappedRelativeWeight', // root
          args: [BigInt(thisPeriodTimestamp())]
        },
        {
          ...gaugeContract,
          functionName: 'tokenless_production', // root
        },
        {
          ...gaugeContract,
          functionName: 'decimals', // root
        },
        {
          ...gaugeContract,
          functionName: 'lp_token', // root
        },
        {
          ...gaugeContract,
          functionName: 'working_supply', // root
        },
      ],
      allowFailure: false
    });
  }

  return {
    vault: data[4],
    inflationRate: Number(childGauge ? data[0][0] : data[0]) / 1e18,
    cappedRelativeWeight: Number(data[1]) / 1e18,
    tokenlessProduction: Number(data[2]),
    workingSupply: Number(data[5]) / 10 ** Number(data[3]),
    decimals: Number(data[3]),
  };
}

async function mintMockToken({ account, address, decimals, chainId, publicClient, walletClient }
  : { account: Address, address: Address, decimals: number, chainId: number, publicClient: PublicClient, walletClient: WalletClient }) {

  if (walletClient.chain?.id !== chainId) {
    try {
      await walletClient.switchChain({ id: chainId });
    } catch (error) {
      return
    }
  }

  showLoadingToast("Minting Mock Token...")

  let simRes;
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: [{ "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
      functionName: "mint",
      args: [account, parseUnits("1", decimals)],
    })
    simRes = { request: request, success: true, error: null }
  } catch (error: any) {
    simRes = { request: null, success: false, error: error.shortMessage }
  }

  return handleCallResult({
    successMessage: "Minted Mock Token!",
    simulationResponse: simRes,
    clients: { publicClient, walletClient }
  })
}

async function transmitRewards({ account, address, publicClient, walletClient }
  : { account: Address, address: Address, publicClient: PublicClient, walletClient: WalletClient }) {

  if (walletClient.chain?.id !== Number(ETH_SEPOLIA_CHAIN_ID)) {
    try {
      await walletClient.switchChain({ id: sepolia.id });
    } catch (error) {
      return
    }
  }

  showLoadingToast("Bridging Rewards...")

  let simRes;
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: RootGaugeFactoryAbi,
      functionName: "transmit_emissions_multiple",
      args: [["0x5D5004850Ad6C2C8bBb16F22E7b45a8a3BbCFd46", "0xb689121e9Cb3FDA136FDD25A32DF1C6a49564528", "0xc809007A1e62F6F938076c9Bc67E07191E10114d"]],
      value: parseEther("0.01")
    })
    simRes = { request: request, success: true, error: null }
  } catch (error: any) {
    simRes = { request: null, success: false, error: error.shortMessage }
  }

  return handleCallResult({
    successMessage: "Bridged Rewards!",
    simulationResponse: simRes,
    clients: { publicClient, walletClient }
  })
}

async function broadcastVeBalance({ account, address, publicClient, walletClient }
  : { account: Address, address: Address, publicClient: PublicClient, walletClient: WalletClient }) {

  if (walletClient.chain?.id !== Number(ETH_SEPOLIA_CHAIN_ID)) {
    try {
      await walletClient.switchChain({ id: sepolia.id });
    } catch (error) {
      return
    }
  }

  console.log({ args: [account, BigInt(String(ARB_SEPOLIA_CHAIN_ID)), BigInt("500000"), BigInt("1000000")], address })

  showLoadingToast("Broadcasting VeBalance...")

  let simRes;
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VeBeaconAbi,
      functionName: "broadcastVeBalance",
      args: [account, BigInt(String(ARB_SEPOLIA_CHAIN_ID)), BigInt("500000"), BigInt("100000000")],
      value: parseEther("0.01")
    })
    simRes = { request: request, success: true, error: null }
  } catch (error: any) {
    simRes = { request: null, success: false, error: error.shortMessage }
  }

  return handleCallResult({
    successMessage: "VeBalance broadcasted!",
    simulationResponse: simRes,
    clients: { publicClient, walletClient }
  })
}

function prepareVaultContract(vault: Address, asset: Address, account: Address): ReadContractParameters[] {
  const vaultContract = {
    address: vault,
    abi: VaultAbi
  }

  return [
    {
      ...vaultContract,
      functionName: 'totalAssets'
    },
    {
      ...vaultContract,
      functionName: 'totalSupply'
    },
    {
      ...vaultContract,
      functionName: 'balanceOf',
      args: [account]
    },
    {
      ...vaultContract,
      address: asset,
      functionName: 'balanceOf',
      args: [account]
    }
  ]
}

async function getVaults({ account, chainId }: { client: PublicClient, account: Address, chainId: number }): Promise<VaultData[]> {
  const client = createPublicClient({
    chain: chainId === ETH_SEPOLIA_CHAIN_ID ? sepolia : arbitrumSepolia,
    transport: http(RPC_URLS[chainId]),
  })
  const result: any[] = VAULTS.filter(v => v.chainId === chainId).map(v => {
    return {
      ...v,
      metadata: {
        vaultName: v.vault.name ? v.vault.name : undefined,
        creator: v.creator,
        feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
        optionalMetadata: {
          protocol: {
            name: "",
            description: ""
          },
          resolver: ""
        },
      }
    }
  })

  const res1 = await client.multicall({
    contracts: result.map((vault: any) => prepareVaultContract(vault.address, vault.asset.address, account)).flat(),
    allowFailure: false,
    multicallAddress: chainId === ETH_SEPOLIA_CHAIN_ID ? "0xcA11bde05977b3631167028862bE2a173976CA11" : "0xcA11bde05977b3631167028862bE2a173976CA11"
  })

  result.forEach(async (vault, i) => {
    if (i > 0) i = i * 4
    const totalAssets = Number(res1[i]);
    const totalSupply = Number(res1[i + 1])
    const assetsPerShare = totalSupply > 0 ? (totalAssets + 1) / (totalSupply + (1e9)) : Number(1e-9)
    const assetPrice = 1;
    const pricePerShare = assetsPerShare * assetPrice

    vault.assetPrice = assetPrice;
    vault.pricePerShare = pricePerShare;
    vault.tvl = (totalSupply * pricePerShare) / (10 ** vault.asset.decimals)
    vault.vault.price = pricePerShare * 1e9; // @dev normalize vault price for previews (watch this if errors occur)
    vault.asset.price = assetPrice;

    vault.totalAssets = totalAssets;
    vault.totalSupply = totalSupply;
    vault.assetsPerShare = assetsPerShare;
    vault.depositLimit = Number(maxUint256)

    if (account !== zeroAddress) {
      vault.vault.balance = Number(res1[i + 2]);
      vault.asset.balance = Number(res1[i + 3]);
    }

    const gaugeData = await getGaugeData(vault.gauge.address, vault.gauge?.childGauge);
    const boostApy = await calculateGaugeApr(gaugeData);

    vault.apy = 0;
    vault.gaugeMinApy = boostApy.lowerAPR
    vault.gaugeMaxApy = boostApy.upperAPR
    vault.totalApy = boostApy.upperAPR;
  })
  return result as unknown as VaultData[]
}

function VePopContainer() {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();

  const { data: walletClient } = useWalletClient()

  const { data: veBal } = useBalance({ chainId: ETH_SEPOLIA_CHAIN_ID, address: account, token: VOTING_ESCROW, watch: true })
  //const veBal = ZERO
  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [vaults, setVaults] = useState<VaultData[]>([])
  const [initialVotes, setInitialVotes] = useState<{ [key: Address]: number }>({});
  const [votes, setVotes] = useState<{ [key: Address]: number }>({});
  const [canCastVote, setCanCastVote] = useState<boolean>(false);
  const [canVoteOnGauges, setCanVoteOnGauges] = useState<boolean[]>([]);

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);
  const [showOptionTokenModal, setShowOptionTokenModal] = useState(false);
  const [showLpModal, setShowLpModal] = useState(false);

  useEffect(() => {
    async function initialSetup() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      const ethVaults: VaultData[] = await getVaults({ client: ETH_CLIENT, account: account || zeroAddress, chainId: ETH_SEPOLIA_CHAIN_ID })
      const arbVaults: VaultData[] = await getVaults({ client: ARB_CLIENT, account: account || zeroAddress, chainId: ARB_SEPOLIA_CHAIN_ID })

      const _vaults: VaultData[] = [...ethVaults, ...arbVaults]

      if (_vaults.length > 0 && Object.keys(votes).length === 0) {
        const initialVotes: { [key: Address]: number } = {}
        const voteUserSlopesData = await voteUserSlopes({
          gaugeAddresses: _vaults?.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient: ETH_CLIENT,
          account: account as Address
        });
        _vaults.forEach((vault, index) => {
          // @ts-ignore
          initialVotes[vault.gauge?.address] = Number(voteUserSlopesData[index].power)
        })
        setInitialVotes(initialVotes);
        setVotes(initialVotes);

        const { canCastVote, canVoteOnGauges } = await hasAlreadyVoted({
          addresses: _vaults.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient: ETH_CLIENT,
          account: account as Address
        })
        setCanVoteOnGauges(canVoteOnGauges);
        setCanCastVote(!!account && Number(veBal?.value) > 0 && canCastVote)
      }
      setVaults(_vaults)
    }
    if (account && vaults.length === 0) initialSetup();
    // if (!account && !initalLoad && vaults.length === 0) initialSetup();
    // if (account && !accountLoad && !!veBal && vaults.length === 0) initialSetup()
  }, [account, initalLoad, accountLoad, vaults])

  function handleVotes(val: number, index: Address) {
    const updatedVotes = { ...votes };
    const updatedTotalVotes = Object.values(updatedVotes).reduce((a, b) => a + b, 0) - updatedVotes[index] + val;

    if (updatedTotalVotes <= 10000) {
      // TODO should we adjust the val to the max possible value if it exceeds 10000?
      updatedVotes[index] = val;
    }

    setVotes((prevVotes) => updatedVotes);
  }

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_CHAINS);
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(value: string) {
    setSearchTerm(value)
  }

  console.log(vaults)

  return (
    <>
      <LockModal show={[showLockModal, setShowLockModal]} setShowLpModal={setShowLpModal} />
      <ManageLockModal show={[showMangementModal, setShowMangementModal]} setShowLpModal={setShowLpModal} />
      <OptionTokenModal show={[showOptionTokenModal, setShowOptionTokenModal]} />
      <LpModal show={[showLpModal, setShowLpModal]} />
      <div className="static">
        <section className="py-10 px-4 md:px-8 border-t md:border-t-0 md:border-b border-[#353945] lg:flex lg:flex-row items-center justify-between text-primary">
          <div className="lg:w-[1050px]">
            <h1 className="text-2xl md:text-3xl font-normal">
              Lock <span className="text-[#DFFF1C] font-bold md:font-normal md:underline md:decoration-solid">20WETH-80VCX</span> for veVCX, Rewards, and Voting Power
            </h1>
            <p className="text-base text-primary opacity-80 mt-4">
              Vote with your veVCX below to influence how much $oVCX each pool will receive.
            </p>
            <p className="text-base text-primary opacity-80">
              Your vote will persist until you change it and editing a pool can only be done once every 10 days.
            </p>
          </div>
        </section>

        <section className="text-white px-4 md:px-8 py-10 bg-gray-700">
          <p>This test runs on eth-sepolia and arb-sepolia. When refering to eth or arb on this page the two testnets are meant.</p>
          <div className="mt-4">
            <p>ETH:</p>
            <p>Faucet: <a className="text-blue-500" href="https://faucet.quicknode.com/ethereum/sepolia" target="_blank">Here</a></p>
            <div className="flex flex-row space-x-4">
              <SecondaryActionButton
                label="Mint eth mWETH"
                // @ts-ignore
                handleClick={() => mintMockToken({ account, address: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF", decimals: 18, chainId: ETH_SEPOLIA_CHAIN_ID, publicClient: ETH_CLIENT, walletClient })}
              />
              <SecondaryActionButton
                label="Mint eth mDAI"
                // @ts-ignore
                handleClick={() => mintMockToken({ account, address: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241", decimals: 18, chainId: ETH_SEPOLIA_CHAIN_ID, publicClient: ETH_CLIENT, walletClient })}
              />
              <SecondaryActionButton
                label="Mint eth mUSDC"
                // @ts-ignore
                handleClick={() => mintMockToken({ account, address: "0xD33275AEBc80a988c418B149598E693C4A203677", decimals: 6, chainId: ETH_SEPOLIA_CHAIN_ID, publicClient: ETH_CLIENT, walletClient })}
              />
            </div>
            <div className="w-1/3 pr-3 mt-4">
              <MainActionButton
                label="Mint lock token"
                // @ts-ignore
                handleClick={() => mintMockToken({ account, address: "0x417755cDB723ddA17C781208bdAe81E7e9427398", decimals: 18, chainId: ETH_SEPOLIA_CHAIN_ID, publicClient: ETH_CLIENT, walletClient })}
              />
            </div>
          </div>
          <div className="mt-4">
            <p>ARB:</p>
            <p>Faucet: <a className="text-blue-500" href="https://faucet.quicknode.com/arbitrum/sepolia" target="_blank">Here</a></p>
            <div className="flex flex-row space-x-4">
              <SecondaryActionButton
                label="Mint arb mWETH"
                // @ts-ignore
                handleClick={() => mintMockToken({ account, address: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF", decimals: 18, chainId: ARB_SEPOLIA_CHAIN_ID, publicClient: ARB_CLIENT, walletClient })}
              />
              <SecondaryActionButton
                label="Mint arb mDAI"
                // @ts-ignore
                handleClick={() => mintMockToken({ account, address: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241", decimals: 18, chainId: ARB_SEPOLIA_CHAIN_ID, publicClient: ARB_CLIENT, walletClient })}
              />
              <SecondaryActionButton
                label="Mint arb mUSDC"
                // @ts-ignore
                handleClick={() => mintMockToken({ account, address: "0xD33275AEBc80a988c418B149598E693C4A203677", decimals: 6, chainId: ARB_SEPOLIA_CHAIN_ID, publicClient: ARB_CLIENT, walletClient })}
              />
            </div>
          </div>
        </section>

        <section className="pb-12 md:py-10 px-4 md:px-8 md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-8">
          <StakingInterface setShowLockModal={setShowLockModal} setShowMangementModal={setShowMangementModal} setShowLpModal={setShowLpModal} />
          <OptionTokenInterface
            gauges={vaults?.length > 0 ? vaults.filter(vault => !!vault.gauge?.address).map((vault: VaultData) => vault.gauge as Token) : []}
            setShowOptionTokenModal={setShowOptionTokenModal}
          />
        </section >

        <section className="my-10 px-4 md:px-8 md:flex flex-row items-center justify-between">
          <NetworkFilter supportedNetworks={SUPPORTED_CHAINS} selectNetwork={() => { }} />
          <div className="flex flex-row space-x-4">
            <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
            <VaultsSorting className="" vaultState={[vaults, setVaults]} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8 mb-8">
          {vaults?.length > 0 ?
            vaults.filter(vault => selectedNetworks.includes(vault.chainId))
              .filter(vault => !!vault.gauge?.address)
              .map((vault: VaultData, index: number) =>
                <Gauge
                  key={`${vault.address}-${vault.chainId}`}
                  vaultData={vault}
                  index={vault.gauge?.address as Address}
                  votes={votes}
                  handleVotes={handleVotes}
                  canVote={canVoteOnGauges[index]}
                  searchTerm={searchTerm}
                />
              )
            : <p className="text-primary">Loading Gauges...</p>
          }
        </section>
        <div className="w-full border-t border-gray-500 mt-8 px-4 md:px-8">
          <p className="text-white my-4">Deposit</p>
          <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {vaults?.length > 0 ?
              vaults.filter(vault => selectedNetworks.includes(vault.chainId))
                .map((vault: VaultData, index: number) =>
                  <SmartVault
                    key={`sv-${vault.address}-${vault.chainId}`}
                    vaultData={vault}
                    mutateTokenBalance={() => { }}
                    searchTerm={searchTerm}
                    description={undefined}
                  />
                )
              : <p className="text-primary">Loading Vaults...</p>
            }
          </section>
        </div>

        <div className="fixed left-0 bottom-10 w-full">

          <div className="z-10 mx-auto w-60 md:w-104 bg-[#23262F] px-6 py-4 rounded-lg flex flex-col md:flex-row items-center justify-between text-white border border-[#353945]">
            <p className="mt-1">
              Voting power used: <span className="font-bold">
                {
                  veBal && veBal.value && Object.keys(votes).length > 0
                    ? (Object.values(votes).reduce((a, b) => a + b, 0) / 100).toFixed(2)
                    : "0"
                }%
              </span>
            </p>
            <div className="mt-4 md:mt-0 w-40">
              <MainActionButton
                label="Cast Votes"
                disabled={!canCastVote}
                handleClick={() => sendVotes({
                  vaults,
                  votes,
                  prevVotes: initialVotes,
                  account: account as Address,
                  clients: { publicClient, walletClient: walletClient as WalletClient },
                  canVoteOnGauges
                })}
              />
            </div>
          </div>

        </div>

      </div>
    </>
  )
}

export default function VeVCX() {
  // @ts-ignore
  return <NoSSR><VePopContainer /></NoSSR>
}


function votingPeriodEnd(): number[] {
  const periodEnd = getVotePeriodEndTime();
  const interval = { start: new Date(), end: periodEnd };
  const timeUntilEnd = intervalToDuration(interval);
  const formattedTime = [
    (timeUntilEnd.days || 0) % 7,
    timeUntilEnd.hours || 0,
    timeUntilEnd.minutes || 0,
    timeUntilEnd.seconds || 0,
  ];
  return formattedTime;
}

interface StakingInterfaceProps {
  setShowLockModal: Function;
  setShowMangementModal: Function;
  setShowLpModal: Function;
}

export function StakingInterface({ setShowLockModal, setShowMangementModal, setShowLpModal }: StakingInterfaceProps): JSX.Element {
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()

  const { data: lockedBal } = useLockedBalanceOf({ chainId: ETH_SEPOLIA_CHAIN_ID, address: VOTING_ESCROW, account: account as Address })
  const { data: veBal } = useBalance({ chainId: ETH_SEPOLIA_CHAIN_ID, address: account, token: VOTING_ESCROW, watch: true })
  const { data: LpBal } = useBalance({ chainId: ETH_SEPOLIA_CHAIN_ID, address: account, token: WETH_VCX_LP, watch: true })

  return (
    <>
      <div className="w-full lg:w-1/2 bg-transparent border border-[#353945] rounded-3xl p-8 text-primary">
        <h3 className="text-2xl pb-6 border-b border-[#353945]">veVCX</h3>
        <div className="flex flex-col mt-6 gap-4">
          <span className="flex flex-row items-center justify-between">
            <p className="">My VCX-LP</p>
            <p className="font-bold">{NumberFormatter.format(Number(formatEther(LpBal?.value || ZERO))) || "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="">My Locked VCX-LP</p>
            <p className="font-bold">{lockedBal ? NumberFormatter.format(Number(formatEther(lockedBal?.amount))) : "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="">Locked Until</p>
            <p className="font-bold">{lockedBal && lockedBal?.end.toString() !== "0" ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString() : "-"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="">My veVCX</p>
            <p className="font-bold">{NumberFormatter.format(Number(formatEther(veBal?.value || ZERO))) || "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between pb-6 border-b border-[#353945]">
            <p className="">Voting period ends</p>
            <p className="font-bold">{votingPeriodEnd()[0]}d : {votingPeriodEnd()[1]}h<span className="hidden lg:inline">: {votingPeriodEnd()[2]}m</span></p>
          </span>
        </div>
        <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6 lg:max-h-12">
          {Number(lockedBal?.amount) === 0 ?
            <MainActionButton label="Lock VCX-LP" handleClick={() => setShowLockModal(true)} /> :
            <MainActionButton label="Manage Stake" handleClick={() => setShowMangementModal(true)} />
          }
          <SecondaryActionButton label="Get VCX-LP" handleClick={() => setShowLpModal(true)} />
        </div>
        <div className="mt-4">
          {Number(lockedBal?.amount) > 0 &&
            <MainActionButton
              label="Broadcast VeBalance"
              // @ts-ignore
              handleClick={() => broadcastVeBalance({ account, address: VE_BEACON, publicClient: ETH_CLIENT, walletClient })}
            />
          }
        </div>
      </div>
    </>
  )
}

interface OptionTokenInterfaceProps {
  gauges: Token[];
  setShowOptionTokenModal: Function;
}

export function OptionTokenInterface({ gauges, setShowOptionTokenModal }: OptionTokenInterfaceProps): JSX.Element {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const { data: oBalEth } = useBalance({ chainId: ETH_SEPOLIA_CHAIN_ID, address: account, token: OVCX, watch: true })
  const { data: oBalArb } = useBalance({ chainId: ARB_SEPOLIA_CHAIN_ID, address: account, token: "0x14Fd0C07234bF22B90eC9d68995799a9EdCD35b7", watch: true })

  const [vcxPrice, setVcxPrice] = useState<number>(0)

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>()

  useEffect(() => {
    async function getValues() {
      setVcxPrice(await getTokenPrice("0xcE246eEa10988C495B4A90a905Ee9237a0f91543"))
      const ethRewards = await getGaugeRewards({
        gauges: gauges.filter(gauge => gauge.chainId === ETH_SEPOLIA_CHAIN_ID).map(gauge => gauge.address) as Address[],
        account: account as Address,
        chainId: ETH_SEPOLIA_CHAIN_ID,
        publicClient
      })
      const arbRewards = await getGaugeRewards({
        gauges: gauges.filter(gauge => gauge.chainId === ARB_SEPOLIA_CHAIN_ID).map(gauge => gauge.address) as Address[],
        account: account as Address,
        chainId: ARB_SEPOLIA_CHAIN_ID,
        publicClient
      })
      setGaugeRewards({ total: ethRewards.total + arbRewards.total, amounts: [...ethRewards.amounts, ...arbRewards.amounts] })
    }
    if (account && gauges.length > 0) getValues()
  }, [gauges, account])

  return (
    <div className="w-full lg:w-1/2 bg-transparent border border-[#353945] rounded-3xl p-8 text-primary md:h-fit">
      <h3 className="text-2xl pb-6 border-b border-[#353945]">oVCX</h3>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">Claimable ETH oVCX</p>
        <p className="font-bold">{`$${gaugeRewards && vcxPrice > 0 ? NumberFormatter.format(Number(gaugeRewards?.total) * (vcxPrice * 0.25) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My ETH oVCX</p>
        <p className="font-bold">{`$${oBalEth && vcxPrice > 0 ? NumberFormatter.format(Number(oBalEth?.value) * (vcxPrice * 0.25) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">Claimable ARB oVCX</p>
        <p className="font-bold">{`$${gaugeRewards && vcxPrice > 0 ? NumberFormatter.format(Number(gaugeRewards?.total) * (vcxPrice * 0.25) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My ARB oVCX</p>
        <p className="font-bold">{`$${oBalArb && vcxPrice > 0 ? NumberFormatter.format(Number(oBalArb?.value) * (vcxPrice * 0.25) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6 pb-6 border-b border-[#353945]">
      </span>
      <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6 lg:max-h-12">
        <MainActionButton
          label="Claim ETH oVCX"
          handleClick={() =>
            claimOPop({
              gauges: gaugeRewards?.amounts?.filter(gauge => gauge.chainId === ETH_SEPOLIA_CHAIN_ID).filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
              account: account as Address,
              minter: MINTER,
              clients: { publicClient, walletClient: walletClient as WalletClient }
            })}
          disabled={gaugeRewards ? Number(gaugeRewards?.total) === 0 : true}
        />
        <MainActionButton label="Claim ARB oVCX"
          handleClick={() =>
            claimOPop({
              gauges: gaugeRewards?.amounts?.filter(gauge => gauge.chainId === ARB_SEPOLIA_CHAIN_ID).filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
              account: account as Address,
              minter: "0x690772e7EeD4a15E12d71968B8C615890AAbb455", // Child Gauge Factory
              clients: { publicClient, walletClient: walletClient as WalletClient }
            })}
          disabled={gaugeRewards ? Number(gaugeRewards?.total) === 0 : true} />
      </div>
      <div className="mt-4">
        <SecondaryActionButton
          label="Transmit Rewards"
          handleClick={() =>
            transmitRewards({
              account: account as Address,
              address: "0x690772e7EeD4a15E12d71968B8C615890AAbb455", // Root Child Gauge Factory
              publicClient: ETH_CLIENT,
              walletClient: walletClient as WalletClient
            })}
        />
      </div>
    </div>
  )
}


const VAULTS = [
  {
    address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
    assetAddress: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
    chainId: ETH_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
      name: "VaultCraft mWETH",
      symbol: "vc-mWETH",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x299E99c253AE9f75fe3c6B7CC1b8D0ee28E8Ebe7",
      name: `MockETH-gauge`,
      symbol: `st-mETH`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ETH_SEPOLIA_CHAIN_ID
    },
    asset: {
      address: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
      name: "Mock ETH",
      symbol: "mETH",
      decimals: 18,
      logoURI: "https://cdn.furucombo.app/assets/img/token/WETH.svg",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
    assetAddress: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
    chainId: ETH_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
      name: "VaultCraft mDAI",
      symbol: "vc-mDAI",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x657a105D164d8Fcf36921C523B94582ab5507a83",
      name: `MockDai-gauge`,
      symbol: `st-mDAI`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ETH_SEPOLIA_CHAIN_ID

    },
    asset: {
      address: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
      name: "Mock DAI",
      symbol: "mDAI",
      decimals: 18,
      logoURI: "https://cdn.furucombo.app/assets/img/token/DAI.png",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
    assetAddress: "0xD33275AEBc80a988c418B149598E693C4A203677",
    chainId: ETH_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
      name: "VaultCraft mUSDC",
      symbol: "vc-mUSDC",
      decimals: 15,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x033d13081984E5E02327F901C7268a31ebF14854",
      name: `MockUSDC-gauge`,
      symbol: `st-mUSDC`,
      decimals: 15,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ETH_SEPOLIA_CHAIN_ID

    },
    asset: {
      address: "0xD33275AEBc80a988c418B149598E693C4A203677",
      name: "Mock USDC",
      symbol: "mUSDC",
      decimals: 6,
      logoURI: "https://cdn.furucombo.app/assets/img/token/USDC.png",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
    assetAddress: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
    chainId: ARB_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
      name: "VaultCraft mWETH",
      symbol: "vc-mWETH",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x5D5004850Ad6C2C8bBb16F22E7b45a8a3BbCFd46",
      name: `MockETH-gauge`,
      symbol: `st-mETH`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ARB_SEPOLIA_CHAIN_ID,
      childGauge: "0x5D5004850Ad6C2C8bBb16F22E7b45a8a3BbCFd46"
    },
    asset: {
      address: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
      name: "Mock ETH",
      symbol: "mETH",
      decimals: 18,
      logoURI: "https://cdn.furucombo.app/assets/img/token/WETH.svg",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
    assetAddress: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
    chainId: ARB_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
      name: "VaultCraft mDAI",
      symbol: "vc-mDAI",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0xb689121e9Cb3FDA136FDD25A32DF1C6a49564528",
      name: `MockDai-gauge`,
      symbol: `st-mDAI`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ARB_SEPOLIA_CHAIN_ID,
      childGauge: "0xb689121e9Cb3FDA136FDD25A32DF1C6a49564528"
    },
    asset: {
      address: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
      name: "Mock DAI",
      symbol: "mDAI",
      decimals: 18,
      logoURI: "https://cdn.furucombo.app/assets/img/token/DAI.png",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
    assetAddress: "0xD33275AEBc80a988c418B149598E693C4A203677",
    chainId: ARB_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
      name: "VaultCraft mUSDC",
      symbol: "vc-mUSDC",
      decimals: 15,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0xc809007A1e62F6F938076c9Bc67E07191E10114d",
      name: `MockUSDC-gauge`,
      symbol: `st-mUSDC`,
      decimals: 15,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ARB_SEPOLIA_CHAIN_ID,
      childGauge: "0xc809007A1e62F6F938076c9Bc67E07191E10114d"
    },
    asset: {
      address: "0xD33275AEBc80a988c418B149598E693C4A203677",
      name: "Mock USDC",
      symbol: "mUSDC",
      decimals: 6,
      logoURI: "https://cdn.furucombo.app/assets/img/token/USDC.png",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  }
]


const VeBeaconAbi = [{ "inputs": [{ "internalType": "contract IVotingEscrow", "name": "votingEscrow_", "type": "address" }, { "internalType": "address", "name": "recipientAddress_", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "UniversalBridgeLib__ChainIdNotSupported", "type": "error" }, { "inputs": [], "name": "UniversalBridgeLib__GasLimitTooLarge", "type": "error" }, { "inputs": [], "name": "UniversalBridgeLib__MsgValueNotSupported", "type": "error" }, { "inputs": [], "name": "VeBeacon__UserNotInitialized", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "chainId", "type": "uint256" }], "name": "BroadcastVeBalance", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "uint256", "name": "gasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "maxFeePerGas", "type": "uint256" }], "name": "broadcastVeBalance", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256[]", "name": "chainIdList", "type": "uint256[]" }, { "internalType": "uint256", "name": "gasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "maxFeePerGas", "type": "uint256" }], "name": "broadcastVeBalanceMultiple", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "userList", "type": "address[]" }, { "internalType": "uint256[]", "name": "chainIdList", "type": "uint256[]" }, { "internalType": "uint256", "name": "gasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "maxFeePerGas", "type": "uint256" }], "name": "broadcastVeBalanceMultiple", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "uint256", "name": "gasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "maxFeePerGas", "type": "uint256" }], "name": "getRequiredMessageValue", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "recipientAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "votingEscrow", "outputs": [{ "internalType": "contract IVotingEscrow", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }] as const


const RootGaugeFactoryAbi = [{ "name": "BridgerUpdated", "inputs": [{ "name": "_chain_id", "type": "uint256", "indexed": true }, { "name": "_old_bridger", "type": "address", "indexed": false }, { "name": "_new_bridger", "type": "address", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "DeployedGauge", "inputs": [{ "name": "_implementation", "type": "address", "indexed": true }, { "name": "_chain_id", "type": "uint256", "indexed": true }, { "name": "_vault", "type": "address", "indexed": false }, { "name": "_gauge", "type": "address", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "TransferOwnership", "inputs": [{ "name": "_old_owner", "type": "address", "indexed": false }, { "name": "_new_owner", "type": "address", "indexed": false }], "anonymous": false, "type": "event" }, { "name": "UpdateImplementation", "inputs": [{ "name": "_old_implementation", "type": "address", "indexed": false }, { "name": "_new_implementation", "type": "address", "indexed": false }], "anonymous": false, "type": "event" }, { "stateMutability": "nonpayable", "type": "constructor", "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_implementation", "type": "address" }], "outputs": [] }, { "stateMutability": "payable", "type": "function", "name": "transmit_emissions", "inputs": [{ "name": "_gauge", "type": "address" }], "outputs": [] }, { "stateMutability": "payable", "type": "function", "name": "transmit_emissions_multiple", "inputs": [{ "name": "_gauge_list", "type": "address[]" }], "outputs": [] }, { "stateMutability": "payable", "type": "function", "name": "deploy_gauge", "inputs": [{ "name": "_chain_id", "type": "uint256" }, { "name": "_vault", "type": "address" }, { "name": "_relative_weight_cap", "type": "uint256" }], "outputs": [{ "name": "", "type": "address" }] }, { "stateMutability": "nonpayable", "type": "function", "name": "set_bridger", "inputs": [{ "name": "_chain_id", "type": "uint256" }, { "name": "_bridger", "type": "address" }], "outputs": [] }, { "stateMutability": "nonpayable", "type": "function", "name": "set_implementation", "inputs": [{ "name": "_implementation", "type": "address" }], "outputs": [] }, { "stateMutability": "nonpayable", "type": "function", "name": "commit_transfer_ownership", "inputs": [{ "name": "_future_owner", "type": "address" }], "outputs": [] }, { "stateMutability": "nonpayable", "type": "function", "name": "accept_transfer_ownership", "inputs": [], "outputs": [] }, { "stateMutability": "view", "type": "function", "name": "get_bridger", "inputs": [{ "name": "arg0", "type": "uint256" }], "outputs": [{ "name": "", "type": "address" }] }, { "stateMutability": "view", "type": "function", "name": "get_implementation", "inputs": [], "outputs": [{ "name": "", "type": "address" }] }, { "stateMutability": "view", "type": "function", "name": "get_gauge", "inputs": [{ "name": "arg0", "type": "uint256" }, { "name": "arg1", "type": "uint256" }], "outputs": [{ "name": "", "type": "address" }] }, { "stateMutability": "view", "type": "function", "name": "get_gauge_count", "inputs": [{ "name": "arg0", "type": "uint256" }], "outputs": [{ "name": "", "type": "uint256" }] }, { "stateMutability": "view", "type": "function", "name": "is_valid_gauge", "inputs": [{ "name": "arg0", "type": "address" }], "outputs": [{ "name": "", "type": "bool" }] }, { "stateMutability": "view", "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address" }] }, { "stateMutability": "view", "type": "function", "name": "future_owner", "inputs": [], "outputs": [{ "name": "", "type": "address" }] }] as const;
import NoSSR from "react-no-ssr";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { Address, WalletClient } from "viem";
import { useEffect, useState } from "react";
import { getVeAddresses } from "@/lib/constants";
import { hasAlreadyVoted } from "@/lib/gauges/hasAlreadyVoted";
import { Token, VaultData } from "@/lib/types";
import StakingInterface from "@/components/boost/StakingInterface";
import { sendVotes } from "@/lib/gauges/interactions";
import Gauge from "@/components/boost/Gauge";
import LockModal from "@/components/boost/modals/lock/LockModal";
import ManageLockModal from "@/components/boost/modals/manage/ManageLockModal";
import OptionTokenModal from "@/components/boost/modals/optionToken/OptionTokenModal";
import MainActionButton from "@/components/button/MainActionButton";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import OptionTokenInterface from "@/components/boost/OptionTokenInterface";
import LpModal from "@/components/boost/modals/lp/LpModal";
import { voteUserSlopes } from "@/lib/gauges/useGaugeWeights";
import NetworkFilter from "@/components/network/NetworkFilter";
import SearchBar from "@/components/input/SearchBar";
import VaultsSorting from "@/components/vault/VaultsSorting";
import useNetworkFilter from "@/lib/useNetworkFilter";

const { VotingEscrow: VOTING_ESCROW } = getVeAddresses();

const HIDDEN_VAULTS = [
  // eth
  "0xdC266B3D2c62Ce094ff4E12DC52399c430283417", // pCVX
  "0x6B2c5ef7FB59e6A1Ad79a4dB65234fb7bDDcaD6b", // oeth-lp
  "0xD211486ed1A04A176E588b67dd3A30a7dE164C0B", // 50 aura
  "0x4658eC64b99cAd7F939b3bf87c345738A04310A9", // mim
  "0xDCd86dDDE7B49C46292Aa7B699b10BF98248D4b5", // yCRV
]

function VePopContainer() {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const { data: veBal } = useBalance({ chainId: 1, address: account, token: VOTING_ESCROW, watch: true })

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [vaults, setVaults] = useAtom(vaultsAtom)
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

      const vaultsWithGauges = vaults.filter(vault => !!vault.gauge)
      setVaults(vaultsWithGauges);

      if (vaultsWithGauges.length > 0 && Object.keys(votes).length === 0 && publicClient.chain.id === 1) {
        const initialVotes: { [key: Address]: number } = {}
        const voteUserSlopesData = await voteUserSlopes({
          gaugeAddresses: vaultsWithGauges?.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient,
          account: account as Address
        });
        vaultsWithGauges.forEach((vault, index) => {
          // @ts-ignore
          initialVotes[vault.gauge?.address] = Number(voteUserSlopesData[index].power)
        })
        setInitialVotes(initialVotes);
        setVotes(initialVotes);

        const { canCastVote, canVoteOnGauges } = await hasAlreadyVoted({
          addresses: vaultsWithGauges?.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient,
          account: account as Address
        })
        setCanVoteOnGauges(canVoteOnGauges);
        setCanCastVote(!!account && Number(veBal?.value) > 0 && canCastVote)
      }
    }
    if (!account && !initalLoad && vaults.length > 0) initialSetup();
    if (account && !accountLoad && !!veBal && vaults.length > 0) initialSetup()
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

  const [selectedNetworks, selectNetwork] = useNetworkFilter([1]);
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(value: string) {
    setSearchTerm(value)
  }

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

        <section className="pb-12 md:py-10 px-4 md:px-8 md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-8">
          <StakingInterface setShowLockModal={setShowLockModal} setShowMangementModal={setShowMangementModal} setShowLpModal={setShowLpModal} />
          <OptionTokenInterface
            gauges={vaults?.length > 0 ? vaults.filter(vault => !!vault.gauge?.address).map((vault: VaultData) => vault.gauge as Token) : []}
            setShowOptionTokenModal={setShowOptionTokenModal}
          />
        </section >

        <section className="my-10 px-4 md:px-8 md:flex flex-row items-center justify-between">
          <NetworkFilter supportedNetworks={[1]} selectNetwork={() => { }} />
          <div className="flex flex-row space-x-4">
            <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
            <VaultsSorting className="" vaultState={[vaults, setVaults]} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8">
          {vaults?.length > 0 ?
            vaults.filter(vault => selectedNetworks.includes(vault.chainId))
              .filter(vault => !!vault.gauge?.address)
              .filter(vault => !HIDDEN_VAULTS.includes(vault.address))
              .sort((a, b) => b.tvl - a.tvl)
              .map((vault: VaultData, index: number) =>
                <Gauge
                  key={vault.address}
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

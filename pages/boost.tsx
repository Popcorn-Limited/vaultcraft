import NoSSR from "react-no-ssr";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { Address, WalletClient } from "viem";
import { useEffect, useState } from "react";
import { VoteData, hasAlreadyVoted } from "@/lib/gauges/hasAlreadyVoted";
import { AddressesByChain, VaultData } from "@/lib/types";
import StakingInterface from "@/components/boost/StakingInterface";
import { sendVotes } from "@/lib/gauges/interactions";
import Gauge from "@/components/boost/Gauge";
import LockModal from "@/components/boost/modals/lock/LockModal";
import ManageLockModal from "@/components/boost/modals/manage/ManageLockModal";
import OptionTokenExerciseModal from "@/components/optionToken/exercise/OptionTokenExerciseModal";
import MainActionButton from "@/components/button/MainActionButton";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import OptionTokenInterface from "@/components/optionToken/OptionTokenInterface";
import LpModal from "@/components/boost/modals/lp/LpModal";
import { voteUserSlopes } from "@/lib/gauges/useGaugeWeights";
import NetworkFilter from "@/components/network/NetworkFilter";
import SearchBar from "@/components/input/SearchBar";
import VaultsSorting from "@/components/vault/VaultsSorting";
import useNetworkFilter from "@/lib/useNetworkFilter";
import { VOTING_ESCROW } from "@/lib/constants";
import Modal from "@/components/modal/Modal";
import BridgeModal from "@/components/bridge/BridgeModal";
import axios from "axios";
import BroadcastVeBalanceInterface from "@/components/boost/modals/manage/BroadcastVeBalanceInterface";

export const GAUGE_NETWORKS = [1, 10, 42161]

async function getHiddenGauges(): Promise<AddressesByChain> {
  const result: AddressesByChain = {}
  await Promise.all(
    GAUGE_NETWORKS.map(async (chain) => {
      const res = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/gauges/hidden/${chain}.json`
      )
      result[chain] = res.data
    })
  )
  return result;
}



function VePopContainer() {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: veBal } = useBalance({
    chainId: 1,
    address: account,
    token: VOTING_ESCROW,
    watch: true,
  });

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [vaults, setVaults] = useAtom(vaultsAtom);
  const [gaugeVaults, setGaugeVaults] = useState<VaultData[]>([])
  const [initialVotes, setInitialVotes] = useState<{ [key: Address]: number }>(
    {}
  );
  const [votes, setVotes] = useState<{ [key: Address]: number }>({});
  const [canCastVote, setCanCastVote] = useState<boolean>(false);
  const [voteData, setVoteData] = useState<VoteData[]>([]);

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);
  const [showLpModal, setShowLpModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const [hiddenGauges, setHiddenGauges] = useState<AddressesByChain>({})

  useEffect(() => {
    async function initialSetup() {
      setInitalLoad(true);
      if (account) setAccountLoad(true);


      const _hiddenGauges = await getHiddenGauges();
      setHiddenGauges(_hiddenGauges);

      const vaultsWithGauges = Object.values(vaults).flat().filter((vault) => !!vault.gauge)
      setGaugeVaults(vaultsWithGauges);

      if (
        vaultsWithGauges.length > 0 &&
        Object.keys(votes).length === 0 &&
        publicClient.chain.id === 1
      ) {
        const initialVotes: { [key: Address]: number } = {};
        const voteUserSlopesData = await voteUserSlopes({
          gaugeAddresses: vaultsWithGauges?.map(
            (vault: VaultData) => vault.gauge as Address
          ),
          publicClient,
          account: account as Address,
        });
        vaultsWithGauges.forEach((vault, index) => {
          initialVotes[vault.gauge as Address] = Number(
            voteUserSlopesData[index].power
          );
        });
        setInitialVotes(initialVotes);
        setVotes(initialVotes);

        const voteData_ = await hasAlreadyVoted({
          addresses: vaultsWithGauges?.map(
            (vault: VaultData) => vault.gauge as Address
          ),
          publicClient,
          account: account as Address,
        });
        setVoteData(voteData_);
        setCanCastVote(!!account && Number(veBal?.value) > 0);
      }
    }
    if (!account && !initalLoad && Object.keys(vaults).length > 0) initialSetup();
    if (account && !accountLoad && !!veBal && Object.keys(vaults).length > 0) initialSetup();
  }, [account, initalLoad, accountLoad, vaults]);

  function handleVotes(val: number, index: Address) {
    const updatedVotes = { ...votes };
    const updatedTotalVotes =
      Object.values(updatedVotes).reduce((a, b) => a + b, 0) -
      updatedVotes[index] +
      val;

    if (updatedTotalVotes <= 10000) {
      // TODO should we adjust the val to the max possible value if it exceeds 10000?
      updatedVotes[index] = val;
    }

    setVotes((prevVotes) => updatedVotes);
  }

  const [selectedNetworks, selectNetwork] = useNetworkFilter(GAUGE_NETWORKS);
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(value: string) {
    setSearchTerm(value);
  }

  return (
    <>
      <LockModal
        show={[showLockModal, setShowLockModal]}
        setShowLpModal={setShowLpModal}
      />
      <ManageLockModal
        show={[showMangementModal, setShowMangementModal]}
        setShowLpModal={setShowLpModal}
        setShowSyncModal={setShowSyncModal}
      />
      <LpModal show={[showLpModal, setShowLpModal]} />
      <OptionTokenExerciseModal
        show={[showExerciseModal, setShowExerciseModal]}
      />
      <Modal visibility={[showClaimModal, setShowClaimModal]}>
        <OptionTokenInterface />
      </Modal>
      <BridgeModal show={[showBridgeModal, setShowBridgeModal]} />
      <Modal visibility={[showSyncModal, setShowSyncModal]}>
        <BroadcastVeBalanceInterface setShowModal={setShowSyncModal} />
      </Modal>
      <div className="static">
        <section className="py-10 px-4 md:px-8 border-t md:border-t-0 md:border-b border-customNeutral100 lg:flex lg:flex-row items-center justify-between text-white">
          <div className="lg:w-[1050px]">
            <h1 className="text-2xl md:text-3xl font-normal">
              Lock your{" "}
              <span className="text-primaryYellow font-bold md:font-normal md:underline md:decoration-solid">
                VCX LP
              </span>{" "}
              for voting power, XP points, and oVCX multipliers
            </h1>
            <p className="text-base text-white opacity-80 mt-4">
              Vote on which Smart Vaults will receive more oVCX every epoch with veVCX - your locked VCX LP.
            </p>
            <p className="text-base text-white opacity-80">
              You can only vote once every 10 days and your vote persists until you change it.
            </p>
          </div>
        </section>

        <section className="pb-12 md:py-10 px-4 md:px-8 md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-8">
          <StakingInterface
            setShowLockModal={setShowLockModal}
            setShowMangementModal={setShowMangementModal}
            setShowLpModal={setShowLpModal}
            setShowBridgeModal={setShowBridgeModal}
            setShowSyncModal={setShowSyncModal}
          />
          <div className="w-full lg:w-1/2">
            <OptionTokenInterface setShowOptionTokenModal={setShowExerciseModal} />
          </div>
        </section>

        <section className="my-10 px-4 md:px-8 md:flex flex-row items-center justify-between">
          <NetworkFilter supportedNetworks={GAUGE_NETWORKS} selectNetwork={selectNetwork} />
          <div className="flex flex-row space-x-4 mt-4">
            <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
            <VaultsSorting className="" vaultState={[gaugeVaults, setGaugeVaults]} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8">
          {gaugeVaults?.length > 0 ? (
            <>
              {gaugeVaults
                .filter((vault) => selectedNetworks.includes(vault.chainId))
                .filter((vault) => Object.keys(hiddenGauges).length > 0 ? !hiddenGauges[vault.chainId].includes(vault.gauge!) : true)
                .sort((a, b) => b.tvl - a.tvl)
                .map((vault: VaultData, index: number) => (
                  <Gauge
                    key={vault.address}
                    vaultData={vault}
                    index={vault.gauge!}
                    votes={votes}
                    handleVotes={handleVotes}
                    canVote={voteData.find(v => v.gauge === vault.gauge)?.canVote!}
                    searchTerm={searchTerm}
                    deprecated={false}
                  />
                ))}
              {gaugeVaults
                .filter((vault) => selectedNetworks.includes(vault.chainId))
                .filter((vault) => Object.keys(hiddenGauges).length > 0 ? hiddenGauges[vault.chainId].includes(vault.gauge!) : true)
                .sort((a, b) => b.tvl - a.tvl)
                .map((vault: VaultData, index: number) => (
                  <Gauge
                    key={vault.address}
                    vaultData={vault}
                    index={vault.gauge!}
                    votes={votes}
                    handleVotes={handleVotes}
                    canVote={voteData.find(v => v.gauge === vault.gauge)?.canVote!}
                    searchTerm={searchTerm}
                    deprecated={true}
                  />
                ))}
            </>
          ) : (
            <p className="text-white">Loading Gauges...</p>
          )}
        </section>

        <div className="fixed left-0 bottom-10 w-full">
          <div className="z-10 mx-auto w-60 md:w-104 bg-customNeutral200 px-6 py-4 rounded-lg flex flex-col md:flex-row items-center justify-between text-white border border-customNeutral100">
            <p className="mt-1">
              Voting power used:{" "}
              <span className="font-bold">
                {veBal && veBal.value && Object.keys(votes).length > 0
                  ? (
                    Object.values(votes).reduce((a, b) => a + b, 0) / 100
                  ).toFixed(2)
                  : "0"}
                %
              </span>
            </p>
            <div className="mt-4 md:mt-0 w-40">
              <MainActionButton
                label="Cast Votes"
                disabled={!canCastVote}
                handleClick={() =>
                  sendVotes({
                    vaults: gaugeVaults,
                    votes,
                    prevVotes: initialVotes,
                    account: account as Address,
                    clients: {
                      publicClient,
                      walletClient: walletClient!,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VeVCX() {
  // @ts-ignore
  return (
    <NoSSR>
      <VePopContainer />
    </NoSSR>
  );
}

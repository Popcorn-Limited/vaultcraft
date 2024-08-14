import NoSSR from "react-no-ssr";
import "rc-slider/assets/index.css";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useEffect, useState } from "react";
import {
  Address,
  createPublicClient,
  http,
  zeroAddress,
} from "viem";
import { VoteData, hasAlreadyVoted } from "@/lib/gauges/hasAlreadyVoted";
import { AddressesByChain, VaultData } from "@/lib/types";
import StakingInterface from "@/components/boost/StakingInterface";
import { sendVotes } from "@/lib/gauges/interactions";
import LockModal from "@/components/boost/modals/lock/LockModal";
import ManageLockModal from "@/components/boost/modals/manage/ManageLockModal";
import OptionTokenExerciseModal from "@/components/optionToken/exercise/OptionTokenExerciseModal";
import MainActionButton from "@/components/button/MainActionButton";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import OptionTokenInterface from "@/components/optionToken/OptionTokenInterface";
import LpModal from "@/components/boost/modals/lp/LpModal";
import { voteUserSlopes } from "@/lib/gauges/useGaugeWeights";
import { VE_VCX } from "@/lib/constants";
import Modal from "@/components/modal/Modal";
import BridgeModal from "@/components/bridge/BridgeModal";
import axios from "axios";
import BroadcastVeBalanceInterface from "@/components/boost/modals/manage/BroadcastVeBalanceInterface";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { tokensAtom } from "@/lib/atoms";
import ResponsiveTooltip from "@/components/common/Tooltip";
import BoostVaultsTable from "@/components/boost/BoostVaultsTable";
import BoostVaultCard from "@/components/boost/BoostVaultCard";
import useWeeklyEmissions from "@/lib/gauges/useWeeklyEmissions";
import { mainnet } from "viem/chains";
import { RPC_URLS } from "@/lib/utils/connectors";
import Carousel from "@/components/common/Carousel";

export const GAUGE_NETWORKS = [1, 10, 42161];

let hiddenGauges: AddressesByChain = {};
async function getHiddenGauges(): Promise<AddressesByChain> {
  // If we already have the hidden gauges, return them immediately
  if (Object.keys(hiddenGauges).length > 0) return hiddenGauges;

  const result: AddressesByChain = {};
  await Promise.all(
    GAUGE_NETWORKS.map(async (chain) => {
      const res = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/gauges/hidden/${chain}.json`
      );
      result[chain] = res.data;
    })
  );
  hiddenGauges = result;
  return result;
}

function VePopContainer() {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [tokens] = useAtom(tokensAtom);

  const weeklyEmissions = useWeeklyEmissions();

  const [vaults] = useAtom(vaultsAtom);
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

  const [hiddenGauges, setHiddenGauges] = useState<AddressesByChain>({});

  useEffect(() => {
    async function initialSetup() {
      const _hiddenGauges = await getHiddenGauges();
      setHiddenGauges(_hiddenGauges);

      const vaultsWithGauges = Object.values(vaults)
        .flat()
        .filter((vault) => vault.gauge !== zeroAddress);
      setGaugeVaults(vaultsWithGauges);

      const client = await createPublicClient({
        chain: mainnet,
        transport: http(RPC_URLS[1]),
      })

      const initialVotes: { [key: Address]: number } = {};
      const voteUserSlopesData = await voteUserSlopes({
        gaugeAddresses: vaultsWithGauges?.map(
          (vault: VaultData) => vault.gauge as Address
        ),
        publicClient: client,
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
        publicClient: client,
        account: account as Address,
      });
      setVoteData(voteData_);
      setCanCastVote(!!account && tokens[1][VE_VCX].balance > 0);
    }
    if (Object.keys(tokens).length > 0 && Object.keys(vaults).length > 0) initialSetup();
  }, [account, vaults]);

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

    setVotes(updatedVotes);
  }

  const selectedNetworks = GAUGE_NETWORKS;

  const formattedVaults = gaugeVaults
    .filter((vault) => selectedNetworks.includes(vault.chainId))
    .sort((a, b) => b.tvl - a.tvl) // Sort by TVL
    .map((vault) => ({
      ...vault,
      isDeprecated: (hiddenGauges ?? {})[vault.chainId]?.includes(vault.gauge!),
    }))
    .sort(({ isDeprecated: a }, { isDeprecated: b }) =>
      // Sort deprecated vaults to the end
      a === b ? 0 : a ? 1 : -1
    );

  return Object.keys(tokens).length > 0 ? (
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
        <Carousel />
        <section className="w-full py-10 px-4 md:px-0 border-t md:border-t-0 md:border-b border-customNeutral100 md:flex md:flex-row items-center justify-between text-white">
          <div className="">
            <h1 className="text-2xl md:text-3xl font-normal">
              Lock your{" "}
              <span className="text-primaryYellow font-bold md:font-normal md:underline md:decoration-solid">
                VCX LP
              </span>{" "}
              for voting power, XP points, and oVCX multipliers
            </h1>
            <p className="text-base text-white opacity-80 mt-4">
              Vote on which Smart Vaults will receive more oVCX every epoch with
              veVCX - your locked VCX LP.
            </p>
            <p className="text-base text-white opacity-80">
              You can only vote once every 10 days and your vote persists until
              you change it.
            </p>
          </div>

          <div>
            <div
              id="rewards-tooltip-inner"
              className="bg-customNeutral200 mt-6 lg:mt-0 cursor-pointer border border-customNeutral100 rounded-lg px-6 py-4"
            >
              <p className="text-base opacity-80 whitespace-nowrap">
                Emissions per week
              </p>
              <div className="flex flex-row items-center justify-between">
                <img
                  src={"/images/tokens/oVcx.svg"}
                  alt="token icon"
                  className="w-6 h-6 object-contain rounded-full"
                />
                <p className="font-bold text-xl">
                  {NumberFormatter.format(weeklyEmissions)} oVCX
                </p>
              </div>
            </div>
            <ResponsiveTooltip
              id="rewards-tooltip-inner"
              content={
                <p className="w-52">
                  oVCX rewards accrue weekly, not daily. Distributions happen
                  post-contract funding. Note: You still earn oVCX even without
                  the boost.
                </p>
              }
            />
          </div>
        </section>

        <section className="pb-12 md:py-10 px-4 md:px-0 md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-8">
          <StakingInterface
            setShowLockModal={setShowLockModal}
            setShowMangementModal={setShowMangementModal}
            setShowLpModal={setShowLpModal}
            setShowBridgeModal={setShowBridgeModal}
            setShowSyncModal={setShowSyncModal}
          />
          <div className="w-full lg:w-1/2">
            <OptionTokenInterface
              setShowOptionTokenModal={setShowExerciseModal}
            />
          </div>
        </section>

        <div className="border-b border-customNeutral100 w-full mb-12" />

        {gaugeVaults?.length > 0 ?
          <>
            <section className="md:hidden px-4 gap-6 md:gap-10">
              {formattedVaults.map((vaultData) => (
                <BoostVaultCard
                  {...vaultData}
                  isVotingAvailable={
                    voteData.find((v) => v.gauge === vaultData.gauge)
                      ?.canVote!
                  }
                  handleVotes={handleVotes}
                  votes={votes}
                  key={`sm-mb-${vaultData.address}`}
                />
              ))}
            </section>
            <div className="hidden md:block">
              <BoostVaultsTable
                handleVotes={handleVotes}
                vaults={formattedVaults}
                voteData={voteData}
                votes={votes}
              />
            </div>
          </>
          : <p className="text-white text-center py-12">Loading Gauges...</p>
        }

        <div className="fixed left-0 bottom-10 w-full">
          <div className="z-10 mx-auto w-60 md:w-104 bg-customNeutral200 px-6 py-4 rounded-lg flex flex-col md:flex-row items-center justify-between text-white border border-customNeutral100">
            <p className="mt-1">
              Voting power used:{" "}
              <span className="font-bold">
                {Object.keys(tokens).length > 0 && Object.keys(votes).length > 0
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
                      publicClient: publicClient!,
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
  )
    : <p className="text-white">Loading...</p>
}

export default function VeVCX() {
  // @ts-ignore
  return (
    <NoSSR>
      <VePopContainer />
    </NoSSR>
  );
}

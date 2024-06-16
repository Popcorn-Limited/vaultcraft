import NoSSR from "react-no-ssr";
import {
  mainnet,
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { Address, WalletClient, createPublicClient, http } from "viem";
import { Fragment, useEffect, useState } from "react";
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

import { TOKEN_ADMIN, TokenAdminAbi, VOTING_ESCROW } from "@/lib/constants";
import Modal from "@/components/modal/Modal";
import BridgeModal from "@/components/bridge/BridgeModal";
import axios from "axios";
import BroadcastVeBalanceInterface from "@/components/boost/modals/manage/BroadcastVeBalanceInterface";
import { RPC_URLS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";

import BoostVaultRow from "@/components/vault/BoostVaultRow";
import ResponsiveTooltip from "@/components/common/Tooltip";

export const GAUGE_NETWORKS = [1, 10, 42161];

async function getHiddenGauges(): Promise<AddressesByChain> {
  const result: AddressesByChain = {};
  await Promise.all(
    GAUGE_NETWORKS.map(async (chain) => {
      const res = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/gauges/hidden/${chain}.json`
      );
      result[chain] = res.data;
    })
  );
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
  const [weeklyEmissions, setWeeklyEmissions] = useState<number>(0);

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [vaults, setVaults] = useAtom(vaultsAtom);
  const [gaugeVaults, setGaugeVaults] = useState<VaultData[]>([]);
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
      setInitalLoad(true);
      if (account) setAccountLoad(true);

      const _hiddenGauges = await getHiddenGauges();
      setHiddenGauges(_hiddenGauges);

      const vaultsWithGauges = Object.values(vaults)
        .flat()
        .filter((vault) => !!vault.gauge);
      setGaugeVaults(vaultsWithGauges);

      const rate = await createPublicClient({
        chain: mainnet,
        transport: http(RPC_URLS[1]),
      }).readContract({
        address: TOKEN_ADMIN,
        abi: TokenAdminAbi,
        functionName: "rate",
      });
      // Emissions per second * seconds per week
      setWeeklyEmissions((Number(rate) / 1e18) * 604800);

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
    if (!account && !initalLoad && Object.keys(vaults).length > 0)
      initialSetup();
    if (account && !accountLoad && !!veBal && Object.keys(vaults).length > 0)
      initialSetup();
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

    setVotes(updatedVotes);
  }

  const selectedNetworks = GAUGE_NETWORKS;

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
              Vote on which Smart Vaults will receive more oVCX every epoch with
              veVCX - your locked VCX LP.
            </p>
            <p className="text-base text-white opacity-80">
              You can only vote once every 10 days and your vote persists until
              you change it.
            </p>
          </div>

          <div
            id="rewards-tooltip-inner"
            className="bg-customNeutral200 cursor-pointer border border-customNeutral100 rounded-lg px-6 py-4"
          >
            <p className="text-base opacity-80">Emissions per week</p>
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
            <OptionTokenInterface
              setShowOptionTokenModal={setShowExerciseModal}
            />
          </div>
        </section>

        <section className="text-white px-4 md:px-8 mt-12 mb-10">
          <h1 className="text-2xl md:text-3xl font-normal">All vaults</h1>
          <p className="text-base opacity-80">
            Zap any asset into Smart Vaults for the best yield for your crypto
            across DeFi
          </p>
        </section>

        {gaugeVaults?.length > 0 ? (
          <Fragment>
            <section className="text-white mt-12 w-full border rounded-xl overflow-hidden border-customNeutral100">
              <table className="w-full [&_td]:h-20 [&_th]:h-18 [&_td]:px-5 [&_th]:px-5">
                <thead className="bg-customNeutral200 border-b border-customNeutral100">
                  <tr>
                    <th />
                    <th className="font-normal text-left whitespace-nowrap">
                      TVL
                    </th>
                    <th className="font-normal text-right whitespace-nowrap">
                      Min Boost
                    </th>
                    <th className="font-normal text-right whitespace-nowrap">
                      Max Boost
                    </th>
                    <th className="font-normal text-right whitespace-nowrap">
                      Current Weight
                    </th>
                    <th className="font-normal text-right whitespace-nowrap">
                      Upcoming Weight
                    </th>
                    <th className="font-normal text-right whitespace-nowrap">
                      Tokens emitted
                    </th>
                    <th className="font-normal text-right whitespace-nowrap">
                      Upcoming Tokens
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gaugeVaults
                    .filter((vault) => selectedNetworks.includes(vault.chainId))
                    .sort((a, b) => b.tvl - a.tvl)
                    .map((vault) => ({
                      ...vault,
                      isDeprecated: (hiddenGauges ?? {})[
                        vault.chainId
                      ]?.includes(vault.gauge!),
                    }))
                    .sort(({ isDeprecated: a }, { isDeprecated: b }) =>
                      // Sort deprecated vaults to the end
                      a === b ? 0 : a ? 1 : -1
                    )
                    .map(
                      (
                        vault: VaultData & {
                          isDeprecated: boolean;
                        }
                      ) => (
                        <BoostVaultRow
                          {...vault}
                          isVotingAvailable={
                            voteData.find((v) => v.gauge === vault.gauge)
                              ?.canVote!
                          }
                          handleVotes={handleVotes}
                          votes={votes}
                          key={`boost-vault-${vault.address}`}
                        />
                      )
                    )}
                </tbody>
              </table>
            </section>
          </Fragment>
        ) : (
          <p className="text-white text-center py-12">Loading Gauges...</p>
        )}

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

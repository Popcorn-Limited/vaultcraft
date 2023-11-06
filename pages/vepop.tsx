// @ts-ignore
import NoSSR from "react-no-ssr";
import { mainnet, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { Address, WalletClient } from "viem";
import { useEffect, useState } from "react";
import { getVeAddresses } from "@/lib/utils/addresses";
import { hasAlreadyVoted } from "@/lib/gauges/hasAlreadyVoted";
import { VaultData } from "@/lib/types";
import { getVaultsByChain } from "@/lib/vaults/getVault";
import StakingInterface from "@/components/vepop/StakingInterface";
import { sendVotes } from "@/lib/gauges/interactions";
import Gauge from "@/components/vepop/Gauge";
import LockModal from "@/components/vepop/modals/lock/LockModal";
import ManageLockModal from "@/components/vepop/modals/manage/ManageLockModal";
import OPopModal from "@/components/vepop/modals/oPop/OPopModal";
import OPopInterface from "@/components/vepop/OPopInterface";
import MainActionButton from "@/components/buttons/MainActionButton";

const { VotingEscrow: VOTING_ESCROW } = getVeAddresses();

function VePopContainer() {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const { data: veBal } = useBalance({ chainId: 1, address: account, token: VOTING_ESCROW, watch: true })

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [votes, setVotes] = useState<number[]>([]);
  const [canVote, setCanVote] = useState<boolean>(false);

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);
  const [showOPopModal, setShowOPopModal] = useState(false);

  useEffect(() => {
    async function initialSetup() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      const allVaults = await getVaultsByChain({ chain: mainnet, account })
      const vaultsWithGauges = allVaults.filter(vault => !!vault.gauge)
      setVaults(vaultsWithGauges);
      if (vaultsWithGauges.length > 0 && votes.length === 0 && publicClient.chain.id === 1) {
        setVotes(vaultsWithGauges.map(gauge => 0));

        const hasVoted = await hasAlreadyVoted({
          addresses: vaultsWithGauges?.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient,
          account: account as Address
        })
        setCanVote(!!account && Number(veBal?.value) > 0 && !hasVoted)
      }
    }
    if (!account && !initalLoad) initialSetup();
    if (account && !accountLoad) initialSetup()
  }, [account])

  function handleVotes(val: number, index: number) {
    const updatedVotes = [...votes];
    const updatedTotalVotes = updatedVotes.reduce((a, b) => a + b, 0) - updatedVotes[index] + val;

    if (updatedTotalVotes <= 10000) {
      // TODO should we adjust the val to the max possible value if it exceeds 10000?
      updatedVotes[index] = val;
    }

    setVotes((prevVotes) => updatedVotes);
  }

  return (
    <>
      <LockModal show={[showLockModal, setShowLockModal]} />
      <ManageLockModal show={[showMangementModal, setShowMangementModal]} />
      <OPopModal show={[showOPopModal, setShowOPopModal]} />
      <div className="static">
        <section className="py-10 px-8 xs:border-t smmd:border-t-0 smmd:border-b border-[#353945] lg:flex lg:flex-row items-center justify-between text-primary">
          <div className="lg:w-[1050px]">
            <h1 className="xs:text-2xl smmd:text-3xl font-normal">
              Lock <span className="text-[#DFFF1C] xs:font-bold smmd:font-normal smmd:underline smmd:decoration-solid">20WETH-80POP</span> for vePOP, Rewards, and Voting Power
            </h1>
            <p className="text-base text-primary opacity-80 mt-4">
              Vote with your vePOP below to influence how much $oPOP each pool will receive.
            </p>
            <p className="text-base text-primary opacity-80">
              Your vote will persist until you change it and editing a pool can only be done once every 10 days.
            </p>
          </div>
        </section>

        <section className="xs:pb-12 smmd:py-10 px-8 md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-8">
          <StakingInterface setShowLockModal={setShowLockModal} setShowMangementModal={setShowMangementModal} />
          <OPopInterface setShowOPopModal={setShowOPopModal} />
        </section >

        <section className="px-8 xs:mb-12 xs:mt-0 smmd:mb-10 smmd:mt-[60px]">
          <h4 className="text-primary text-3xl font-normal mb-2">
            All vaults
          </h4>
          <span className="text-primary">
            Zap any asset into Smart Vaults for the best yield for your crypto across DeFi
          </span>
        </section>

        <section className="flex flex-wrap max-w-[1600px] mx-auto justify-between gap-4 px-8 pb-9">
          {vaults?.length > 0 ? vaults.map((vault: VaultData, index: number) =>
            <Gauge key={vault.address} vaultData={vault} index={index} votes={votes} handleVotes={handleVotes} canVote={canVote} />
          )
            : <p className="text-primary">Loading Gauges...</p>
          }
        </section>

        <section className="md:hidden">
          <p className="text-primary">Gauge Voting not available on mobile.</p>
        </section>

        <div className="hidden md:block fixed left-0 bottom-10 w-full">
          {canVote && <>
            <div className="z-50 mx-auto w-104 bg-[#23262F] px-6 py-4 rounded-lg flex flex-row items-center justify-between text-white border border-white">
              <p className="mt-1">
                Voting power used: <span className="font-bold">
                  {
                    veBal && veBal.value
                      ? (votes?.reduce((a, b) => a + b, 0) / 100).toFixed(2)
                      : "0"
                  }%
                </span>
              </p>
              <div className="w-40">
                <MainActionButton
                  label="Cast Votes"
                  handleClick={() => sendVotes({ vaults, votes, account: account as Address, clients: { publicClient, walletClient: walletClient as WalletClient } })}
                />
              </div>
            </div>
          </>}
        </div>

      </div>
    </>
  )
}

export default function VePOP() {
  return <NoSSR><VePopContainer /></NoSSR>
}

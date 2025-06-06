import Navbar from "@/components/navbar/Navbar";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { GAUGE_NETWORKS, RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import Footer from "@/components/common/Footer";
import { Address, createPublicClient, http, zeroAddress } from "viem";
import Modal from "@/components/modal/Modal";
import MainActionButton from "../button/MainActionButton";
import { gaugeRewardsAtom, loadingProgressAtom, networthAtom, strategiesAtom, tokensAtom, tvlAtom} from "@/lib/atoms";
import { StrategiesByChain, TokenByAddress, TokenType, VaultData } from "@/lib/types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import axios from "axios";
import { VotingEscrowAbi } from "@/lib/constants";
import { mainnet } from "viem/chains";
import { ST_VCX, VCX_LP, VE_VCX } from "@/lib/constants/addresses";
import { formatBalanceUSD } from "@/lib/utils/helpers";
import ProgressBar from "@/components/common/ProgressBar";
import localFont from "next/font/local";

const khTeka = localFont({
  src: '../../public/KH_Teka/KHTeka-Regular.woff',
  variable: '--font-kh-teka'
})

interface TermsModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setTermsSigned: Dispatch<SetStateAction<boolean>>;
}

function TermsModal({
  showModal,
  setShowModal,
  setTermsSigned,
}: TermsModalProps): JSX.Element {
  function handleAccept() {
    setTermsSigned(true);
    setShowModal(false);
    localStorage.setItem("termsAndConditions", String(Number(new Date())));
  }

  return (
    <Modal
      visibility={[showModal, setShowModal]}
      title={<h2 className="text-xl font-bold">Terms and Conditions</h2>}
    >
      <div className="text-start text-white">
        <ul className="list-inside list-disc space-y-4 mb-6 h-[400px] overflow-y-scroll">
          <li>
            VaultCraft is a blockchain-based decentralized finance project. You
            are participating at your own risk.
          </li>
          <li>
            VaultCraft is offered for use “as is” and without any guarantees
            regarding security. The protocol is made up of immutable code and
            can be accessed through a variety of user interfaces.
          </li>
          <li>
            No central entity operates the VaultCraft protocol. Decisions
            related to the protocol are governed by a dispersed group of
            participants who collectively govern and maintain the protocol.
          </li>
          <li>
            VaultCraftDAO does not unilaterally offer, maintain, operate,
            administer, or control any trading interfaces. The only user
            interfaces maintained by VaultCraftDAO are the governance and
            staking interfaces herein.
          </li>
          <li>
            You can participate in the governance process by staking tokens in
            accordance with the rules and parameters summarized
            <a
              className="text-secondaryBlue hover:text-primaryGreen focus:none outline-none"
              href="https://docs.vaultcraft.io/welcome-to-vaultcraft/introduction"
              target="_blank"
            >
              {" "}
              here
            </a>
            , and/or joining the VaultCraft forum and contributing to the
            conversation.
          </li>
          <li>
            The rules and parameters associated with the VaultCraft protocol and
            VaultCraftDAO governance are subject to change at any time.
          </li>
          <li>
            The laws that apply to your use of VaultCraft may vary based upon
            the jurisdiction in which you are located. We strongly encourage you
            to speak with legal counsel in your jurisdiction if you have any
            questions regarding your use of VaultCraft.
          </li>
          <li>
            By entering into this agreement, you are not agreeing to enter into
            a partnership. You understand that VaultCraft is a decentralized
            protocol provided on an “as is” basis.
          </li>
          <li>
            You hereby release all present and future claims against
            VaultCraftDAO related to your use of the protocol, the tokens,
            VaultCraftDAO governance, and any other facet of the protocol.
          </li>
          <li>
            You agree to indemnify and hold harmless VaultCraftDAO and its
            affiliates for any costs arising out of or relating to your use of
            the VaultCraft protocol.
          </li>
          <li>
            You are not accessing the protocol from Burma (Myanmar), Cuba, Iran,
            Sudan, Syria, the Western Balkans, Belarus, Côte d’Ivoire,
            Democratic Republic of the Congo, Iraq, Lebanon, Liberia, Libya,
            North Korea, Russia, certain sanctioned areas of Ukraine, Somalia,
            Venezuela, Yemen, Zimbabwe, or the United States of America
            (collectively, “Prohibited Jurisdictions”), or any other
            jurisdiction listed as a Specially Designated National by the United
            States Office of Foreign Asset Control (“OFAC”).
          </li>
          <li>
            Important Notice: Residents of the USA are expressly prohibited from
            using the app.vaultcraft.io interface. Accessing or using this
            service from the United States of America violates these Terms of
            Service.
          </li>
        </ul>
        <p className="py-6 border-t-2 border-customNeutral100">
          By accepting you agree that you have read and accept the{" "}
          <a
            className="text-secondaryBlue hover:text-primaryGreen focus:none outline-none"
            href="https://app.vaultcraft.io/disclaimer"
            target="_blank"
          >
            {" "}
            Terms & Conditions
          </a>
        </p>
        <MainActionButton label="Accept" handleClick={handleAccept} />
      </div>
    </Modal>
  );
}

export default function Page({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();

  const [progress, setLoadingProgress] = useAtom(loadingProgressAtom);
  const [, setVaults] = useAtom(vaultsAtom);
  const [, setTokens] = useAtom(tokensAtom);
  const [, setStrategies] = useAtom(strategiesAtom);
  const [, setGaugeRewards] = useAtom(gaugeRewardsAtom);
  const [, setTVL] = useAtom(tvlAtom);
  const [, setNetworth] = useAtom(networthAtom);

  useEffect(() => {
    async function getData() {
      console.log(`FETCHING APP DATA (${new Date()})`)
      setLoadingProgress(0);
      const getDataStart = Number(new Date())

      // get vaultsData and tokens
      const newVaultsData: { [key: number]: VaultData[] } = {}
      const newTokens: { [key: number]: TokenByAddress } = {}
      const newStrategies: StrategiesByChain = {}

      console.log(`Fetching Token and Vaults Data (${new Date()})`)
      let start = Number(new Date())

      setLoadingProgress(10);
      await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => {
          console.log(`Fetching Data for chain ${chain.id} (${new Date()})`)
          let chainStart = Number(new Date())

          const { vaultsData, tokens, strategies } = await getTokenAndVaultsDataByChain({
            chain,
            account: account || zeroAddress
          })

          console.log(`Completed fetching Data for chain ${chain.id} (${new Date()})`)
          console.log(`Took ${Number(new Date()) - chainStart}ms to load`)

          newVaultsData[chain.id] = vaultsData
          newTokens[chain.id] = tokens;
          newStrategies[chain.id] = strategies

          setLoadingProgress(prev => prev + (70 / SUPPORTED_NETWORKS.length))
        })
      );

      console.log(`Completed fetching Token and Vaults Data (${new Date()})`)
      console.log(`Took ${Number(new Date()) - start}ms to load`)

      console.log(`Fetching TVL (${new Date()})`)
      start = Number(new Date())

      console.log(newVaultsData)
      const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaultsData[chain.id]).flat().reduce((a, b) => a + (b?.tvl || 0), 0)
      const lockVaultTVL = 520000 // @dev hardcoded since we removed lock vaults
      let stakingTVL = 0
      try {
        stakingTVL = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/api/protocol/vaultcraft`).then(res => res.data.currentChainTvls["staking"])
      } catch (e) {
        stakingTVL = 2590000;
      }

      console.log(`Completed fetching TVL (${new Date()})`)
      console.log(`Took ${Number(new Date()) - start}ms to load`)


      setTVL(prev => ({
        vault: vaultTVL,
        lockVault: lockVaultTVL,
        stake: stakingTVL,
        total: vaultTVL + lockVaultTVL + stakingTVL,
      }));
      setVaults(prev => ({ ...newVaultsData }));
      setTokens(prev => ({ ...newTokens }));
      setStrategies(prev => ({ ...newStrategies }));
      setLoadingProgress(prev => 90)

      if (account) {
        console.log(`Fetching Networth (${new Date()})`)
        start = Number(new Date())

        const vaultNetworth = SUPPORTED_NETWORKS.map(chain =>
          Object.values(newTokens[chain.id])).flat().filter(t => t.type === TokenType.Vault || t.type === TokenType.Gauge)
          .reduce((a, b) => a + Number(b.balance.formattedUSD), 0)
        const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
          Object.values(newTokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
          .reduce((a, b) => a + Number(b.balance.formattedUSD), 0)

        const stake = await createPublicClient({
          chain: mainnet,
          transport: http(RPC_URLS[1]),
        }).readContract({
          address: VE_VCX,
          abi: VotingEscrowAbi,
          functionName: "locked",
          args: [account],
        });

        const stakeNetworth = Number(formatBalanceUSD(stake.amount, 18, newTokens[1][VCX_LP].price)) + Number(newTokens[1][ST_VCX].balance.formattedUSD);
        const lockVaultNetworth = 0; // @dev hardcoded since we removed lock vaults

        console.log(`Completed fetching Networth (${new Date()})`)
        console.log(`Took ${Number(new Date()) - start}ms to load`)


        console.log(`Fetching GaugeRewards (${new Date()})`)
        start = Number(new Date())


        const newRewards: { [key: number]: GaugeRewards } = {}
        await Promise.all(GAUGE_NETWORKS.map(async (chain) =>
          newRewards[chain] = await getGaugeRewards({
            gauges: newVaultsData[chain].filter(vault => vault.gauge && vault.gauge !== zeroAddress).map(vault => vault.gauge) as Address[],
            account: account as Address,
            chainId: chain,
            publicClient: publicClient!
          })
        ))

        console.log(`Completed fetching GaugeRewards (${new Date()})`)
        console.log(`Took ${Number(new Date()) - start}ms to load`)


        setNetworth(prev => ({
          vault: vaultNetworth,
          lockVault: lockVaultNetworth,
          wallet: assetNetworth,
          stake: stakeNetworth,
          total:
            vaultNetworth + assetNetworth + stakeNetworth + lockVaultNetworth,
        }));
        setGaugeRewards(pre => ({ ...newRewards }));

        console.log(`Completed fetching Vaultron (${new Date()})`)
        console.log(`Took ${Number(new Date()) - start}ms to load`)
      }
      console.log(`COMPLETED FETCHING APP DATA (${new Date()})`)
      console.log(`Took ${Number(new Date()) - getDataStart}ms to load`)
      setLoadingProgress(prev => 100)
    }
    getData();
  }, [account]);

  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [termsSigned, setTermsSigned] = useState<boolean>(false);

  useEffect(() => {
    if (!termsSigned) {
      const expiryDate = localStorage.getItem("termsAndConditions");
      if (!expiryDate || Number(expiryDate) + 1209600000 < Number(new Date())) {
        setShowTermsModal(true);
      } else {
        setTermsSigned(true);
      }
    }
  }, [termsSigned]);

  return (
    <div className={`${khTeka.variable} font-sans`}>
      <div className="bg-customNeutral300 w-full min-h-screen h-full mx-auto flex flex-col font-khTeka">
        <Navbar />
        <div className="flex-1 container p-0">
          {progress < 100 &&
            <div className="">
              <ProgressBar progress={progress} />
            </div>
          }
          <TermsModal
            showModal={showTermsModal}
            setShowModal={setShowTermsModal}
            setTermsSigned={setTermsSigned}
          />
          {children}
        </div>
        <div className="py-10"></div>
        <Footer />
      </div >
    </div>
  );
}
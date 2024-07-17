import Navbar from "@/components/navbar/Navbar";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CachedProvider, YieldOptions } from "vaultcraft-sdk";
import { useAccount, usePublicClient } from "wagmi";
import Footer from "@/components/common/Footer";
import { useRouter } from "next/router";
import { Address, createPublicClient, http, zeroAddress } from "viem";
import Modal from "@/components/modal/Modal";
import MainActionButton from "../button/MainActionButton";
import { gaugeRewardsAtom, networthAtom, tokensAtom, tvlAtom, vaultronAtom } from "@/lib/atoms";
import { ReserveData, TokenByAddress, TokenType, UserAccountData, VaultData } from "@/lib/types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";
import { aaveAccountDataAtom, aaveReserveDataAtom } from "@/lib/atoms/lending";
import { GAUGE_NETWORKS } from "pages/boost";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import axios from "axios";
import { fetchAaveData } from "@/lib/external/aave";
import { VotingEscrowAbi } from "@/lib/constants";
import fetchVaultron from "@/lib/vaultron";
import { mainnet, polygon, xLayer } from "viem/chains";
import { VCX_LP, VE_VCX } from "@/lib/constants/addresses";

async function setUpYieldOptions() {
  const ttl = 360_000;
  const provider = new CachedProvider();
  await provider.initialize(
    "https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/apy-data.json"
  );

  return new YieldOptions({ provider, ttl });
}

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
              className="text-secondaryBlue hover:text-primaryYellow focus:none outline-none"
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
            className="text-secondaryBlue hover:text-primaryYellow focus:none outline-none"
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
  const router = useRouter();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();

  const [yieldOptions, setYieldOptions] = useAtom(yieldOptionsAtom);

  useEffect(() => {
    if (!yieldOptions) {
      setUpYieldOptions().then((res: any) => setYieldOptions(res));
    }
  }, []);

  const [, setVaults] = useAtom(vaultsAtom);
  const [, setTokens] = useAtom(tokensAtom);
  const [, setGaugeRewards] = useAtom(gaugeRewardsAtom);
  const [, setTVL] = useAtom(tvlAtom);
  const [, setNetworth] = useAtom(networthAtom);
  const [, setAaveReserveData] = useAtom(aaveReserveDataAtom);
  const [, setAaveAccountData] = useAtom(aaveAccountDataAtom);
  const [, setVaultronStats] = useAtom(vaultronAtom);

  useEffect(() => {
    async function getData() {
      console.log(`FETCHING APP DATA (${new Date()})`)
      const getDataStart = Number(new Date())

      // get vaultsData and tokens
      const newVaultsData: { [key: number]: VaultData[] } = {}
      const newTokens: { [key: number]: TokenByAddress } = {}

      console.log(`Fetching Token and Vaults Data (${new Date()})`)
      let start = Number(new Date())

      await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => {
          console.log(`Fetching Data for chain ${chain.id} (${new Date()})`)
          let chainStart = Number(new Date())

          const { vaultsData, tokens } = await getTokenAndVaultsDataByChain({
            chain,
            account: account || zeroAddress,
            yieldOptions: yieldOptions as YieldOptions,
          })

          console.log(`Completed fetching Data for chain ${chain.id} (${new Date()})`)
          console.log(`Took ${Number(new Date()) - chainStart}ms to load`)

          newVaultsData[chain.id] = vaultsData
          newTokens[chain.id] = tokens;
        })
      );

      console.log(`Completed fetching Token and Vaults Data (${new Date()})`)
      console.log(`Took ${Number(new Date()) - start}ms to load`)


      const newReserveData: { [key: number]: ReserveData[] } = {}
      const newUserAccountData: { [key: number]: UserAccountData } = {}

      console.log(`Fetching AaveData (${new Date()})`)
      start = Number(new Date())

      await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => {
          if (chain.id === xLayer.id) {
            newReserveData[chain.id] = []
            newUserAccountData[chain.id] = {
              totalCollateral: 0,
              totalBorrowed: 0,
              netValue: 0,
              totalSupplyRate: 0,
              totalBorrowRate: 0,
              netRate: 0,
              ltv: 0,
              healthFactor: 0
            }
          } else {
            const res = await fetchAaveData(account || zeroAddress, newTokens[chain.id], chain)
            newReserveData[chain.id] = res.reserveData
            newUserAccountData[chain.id] = res.userAccountData
          }
        })
      );

      console.log(`Completed fetching AaveData (${new Date()})`)
      console.log(`Took ${Number(new Date()) - start}ms to load`)


      console.log(`Fetching TVL (${new Date()})`)
      start = Number(new Date())


      const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaultsData[chain.id]).flat().reduce((a, b) => a + b.tvl, 0)
      const lockVaultTVL = 520000 // @dev hardcoded since we removed lock vaults
      let stakingTVL = 0
      try {
        stakingTVL = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/api/protocol/vaultcraft`).then(res => res.data.currentChainTvls["staking"])
      } catch (e) {
        stakingTVL = 762000;
      }

      console.log(`Completed fetching TVL (${new Date()})`)
      console.log(`Took ${Number(new Date()) - start}ms to load`)


      setTVL({
        vault: vaultTVL,
        lockVault: lockVaultTVL,
        stake: stakingTVL,
        total: vaultTVL + lockVaultTVL + stakingTVL,
      });
      setVaults(newVaultsData);
      setTokens(newTokens);
      setAaveReserveData(newReserveData);
      setAaveAccountData(newUserAccountData);

      if (account) {
        console.log(`Fetching Networth (${new Date()})`)
        start = Number(new Date())

        const vaultNetworth = SUPPORTED_NETWORKS.map(chain =>
          Object.values(newTokens[chain.id])).flat().filter(t => t.type === TokenType.Vault || t.type === TokenType.Gauge)
          .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)
        const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
          Object.values(newTokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
          .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)

        const stake = await createPublicClient({
          chain: mainnet,
          transport: http(RPC_URLS[1]),
        }).readContract({
          address: VE_VCX,
          abi: VotingEscrowAbi,
          functionName: "locked",
          args: [account],
        });

        const stakeNetworth =
          (Number(stake.amount) / 1e18) * newTokens[1][VCX_LP].price;
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


        setNetworth({
          vault: vaultNetworth,
          lockVault: lockVaultNetworth,
          wallet: assetNetworth,
          stake: stakeNetworth,
          total:
            vaultNetworth + assetNetworth + stakeNetworth + lockVaultNetworth,
        });
        setGaugeRewards(newRewards);

        console.log(`Fetching Vaultron (${new Date()})`)
        start = Number(new Date())

        const newVaultronStats = await fetchVaultron(account, createPublicClient({
          chain: polygon,
          transport: http(RPC_URLS[137]),
        }))

        console.log(`Completed fetching Vaultron (${new Date()})`)
        console.log(`Took ${Number(new Date()) - start}ms to load`)

        setVaultronStats(newVaultronStats)
      }
      console.log(`COMPLETED FETCHING APP DATA (${new Date()})`)
      console.log(`Took ${Number(new Date()) - getDataStart}ms to load`)
    }
    if (yieldOptions) getData();
  }, [yieldOptions, account]);

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
    <>
      <div className="bg-customNeutral300 w-full min-h-screen h-full mx-auto font-khTeka flex flex-col">
        <Navbar />
        <div className="flex-1 container p-0">
          <TermsModal
            showModal={showTermsModal}
            setShowModal={setShowTermsModal}
            setTermsSigned={setTermsSigned}
          />
          {children}
        </div>
        <div className="py-10"></div>
        <Footer />
      </div>
    </>
  );
}

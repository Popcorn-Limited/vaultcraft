import Navbar from "@/components/navbar/Navbar";
import { masaAtom, yieldOptionsAtom } from "@/lib/atoms/sdk";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CachedProvider, YieldOptions } from "vaultcraft-sdk";
import { mainnet, useAccount, usePublicClient } from "wagmi";
import Footer from "@/components/common/Footer";
import { useMasaAnalyticsReact } from "@masa-finance/analytics-react";
import { useRouter } from "next/router";
import { Address, createPublicClient, http, zeroAddress } from "viem";
import Modal from "@/components/modal/Modal";
import MainActionButton from "../button/MainActionButton";
import { availableZapAssetAtom, gaugeRewardsAtom, networthAtom, tokensAtom, tvlAtom, vaultronAtom, zapAssetsAtom } from "@/lib/atoms";
import { ReserveData, Token, TokenByAddress, TokenType, UserAccountData, VaultData, VaultDataByAddress } from "@/lib/types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";
import { aaveAccountDataAtom, aaveReserveDataAtom } from "@/lib/atoms/lending";
import { GAUGE_NETWORKS } from "pages/boost";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import axios from "axios";
import { fetchAaveData } from "@/lib/external/aave";
import { VCX_LP, VE_VCX, VotingEscrowAbi } from "@/lib/constants";
import fetchVaultron from "@/lib/vaultron";
import { polygon } from "viem/chains";

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
    localStorage.setItem(
      "termsAndConditions",
      String(Number(new Date()))
    );
  }

  return (
    <Modal
      visibility={[showModal, setShowModal]}
      title={<h2 className="text-xl font-bold">Terms and Conditions</h2>}
    >
      <div className="text-start text-white">
        <ul className="list-inside list-disc space-y-4 mb-6">
          <li>
            You hereby release all present and future claims against VaultCraftDAO related to your use of the protocol, the tokens, VaultCraftDAO governance, and any other facet of the protocol.
          </li>
          <li>
            You agree to indemnify and hold harmless VaultCraftDAO and its affiliates for any costs arising out of or relating to your use of the VaultCraft protocol.
          </li>
          <li>
            You are not accessing the protocol from Burma (Myanmar), Cuba, Iran, Sudan, Syria, the Western Balkans, Belarus, Côte d’Ivoire, Democratic Republic of the Congo, Iraq, Lebanon, Liberia, Libya, North Korea, Russia, certain sanctioned areas of Ukraine, Somalia, Venezuela, Yemen, Zimbabwe, or the United States of America (collectively, “Prohibited Jurisdictions”), or any other jurisdiction listed as a Specially Designated National by the United States Office of Foreign Asset Control (“OFAC”).
          </li>
          <li>
            Important Notice: Residents of the USA are expressly prohibited from using the app.vaultcraft.io interface. Accessing or using this service from the United States of America violates these Terms of Service.
          </li>
        </ul>
        <p className="py-6 border-t-2 border-customNeutral100">
          By accepting you agree that you have read and accept the <a
            className="text-secondaryBlue hover:text-primaryYellow"
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
  const { query, asPath } = router;
  const { address: account } = useAccount();
  const publicClient = usePublicClient();

  const [yieldOptions, setYieldOptions] = useAtom(yieldOptionsAtom);
  const [masaSdk, setMasaSdk] = useAtom(masaAtom);

  const {
    fireEvent,
    fireLoginEvent,
    firePageViewEvent,
    fireConnectWalletEvent,
  } = useMasaAnalyticsReact({
    clientApp: "VaultCraft",
    clientName: "VaultCraft",
    clientId: process.env.MASA_CLIENT_ID as string,
  });

  useEffect(() => {
    void firePageViewEvent({
      page: `https://app.vaultcraft.io${asPath}`,
      user_address: account,
      additionalEventData: { referral: query.ref },
    });
  }, [asPath]);

  useEffect(() => {
    if (!yieldOptions) {
      setUpYieldOptions().then((res: any) => setYieldOptions(res));
    }
    if (!masaSdk) {
      setMasaSdk({
        fireEvent,
        fireLoginEvent,
        firePageViewEvent,
        fireConnectWalletEvent,
      });
    }
  }, []);

  const [, setVaults] = useAtom(vaultsAtom);
  const [, setTokens] = useAtom(tokensAtom);
  const [, setGaugeRewards] = useAtom(gaugeRewardsAtom);
  const [, setTVL] = useAtom(tvlAtom);
  const [, setNetworth] = useAtom(networthAtom);
  const [, setAaveReserveData] = useAtom(aaveReserveDataAtom)
  const [, setAaveAccountData] = useAtom(aaveAccountDataAtom)
  const [, setVaultronStats] = useAtom(vaultronAtom)

  useEffect(() => {
    async function getData() {
      // get vaultsData and tokens
      const newVaultsData: { [key: number]: VaultData[] } = {}
      const newTokens: { [key: number]: TokenByAddress } = {}
      await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => {
          const { vaultsData, tokens } = await getTokenAndVaultsDataByChain({
            chain,
            account: account || zeroAddress,
            yieldOptions: yieldOptions as YieldOptions,
          })
          newVaultsData[chain.id] = vaultsData
          newTokens[chain.id] = tokens;
        })
      )

      const newReserveData: { [key: number]: ReserveData[] } = {}
      const newUserAccountData: { [key: number]: UserAccountData } = {}

      await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => {
          const res = await fetchAaveData(account || zeroAddress, newTokens[chain.id], chain)
          newReserveData[chain.id] = res.reserveData
          newUserAccountData[chain.id] = res.userAccountData
        })
      )

      const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaultsData[chain.id]).flat().reduce((a, b) => a + b.tvl, 0)
      const lockVaultTVL = 520000 // @dev hardcoded since we removed lock vaults
      let stakingTVL = 0
      try {
        stakingTVL = await axios.get("https://api.llama.fi/protocol/vaultcraft").then(res => res.data.currentChainTvls["staking"])
      } catch (e) {
        stakingTVL = 762000
      }

      setTVL({
        vault: vaultTVL,
        lockVault: lockVaultTVL,
        stake: stakingTVL,
        total: vaultTVL + lockVaultTVL + stakingTVL
      });
      setVaults(newVaultsData);
      setTokens(newTokens);
      setAaveReserveData(newReserveData)
      setAaveAccountData(newUserAccountData)

      if (account) {
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

        const stakeNetworth = (Number(stake.amount) / 1e18) * newTokens[1][VCX_LP].price;
        const lockVaultNetworth = 0 // @dev hardcoded since we removed lock vaults

        const newRewards: { [key: number]: GaugeRewards } = {}
        await Promise.all(GAUGE_NETWORKS.map(async (chain) =>
          newRewards[chain] = await getGaugeRewards({
            gauges: newVaultsData[chain].filter(vault => !!vault.gauge).map(vault => vault.gauge) as Address[],
            account: account as Address,
            chainId: chain,
            publicClient
          })
        ))

        setNetworth({
          vault: vaultNetworth,
          lockVault: lockVaultNetworth,
          wallet: assetNetworth,
          stake: stakeNetworth,
          total: vaultNetworth + assetNetworth + stakeNetworth + lockVaultNetworth
        })
        setGaugeRewards(newRewards);

        const newVaultronStats = await fetchVaultron(account, createPublicClient({
          chain: polygon,
          transport: http(RPC_URLS[137]),
        }))
        setVaultronStats(newVaultronStats)
      }
    }
    if (yieldOptions) getData();
  }, [yieldOptions, account]);

  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [termsSigned, setTermsSigned] = useState<boolean>(false);

  useEffect(() => {
    if (!termsSigned) {
      const expiryDate = localStorage.getItem("termsAndConditions");
      console.log(expiryDate)
      if (!expiryDate || (Number(expiryDate) + 1209600000 < Number(new Date()))) {
        setShowTermsModal(true);
      } else {
        setShowTermsModal(true);
        //setTermsSigned(true);
      }
    }
  }, [termsSigned]);

  return (
    <>
      <div className="bg-customNeutral300 w-full mx-auto min-h-screen h-full font-khTeka flex flex-col">
        <Navbar />
        <div className="flex-1">
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

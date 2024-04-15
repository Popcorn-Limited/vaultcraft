import Navbar from "@/components/navbar/Navbar";
import { masaAtom, yieldOptionsAtom } from "@/lib/atoms/sdk";
import { lockvaultsAtom, vaultsAtom } from "@/lib/atoms/vaults";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { getVaultsByChain } from "@/lib/vault/getVaults";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CachedProvider, YieldOptions } from "vaultcraft-sdk";
import { useAccount } from "wagmi";
import Footer from "@/components/common/Footer";
import { useMasaAnalyticsReact } from "@masa-finance/analytics-react";
import { useRouter } from "next/router";
import getLockVaultsByChain from "@/lib/vault/lockVault/getVaults";
import { zeroAddress } from "viem";
import { arbitrum } from "viem/chains";
import Modal from "@/components/modal/Modal";
import MainActionButton from "../button/MainActionButton";
import { availableZapAssetAtom, zapAssetsAtom } from "@/lib/atoms";
import { Token } from "@/lib/types";
import getZapAssets, { getAvailableZapAssets } from "@/lib/utils/getZapAssets";

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

  const [yieldOptions, setYieldOptions] = useAtom(yieldOptionsAtom);
  const [masaSdk, setMasaSdk] = useAtom(masaAtom);

  const [, setVaults] = useAtom(vaultsAtom);
  const [, setLockVaults] = useAtom(lockvaultsAtom);

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

  useEffect(() => {
    async function getVaults() {
      // get vaults
      const fetchedVaults = (
        await Promise.all(
          SUPPORTED_NETWORKS.map(async (chain) =>
            getVaultsByChain({
              chain,
              account: account || zeroAddress,
              yieldOptions: yieldOptions as YieldOptions,
            })
          )
        )
      ).flat();
      setVaults(fetchedVaults);

      const fetchedLockVaults = await getLockVaultsByChain({
        chain: arbitrum,
        account: account || zeroAddress,
      });
      setLockVaults(fetchedLockVaults);
    }
    if (yieldOptions) getVaults();
  }, [yieldOptions, account]);

  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [termsSigned, setTermsSigned] = useState<boolean>(false);

  useEffect(() => {
    if (!termsSigned) {
      const expiryDate = localStorage.getItem("termsAndConditions");
      if (!expiryDate || (Number(expiryDate) + 1209600000 < Number(new Date()))) {
        setShowTermsModal(true);
      } else {
        setTermsSigned(true);
      }
    }
  }, [termsSigned]);

  const [zapAssets, setZapAssets] = useAtom(zapAssetsAtom);
  const [availableZapAssets, setAvailableZapAssets] = useAtom(
    availableZapAssetAtom
  );

  useEffect(() => {
    async function getZapData() {
      const newZapAssets: { [key: number]: Token[] } = {};
      SUPPORTED_NETWORKS.forEach(
        async (chain) =>
          (newZapAssets[chain.id] = await getZapAssets({ chain, account }))
      );
      setZapAssets(newZapAssets);

      // get available zapAddresses
      setAvailableZapAssets({
        1: await getAvailableZapAssets(1),
        137: await getAvailableZapAssets(137),
        10: await getAvailableZapAssets(10),
        42161: await getAvailableZapAssets(42161),
        56: await getAvailableZapAssets(56),
      });
    }
    if (
      Object.keys(zapAssets).length === 0 &&
      Object.keys(availableZapAssets).length === 0
    )
      getZapData();
  }, []);

  return (
    <>
      <div className="bg-[#141416] w-full mx-auto min-h-screen h-full font-khTeka flex flex-col">
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

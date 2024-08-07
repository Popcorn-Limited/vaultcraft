import { useState } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import {
  metadataAtom,
  adapterAtom,
  strategyDeploymentAtom,
  conditionsAtom,
  adapterDeploymentAtom,
  feeAtom,
  limitAtom,
  assetAtom,
} from "@/lib/atoms";
import Review from "@/components/review/Review";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import Modal from "@/components/modal/Modal";
import { deployVault } from "@/lib/vault/deployVault";
import { WalletClient, stringToHex } from "viem";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { VaultCreationContainerProps } from ".";
import VaultCreationCard from "@/components/vault/management/creation/VaultCreationCard";

export default function ReviewContainer({
  route,
  stages,
  activeStage,
}: VaultCreationContainerProps): JSX.Element {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();

  const [adapter] = useAtom(adapterAtom);
  const [strategyData] = useAtom(strategyDeploymentAtom);
  const [metadata, setMetadata] = useAtom(metadataAtom);
  const [showModal, setShowModal] = useState(false);
  const [conditions] = useAtom(conditionsAtom);

  const [asset] = useAtom(assetAtom);
  const [adapterData] = useAtom(adapterDeploymentAtom);
  const [fees] = useAtom(feeAtom);
  const [limit] = useAtom(limitAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  function handleSubmit() {
    setShowModal(true);
    deploy();
  }

  function deploy() {
    if (!chain) return;
    // Deploy is currently only available on mainnet
    // @ts-ignore
    if (!SUPPORTED_NETWORKS.map((network) => network.id).includes(chain.id))
      switchChain?.({ chainId: 1 });

    setIsLoading(true);
    deployVault(
      chain,
      walletClient as WalletClient,
      publicClient!,
      fees,
      asset,
      limit,
      adapterData,
      strategyData,
      ""
    ).then((res) => {
      !!res ? setIsSuccess(true) : setIsError(true);
      setIsLoading(false);
    });
  }

  return metadata && adapter ? (
    <VaultCreationCard activeStage={activeStage} stages={stages}>
      <div>
        <h1 className="text-white text-2xl mb-2">Review</h1>
        <p className="text-white">
          Please review your configuration carefully. You can interact with
          vaults that you created
          <a
            href="/experimental/vaults"
            rel="noopener noreferrer"
            target="_blank"
            className="text-purple-500"
          >
            {" "}
            here
          </a>
          .
        </p>
      </div>

      <Review />

      <div className="flex justify-end mt-8 gap-3">
        <SecondaryActionButton
          label="Back"
          handleClick={() => router.push(`/create-vault/${route}/fees`)}
        />
        <MainActionButton
          label={account ? "Deploy Vault" : "Connect Wallet"}
          handleClick={account ? handleSubmit : openConnectModal}
          disabled={account && !conditions}
        />
      </div>

      {
        <Modal visibility={[showModal, setShowModal]}>
          <div>
            <p className="text-white text-2xl mb-4">Creating Vault</p>
            <span className="flex flex-row">
              <p className="text-white mr-2">Creating Vault... </p>
              {(metadata.ipfsHash === "" || isLoading) && (
                <figure className="relative w-5 h-5 mt-0.5">
                  <Image
                    fill
                    className="object-contain"
                    alt="loader"
                    src={"/images/loader/spinner.svg"}
                  />
                </figure>
              )}
              {metadata.ipfsHash !== "" && !isLoading && isSuccess && (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              )}
              {metadata.ipfsHash !== "" && !isLoading && isError && (
                <XCircleIcon className="w-6 h-6 text-red-500" />
              )}
            </span>
            <div className="mt-8">
              <MainActionButton
                label="Done"
                handleClick={() =>
                  isSuccess
                    ? router.push("/vaults/factory")
                    : setShowModal(false)
                }
                disabled={
                  metadata.ipfsHash === "" ||
                  isLoading ||
                  (strategyData.id !== stringToHex("", { size: 32 }) &&
                    strategyData.data === "0x")
                }
              />
            </div>
          </div>
        </Modal>
      }
    </VaultCreationCard>
  ) : (
    <></>
  );
}

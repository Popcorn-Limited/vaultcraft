import { PRO_CREATION_STAGES } from "@/lib/stages";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { WalletClient, mainnet, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { metadataAtom, adapterAtom, strategyDeploymentAtom, conditionsAtom, adapterDeploymentAtom, feeAtom, limitAtom, assetAtom } from "@/lib/atoms";
import { IpfsClient } from "@/lib/ipfsClient";
import Review from "@/components/review/Review";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import Modal from "@/components/Modal";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import { deployVault } from "@/lib/vault/deployVault";
import { stringToHex } from "viem";
import { SUPPORTED_NETWORKS } from "@/lib/connectors";


export default function ReviewPage(): JSX.Element {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork()

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
    if (!chain) return
    // Deploy is currently only available on mainnet
    // @ts-ignore
    if (!SUPPORTED_NETWORKS.map(network => network.id).includes(chain.id)) switchNetwork?.(Number(mainnet.id));

    IpfsClient.add(metadata.name, { name: metadata.name }).then(res => {
      setMetadata((prefState) => { return { ...prefState, ipfsHash: res } });
      setIsLoading(true)
      deployVault(chain, walletClient as WalletClient, publicClient, fees, asset, limit, adapterData, strategyData, res).then(res => {
        !!res ? setIsSuccess(true) : setIsError(true);
        setIsLoading(false)
      })
    });
  }

  return (metadata && adapter ?
    <VaultCreationContainer activeStage={3} stages={PRO_CREATION_STAGES} >
      <div>
        <h1 className="text-white text-2xl mb-2">Review</h1>
        <p className="text-white">
          Please review your configuration carefully.
          You can interact with vaults that you created
          <a
            href="/vaults"
            rel="noopener noreferrer"
            target="_blank"
            className="text-customPurple"
          >
            {" "} here
          </a>.
        </p>
      </div>

      <Review />

      <div className="flex justify-end mt-8 gap-3">
        <SecondaryActionButton
          label="Back"
          handleClick={() => router.push('/create-vault/easy/fees')}
        />
        <MainActionButton
          label={account ? "Deploy Vault" : "Connect Wallet"}
          handleClick={account ? handleSubmit : openConnectModal}
          disabled={account && !conditions}
        />
      </div>

      {<Modal show={showModal} setShowModal={setShowModal} >
        <div>
          <p className="text-[white] text-2xl mb-4">Creating Vault</p>
          <span className="flex flex-row items-center mb-2">
            <p className="text-white mr-2">Uploading Metadata to IPFS... </p>
            {metadata.ipfsHash === "" ?
              <figure className="relative w-5 h-5 mt-0.5">
                <Image
                  fill
                  className="object-contain"
                  alt="loader"
                  src={"/images/loader/spinner.svg"}
                />
              </figure> :
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            }
          </span>
          <span className="flex flex-row">
            <p className="text-white mr-2">Creating Vault... </p>
            {(metadata.ipfsHash === "" || isLoading) &&
              <figure className="relative w-5 h-5 mt-0.5">
                <Image
                  fill
                  className="object-contain"
                  alt="loader"
                  src={"/images/loader/spinner.svg"}
                />
              </figure>
            }
            {metadata.ipfsHash !== "" && !isLoading && isSuccess &&
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
            }
            {metadata.ipfsHash !== "" && !isLoading && isError &&
              <XCircleIcon className="w-6 h-6 text-red-500" />
            }
          </span>
          <div className="mt-8">
            <MainActionButton
              label="Done"
              handleClick={() => isSuccess ? router.push("/vaults") : setShowModal(false)}
              disabled={metadata.ipfsHash === "" || isLoading || (strategyData.id !== stringToHex("", { size: 32 }) && strategyData.data === "0x")}
            />
          </div>
        </div>
      </Modal>}
    </VaultCreationContainer> :
    <></>
  )
}

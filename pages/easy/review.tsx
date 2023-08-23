import { PRO_CREATION_STAGES } from "@/lib/stages";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { noOp } from "@/lib/helpers";
import { useDeployVault } from "@/lib/vaults";
import { metadataAtom, adapterAtom, strategyDeploymentAtom } from "@/lib/atoms";
import { IpfsClient } from "@/lib/ipfsClient";
import Review from "@/components/review/Review";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import Modal from "@/components/Modal";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import { ethers } from "ethers";


export default function ReviewPage(): JSX.Element {
  const router = useRouter();
  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [adapter] = useAtom(adapterAtom);
  const [strategyData] = useAtom(strategyDeploymentAtom);
  const [metadata, setMetadata] = useAtom(metadataAtom);
  const [showModal, setShowModal] = useState(false);

  const { write: deployVault = noOp, isLoading, isSuccess, isError } = useDeployVault();

  function handleSubmit() {
    setShowModal(true);
    uploadMetadata();
  }

  function uploadMetadata() {
    IpfsClient.add(metadata.name, { name: metadata.name }).then(res => {
      setMetadata((prefState) => { return { ...prefState, ipfsHash: res } })
      deployVault();
    });
    //deployVault();
  }

  return (metadata && adapter ?
    <VaultCreationContainer activeStage={3} stages={PRO_CREATION_STAGES} >
      <div>
        <h1 className="text-white text-2xl mb-2">Review</h1>
        <p className="text-white">
          Please review the vault configuration carefully before creating.
          All configuration settings are permanent
        </p>
      </div>

      <Review />

      <div className="flex justify-end mt-8 gap-3">
        <SecondaryActionButton
          label="Back"
          handleClick={() => router.push('/pro/fees')}
          className={`max-w-[150px]`}
        />
        <MainActionButton
          label={account ? "Deploy Vault" : "Connect Wallet"}
          handleClick={account ? handleSubmit : openConnectModal}
          className={`max-w-[200px]`}
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
              handleClick={() => isSuccess ? router.push("https://app.pop.network/experimental/sweet-vaults") : setShowModal(false)}
              disabled={metadata.ipfsHash === "" || isLoading || (strategyData.id !== ethers.utils.formatBytes32String("") && strategyData.data === "0x")}
            />
          </div>
        </div>
      </Modal>}
    </VaultCreationContainer> :
    <></>
  )
}

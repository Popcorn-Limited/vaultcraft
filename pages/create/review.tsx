import { useState } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { noOp } from "@/lib/helpers";
import { useDeployVault } from "@/lib/vaults";
import { metadataAtom, adapterAtom } from "@/lib/atoms";
import { CREATION_STAGES } from "@/lib/stages";
import { IpfsClient } from "@/lib/ipfsClient";
import ProgressBar from "@/components/ProgressBar";
import Review from "@/components/review/Review";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import Modal from "@/components/Modal";


export default function ReviewPage(): JSX.Element {
  const router = useRouter();
  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [adapter] = useAtom(adapterAtom);
  const [metadata, setMetadata] = useAtom(metadataAtom);
  const [showModal, setShowModal] = useState(false);

  const { write: deployVault = noOp, isLoading, isSuccess, isError } = useDeployVault();

  function handleSubmit() {
    setShowModal(true);
    uploadMetadata();
  }

  function uploadMetadata() {
    IpfsClient.add(metadata.name, { name: metadata.name, tags: metadata.tags }).then(res => {
      setMetadata((prefState) => { return { ...prefState, ipfsHash: res } })
      deployVault();
    });
    //deployVault();
  }

  return (metadata && adapter ?
    <div className="bg-[#141416] md:max-w-[800px] w-full h-full flex flex-col justify-center mx-auto md:px-8 px-6">
      <ProgressBar stages={CREATION_STAGES} activeStage={3} />
      <div className="md:bg-[#23262F] self-center min-h-[500px] bg-transparent h-fit rounded-[20px] border-[#23262F] border-2 md:border border-none md:w-[600px] md:p-6 px-0 flex flex-col justify-between mt-10 md:relative w-full">
        <div>
          <h1 className="text-white text-2xl mb-2">Review</h1>
          <p className="text-white">
            Please review the vault configuration carefully before creating.
            All configuration settings are permanent
          </p>
        </div>

        <Review />

        <div className="flex flex-row space-x-8 mt-16">
          <SecondaryActionButton
            label="Back"
            handleClick={() => router.push('/create/fees')}
          />
          <MainActionButton
            label={account ? "Deploy Vault" : "Connect Wallet"}
            handleClick={account ? handleSubmit : openConnectModal}
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
                handleClick={() => isSuccess ? router.push("https://app.pop.network/sweet-vaults") : setShowModal(false)}
                disabled={metadata.ipfsHash === "" || isLoading}
              />
            </div>
          </div>
        </Modal>}
      </div>
    </div> :
    <></>
  )
}

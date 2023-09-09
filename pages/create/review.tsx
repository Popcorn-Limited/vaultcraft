import { useState } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { useAccount, useNetwork } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { noOp } from "@/lib/helpers";
import { useDeployVault, deployVaultEthers } from "@/lib/vaults";
import { adapterDeploymentAtom, assetAtom, feeAtom, limitAtom, metadataAtom, adapterAtom, strategyDeploymentAtom } from "@/lib/atoms";
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
  const { chain } = useNetwork();
  const [asset] = useAtom(assetAtom);
  const [adapterData] = useAtom(adapterDeploymentAtom);
  const [metadata, setMetadata] = useAtom(metadataAtom);
  const [fees] = useAtom(feeAtom);
  const [limit] = useAtom(limitAtom); const [showModal, setShowModal] = useState(false);

  const { write: deployVault = noOp, isLoading, isSuccess, isError } = useDeployVault(account, chain, asset, adapterData, metadata, fees, limit);

  function handleSubmit() {
    setShowModal(true);
    uploadMetadata();
  }

  console.log("PING", metadata)

  function uploadMetadata() {
    IpfsClient.add(metadata.name, { name: metadata.name, tags: metadata.tags }).then(res => {
      setMetadata((prefState) => { return { ...prefState, ipfsHash: res } })
      deployVault();
    });
  }

  // async function uploadMetadata() {
  //   try {
  //     const res = await IpfsClient.add(metadata.name, { name: metadata.name, tags: metadata.tags });
  //     setMetadata((prevState) => { return { ...prevState, ipfsHash: res } });
  //     await deployVaultEthers(account, chain, asset, adapter, metadata, fees, limit);
  //   } catch (error) {
  //     console.error("Error in uploadMetadata:", error);
  //   }
  // }

  //

  return (metadata && adapter ?
    <VaultCreationContainer activeStage={3} >
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

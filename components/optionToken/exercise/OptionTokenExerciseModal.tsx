import Modal from "@/components/modal/Modal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OptionInfo from "@/components/optionToken/exercise/OptionInfo";
import ExerciseOptionTokenInterface from "@/components/optionToken/exercise/ExerciseOptionTokenInterface";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import BridgeModal from "@/components/bridge/BridgeModal";

export default function OptionTokenExerciseModal({
  show,
}: {
  show: [boolean, Dispatch<SetStateAction<boolean>>];
}): JSX.Element {
  const [chainId, setChainId] = useState<number>(1)
  const [modalStep, setModalStep] = useState(0);
  const [showModal, setShowModal] = show;
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  useEffect(() => {
    if (!showModal) {
      setModalStep(0);
      setChainId(1)
    }
  }, [showModal]);

  function next(id: number) {
    setChainId(id)
    setModalStep(modalStep + 1)
  }

  return (
    <>
      <BridgeModal show={[showBridgeModal, setShowBridgeModal]} />
      <Modal visibility={[showModal, setShowModal]}>
        <>
          {modalStep === 0 && <OptionInfo />}
          {modalStep === 1 && (
            <ExerciseOptionTokenInterface
              chainId={chainId}
              setShowModal={setShowModal}
            />
          )}
          <div className="space-y-4">
            {modalStep === 0 && (
              <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6">
                <MainActionButton
                  label="Exercise ETH oVCX"
                  handleClick={() => next(1)}
                />
                <SecondaryActionButton
                  label="Exercise OPT oVCX"
                  handleClick={() => next(10)}
                />
                <SecondaryActionButton
                  label="Exercise ARB oVCX"
                  handleClick={() => next(42161)}
                />
                <SecondaryActionButton
                  label="Bridge VCX"
                  icon="/images/icons/wormholeWhite.svg"
                  handleClick={() => setShowBridgeModal(true)}
                />
              </div>
            )}
            {modalStep === 1 && (
              <SecondaryActionButton
                label="Back"
                handleClick={() => setModalStep(modalStep - 1)}
              />
            )}
          </div>
        </>
      </Modal>
    </>
  );
}

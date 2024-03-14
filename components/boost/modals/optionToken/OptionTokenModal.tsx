import Modal from "@/components/modal/Modal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Address,
  WalletClient,
  useAccount,
  useNetwork,
  usePublicClient,
  useSwitchNetwork,
  useWalletClient,
} from "wagmi";
import OptionInfo from "@/components/boost/modals/optionToken/OptionInfo";
import ExerciseOptionTokenInterface from "@/components/boost/modals/optionToken/ExerciseOptionTokenInterface";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { handleAllowance } from "@/lib/approve";
import { parseEther } from "viem";
import { exerciseOPop } from "@/lib/optionToken/interactions";
import ActionSteps from "@/components/vault/ActionSteps";
import { ActionStep, EXERCISE_OVCX_STEPS } from "@/lib/getActionSteps";
import { OptionTokenByChain, WETH } from "@/lib/constants";

export default function OptionTokenModal({
  show,
}: {
  show: [boolean, Dispatch<SetStateAction<boolean>>];
}): JSX.Element {
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [modalStep, setModalStep] = useState(0);
  const [showModal, setShowModal] = show;

  const [amount, setAmount] = useState<string>("0");
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<string>("0");

  const [stepCounter, setStepCounter] = useState<number>(0);
  const [steps, setSteps] = useState<ActionStep[]>(EXERCISE_OVCX_STEPS);

  useEffect(() => {
    if (!showModal) {
      setModalStep(0);
      setAmount("0");
      setMaxPaymentAmount("0");
      setStepCounter(0);
      setSteps(EXERCISE_OVCX_STEPS);
    }
  }, [showModal]);

  async function handleExerciseOptionToken() {
    // Early exit if value is ZERO
    // if ((Number(amount) || 0) == 0) return;

    if (chain?.id !== Number(1)) {
      try {
        await switchNetworkAsync?.(Number(1));
      } catch (error) {
        return;
      }
    }

    const stepsCopy = [...steps];
    const currentStep = stepsCopy[stepCounter];
    currentStep.loading = true;
    setSteps(stepsCopy);

    let success = false;
    switch (stepCounter) {
      case 0:
        success = await handleAllowance({
          token: WETH,
          amount: Number(amount) * 10 ** 18 || 0,
          account: account as Address,
          spender: OptionTokenByChain[1],
          clients: {
            publicClient,
            walletClient: walletClient as WalletClient,
          },
        });
        break;
      case 1:
        success = await exerciseOPop({
          account: account as Address,
          amount: parseEther(
            Number(amount).toLocaleString("fullwide", { useGrouping: false })
          ),
          maxPaymentAmount: parseEther(maxPaymentAmount),
          clients: { publicClient, walletClient: walletClient as WalletClient },
        });
        break;
    }

    currentStep.loading = false;
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1;
    setSteps(stepsCopy);
    setStepCounter(newStepCounter);
  }

  return (
    <Modal visibility={[showModal, setShowModal]}>
      <>
        {modalStep === 0 && <OptionInfo />}
        {modalStep === 1 && (
          <ExerciseOptionTokenInterface
            amountState={[amount, setAmount]}
            maxPaymentAmountState={[maxPaymentAmount, setMaxPaymentAmount]}
          />
        )}

        {modalStep === 1 && (
          <div className="w-full flex justify-center mt-2 mb-4">
            <ActionSteps
              steps={EXERCISE_OVCX_STEPS}
              stepCounter={stepCounter}
            />
          </div>
        )}

        <div className="space-y-4">
          {modalStep === 0 && (
            <MainActionButton
              label="Next"
              handleClick={() => setModalStep(modalStep + 1)}
            />
          )}
          {modalStep === 1 && (
            <>
              {stepCounter < 2 ? (
                <MainActionButton
                  label={steps[stepCounter].label}
                  handleClick={handleExerciseOptionToken} //disabled={amount === "0" || maxPaymentAmount === "0"}
                />
              ) : (
                <MainActionButton
                  label={"Close Modal"}
                  handleClick={() => setShowModal(false)}
                />
              )}
            </>
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
  );
}

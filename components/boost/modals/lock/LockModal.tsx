import { Address, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WalletClient } from "viem";
import Modal from "@/components/modal/Modal";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { getVeAddresses } from "@/lib/constants";
import LockVxcInfo from "@/components/boost/modals/lock/LockVxcInfo";
import LockVcxInterface from "@/components/boost/modals/lock/LockVcxInterface";
import LockPreview from "@/components/boost/modals/lock/LockPreview";
import VotingPowerInfo from "@/components/boost/modals/lock/VotingPowerInfo";
import { handleAllowance } from "@/lib/approve";
import { createLock } from "@/lib/gauges/interactions";
import ActionSteps from "@/components/vault/ActionSteps";
import { ActionStep, LOCK_VCX_LP_STEPS } from "@/lib/vault/getActionSteps";

const {
  BalancerPool: VCX_LP,
  VotingEscrow: VOTING_ESCROW
} = getVeAddresses()

interface LockModalProps {
  show: [boolean, Dispatch<SetStateAction<boolean>>];
  setShowLpModal: Dispatch<SetStateAction<boolean>>;
}

export default function LockModal({ show, setShowLpModal }: LockModalProps): JSX.Element {
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const [modalStep, setModalStep] = useState(0);
  const [showModal, setShowModal] = show;

  const [amount, setAmount] = useState<string>("0");
  const [days, setDays] = useState(7);

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>(LOCK_VCX_LP_STEPS)

  useEffect(() => {
    if (!showModal) {
      setModalStep(0)
      setStepCounter(0)
      setSteps(LOCK_VCX_LP_STEPS)
      setAmount("0")
      setDays(7)
    }
  },
    [showModal]
  )

  useEffect(() => {
    if (modalStep < 3) {
      setStepCounter(0)
      setSteps(LOCK_VCX_LP_STEPS)
    }
  }, [modalStep])

  async function handleLock() {
    const val = Number(amount) * 1e18

    // Early exit if value is ZERO
    if (val == 0) return;

    if (chain?.id !== Number(1)) {
      try {
        await switchNetworkAsync?.(Number(1));
      } catch (error) {
        return
      }
    }

    const stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)

    let success = false;
    switch (stepCounter) {
      case 0:
        success = await handleAllowance({
          token: VCX_LP,
          amount: val,
          account: account as Address,
          spender: VOTING_ESCROW,
          clients: {
            publicClient,
            walletClient: walletClient as WalletClient
          }
        })
        break;
      case 1:
        // When approved continue to deposit
        success = await createLock(({ amount: val, days, account: account as Address, clients: { publicClient, walletClient: walletClient as WalletClient } }));
        break;
    }

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy)
    setStepCounter(newStepCounter)
  }

  function showLpModal(): void {
    setShowModal(false);
    setShowLpModal(true)
  }

  return (
    <Modal visibility={[showModal, setShowModal]}>
      <>
        {modalStep === 0 && <LockVxcInfo />}
        {modalStep === 1 && <VotingPowerInfo />}
        {modalStep === 2 && <LockVcxInterface amountState={[amount, setAmount]} daysState={[days, setDays]} showLpModal={showLpModal} />}
        {modalStep === 3 && <LockPreview amount={amount} days={days} />}

        {
          modalStep === 3 &&
          <div className="w-full flex justify-center mt-2 mb-4">
            <ActionSteps steps={LOCK_VCX_LP_STEPS} stepCounter={stepCounter} />
          </div>
        }

        <div className="space-y-4">
          {modalStep < 3 && <MainActionButton label="Next" handleClick={() => setModalStep(modalStep + 1)} />}
          {modalStep === 3 &&
            <>
              {stepCounter < 2 ?
                < MainActionButton label={steps[stepCounter].label} handleClick={handleLock} disabled={amount === "0" || days === 0} /> :
                < MainActionButton label={"Close Modal"} handleClick={() => setShowModal(false)} />
              }
            </>
          }
          {modalStep === 0 && <SecondaryActionButton label="Skip" handleClick={() => setModalStep(2)} />}
          {modalStep === 1 || modalStep === 3 && <SecondaryActionButton label="Back" handleClick={() => setModalStep(modalStep - 1)} />}
        </div>
      </>
    </Modal >
  )
}
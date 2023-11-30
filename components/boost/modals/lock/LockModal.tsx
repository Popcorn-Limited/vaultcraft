import { Address, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WalletClient } from "viem";
import Modal from "@/components/modal/Modal";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { getVeAddresses } from "@/lib/utils/addresses";
import LockVxcInfo from "@/components/boost/modals/lock/LockVxcInfo";
import LockVcxInterface from "@/components/boost/modals/lock/LockVcxInterface";
import LockPreview from "@/components/boost/modals/lock/LockPreview";
import VotingPowerInfo from "@/components/boost/modals/lock/VotingPowerInfo";
import { handleAllowance } from "@/lib/approve";
import { createLock } from "@/lib/gauges/interactions";

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
  const { switchNetwork } = useSwitchNetwork();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = show;

  const [amount, setAmount] = useState<string>("0");
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!showModal) setStep(0)
  },
    [showModal]
  )

  async function handleLock() {
    const val = Number(amount)

    if ((val || 0) == 0) return;
    // Early exit if value is ZERO


    if (chain?.id as number !== Number(1)) switchNetwork?.(Number(1));

    await handleAllowance({
      token: VCX_LP,
      amount: (val * (10 ** 18) || 0),
      account: account as Address,
      spender: VOTING_ESCROW,
      clients: {
        publicClient,
        walletClient: walletClient as WalletClient
      }
    })
    // When approved continue to deposit
    createLock(({ amount: (val || 0), days, account: account as Address, clients: { publicClient, walletClient: walletClient as WalletClient } }));
    setShowModal(false);
  }

  function showLpModal(): void {
    setShowModal(false);
    setShowLpModal(true)
  }


  return (
    <Modal visibility={[showModal, setShowModal]}>
      <>
        {step === 0 && <LockVxcInfo />}
        {step === 1 && <VotingPowerInfo />}
        {step === 2 && <LockVcxInterface amountState={[amount, setAmount]} daysState={[days, setDays]} showLpModal={showLpModal} />}
        {step === 3 && <LockPreview amount={amount} days={days} />}

        <div className="space-y-4">
          {step < 3 && <MainActionButton label="Next" handleClick={() => setStep(step + 1)} />}
          {step === 3 && <MainActionButton label={"Lock VCX LP"} handleClick={handleLock} />}
          {step === 0 && <SecondaryActionButton label="Skip" handleClick={() => setStep(2)} />}
          {step === 1 || step === 3 && <SecondaryActionButton label="Back" handleClick={() => setStep(step - 1)} />}
        </div>
      </>
    </Modal >
  )
}
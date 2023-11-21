import Modal from "@/components/modal/Modal";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Address, WalletClient, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import OptionInfo from "@/components/vepop/modals/oPop/OptionInfo";
import ExerciseOPopInterface from "@/components/vepop/modals/oPop/ExerciseOPopInterface";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { getVeAddresses } from "@/lib/utils/addresses";
import { handleAllowance } from "@/lib/approve";
import { parseEther } from "viem";
import { exerciseOPop } from "@/lib/oPop/interactions";

const { WETH, oVCX } = getVeAddresses();

export default function OPopModal({ show }: { show: [boolean, Dispatch<SetStateAction<boolean>>] }): JSX.Element {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = show;

  const [amount, setAmount] = useState<string>("0");
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<string>("0");

  useEffect(() => {
    if (!showModal) setStep(0)
    setAmount("0");
    setMaxPaymentAmount("0");
  },
    [showModal]
  )

  async function handleExerciseOPop() {
    if ((Number(amount) || 0) == 0) return;
    // Early exit if value is ZERO

    if (chain?.id as number !== Number(1)) switchNetwork?.(Number(1));

    await handleAllowance({
      token: WETH,
      amount: (Number(amount) * (10 ** 18) || 0),
      account: account as Address,
      spender: oVCX,
      clients: {
        publicClient,
        walletClient: walletClient as WalletClient
      }
    })

    exerciseOPop({
      account: account as Address,
      amount: parseEther(Number(amount).toLocaleString("fullwide", { useGrouping: false })),
      maxPaymentAmount: parseEther(maxPaymentAmount),
      clients: { publicClient, walletClient: walletClient as WalletClient }
    });
    setShowModal(false);
  }

  return (
    <Modal visibility={[showModal, setShowModal]}>
      <>
        {step === 0 && <OptionInfo />}
        {step === 1 && <ExerciseOPopInterface amountState={[amount, setAmount]} maxPaymentAmountState={[maxPaymentAmount, setMaxPaymentAmount]} />}

        <div className="space-y-4">
          {step === 0 && <MainActionButton label="Next" handleClick={() => setStep(step + 1)} />}
          {step === 1 && <MainActionButton label={"Exercise oVCX"} handleClick={handleExerciseOPop} />}
          {step === 1 && <SecondaryActionButton label="Back" handleClick={() => setStep(step - 1)} />}
        </div>
      </>
    </Modal >
  )
}
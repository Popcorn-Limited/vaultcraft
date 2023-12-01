import { Address, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WalletClient } from "viem";
import Modal from "@/components/modal/Modal";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { getVeAddresses } from "@/lib/utils/addresses";
import LpInfo from "@/components/boost/modals/lp/LpInfo";
import LpInterface from "@/components/boost/modals/lp/LpInterface";
import { handleAllowance } from "@/lib/approve";
import ActionSteps from "@/components/vault/ActionSteps";
import { ActionStep, POOL_DEPOSIT_STEPS } from "@/lib/vault/getActionSteps";
import { depositIntoPool } from "@/lib/balancer/interactions";

const {
  BalancerPool: VCX_LP,
  BalancerVault,
  VCX,
  WETH
} = getVeAddresses()

export default function LpModal({ show }: { show: [boolean, Dispatch<SetStateAction<boolean>>] }): JSX.Element {
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const [modalStep, setModalStep] = useState(0);
  const [showModal, setShowModal] = show;

  const [wethAmount, setWethAmount] = useState<string>("0");
  const [vcxAmount, setVcxAmount] = useState<string>("0");

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>(POOL_DEPOSIT_STEPS)

  useEffect(() => {
    if (!showModal) {
      setModalStep(0)
      setStepCounter(0)
      setSteps(POOL_DEPOSIT_STEPS)
      setWethAmount("0")
      setVcxAmount("0")
    }
  },
    [showModal]
  )

  async function handlePoolDeposit() {
    const wethVal = Math.trunc(Number(wethAmount) * (1e18))
    const vcxVal = Math.trunc(Number(vcxAmount) * (1e18))

    // Early exit if values are ZERO
    if (wethVal === 0 || vcxVal === 0) return;

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
          token: WETH,
          amount: wethVal,
          account: account as Address,
          spender: BalancerVault,
          clients: {
            publicClient,
            walletClient: walletClient as WalletClient
          }
        })
        break;
      case 1:
        success = await handleAllowance({
          token: VCX,
          amount: vcxVal,
          account: account as Address,
          spender: BalancerVault,
          clients: {
            publicClient,
            walletClient: walletClient as WalletClient
          }
        })
        break;
      case 2:
        success = await depositIntoPool({
          maxAmountsIn: [
            BigInt(wethVal.toLocaleString("fullwide", { useGrouping: false })),
            BigInt(vcxVal.toLocaleString("fullwide", { useGrouping: false }))
          ],
          account: account as Address,
          clients: {
            publicClient,
            walletClient: walletClient as WalletClient
          }
        })
        break;
    }

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy)
    setStepCounter(newStepCounter)
  }


  return (
    <Modal visibility={[showModal, setShowModal]}>
      <>
        {modalStep === 0 && <LpInfo />}
        {modalStep === 1 && <LpInterface vcxAmountState={[vcxAmount, setVcxAmount]} wethAmountState={[wethAmount, setWethAmount]} />}

        {
          modalStep === 1 &&
          <div className="w-full flex justify-center mt-2 mb-4">
            <ActionSteps steps={POOL_DEPOSIT_STEPS} stepCounter={stepCounter} />
          </div>
        }

        <div className="space-y-4">
          {modalStep === 0 && <MainActionButton label="Next" handleClick={() => setModalStep(modalStep + 1)} />}
          {modalStep === 1 &&
            <>
              {stepCounter < 3 ?
                < MainActionButton label={steps[stepCounter].label} handleClick={handlePoolDeposit} disabled={vcxAmount === "0" || wethAmount === "0"} /> :
                < MainActionButton label={"Close Modal"} handleClick={() => setShowModal(false)} />
              }
            </>
          }
        </div>
      </>
    </Modal >
  )
}
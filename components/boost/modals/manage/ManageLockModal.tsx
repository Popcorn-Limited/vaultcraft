import {
  Address,
  useAccount,
  useBalance,
  useNetwork,
  usePublicClient,
  useSwitchNetwork,
  useWalletClient,
} from "wagmi";
import { WalletClient } from "viem";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useLockedBalanceOf from "@/lib/gauges/useLockedBalanceOf";
import Modal from "@/components/modal/Modal";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { showErrorToast } from "@/lib/toasts";
import { handleAllowance } from "@/lib/approve";
import {
  increaseLockAmount,
  increaseLockTime,
  withdrawLock,
} from "@/lib/gauges/interactions";
import SelectManagementOption from "@/components/boost/modals/manage/SelectManagementOption";
import IncreaseStakeInterface from "@/components/boost/modals/manage/IncreaseStakeInterface";
import IncreaseStakePreview from "@/components/boost/modals/manage/IncreaseStakePreview";
import IncreaseTimeInterface from "@/components/boost/modals/manage/IncreaseTimeInterface";
import IncreaseTimePreview from "@/components/boost/modals/manage/IncreaseTimePreview";
import UnstakePreview from "@/components/boost/modals/manage/UnstakePreview";
import { VCX_LP, VOTING_ESCROW } from "@/lib/constants";

export enum ManagementOption {
  IncreaseLock,
  IncreaseTime,
  Unlock,
}

export default function ManageLockModal({
  show,
  setShowLpModal,
}: {
  show: [boolean, Dispatch<SetStateAction<boolean>>];
  setShowLpModal: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { address: account } = useAccount();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [showModal, setShowModal] = show;
  const [step, setStep] = useState(0);
  const [mangementOption, setMangementOption] = useState();

  const { data: veBal } = useBalance({
    chainId: 1,
    address: account,
    token: VOTING_ESCROW,
  });
  const { data: lockedBal } = useLockedBalanceOf({
    chainId: 1,
    address: VOTING_ESCROW,
    account: account as Address,
  }) as { data: { amount: bigint; end: bigint } };

  const [amount, setAmount] = useState<string>("0");
  const [days, setDays] = useState(7);
  const isIncreaseLockValid =
    (Number(lockedBal?.end) - Math.floor(Date.now() / 1000)) / 604800 < 207;
  const isExpired = Number(lockedBal?.end) < Math.floor(Date.now() / 1000);

  useEffect(() => {
    if (!showModal) {
      setStep(0);
      // @ts-ignore
      setMangementOption(null);
    }
  }, [showModal]);

  async function handleMainAction() {
    if (chain?.id !== Number(1)) {
      try {
        await switchNetworkAsync?.(Number(1));
      } catch (error) {
        return;
      }
    }
    const val = Number(amount);

    const clients = {
      publicClient,
      walletClient: walletClient as WalletClient,
    };

    if (mangementOption === ManagementOption.IncreaseLock) {
      if ((val || 0) == 0) return;
      await handleAllowance({
        token: VCX_LP,
        amount: val * 10 ** 18 || 0,
        account: account as Address,
        spender: VOTING_ESCROW,
        clients: {
          publicClient,
          walletClient: walletClient as WalletClient,
        },
      });
      increaseLockAmount({ amount: val, account: account as Address, clients });
    }

    if (mangementOption === ManagementOption.IncreaseTime)
      increaseLockTime({
        unlockTime: Number(lockedBal?.end || 0) + days * 86400,
        account: account as Address,
        clients,
      });
    if (mangementOption === ManagementOption.Unlock)
      withdrawLock({ account: account as Address, clients });

    setShowModal(false);
  }

  function showLpModal(): void {
    setShowModal(false);
    setShowLpModal(true);
  }

  return (
    <Modal visibility={[showModal, setShowModal]}>
      <>
        {step === 0 && (
          <SelectManagementOption
            setStep={setStep}
            setManagementOption={setMangementOption}
          />
        )}

        {mangementOption === ManagementOption.IncreaseLock && (
          <>
            {step === 1 && (
              <>
                <IncreaseStakeInterface
                  amountState={[amount, setAmount]}
                  lockedBal={lockedBal}
                  showLpModal={showLpModal}
                />
                <MainActionButton
                  label="Next"
                  handleClick={() => setStep(step + 1)}
                />
              </>
            )}
            {step === 2 && (
              <>
                <IncreaseStakePreview amount={amount} lockedBal={lockedBal} />
                <MainActionButton
                  label={"Increase Lock Amount"}
                  handleClick={handleMainAction}
                />
              </>
            )}
          </>
        )}
        {mangementOption === ManagementOption.IncreaseTime && (
          <>
            {step === 1 && (
              <>
                <IncreaseTimeInterface
                  daysState={[days, setDays]}
                  lockedBal={lockedBal}
                />
                {isIncreaseLockValid ? (
                  <MainActionButton
                    label="Next"
                    handleClick={() => setStep(step + 1)}
                  />
                ) : (
                  <SecondaryActionButton
                    label="Already Max Locked"
                    handleClick={() =>
                      showErrorToast(
                        "You've already locked your stake for the maximum time allowed"
                      )
                    }
                  />
                )}
              </>
            )}
            {step === 2 && (
              <>
                <IncreaseTimePreview days={days} lockedBal={lockedBal} />
                <MainActionButton
                  label="Increase Lock Time"
                  handleClick={handleMainAction}
                />
              </>
            )}
          </>
        )}
        {mangementOption === ManagementOption.Unlock && (
          <>
            <UnstakePreview
              amount={Number(lockedBal?.amount) / 1e18}
              isExpired={isExpired}
            />
            <MainActionButton label="Unlock" handleClick={handleMainAction} />
          </>
        )}
      </>
    </Modal>
  );
}

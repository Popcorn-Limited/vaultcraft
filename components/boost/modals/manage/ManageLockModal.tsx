import {
  useAccount,
  useBalance,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
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
import { VCX_LP, VOTING_ESCROW } from "@/lib/constants/addresses";
import BroadcastVeBalanceInterface from "./BroadcastVeBalanceInterface";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { Address } from "viem";

export enum ManagementOption {
  IncreaseLock,
  IncreaseTime,
  Unlock,
  BroadcastVeBalance
}

export default function ManageLockModal({
  show,
  setShowLpModal,
  setShowSyncModal
}: {
  show: [boolean, Dispatch<SetStateAction<boolean>>];
  setShowLpModal: Dispatch<SetStateAction<boolean>>;
  setShowSyncModal: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const { switchChainAsync } = useSwitchChain();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [tokens, setTokens] = useAtom(tokensAtom);

  const [showModal, setShowModal] = show;
  const [step, setStep] = useState(0);
  const [mangementOption, setMangementOption] = useState();

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
    if (!account) return

    if (chain?.id !== Number(1)) {
      try {
        await switchChainAsync?.({ chainId: 1 });
      } catch (error) {
        return;
      }
    }
    const val = Number(amount);

    const clients = {
      publicClient: publicClient!,
      walletClient: walletClient!,
    };

    let success = false
    if (mangementOption === ManagementOption.IncreaseLock) {
      if ((val || 0) === 0) return;
      await handleAllowance({
        token: VCX_LP,
        amount: val * 10 ** 18 || 0,
        account: account,
        spender: VOTING_ESCROW,
        clients
      });
      success = await increaseLockAmount({ amount: val, account, clients });
    }

    if (mangementOption === ManagementOption.IncreaseTime)
      increaseLockTime({
        unlockTime: Number(lockedBal?.end || 0) + days * 86400,
        account: account as Address,
        clients,
      });
    if (mangementOption === ManagementOption.Unlock)
      success = await withdrawLock({ account: account, clients });

    if (success) {
      await mutateTokenBalance({
        tokensToUpdate: [VCX_LP],
        account,
        tokensAtom: [tokens, setTokens],
        chainId: 1
      })
    }

    setShowModal(false);
    setShowSyncModal(true);
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
        {mangementOption === ManagementOption.BroadcastVeBalance && (
          <>
            <BroadcastVeBalanceInterface
              setShowModal={setShowModal}
            />
          </>
        )}
      </>
    </Modal>
  );
}

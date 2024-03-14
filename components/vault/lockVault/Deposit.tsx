import { Dispatch, FormEventHandler, SetStateAction } from "react";
import { formatUnits } from "viem";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import InputNumber from "@/components/input/InputNumber";
import { calcUnlockTime } from "@/lib/gauges/utils";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { LockVaultData, Token } from "@/lib/types";
import { useAccount } from "wagmi";

function LockTimeButton({
  label,
  isActive,
  handleClick,
}: {
  label: string;
  isActive: boolean;
  handleClick: Function;
}): JSX.Element {
  return (
    <button
      className={`w-10 h-10 border border-[#C8C8C8] hover:bg-[#23262f] rounded-lg ${
        isActive ? "bg-white text-black" : "text-white"
      }`}
      onClick={() => handleClick()}
    >
      {label}
    </button>
  );
}

interface DepositProps {
  vaultData: LockVaultData;
  tokenOptions: Token[];
  inputBalState: [string, Dispatch<SetStateAction<string>>];
  daysState: [string, Dispatch<SetStateAction<string>>];
  handleTokenSelect: (input: Token, output: Token) => void;
  inputToken: Token;
}

export default function Deposit({
  vaultData,
  tokenOptions,
  inputBalState,
  daysState,
  handleTokenSelect,
  inputToken,
}: DepositProps): JSX.Element {
  const { address: account } = useAccount();
  const [inputBalance, setInputBalance] = inputBalState;
  const [days, setDays] = daysState;

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputBalance(validateInput(value).isValid ? value : "0");
  }

  const handleSetDays: FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    let newDays = validateInput(value).isValid ? value : "0";
    if (Number(newDays) > 180) newDays = "180";
    if (Number(newDays) < 7) newDays = "7";

    setDays(newDays);
  };

  function handleMaxClick() {
    if (!vaultData.asset) return;
    const stringBal = vaultData.asset.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), vaultData.asset.decimals);
    const formatted = formatUnits(rounded, vaultData.asset.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
  }

  return (
    <>
      <InputTokenWithError
        captionText={"Deposit Amount"}
        onSelectToken={(option) => handleTokenSelect(option, vaultData.vault)}
        onMaxClick={handleMaxClick}
        chainId={vaultData.chainId}
        value={inputBalance}
        onChange={handleChangeInput}
        selectedToken={inputToken}
        errorMessage={""}
        tokenList={tokenOptions.filter(
          (option) => option.address !== vaultData.address
        )}
        allowSelection
        allowInput
      />
      <div className="mt-6">
        <div className="flex flex-row items-center justify-between">
          <p className="text-primary font-semibold mb-1">Lockup Time</p>
          <p className="w-32 text-secondaryLight">Custom Time</p>
        </div>
        {account ? (
          <>
            {vaultData.lock.daysToUnlock === 0 && (
              <div className="flex flex-row items-center justify-between">
                <LockTimeButton
                  label="1W"
                  isActive={days === "7"}
                  handleClick={() => setDays("7")}
                />
                <LockTimeButton
                  label="1M"
                  isActive={days === "30"}
                  handleClick={() => setDays("30")}
                />
                <LockTimeButton
                  label="3M"
                  isActive={days === "90"}
                  handleClick={() => setDays("90")}
                />
                <LockTimeButton
                  label="6M"
                  isActive={days === "180"}
                  handleClick={() => setDays("180")}
                />
                <div className="w-32 flex px-5 py-2 items-center rounded-lg border border-customLightGray">
                  <InputNumber
                    onChange={handleSetDays}
                    value={days}
                    autoComplete="off"
                    autoCorrect="off"
                    type="text"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    placeholder={"0.0"}
                    minLength={1}
                    maxLength={79}
                    spellCheck="false"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-row items-center justify-between">
            <LockTimeButton
              label="1W"
              isActive={days === "7"}
              handleClick={() => setDays("7")}
            />
            <LockTimeButton
              label="1M"
              isActive={days === "30"}
              handleClick={() => setDays("30")}
            />
            <LockTimeButton
              label="3M"
              isActive={days === "90"}
              handleClick={() => setDays("90")}
            />
            <LockTimeButton
              label="6M"
              isActive={days === "180"}
              handleClick={() => setDays("180")}
            />
            <div className="w-32 flex px-5 py-2 items-center rounded-lg border border-customLightGray">
              <InputNumber
                onChange={handleSetDays}
                value={days}
                autoComplete="off"
                autoCorrect="off"
                type="text"
                pattern="^[0-9]*[.,]?[0-9]*$"
                placeholder={"0.0"}
                minLength={1}
                maxLength={79}
                spellCheck="false"
              />
            </div>
          </div>
        )}
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlocks at:</p>
          <p>
            {Number(days) > 0
              ? new Date(
                  Number(new Date()) + Number(days) * 86400000
                ).toLocaleDateString()
              : "DD.MM.YYYY"}
          </p>
        </div>
      </div>
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-customLightGray" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#141416] px-4">
            <ArrowDownIcon
              className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full cursor-pointer hover:text-primary hover:border-primary"
              aria-hidden="true"
              onClick={() => {}}
            />
          </span>
        </div>
      </div>
      <InputTokenWithError
        captionText={"Output Amount"}
        onSelectToken={(option) => {}}
        onMaxClick={() => {}}
        chainId={vaultData.chainId}
        value={
          (Number(inputBalance) * Number(vaultData.asset?.price)) /
            Number(vaultData.vault?.price) || 0
        }
        onChange={() => {}}
        selectedToken={vaultData.vault}
        errorMessage={""}
        tokenList={[]}
        allowSelection={false}
        allowInput={false}
      />
      <InputTokenWithError
        captionText={"Reward Shares"}
        onSelectToken={(option) => {}}
        onMaxClick={() => {}}
        chainId={vaultData.chainId}
        value={
          ((Number(inputBalance) * Number(vaultData.asset?.price)) /
            Number(vaultData.vault?.price)) *
            (Number(days) / 180) || 0
        }
        onChange={() => {}}
        selectedToken={vaultData.vault}
        errorMessage={""}
        tokenList={[]}
        allowSelection={false}
        allowInput={false}
      />
    </>
  );
}

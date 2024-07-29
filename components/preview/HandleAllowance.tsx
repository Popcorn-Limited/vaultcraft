import { ActionStep } from "@/lib/getActionSteps";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Address } from "viem";
import InputTokenStatic from "@/components/preview/StaticInputToken";
import MainActionButton from "@/components/button/MainActionButton";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ReserveData, Token, UserAccountData, VaultData, ZapProvider } from "@/lib/types";

function getStepColor(preFix: string, step: any): string {
  if (step.loading || step.success) return `${preFix}-primaryYellow`;
  if (step.error) return `${preFix}-red-500`;
  return `${preFix}-customGray500`;
}

interface HandleAllowanceProps {
  step: ActionStep;
  inputToken: Token;
  inputAmount: string;
  chainId: number;
  isLast: boolean;
  stepNumber: number;
}

export default function HandleAllowanceStep({
  step,
  inputAmount,
  inputToken,
  chainId,
  isLast,
  stepNumber
}: HandleAllowanceProps): JSX.Element {
  const inputProps = { readOnly: true }
  
  return (
    <div className="flex flex-row items-center w-4/5">
        <div className="md:flex md:flex-row md:space-x-20">
          <div className="w-full">
            <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-5 text-start">
              {/* inputAmount */}
              <InputTokenStatic
                captionText={`Handle allowance for ${inputToken.name}`}
                chainId={chainId}
                value={inputAmount}
                selectedToken={inputToken}
                errorMessage={""}
                {...inputProps} />

              <div className="flex flex-row items-center w-full">
                <div key={step.label} className="w-full flex flex-row place-content-center h-1">
                  <div
                    className={`w-8 h-8 rounded-full border leading-none flex justify-center items-center cursor-default bg-opacity-40
                      ${isLast
                        ? "border-primaryYellow bg-primaryYellow"
                        : `${getStepColor("border", step)} ${getStepColor(
                          "bg",
                          step
                        )}`
                      }`}
                  >
                    {stepNumber}
                    {step.loading && (
                      <img src="/images/loader/puff.svg" className={`h-6 w-6`} />
                    )}
                    {!step.loading && step.error && (
                      <XMarkIcon className="h-4 w-4 text-red-500" />
                    )}
                    {!step.loading && step.success && (
                      <img
                        src="/images/icons/checkIconYellow.svg"
                        className={`h-4 w-4`}
                      />
                    )}
                  </div>
                  {/* <ArrowRightIcon
                    className={`w-6 h-4 ${getStepColor("text", step)}`}
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

import { ActionStep } from "@/lib/getActionSteps";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Address } from "viem";
import InputTokenStatic from "@/components/preview/StaticInputToken";
import MainActionButton from "@/components/button/MainActionButton";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ReserveData, Token, UserAccountData, VaultData, ZapProvider } from "@/lib/types";
import HandleAllowanceStep from "../preview/HandleAllowance";
import ActionStepComponent from "../preview/ActionStep";

function getStepColor(preFix: string, step: any): string {
  if (step.loading || step.success) return `${preFix}-primaryYellow`;
  if (step.error) return `${preFix}-red-500`;
  return `${preFix}-customGray500`;
}

interface ActionStepsProps {
  steps: ActionStep[];
  stepCounter: number;
  inputToken: Token;
  inputAmount: string;
  outputToken: Token;
  vaultAsset: Token;
  chainId: number;
}

export default function ActionSteps({
  steps,
  stepCounter,
  inputAmount,
  inputToken,
  outputToken,
  vaultAsset,
  chainId
}: ActionStepsProps): JSX.Element {
  const inputProps = { readOnly: true }

  return (
    <div className="flex flex-row items-center">
      {steps.map((step, i) => (
        <div className="w-full h-full md:space-x-20">
          <div className="w-full">
          {(step.label === "Handle Allowance") && (
            <HandleAllowanceStep isLast={i===stepCounter} step={step} inputToken={vaultAsset} inputAmount={inputAmount} chainId={chainId} stepNumber={i + 1}/>
          )}
          {(step.label === "Handle Zap Allowance") && (
            <HandleAllowanceStep isLast={i===stepCounter} step={step} inputToken={inputToken} inputAmount={inputAmount} chainId={chainId}  stepNumber={i + 1}/>
          )}
          {(step.label.includes("Zap") && step.label !== "Handle Zap Allowance") && (
            <ActionStepComponent isLast={i===stepCounter} stepNumber={i + 1} step={step} inputAmount={inputAmount} inputToken={inputToken} outputToken={vaultAsset} chainId={chainId}/>
          )}
          {(!step.label.includes("Zap") && !step.label.includes("Allowance")) && (
            <ActionStepComponent isLast={i===stepCounter}  stepNumber={i + 1} step={step} inputAmount={inputAmount} inputToken={vaultAsset} outputToken={outputToken} chainId={chainId}/>
          )}
          </div>
        </div>
      ))}
    </div>
  );
}

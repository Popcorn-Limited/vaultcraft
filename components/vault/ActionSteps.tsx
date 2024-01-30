import { ActionStep } from "@/lib/getActionSteps";
import { XMarkIcon } from "@heroicons/react/24/outline"

function getStepColor(preFix: string, step: any): string {
  if (step.loading || step.success) return `${preFix}-[#DFFF1C]`
  if (step.error) return `${preFix}-red-500`
  return `${preFix}-gray-500`
}

interface ActionStepsProps {
  steps: ActionStep[];
  stepCounter: number;
}

export default function ActionSteps({ steps, stepCounter }: ActionStepsProps): JSX.Element {
  return (
    <div className="flex flex-row items-center">
      {steps.map((step, i) =>
        <div key={step.label} className="flex flex-row items-center">
          <div
            className={`w-8 h-8 rounded-full border leading-none flex justify-center items-center cursor-default bg-opacity-40
              ${i === stepCounter ? "border-[#DFFF1C] bg-[#DFFF1C]" : `${getStepColor("border", step)} ${getStepColor("bg", step)}`}`}
          >
            {step.loading && <img src="/images/loader/puff.svg" className={`h-6 w-6`} />}
            {!step.loading && step.error && <XMarkIcon className="h-4 w-4 text-red-500" />}
            {!step.loading && step.success && <img src="/images/icons/checkIconYellow.svg" className={`h-4 w-4`} />}
            {!step.loading && !step.error && !step.success && <div className={`rounded-full h-3 w-3 ${i === stepCounter ? "bg-[#DFFF1C]" : getStepColor("bg", step)}`} />}
          </div>
          {step.step < steps.length && <p className={`mb-4 ${getStepColor("text", step)} leading-0`}>___</p>}
        </div>
      )}
    </div>
  )
}
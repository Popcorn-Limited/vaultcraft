import { ActionStep } from "@/lib/getActionSteps";

function getStepColor(preFix: string, step: any): string {
  if (step.loading || step.success) return `${preFix}-primaryGreen`;
  if (step.error) return `${preFix}-red-500`;
  return `${preFix}-customGray500`;
}

interface ActionStepsProps {
  steps: ActionStep[];
  stepCounter: number;
}

export default function ActionSteps({
  steps,
  stepCounter,
}: ActionStepsProps): JSX.Element {
  return (
    <nav aria-label="Progress" className="flex flex-col justify-center items-center">
      <ol role="list" className="flex items-center space-x-5">
        {steps.map((step) => (
          <li key={`${step.label}-${step.step}`}>
            {step.success ? (
              <a className="block h-5 w-5 rounded-full bg-primaryGreen hover:bg-primaryGreen">
                <span className="sr-only">{step.label}</span>
              </a>
            ) : step.loading ? (
              <a aria-current="step" className="relative flex items-center justify-center">
                <span aria-hidden="true" className="absolute flex h-10 w-10 p-px">
                  <span className="h-full w-full rounded-full bg-primaryGreen opacity-50" />
                </span>
                <span aria-hidden="true" className="relative block h-5 w-5 rounded-full bg-primaryGreen" />
                <span className="sr-only">{step.label}</span>
              </a>
            ) : (
              <a className="block h-5 w-5 rounded-full bg-customGray200 hover:bg-customGray200">
                <span className="sr-only">{step.label}</span>
              </a>
            )}
          </li>
        ))}
      </ol>
      <p className="text-sm font-medium text-white mt-2">
        Step {stepCounter + 1} of {steps.length}
      </p>
    </nav>
  )
}

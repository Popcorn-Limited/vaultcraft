import { ActionStep } from "@/lib/vault/getActionSteps"

function getStepColor(preFix: string, step: any): string {
  if (step.loading) return `${preFix}-[#DFFF1C]`
  if (step.success) return `${preFix}-green-500`
  if (step.error) return `${preFix}-red-500`
  return `${preFix}-white`
}

interface ActionStepsProps {
  steps: ActionStep[]
}

export default function ActionSteps({ steps }: ActionStepsProps): JSX.Element {
  return (
    <div className="flex flex-row items-center">
      {
        steps.map(i => <>
          <div key={i.label} className={`w-8 h-8 rounded-full border-2 leading-none flex justify-center items-center cursor-default ${getStepColor("border", i)}`}>
            {i.loading ? <img src="/images/loader/spinner.svg" /> : <p className={`mb-0.5 ${getStepColor("text", i)}`}>{i.step}</p>}
          </div>
          {i.step < steps.length && <p className={`mb-0.5 ${getStepColor("text", i)}`}>-----&gt;</p>}
        </>)
      }
    </div>
  )
}
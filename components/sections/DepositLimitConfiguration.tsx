import { useState } from "react";
import { useAtom } from 'jotai';
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { Switch } from '@headlessui/react'
import { limitAtom } from "@/lib/atoms/limits";
import { validateBigNumberInput } from "@/lib/helpers";
import Input from "@/components/inputs/Input";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";


function DepositLimitConfiguration() {
  const [limit, setLimit] = useAtom(limitAtom);
  const [enabled, setEnabled] = useState(Number(limit) > 0);

  function handleChange(value: string) {
    setLimit(parseUnits(validateBigNumberInput(value).formatted))
  }

  function handleToggle(checked: boolean) {
    if (!checked) handleChange("0")
    setEnabled(checked)
  }

  return (
    <section>
      <div className="flex flex-row items-center justify-between">
        <p className="text-sm text-white mb-2">Deposit Limit</p>
        <Switch
          checked={enabled}
          onChange={handleToggle}
          className={`${enabled ? 'bg-[#45B26B]' : 'bg-[#353945]'} 
          relative inline-flex items-center h-5 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
        >
          <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-[#777E90]'} first-letter:pointer-events-none inline-block h-3 w-3 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>
      <p className="text-gray-500 text-sm">
        Restricts the amount of a single deposit with either a minimum, a maximum, or both.
      </p>
      {enabled &&
        <div className="flex flex-col mt-4">
          <Input
            onChange={(e) => handleChange((e.target as HTMLInputElement).value)}
            defaultValue={formatUnits(limit)}
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={"0.0"}
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />
          <div className="border-2 border-[#353945] rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-[#23262F] text-white mt-4">
            <div className="flex flex-row">
              <ExclamationCircleIcon className="text-white w-16 h-16 mr-4 pb-2" />
              <p className="text-white text-sm">Deposits can be changed at any time after vault creation.
                Settings in this section are restrictive. Enable them to control who can deposit in your vault, and in what amounts.
                If disabled, anyone can deposit any amount into your vault. </p>
            </div>
          </div>
        </div>
      }
    </section>
  );
}

export default DepositLimitConfiguration;

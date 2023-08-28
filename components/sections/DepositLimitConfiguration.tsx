import { useState } from "react";
import { useAtom } from 'jotai';
import { Switch } from '@headlessui/react'
import Input from "@/components/inputs/Input";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { assetAtom, limitAtom } from "@/lib/atoms";
import { parseUnits } from "ethers/lib/utils";
import { validateBigNumberInput } from "@/lib/helpers";


function DepositLimitConfiguration() {
  const [asset] = useAtom(assetAtom);
  const [enabled, setEnabled] = useState(false);
  const [limit, setLimit] = useAtom(limitAtom);

  function handleToggle(checked: boolean) {
    setEnabled(checked)
  }

  function setMinimumDeposit (value: string) {
    setLimit((prevLimit) => ({
      ...prevLimit,
      minimum: parseUnits(validateBigNumberInput(value).formatted)
    }))
  }

  function setMaximumDeposit (value: string) {
    setLimit((prevLimit) => ({
      ...prevLimit,
      maximum: parseUnits(validateBigNumberInput(value).formatted)
    }))
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
          <div className="border-2 border-[#353945] rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-[#23262F] text-white mt-4">
            <div className="flex flex-row">
              <ExclamationCircleIcon className="text-white w-16 h-16 mr-4 pb-2" />
              <p className="text-white text-sm">Deposits can be changed at any time after vault creation.
                Settings in this section are restrictive. Enable them to control who can deposit in your vault, and in what amounts.
                If disabled, anyone can deposit any amount into your vault. </p>
            </div>
          </div>

          <div className={`flex flex-col gap-3 mt-4`}>
            <span className={`text-white`}>Minimum deposit amount</span>
            <Input
              onChange={(e) => setMinimumDeposit((e.target as HTMLInputElement).value)}
              placeholder={`0 ${asset.symbol === 'none' ? '' : asset.symbol}`}
              type="number"
            />
          </div>

          <div className={`flex flex-col gap-3 mt-4`}>
            <span className={`text-white`}>Maximum deposit amount</span>
            <Input
              placeholder={`0 ${asset.symbol === 'none' ? '' : asset.symbol}`}
              onChange={(e) => setMaximumDeposit((e.target as HTMLInputElement).value)}
              type="number"
            />
          </div>
        </div>
      }
    </section>
  );
}

export default DepositLimitConfiguration;

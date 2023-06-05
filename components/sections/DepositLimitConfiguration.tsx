import { Switch } from '@headlessui/react'
import { useState } from "react";
import Input from "../Input";
import { validateBigNumberInput } from "@/lib/fees";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { useAtom } from 'jotai';
import { limitAtom } from "@/lib/limits";

function DepositLimitConfiguration() {
  const [limit, setLimit] = useAtom(limitAtom);
  // @ts-ignore
  const [enabled, setEnabled] = useState(Number(limit.hex) > 0);

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
        <p className="text-white text-lg">Deposit Limit</p>
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
      {enabled && <div className="flex flex-col mt-4">
        <label className="text-white text-sm mb-3">Deposit Limit</label>
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
      </div>
      }
    </section>
  );
}

export default DepositLimitConfiguration;

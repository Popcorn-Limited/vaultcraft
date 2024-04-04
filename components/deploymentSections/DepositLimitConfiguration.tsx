import { useState } from "react";
import { useAtom } from "jotai";
import { Switch } from "@headlessui/react";
import Input from "@/components/input/Input";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { assetAtom, limitAtom } from "@/lib/atoms";
import { validateInput } from "@/lib/helpers";

function DepositLimitConfiguration() {
  const [asset] = useAtom(assetAtom);
  const [limit, setLimit] = useAtom(limitAtom);
  const [enabled, setEnabled] = useState(Number(limit.maximum) > 0);

  function handleToggle(checked: boolean) {
    setMaximumDeposit("0");
    setEnabled(checked);
  }

  function setMaximumDeposit(value: string) {
    const formattedValue = validateInput(value);
    if (formattedValue.isValid)
      setLimit((prevLimit) => ({
        ...prevLimit,
        maximum: formattedValue.formatted,
      }));
  }

  return (
    <section>
      <div className="flex flex-row items-center justify-between">
        <p className="text-sm text-white mb-2">Deposit Limit</p>
        <Switch
          checked={enabled}
          onChange={handleToggle}
          className={`${enabled ? "bg-green-500" : "bg-customNeutral100"} 
          relative inline-flex items-center h-5 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
        >
          <span
            aria-hidden="true"
            className={`${
              enabled ? "translate-x-6 bg-white" : "translate-x-1 bg-customGray500"
            } first-letter:pointer-events-none inline-block h-3 w-3 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>
      <p className="text-customGray500 text-sm">
        Restricts the maximum of assets that can be deposited into the vault.
      </p>
      {enabled && (
        <div className="flex flex-col mt-4">
          <div className="border-2 border-customNeutral100 rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-customNeutral200 text-white mt-4">
            <div className="flex flex-row">
              <ExclamationCircleIcon className="text-white w-16 h-16 mr-4 pb-2" />
              <p className="text-white text-sm">
                Settings in this section are restrictive. Enable them to control
                how much can be deposited into your vault. Deposit limits can be
                changed at any time after vault creation.
              </p>
            </div>
          </div>

          <div className={`flex flex-col gap-3 mt-4`}>
            <span className={`text-white`}>Maximum deposit amount</span>
            <Input
              placeholder={`0 ${asset.symbol === "none" ? "" : asset.symbol}`}
              onChange={(e) =>
                setMaximumDeposit((e.target as HTMLInputElement).value)
              }
              value={limit.maximum}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default DepositLimitConfiguration;

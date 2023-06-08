import { useAtom } from "jotai";
import { constants, utils } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { feeAtom } from "@/lib/atoms/fees";
import { validateBigNumberInput } from "@/lib/helpers";
import Fieldset from "@/components/inputs/Fieldset";
import Input from "@/components/inputs/Input";
import { useState } from "react";


const FEE_INPUTS = [
  { name: "Deposit Fee", key: "deposit", description: "Deposit fees are charged with every new deposit." },
  { name: "Withdrawal Fee", key: "withdrawal", description: "This fee is set separately for in-kind redemptions or for specific asset redemptions." },
  { name: "Performance Fee", key: "performance", description: "The performance fee is subject to a high-water mark." },
  { name: "Management Fee", key: "management", description: "The management fee accrues continuously and is automatically paid out with every deposit and redemption." },
];

interface Errors { [key: string]: string[] | undefined }

const DEFAULT_ERRORS: Errors = {
  deposit: undefined,
  withdrawal: undefined,
  performance: undefined,
  management: undefined,
}

function FeeConfiguration() {
  const [fees, setFee] = useAtom(feeAtom);
  const [feeErrors, setFeeErrors] = useState(DEFAULT_ERRORS)
  const [recipientErrors, setRecipientErrors] = useState<string[] | undefined>(undefined)

  function handleChange(value: string, key: string) {
    setFee({
      ...fees,
      [key]: parseUnits(String(Number(validateBigNumberInput(value).formatted) / 100)),
    });
  }

  function verifyFees() {
    // @ts-ignore
    const totalFee = Object.keys(DEFAULT_ERRORS).reduce((acc, key) => acc + Number(fees[key]), 0) >= 1000000000000000000;

    const newErrors: Errors = {}
    Object.keys(DEFAULT_ERRORS).forEach((key) => {
      const inputErrors = []
      // @ts-ignore
      if (Number(fees[key]) >= 1000000000000000000) inputErrors.push("Fee must be less than 100%")
      if (totalFee) inputErrors.push("Total fee must be less than 100%")
      newErrors[key] = inputErrors.length > 0 ? inputErrors : undefined
    })
    setFeeErrors(newErrors)
  }

  function verifyRecipient() {
    const newErrors: string[] = []
    if (!utils.isAddress(fees.recipient)) newErrors.push("Recipient must be a valid address")
    if (fees.recipient === constants.AddressZero) newErrors.push("Recipient must not be the zero address")
    
    setRecipientErrors(newErrors.length > 0 ? newErrors : undefined)
  }

  return (
    <section className="flex flex-col gap-y-4 divide-y-2 divide-[#353945]">
      {FEE_INPUTS.map((input) => {
        return (
          <div key={`fee-element-${input.name}`}>
            <Fieldset label={input.name} description={input.description}>
              <Input
                onChange={(e) =>
                  handleChange(
                    (e.target as HTMLInputElement).value,
                    input.key
                  )
                }
                // @ts-ignore
                defaultValue={String(Number(formatUnits(fees[input.key])) * 100)}
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                type="text"
                pattern="^[0-9]*[.,]?[0-9]*$"
                placeholder={"0.0"}
                minLength={1}
                maxLength={79}
                spellCheck="false"
                info={"Enter a value in percent (0-100)"}
                onBlur={verifyFees}
                errors={feeErrors[input.key]}
              />
            </Fieldset>
          </div>
        );
      })}
      <div className="">
        <Fieldset className="flex-grow" label="Fee Recipient" description="Fee Recipient Description">
          <Input
            onChange={(e) =>
              setFee((prefState) => {
                return {
                  ...prefState,
                  recipient: (e.target as HTMLInputElement).value,
                };
              })
            }
            defaultValue={fees.recipient}
            placeholder="0x00"
            autoComplete="off"
            autoCorrect="off"
            info={"Required"}
            onBlur={verifyRecipient}
            errors={recipientErrors}
          />
        </Fieldset>
      </div>
    </section>
  );
}

export default FeeConfiguration;

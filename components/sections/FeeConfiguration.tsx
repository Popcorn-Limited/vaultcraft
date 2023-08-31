import { useAtom } from "jotai";
import { useState } from "react";
import { constants, utils } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { feeAtom } from "@/lib/atoms/fees";
import { validateBigNumberInput } from "@/lib/helpers";
import Fieldset from "@/components/inputs/Fieldset";
import Input from "@/components/inputs/Input";

enum INPUT_TYPES {
  PERCENTAGE = "PERCENTAGE",
  ADDRESS = "ADDRESS",
}

const FEE_INPUTS = [
  {
    name: "Deposit Fee",
    description: "Deposit fees are charged with every new deposit.",
    inputs: [
      {
        title: "Deposit Fee",
        placeholder: "0%",
        type: INPUT_TYPES.PERCENTAGE,
        key: "deposit",
      }
    ]
  },
  {
    name: "Withdraw Fee",
    description: "Withdrawal fees are charged with every new withdrawal.",
    inputs: [
      {
        title: "Withdraw Fee Rate",
        placeholder: "0%",
        type: INPUT_TYPES.PERCENTAGE,
        key: "withdrawal",
      }
    ]
  },
  {
    name: "Charge Performance Fee",
    description: "Charge a fee whenever the share value reaches a new all time high.",
    inputs: [
      {
        title: "Performance Fee Rate",
        placeholder: "0%",
        type: INPUT_TYPES.PERCENTAGE,
        key: "performance",
      }
    ]
  },
  {
    name: "Charge Management Fee",
    description: "Charge a continues fee on the total value of deposits.",
    inputs: [
      {
        title: "Management Fee Rate",
        placeholder: "0%",
        type: INPUT_TYPES.PERCENTAGE,
        key: "management",
      }
    ]
  },
];

interface Errors { [key: string]: string[] | undefined }

function FeeConfiguration() {
  const [fees, setFee] = useAtom(feeAtom);
  const [errors, setErrors] = useState<Errors>()
  const [recipientErrors, setRecipientErrors] = useState<string[] | undefined>(undefined)
  const [areCategoriesOpened, setAreCategoriesOpened] = useState(FEE_INPUTS.map(item => false))

  function handlePercentageChange(value: string, key: string) {
    setFee({
      ...fees,
      [key]: parseUnits(validateBigNumberInput(value).formatted),
    });
  }

  function handleAddressChange(value: string, key: string) {
    setFee({
      ...fees,
      [key]: value,
    });
  }

  function verifyFees() {
    // @ts-ignore
    const totalFee = Object.keys(fees).filter(key => typeof fees[key] !== 'string').reduce((acc, key) => acc + Number(fees[key]), 0) >= 100000000000000000000;

    const newErrors: Errors = {}
    Object.entries(fees).forEach(el => {
      const [key, val] = el
      const inputErrors = []

      if (typeof val !== 'string') {
        if (Number(val) >= 100000000000000000000) inputErrors.push("Fee must be less than 100%")
        if (Number(val) < 0) inputErrors.push("Fee must be greater or equal to 0%")
        if (totalFee) inputErrors.push("Total fee must be less than 100%")
      }

      if (typeof val === 'string') {
        if (!utils.isAddress(val) && val.length > 0) inputErrors.push("Recipient must be a valid address")
        if (val === constants.AddressZero) inputErrors.push("Recipient must not be the zero address")
      }

      newErrors[key] = inputErrors.length > 0 ? inputErrors : undefined
    })
    setErrors(newErrors)
  }

  function verifyRecipient() {
    const newErrors: string[] = []
    if (!utils.isAddress(fees.recipient)) newErrors.push("Recipient must be a valid address")
    if (fees.recipient === constants.AddressZero) newErrors.push("Recipient must not be the zero address")
    
    setRecipientErrors(newErrors.length > 0 ? newErrors : undefined)
  }

  return (
    <section className="flex flex-col gap-y-4 divide-y-2 divide-[#353945]">
      {FEE_INPUTS.map((category, idx) => {
        return (
          <div key={`fee-element-${category.name}`}>
            <Fieldset
              label={category.name}
              description={category.description}
              isOpened={areCategoriesOpened[idx]}
              handleIsOpenedChange={isOpened => {
                const newAreCategoriesOpened = [...areCategoriesOpened]
                newAreCategoriesOpened[idx] = isOpened
                setAreCategoriesOpened(newAreCategoriesOpened)
              }}
            >
              <div className={`flex flex-col gap-4`}>
                {category.inputs.map(input => {
                  return (
                    <div className={``} key={`fee-input-${input.key}`}>
                      <label className="text-white text-sm mb-3">{input.title}</label>
                      <Input
                        onChange={
                          e => {
                            if (input.type === INPUT_TYPES.PERCENTAGE) {
                              handlePercentageChange(
                                (e.target as HTMLInputElement).value,
                                input.key
                              )
                            } else {
                              handleAddressChange(
                                (e.target as HTMLInputElement).value,
                                input.key
                              )
                            }
                          }
                        }
                        type="text"
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        autoComplete="off"
                        autoCorrect="off"
                        placeholder={input.placeholder}
                        minLength={1}
                        maxLength={79}
                        spellCheck="false"
                        onBlur={verifyFees}
                        errors={errors?.[input.key]}
                      />
                    </div>
                  )
                })}
              </div>
            </Fieldset>
          </div>
        );
      })}
      <div className="">
       <Fieldset className="flex-grow" label="Fee Recipient" description="Which address should receive the fees?" isSwitchNeeded={false}>
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

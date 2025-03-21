import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { feeAtom } from "@/lib/atoms/fees";
import { validateInput } from "@/lib/utils/helpers";
import Fieldset from "@/components/input/Fieldset";
import Input from "@/components/input/Input";
import { ADDRESS_ZERO } from "@/lib/constants";
import { isAddress } from "viem";

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
      },
    ],
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
      },
    ],
  },
  {
    name: "Performance Fee",
    description:
      "Charge a fee whenever the share value reaches a new all time high.",
    inputs: [
      {
        title: "Performance Fee Rate",
        placeholder: "0%",
        type: INPUT_TYPES.PERCENTAGE,
        key: "performance",
      },
    ],
  },
  {
    name: "Management Fee",
    description: "Charge a continuous fee on the total value of deposits.",
    inputs: [
      {
        title: "Management Fee Rate",
        placeholder: "0%",
        type: INPUT_TYPES.PERCENTAGE,
        key: "management",
      },
    ],
  },
];

interface Errors {
  [key: string]: string[] | undefined;
}

interface FeeConfigurationProps {
  showFeeRecipient?: boolean;
  openCategories?: boolean[];
}

export default function CommonFeeConfiguration({
  showFeeRecipient = true,
  openCategories = [false, false, false, false, false],
}: FeeConfigurationProps): JSX.Element {
  const [fees, setFee] = useAtom(feeAtom);
  const [errors, setErrors] = useState<Errors>();
  const [recipientErrors, setRecipientErrors] = useState<string[] | undefined>(
    undefined
  );
  const [areCategoriesOpened, setAreCategoriesOpened] = useState<boolean[]>([]);

  useEffect(() => {
    setAreCategoriesOpened(
      // @ts-ignore
      FEE_INPUTS.map((fee) => fees[fee.inputs[0].key] > 0)
    );
  }, []);

  function handlePercentageChange(value: string, key: string) {
    const formattedValue = validateInput(value);

    if (formattedValue.isValid)
      setFee({
        ...fees,
        [key]: formattedValue.formatted,
      });
  }

  function handleAddressChange(value: string, key: string) {
    setFee({
      ...fees,
      [key]: value,
    });
  }

  function verifyFees() {
    const totalFee =
      Object.keys(fees)
        // @ts-ignore
        .filter((key) => typeof fees[key] !== "string")
        // @ts-ignore
        .reduce((acc, key) => acc + Number(fees[key]), 0) >= 100;

    const newErrors: Errors = {};
    Object.entries(fees).forEach((el) => {
      const [key, val] = el;
      const inputErrors = [];

      if (key === "recipient") {
        if (!isAddress(val))
          inputErrors.push("Recipient must be a valid address");
        if (val === ADDRESS_ZERO)
          inputErrors.push("Recipient must not be the zero address");
      } else {
        if (Number(val) >= 100) inputErrors.push("Fee must be less than 100%");
        if (Number(val) < 0)
          inputErrors.push("Fee must be greater or equal to 0%");
        if (totalFee) inputErrors.push("Total fee must be less than 100%");
      }
      newErrors[key] = inputErrors.length > 0 ? inputErrors : undefined;
    });
    setErrors(newErrors);
  }

  function verifyRecipient() {
    const newErrors: string[] = [];
    if (!isAddress(fees.recipient))
      newErrors.push("Recipient must be a valid address");
    if (fees.recipient === ADDRESS_ZERO)
      newErrors.push("Recipient must not be the zero address");

    setRecipientErrors(newErrors.length > 0 ? newErrors : undefined);
  }

  return (
    <section className="flex flex-col gap-y-4 divide-y-2 divide-customNeutral100">
      {FEE_INPUTS.map((category, idx) => {
        return (
          <div key={`fee-element-${category.name}`}>
            <Fieldset
              label={category.name}
              description={category.description}
              isOpened={areCategoriesOpened[idx]}
              handleIsOpenedChange={(isOpened) => {
                handlePercentageChange("0", category.inputs[0].key);
                const newAreCategoriesOpened = [...areCategoriesOpened];
                newAreCategoriesOpened[idx] = isOpened;
                setAreCategoriesOpened(newAreCategoriesOpened);
              }}
            >
              <div className={`flex flex-col gap-4`}>
                {category.inputs.map((input) => {
                  return (
                    <div className={``} key={`fee-input-${input.key}`}>
                      <label className="text-white text-sm mb-3">
                        {input.title}
                      </label>
                      <Input
                        onChange={(e) => {
                          if (input.type === INPUT_TYPES.PERCENTAGE) {
                            handlePercentageChange(
                              (e.target as HTMLInputElement).value,
                              input.key
                            );
                          } else {
                            handleAddressChange(
                              (e.target as HTMLInputElement).value,
                              input.key
                            );
                          }
                        }}
                        // @ts-ignore
                        value={fees[input.key] === "0" ? "0" : fees[input.key]}
                        placeholder="0%"
                        onBlur={verifyFees}
                        errors={errors?.[input.key]}
                      />
                    </div>
                  );
                })}
              </div>
            </Fieldset>
          </div>
        );
      })}
      {showFeeRecipient && (
        <div className="">
          <Fieldset
            className="flex-grow"
            label="Fee Recipient"
            description="Which address should receive the fees?"
            
          >
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
      )}
    </section>
  );
}
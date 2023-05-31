import Section from "@/components/content/Section";
import Fieldset from "@/components/content/Fieldset";
import Input from "@/components/content/Input";
import { useAtom } from "jotai";
import { feeAtom, validateBigNumberInput } from "@/lib/fees";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { constants, utils } from "ethers";

const FEE_INPUTS = [
  { name: "Deposit Fee", key: "deposit", description: "Deposit fees are charged with every new deposit." },
  { name: "Withdrawal Fee", key: "withdrawal", description: "This fee is set separately for in-kind redemptions or for specific asset redemptions" },
  { name: "Performance Fee", key: "performance", description: "The performance fee is subject to a high-water mark" },
  { name: "Management Fee", key: "management", description: "The management fee accrues continuously and is automatically paid out with every deposit and redemption. " },
];

function FeeConfiguration() {
  const [fees, setFee] = useAtom(feeAtom);

  function handleChange(value: string, key: string) {
    setFee({
      ...fees,
      [key]: parseUnits(validateBigNumberInput(value).formatted),
    });
  }

  return (
    <Section title="Fee Configuration">
      <section className="flex flex-col gap-y-4 ">
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
                  defaultValue={formatUnits(fees[input.key])}
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  type="text"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder={"0.0"}
                  minLength={1}
                  maxLength={79}
                  spellCheck="false"
                  // @ts-ignore
                  className={
                    Number(formatUnits((fees as any)[input.key] || 0)) >= 1
                      ? "border border-red-500"
                      : ""
                  }
                />
              </Fieldset>
            </div>
          );
        })}
        <div className="flex gap-4">
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
              className={
                !utils.isAddress(fees.recipient) ||
                  // @ts-ignore
                  (Object.keys(fees).some(
                    (key) => Number(formatUnits((fees as any)[key])) > 0
                  ) &&
                    fees.recipient === constants.AddressZero)
                  ? "border border-red-500"
                  : ""
              }
            />
          </Fieldset>
        </div>
      </section>
    </Section>
  );
}

export default FeeConfiguration;

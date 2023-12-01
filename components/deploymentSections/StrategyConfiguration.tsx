import { useAtom } from "jotai";
import { useState } from "react";
import {
  adapterAtom,
  assetAtom,
  networkAtom,
  strategyAtom,
  strategyConfigAtom
} from "@/lib/atoms";
import { validateInput, verifyInitParamValidity } from "@/lib/helpers";
import Fieldset from "@/components/input/Fieldset";
import Input from "@/components/input/Input";

function StrategyConfiguration() {
  const [strategy] = useAtom(strategyAtom);
  const [strategyConfig, setStrategyConfig] = useAtom(strategyConfigAtom);

  const [network] = useAtom(networkAtom);
  const [asset] = useAtom(assetAtom);
  const [adapter] = useAtom(adapterAtom);

  const [errors, setErrors] = useState<any[]>([]);

  function handleChange(value: string, paramType: string, index: number, index2?: number) {
    if (paramType === "uint256") value = validateInput(value).formatted

    const newConfig = [...strategyConfig];
    if (newConfig.length < index) {
      newConfig.push(index2 ? [value] : value);
    } else {
      if (index2 === undefined) { newConfig[index] = value } else {
        newConfig[index][index2] = value
      }
    }
    setStrategyConfig(newConfig);
  }

  function verifyInitParam(value: string, initParam: any, index: number) {
    const newErrors = [...errors];
    newErrors[index] = verifyInitParamValidity(value, initParam);
    setErrors(newErrors);
  }

  return (
    <section className="">
      {strategy.initParams && strategy.initParams?.length > 0 ? (
        strategyConfig.length > 0 ? strategy.initParams.map((initParam, i) => {
          return (
            <div key={`fee-element-${initParam.name}`} className="flex gap-4" >
              <Fieldset
                className="flex-grow"
                label={initParam.name}
                description={initParam.description || ""}
                isSwitchNeeded={false}
              >
                {// @ts-ignore
                  initParam.multiple ? strategyConfig[i].map((item, n) =>
                    <Input
                      key={`${initParam.name}-${n}`}
                      onChange={(e) =>
                        handleChange(
                          (e.target as HTMLInputElement).value,
                          String(initParam.type),
                          i,
                          n
                        )
                      }
                      value={item}
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      pattern="^[0-9]*[.,]?[0-9]*$"
                      placeholder={""}
                      minLength={1}
                      maxLength={79}
                      spellCheck="false"
                      info={initParam.requirements ? String(initParam.requirements) : undefined}
                      onBlur={(e) => verifyInitParam((e.target as HTMLInputElement).value, initParam, i)}
                      errors={errors[i]?.lenght > 0 ? errors[i] : undefined}
                    />
                  )
                    :
                    <Input
                      onChange={(e) =>
                        handleChange(
                          (e.target as HTMLInputElement).value,
                          String(initParam.type),
                          i
                        )
                      }
                      defaultValue={strategyConfig[i]}
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      pattern="^[0-9]*[.,]?[0-9]*$"
                      placeholder={""}
                      minLength={1}
                      maxLength={79}
                      spellCheck="false"
                      info={initParam.requirements ? String(initParam.requirements) : undefined}
                      onBlur={(e) => verifyInitParam((e.target as HTMLInputElement).value, initParam, i)}
                      errors={errors[i]?.lenght > 0 ? errors[i] : undefined}
                    />
                }
              </Fieldset>
            </div>
          );
        }) : <p className="text-white">Loading configuration...</p>
      ) : (
        <p className="text-white">No Strategy Configuration required</p>
      )}
    </section>
  );
}

export default StrategyConfiguration;

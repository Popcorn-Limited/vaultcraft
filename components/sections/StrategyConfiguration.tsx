import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  assetAtom,
  networkAtom,
  strategyAtom,
  strategyConfigAtom
} from "@/lib/atoms";
import { resolveStrategyDefaults } from "@/lib/resolver/strategyDefaults/strategyDefaults";
import { verifyInitParamValidity } from "@/lib/helpers";
import Fieldset from "@/components/inputs/Fieldset";
import Input from "@/components/inputs/Input";

function StrategyConfiguration() {
  const [strategy] = useAtom(strategyAtom);
  const [strategyConfig, setStrategyConfig] = useAtom(strategyConfigAtom);
  const [defaults, setDefaults] = useState<any[]>([]);

  const [network] = useAtom(networkAtom);
  const [asset] = useAtom(assetAtom);

  const [errors, setErrors] = useState<any[]>([]);

  useEffect(
    () => {
      // Set defaults if the adapter has init params
      if (strategy.initParams && strategy.initParams.length > 0) {
        // Set config defaults
        resolveStrategyDefaults({
          chainId: network.id,
          address: asset.address[network.id].toLowerCase(),
          resolver: strategy.resolver
        }).then(res => setDefaults(res))

        // Set error defaults
        setErrors(strategy.initParams.map(i => undefined))
      }
    },
    [strategy]
  );

  function handleChange(value: string, index: number, index2?: number) {
    const newConfig = [...defaults];
    if (newConfig.length < index) {
      newConfig.push(index2 ? [value] : value);
    } else {
      if (index2 === undefined) { newConfig[index] = value } else {
        newConfig[index][index2] = value
      }
    }
    setDefaults(newConfig);
  }

  function verifyInitParam(value: string, initParam: any, index: number) {
    const newErrors = [...errors];
    newErrors[index] = verifyInitParamValidity(value, initParam);
    setErrors(newErrors);
  }

  return (
    <section className="">
      {strategy.initParams && strategy.initParams?.length > 0 ? (
        defaults.length > 0 && strategy.initParams.map((initParam, i) => {
          return (
            <div key={`fee-element-${initParam.name}`} className="flex gap-4">
              <Fieldset className="flex-grow" label={initParam.name} description={initParam.description || ""}>
                {initParam.multiple ? defaults[i].map((item, n) =>
                  <Input
                    onChange={(e) =>
                      handleChange(
                        (e.target as HTMLInputElement).value,
                        i,
                        n
                      )
                    }
                    defaultValue={item}
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
                    errors={errors[i] ? errors[i] : undefined}
                  />
                )
                  :
                  <Input
                    onChange={(e) =>
                      handleChange(
                        (e.target as HTMLInputElement).value,
                        i
                      )
                    }
                    defaultValue={defaults[i]}
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
                    errors={errors[i] ? errors[i] : undefined}
                  />
                }
              </Fieldset>
            </div>
          );
        })
      ) : (
        <p className="text-white">No configuration required</p>
      )}
    </section>
  );
}

export default StrategyConfiguration;

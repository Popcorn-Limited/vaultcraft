import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  adapterAtom,
  adapterConfigAtom,
  assetAtom,
  networkAtom
} from "@/lib/atoms";
import { resolveAdapterDefaults } from "@/lib/resolver/adapterDefaults/adapterDefaults";
import { verifyInitParamValidity } from "@/lib/helpers";
import Fieldset from "@/components/inputs/Fieldset";
import Input from "@/components/inputs/Input";

function AdapterConfiguration() {
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig, setAdapterConfig] = useAtom(adapterConfigAtom);

  const [network] = useAtom(networkAtom);
  const [asset] = useAtom(assetAtom);

  const [errors, setErrors] = useState<any[]>([]);

  useEffect(
    () => {
      // Set defaults if the adapter has init params
      if (adapter.initParams && adapter.initParams.length > 0) {
        setAdapterConfig(adapter.initParams.map(i => "Loading configuration..."))

        // Set config defaults
        resolveAdapterDefaults({
          chainId: network.id,
          address: asset.address[network.id].toLowerCase(),
          resolver: adapter.resolver
        }).then(res => setAdapterConfig(res))

        // Set error defaults
        setErrors(adapter.initParams.map(i => undefined))
      } else {
        // Set config defaults
        setAdapterConfig([])
      }
    },
    [adapter]
  );

  function handleChange(value: string, index: number, paramType: string) {
    const newConfig = [...adapterConfig];
    if (newConfig.length < index) {
      newConfig.push(value);
    } else {
      newConfig[index] = value;
    }
    setAdapterConfig(newConfig);
  }

  function verifyInitParam(value: string, initParam: any, index: number) {
    const newErrors = [...errors];
    newErrors[index] = verifyInitParamValidity(value, initParam);
    if (newErrors.length > 0) setErrors(newErrors);
  }

  return (
    <section className="">
      {adapter.initParams && adapter.initParams?.length > 0 ? (
        adapter.initParams.map((initParam, i) => {
          return (
            <div key={`fee-element-${initParam.name}`} className="flex gap-4">
              <Fieldset className="flex-grow" label={initParam.name} description={initParam.description || ""}>
                <Input
                  onChange={(e) =>
                    handleChange(
                      (e.target as HTMLInputElement).value,
                      i,
                      String(initParam.type)
                    )
                  }
                  defaultValue={adapterConfig[i]}
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
                  disabled={adapterConfig[i] === "Loading configuration..."}
                />
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

export default AdapterConfiguration;

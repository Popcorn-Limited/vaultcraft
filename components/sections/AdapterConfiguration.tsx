import { useAtom } from "jotai";
import { useEffect } from "react";
import { RESET } from "jotai/utils";
import {
  adapterAtom,
  adapterConfigAtom,
  assetAtom,
  networkAtom
} from "@/lib/atoms";
import { resolveAdapterDefaults } from "@/lib/resolver/adapterDefaults/adapterDefaults";
import { checkInitParamValidity } from "@/lib/helpers";
import Fieldset from "@/components/inputs/Fieldset";
import Input from "@/components/inputs/Input";

function AdapterConfiguration() {
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig, setAdapterConfig] = useAtom(adapterConfigAtom);

  const [network,] = useAtom(networkAtom);
  const [asset,] = useAtom(assetAtom);


  function handleChange(value: string, index: number, paramType: string) {
    const newConfig = [...adapterConfig];
    if (newConfig.length < index) {
      newConfig.push(value);
    } else {
      newConfig[index] = value;
    }
    setAdapterConfig(newConfig);
  }

  useEffect(
    () => {
      !!adapter.initParams && adapter.initParams.length > 0 ?
        resolveAdapterDefaults({ chainId: network.id, address: asset.address[network.id]}).then(res => setAdapterConfig(res)) :
        setAdapterConfig([])
    },
    [adapter]
  );

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
                  defaultValue={adapterConfig[i] || ""}
                  autoComplete="off"
                  autoCorrect="off"
                  type="text"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder={
                    String(initParam.type) === "address" ? "0x00" : "0.0"
                  }
                  minLength={1}
                  maxLength={79}
                  spellCheck="false"
                  className={
                    checkInitParamValidity(adapterConfig[i], initParam)
                      ? ""
                      : "border border-red-500"
                  }
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

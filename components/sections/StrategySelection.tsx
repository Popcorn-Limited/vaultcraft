import { useAtom } from "jotai";
import { Strategy, adapterAtom, assetAtom, networkAtom, strategyAtom, strategyConfigAtom, useStrategies } from "@/lib/atoms";
import Selector, { Option } from "@/components/inputs/Selector";
import { useEffect, useState } from "react";
import getStrategyConfig from "@/lib/getStrategyConfig";

const STRATEGY_NON_AVAILABLE: Strategy = {
  name: "No Strategy available",
  key: "none",
  description: "none",
  logoURI: "",
  compatibleAdapters: [],
}

async function getStrategyOptions(strategies: Strategy[], asset: string, adapter: string, chainId: number): Promise<Strategy[]> {
  const options = strategies.filter(strategy => strategy.requiredNetworks && strategy.requiredNetworks.length > 0 && strategy.requiredNetworks.includes(chainId))
    .filter((strategy) => strategy.requiredAssets && strategy.requiredAssets.length > 0 && strategy.requiredAssets.map(a => a.toLowerCase()).includes(asset))
    .filter((strategy) => strategy.compatibleAdapters.includes(adapter))
  return options.length > 0 ? options : [STRATEGY_NON_AVAILABLE];
}

function StrategySelection() {
  const [network] = useAtom(networkAtom);
  const [asset] = useAtom(assetAtom);
  const [adapter] = useAtom(adapterAtom);

  const strategies = useStrategies();
  const [strategy, setStrategy] = useAtom(strategyAtom);
  const [, setStrategyConfig] = useAtom(strategyConfigAtom);
  const [options, setOptions] = useState<Strategy[]>([]);

  useEffect(() => {
    if (adapter.key !== "none" && asset.symbol !== "none" && network) {
      getStrategyOptions(
        strategies,
        asset.address[network.id].toLowerCase(),
        adapter.key,
        network.id,
      )
        .then(res => {
          setOptions(res);
          if (res.length > 0) {
            setStrategy(res[0]);
            setStrategyConfig(getStrategyConfig(res[0], adapter.key, asset, network.id));
          }
        });
    }
  }, [adapter, asset, network]);

  function selectStrategy(newStrategy: Strategy) {
    if (strategy !== newStrategy) {
      setStrategyConfig(getStrategyConfig(newStrategy, adapter.key, asset, network.id))
    }
    setStrategy(newStrategy)
  }

  return (
    <section className="mb-4">
      <Selector
        selected={strategy}
        onSelect={(newStrategy) => selectStrategy(newStrategy)}
        actionContent={(selected) => (
          <div className="h-12 flex flex-row items-center w-full gap-x-2">
            {selected?.logoURI && (
              <div className="w-9 h-8">
                <img
                  className="object-contain w-8 h-8 rounded-full"
                  alt="selected-strategy"
                  src={selected?.logoURI}
                />
              </div>
            )}
            <span className="text-[white] w-full flex self-center flex-row justify-start">{selected?.name || "Strategy selection"}</span>
            <span className="self-center text-[white] mr-2">{`>`}</span>
          </div>
        )}
      >
        <div className="w-full h-full bg-black flex flex-col items-start gap-y-1 px-8 py-9">
          <p className="text-[white] text-2xl mb-9">Select Strategy</p>
          <p className="text-[white] mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna ut labore et dolore magna.</p>
          <div className="flex flex-col overflow-y-scroll scrollbar-hide w-full">
            {options.map((strategyIter) => (
              <Option
                value={strategyIter}
                selected={strategyIter.name === strategy.name}
                key={`strategy-selc-${strategyIter.key}-${strategyIter.name}`}
              >
              </Option>
            ))}
          </div>
        </div>
      </Selector>
    </section>
  );
}

export default StrategySelection;

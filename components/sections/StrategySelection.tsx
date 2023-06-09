import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Strategy, adapterAtom, assetAtom, networkAtom, strategyAtom, useStrategies } from "@/lib/atoms";
import Selector, { Option } from "@/components/inputs/Selector";


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
          }
        });
    }
  }, [adapter, asset, network]);

  return (
    <section className="mb-4">
      <Selector
        selected={strategy}
        onSelect={(newStrategy) => setStrategy(newStrategy)}
        title="Select Strategy"
        description="Select a strategy to apply on your vault."
      >
        {options.map((strategyIter) => (
          <Option
            value={strategyIter}
            selected={strategyIter.name === strategy.name}
            key={`strategy-selc-${strategyIter.key}-${strategyIter.name}`}
          >
          </Option>
        ))}
      </Selector>
    </section>
  );
}

export default StrategySelection;

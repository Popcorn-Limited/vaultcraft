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

export async function getStrategyOptions(strategies: Strategy[], asset: string, adapter: string, chainId: number): Promise<Strategy[]> {
  // First filter by network, than by required asset if given, than by adapter
  const options = strategies.filter(strategy => strategy.requiredNetworks && strategy.requiredNetworks.length > 0 && strategy.requiredNetworks.includes(chainId))
    .filter((strategy) => (strategy.requiredAssets && strategy.requiredAssets.length > 0) ? strategy.requiredAssets.map(a => a.toLowerCase()).includes(asset) : true)
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
    <section>
      <div className={`text-white border-[1px] border-[#353945] rounded-[4px] p-4 flex gap-3`}>
        <img src="/images/icons/exclamationCircleIconWhite.svg" />
        <span>{strategy.name}</span>
      </div>
    </section>
  );
}

export default StrategySelection;

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Strategy, assetAtom, networkAtom, protocolAtom, strategyAtom, useStrategies } from "@/lib/atoms";
import Selector, { Option } from "@/components/input/Selector";


const STRATEGY_NOT_AVAILABLE: Strategy = {
  name: "Strategy coming soon",
  key: "none",
  description: "none",
  logoURI: "",
  protocol: "none",
  chains: [1]
}

export async function getStrategyOptions(strategies: Strategy[], chainId: number, protocol: string): Promise<Strategy[]> {
  // First filter by network, than by required asset if given, than by adapter
  const options = strategies.filter(strategy => strategy.chains.includes(chainId))
    .filter((strategy) => strategy.protocol === protocol)
  return options.length > 0 ? options : [STRATEGY_NOT_AVAILABLE];
}

function StrategySelection({ isDisabled }: { isDisabled?: boolean }) {
  const [network] = useAtom(networkAtom);
  const [asset] = useAtom(assetAtom);
  const [protocol] = useAtom(protocolAtom);

  const strategies = useStrategies();
  const [strategy, setStrategy] = useAtom(strategyAtom);
  const [options, setOptions] = useState<Strategy[]>([]);

  useEffect(() => {
    if (protocol.key !== "none" && asset.symbol !== "none" && network) {
      getStrategyOptions(
        strategies,
        network.id,
        protocol.key
      )
        .then(res => {
          setOptions(res);
          if (res.length > 0) {
            setStrategy(res[0]);
          }
        });
    }
  }, [asset, network, protocol]);

  return (
    <section>
      <Selector
        selected={strategy}
        onSelect={(newStrategy) => setStrategy(newStrategy)}
        title="Select Strategy"
        description="Select a strategy to apply on your vault."
        disabled={true}
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

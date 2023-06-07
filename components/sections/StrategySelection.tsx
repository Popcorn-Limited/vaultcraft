import { useAtom } from "jotai";
import { adapterAtom, strategyAtom, useStrategies } from "@/lib/atoms";

function StrategySelection() {
  const strategies = useStrategies();
  const [adapter] = useAtom(adapterAtom);
  const [selectedStrategy, setStrategy] = useAtom(strategyAtom);

  return (
    <section>
      <div className="border-1 border border-[#353945] rounded-lg flex flex-row justify-between gap-2 w-full px-2 h-full">
        <span className="my-auto py-3 flex flex-row space-x-4">
          <p className="text-white">Select Strategy</p>
          <p className="text-gray-500">Coming Soon</p>
        </span>
        <span className="self-center text-[white] mr-2">&gt;</span>
      </div>
      {strategies
        .filter((strategy) => strategy.compatibleAdapters.includes(adapter.key))
        .map((strategy) => {
          const isActive = selectedStrategy.key === strategy.key;
          return (
            <button
              key={`strategy-select-${strategy.key}`}
              onClick={() => setStrategy(strategy)}
              className={`border rounded-xl p-8 text-left hover:outline outline-blue-600 ${isActive && "outline outline-2"
                }`}
            >
              <h2 className="flex gap-2 items-center">
                <span className="text-lg font-semibold">{strategy.name}</span>
              </h2>
              <p className="mt-4">{strategy.description}</p>
            </button>
          );
        })}
    </section>
  );
}

export default StrategySelection;

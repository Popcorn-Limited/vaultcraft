import { useEffect, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { useAtom } from "jotai";
import { Switch } from "@headlessui/react";
import {
  adapterDeploymentAtom,
  protocolAtom,
  assetAtom,
  feeAtom,
  limitAtom,
  metadataAtom,
  strategyAtom,
  strategyConfigAtom,
  strategyDeploymentAtom,
  conditionsAtom,
  DEFAULT_STRATEGY,
} from "@/lib/atoms";
import ReviewSection from "@/components/review/ReviewSection";
import ReviewParam from "@/components/review/ReviewParam";
import { resolveStrategyEncoding } from "@/lib/resolver/strategyEncoding/strategyDefaults";
import {
  encodeAbiParameters,
  getAddress,
  parseAbiParameters,
  stringToHex,
} from "viem";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Review(): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = walletClient?.chain.id || 1;

  const [conditions, setConditions] = useAtom(conditionsAtom);

  const [asset] = useAtom(assetAtom);
  const [protocol] = useAtom(protocolAtom);
  const [limit] = useAtom(limitAtom);
  const [fees] = useAtom(feeAtom);
  const [metadata] = useAtom(metadataAtom);

  const [strategy] = useAtom(strategyAtom);
  const [strategyConfig] = useAtom(strategyConfigAtom);
  const [, setAdapterData] = useAtom(adapterDeploymentAtom);
  const [, setStrategyData] = useAtom(strategyDeploymentAtom);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // @ts-ignore
    async function encodeStrategyData() {
      setLoading(true);
      let adapterId = stringToHex("", { size: 32 });
      let adapterInitParams = "0x";

      let strategyId = stringToHex("", { size: 32 });
      let strategyInitParams = "0x";

      if (strategy.name.includes("Depositor")) {
        adapterId = stringToHex(strategy.key, { size: 32 });

        if (strategy.initParams && strategy.initParams.length > 0) {
          // @dev since the types here are dynamic we need to disable type-checking otherwise it checks for unknown types
          // @ts-ignore
          adapterInitParams = encodeAbiParameters(
            parseAbiParameters(
              String(strategy.initParams.map((param) => param.type))
            ),
            strategyConfig
          );
        }
      } else {
        adapterId = stringToHex(strategy.adapter as string, { size: 32 });
        strategyId = stringToHex(strategy.key as string, { size: 32 });

        // @dev since the types here are dynamic we need to disable type-checking otherwise it checks for unknown types
        // @ts-ignore
        adapterInitParams = encodeAbiParameters(
          parseAbiParameters(strategy.initParams?.[0].type as string),
          [strategyConfig[0]]
        );

        strategyInitParams = await resolveStrategyEncoding({
          chainId: chainId,
          client: publicClient!,
          address: getAddress(asset.address),
          params: strategyConfig.slice(1),
          resolver: strategy.resolver,
        });
      }

      setAdapterData({
        id: adapterId,
        data: adapterInitParams,
      });

      setStrategyData({
        id: strategyId,
        data: strategyInitParams,
      });
      setLoading(false);
    }

    if (strategy.key !== "none") encodeStrategyData();
  }, [strategy, strategyConfig]);

  return (
    <section>
      <ReviewSection title="Basics">
        <ReviewParam title="Vault Name" value={metadata?.name} />
        <ReviewParam title="Asset" value={asset.name} img={asset.logoURI} />
        <ReviewParam
          title="Protocol"
          value={protocol.name}
          img={protocol.logoURI}
        />
        <ReviewParam
          title="Strategy"
          value={strategy.name === DEFAULT_STRATEGY.name ? "-" : strategy.name}
          img={strategy.logoURI}
        />
      </ReviewSection>
      <ReviewSection title="Fees">
        <ReviewParam title="Deposit Fee" value={`${fees.deposit}%`} />
        <ReviewParam title="Withdrawal Fee" value={`${fees.withdrawal}%`} />
        <ReviewParam title="Performance Fee" value={`${fees.performance}%`} />
        <ReviewParam title="Management Fee" value={`${fees.management}%`} />
        <ReviewParam
          title="Fee Recipient"
          value={shortenAddress(fees.recipient)}
          fullValue={fees.recipient}
        />
      </ReviewSection>
      <ReviewSection title="Deposits Limit">
        <ReviewParam
          title="Maximum deposit amount"
          value={`${
            Number(limit.maximum) === 0 ? "∞" : Number(limit.maximum)
          } ${asset.symbol}`}
        />
      </ReviewSection>
      <div className={`flex items-center gap-3 mt-6`}>
        <Switch
          checked={conditions}
          onChange={setConditions}
          className={`
            ${conditions ? "bg-green-500" : "border-2 border-customNeutral100"}
            w-6 h-6 rounded
          `}
        >
          <img
            className={`${conditions ? "" : "hidden"}`}
            src="/images/icons/checkIcon.svg"
          />
        </Switch>
        <span className={`text-white text-sm`}>
          I have read and agree to the{" "}
          <a
            href="https://app.vaultcraft.io/disclaimer"
            className={`text-secondaryBlue`}
          >
            Terms & Conditions
          </a>
          .
        </span>

        {strategy.key !== "none" && loading && (
          <p className="text-white mt-6">
            Loading Configuration, please wait...
          </p>
        )}
      </div>
    </section>
  );
}

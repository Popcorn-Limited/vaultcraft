import { useEffect, useState } from "react";
import { localhost } from "wagmi/chains";
import { constants, ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import { mainnet, useAccount } from "wagmi";
import { useAtom } from "jotai";
import { Switch } from '@headlessui/react'
import {
  adapterAtom,
  adapterConfigAtom,
  adapterDeploymentAtom,
  protocolAtom,
  assetAtom,
  feeAtom,
  limitAtom,
  networkAtom,
  metadataAtom,
  strategyAtom,
  strategyConfigAtom,
  strategyDeploymentAtom,
  conditionsAtom,
  DEFAULT_STRATEGY
} from "@/lib/atoms";
import ReviewSection from "./ReviewSection";
import ReviewParam from "./ReviewParam";
import { resolveStrategyEncoding } from "@/lib/resolver/strategyEncoding/strategyDefaults";

import { balancerApiProxyCall } from "@/lib/external/balancer/router/call";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Review(): JSX.Element {
  const { address: account } = useAccount();
  const [network] = useAtom(networkAtom);
  const chainId = network.id === localhost.id ? mainnet.id : network.id;
  const [conditions, setConditions] = useAtom(conditionsAtom);

  const [asset] = useAtom(assetAtom);
  const [protocol] = useAtom(protocolAtom);
  const [limit] = useAtom(limitAtom);
  const [fees] = useAtom(feeAtom);
  const [metadata] = useAtom(metadataAtom);

  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom);
  const [adapterData, setAdapterData] = useAtom(adapterDeploymentAtom);

  const [strategy] = useAtom(strategyAtom);
  const [strategyConfig] = useAtom(strategyConfigAtom);
  const [strategyData, setStrategyData] = useAtom(strategyDeploymentAtom);

  // const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    setAdapterData({
      id: ethers.utils.formatBytes32String(adapter.key ? adapter.key : ""),
      data: !!adapter.initParams
        ? ethers.utils.defaultAbiCoder.encode(
          adapter.initParams?.map((param) => param.type),
          adapterConfig
        )
        : "0x",
    });
  }, [adapterConfig]);

  // Populate Strategy Data with dummy data that trades CRV -> USDC -> DAI
  // Specific bytes output may be different depending on optimal routes at API Call.
  useEffect(() => {
    const fetchAndSetStrategyData = async () => {
      const data = await resolveStrategyEncoding({
        chainId: chainId,
        address: asset.address[chainId],
        params: strategyConfig,
        resolver: strategy.resolver
      })

      setStrategyData({
        id: strategy.key,
        data: data
      });
    };

    if (strategy.key !== "none") fetchAndSetStrategyData();
  }, [strategy, strategyConfig]);

  return (
    <section>
      <ReviewSection title="Basics">
        <ReviewParam title="Vault Name" value={metadata?.name} />
        <ReviewParam title="Asset" value={asset.name} img={asset.logoURI} />
        <ReviewParam title="Protocol" value={protocol.name} img={protocol.logoURI} />
        <ReviewParam title="Adapter" value={adapter.name} img={adapter.logoURI} />
        <ReviewParam title="Strategy" value={strategy.name === DEFAULT_STRATEGY.name ? '-' : strategy.name} img={strategy.logoURI} />
      </ReviewSection>
      <ReviewSection title="Fees">
        <ReviewParam title="Deposit Fee" value={`${formatUnits(fees.deposit)}%`} />
        <ReviewParam title="Withdrawal Fee" value={`${formatUnits(fees.withdrawal)}%`} />
        <ReviewParam title="Withdrawal Fee For Specifit Asset" value={`${formatUnits(fees.withdrawalFeeForSpecificAsset)}%`} />
        <ReviewParam title="Management Fee" value={`${formatUnits(fees.management)}%`} />
        <ReviewParam title="Performance Fee" value={`${formatUnits(fees.performance)}%`} />
        <ReviewParam title="Fee Recipient" value={shortenAddress(fees.recipient)} fullValue={fees.recipient} />
      </ReviewSection>
      <ReviewSection title="Deposits Limit">
        <ReviewParam
          title="Minimum deposit amount"
          value={`${formatUnits(limit.minimum.toString())} ${asset.symbol}`}
        />
        <ReviewParam
          title="Maximum deposit amount"
          value={`${formatUnits(limit.maximum.toString())} ${asset.symbol}`}
        />
      </ReviewSection>
      <div className={`flex items-center gap-3 mt-6`}>
        <Switch
          checked={conditions}
          onChange={setConditions}
          className={`
            ${conditions ? 'bg-[#45B26B]' : 'border-[2px] border-[#353945]'}
            w-6 h-6 rounded-[4px]
          `}
        >
          <img className={`${conditions ? '' : 'hidden'}`} src="/images/icons/checkIcon.svg" />
        </Switch>
        <span className={`text-white text-[14px]`}>
          I have read and agree to the <a href="https://app.vaultcraft.io/disclaimer" className={`text-[#87C1F8]`}>Terms & Conditions</a>
        </span>
      </div>
    </section >
  );
}

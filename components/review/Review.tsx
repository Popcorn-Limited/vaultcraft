import { useEffect, useState } from "react";
import { arbitrum, localhost } from "wagmi/chains";
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
  strategyConfigAtom
} from "@/lib/atoms";
import ReviewSection from "./ReviewSection";
import ReviewParam from "./ReviewParam";

export default function Review(): JSX.Element {
  const { address: account } = useAccount();
  const [network] = useAtom(networkAtom);
  const chainId = network.id === localhost.id ? mainnet.id : network.id;
  const [asset] = useAtom(assetAtom);
  const [protocol] = useAtom(protocolAtom);
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom);
  const [limit] = useAtom(limitAtom);
  const [adapterData, setAdapterData] = useAtom(adapterDeploymentAtom);
  const [fees] = useAtom(feeAtom);
  const [metadata] = useAtom(metadataAtom);
  const [strategy] = useAtom(strategyAtom);
  const [strategyConfig] = useAtom(strategyConfigAtom);

  const [devMode, setDevMode] = useState(false);

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

  return (
    <section>
      <span className="flex flex-row items-center justify-end">
        <p className="text-gray-500 mr-4">Dev Mode</p>
        <Switch
          checked={devMode}
          onChange={setDevMode}
          className={`${devMode ? 'bg-[#45B26B]' : 'bg-[#353945]'} 
          relative inline-flex items-center h-5 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
        >
          <span
            aria-hidden="true"
            className={`${devMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-[#777E90]'} first-letter:pointer-events-none inline-block h-3 w-3 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
      </span>
      <ReviewSection title="Basics">
        <ReviewParam title="Name" value={metadata?.name} />
        <ReviewParam title="Categories" value={String(metadata?.tags)} />
        <ReviewParam title="Asset" value={asset.name} img={asset.logoURI} />
        {devMode && <ReviewParam title="Asset Address" value={asset.address[chainId] || constants.AddressZero} />}
        <ReviewParam title="Protocol" value={protocol.name} img={protocol.logoURI} />
        <ReviewParam title="Adapter" value={adapter.name} img={adapter.logoURI} />
        {/* TODO - At some point we should figure out if an adapter with the right config already exists and simply reuse it */}
        {devMode && <ReviewParam title="Adapter Address" value={constants.AddressZero} />}
        <ReviewParam title="Strategy" value={"Coming Soon"} />
      </ReviewSection>
      <ReviewSection title="Adapter">
        {adapter.initParams?.map((param, i) => <ReviewParam key={param.name} title={param.name} value={adapterConfig[i]} />)}
        {devMode && <ReviewParam title="Adapter Id" value={adapterData.id} />}
        {devMode && <ReviewParam title="Adapter Data" value={adapterData.data} />}
      </ReviewSection>
      <ReviewSection title="Strategy">
        <ReviewParam title="Strategy" value={strategy.key} />
        {devMode && <ReviewParam title="Strategy Id" value={strategyConfig.id} />}
        {devMode && <ReviewParam title="Strategy Data" value={strategyConfig.data} />}
      </ReviewSection>
      <ReviewSection title="Deposit Limit">
        <ReviewParam title="Deposit Limit" value={`${formatUnits(Number(limit) > 0 ? limit : constants.MaxUint256)} ${asset.symbol}`} />
        {devMode && <ReviewParam title="Deposit Limit Uint" value={String(Number(constants.MaxUint256))} />}
      </ReviewSection>
      <ReviewSection title="Fees">
        <ReviewParam title="Deposit Fee" value={`${formatUnits(fees.deposit)}%`} />
        {devMode && <ReviewParam title="Deposit Fee Uint" value={String(Number(fees.deposit))} />}
        <ReviewParam title="Withdrawal Fee" value={`${formatUnits(fees.withdrawal)}%`} />
        {devMode && <ReviewParam title="Withdrawal Fee Uint" value={String(Number(fees.withdrawal))} />}
        <ReviewParam title="Management Fee" value={`${formatUnits(fees.management)}%`} />
        {devMode && <ReviewParam title="Management Fee Uint" value={String(Number(fees.management))} />}
        <ReviewParam title="Performance Fee" value={`${formatUnits(fees.performance)}%`} />
        {devMode && <ReviewParam title="Performance Fee Uint" value={String(Number(fees.performance))} />}
        <ReviewParam title="Fee Recipient" value={fees.recipient} />
      </ReviewSection>
      {
        devMode &&
        <>
          <ReviewSection title="Staking">
            <ReviewParam title="Deploy Staking" value={"false"} />
            <ReviewParam title="RewardsData" value={"0x"} />
          </ReviewSection>
          <ReviewSection title="Data">
            <ReviewParam title="Vault" value={constants.AddressZero} />
            <ReviewParam title="Adapter" value={constants.AddressZero} />
            <ReviewParam title="Creator" value={account || constants.AddressZero} />
            <ReviewParam title="MetadataCID" value={""} />
            <ReviewParam title="SwapAddress" value={constants.AddressZero} />
            <ReviewParam title="Exchange" value={"0"} />
            <p className="text-white">SwapTokenAddresses:</p>
            <ReviewParam title="0" value={constants.AddressZero} />
            <ReviewParam title="1" value={constants.AddressZero} />
            <ReviewParam title="2" value={constants.AddressZero} />
            <ReviewParam title="3" value={constants.AddressZero} />
            <ReviewParam title="4" value={constants.AddressZero} />
            <ReviewParam title="5" value={constants.AddressZero} />
            <ReviewParam title="6" value={constants.AddressZero} />
            <ReviewParam title="7" value={constants.AddressZero} />
            <ReviewParam title="Initial Deposit" value={String(Number(constants.Zero))} />
          </ReviewSection>
        </>
      }
    </section >
  );
}

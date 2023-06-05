import { constants, ethers } from "ethers";
import { useAccount } from "wagmi";
import {
  adapterAtom,
  adapterConfigAtom,
  adapterDeploymentAtom,
} from "@/lib/adapter";
import { useAtom } from "jotai";
import { protocolAtom } from "@/lib/protocols";
import { assetAtom } from "@/lib/assets";
import { feeAtom } from "@/lib/fees";
import { limitAtom } from "@/lib/limits";
import { useEffect, useState } from "react";
import { useDeployVault } from "@/lib/vaults";
import { noOp } from "@/lib/helpers";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useRouter } from "next/router";
import { formatUnits } from "ethers/lib/utils.js";
import { networkAtom } from "@/lib/networks";
import ReviewSection from "./ReviewSection";
import ReviewParam from "./ReviewParam";
import { Switch } from '@headlessui/react'

export default function Review(): JSX.Element {
  const { address: account } = useAccount();
  const router = useRouter();
  const [network] = useAtom(networkAtom);
  const chainId = network.id === 1337 ? 1 : network.id;
  const [asset] = useAtom(assetAtom);
  const [protocol] = useAtom(protocolAtom);
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom);
  const [limit] = useAtom(limitAtom);
  const [adapterData, setAdapterData] = useAtom(adapterDeploymentAtom);
  const [fees] = useAtom(feeAtom);

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
        <ReviewParam title="Asset" value={asset?.name} img={asset?.logoURI} />
        {devMode && <ReviewParam title="Asset Address" value={asset?.address[chainId] || constants.AddressZero} />}
        <ReviewParam title="Protocol" value={protocol?.name} img={protocol?.logoURI} />
        <ReviewParam title="Adapter" value={adapter?.name} img={adapter?.logoURI} />
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
        <p className="text-gray-500">Coming Soon</p>
        {devMode && <ReviewParam title="Strategy Id" value={ethers.utils.formatBytes32String("")} />}
        {devMode && <ReviewParam title="Strategy Data" value={"0x"} />}
      </ReviewSection>
      <ReviewSection title="Deposit Limit">
        <ReviewParam title="Deposit Limit" value={`${formatUnits(limit)} ${asset?.symbol}`} />
        {/* @ts-ignore */}
        {devMode && <ReviewParam title="Deposit Limit Uint" value={String(Number(limit.hex))} />}
      </ReviewSection>
      <ReviewSection title="Fees">
        <ReviewParam title="Deposit Fee" value={`${formatUnits(fees.deposit)}%`} />
        {/* @ts-ignore */}
        {devMode && <ReviewParam title="Deposit Fee Uint" value={String(Number(fees.deposit.hex))} />}
        <ReviewParam title="Withdrawal Fee" value={`${formatUnits(fees.withdrawal)}%`} />
        {/* @ts-ignore */}
        {devMode && <ReviewParam title="Withdrawal Fee Uint" value={String(Number(fees.withdrawal.hex))} />}
        <ReviewParam title="Management Fee" value={`${formatUnits(fees.management)}%`} />
        {/* @ts-ignore */}
        {devMode && <ReviewParam title="Management Fee Uint" value={String(Number(fees.management.hex))} />}
        <ReviewParam title="Performance Fee" value={`${formatUnits(fees.performance)}%`} />
        {/* @ts-ignore */}
        {devMode && <ReviewParam title="Performance Fee Uint" value={String(Number(fees.performance.hex))} />}
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
            {/* @ts-ignore */}
            <ReviewParam title="Initial Deposit" value={String(Number(constants.Zero.hex))} />
          </ReviewSection>
        </>
      }
    </section >
  );
}

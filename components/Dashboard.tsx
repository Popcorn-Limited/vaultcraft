import { constants, utils } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import { GrDocumentConfig } from "react-icons/gr";
import { IoMdArrowForward } from "react-icons/io";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import {
  adapterAtom,
  adapterConfigAtom,
  feeAtom,
} from "@/lib/atoms";
import { verifyInitParamValidity } from "@/lib/helpers";
import AssetSelection from "@/components/sections/AssetSelection";
import ProtocolSelection from "@/components/sections/ProtocolSelection";
import AdapterSelection from "@/components/sections/AdapterSelection";
import AdapterConfiguration from "@/components/sections/AdapterConfiguration";
import StrategySelection from "@/components/sections/StrategySelection";
import FeeConfiguration from "@/components/sections/FeeConfiguration";
import NetworkSelection from "@/components/sections/NetworkSelection";

function Dashboard() {
  const router = useRouter();
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom);
  const [fees] = useAtom(feeAtom);

  const feesLargerZero =
    [fees.deposit, fees.withdrawal, fees.management, fees.performance].reduce((acc, val) => acc.add(val), constants.Zero).gt(constants.Zero);
  const nonZeroFeeRecipient = fees.recipient != constants.AddressZero;
  const validFeeRecipient = utils.isAddress(fees.recipient);
  const feesLess1 = [fees.deposit, fees.withdrawal, fees.management, fees.performance].every(
    (fee) => Number(formatUnits(fee)) < 1
  )
  const baseValidFees = validFeeRecipient && feesLess1;
  const validFees = feesLargerZero ? (baseValidFees && nonZeroFeeRecipient) : baseValidFees
  const validAdapter = !!adapter;

  const initParams = adapter.initParams || [];
  const validAdapterConfig =
    initParams.length > 0 &&
    initParams.length === adapterConfig.length &&
    adapterConfig.every((config, i) =>
      verifyInitParamValidity(config, adapter.initParams![i])
    );

  return (
    <section>
      <h1 className="text-2xl flex items-center gap-2 font-bold mt-6 mb-8">
        <GrDocumentConfig />
        <span>Setup New Vault</span>
      </h1>
      <div className="mb-12">
        <NetworkSelection />
        <AssetSelection />
        <ProtocolSelection />
        <AdapterSelection />
        <AdapterConfiguration />
        <StrategySelection />
        <FeeConfiguration />
      </div>
      <div className="flex justify-center mt-8">
        <button
          className="flex group gap-2 items-center bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow disabled:bg-gray-500"
          onClick={() => router.push("/vault-preview")}
          disabled={!validFees || !validAdapter || !validAdapterConfig}
        >
          <span>Preview Vault</span>
          <IoMdArrowForward className="text-[150%] group-hover:translate-x-px" />
        </button>
        <div>
          <p>FeesLess1: {String(feesLess1)}</p>
          <p>ValidFeeRecipient: {String(validFeeRecipient)}</p>
          <p>nonZeroFeeRecipient: {String(nonZeroFeeRecipient)}</p>
          <p>feesLargerZero: {String(feesLargerZero)}</p>
          <p>ValidAdapter: {String(validAdapter)}</p>
          <p>ValidAdapterConfig: {String(validAdapterConfig)}</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;

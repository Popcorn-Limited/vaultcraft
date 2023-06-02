import { constants, ethers } from "ethers";
import { useAccount } from "wagmi";
import {
  adapterAtom,
  adapterConfigAtom,
  adapterDeploymentAtom,
} from "@/lib/adapter";
import { useAtom } from "jotai";
import { assetAtom } from "@/lib/assets";
import { feeAtom } from "@/lib/fees";
import { useEffect } from "react";
import { useDeployVault } from "@/lib/vaults";
import { noOp } from "@/lib/helpers";
import { IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { useRouter } from "next/router";
import { formatUnits } from "ethers/lib/utils.js";
import { networkAtom } from "@/lib/networks";

export default function Preview(): JSX.Element {
  const { address: account } = useAccount();
  const router = useRouter();
  const [network] = useAtom(networkAtom);
  const chainId = network.id === 1337 ? 1 : network.id;
  const [asset] = useAtom(assetAtom);
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom);
  const [adapterData, setAdapterData] = useAtom(adapterDeploymentAtom);
  const [fees] = useAtom(feeAtom);

  const { write: deployVault = noOp } = useDeployVault();

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
      <div>
        <h1 className="text-2xl flex items-center gap-2 font-bold mt-6 mb-8">
          Review Vault
        </h1>
        <div>
          <p>Asset: {asset?.address[chainId] || constants.AddressZero}</p>
          <p>Adapter: {constants.AddressZero}</p>
          <p>Owner: {account}</p>
          <p>Deposit Limit: {constants.MaxUint256.toString()}</p>
          <div>
            <p>Fees: </p>
            <div>
              <p>
                Deposit: {Number(fees.deposit._hex)} (
                {formatUnits(fees.deposit)})
              </p>
              <p>
                Withdrawal: {Number(fees.withdrawal._hex)} (
                {formatUnits(fees.withdrawal)})
              </p>
              <p>
                Management: {Number(fees.management._hex)} (
                {formatUnits(fees.management)})
              </p>
              <p>
                Performance: {Number(fees.performance._hex)} (
                {formatUnits(fees.performance)})
              </p>
              <p>Recipient: {fees.recipient}</p>
            </div>
          </div>
        </div>
        <div>
          <p>Name: {adapter.name}</p>
          <p>Id: {adapterData.id}</p>
          <p>Data: {adapterData.data}</p>
          <div>
            <p>Params: </p>
            <div>
              {adapterConfig?.map((param, i) => (
                <p key={i}>
                  {i}: {param}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p>Id: {ethers.utils.formatBytes32String("")}</p>
          <p>Data: 0x</p>
          <div>
            <p>Params: </p>
          </div>
        </div>
        <div>
          <p>Deploy Staking: false </p>
          <p>RewardsData: 0x</p>
        </div>
        <div>
          <p>Vault: {constants.AddressZero}</p>
          <p>Adapter: {constants.AddressZero}</p>
          <p>Creator: {account}</p>
          <p>MetadataCID:</p>
          <p>SwapAddress: {constants.AddressZero}</p>
          <p>Exchange: 0</p>
          <div>
            <p>SwapTokenAddresses: </p>
            <div>
              <p>0: {constants.AddressZero}</p>
              <p>1: {constants.AddressZero}</p>
              <p>2: {constants.AddressZero}</p>
              <p>3: {constants.AddressZero}</p>
              <p>4: {constants.AddressZero}</p>
              <p>5: {constants.AddressZero}</p>
              <p>6: {constants.AddressZero}</p>
              <p>7: {constants.AddressZero}</p>
            </div>
          </div>
        </div>
        <div>
          <p>InitialDeposit: 0</p>
        </div>
        <div className="flex justify-center mt-8">
          <div className="flex flex-row items-center space-x-4">
            <button
              className="flex group gap-2 items-center bg-red-500 text-white font-bold px-6 py-4 rounded-xl shadow"
              onClick={() => router.push("/")}
            >
              <IoMdArrowBack className="text-[150%] group-hover:translate-x-px" />
              <span>Change Stuff</span>
            </button>
            <button
              className="flex group gap-2 items-center bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow"
              onClick={() => {
                console.log("done");
                deployVault();
              }}
            >
              <span>Deploy Vault</span>
              <IoMdArrowForward className="text-[150%] group-hover:translate-x-px" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
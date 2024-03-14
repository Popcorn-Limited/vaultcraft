import MainActionButton from "@/components/button/MainActionButton";
import InputNumber from "@/components/input/InputNumber";
import { BalancerOracleAbi } from "@/lib/constants";
import { showLoadingToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { getVeAddresses } from "@/lib/constants";
import { handleCallResult } from "@/lib/utils/helpers";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

const { BalancerOracle } = getVeAddresses();

async function simulateCall({
  address,
  account,
  abi,
  args,
  functionName,
  publicClient,
}: any): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi,
      functionName,
      args: args,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

//   setParams(uint16 multiplier_, uint56 secs_, uint56 ago_, uint128 minPrice_)
function SetOptionTokenOracleParams(): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();

  const [values, setValues] = useState<{
    multiplier: number;
    secs: number;
    ago: number;
    minPrice: number;
  }>({ multiplier: 0, secs: 0, ago: 0, minPrice: 0 });

  async function getValues() {
    const res = await publicClient.multicall({
      contracts: [
        {
          address: BalancerOracle,
          abi: BalancerOracleAbi,
          functionName: "multiplier",
        },
        {
          address: BalancerOracle,
          abi: BalancerOracleAbi,
          functionName: "secs",
        },
        {
          address: BalancerOracle,
          abi: BalancerOracleAbi,
          functionName: "ago",
        },
        {
          address: BalancerOracle,
          abi: BalancerOracleAbi,
          functionName: "minPrice",
        },
      ],
      allowFailure: false,
    });
    setValues({
      multiplier: Number(res[0]),
      secs: Number(res[1]),
      ago: Number(res[2]),
      minPrice: Number(res[3]),
    });
  }

  useEffect(() => {
    if (values.multiplier === 0) getValues();
  }, [values]);

  function handleChangeInput(
    value: string,
    key: "multiplier" | "secs" | "ago" | "minPrice"
  ) {
    const newValues = { ...values };
    newValues[key] = Number(value);
    setValues(newValues);
  }

  async function handleMainAction() {
    if (!walletClient || !account) return;

    showLoadingToast("Adjusting OptionToken-Oracle values...");

    return handleCallResult({
      successMessage: "Adjusted OptionToken-Oracle values!",
      simulationResponse: await simulateCall({
        account,
        address: BalancerOracle,
        abi: BalancerOracleAbi,
        args: [values.multiplier, values.secs, values.ago, values.minPrice],
        functionName: "setParams",
        publicClient: publicClient,
      }),
      clients: {
        publicClient,
        walletClient,
      },
    });
  }

  return values.multiplier > 0 ? (
    <div className="border-b border-white pb-4 py-10 px-4 md:px-8">
      <h2 className="text-white text-xl">OptionToken-Oracle Values</h2>
      <div className="flex md:flex-row md:space-x-4 mt-4">
        <div>
          <p className="text-primary text-start">Multiplier</p>
          <div className="border border-gray-500">
            <InputNumber
              value={values.multiplier}
              onChange={(e) =>
                handleChangeInput(e.currentTarget.value, "multiplier")
              }
            />
          </div>
        </div>
        <div>
          <p className="text-primary text-start">Secs</p>
          <div className="border border-gray-500">
            <InputNumber
              value={values.secs}
              onChange={(e) => handleChangeInput(e.currentTarget.value, "secs")}
            />
          </div>
        </div>
        <div>
          <p className="text-primary text-start">Ago</p>
          <div className="border border-gray-500">
            <InputNumber
              value={values.ago}
              onChange={(e) => handleChangeInput(e.currentTarget.value, "ago")}
            />
          </div>
        </div>
        <div>
          <p className="text-primary text-start">Min Price</p>
          <div className="border border-gray-500">
            <InputNumber
              value={values.minPrice}
              onChange={(e) =>
                handleChangeInput(e.currentTarget.value, "minPrice")
              }
            />
          </div>
        </div>
      </div>
      <div className="w-40 mt-4">
        <MainActionButton
          label="Submit"
          handleClick={() => handleMainAction()}
          disabled={!account}
        />
      </div>
    </div>
  ) : (
    <p className="text-white">Loading...</p>
  );
}

export default function Misc(): JSX.Element {
  return (
    <NoSSR>
      <section className="md:border-b border-[#353945] md:flex md:flex-row items-center justify-between py-10 px-4 md:px-8 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-primary md:text-3xl leading-none">
            Smart Vaults
          </h1>
          <p className="text-primaryDark md:text-primary md:opacity-80">
            Automate your returns in single-asset deposit yield strategies.
          </p>
        </div>
      </section>
      <SetOptionTokenOracleParams />
    </NoSSR>
  );
}

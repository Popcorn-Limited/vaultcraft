import MainActionButton from "@/components/button/MainActionButton";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { handleAllowance } from "@/lib/approve";
import { POP, ROUNDING_VALUE, VCX, VCXAbi, ZERO } from "@/lib/constants";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { validateInput } from "@/lib/utils/helpers";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  Address,
  WalletClient,
  formatEther,
  parseEther,
  zeroAddress,
} from "viem";
import {
  PublicClient,
  useAccount,
  useBalance,
  useNetwork,
  usePublicClient,
  useSwitchNetwork,
  useWalletClient,
} from "wagmi";
import { multiplyDecimals } from "@/lib/utils/formatBigNumber";

interface SimulateProps {
  address: Address;
  account: Address;
  amount: number;
  publicClient: PublicClient;
}

interface MigrateWriteProps {
  address: Address;
  account: Address;
  amount: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

async function simulate({
  address,
  account,
  amount,
  publicClient,
}: SimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VCXAbi,
      // @ts-ignore
      functionName: "migrate",
      // @dev Since numbers get converted to strings like 1e+21 or similar we need to convert it back to numbers like 10000000000000 and than cast them into BigInts
      args: [
        account,
        BigInt(
          Number(amount).toLocaleString("fullwide", { useGrouping: false })
        ),
      ],
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

async function migrate({
  address,
  account,
  amount,
  publicClient,
  walletClient,
}: MigrateWriteProps): Promise<boolean> {
  showLoadingToast("Migrating POP to VCX...");

  const {
    request,
    success,
    error: simulationError,
  } = await simulate({ address, account, amount, publicClient });

  if (success) {
    try {
      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      showSuccessToast("Migration sucessful!");
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage);
      return false;
    }
  } else {
    showErrorToast(simulationError);
    return false;
  }
}

export default function Migration(): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const { data: vcxBal } = useBalance({
    chainId: 1,
    address: account || zeroAddress,
    token: VCX,
    watch: true,
  });
  const [popBal, setPopBal] = useState<bigint>(ZERO);

  const [inputBalance, setInputBalance] = useState<string>("0");

  useEffect(() => {
    if (account) {
      publicClient
        .readContract({
          address: "0x50a7c5a2aA566eB8AAFc80ffC62E984bFeCe334F",
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "account",
                  type: "address",
                },
              ],
              name: "spendableBalanceOf",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "spendableBalanceOf",
          args: [account || zeroAddress],
        })
        .then((res) => setPopBal(res));
    }
  }, []);

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputBalance(validateInput(value).isValid ? value : "0");
  }

  async function handleMainAction() {
    const val = Number(inputBalance) * 1e18;
    if (val === 0 || !account || !walletClient) return;

    if (chain?.id !== 1) {
      try {
        await switchNetworkAsync?.(1);
      } catch (error) {
        return;
      }
    }

    const approveSuccess = await handleAllowance({
      token: POP,
      amount: val,
      account,
      spender: VCX,
      clients: {
        publicClient,
        walletClient,
      },
    });

    if (approveSuccess) {
      const migrateSuccess = await migrate({
        address: VCX,
        account,
        amount: val,
        publicClient,
        walletClient,
      });
      if (migrateSuccess)
        setPopBal(
          (prevState) =>
            prevState -
            BigInt(val.toLocaleString("fullwide", { useGrouping: false }))
        );
    } else {
      showErrorToast("Insufficient Approved Amount");
    }
  }

  return (
    <>
      <div className="w-full pt-6 px-6 md:pt-0 border-t border-[#353945] md:border-none md:mt-10">
        <h1 className="text-[32px] leading-none md:text-center md:text-[56px] font-normal m-0 mb-2 md:mb-6 leading-0 text-primary">
          POP Migration
        </h1>
        <p className="leading-none md:text-4 text-left md:text-center text-xl text-primary">
          Migrate your POP to VCX
        </p>
      </div>
      <div className="px-6 md:px-8 py-10 border-t border-b border-[#353945] mt-6 md:mt-10 w-full">
        {vcxBal ? (
          <div className="rounded-lg w-full md:w-1/3 md:min-w-[870px] bg-[#23262F] md:ml-auto md:mr-auto md:p-8 px-8 pt-6 pb-5 md:pl-11 border border-[#353945] [&_summary::-webkit-details-marker]:hidden">
            <InputTokenWithError
              onSelectToken={() => { }}
              onMaxClick={() =>
                handleChangeInput({
                  currentTarget: { value: Number(formatEther(popBal)) },
                })
              }
              chainId={1}
              value={inputBalance}
              onChange={handleChangeInput}
              selectedToken={{
                address: POP,
                name: "POP",
                symbol: "POP",
                decimals: 18,
                logoURI: "",
                balance: Number(popBal),
                totalSupply: 0,
                price: 1,
              }}
              errorMessage={
                Number(inputBalance) > Number(formatEther(popBal))
                  ? "Insufficient POP balance"
                  : ""
              }
              tokenList={[]}
              allowInput
            />
            <div className="relative flex justify-center my-6">
              <ArrowDownIcon
                className="h-10 w-10 p-2 text-[#9CA3AF] border border-[#4D525C] rounded-full"
                aria-hidden="true"
              />
            </div>
            <InputTokenWithError
              onSelectToken={() => { }}
              onMaxClick={() => { }}
              chainId={1}
              value={multiplyDecimals(Number(inputBalance), 10) || 0}
              onChange={() => { }}
              selectedToken={{
                address: VCX,
                name: "VCX",
                symbol: "VCX",
                decimals: 18,
                logoURI: "/images/tokens/vcx.svg",
                balance: 0,
                totalSupply:0,
                price: 1,
              }}
              errorMessage={""}
              tokenList={[]}
              allowSelection={false}
              allowInput
            />
            <MainActionButton
              className="mt-10 md:mt-8"
              label="Convert POP"
              handleClick={handleMainAction}
              disabled={Number(inputBalance) > Number(formatEther(popBal))}
            />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}

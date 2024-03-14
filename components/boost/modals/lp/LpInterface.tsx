import {
  Dispatch,
  FormEventHandler,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount, useBalance, usePublicClient, useToken } from "wagmi";
import { getVeAddresses } from "@/lib/constants";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import InputNumber from "@/components/input/InputNumber";
import { calcUnlockTime, calculateVeOut } from "@/lib/gauges/utils";
import { BalancerOracleAbi, ROUNDING_VALUE, ZERO } from "@/lib/constants";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { formatEther } from "viem";
import { llama } from "@/lib/resolver/price/resolver";
import TokenIcon from "@/components/common/TokenIcon";
import { Token } from "@/lib/types";
import { PlusIcon } from "@heroicons/react/24/outline";

const { BalancerOracle, BalancerPool, WETH_VCX_LP, VCX, WETH } =
  getVeAddresses();

interface LpInterfaceInterfaceProps {
  vcxAmountState: [string, Dispatch<SetStateAction<string>>];
  wethAmountState: [string, Dispatch<SetStateAction<string>>];
}

export default function LpInterface({
  vcxAmountState,
  wethAmountState,
}: LpInterfaceInterfaceProps): JSX.Element {
  const { address: account } = useAccount();

  const [vcxAmount, setVcxAmount] = vcxAmountState;
  const [wethAmount, setWethAmount] = wethAmountState;

  const { data: vcxBal } = useBalance({
    chainId: 1,
    address: account,
    token: VCX,
  });
  const { data: wethBal } = useBalance({
    chainId: 1,
    address: account,
    token: WETH,
  });

  const { data: lp } = useToken({ chainId: 1, address: WETH_VCX_LP });
  const { data: vcx } = useToken({ chainId: 1, address: VCX });
  const { data: weth } = useToken({ chainId: 1, address: WETH });

  const [vcxPrice, setVCXPrice] = useState<number>(0);
  const [wethPrice, setWethPrice] = useState<number>(0);

  const [initialLoad, setInitialLoad] = useState<boolean>(false);

  useEffect(() => {
    async function setUpPrices() {
      setInitialLoad(true);

      const wethInUsd = await llama({ address: WETH, chainId: 1 });
      const vcxInUsd = await llama({ address: VCX, chainId: 1 });
      setWethPrice(wethInUsd);
      setVCXPrice(vcxInUsd);
    }
    if (!initialLoad) setUpPrices();
  }, [initialLoad]);

  function handleMaxWeth() {
    const maxEth = formatEther(safeRound(wethBal?.value || ZERO, 18));

    setWethAmount(maxEth);
    setVcxAmount(getVcxAmount(Number(maxEth)));
  }

  function handleMaxOPop() {
    const maxOPop = formatEther(safeRound(vcxBal?.value || ZERO, 18));

    setWethAmount(getWethAmount(Number(maxOPop)));
    setVcxAmount(maxOPop);
  }

  function getWethAmount(oVcxAmount: number) {
    const vcxValue = oVcxAmount * vcxPrice;

    return String((vcxValue * 0.25) / wethPrice);
  }

  function getVcxAmount(paymentAmount: number) {
    const wethValue = paymentAmount * wethPrice;

    return String((wethValue * 4) / vcxPrice);
  }

  const handleVcxInput: FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    const amount = validateInput(value).isValid ? value : "0";
    setVcxAmount(amount);
    setWethAmount(getWethAmount(Number(amount)));
  };

  const handleWethInput: FormEventHandler<HTMLInputElement> = ({
    currentTarget: { value },
  }) => {
    const amount = validateInput(value).isValid ? value : "0";
    setWethAmount(amount);
    setVcxAmount(getVcxAmount(Number(amount)));
  };

  return (
    <div className="text-start">
      <h2 className="text-start text-5xl">Get VCX-LP</h2>
      <div className="mt-8">
        <InputTokenWithError
          captionText={"Amount VCX"}
          onSelectToken={() => {}}
          onMaxClick={handleMaxOPop}
          chainId={1}
          value={vcxAmount}
          onChange={handleVcxInput}
          allowInput={true}
          selectedToken={
            {
              ...vcx,
              name: "VCX",
              symbol: "VCX",
              decimals: 18,
              logoURI: "/images/tokens/vcx.svg",
              balance: vcxBal?.value || ZERO,
            } as any
          }
          errorMessage={
            Number(vcxAmount) > Number(vcxBal?.value) / 1e18
              ? "Insufficient Balance"
              : ""
          }
          tokenList={[]}
        />
        <div className="flex justify-center -mt-2 mb-4">
          <PlusIcon className="w-8 h-8 text-gray-500" />
        </div>

        <InputTokenWithError
          captionText={"Amount WETH"}
          onSelectToken={() => {}}
          onMaxClick={handleMaxWeth}
          chainId={1}
          value={wethAmount}
          onChange={handleWethInput}
          allowInput={true}
          selectedToken={
            {
              ...weth,
              name: "WETH",
              symbol: "WETH",
              decimals: 18,
              logoURI: "https://etherscan.io/token/images/weth_28.png",
              balance: wethBal?.value || ZERO,
            } as any
          }
          tokenList={[]}
          errorMessage={
            Number(wethAmount) > Number(wethBal?.value) / 1e18
              ? "Insufficient Balance"
              : ""
          }
        />
      </div>
      <p className="mt-1">
        Or Deposit via the{" "}
        <a
          className="text-blue-500"
          href="https://app.balancer.fi/#/ethereum/pool/0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633"
          target="_blank"
        >
          balancer app
        </a>
      </p>
    </div>
  );
}

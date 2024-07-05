import {
  Dispatch,
  FormEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useAccount, useBalance, useToken } from "wagmi";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { numberToFormattedString, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { formatEther } from "viem";
import { llama } from "@/lib/resolver/price/resolver";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ZERO } from "@/lib/constants";
import { VCX, WETH } from "@/lib/constants/addresses";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";

interface LpInterfaceInterfaceProps {
  vcxAmountState: [string, Dispatch<SetStateAction<string>>];
  wethAmountState: [string, Dispatch<SetStateAction<string>>];
}

export default function LpInterface({
  vcxAmountState,
  wethAmountState,
}: LpInterfaceInterfaceProps): JSX.Element {
  const [vcxAmount, setVcxAmount] = vcxAmountState;
  const [wethAmount, setWethAmount] = wethAmountState;
  const [tokens] = useAtom(tokensAtom)

  function handleMaxWeth() {
    const maxEth = numberToFormattedString(tokens[1][WETH].balance, tokens[1][WETH].decimals)

    setWethAmount(maxEth);
    setVcxAmount(getVcxAmount(Number(maxEth)));
  }

  function handleMaxOPop() {
    const maxVcx = numberToFormattedString(tokens[1][VCX].balance, tokens[1][VCX].decimals)


    setWethAmount(getWethAmount(Number(maxVcx)));
    setVcxAmount(maxVcx);
  }

  function getWethAmount(oVcxAmount: number) {
    const vcxValue = oVcxAmount * tokens[1][VCX].price;

    return String((vcxValue * 0.25) / tokens[1][WETH].price);
  }

  function getVcxAmount(paymentAmount: number) {
    const wethValue = paymentAmount * tokens[1][WETH].price;

    return String((wethValue * 4) / tokens[1][VCX].price);
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
          onSelectToken={() => { }}
          onMaxClick={handleMaxOPop}
          chainId={1}
          value={vcxAmount}
          onChange={handleVcxInput}
          allowInput={true}
          selectedToken={tokens[1][VCX]}
          errorMessage={
            Number(vcxAmount) > (tokens[1][VCX].balance / 1e18)
              ? "Insufficient Balance"
              : ""
          }
          tokenList={[]}
        />
        <div className="flex justify-center -mt-2 mb-4">
          <PlusIcon className="w-8 h-8 text-customGray500" />
        </div>

        <InputTokenWithError
          captionText={"Amount WETH"}
          onSelectToken={() => { }}
          onMaxClick={handleMaxWeth}
          chainId={1}
          value={wethAmount}
          onChange={handleWethInput}
          allowInput={true}
          selectedToken={tokens[1][WETH]}
          tokenList={[]}
          errorMessage={
            Number(wethAmount) > (tokens[1][WETH].balance / 1e18)
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

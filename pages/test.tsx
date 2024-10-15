import { getVotePeriodEndTime } from "@/lib/gauges/utils"
import { createPublicClient, formatUnits, http, parseEther, parseUnits } from "viem"
import { mainnet } from "viem/chains"
import { AnyToAnyDepositorAbi, AssetPushOracleAbi, AssetPushOracleByChain, VaultAbi } from "@/lib/constants";
import { usePublicClient } from "wagmi";
import { Token } from "@/lib/types";
import { useDeferredValue, useState } from "react";
import InputNumber from "@/components/input/InputNumber";
import { useMemo } from "react";
import SelectToken from "@/components/input/SelectToken";

type CryptoInputValue = {
  amount?: bigint;
  inputString?: string;
  token?: Token;
}

type CryptoBalance = {
  amount: bigint;
  unit: string;
  price: number | string;
}

const TOKEN: Token = {
  address: "0x0",
  decimals: 18,
  symbol: "ETH",
  name: "Ethereum",
  logoURI: "",
  balance: 0,
  price: 0,
  totalSupply: 0
}

const BALANCE = {
  amount: parseEther("0.0000001"),
  unit: "$",
  price: 2540
}

export default function Test() {
  const [crypto, setCrypto] = useState<CryptoInputValue>({ amount: BigInt(0), inputString: "0", token: TOKEN });

  const [tokenBalance, setTokenBalance] = useState<CryptoBalance>(BALANCE);

  return <div className="text-white">
    <CryptoInput
      header={<div>test</div>}
      value={crypto}
      balance={tokenBalance}
      onChange={(value) => { setCrypto(value) }}
    />
  </div>
}

export interface CryptoInputProps {
  /**
   * token amount
   */
  value?: CryptoInputValue;
  /**
   * token amount change callback
   * @param value token and amount
   */
  onChange?: (value?: any) => void;
  /**
   * token balance
   */
  balance?: CryptoBalance;
  /**
   * custom render for header
   */
  header?: React.ReactNode;
  /**
   * custom render for footer
   */
  footer?: false | React.ReactNode;
  /**
   * size of the input
   */
  size?: 'small' | 'middle' | 'large';
}

export const CryptoInput: React.FC<CryptoInputProps> = ({
  value,
  onChange,
  header,
  footer,
  balance,
  size = 'middle',
  ...selectProps
}) => {
  const { token, inputString, amount } = value || {};

  // calculate token total price
  const tokenTotalPrice = useDeferredValue(
    amount && token && balance
      ? `${balance.unit} ${((amount * BigInt(balance.price)) / BigInt(10 ** token.decimals)).toString()}`
      : undefined,
  );

  // 将 InputNumber 的 onChange 和 TokenSelect 的 onChange 合并
  const handleChange = (amt: string | null, curToken?: Token) => {
    if (!amt && !curToken) {
      onChange?.({});
      return;
    } else if (!curToken) {
      onChange?.({ inputString: amt! });
      return;
    } else if (!amt) {
      onChange?.({ token: curToken });
      return;
    }

    const [integers, decimals] = String(amt).split('.');
    console.log("integers", integers)
    console.log("decimals", decimals)
    let inputAmt = amt;
    console.log("inputAmt1", inputAmt)

    // if precision is more than token decimal, cut it
    if (decimals?.length > curToken.decimals) {
      inputAmt = `${integers}.${decimals.slice(0, curToken.decimals)}`;
    }
    console.log("inputAmt2", inputAmt)
    // covert string amt to bigint
    const newAmt = parseUnits(inputAmt, curToken.decimals)
    console.log("newAmt", newAmt)

    onChange?.({
      ...value,
      amount: newAmt,
      inputString: inputAmt,
      token: curToken,
    });
  };

  if (!token) return <></>
  return (
    <div>
      {header && <div className={""}>{header}</div>}
      <div className="xs:w-full xs:border-r xs:border-customGray500 xs:pr-4 smmd:p-0 smmd:border-none smmd:w-1/2">
        <InputNumber
          controls={false}
          className={""}
          placeholder={"0.0"}
          value={inputString}
          // remove unnecessary 0 at the end of the number
          onChange={(e) => handleChange(e.currentTarget.value, token)}
          disabled={false}
        />
      </div>
      <div className="xs:w-fit xs:pl-4 smmd:p-0 smmd:w-1/2">
        <SelectToken
          chainId={1}
          allowSelection={false}
          selectedToken={token}
          options={[]}
          selectToken={() => { }}
        />
      </div>
      <div className="">
        <div className="flex justify-between">
          <p
          >
            {tokenTotalPrice || '-'}
          </p>
          <span className={"mr-2"}>
            {!!token && (
              <CryptoPriceBalance
                {...token}
                decimals={token.decimals}
                icon={false}
                value={balance?.amount}
              />
            )}
            {!!token && !!balance?.amount && (
              <a
                className={""}
                role="button"
                onClick={() => {
                  onChange?.({
                    ...value,
                    amount: balance.amount,
                    inputString: formatUnits(balance.amount, token.decimals),
                  });
                }}
              >
                Max
              </a>
            )}
          </span>
        </div>
      </div>
    </div>
  )
};




export type FormatInfo = {
  originValue: number | bigint;
  symbol: string;
  decimals?: number;
  fixed?: number;
};

export type CryptoPriceFormatFn = (preFormatValue: string, info: FormatInfo) => string;

export interface CryptoPriceBalanceProps {
  symbol?: string;
  decimals?: number;
  value?: bigint | number;
  style?: React.CSSProperties;
  fixed?: number;
  icon?: React.ReactNode;
  format?: CryptoPriceFormatFn;
}

export const CryptoPriceBalance: React.FC<CryptoPriceBalanceProps> = ({
  style,
  symbol = 'ETH',
  decimals = 18,
  value = 0,
  fixed,
  icon,
  format,
}) => {

  const displayText = useMemo(() => {
    if (format) {
      return format(formatBalance(value, decimals, fixed), {
        symbol,
        decimals,
        fixed,
        originValue: value,
      });
    }
    return `${formatBalance(value, decimals, fixed)} ${symbol}`;
  }, [value, symbol, decimals, fixed, format]);

  return (
    <span style={style} className={""}>
      {icon ? <>{icon} </> : null}
      {displayText}
    </span>
  );
};

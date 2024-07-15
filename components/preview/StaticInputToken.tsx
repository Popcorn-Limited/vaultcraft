import type { HTMLProps } from "react";
import { formatNumber } from "@/lib/utils/formatBigNumber";
import { Token } from "@/lib/types";
import InputNumber from "@/components/input/InputNumber";
import SelectToken from "@/components/input/SelectToken";

export default function InputTokenStatic({
  selectedToken,
  errorMessage,
  chainId,
  captionText,
  inputMoreThanBalance,
  ...props
}: {
  errorMessage?: string;
  selectedToken?: Token;
  chainId: any;
  captionText?: string;
  inputMoreThanBalance?: boolean;
} & HTMLProps<HTMLInputElement>): JSX.Element {
  const balance =
    Number(selectedToken?.balance) / 10 ** (selectedToken?.decimals as number);

  return (
    <>
      {captionText && (
        <p className="text-white text-start">
          {captionText}
          {inputMoreThanBalance && (
            <span className="text-red-500 ml-2">Input More than Balance</span>
          )}
        </p>
      )}
      <div className="relative flex items-center w-full">
        <div
          className={`h-14 w-full flex px-5 py-4 items-center justify-between rounded-lg border ${errorMessage ? "border-red-500" : "border-customGray100"
            }`}
        >
          <div className="xs:w-full xs:border-r xs:border-customGray500 xs:pr-4 smmd:p-0 smmd:border-none">
            <InputNumber {...props} />
          </div>
          <div className="xs:w-fit xs:pl-4 smmd:p-0">
            <SelectToken
              options={[]}
              chainId={chainId}
              allowSelection={false}
              selectedToken={selectedToken!}
              selectToken={() => {}}
            />
          </div>
        </div>
      </div>
      {errorMessage && (
        <p className="text-red-500 pt-2 leading-6">{errorMessage}</p>
      )}
      <div className="flex justify-between items-center mt-1 w-full">
        <div
          className="flex items-center ml-1 gap-2 cursor-pointer group/max"
        >
        </div>
      </div>
    </>
  );
}

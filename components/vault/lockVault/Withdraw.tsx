import InputTokenWithError from "@/components/input/InputTokenWithError"
import { LockVaultData, Token } from "@/lib/types"
import { ArrowDownIcon } from "@heroicons/react/24/outline"

interface WithdrawProps {
  vaultData: LockVaultData;
  tokenOptions: Token[];
  handleTokenSelect: (input: Token, output: Token) => void;
  outputToken: Token;
}

export default function Withdraw({ vaultData, tokenOptions, handleTokenSelect, outputToken }: WithdrawProps): JSX.Element {
  return (
    <>
      <InputTokenWithError
        captionText={"Withdraw Amount"}
        onSelectToken={option => { }}
        onMaxClick={() => { }}
        chainId={vaultData.chainId}
        value={vaultData.vault.balance / (10 ** vaultData.vault.decimals)}
        onChange={() => { }}
        selectedToken={vaultData.vault}
        errorMessage={""}
        tokenList={[]}
        allowSelection={false}
        allowInput={false}
      />
      <div className="mt-6">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlocks at:</p>
          <p>{new Date(vaultData.lock.unlockTime).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-customLightGray" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#141416] px-4">
            <ArrowDownIcon
              className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full cursor-pointer hover:text-primary hover:border-primary"
              aria-hidden="true"
              onClick={() => { }}
            />
          </span>
        </div>
      </div>
      <InputTokenWithError
        captionText={"Output Amount"}
        onSelectToken={option => handleTokenSelect(vaultData.vault, option)}
        onMaxClick={() => { }}
        chainId={vaultData.chainId}
        value={((vaultData.vault.balance * vaultData.vault.price) / (10 ** vaultData.vault.decimals)) / vaultData.asset.price}
        onChange={() => { }}
        selectedToken={outputToken}
        errorMessage={""}
        tokenList={tokenOptions.filter(option => option.address !== vaultData.address)}
        allowSelection
        allowInput={false}
      />
    </>
  )
}
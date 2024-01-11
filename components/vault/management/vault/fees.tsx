import MainActionButton from "@/components/button/MainActionButton";
import { VaultData } from "@/lib/types";

export default function VaultFees({ vaultData, settings }: { vaultData: VaultData, settings: any }): JSX.Element {
  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/2">
        <p className="text-gray-500">
          Taking fees mints new vault shares for the value of accumulated fees.
          These new shares will be minted to the configured fee recipient and continue to earn yield.
          Withdraw the assets through the vault interface.
        </p>
        <div className="mb-8 mt-4">
          <div className="w-full">
            <p>Accumulated Fees: {settings?.accruedFees / (10 ** vaultData.asset.decimals)} {vaultData.asset.symbol}</p>
            <div className="w-40 mt-4">
              <MainActionButton label="Take Fees" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
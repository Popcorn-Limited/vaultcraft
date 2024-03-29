import MainActionButton from "@/components/button/MainActionButton";
import { VaultData } from "@/lib/types";
import { takeFees } from "@/lib/vault/management/interactions";
import { VaultSettings } from "pages/manage/vaults/[id]";
import { WalletClient } from "viem";
import { Address, useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function VaultFees({
  vaultData,
  settings,
}: {
  vaultData: VaultData;
  settings: VaultSettings;
}): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/2">
        <p className="text-gray-500">
          Taking fees mints new vault shares for the value of accumulated fees.
          These new shares will be minted to the configured fee recipient and
          continue to earn yield. Withdraw the assets through the vault
          interface.
        </p>
        <div className="mb-8 mt-4">
          <div className="w-full">
            <p>
              Accumulated Fees:{" "}
              {settings?.accruedFees / 10 ** vaultData.asset.decimals}{" "}
              {vaultData.asset.symbol}
            </p>
            <div className="w-40 mt-4">
              <MainActionButton
                label="Take Fees"
                handleClick={() =>
                  takeFees({
                    vaultData,
                    account: account as Address,
                    clients: {
                      publicClient,
                      walletClient: walletClient as WalletClient,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

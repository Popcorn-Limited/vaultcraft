import MainActionButton from "@/components/button/MainActionButton";
import { VaultData } from "@/lib/types";
import { pauseVault, unpauseVault } from "@/lib/vault/management/interactions";
import { VaultSettings } from "pages/manage/vaults/[id]";
import { Address, WalletClient } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function VaultPausing({
  vaultData,
  callAddress,
  settings,
}: {
  vaultData: VaultData;
  callAddress: Address;
  settings: VaultSettings;
}): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/2">
        <p className="text-customGray500">
          Pausing the vault pulls all funds from its strategy and the underlying
          protocol and disables new vault deposits. Use this in case the
          underlying protocol puts funds in risk. All assets are available in
          the vault and idle. Withdrawals are still possible once a vault is
          paused.
        </p>
        <div className="w-40 mt-4">
          <MainActionButton
            label={settings?.paused ? "Unpause Vault" : "Pause Vault"}
            handleClick={
              settings?.paused
                ? () =>
                  unpauseVault({
                    vaultData,
                    address: callAddress,
                    account,
                    clients: {
                      publicClient,
                      walletClient: walletClient!,
                    },
                  })
                : () =>
                  pauseVault({
                    vaultData,
                    address: callAddress,
                    account,
                    clients: {
                      publicClient,
                      walletClient: walletClient!,
                    },
                  })
            }
          />
        </div>
      </div>
    </div>
  );
}

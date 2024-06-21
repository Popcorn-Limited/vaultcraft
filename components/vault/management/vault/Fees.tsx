import MainActionButton from "@/components/button/MainActionButton";
import { tokensAtom } from "@/lib/atoms";
import { VaultData } from "@/lib/types";
import { takeFees } from "@/lib/vault/management/interactions";
import { useAtom } from "jotai";
import { Address, useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function VaultTakeFees({
  vaultData,
  callAddress,
  accruedFees,
}: {
  vaultData: VaultData;
  callAddress: Address;
  accruedFees: number;
}): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [tokens] = useAtom(tokensAtom)
  return (
    <div className="flex flex-row justify-center">
      <div className="w-1/2">
        <p className="text-customGray500">
          Taking fees mints new vault shares for the value of accumulated fees.
          These new shares will be minted to the configured fee recipient and
          continue to earn yield. Withdraw the assets through the vault
          interface.
        </p>
        <div className="mb-8 mt-4">
          <div className="w-full">
            <p>
              Accumulated Fees:{" "}
              {accruedFees / 10 ** tokens[vaultData.chainId][vaultData.asset].decimals}{" "}
              {tokens[vaultData.chainId][vaultData.asset].symbol}
            </p>
            <div className="w-40 mt-4">
              <MainActionButton
                label="Take Fees"
                handleClick={() =>
                  takeFees({
                    vaultData,
                    address: callAddress,
                    account: account as Address,
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
      </div>
    </div>
  );
}

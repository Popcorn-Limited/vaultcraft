import { Address } from "viem";
import { simulateCall } from "@/lib/utils/helpers";
import { handleCallResult } from "@/lib/utils/helpers";
import { showLoadingToast } from "@/lib/toasts";
import { OracleVaultControllerAbi } from "@/lib/constants";
import { BaseWriteProps } from "../interactions";

export async function setVaultPrice({
  vaultPrice,
  assetPrice,
  vaultData,
  address,
  account,
  clients,
}: BaseWriteProps & { vaultPrice: bigint, assetPrice: bigint }): Promise<boolean> {
  showLoadingToast("Changing vault price...");

  const success = await handleCallResult({
    successMessage: "Changed vault price!",
    simulationResponse: await simulateCall({
      account: account as Address,
      contract: { address: address, abi: OracleVaultControllerAbi },
      functionName: "updatePrice",
      args: [{ vault: vaultData.address, asset: vaultData.asset, shareValueInAssets: vaultPrice, assetValueInShares: assetPrice }],
      publicClient: clients.publicClient
    }),
    clients
  });

  return success;
}
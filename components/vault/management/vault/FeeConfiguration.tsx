import MainActionButton from "@/components/button/MainActionButton";
import { feeAtom } from "@/lib/atoms";
import { VaultData } from "@/lib/types";
import { acceptFees, proposeFees } from "@/lib/vault/management/interactions";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Address, parseUnits, zeroAddress } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import CommonFeeConfiguration from "@/components/vault/management/vault/CommonFeeConfiguration";

export default function VaultFeeConfiguration({
  vaultData,
  callAddress,
  proposedFeeTime,
  disabled
}: {
  vaultData: VaultData;
  callAddress: Address;
  proposedFeeTime: number;
  disabled: boolean;
}): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [fees, setFees] = useAtom(feeAtom);

  useEffect(() => {
    if (vaultData)
      setFees({
        deposit: String(Number(vaultData.fees.deposit) / 1e16),
        withdrawal: String(Number(vaultData.fees.withdrawal) / 1e16),
        management: String(Number(vaultData.fees.management) / 1e16),
        performance: String(Number(vaultData.fees.performance) / 1e16),
        recipient: String(vaultData.metadata.feeRecipient),
      });
  }, [vaultData]);

  return (
    <div className="flex flex-row justify-center">
      <div className="w-full">
        <p className="text-customGray500">
          Change the fees for this vault. This process happens in two steps.
          First new fees must be proposed. Users now have three days to withdraw
          their funds if they dislike the change. After three days the change
          can be accepted.
        </p>
        {proposedFeeTime > 0 ? (
          <div className="mt-4">
            <p className="font-bold">Proposed Fee Configuration</p>
            <p>Deposit: {Number(vaultData.fees.deposit) / 1e16} %</p>
            <p>Withdrawal: {Number(vaultData.fees.withdrawal) / 1e16} %</p>
            <p>Performance: {Number(vaultData.fees.performance) / 1e16} %</p>
            <p>Management: {Number(vaultData.fees.management) / 1e16} %</p>
          </div>
        ) : (
          <>
            {vaultData.metadata.feeRecipient !== zeroAddress ? (
              <CommonFeeConfiguration
                showFeeRecipient={false}
                openCategories={Object.values(vaultData.fees).map(
                  (v) => Number(v) > 0
                )}
              />
            ) : (
              <p className="text-white">Loading Configuration...</p>
            )}
          </>
        )}
        <div className="w-60 mt-4">
          {proposedFeeTime > 0 ? (
            <MainActionButton
              label="Accept new Fee"
              handleClick={() =>
                acceptFees({
                  vaultData,
                  address: callAddress,
                  account,
                  clients: {
                    publicClient: publicClient!,
                    walletClient: walletClient!,
                  },
                })
              }
              disabled={disabled}
            />
          ) : (
            <MainActionButton
              label="Propose new Fee"
              handleClick={() =>
                proposeFees({
                  fees: {
                    deposit: parseUnits(String(Number(fees.deposit) / 100), 18),
                    withdrawal: parseUnits(
                      String(Number(fees.withdrawal) / 100),
                      18
                    ),
                    management: parseUnits(
                      String(Number(fees.management) / 100),
                      18
                    ),
                    performance: parseUnits(
                      String(Number(fees.performance) / 100),
                      18
                    ),
                  },
                  vaultData,
                  address: callAddress,
                  account,
                  clients: {
                    publicClient: publicClient!,
                    walletClient: walletClient!,
                  },
                })
              }
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </div>
  );
}
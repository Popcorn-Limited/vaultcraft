import InputTokenWithError from "@/components/input/InputTokenWithError";
import { LockVaultData } from "@/lib/types";

export default function Claim({
  vaultData,
}: {
  vaultData: LockVaultData;
}): JSX.Element {
  return (
    <>
      {vaultData.rewards.map((reward) => (
        <InputTokenWithError
          key={reward.address}
          onSelectToken={(option) => {}}
          onMaxClick={() => {}}
          chainId={vaultData.chainId}
          value={
            reward.rewardBalance > 0
              ? reward.rewardBalance / 10 ** reward.decimals
              : 0
          }
          onChange={() => {}}
          selectedToken={reward}
          errorMessage={""}
          tokenList={[]}
          allowSelection={false}
        />
      ))}
    </>
  );
}

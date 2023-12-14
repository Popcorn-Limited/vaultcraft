import InputTokenWithError from "@/components/input/InputTokenWithError"
import { LockVaultData } from "@/lib/types"

export default function Claim({ vaultData }: { vaultData: LockVaultData }): JSX.Element {
  return (
    <>
      <InputTokenWithError
        captionText={"Claim Amount"}
        onSelectToken={option => { }}
        onMaxClick={() => { }}
        chainId={vaultData.chainId}
        value={vaultData.rewardBalance > 0 ? vaultData.rewardBalance / (10 ** vaultData.reward.decimals) : 0}
        onChange={() => { }}
        selectedToken={vaultData.reward}
        errorMessage={""}
        tokenList={[]}
        allowSelection={false}
      />
    </>
  )
}
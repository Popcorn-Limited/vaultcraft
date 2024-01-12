import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import FeeConfiguration from "@/components/deploymentSections/FeeConfiguration";
import { VaultCreationContainerProps } from ".";
import VaultCreationCard from "@/components/vault/management/creation/VaultCreationCard";
import { feeAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { isAddress, zeroAddress } from "viem";

export function isFeeConfigValid(fees: any): boolean {
  if (Object.keys(fees).filter(key => key !== 'recipient').reduce((acc, key) => acc + Number(fees[key]), 0) >= 100) return false;
  if (!isAddress(fees.recipient) || fees.recipient === zeroAddress || fees.recipient.length === 0) return false;
  return true;
}

export default function FeesContainer({ route, stages, activeStage }: VaultCreationContainerProps): JSX.Element {
  const router = useRouter();
  const [fees] = useAtom(feeAtom);

  return (
    <VaultCreationCard activeStage={activeStage} stages={stages} >
      <div className={`mb-6`}>
        <h1 className="text-white text-2xl mb-2">Fee Configuration</h1>
        <p className="text-white">
          Vault managers can charge several types of fees, all of which are paid out in shares of the vault. Fees can be changed at any time after vault creation. 
          (Use . for fees with decimals)
        </p>
      </div>

      <FeeConfiguration />

      <div className="flex justify-end mt-8 gap-3">
        <SecondaryActionButton label="Back" handleClick={() => router.push(`/create-vault/${route}/basics`)} />
        <MainActionButton label="Next" handleClick={() => router.push(`/create-vault/${route}/review`)} disabled={!isFeeConfigValid(fees)} />
      </div>
    </VaultCreationCard>
  )
}
import { PRO_CREATION_STAGES } from "@/lib/stages";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { feeAtom } from "@/lib/atoms/fees";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import FeeConfiguration from "@/components/sections/FeeConfiguration";
import VaultCreationContainer from "@/components/VaultCreationContainer";
import { isAddress } from "viem";
import { ADDRESS_ZERO } from "@/lib/constants";

export function isFeesValid(fees: any): boolean {
  if (Object.keys(fees).filter(key => key !== 'recipient').reduce((acc, key) => acc + Number(fees[key]), 0) >= 100) return false;
  if (!isAddress(fees.recipient) || fees.recipient === ADDRESS_ZERO || fees.recipient.length === 0) return false;
  return true;
}

export default function Fees() {
  const router = useRouter();
  const [fees] = useAtom(feeAtom);

  return (
    <VaultCreationContainer activeStage={2} stages={PRO_CREATION_STAGES} >
      <div className={`mb-6`}>
        <h1 className="text-white text-2xl mb-2">Fee Configuration</h1>
        <p className="text-white">
          Vault managers can charge several types of fees, all of which are paid out in shares of the vault. Fees can be changed at any time after vault creation.
        </p>
      </div>

      <FeeConfiguration />

      <div className="flex justify-end mt-8 gap-3">
        <SecondaryActionButton label="Back" handleClick={() => router.push('/create-vault/pro/strategy')} />
        <MainActionButton label="Next" handleClick={() => router.push('/create-vault/pro/review')} disabled={!isFeesValid(fees)} />
      </div>
    </VaultCreationContainer>
  )
}

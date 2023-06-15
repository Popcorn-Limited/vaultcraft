import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { constants, utils } from "ethers";
import { feeAtom } from "@/lib/atoms/fees";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import FeeConfiguration from "@/components/sections/FeeConfiguration";
import VaultCreationContainer from "@/components/VaultCreationContainer";

export function isFeesValid(fees: any): boolean {
  if (Object.keys(fees).filter(key => key !== "recipient").reduce((acc, key) => acc + Number(fees[key]), 0) >= 1000000000000000000) return false;
  if (!utils.isAddress(fees.recipient)) return false;
  if (fees.recipient === constants.AddressZero) return false;
  return true;
}

export default function Fees() {
  const router = useRouter();
  const [fees] = useAtom(feeAtom);

  return (
    <VaultCreationContainer activeStage={3} >
      <div>
        <h1 className="text-white text-2xl mb-2">Fee Configuration</h1>
        <p className="text-white">Vault managers can charge several types of fees, all of which are paid out in shares of the vault.  Fees can be changed at any time after fund creation</p>
      </div>

      <FeeConfiguration />

      <div className="flex flex-row space-x-8 mt-16">
        <SecondaryActionButton label="Back" handleClick={() => router.push('/create/limits')} />
        <MainActionButton label="Next" handleClick={() => router.push('/create/review')} disabled={!isFeesValid(fees)} />
      </div>
    </VaultCreationContainer>
  )
}

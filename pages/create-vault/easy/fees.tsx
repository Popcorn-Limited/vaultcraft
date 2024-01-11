import { BASIC_CREATION_STAGES } from "@/lib/stages";
import { FeesContainer } from "@/components/vault/management/creation/vault";

export default function Fees() {
  return <FeesContainer route="easy" activeStage={1} stages={BASIC_CREATION_STAGES} />
}

import { PRO_CREATION_STAGES } from "@/lib/stages";
import { FeesContainer } from "@/components/vault/management/creation/vault";

export default function Fees() {
  return <FeesContainer route="pro" activeStage={2} stages={PRO_CREATION_STAGES} />
}

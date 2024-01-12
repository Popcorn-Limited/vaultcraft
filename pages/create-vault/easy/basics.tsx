import { BasicsContainer } from "@/components/vault/management/creation/vault";
import { BASIC_CREATION_STAGES } from "@/lib/stages";

export default function Basics() {
  return <BasicsContainer route="easy/fees" activeStage={0} stages={BASIC_CREATION_STAGES} />
}

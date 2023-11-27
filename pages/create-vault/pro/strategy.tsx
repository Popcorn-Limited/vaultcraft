import { PRO_CREATION_STAGES } from "@/lib/stages";
import { StrategyContainer } from "@/components/vaultManagement/creation/vault";

export default function Strategy() {
  return <StrategyContainer route="pro" activeStage={1} stages={PRO_CREATION_STAGES} />

}

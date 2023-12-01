import { PRO_CREATION_STAGES } from "@/lib/stages";
import { ReviewContainer } from "@/components/vaultManagement/creation/vault";

export default function ReviewPage(): JSX.Element {
  return <ReviewContainer route="pro" activeStage={3} stages={PRO_CREATION_STAGES} />
}

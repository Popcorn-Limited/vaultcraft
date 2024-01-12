import { BASIC_CREATION_STAGES } from "@/lib/stages";
import { ReviewContainer } from "@/components/vault/management/creation/vault";

export default function ReviewPage(): JSX.Element {
  return <ReviewContainer route="easy" activeStage={2} stages={BASIC_CREATION_STAGES} />
}

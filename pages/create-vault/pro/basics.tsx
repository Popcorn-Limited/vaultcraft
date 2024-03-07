import { BasicsContainer } from "@/components/vault/management/creation/vault";
import { PRO_CREATION_STAGES } from "@/lib/stages";

export default function Basics() {
  return (
    <BasicsContainer
      route="pro/strategy"
      activeStage={0}
      stages={PRO_CREATION_STAGES}
    />
  );
}

import { ProgressBarProps } from "@/components/vaultManagement/creation/ProgressBar";
import BasicsContainer from "@/components/vaultManagement/creation/vault/BasicsContainer";
import FeesContainer from "@/components/vaultManagement/creation/vault/FeesContainer";
import StrategyContainer from "@/components/vaultManagement/creation/vault/StrategyContainer";
import ReviewContainer from "@/components/vaultManagement/creation/vault/ReviewContainer";

export interface VaultCreationContainerProps extends ProgressBarProps {
  route: string
}

export {
  BasicsContainer,
  FeesContainer,
  StrategyContainer,
  ReviewContainer
}

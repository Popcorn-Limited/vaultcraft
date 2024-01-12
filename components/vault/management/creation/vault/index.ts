import { ProgressBarProps } from "@/components/vault/management/creation/ProgressBar";
import BasicsContainer from "@/components/vault/management/creation/vault/BasicsContainer";
import FeesContainer from "@/components/vault/management/creation/vault/FeesContainer";
import StrategyContainer from "@/components/vault/management/creation/vault/StrategyContainer";
import ReviewContainer from "@/components/vault/management/creation/vault/ReviewContainer";

export interface VaultCreationContainerProps extends ProgressBarProps {
  route: string
}

export {
  BasicsContainer,
  FeesContainer,
  StrategyContainer,
  ReviewContainer
}

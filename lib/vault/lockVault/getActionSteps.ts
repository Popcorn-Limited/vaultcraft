import { LockVaultActionType } from "@/lib/types"
import { ActionStep } from "../getActionSteps"

const BaseStepInfo = {
  success: false,
  error: false,
  loading: false
}

export default function getActionSteps(action: LockVaultActionType): ActionStep[] {
  switch (action) {
    case LockVaultActionType.Deposit:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo
      },
      {
        step: 2,
        label: "Deposit into Vault",
        ...BaseStepInfo
      }]
    case LockVaultActionType.IncreaseAmount:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo
      },
      {
        step: 2,
        label: "Deposit into Vault",
        ...BaseStepInfo
      }]
    case LockVaultActionType.Withdrawal:
      return [{
        step: 1,
        label: "Withdraw from Vault",
        ...BaseStepInfo
      }]
    case LockVaultActionType.Claim:
      return [
        {
          step: 1,
          label: "Claim Rewards",
          ...BaseStepInfo
        }]
  }
}
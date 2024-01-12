import { LockVaultActionType } from "@/lib/types"
import { ActionStep } from "@/lib/vault/getActionSteps"

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
        label: "Deposit",
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
        label: "Deposit",
        ...BaseStepInfo
      }]
    case LockVaultActionType.Withdrawal:
      return [{
        step: 1,
        label: "Withdraw",
        ...BaseStepInfo
      }]
    case LockVaultActionType.Claim:
      return [
        {
          step: 1,
          label: "Claim Rewards",
          ...BaseStepInfo
        }]
    case LockVaultActionType.ZapDeposit:
      return [{
        step: 1,
        label: "Handle Zap Allowance",
        ...BaseStepInfo
      }, {
        step: 2,
        label: "Zap",
        ...BaseStepInfo
      }, {
        step: 3,
        label: "Handle Allowance",
        ...BaseStepInfo
      }, {
        step: 4,
        label: "Deposit",
        ...BaseStepInfo
      }]
    case LockVaultActionType.ZapIncreaseAmount:
      return [{
        step: 1,
        label: "Handle Zap Allowance",
        ...BaseStepInfo
      }, {
        step: 2,
        label: "Zap",
        ...BaseStepInfo
      }, {
        step: 3,
        label: "Handle Allowance",
        ...BaseStepInfo
      }, {
        step: 4,
        label: "Deposit",
        ...BaseStepInfo
      }]
    case LockVaultActionType.ZapWithdrawal:
      return [{
        step: 1,
        label: "Withdraw",
        ...BaseStepInfo
      }, {
        step: 2,
        label: "Handle Zap Allowance",
        ...BaseStepInfo
      }, {
        step: 3,
        label: "Zap",
        ...BaseStepInfo
      }]
  }
}
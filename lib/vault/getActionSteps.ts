import { ActionType } from "../types";

export interface ActionStep {
  step: number;
  label: string;
  success: boolean;
  error: boolean;
  loading: boolean;
}

const BaseStepInfo = {
  success: false,
  error: false,
  loading: false
}

export default function getActionSteps(action: ActionType): ActionStep[] {
  switch (action) {
    case ActionType.Deposit:
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
    case ActionType.Withdrawal:
      return [{
        step: 1,
        label: "Withdraw from Vault",
        ...BaseStepInfo
      }]
    case ActionType.Stake:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo
      },
      {
        step: 2,
        label: "Stake into Gauge",
        ...BaseStepInfo
      }]
    case ActionType.Unstake:
      return [{
        step: 1,
        label: "Unstake from Gauge",
        ...BaseStepInfo
      }]
    case ActionType.DepositAndStake:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo
      },
      {
        step: 2,
        label: "Deposit and Stake",
        ...BaseStepInfo
      }]
    case ActionType.UnstakeAndWithdraw:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo
      },
      {
        step: 2,
        label: "Unstake and Withdraw",
        ...BaseStepInfo
      }]
    case ActionType.ZapDeposit:
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
    case ActionType.ZapWithdrawal:
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
    case ActionType.ZapDepositAndStake:
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
        label: "Deposit and Stake",
        ...BaseStepInfo
      }]
    case ActionType.ZapUnstakeAndWithdraw:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo
      }, {
        step: 2,
        label: "Unstake and Withdraw",
        ...BaseStepInfo
      }, {
        step: 3,
        label: "Handle Zap Allowance",
        ...BaseStepInfo
      }, {
        step: 4,
        label: "Zap",
        ...BaseStepInfo
      }]
  }
}
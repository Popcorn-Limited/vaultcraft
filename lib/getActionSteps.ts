import { SmartVaultActionType } from "@/lib/types";
import { AaveActionType } from "./external/aave/handleAaveInteractions";

export interface ActionStep {
  step: number;
  label: string;
  success: boolean;
  error: boolean;
  loading: boolean;
  updateBalance: boolean;
}

const BaseStepInfo = {
  success: false,
  error: false,
  loading: false,
  updateBalance: true,
};

export function getSmartVaultActionSteps(
  action: SmartVaultActionType
): ActionStep[] {
  switch (action) {
    case SmartVaultActionType.Deposit:
      return [
        {
          step: 1,
          label: "Handle Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 2,
          label: "Deposit into Vault",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.Withdrawal:
      return [
        {
          step: 1,
          label: "Withdraw from Vault",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.Stake:
      return [
        {
          step: 1,
          label: "Handle Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 2,
          label: "Stake into Gauge",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.Unstake:
      return [
        {
          step: 1,
          label: "Unstake from Gauge",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.DepositAndStake:
      return [
        {
          step: 1,
          label: "Handle Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 2,
          label: "Deposit and Stake",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.UnstakeAndWithdraw:
      return [
        {
          step: 1,
          label: "Handle Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 2,
          label: "Unstake and Withdraw",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.ZapDeposit:
      return [
        {
          step: 1,
          label: "Handle Zap Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 2,
          label: "Zap",
          ...BaseStepInfo,
        },
        {
          step: 3,
          label: "Handle Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 4,
          label: "Deposit",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.ZapWithdrawal:
      return [
        {
          step: 1,
          label: "Withdraw",
          ...BaseStepInfo,
        },
        {
          step: 2,
          label: "Handle Zap Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 3,
          label: "Zap",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.ZapDepositAndStake:
      return [
        {
          step: 1,
          label: "Handle Zap Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 2,
          label: "Zap",
          ...BaseStepInfo,
        },
        {
          step: 3,
          label: "Handle Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 4,
          label: "Deposit and Stake",
          ...BaseStepInfo,
        },
      ];
    case SmartVaultActionType.ZapUnstakeAndWithdraw:
      return [
        {
          step: 1,
          label: "Handle Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 2,
          label: "Unstake and Withdraw",
          ...BaseStepInfo,
        },
        {
          step: 3,
          label: "Handle Zap Allowance",
          ...BaseStepInfo,
          updateBalance: false
        },
        {
          step: 4,
          label: "Zap",
          ...BaseStepInfo,
        },
      ];
  }
}

export const POOL_DEPOSIT_STEPS = [
  {
    step: 1,
    label: "Handle WETH Allowance",
    ...BaseStepInfo,
    updateBalance: false
  },
  {
    step: 2,
    label: "Handle VCX Allowance",
    ...BaseStepInfo,
    updateBalance: false
  },
  {
    step: 3,
    label: "Deposit into Pool",
    ...BaseStepInfo,
  },
];

export const LOCK_VCX_LP_STEPS = [
  {
    step: 1,
    label: "Handle VCX-LP Allowance",
    ...BaseStepInfo,
    updateBalance: false
  },
  {
    step: 2,
    label: "Lock VCX-LP",
    ...BaseStepInfo,
  },
];

export const EXERCISE_OVCX_STEPS = [
  {
    step: 1,
    label: "Handle WETH Allowance",
    ...BaseStepInfo,
    updateBalance: false
  },
  {
    step: 2,
    label: "Exercise oVCX",
    ...BaseStepInfo
  }
]

export function getAaveActionSteps(action: AaveActionType): ActionStep[] {
  switch (action) {
    case AaveActionType.Supply:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo,
        updateBalance: false
      },
      {
        step: 2,
        label: "Supply Asset",
        ...BaseStepInfo
      }]
    case AaveActionType.Withdraw:
      return [
        {
          step: 1,
          label: "Withdraw Asset",
          ...BaseStepInfo
        }]
    case AaveActionType.Borrow:
      return [{
        step: 1,
        label: "Borrow Asset",
        ...BaseStepInfo
      }]
    case AaveActionType.Repay:
      return [{
        step: 1,
        label: "Handle Allowance",
        ...BaseStepInfo,
        updateBalance: false
      },
      {
        step: 2,
        label: "Repay Loan",
        ...BaseStepInfo
      }]
  }
}

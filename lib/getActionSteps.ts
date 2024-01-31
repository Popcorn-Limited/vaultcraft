import {DepositVaultActionType, KelpVaultActionType, LockVaultActionType, SmartVaultActionType} from "@/lib/types";

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

export function getSmartVaultActionSteps(action: SmartVaultActionType): ActionStep[] {
  switch (action) {
    case SmartVaultActionType.Deposit:
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
    case SmartVaultActionType.Withdrawal:
      return [{
        step: 1,
        label: "Withdraw from Vault",
        ...BaseStepInfo
      }]
    case SmartVaultActionType.Stake:
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
    case SmartVaultActionType.Unstake:
      return [{
        step: 1,
        label: "Unstake from Gauge",
        ...BaseStepInfo
      }]
    case SmartVaultActionType.DepositAndStake:
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
    case SmartVaultActionType.UnstakeAndWithdraw:
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
    case SmartVaultActionType.ZapDeposit:
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
    case SmartVaultActionType.ZapWithdrawal:
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
    case SmartVaultActionType.ZapDepositAndStake:
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
    case SmartVaultActionType.ZapUnstakeAndWithdraw:
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


export function getLockVaultActionSteps(action: LockVaultActionType): ActionStep[] {
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

export function getKelpVaultActionSteps(action: KelpVaultActionType): ActionStep[] {
  switch (action) {
    case KelpVaultActionType.Deposit:
      return [{
        step: 1,
        label: "Handle Vault Allowance",
        ...BaseStepInfo
      },
      {
        step: 2,
        label: "Deposit and Stake",
        ...BaseStepInfo
      }]
    case KelpVaultActionType.Withdrawal:
      return [{
        step: 1,
        label: "Handle Router Allowance",
        ...BaseStepInfo
      },
      {
        step: 2,
        label: "Unstake and Withdraw",
        ...BaseStepInfo
      }]
    case KelpVaultActionType.ZapDeposit:
      return [{
        step: 1,
        label: "Mint ETHx",
        ...BaseStepInfo
      }, {
        step: 3,
        label: "Handle rsETH Allowance",
        ...BaseStepInfo
      }, {
        step: 3,
        label: "Mint rsETH",
        ...BaseStepInfo
      }, {
        step: 4,
        label: "Handle Vault Allowance",
        ...BaseStepInfo
      }, {
        step: 5,
        label: "Deposit and Stake",
        ...BaseStepInfo
      }]
    case KelpVaultActionType.EthxZapDeposit:
      return [{
        step: 1,
        label: "Handle rsETH Allowance",
        ...BaseStepInfo
      }, {
        step: 2,
        label: "Mint rsETH",
        ...BaseStepInfo
      }, {
        step: 3,
        label: "Handle Vault Allowance",
        ...BaseStepInfo
      }, {
        step: 4,
        label: "Deposit and Stake",
        ...BaseStepInfo
      }]
    case KelpVaultActionType.ZapWithdrawal:
      return [{
        step: 1,
        label: "Handle Router Allowance",
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


export function getDepositVaultActionSteps(action: DepositVaultActionType): ActionStep[] {
  switch (action) {
    case DepositVaultActionType.Supply:
      return [{
        step: 1,
        label: "Supply Asset",
        ...BaseStepInfo
      },
        {
          step: 2,
          label: "Borrow Asset",
          ...BaseStepInfo
        },
        {
          step: 3,
          label: "Deposit Asset",
          ...BaseStepInfo
        }]
    case DepositVaultActionType.Borrow:
      return [{
        step: 2,
        label: "Borrow Asset",
        ...BaseStepInfo
      },
        {
          step: 3,
          label: "Deposit Asset",
          ...BaseStepInfo
        }]
    case DepositVaultActionType.Deposit:
      return [{
        step: 0,
        label: "Supply to Aave",
        ...BaseStepInfo
      }]
  }
}

export const POOL_DEPOSIT_STEPS = [
  {
    step: 1,
    label: "Handle WETH Allowance",
    ...BaseStepInfo
  },
  {
    step: 2,
    label: "Handle VCX Allowance",
    ...BaseStepInfo
  },
  {
    step: 3,
    label: "Deposit into Pool",
    ...BaseStepInfo
  }
]

export const LOCK_VCX_LP_STEPS = [
  {
    step: 1,
    label: "Handle VCX-LP Allowance",
    ...BaseStepInfo
  },
  {
    step: 2,
    label: "Lock VCX-LP",
    ...BaseStepInfo
  }
]


export const EXERCISE_OVCX_STEPS = [
  {
    step: 1,
    label: "Handle WETH Allowance",
    ...BaseStepInfo
  },
  {
    step: 2,
    label: "Exercise oVCX",
    ...BaseStepInfo
  }
]

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
    label: "Handle oVCX Allowance",
    ...BaseStepInfo,
    updateBalance: false
  },
  {
    step: 3,
    label: "Exercise oVCX",
    ...BaseStepInfo
  }
]
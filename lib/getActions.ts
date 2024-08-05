import { Clients, SmartVaultActionType, Token, TokenByAddress, TokenType, VaultData, ZapProvider } from "@/lib/types";
import { Address, erc20Abi } from "viem";
import { handleAllowance } from "./approve";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "./vault/interactions";
import { gaugeDeposit, gaugeWithdraw } from "./gauges/interactions";
import zap, { handleZapAllowance } from "./vault/zap";

export interface ActionButton {
    label: string;
    action: () => Promise<boolean>
  }

export interface ActionProps {
    id: number;
    title: string;
    description: string;
    button: ActionButton;
    updateBalanceAfter?: boolean;
}

interface GetActionsProps {
    vaultRouter: Address; 
    actionType:SmartVaultActionType; 
    vaultData: VaultData;
    zapAmount?: number;
    inputAmount: number;
    inputToken: Token;
    outputToken: Token;
    outputAmount: number;
    account: Address;
    zapProvider: ZapProvider;
    slippage: number;
    tradeTimeout: number;
    vaultAsset: Token;
    vault: Token;
    referral?: Address;
    tokensAtom: [{ [key: number]: TokenByAddress }, Function];
    clients: Clients;
    fireEvent?: (
        type: string,
        {
          user_address,
          network,
          contract_address,
          asset_amount,
          asset_ticker,
          additionalEventData,
        }: any
      ) => Promise<void>;
}

// TODO zap withdraw
export const getActionsByType = (props: GetActionsProps) : ActionProps[] => {
    var actionObj:ActionProps[];

    const {
        vaultRouter, 
        actionType, 
        vaultData,
        zapAmount,
        inputAmount,
        inputToken,
        outputToken,
        outputAmount,
        account,
        zapProvider,
        slippage,
        tradeTimeout,
        vaultAsset,
        vault,
        referral,
        tokensAtom,
        clients,
        fireEvent
    } = props;

    const decimalInput = inputAmount * (10 ** inputToken.decimals);
    const decimalZapAmount = zapAmount ? zapAmount / (10 ** vaultAsset.decimals) : 0;

    switch(actionType) {
    case SmartVaultActionType.Deposit: {
        actionObj = [{
            id: 1,
            title: "Approve",
            description: `Approve ${inputAmount} ${inputToken.symbol} for depositing`,
            button: {
            label: "Approve",
            action: () => handleAllowance({
                token: inputToken.address,
                amount: decimalInput,
                account: account!,
                spender: outputToken.address,
                clients
                })
            }
        },
        {
            id: 2,
            title: "Deposit",
            description: `Deposit ${inputAmount} ${inputToken.symbol} into the vault, receives vault shares`,
            button: {
            label: "Deposit",
            action: () => vaultDeposit({
                chainId: vaultData.chainId,
                vaultData,
                asset: vaultAsset,
                vault,
                account,
                amount: decimalInput,
                clients,
                fireEvent,
                referral,
                tokensAtom
                })
            }
            }
        ]
        break;
        }
        case SmartVaultActionType.Withdrawal: {
            actionObj = [{
                id: 1,
                title: "Redeem",
                description: `Redeem ${inputAmount} vaultShares for ${outputAmount} ${outputToken.symbol} for depositing`,
                button: {
                label: "Redeem",
                action: () => vaultRedeem({
                    chainId: vaultData.chainId,
                    vaultData,
                    asset: vaultAsset,
                    vault,
                    account,
                    amount: decimalInput,
                    clients,
                    fireEvent,
                    referral,
                    tokensAtom
                  })
                }
            }]
            break;
        }
        case SmartVaultActionType.Stake: {
            actionObj = [{
                id: 1,
                title: "Approve",
                description: `Approve ${inputAmount} vaultShares to stake on gauge`,
                button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: inputToken.address,
                    amount: decimalInput,
                    account,
                    spender: vaultData.gauge!,
                    clients,
                  })
                }
            },
            {
                id: 2,
                title: "Gauge Stake",
                description: `Stake ${inputAmount} vaultShares on gauge`,
                button: {
                label: "Gauge Stake",
                action: () => gaugeDeposit({
                    vaultData,
                    account,
                    amount: decimalInput,
                    clients,
                    tokensAtom
                  })
                }
            }
        ]
            break;
        }
        case SmartVaultActionType.Unstake: {
            actionObj = [{
                id: 1,
                title: "Unstake",
                description: `Withdraw ${inputAmount} vaultShares from gauge`,
                button: {
                label: "Unstake Gauge",
                action: () => gaugeWithdraw({
                    vaultData,
                    account,
                    amount: decimalInput,
                    clients,
                    tokensAtom
                  })
                }
            }
        ]
            break;
        }
        case SmartVaultActionType.DepositAndStake: {
            actionObj = [{
            id: 1,
            title: "Approve",
            description: `Approve ${inputAmount} ${inputToken.symbol} for depositing`,
            button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: inputToken.address,
                    amount: decimalInput,
                    account: account!,
                    spender: vaultRouter,
                    clients
                })
            }
            },
            {
            id: 2,
            title: "Deposit And Stake",
            description: `Deposit ${inputAmount} ${inputToken.symbol} into the vault and stake into gauge`,
            button: {
                label: "Deposit And Stake",
                action: () => vaultDepositAndStake({
                    chainId: vaultData.chainId,
                    router: vaultRouter,
                    vaultData,
                    asset: vaultAsset,
                    vault,
                    amount: decimalInput,
                    account: account!,
                    referral: referral,
                    tokensAtom,
                    clients
                })
                }
            }
            ]
        break;
        }
        case SmartVaultActionType.UnstakeAndWithdraw: {
            actionObj = [
            {
            id: 1,
            title: "Approve",
            description: `Approve router to pull ${inputAmount} ${inputToken.symbol} for withdrawing`,
            button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: inputToken.address,
                    amount: decimalInput,
                    account: account!,
                    spender: vaultRouter,
                    clients
                })
            }
            },
            {
            id: 2,
            title: "Unstake And Withdraw",
            description: `Unstake ${inputAmount} ${inputToken.symbol} from gauge and withdraw from vault`,
            button: {
                label: "Unstake and Withdraw",
                action: () => vaultUnstakeAndWithdraw({
                    chainId: vaultData.chainId,
                    router: vaultRouter,
                    vaultData,
                    asset: vaultAsset,
                    vault,
                    amount: decimalInput,
                    account: account!,
                    referral: referral,
                    tokensAtom,
                    clients
                })
                }
            }
            ]
        break;
        }
        case SmartVaultActionType.ZapDeposit: {
            actionObj = [{
            id: 1,
            title: "Approve",
            description: `Approve zap provider to pull ${inputAmount} ${inputToken.symbol} for swapping`,
            button: {
                label: "Approve",
                action: () => handleZapAllowance({
                    token: inputToken.address,
                    amount: decimalInput,
                    account: account!,
                    zapProvider,
                    clients
                })
            }
            },
            {
            id: 2,
            title: "Zap into Vault Asset",
            description: `Zap ${inputAmount} ${inputToken.symbol} for ${outputAmount} ${vaultAsset.symbol}`,
            updateBalanceAfter: true,
            button: {
                label: "Zap",
                action: () => zap({
                    chainId: vaultData.chainId,
                    sellToken: inputToken,
                    buyToken: vaultAsset,
                    amount: decimalInput,
                    account,
                    zapProvider,
                    slippage,
                    tradeTimeout,
                    clients,
                    tokensAtom
                  })
                }
            },
            {
            id: 3,
            title: "Approve",
            description: `Approve ${zapAmount ? decimalZapAmount : outputAmount} ${vaultAsset.name} for vault deposit`,
            button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: vaultData.asset,
                    amount: zapAmount!,
                    account,
                    spender: vault.address,
                    clients
                    })
                }
            },
            {
                id: 4,
                title: "Deposit",
                description: `Deposit ${zapAmount ? decimalZapAmount : outputAmount} ${vaultAsset.symbol} into the vault, receives vault shares`,
                button: {
                label: "Deposit",
                action: () => vaultDeposit({
                    chainId: vaultData.chainId,
                    vaultData,
                    asset: vaultAsset,
                    vault,
                    account,
                    amount: zapAmount!,
                    clients,
                    fireEvent,
                    referral,
                    tokensAtom
                    })
                }
                }
            ]
        break;
        }
        case SmartVaultActionType.ZapDepositAndStake: {
            actionObj = [{
            id: 1,
            title: "Approve",
            description: `Approve zap provider to pull ${inputAmount} ${inputToken.symbol} for swapping`,
            button: {
                label: "Approve",
                action: () => handleZapAllowance({
                    token: inputToken.address,
                    amount: decimalInput,
                    account: account!,
                    zapProvider,
                    clients
                })
            }
            },
            {
            id: 2,
            title: "Zap into Vault Asset",
            description: `Zap ${inputAmount} ${inputToken.symbol} for ${outputAmount} ${vaultAsset.symbol}`,
            updateBalanceAfter: true,
            button: {
                label: "Zap",
                action: () => zap({
                    chainId: vaultData.chainId,
                    sellToken: inputToken,
                    buyToken: vaultAsset,
                    amount: decimalInput,
                    account,
                    zapProvider,
                    slippage,
                    tradeTimeout,
                    clients,
                    tokensAtom
                  })
                }
            },
            {
            id: 3,
            title: "Approve",
            description: `Approve ${zapAmount ? decimalZapAmount : outputAmount} ${vaultAsset.name} for vault deposit`,
            button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: vaultAsset.address,
                    amount: zapAmount!,
                    account: account,
                    spender: vaultRouter,
                    clients: clients
                    })
                },
            },
            {
            id: 4,
            title: "Deposit And Stake",
            description: `Deposit ${zapAmount ? decimalZapAmount : outputAmount} ${vaultAsset.symbol} into the vault, receives vault shares`,
            button: {
                label: "Deposit And Stake",
                action: () => vaultDepositAndStake({
                    chainId: vaultData.chainId,
                    router: vaultRouter,
                    vaultData: vaultData,
                    asset: vaultAsset,
                    vault: vault,
                    amount: zapAmount!,
                    account: account!,
                    referral: referral,
                    tokensAtom: tokensAtom,
                    clients: clients
                })
                }
            }
            ]
        break;
        }
        case SmartVaultActionType.ZapWithdrawal: {
            actionObj = [
                {
                    id: 1,
                    title: "Vault Redeem",
                    description: `Redeem vault shares and receive ${outputAmount} ${outputToken.symbol}`,
                    updateBalanceAfter: true,
                    button: {
                        label: "Redeem",
                        action: () => vaultRedeem({
                            chainId: vaultData.chainId,
                            vaultData,
                            asset: vaultAsset,
                            vault,
                            account,
                            amount: inputAmount,
                            clients,
                            fireEvent,
                            referral,
                            tokensAtom
                        })
                    }
                },
                {
                    id: 2,
                    title: "Approve",
                    description: `Approve ${zapAmount ? decimalZapAmount : inputAmount} ${vaultAsset} for zapping`,
                    button: {
                        label: "Handle allowance",
                        action: () => handleZapAllowance({
                            token: vaultAsset.address,
                            amount: decimalZapAmount,
                            account,
                            zapProvider,
                            clients
                          })
                    }
                },
                {
                    id: 3,
                    title: "Zap into Output Asset",
                    description: `Zap ${zapAmount ? decimalZapAmount : inputAmount} ${vaultAsset.symbol} for ${outputAmount} ${outputToken.symbol}`,
                    button: {
                        label: "Zap",
                        action: () => zap({
                            chainId: vaultData.chainId,
                            sellToken: inputToken,
                            buyToken: vaultAsset,
                            amount: decimalZapAmount,
                            account,
                            zapProvider,
                            slippage,
                            tradeTimeout,
                            clients,
                            tokensAtom
                        })
                    }
                },
                ]
            break;
        }
        case SmartVaultActionType.ZapUnstakeAndWithdraw: {
            actionObj = [
                {
                    id: 1,
                    title: "Approve",
                    description: `Approve router to pull ${inputAmount} ${inputToken.symbol} for withdrawing`,
                    button: {
                        label: "Approve",
                        action: () => handleAllowance({
                            token: inputToken.address,
                            amount: decimalInput,
                            account,
                            spender: vaultRouter,
                            clients
                        })
                    }
                    },
                {
                    id: 2,
                    title: "Unstake and Withdraw",
                    description: `Unstake ${inputAmount} from gauge and withdraw from vault`,
                    updateBalanceAfter: true,
                    button: {
                        label: "Unstake and withdraw",
                        action: () => vaultUnstakeAndWithdraw({
                            chainId: vaultData.chainId,
                            router: vaultRouter,
                            vaultData,
                            asset: vaultAsset,
                            vault,
                            account,
                            amount: decimalInput,
                            clients,
                            fireEvent,
                            referral,
                            tokensAtom
                          })
                    }
                },
                {
                    id: 3,
                    title: "Allow zap provider",
                    description: `Approve ${zapAmount ? decimalZapAmount : inputAmount} ${vaultAsset.symbol} for zapping`,
                    button: {
                        label: "Handle Zap Allowance",
                        action: () => handleZapAllowance({
                            token: inputToken.address,
                            amount: zapAmount!,
                            account,
                            zapProvider,
                            clients
                          })
                    }
                },
                {
                    id: 4,
                    title: "Zap into Output Asset",
                    description: `Zap ${zapAmount ? decimalZapAmount : inputAmount} ${vaultAsset.symbol} for ${outputAmount} ${outputToken.symbol}`,
                    button: {
                        label: "Zap",
                        action: () => zap({
                            chainId: vaultData.chainId,
                            sellToken: vaultAsset,
                            buyToken: outputToken,
                            amount: zapAmount!,
                            account,
                            zapProvider,
                            slippage,
                            tradeTimeout,
                            clients,
                            tokensAtom
                          })
                    }
                },
                ]
            break;
        }
      default: {
        actionObj = []
      }
    }

    return actionObj;
  }
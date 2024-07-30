import { Clients, SmartVaultActionType, Token, TokenByAddress, TokenType, VaultData, ZapProvider } from "@/lib/types";
import { Address, erc20Abi } from "viem";
import { handleAllowance } from "./approve";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem } from "./vault/interactions";
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
}

interface GetActionsProps {
    vaultRouter: Address; 
    actionType:SmartVaultActionType; 
    vaultData: VaultData;
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

// const getTokenBalanceAndAction = async (action:string, props:GetActionsProps) : Promise<boolean>{
//     let postBal = await props.clients.publicClient.readContract({
//         address: props.vaultAsset.address,
//         abi: erc20Abi,
//         functionName: "balanceOf",
//         args: [props.account],
//     });

//     // switch(action) {
//     //     case "handleAllowance": return () => {
//     //         handleAllowance({
//     //             token: props.vaultAsset.address,
//     //             amount: postBal - props.vaultAsset.balance,
//     //             account: props.account,
//     //             spender: props.out
//     //             }) 
//     //         }
//     //     }
//     // }
    
// }

export const getActionsByType = ({
    vaultRouter, 
    actionType, 
    vaultData,
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
}: GetActionsProps) : ActionProps[] => {
    var actionObj:ActionProps[];

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
                amount: inputAmount,
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
                amount: inputAmount,
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
                    amount: inputAmount,
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
                    amount: inputAmount,
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
                    amount,
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
                    amount: inputAmount,
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
                    amount: inputAmount,
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
                    amount: inputAmount,
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
            actionObj = [{
            id: 1,
            title: "Approve",
            description: `Approve router to pull ${inputAmount} ${inputToken.symbol} for withdrawing`,
            button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: inputToken.address,
                    amount: inputAmount,
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
                action: () => vaultDepositAndStake({
                    chainId: vaultData.chainId,
                    router: vaultRouter,
                    vaultData,
                    asset: vaultAsset,
                    vault,
                    amount: inputAmount,
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
                    amount: inputAmount,
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
            button: {
                label: "Zap",
                action: () => zap({
                    chainId: vaultData.chainId,
                    sellToken: inputToken,
                    buyToken: vaultAsset,
                    amount: inputAmount,
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
            description: `Approve ${vaultAsset.name} for vault deposit`,
            button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: vaultData.asset,
                    amount: inputAmount, //TODO get balance and overwrite amount
                    account,
                    spender: vault.address,
                    clients
                    })
                }
            },
            {
                id: 4,
                title: "Deposit",
                description: `Deposit ${inputAmount} ${vaultAsset.symbol} into the vault, receives vault shares`,
                button: {
                label: "Deposit",
                action: () => vaultDeposit({
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
                    amount: inputAmount,
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
            button: {
                label: "Zap",
                action: () => zap({
                    chainId: vaultData.chainId,
                    sellToken: inputToken,
                    buyToken: vaultAsset,
                    amount: inputAmount,
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
            description: `Approve ${vaultAsset.name} for vault deposit`,
            button: {
                label: "Approve",
                action: () => handleAllowance({
                    token: vaultData.asset,
                    amount: inputAmount, //TODO get balance and overwrite amount
                    account,
                    spender: vault.address,
                    clients
                    })
                }
            },
            {
                id: 4,
                title: "Deposit And Stake",
                description: `Deposit ${outputAmount} ${vaultAsset.symbol} into the vault and stake into gauge`,
                button: {
                    label: "Deposit And Stake",
                    action: () => vaultDepositAndStake({
                        chainId: vaultData.chainId,
                        router: vaultRouter,
                        vaultData,
                        asset: vaultAsset,
                        vault,
                        amount: outputAmount, // TODO
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
      default: {
        actionObj = []
      }
    }

    return actionObj;
  }
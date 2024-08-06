import { Address, erc20Abi } from "viem";
import { handleAllowance } from "@/lib/approve";
import { SmartVaultActionType, Clients, Token, VaultData, ZapProvider, TokenByAddress } from "@/lib/types";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "@/lib/vault/interactions";
import zap, { handleZapAllowance } from "@/lib/vault/zap";
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions";
import {wrapIntoPod, addLiquidityAndStake} from "@/lib/peapods/interactions";
import { pOHM, pVCX, VCX } from "@/lib/constants";
import { VaultRouterByChain } from "@/lib/constants";

interface HandleStakingInteractionProps {
  stepCounter: number;
  action: SmartVaultActionType;
  chainId: number;
  amountInput: number;
  amountTokenB: number;
  inputTokenA: Token;
  inputTokenB?: Token;
  outputToken: Token;
  vaultData: VaultData;
  asset: Token;
  vault: Token;
  gauge?: Token;
  account: Address;
  zapProvider: ZapProvider;
  slippage: number;
  tradeTimeout: number;
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
  referral?: Address;
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
}

export default async function handleStakingInteraction({
  action,
  stepCounter,
  chainId,
  amountInput,
  amountTokenB,
  inputTokenA,
  inputTokenB,
  outputToken,
  vaultData,
  asset,
  vault,
  gauge,
  account,
  zapProvider,
  slippage,
  tradeTimeout,
  clients,
  fireEvent,
  referral,
  tokensAtom
}: HandleStakingInteractionProps): Promise<() => Promise<boolean>> {
  let postBal = 0;
  switch (action) {
    case SmartVaultActionType.PeapodsStake:
      switch (stepCounter) {
        case 0: 
          return () =>             
          handleAllowance({
            token: inputTokenA.address,
            amount: amountInput,
            account,
            spender: "0x9a103ab4fe2de5db16338b16fd7550d21d7b8db6", // indexutils TODO variable
            clients,
          });
        case 1:
          return () =>
            wrapIntoPod({
              account,
              clients,
              indexUtils: "0x9a103ab4fe2de5db16338b16fd7550d21d7b8db6",
              token: VCX,
              pToken: pVCX,
              inputAmount: amountInput,
              amountOutMin: amountInput
            })
        case 2: // TODO buy pOHM
            return () =>
            wrapIntoPod({
              account,
              clients,
              indexUtils: "0x9a103ab4fe2de5db16338b16fd7550d21d7b8db6",
              token: VCX, //ETH
              pToken: pOHM,
              inputAmount: amountInput,
              amountOutMin: amountInput
            })
        case 3: 
        return () =>
            handleAllowance({ // approve asset a to deposit into peapods
                token: inputTokenA.address,
                amount: amountInput,
                account,
                spender: "0x9a103ab4fe2de5db16338b16fd7550d21d7b8db6", //index utils
                clients,
            });
        case 4: 
            handleAllowance({ // approve asset b to deposit into peapods
                token: inputTokenB != undefined ? inputTokenB.address : inputTokenA.address, // TODO 
                amount: amountTokenB,
                account,
                spender: "0x9a103ab4fe2de5db16338b16fd7550d21d7b8db6", //index utils
                clients,
            });
        case 5: 
          return () => addLiquidityAndStake({
            account, 
            clients,
            indexUtils: "0x9a103ab4fe2de5db16338b16fd7550d21d7b8db6",
            pToken: pVCX,
            amountPToken: amountInput,
            pairedLPToken: pOHM,
            amountLPToken: amountTokenB,
            amountLPTokenMin: amountTokenB,
            slippage: 10,
            deadline: 1821810548 // TODO
          })
        case 6:
          return () =>
            handleAllowance({ // approve to deposit vault asset
                token: asset.address,
                amount: amountInput,
                account,
                spender: outputToken.address,
                clients,
              });
        case 7: 
        return () =>
            vaultDeposit({
              chainId,
              vaultData,
              asset,
              vault,
              account,
              amount: amountInput,
              clients,
              fireEvent,
              referral,
              tokensAtom
            }); 
      }
    default:
      // We should never reach this code. This is here just to make ts happy
      return async () => false;
  }
}

import AssetWithName from "@/components/common/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { ReserveData, Token, UserAccountData, VaultData, ZapProvider } from "@/lib/types";
import { useAtom } from "jotai";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { erc20Abi, formatUnits, zeroAddress, isAddress, getAddress } from "viem";
import { formatNumber, formatToFixedDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import { handleMaxClick, validateInput } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import { DEFAULT_ASSET, tokensAtom } from "@/lib/atoms";
import TabSelector from "@/components/common/TabSelector";
import Modal from "@/components/modal/Modal";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { ArrowDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { SmartVaultActionType, TokenType } from "@/lib/types";
import { ActionStep, getSmartVaultActionSteps } from "@/lib/getActionSteps";
import ActionSteps from "@/components/vault/ActionSteps";
import { getZapProvider } from "@/lib/vault/zap";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { useRouter } from "next/router";
import handleStakingInteraction from "@/lib/vault/handleStakingInteraction";
import { VCX, pVCX, pOHM } from "@/lib/constants";

export default function PreviewStakingInterface({inputToken, inputAmount, tokenOptions, visibilityState, chainId, vaultData, gauge, vault, actionType }: {
  inputToken?: Token;
  inputAmount: number;
  tokenOptions: Token[];
  visibilityState: [boolean, Dispatch<SetStateAction<boolean>>],
  vaultData: VaultData,
  chainId: number,
  actionType: SmartVaultActionType,
  gauge?: Token,
  vault: Token,
}): JSX.Element {
  const [visible, setVisible] = visibilityState
  const action = actionType;

  const VCXToken = tokenOptions.find(t => t.address === VCX)
  const pVCXToken = tokenOptions.find(t => t.address === pVCX)
  const pOHMToken = tokenOptions.find(t => t.address === pOHM)

  const asset = tokenOptions.find(t => t.address === vaultData.asset);

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();

  const [activeTab, setActiveTab] = useState<string>("Supply")

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([]);
  const [inputTokenA, setInputTokenA] = useState<Token>();
  const [inputTokenB, setInputTokenB] = useState<Token>();
  const [outputToken, setOutputToken] = useState<Token>();

  const [inputAmountA, setInputAmountA] = useState<number>(0);
  const [inputAmountB, setInputAmountB] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<number>(0);

  const [tokenList, setTokenList] = useState<Token[]>([]);

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  const [zapProvider, setZapProvider] = useState(ZapProvider.none)

  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for
  const [tokens, setTokens] = useAtom(tokensAtom);
  const [vaults, setVaults] = useAtom(vaultsAtom);

  const inputProps = { readOnly: true }

  const { query } = useRouter();

  useEffect(() => {
    if(stepCounter === 0) {
      setInputAmountA(inputAmount);
      setSteps(getSmartVaultActionSteps(action));
    }
    
    setStepCounter(stepCounter);
    
    switch (stepCounter) {
        // vcx -> pvcx
        case 0: {
          setTokenList([VCXToken!]);

          setInputTokenA(VCXToken);
          setInputTokenB(undefined);
          setOutputToken(pVCXToken);
          break;
        }
        case 1:{
          setTokenList([VCXToken!]);

          setInputTokenA(VCXToken);
          setInputTokenB(undefined);
          setOutputToken(pVCXToken);
          break;
        }
        case 2: { // pvcx -> pOHM -> this can be eth -> pOHM
          setTokenList([VCXToken!]);

          setInputTokenA(pVCXToken);
          setInputTokenB(undefined);
          setOutputToken(pOHMToken);
          break;
        }
        case 3: { // approve pVCX
            setTokenList([]);

            setInputTokenA(pVCXToken);
            setInputTokenB(pOHMToken);
            setOutputToken(vault)
            break;
        }
        case 4: {// approve pOHM
            setTokenList([]);

            setInputTokenA(pOHMToken);
            setInputTokenB(pOHMToken);
            setOutputToken(vault)          
            break;
        }
        case 5: { 
            //addLiquidity
            setTokenList([]);

            setInputTokenA(pVCXToken);
            setInputTokenB(pOHMToken);
            setOutputToken(asset)
          break;
        }
        case 6: { //deposit into vault
            setTokenList([]);

            setInputTokenA(asset);
            setInputTokenB(undefined);
            setOutputToken(vault)
          break;
        }
    }
  }, [visible, stepCounter])

  function handleChangeInput(e: any, inputRow:number) {
    const value = e.currentTarget.value;
    if(inputRow === 0)
        setInputAmountA(validateInput(value).isValid ? value : "0");
    else 
        setInputAmountB(validateInput(value).isValid ? value : "0");
  }

  function handleTokenSelect(input: Token, output: Token): void {
    setStepCounter(0);

    setInputTokenA(input);
    setOutputToken(output);

    switch (input.address) {
      case asset?.address!:
        switch (output.address) {
          case asset?.address!:
            // error
            return;
          case vault?.address!:
            setIsDeposit(true);
            // setAction(SmartVaultActionType.Deposit);
            // setSteps(getSmartVaultActionSteps(SmartVaultActionType.Deposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            // setAction(SmartVaultActionType.DepositAndStake);
            // setSteps(
            //   getSmartVaultActionSteps(SmartVaultActionType.DepositAndStake)
            // );
            return;
          case "0x319121F8F39669599221A883Bb6d7d0Feef0E69c": 
            setIsDeposit(true);
            // setAction(SmartVaultActionType.PeapodsStake);
            return;
          default:
            // error
            return;
        }
      case vault?.address: // withdraw
        switch (output.address) {
          case asset?.address!:
            setIsDeposit(false);
            // setAction(SmartVaultActionType.Withdrawal);
            // setSteps(getSmartVaultActionSteps(SmartVaultActionType.Withdrawal));
            return;
          case vault?.address!:
            // error
            return;
          case gauge?.address:
            setIsDeposit(true);
            // setAction(SmartVaultActionType.Stake);
            // setSteps(getSmartVaultActionSteps(SmartVaultActionType.Stake));
            return;
          default:
            setIsDeposit(false);
            // setAction(SmartVaultActionType.ZapWithdrawal);
            // setSteps(
            //   getSmartVaultActionSteps(SmartVaultActionType.ZapWithdrawal)
            // );
            return;
        }
      case gauge?.address: // unstake and withdraw
        switch (output.address) {
          case asset?.address!:
            setIsDeposit(false);
            // setAction(SmartVaultActionType.UnstakeAndWithdraw);
            // setSteps(
            //   getSmartVaultActionSteps(SmartVaultActionType.UnstakeAndWithdraw)
            // );
            return;
          case vault?.address!:
            setIsDeposit(false);
            // setAction(SmartVaultActionType.Unstake);
            // setSteps(getSmartVaultActionSteps(SmartVaultActionType.Unstake));
            return;
          case gauge?.address:
            // error
            return;
          default:
            setIsDeposit(false);
            // setAction(SmartVaultActionType.ZapUnstakeAndWithdraw);
            // setSteps(
            //   getSmartVaultActionSteps(
            //     SmartVaultActionType.ZapUnstakeAndWithdraw
            //   )
            // );
            return;
        }
      default: // bo
        switch (output.address) {
          case asset?.address!:
            // error
            return;
          case vault?.address!:
            setIsDeposit(true);
            // setAction(SmartVaultActionType.ZapDeposit);
            // setSteps(getSmartVaultActionSteps(SmartVaultActionType.ZapDeposit));
            return;
          case gauge?.address:
            setIsDeposit(true);
            // setAction(SmartVaultActionType.ZapDepositAndStake);
            // setSteps(
            //   getSmartVaultActionSteps(SmartVaultActionType.ZapDepositAndStake)
            // );
            return;
          default:
            // error
            return;
        }
    }
  }

  function handleMaxClick(inputRow: number) {
    if (!inputTokenA) return;
    const stringBal = inputTokenA.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), inputTokenA.decimals);
    const formatted = formatUnits(rounded, inputTokenA.decimals);
    handleChangeInput({ currentTarget: { value: formatted }}, inputRow );
  }

  async function handleMainAction() {
    let val = Number(inputAmountA)
    if (val === 0 || !inputTokenA || !outputToken || !vaultData.asset || !vault || !account || !walletClient) return;
    val = val * (10 ** inputTokenA.decimals)
    
    if(inputTokenB !== undefined) {
      let valTokenB = Number(inputAmountB);
      if (valTokenB === 0) return;
      valTokenB = valTokenB * (10 ** inputTokenB.decimals)
    }

    let newZapProvider = zapProvider
    // if (newZapProvider === ZapProvider.none && [SmartVaultActionType.PeapodsStake].includes(action)) {
    //   showLoadingToast("Searching for the best price...")
    //   if ([SmartVaultActionType.PeapodsStake].includes(action)) {
    //     newZapProvider = await getZapProvider({ sellToken: inputTokenA, buyToken: VCXToken!, amount: val, chainId, account })
    //   }
      
    //   setZapProvider(newZapProvider)

    //   if (newZapProvider === ZapProvider.notFound) {
    //     showErrorToast("Zap not available. Please try a different token.")
    //     return
    //   } else {
    //     showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
    //   }
    // }

    const stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)

    const vaultInteraction = await handleStakingInteraction({
      action,
      stepCounter,
      chainId,
      amountInput: inputAmountA,
      amountTokenB: inputAmountB,
      inputTokenA: inputTokenA,
      inputTokenB: inputTokenB,
      outputToken,
      vaultData,
      asset: inputTokenA,
      vault,
      gauge,
      account,
      zapProvider: newZapProvider, // TODO remove?
      slippage,
      tradeTimeout,
      clients: { publicClient: publicClient!, walletClient },
      referral:
        !!query?.ref && isAddress(query.ref as string)
          ? getAddress(query.ref as string)
          : undefined,
      tokensAtom: [tokens, setTokens]
    });

    const success = await vaultInteraction();

    currentStep.loading = false;
    currentStep.success = success;
    currentStep.error = !success;

    const newStepCounter = success ? stepCounter + 1 : stepCounter;

    setStepCounter(newStepCounter);

    if (newStepCounter === steps.length && success) {
      const newSupply = await publicClient?.readContract({
        address: vaultData.address,
        abi: erc20Abi,
        functionName: "totalSupply"
      })
      const index = vaults[vaultData.chainId].findIndex(v => v.address === vaultData.address)
      const newNetworkVaults = [...vaults[vaultData.chainId]]
      newNetworkVaults[index] = {
        ...vaultData,
        totalSupply: Number(newSupply),
        tvl: (Number(newSupply) * vault.price) / (10 ** vault.decimals)
      }
      const newVaults = { ...vaults, [vaultData.chainId]: newNetworkVaults }

      setVaults(newVaults)

      // const vaultTVL = SUPPORTED_NETWORKS.map(chain => newVaults[chain.id]).flat().reduce((a, b) => a + b.tvl, 0)
      // setTVL({
      //   vault: vaultTVL,
      //   lockVault: tvl.lockVault,
      //   stake: tvl.stake,
      //   total: vaultTVL + tvl.lockVault + tvl.stake
      // });

      // const vaultNetworth = SUPPORTED_NETWORKS.map(chain =>
      //   Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Vault || t.type === TokenType.Gauge)
      //   .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)
      // const assetNetworth = SUPPORTED_NETWORKS.map(chain =>
      //   Object.values(tokens[chain.id])).flat().filter(t => t.type === TokenType.Asset)
      //   .reduce((a, b) => a + ((b.balance / (10 ** b.decimals)) * b.price), 0)

      // setNetworth({
      //   vault: vaultNetworth,
      //   lockVault: networth.lockVault,
      //   wallet: assetNetworth,
      //   stake: networth.stake,
      //   total: vaultNetworth + assetNetworth + networth.lockVault + networth.stake
      // })
    }
  }

  const handleRefresh = async () => {
    setActiveTab(action === SmartVaultActionType.DepositAndStake ? "Deposit" : "Withdraw");
    setStepCounter(0);
    setSteps(getSmartVaultActionSteps(action));
  }

  return <>
    <Modal
      visibility={visibilityState}
      title={vaultData.address ?
        <AssetWithName vault={vaultData} /> :
        <h2 className={`text-2xl font-bold text-white`}>
          Tranasaction Preview
        </h2>
      }
    >
      <div className="w-full md:flex md:flex-row md:space-x-20">
        <div className="w-full">
          {!account &&
            <div>
              <MainActionButton
                label="Connect Wallet"
                handleClick={openConnectModal}
              />
            </div>
          }
          {
            (account && !inputTokenA) &&
            <p className="text-white">Nothing to do here</p>
          }
          {
            steps.map((step, i) => {
              return           <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-5 text-start">
              {(account && inputTokenA) &&
                <>
                  {/* Input A */}
                  <InputTokenWithError
                    captionText={`${activeTab} Amount`}
                    onSelectToken={(option) =>
                      handleTokenSelect(option, !!gauge ? gauge : vault)
                    }
                    onChange={(e) => {
                      handleChangeInput(e, 0)
                    }}
                    onMaxClick={() => {}}
                    chainId={vaultData.chainId}
                    value={inputAmountA}
                    selectedToken={inputTokenA}
                    errorMessage={""}
                    tokenList={tokenList}
                    allowSelection={true}
                    allowInput={true}
                  />
  
                  {/* Input B */}
                  {(inputTokenB !== undefined &&                 
                      (
                          <InputTokenWithError
                          captionText={`${activeTab} Amount`}
                          onSelectToken={(option) =>
                            handleTokenSelect(option, !!gauge ? gauge : vault)
                          }
                          onMaxClick={() => {}}
                          onChange={(e) => {
                            handleChangeInput(e, 1)
                          }}                        
                          chainId={vaultData.chainId}
                          value={inputAmountB}
                          selectedToken={inputTokenB}
                          errorMessage={""}
                          tokenList={tokenList}
                          allowSelection={true}
                          allowInput={true}
                      />))
                  }
  
                  {/* Output */}
                  <InputTokenWithError
                    captionText={"Output Amount"}
                    onSelectToken={() => {}}
                    onChange={() => {}}
                    onMaxClick={() => {}}
                    chainId={vaultData.chainId}
                    value={outputAmount}
                    selectedToken={outputToken}
                    errorMessage={""}
                    tokenList={[]}
                    allowSelection={false}
                    allowInput={false}
                  />
                </>
              }
  
              {/* <div className="w-full flex justify-center my-6">
                <ActionSteps steps={steps} stepCounter={stepCounter} />
              </div> */}
              <div className="">
                {account ? (
                  <>
                    {
                    stepCounter === steps.length ||
                      steps.some((step) => !step.loading && step.error) ? (
                      <div>
                        <MainActionButton label={"Finish"} handleClick={() => { setVisible(false); }} />
                        <MainActionButton label={"Start Over"} handleClick={handleRefresh} />
                      </div>
                    ) : (
                      <MainActionButton
                        label={steps[stepCounter].label}
                        handleClick={handleMainAction}
                        disabled={inputAmountA === 0 || steps[stepCounter].loading}
                      />
                    )}
                  </>
                ) : (
                  <MainActionButton
                    label={"Connect Wallet"}
                    handleClick={openConnectModal}
                  />
                )}
              </div>
            </div>
            })
          }
        </div>
      </div>
    </Modal>
  </>
}
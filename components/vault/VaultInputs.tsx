import { ArrowDownIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/buttons/MainActionButton";
import { useEffect, useState } from "react";
import { Address, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import TabSelector from "@/components/common/TabSelector";
import { Token } from "@/lib/types";
import { handleAllowance } from "@/lib/approve";
import { WalletClient } from "viem";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "@/lib/vaults/interactions";
import { ADDRESS_ZERO } from "@/lib/constants";

const { VaultRouter: VAULT_ROUTER } = { VaultRouter: ADDRESS_ZERO as Address }

interface VaultInputsProps {
  vault: Token;
  asset: Token;
  gauge?: Token;
  tokenOptions: Token[];
  chainId: number
}

export default function VaultInputs({ vault, asset, gauge, tokenOptions, chainId }: VaultInputsProps): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [inputBalance, setInputBalance] = useState<number>(0);

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  useEffect(() => {
    // set default input/output tokens
    setInputToken(asset)
    setOutputToken(!!gauge ? gauge : vault)
  }, [])


  function handleChangeInput(e: any) {
    setInputBalance(Number(e.currentTarget.value));
  }

  function switchTokens() {
    if (isDeposit) {
      // Switch to Withdraw
      setInputToken(!!gauge ? gauge : vault);
      setOutputToken(asset)
      setIsDeposit(false)
    } else {
      // Switch to Deposit
      setInputToken(asset);
      setOutputToken(!!gauge ? gauge : vault)
      setIsDeposit(true)
    }
  }


  async function handleMainAction() {
    if (inputBalance === 0) return;

    if (chain?.id !== Number(chainId)) switchNetwork?.(Number(chainId));

    switch (inputToken?.address) {
      case asset.address:
        console.log("in asset")
        if (outputToken?.address === vault.address) {
          console.log("out vault")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (inputBalance * (10 ** inputToken?.decimals)),
            account: account as Address,
            spender: vault.address,
            publicClient,
            walletClient: walletClient as WalletClient
          })
          vaultDeposit({
            address: vault.address,
            account: account as Address,
            amount: (inputBalance * (10 ** inputToken?.decimals)),
            publicClient,
            walletClient: walletClient as WalletClient
          })
        }
        else if (outputToken?.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (inputBalance * (10 ** inputToken?.decimals)),
            account: account as Address,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient: walletClient as WalletClient
          })
          vaultDepositAndStake({
            address: VAULT_ROUTER,
            account: account as Address,
            amount: (inputBalance * (10 ** inputToken?.decimals)),
            vault: vault?.address as Address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient: walletClient as WalletClient
          })
        }
        else {
          console.log("out error")
          // wrong output token
          return
        }
        break;
      case vault.address:
        console.log("in vault")
        if (outputToken?.address === asset.address) {
          console.log("out asset")
          vaultRedeem({
            address: vault.address,
            account: account as Address,
            amount: (inputBalance * (10 ** inputToken?.decimals)),
            publicClient,
            walletClient: walletClient as WalletClient
          })
        }
        else if (outputToken?.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: vault.address,
            inputAmount: (inputBalance * (10 ** vault?.decimals)),
            account: account as Address,
            spender: gauge?.address as Address,
            publicClient,
            walletClient: walletClient as WalletClient
          })
          //gaugeDeposit()
        }
        else {
          console.log("out error")
          // wrong output token
          return
        }
        break;
      case gauge?.address:
        console.log("in gauge")
        if (outputToken?.address === asset.address) {
          console.log("out asset")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (inputBalance * (10 ** vault?.decimals)),
            account: account as Address,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient: walletClient as WalletClient
          })
          vaultUnstakeAndWithdraw({
            address: VAULT_ROUTER,
            account: account as Address,
            amount: (inputBalance * (10 ** inputToken?.decimals)),
            vault: vault?.address as Address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient: walletClient as WalletClient
          })
        }
        else if (outputToken?.address === vault.address) {
          console.log("out vault")
          //gaugeWithdraw()
        }
        else {
          console.log("out error")
          // wrong output token
          return
        }
        break;
    }
  }

  if (!inputToken || !outputToken) return <></>
  return <>
    <TabSelector
      className="mb-6"
      availableTabs={["Deposit", "Withdraw"]}
      activeTab={isDeposit ? "Deposit" : "Withdraw"}
      setActiveTab={switchTokens}
    />
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={option => setInputToken(option)}
      onMaxClick={() => handleChangeInput({ currentTarget: { value: inputToken.balance / (10 ** inputToken.decimals) } })}
      chainId={chainId}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={[]}
      allowSelection={false}
      allowInput
    />
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-customLightGray" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-black px-4">
          <ArrowDownIcon
            className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full cursor-pointer hover:text-primary hover:border-primary"
            aria-hidden="true"
            onClick={switchTokens}
          />
        </span>
      </div>
    </div>
    <InputTokenWithError
      captionText={"Output Amount"}
      onSelectToken={option => setOutputToken(option)}
      onMaxClick={() => { }}
      chainId={chainId}
      value={(inputBalance * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={[]}
      allowSelection={false}
      allowInput={false}
    />
    <div className="mt-8">
      <MainActionButton label={isDeposit ? "Deposit" : "Withdraw"} handleClick={handleMainAction} />
    </div>
  </>
}

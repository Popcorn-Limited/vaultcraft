import { ArrowDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import { useEffect, useState } from "react";
import { Address, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import TabSelector from "@/components/common/TabSelector";
import { Token } from "@/lib/types";
import { handleAllowance } from "@/lib/approve";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw, zapIntoGauge, zapIntoVault, zapOutOfGauge, zapOutOfVault } from "@/lib/vault/interactions";
import { validateInput } from "@/lib/utils/helpers";
import { getVeAddresses } from "@/lib/utils/addresses";
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions";
import { ROUNDING_VALUE } from "@/lib/constants";
import Modal from "../modal/Modal";
import InputNumber from "../input/InputNumber";
import { MutateTokenBalanceProps } from "pages/vaults";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { formatUnits, parseUnits } from "viem";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()

interface VaultInputsProps {
  vault: Token;
  asset: Token;
  gauge?: Token;
  tokenOptions: Token[];
  chainId: number;
  mutateTokenBalance: (props: MutateTokenBalanceProps) => void;
}

export default function VaultInputs({ vault, asset, gauge, tokenOptions, chainId, mutateTokenBalance }: VaultInputsProps): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  // Zap Settings
  const [showModal, setShowModal] = useState<boolean>(false)
  const [tradeTimeout, setTradeTimeout] = useState<number>(300); // number of seconds a cow order is valid for
  const [slippage, setSlippage] = useState<number>(100); // In BPS 0 - 10_000

  useEffect(() => {
    // set default input/output tokens
    setInputToken(asset)
    setOutputToken(!!gauge ? gauge : vault)
  }, [])

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  };


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
    const val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !account || !walletClient) return;

    if (chain?.id !== Number(chainId)) switchNetwork?.(Number(chainId));

    switch (inputToken.address) {
      case asset.address:
        console.log("in asset")
        if (outputToken.address === vault.address) {
          console.log("out vault")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: vault.address,
            publicClient,
            walletClient
          })
          const success = await vaultDeposit({
            address: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient
          })
          const success = await vaultDepositAndStake({
            address: VAULT_ROUTER,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            vault: vault?.address as Address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        else {
          console.log("out error")
          // wrong output token
          return
        }
        break;
      case vault.address:
        console.log("in vault")
        if (outputToken.address === asset.address) {
          console.log("out asset")
          const success = await vaultRedeem({
            address: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: gauge.address,
            publicClient,
            walletClient
          })
          const success = await gaugeDeposit({
            address: gauge.address,
            amount: (val * (10 ** inputToken.decimals)),
            account,
            clients: {
              publicClient,
              walletClient
            }
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        else if (outputToken.address === vault.address) {
          console.log("out error")
          // wrong output token
          return
        }
        else {
          console.log("out zap")
          const success = await zapOutOfVault({
            buyToken: outputToken.address,
            asset: asset.address,
            vault: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            assetBal: asset.balance,
            walletClient: walletClient,
            publicClient: publicClient,
            slippage,
            tradeTimeout
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        break;
      case gauge?.address:
        console.log("in gauge")
        if (outputToken.address === asset.address) {
          console.log("out asset")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient
          })
          const success = await vaultUnstakeAndWithdraw({
            address: VAULT_ROUTER,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            vault: vault.address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        else if (outputToken.address === vault.address) {
          console.log("out vault")
          const success = await gaugeWithdraw({
            address: gauge?.address as Address,
            amount: (val * (10 ** inputToken.decimals)),
            account,
            clients: {
              publicClient,
              walletClient
            }
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out error")
          // wrong output token
          return
        }
        else {
          console.log("out zap")
          console.log({ gaugeBal: gauge?.balance, amount: (val * (10 ** inputToken.decimals)) })
          const success = await zapOutOfGauge({
            buyToken: outputToken.address,
            asset: asset.address,
            router: VAULT_ROUTER,
            vault: vault.address,
            gauge: gauge?.address as Address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            assetBal: asset.balance,
            walletClient: walletClient,
            publicClient: publicClient,
            slippage,
            tradeTimeout
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        break;
      default:
        console.log("in zap asset")
        if (outputToken.address === vault.address) {
          console.log("out vault")
          const success = await zapIntoVault({
            sellToken: inputToken.address,
            asset: asset.address,
            vault: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            assetBal: asset.balance,
            slippage,
            tradeTimeout,
            publicClient,
            walletClient
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out gauge")
          const success = await zapIntoGauge({
            sellToken: inputToken.address,
            router: VAULT_ROUTER,
            asset: asset.address,
            vault: vault.address,
            gauge: gauge.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            assetBal: asset.balance,
            slippage,
            tradeTimeout,
            publicClient,
            walletClient
          })
          if (success) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
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
    <Modal visibility={[showModal, setShowModal]}>
      <div className="text-start">
        <p>Slippage (in BPS)</p>
        <div className="w-full rounded-lg border border-primary p-2">
          <InputNumber
            value={slippage}
            onChange={(e) => setSlippage(Number(e.currentTarget.value))}
          />
        </div>
      </div>
    </Modal>
    <TabSelector
      className="mb-6"
      availableTabs={["Deposit", "Withdraw"]}
      activeTab={isDeposit ? "Deposit" : "Withdraw"}
      setActiveTab={switchTokens}
    />
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={option => setInputToken(option)}
      onMaxClick={() => handleChangeInput(
        {
          currentTarget: {
            value: formatUnits(safeRound(
              BigInt(inputToken.balance.toLocaleString("fullwide", { useGrouping: false })),
              inputToken.decimals), inputToken.decimals)
          }
        })}
      chainId={chainId}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={tokenOptions.filter(token =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault.address
      )}
      allowSelection={isDeposit}
      allowInput
    />
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-customLightGray" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#141416] px-4">
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
      value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={tokenOptions.filter(token =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault.address
      )}
      allowSelection={!isDeposit}
      allowInput={false}
    />
    {((isDeposit && ![asset.address, vault.address].includes(inputToken.address)) ||
      (!isDeposit && ![asset.address, vault.address].includes(outputToken.address))) &&
      <div className="group/zap flex flex-row items-center cursor-pointer" onClick={() => setShowModal(true)}>
        <Cog6ToothIcon className="h-5 w-5 mt-1 mr-2 text-secondaryLight group-hover/zap:text-primary" aria-hidden="true" />
        <p className="text-secondaryLight group-hover/zap:text-primary">Zap Settings</p>
      </div >
    }
    <div className="mt-8">
      <MainActionButton label={isDeposit ? "Deposit" : "Withdraw"} handleClick={handleMainAction} />
    </div>
  </>
}
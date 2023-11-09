import { ArrowDownIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import { useEffect, useState } from "react";
import { Address, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import TabSelector from "@/components/common/TabSelector";
import { Token } from "@/lib/types";
import { handleAllowance } from "@/lib/approve";
import { WalletClient } from "viem";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw, zapIntoGauge, zapIntoVault } from "@/lib/vault/interactions";
import { ADDRESS_ZERO, ERC20Abi, ROUNDING_VALUE } from "@/lib/constants";
import { MutateTokenBalanceProps } from "pages/vaults";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { getVeAddresses } from "@/lib/utils/addresses";
import { validateInput } from "@/lib/utils/helpers";
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions";
import zap from "@/lib/vault/zap";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()
const COWSWAP_RELAYER = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110"

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
          // TODO -- await fulfillment
          const preBal = asset.balance
          await vaultRedeem({
            address: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
          const postBal = Number(await publicClient.readContract({ address: asset.address, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))
          const orderId = await zap({
            account,
            signer: walletClient,
            sellToken: asset.address,
            buyToken: outputToken.address,
            amount: postBal - preBal,
            slippage,
            tradeTimeout
          })
          console.log("waiting for order fulfillment")

          let traded = false;

          let secondsPassed = 0;
          setInterval(() => { console.log(secondsPassed); secondsPassed += 1 }, 1000)

          publicClient.watchEvent({
            address: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
            event: { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "sellToken", "type": "address" }, { "indexed": false, "internalType": "contract IERC20", "name": "buyToken", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "sellAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "buyAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "orderUid", "type": "bytes" }], "name": "Trade", "type": "event" },
            onLogs: async (logs) => {
              console.log(logs)
              traded = true;
              console.log("do stuff")
              const found = logs.find(log => log.args.orderUid?.toLowerCase() === orderId.toLowerCase())
              if (found) {
                console.log("MATCHED ORDER")
                showSuccessToast("Zapped out!")
              }
            }
          })

          setTimeout(() => {
            if (!traded) {
              console.log("ERROR")
              showErrorToast("Zap Order failed")
            }
          }, tradeTimeout * 1000)

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

          const preBal = asset.balance
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient
          })
          await vaultUnstakeAndWithdraw({
            address: VAULT_ROUTER,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            vault: vault.address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient
          })
          const postBal = Number(await publicClient.readContract({ address: asset.address, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))
          zap({
            account,
            signer: walletClient,
            sellToken: asset.address,
            buyToken: outputToken.address,
            amount: postBal - preBal,
            slippage,
            tradeTimeout
          })
        }
        break;
      default:
        console.log("in zap asset")
        if (outputToken.address === vault.address) {
          console.log("out vault")
          // handle cow router allowance
          console.log("approve cow router")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: COWSWAP_RELAYER,
            publicClient,
            walletClient
          })
          const success = zapIntoVault({
            sellToken: inputToken.address,
            asset: asset.address,
            vault: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            slippage,
            tradeTimeout,
            publicClient,
            walletClient
          })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: COWSWAP_RELAYER,
            publicClient,
            walletClient
          })
          const success = zapIntoGauge({
            sellToken: inputToken.address,
            router: VAULT_ROUTER,
            asset: asset.address,
            vault: vault.address,
            gauge: gauge.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            slippage,
            tradeTimeout,
            publicClient,
            walletClient
          })
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
      onMaxClick={() => handleChangeInput(
        {
          currentTarget: {
            value: Math.round((inputToken.balance / (10 ** inputToken.decimals)) * ROUNDING_VALUE) / ROUNDING_VALUE
          }
        })
      }
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
        <Cog6ToothIcon className="h-5 w-5 mb-1 mr-2 text-primary group-hover/zap:text-primaryLight" aria-hidden="true" />
        <p className="text-primary group-hover/zap:text-primaryLight">Zap Settings</p>
      </div >
    }
    <div className="mt-8">
      <MainActionButton label={isDeposit ? "Deposit" : "Withdraw"} handleClick={handleMainAction} />
    </div>
  </>
}

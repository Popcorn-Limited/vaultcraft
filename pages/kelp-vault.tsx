import MainActionButton from "@/components/button/MainActionButton";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import ActionSteps from "@/components/vault/ActionSteps";

import { masaAtom } from "@/lib/atoms/sdk";
import { getKelpVaultActionSteps, ActionStep } from "@/lib/getActionSteps";
import { getAssets } from "@/lib/resolver/velodrome";
import {Clients, KelpVaultActionType, Token, VaultData} from "@/lib/types";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { handleCallResult, validateInput } from "@/lib/utils/helpers";
import handleVaultInteraction from "@/lib/vault/kelp/handleVaultInteraction";
import zap from "@/lib/vault/zap";
import {ArrowDownIcon, Cog6ToothIcon, Square2StackIcon} from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios"
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Address, PublicClient, formatUnits, getAddress, isAddress, parseEther, zeroAddress } from "viem";
import { erc20ABI, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import AssetWithName from "@/components/vault/AssetWithName";
import Modal from "@/components/modal/Modal";
import VaultStats from "@/components/vault/VaultStats";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {showSuccessToast} from "@/lib/toasts";
import {vaultsAtom} from "@/lib/atoms/vaults";

const minDeposit = 100000000000000;

// pass in everything to use for mint/withdraw on both protocols
async function simulate(
  { account, address, abi, functionName, args, value, publicClient }
    : { account: Address, address: Address, abi: any, value: bigint | undefined, functionName: string, args: any[], publicClient: PublicClient }) {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi,
      functionName,
      args,
      value
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

export async function mintEthX({ amount, account, clients }: { amount: number, account: Address, clients: Clients }) {
  return await handleCallResult({
    successMessage: "Minting EthX!",
    simulationResponse: await simulate({
      account,
      address: "0xcf5EA1b38380f6aF39068375516Daf40Ed70D299", // Stader Staking Pool Manager
      abi: [{ "inputs": [{ "internalType": "address", "name": "_receiver", "type": "address" }, { "internalType": "string", "name": "_referralId", "type": "string" }], "name": "deposit", "outputs": [{ "internalType": "uint256", "name": "_shares", "type": "uint256" }], "stateMutability": "payable", "type": "function" }],
      functionName: "deposit",
      args: [account, ""], // TODO -> add refId
      value: BigInt(amount),
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function mintRsEth({ amount, account, clients }: { amount: number, account: Address, clients: Clients }) {
  return await handleCallResult({
    successMessage: "Minting rsEth!",
    simulationResponse: await simulate({
      account,
      address: "0xcf5EA1b38380f6aF39068375516Daf40Ed70D299", // Stader Staking Pool Manager
      abi: [{ "inputs": [{ "internalType": "address", "name": "asset", "type": "address" }, { "internalType": "uint256", "name": "depositAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minRSETHAmountToReceive", "type": "uint256" }, { "internalType": "string", "name": "referralId", "type": "string" }], "name": "depositAsset", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
      functionName: "depositAsset",
      args: ["0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", BigInt(amount), BigInt(0), ""], // TODO -> add minAmount and refId
      value: undefined,
      publicClient: clients.publicClient
    }),
    clients
  })
}


const ETH: Token = {
  address: zeroAddress,
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  logoURI: "https://icons.llamao.fi/icons/chains/rsz_ethereum?w=48&h=48",
  balance: 0,
  price: 1
}


const ETHx: Token = {
  address: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b",
  name: "ETHx",
  symbol: "ETHx",
  decimals: 18,
  logoURI: "https://etherscan.io/token/images/ethxv2_32.png",
  balance: 0,
  price: 1
}

const rsETH: Token = {
  address: "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D",
  name: "rsETH",
  symbol: "rsETH",
  decimals: 18,
  logoURI: "https://etherscan.io/token/images/kelprseth_32.png",
  balance: 0,
  price: 1
}

const Vault: Token = {
  address: "0x008a1832841b0bBA57886Da2005aE7f666EFEcc4",
  name: "VaultCraft rsETH Vault",
  symbol: "vc-rsETH",
  decimals: 18,
  logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
  balance: 0,
  price: 1
}

async function fetchTokens(account: Address, publicClient: PublicClient) {
  const { data: llamaPrices } = await axios.get("https://coins.llama.fi/prices/current/ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,ethereum:0xA35b1B31Ce002FBF2058D22F30f95D405200A15b")

  const { data: rsEthPrice } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=kelp-dao-restaked-eth&vs_currencies=usd")


  const ethBal = await publicClient.getBalance({ address: account })
  const balRes = await publicClient.multicall({
    contracts: [
      {
        address: ETHx.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
      },
      {
        address: rsETH.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
      },
      {
        address: Vault.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
      }
    ],
    allowFailure: false
  }) as bigint[]

  return {
    eth: {
      ...ETH,
      price: llamaPrices.coins["ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"].price,
      balance: Number(ethBal)
    },
    ethx: {
      ...ETHx,
      price: llamaPrices.coins["ethereum:0xA35b1B31Ce002FBF2058D22F30f95D405200A15b"].price,
      balance: Number(balRes[0])
    },
    rseth: {
      ...rsETH,
      price: rsEthPrice["kelp-dao-restaked-eth"].usd,
      balance: Number(balRes[1])
    },
    vault: {
      ...Vault,
      price: rsEthPrice["kelp-dao-restaked-eth"].usd,
      balance: Number(balRes[2])
    }
  }
}

export default function KelpVault(vaultData: VaultData) {
  const [vaults, setVaults] = useAtom(vaultsAtom)

  const { query } = useRouter()
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 })
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [masaSdk,] = useAtom(masaAtom)

  const [tokens, setTokens] = useState<{ eth: Token, ethx: Token, rseth: Token, vault: Token } | null>(null)

  useEffect(() => {
    if (account) fetchTokens(account, publicClient).then(res => setTokens(res))
  }, [account])

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<KelpVaultActionType>(KelpVaultActionType.Deposit)

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  useEffect(() => {
    // set default input/output tokens
    setInputToken(ETH)
    setOutputToken(Vault)
    setSteps(getKelpVaultActionSteps(action))
  }, [])

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  };

  function handleMaxClick() {
    if (!inputToken) return
    const stringBal = inputToken.balance.toLocaleString("fullwide", { useGrouping: false })
    const rounded = safeRound(BigInt(stringBal), inputToken.decimals)
    const formatted = formatUnits(rounded, inputToken.decimals)
    handleChangeInput({ currentTarget: { value: formatted } })
  }

  function switchTokens() {
    setStepCounter(0)
    if (isDeposit) {
      // Switch to Withdraw
      setInputToken(Vault);
      setOutputToken(rsETH)
      setIsDeposit(false)
      setAction(KelpVaultActionType.Withdrawal)
      setSteps(getKelpVaultActionSteps(KelpVaultActionType.Withdrawal))
    } else {
      // Switch to Deposit
      setInputToken(ETH);
      setOutputToken(Vault)
      setIsDeposit(true)
      setAction(KelpVaultActionType.ZapDeposit)
      setSteps(getKelpVaultActionSteps(KelpVaultActionType.ZapDeposit))
    }
  }

  function handleTokenSelect(input: Token, output: Token): void {
    setInputToken(input);
    setOutputToken(output)

    switch (input.address) {
      case ETH.address:
        switch (output.address) {
          case Vault.address:
            setAction(KelpVaultActionType.ZapDeposit)
            setSteps(getKelpVaultActionSteps(KelpVaultActionType.ZapDeposit))
            return
          default:
            // error
            return
        }
      case ETHx.address:
        switch (output.address) {
          case Vault.address:
            setAction(KelpVaultActionType.EthxZapDeposit)
            setSteps(getKelpVaultActionSteps(KelpVaultActionType.EthxZapDeposit))
            return
          default:
            // error
            return
        }
      case rsETH.address:
        switch (output.address) {
          case Vault.address:
            setAction(KelpVaultActionType.Deposit)
            setSteps(getKelpVaultActionSteps(KelpVaultActionType.Deposit))
            return
          default:
            // error
            return
        }
      case Vault.address:
        switch (output.address) {
          case rsETH.address:
            setAction(KelpVaultActionType.Withdrawal)
            setSteps(getKelpVaultActionSteps(KelpVaultActionType.Withdrawal))
            return
          case ETH.address:
            setAction(KelpVaultActionType.ZapWithdrawal)
            setSteps(getKelpVaultActionSteps(KelpVaultActionType.ZapWithdrawal))
            return
          default:
            // error
            return
        }
      default:
        // error
        return
    }
  }

  async function handleMainAction() {
    const val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !account || !walletClient) return;

    if (chain?.id !== Number(1)) {
      try {
        await switchNetworkAsync?.(Number(1));
      } catch (error) {
        return
      }
    }

    const stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)

    const vaultInteraction = await handleVaultInteraction({
      action,
      stepCounter,
      chainId: 1,
      amount: (val * (10 ** inputToken.decimals)),
      inputToken,
      outputToken,
      // TODO create some hardcoded vaultData based on `Vault` (for vault), `rsETH` (for asset) and a resolver in the metadata for rsEth
      vaultData,
      account,
      slippage: 100,
      tradeTimeout: 60,
      clients: { publicClient, walletClient },
      fireEvent: masaSdk?.fireEvent,
      referral: !!query?.ref && isAddress(query.ref as string) ? getAddress(query.ref as string) : undefined
    })
    const success = await vaultInteraction()

    currentStep.loading = false
    currentStep.success = success;
    currentStep.error = !success;
    const newStepCounter = stepCounter + 1
    setSteps(stepsCopy)
    setStepCounter(newStepCounter)

    // TODO refetch new token balances
    // if (newStepCounter === steps.length) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
  }

  const [showModal, setShowModal] = useState(true)
  const gauge = vaultData.gauge;

  console.log("vaults: ", vaults)
  return (
    <>
      <div className="w-full pt-6 px-6 md:pt-0 border-t border-[#353945] md:border-none md:mt-10">
        <h1 className="text-[32px] leading-none md:text-center md:text-[56px] font-normal m-0 mb-2 md:mb-6 leading-0 text-primary">
          Kelp Vault
        </h1>
        <p className="leading-none md:text-4 text-left md:text-center text-xl text-primary">
          Deposit into kelp vault
        </p>
      </div>

      <div className="px-6 md:px-8 py-10 border-t border-b border-[#353945] mt-6 md:mt-10 w-full">
        <div className="rounded-lg w-full md:w-1/3 md:min-w-[870px] bg-[#23262F] md:ml-auto md:mr-auto md:p-8 px-8 pt-6 pb-5 md:pl-11 border border-[#353945] [&_summary::-webkit-details-marker]:hidden">
          {/* TODO add apy display (show simply the apy for rsETH) */}
          <TabSelector
            className="mb-6"
            availableTabs={["Deposit", "Withdraw"]}
            activeTab={isDeposit ? "Deposit" : "Withdraw"}
            setActiveTab={switchTokens}
          />

          <InputTokenWithError
            captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
            onSelectToken={option => handleTokenSelect(option, Vault)}
            onMaxClick={handleMaxClick}
            chainId={1}
            value={inputBalance}
            onChange={handleChangeInput}
            selectedToken={inputToken}
            errorMessage={""}
            // TODO use state tokens once they are available (so they show price and balance)
            tokenList={[ETH, rsETH]}
            allowSelection={isDeposit}
            allowInput
          />

          <div className="relative flex justify-center my-6">
            <ArrowDownIcon
              className="h-10 w-10 p-2 text-[#9CA3AF] border border-[#4D525C] rounded-full cursor-pointer hover:text-primary hover:border-primary"
              aria-hidden="true"
              onClick={switchTokens}
            />
          </div>

           <InputTokenWithError
            captionText={"Output Amount"}
            onSelectToken={option => handleTokenSelect(Vault, option)}
            onMaxClick={() => { }}
            chainId={1}
            value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
            onChange={() => { }}
            selectedToken={outputToken}
            errorMessage={""}
            // TODO use state tokens once they are available (so they show price and balance)
            tokenList={[ETH, rsETH]}
            allowSelection={!isDeposit}
            allowInput={false}
          />

          <div className="w-full flex justify-center my-6">
            <ActionSteps steps={steps} stepCounter={stepCounter} />
          </div>

          <div className="">
            {account ?
              <MainActionButton label={steps[stepCounter]?.label} handleClick={handleMainAction} disabled={inputBalance === "0" || steps[stepCounter].loading} />
              : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal} />
            }
          </div>

        </div>
      </div>
    </>
  );
}

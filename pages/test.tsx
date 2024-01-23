import MainActionButton from "@/components/button/MainActionButton";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import ActionSteps from "@/components/vault/ActionSteps";
import { masaAtom } from "@/lib/atoms/sdk";
import { ActionStep, getKelpVaultActionSteps } from "@/lib/getActionSteps";
import { Clients, KelpVaultActionType, Token, VaultData } from "@/lib/types";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { handleCallResult, validateInput } from "@/lib/utils/helpers";
import handleVaultInteraction from "@/lib/vault/kelp/handleVaultInteraction";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios"
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Address, PublicClient, formatUnits, getAddress, isAddress, maxUint256, zeroAddress } from "viem";
import { erc20ABI, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";

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
      address: "0x036676389e48133B63a802f8635AD39E752D375D", // KelpDao Deposit Pool
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
  address: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
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

  //const { data: rsEthPrice } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=kelp-dao-restaked-eth&vs_currencies=usd")
  const rsEthPrice = 2221.40

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
      price: rsEthPrice,
      balance: Number(balRes[1])
    },
    vault: {
      ...Vault,
      price: rsEthPrice,
      balance: Number(balRes[2])
    }
  }
}

export default function Test() {
  const { query } = useRouter()
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 })
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [masaSdk,] = useAtom(masaAtom)

  const [tokens, setTokens] = useState<{ eth: Token, ethx: Token, rseth: Token, vault: Token }>({ eth: ETH, ethx: ETHx, rseth: rsETH, vault: Vault })
  const [vaultData, setVaultData] = useState<VaultData>()

  useEffect(() => {
    if (account) fetchTokens(account, publicClient).then(res => {
      setTokens(res)
      setVaultData({
        address: Vault.address,
        vault: res.vault,
        asset: res.rseth,
        totalAssets: 1,
        totalSupply: 1,
        assetsPerShare: 1,
        pricePerShare: 1,
        tvl: 1,
        fees: {
          deposit: 0,
          withdrawal: 0,
          performance: 0,
          management: 0
        },
        depositLimit: Number(maxUint256),
        metadata: {
          creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
          feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
          cid: "",
          optionalMetadata: {
            protocol: { name: "KelpDao", description: "" },
            resolver: "kelpDao"
          },
        },
        chainId: 1,
        apy: 0,
        totalApy: 0
      })
    })
  }, [account])

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<KelpVaultActionType>(KelpVaultActionType.ZapDeposit)

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  useEffect(() => {
    // set default input/output tokens
    setInputToken(tokens.eth)
    setOutputToken(tokens.vault)
    setSteps(getKelpVaultActionSteps(action))
  }, [tokens])

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
    if (val === 0 || !inputToken || !outputToken || !account || !walletClient || !vaultData) return;

    if (chain?.id !== Number(1)) {
      try {
        await switchNetworkAsync?.(Number(1));
      } catch (error) {
        return
      }
    }

    let stepsCopy = [...steps]
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
      vaultData: vaultData,
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

    let newStepCounter = stepCounter + 1
    if (stepCounter === stepsCopy.length) {
      newStepCounter = 0;
      stepsCopy = [...getKelpVaultActionSteps(action)]
    }

    setSteps(stepsCopy)
    setStepCounter(newStepCounter)

    // TODO refetch new token balances
    // if (newStepCounter === steps.length) mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
  }

  console.log({ steps, stepCounter, tokens, vaultData, inputToken, outputToken })

  return <>
    {/* TODO add apy display (show simply the apy for rsETH) */}
    <TabSelector
      className="mb-6"
      availableTabs={["Deposit", "Withdraw"]}
      activeTab={isDeposit ? "Deposit" : "Withdraw"}
      setActiveTab={switchTokens}
    />
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={option => handleTokenSelect(option, tokens.vault)}
      onMaxClick={handleMaxClick}
      chainId={1}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={[tokens.eth, tokens.rseth, tokens.ethx]}
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
      onSelectToken={option => handleTokenSelect(tokens.vault, option)}
      onMaxClick={() => { }}
      chainId={1}
      value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={[tokens.eth, tokens.rseth]}
      allowSelection={!isDeposit}
      allowInput={false}
    />
    <div className="w-full flex justify-center my-6">
      <ActionSteps steps={steps} stepCounter={stepCounter} />
    </div>
    <div className="">
      {account && steps.length > 0 ?
        <MainActionButton label={steps[stepCounter].label} handleClick={handleMainAction} disabled={inputBalance === "0" || steps[stepCounter].loading} />
        : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal} />
      }
    </div>
  </>
}
import MainActionButton from "@/components/button/MainActionButton";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import ActionSteps from "@/components/vault/ActionSteps";
import {masaAtom} from "@/lib/atoms/sdk";
import {ActionStep, getDepositVaultActionSteps, getKelpVaultActionSteps} from "@/lib/getActionSteps";
import {Clients, DepositVaultActionType, KelpVaultActionType, Token, VaultData} from "@/lib/types";
import {safeRound} from "@/lib/utils/formatBigNumber";
import {handleCallResult, validateInput} from "@/lib/utils/helpers";
import handleVaultInteraction from "@/lib/vault/aave/handleVaultInteraction";
import {ArrowDownIcon, Square2StackIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import axios from "axios"
import {useAtom} from "jotai";
import {useRouter} from "next/router";
import {Fragment, useEffect, useState} from "react";
import {Address, PublicClient, formatUnits, getAddress, isAddress, maxUint256, zeroAddress} from "viem";
import {erc20ABI, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient} from "wagmi";
import VaultStats from "@/components/vault/VaultStats";
import AssetWithName from "@/components/vault/AssetWithName";
import Modal from "@/components/modal/Modal";
import {Dialog, Transition} from "@headlessui/react";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {showSuccessToast} from "@/lib/toasts";

const minDeposit = 100000000000000;

// pass in everything to use for mint/withdraw on both protocols
async function simulate(
  {account, address, abi, functionName, args, value, publicClient}
    : {
    account: Address,
    address: Address,
    abi: any,
    value: bigint | undefined,
    functionName: string,
    args: any[],
    publicClient: PublicClient
  }) {
  try {
    const {request} = await publicClient.simulateContract({
      account,
      address,
      abi,
      functionName,
      args,
      value
    })
    return {request: request, success: true, error: null}
  } catch (error: any) {
    return {request: null, success: false, error: error.shortMessage}
  }
}

export async function mintEthX({amount, account, clients}: { amount: number, account: Address, clients: Clients }) {
  return await handleCallResult({
    successMessage: "Minting EthX!",
    simulationResponse: await simulate({
      account,
      address: "0xcf5EA1b38380f6aF39068375516Daf40Ed70D299", // Stader Staking Pool Manager
      abi: [{
        "inputs": [{"internalType": "address", "name": "_receiver", "type": "address"}, {
          "internalType": "string",
          "name": "_referralId",
          "type": "string"
        }],
        "name": "deposit",
        "outputs": [{"internalType": "uint256", "name": "_shares", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function"
      }],
      functionName: "deposit",
      args: [account, ""], // TODO -> add refId
      value: BigInt(amount),
      publicClient: clients.publicClient
    }),
    clients
  })
}

export async function mintRsEth({amount, account, clients}: { amount: number, account: Address, clients: Clients }) {
  return await handleCallResult({
    successMessage: "Minting rsEth!",
    simulationResponse: await simulate({
      account,
      address: "0x036676389e48133B63a802f8635AD39E752D375D", // KelpDao Deposit Pool
      abi: [{
        "inputs": [{"internalType": "address", "name": "asset", "type": "address"}, {
          "internalType": "uint256",
          "name": "depositAmount",
          "type": "uint256"
        }, {"internalType": "uint256", "name": "minRSETHAmountToReceive", "type": "uint256"}, {
          "internalType": "string",
          "name": "referralId",
          "type": "string"
        }], "name": "depositAsset", "outputs": [], "stateMutability": "nonpayable", "type": "function"
      }],
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
  const {data: llamaPrices} = await axios.get("https://coins.llama.fi/prices/current/ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,ethereum:0xA35b1B31Ce002FBF2058D22F30f95D405200A15b")

  //const { data: rsEthPrice } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=kelp-dao-restaked-eth&vs_currencies=usd")
  const rsEthPrice = 2221.40

  const ethBal = await publicClient.getBalance({address: account})
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

export default function DepositViaLoan() {
  const {query} = useRouter()
  //const { address: account } = useAccount();
  const account = "0xfF9f8DC2f76f02CB1D4C3a960D2591Ca6a7f6867";
  const publicClient = usePublicClient({chainId: 1})
  const {data: walletClient} = useWalletClient()
  const {openConnectModal} = useConnectModal();
  const {chain} = useNetwork();
  const {switchNetworkAsync} = useSwitchNetwork();
  const [masaSdk,] = useAtom(masaAtom)

  const [tokens, setTokens] = useState<{ eth: Token, ethx: Token, rseth: Token, vault: Token }>({
    eth: ETH,
    ethx: ETHx,
    rseth: rsETH,
    vault: Vault
  })
  //TODO: remove initial state
  const [vaultData, setVaultData] = useState<VaultData>({
    address: Vault.address,
    apy: 0,
    asset: Vault,
    assetPrice: 0,
    assetsPerShare: 0,
    chainId: 0,
    depositLimit: 0,
    fees: 0,
    gauge: Vault.address,
    gaugeMaxApy: 0,
    gaugeMinApy: 0,
    metadata: {
      creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
      feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
      cid: "",
      optionalMetadata: {
        protocol: {name: "KelpDao", description: ""},
        resolver: "kelpDao"
      },
    },
    pricePerShare: 0,
    totalApy: 0,
    totalAssets: 0,
    totalSupply: 0,
    tvl: 0,
    vault: Vault
  })

  useEffect(() => {
    console.log("use effecterr");
    if (account) fetchTokens(account, publicClient).then(res => {
      console.log("called use effect");
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
            protocol: {name: "KelpDao", description: ""},
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
  const [action, setAction] = useState<DepositVaultActionType>(DepositVaultActionType.Supply)

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Supply");


  useEffect(() => {
    // set default input/output tokens
    setInputToken(tokens.eth)
    setOutputToken(tokens.vault)
    setSteps(getDepositVaultActionSteps(action))
    // setSteps(getKelpVaultActionSteps(action))
  }, [tokens])

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!inputToken) return
    const stringBal = inputToken.balance.toLocaleString("fullwide", {useGrouping: false})
    const rounded = safeRound(BigInt(stringBal), inputToken.decimals)
    const formatted = formatUnits(rounded, inputToken.decimals)
    handleChangeInput({currentTarget: {value: formatted}})
  }

  function handleActiveTabSelect(activeTab: string) {
    console.log("tab is: ", activeTab)

    switch (activeTab) {
      case "Supply":
        setStepCounter(0)
        setActiveTab(activeTab);
        setAction(DepositVaultActionType.Supply)
        setSteps(getDepositVaultActionSteps(DepositVaultActionType.Supply))
        return;
      case "Borrow":
        setStepCounter(1)
        setActiveTab(activeTab);
        setAction(DepositVaultActionType.Borrow)
        //setSteps(getDepositVaultActionSteps(DepositVaultActionType.Borrow))
        return;
      case "Deposit":
        setStepCounter(2)
        setActiveTab(activeTab);
        setAction(DepositVaultActionType.Deposit)
        //setSteps(getDepositVaultActionSteps(DepositVaultActionType.Deposit))
        return;
      default: return;
    }

  }

  function handleTokenSelect(input: Token, output: Token): void {
    setInputToken(input);
    setOutputToken(output)

    // switch (input.address) {
    //   case ETH.address:
    //     switch (output.address) {
    //       case Vault.address:
    //         setAction(KelpVaultActionType.ZapDeposit)
    //         setSteps(getKelpVaultActionSteps(KelpVaultActionType.ZapDeposit))
    //         return
    //       default:
    //         // error
    //         return
    //     }
    //   case ETHx.address:
    //     switch (output.address) {
    //       case Vault.address:
    //         setAction(KelpVaultActionType.EthxZapDeposit)
    //         setSteps(getKelpVaultActionSteps(KelpVaultActionType.EthxZapDeposit))
    //         return
    //       default:
    //         // error
    //         return
    //     }
    //   case rsETH.address:
    //     switch (output.address) {
    //       case Vault.address:
    //         setAction(KelpVaultActionType.Deposit)
    //         setSteps(getKelpVaultActionSteps(KelpVaultActionType.Deposit))
    //         return
    //       default:
    //         // error
    //         return
    //     }
    //   case Vault.address:
    //     switch (output.address) {
    //       case rsETH.address:
    //         setAction(KelpVaultActionType.Withdrawal)
    //         setSteps(getKelpVaultActionSteps(KelpVaultActionType.Withdrawal))
    //         return
    //       case ETH.address:
    //         setAction(KelpVaultActionType.ZapWithdrawal)
    //         setSteps(getKelpVaultActionSteps(KelpVaultActionType.ZapWithdrawal))
    //         return
    //       default:
    //         // error
    //         return
    //     }
    //   default:
    //     // error
    //     return
    // }
  }

  async function handleMainAction() {
    console.log("1");

    const val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !account || !walletClient || !vaultData) return;
    console.log("2");

    if (chain?.id !== Number(1)) {
      try {
        await switchNetworkAsync?.(Number(1));
      } catch (error) {
        return
      }
    }
    console.log("3");


    let stepsCopy = [...steps]
    const currentStep = stepsCopy[stepCounter]
    currentStep.loading = true
    setSteps(stepsCopy)
    console.log("4");

    const vaultInteraction = await handleVaultInteraction({
      ethX: inputToken,
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
      clients: {publicClient, walletClient},
      fireEvent: masaSdk?.fireEvent,
      referral: !!query?.ref && isAddress(query.ref as string) ? getAddress(query.ref as string) : undefined
    })
    console.log("5");
    // const success = await vaultInteraction()
    //
    // currentStep.loading = false
    // currentStep.success = success;
    // currentStep.error = !success;
    //
    // let newStepCounter = stepCounter + 1
    // if (stepCounter === stepsCopy.length) {
    //   newStepCounter = 0;
    //   stepsCopy = [...getKelpVaultActionSteps(action)]
    // }
    //
    // setSteps(stepsCopy)
    // setStepCounter(newStepCounter)
  }

  const [showModal, setShowModal] = useState(true)
  const gauge = vaultData?.gauge;

  return (
    <>
      <div className="w-full pt-6 px-6 md:pt-0 border-t border-[#353945] md:border-none md:mt-10">
        <h1
          className="text-[32px] leading-none md:text-center md:text-[56px] font-normal m-0 mb-2 md:mb-6 leading-0 text-primary">
          Deposit Via Loan
        </h1>
        <p className="leading-none md:text-4 text-left md:text-center text-xl text-primary">
          Take a loan from Aave and deposit your loaned asset into a vault
        </p>
      </div>

      <div className="px-6 md:px-8 py-10 border-t border-b border-[#353945] mt-6 md:mt-10 w-full">

        <div
          className="rounded-lg w-full md:w-1/3 md:min-w-[870px] bg-[#23262F] md:ml-auto md:mr-auto md:p-8 px-8 pt-6 pb-5 md:pl-11 border border-[#353945] [&_summary::-webkit-details-marker]:hidden">

          <div className="flex flex-row justify-between font-medium md:items-center mb-8">
            <>{<AssetWithName vault={vaultData}/>}</>
          </div>

          <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
            <VaultStats vaultData={vaultData} account={account} zapAvailable={false}/>
          </div>

          {/*<div className="hidden md:block space-y-4">*/}
          {/*  where is this*/}
          {/*  {gauge &&*/}
          {/*    <div className="w-10/12 border border-[#353945] rounded-lg p-4">*/}
          {/*      <p className="text-primary font-normal">Gauge address:</p>*/}
          {/*      <div className="flex flex-row items-center justify-between">*/}
          {/*        <p className="font-bold text-primary">*/}
          {/*          {gauge.address?.slice(0, 6)}...{gauge.address?.slice(-4)}*/}
          {/*        </p>*/}
          {/*        <div className='w-6 h-6 group/gaugeAddress'>*/}
          {/*          <CopyToClipboard text={gauge.address} onCopy={() => showSuccessToast("Gauge address copied!")}>*/}
          {/*            <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]"/>*/}
          {/*          </CopyToClipboard>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  }*/}
          {/*</div>*/}

          <TabSelector
            className="mb-6"
            availableTabs={["Supply", "Borrow", "Deposit"]}
            activeTab={activeTab}
            setActiveTab={handleActiveTabSelect}
          />

          <InputTokenWithError
            captionText={`${activeTab} Amount`}
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

          {activeTab === "Deposit" && (
            <div className="relative flex justify-center my-6">
              <ArrowDownIcon
                className="h-10 w-10 p-2 text-[#9CA3AF] border border-[#4D525C] rounded-full cursor-pointer hover:text-primary hover:border-primary"
                aria-hidden="true"
                onClick={() => {}}
              />
            </div>
          )}

          {activeTab === "Deposit"  && (
            <InputTokenWithError
              captionText={"Output Amount"}
              onSelectToken={option => handleTokenSelect(tokens.vault, option)}
              onMaxClick={() => {
              }}
              chainId={1}
              value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
              onChange={() => {
              }}
              selectedToken={outputToken}
              errorMessage={""}
              tokenList={[tokens.eth, tokens.rseth]}
              allowSelection={!isDeposit}
              allowInput={false}
            />
          )}

          <div className="w-full flex justify-center my-6">
            <ActionSteps steps={steps} stepCounter={stepCounter}/>
          </div>

          <div className="">
            {account && steps.length > 0 ?
              <MainActionButton label={steps[stepCounter]?.label} handleClick={handleMainAction}
                                disabled={inputBalance === "0" || steps[stepCounter].loading}/>
              : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal}/>
            }
          </div>

        </div>
      </div>
    </>
  );
}

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
import { ArrowDownIcon, Square2StackIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios"
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Address, PublicClient, formatUnits, getAddress, isAddress, maxUint256, zeroAddress } from "viem";
import { erc20ABI, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import VaultStats from "@/components/vault/VaultStats";
import AssetWithName from "@/components/vault/AssetWithName";
import Modal from "@/components/modal/Modal";
import { Dialog, Transition } from "@headlessui/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { showSuccessToast } from "@/lib/toasts";
import { VaultInputsProps } from "@/components/vault/VaultInputs";
import Accordion from "@/components/common/Accordion";
import { ADDRESS_ZERO, VaultAbi } from "@/lib/constants";
import { MutateTokenBalanceProps } from "@/components/vault/VaultsContainer";

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

async function getKelpVaultData(account: Address, publicClient: PublicClient): Promise<{ tokenOptions: Token[], vaultData: VaultData }> {
  const { data: llamaPrices } = await axios.get("https://coins.llama.fi/prices/current/ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,ethereum:0xA35b1B31Ce002FBF2058D22F30f95D405200A15b,ethereum:0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7")

  const ethBal = await publicClient.getBalance({ address: account })
  const res = await publicClient.multicall({
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
      },
      {
        address: Vault.address,
        abi: VaultAbi,
        functionName: 'totalAssets'
      },
      {
        address: Vault.address,
        abi: VaultAbi,
        functionName: 'totalSupply'
      },
    ],
    allowFailure: false
  }) as bigint[]

  const asset = {
    ...rsETH,
    price: llamaPrices.coins["ethereum:0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7"].price,
    balance: account === zeroAddress ? 0 : Number(res[1])
  }

  const vault = {
    ...Vault,
    price: llamaPrices.coins["ethereum:0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7"].price,
    balance: account === zeroAddress ? 0 : Number(res[2])
  }

  const totalAssets = Number(res[3]);
  const totalSupply = Number(res[4])
  const assetsPerShare = totalSupply > 0 ? (totalAssets + 1) / (totalSupply + (1e9)) : Number(1e-9)
  const pricePerShare = assetsPerShare * asset.price

  const vaultData: VaultData = {
    address: Vault.address,
    asset: asset,
    vault: vault,
    totalAssets: totalAssets,
    totalSupply: totalSupply,
    assetsPerShare: assetsPerShare,
    pricePerShare: pricePerShare,
    tvl: (totalSupply * pricePerShare) / (10 ** asset.decimals),
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 100000000000000000
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
  }

  return {
    tokenOptions: [{
      ...ETH,
      price: llamaPrices.coins["ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"].price,
      balance: account === zeroAddress ? 0 : Number(ethBal)
    },
    {
      ...ETHx,
      price: llamaPrices.coins["ethereum:0xA35b1B31Ce002FBF2058D22F30f95D405200A15b"].price,
      balance: account === zeroAddress ? 0 : Number(res[0])
    },
      asset
    ],
    vaultData: vaultData
  }
}


export default function Index() {
  return <>
    <KelpVault searchTerm="" />
  </>
}

export function KelpVault({ searchTerm }: { searchTerm: string }) {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 })
  const [showModal, setShowModal] = useState(false)

  const [vaultData, setVaultData] = useState<VaultData>()
  const [tokenOptions, setTokenOptions] = useState<Token[]>([])

  useEffect(() => {
    getKelpVaultData(account || zeroAddress, publicClient)
      .then(res => {
        setVaultData(res.vaultData);
        setTokenOptions(res.tokenOptions)
      })
  }, [account])

  async function mutateTokenBalance({ inputToken, outputToken, vault, chainId, account }: MutateTokenBalanceProps) {
    if (!vaultData) return

    const ethBal = await publicClient.getBalance({ address: account })
    const res = await publicClient.multicall({
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
        },
        {
          address: Vault.address,
          abi: VaultAbi,
          functionName: 'totalAssets'
        },
        {
          address: Vault.address,
          abi: VaultAbi,
          functionName: 'totalSupply'
        },
      ],
      allowFailure: false
    }) as bigint[]

    const newVaultData = { ...vaultData };
    const newTokenOptions = [...tokenOptions];

    newTokenOptions[0].balance = Number(ethBal);
    newTokenOptions[1].balance = Number(res[0]);
    newTokenOptions[2].balance = Number(res[1]);
    newVaultData.asset.balance = Number(res[1]);
    newVaultData.vault.balance = Number(res[2])

    const totalAssets = Number(res[3]);
    const totalSupply = Number(res[4])
    const assetsPerShare = totalSupply > 0 ? (totalAssets + 1) / (totalSupply + (1e9)) : Number(1e-9)
    const pricePerShare = assetsPerShare * vaultData?.asset.price

    newVaultData.totalAssets = totalAssets;
    newVaultData.totalSupply = totalSupply;
    newVaultData.assetsPerShare = assetsPerShare;
    newVaultData.pricePerShare = pricePerShare;
    newVaultData.tvl = (totalSupply * pricePerShare) / (10 ** vaultData.asset.decimals)

    setVaultData(newVaultData);
    setTokenOptions(newTokenOptions);
  }

  // Is loading / error
  if (!vaultData || tokenOptions.length === 0) return <></>
  // Vault is not in search term
  if (searchTerm !== "" &&
    !Vault.name.toLowerCase().includes(searchTerm) &&
    !Vault.symbol.toLowerCase().includes(searchTerm) &&
    !vaultData.metadata.optionalMetadata.protocol?.name.toLowerCase().includes(searchTerm)) return <></>
  return (
    <>
      <Modal visibility={[showModal, setShowModal]} title={<AssetWithName vault={vaultData} />} >
        <div className="flex flex-col md:flex-row w-full md:gap-8">
          <div className="w-full md:w-1/2 text-start flex flex-col justify-between">

            <div className="space-y-4">
              <VaultStats vaultData={vaultData} account={account} zapAvailable={false} />
            </div>

            <div className="hidden md:block space-y-4">
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Asset address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.asset.address.slice(0, 6)}...{vaultData.asset.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/assetAddress'>
                    <CopyToClipboard text={vaultData.asset.address} onCopy={() => showSuccessToast("Asset address copied!")}>
                      <Square2StackIcon className="text-white group-hover/assetAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.vault.address.slice(0, 6)}...{vaultData.vault.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/vaultAddress'>
                    <CopyToClipboard text={vaultData.vault.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              {/* {gauge &&
                <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                  <p className="text-primary font-normal">Gauge address:</p>
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-primary">
                      {gauge.address.slice(0, 6)}...{gauge.address.slice(-4)}
                    </p>
                    <div className='w-6 h-6 group/gaugeAddress'>
                      <CopyToClipboard text={gauge.address} onCopy={() => showSuccessToast("Gauge address copied!")}>
                        <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]" />
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              } */}
            </div>

          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0 flex-grow rounded-lg border border-[#353945] bg-[#141416] p-6">
            <KelpVaultInputs
              vaultData={vaultData}
              tokenOptions={tokenOptions}
              chainId={vaultData.chainId}
              hideModal={() => setShowModal(false)}
              mutateTokenBalance={() => { }}
            />
          </div>
        </div>
      </Modal>
      <Accordion handleClick={() => setShowModal(true)}>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">

          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>

          <VaultStats vaultData={vaultData} account={account} zapAvailable={false} />

        </div>
      </Accordion >
    </>
  );
}


export function KelpVaultInputs({ vaultData, tokenOptions, chainId, hideModal, mutateTokenBalance }: VaultInputsProps): JSX.Element {
  const { query } = useRouter()
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 })
  const { data: walletClient } = useWalletClient()
  const { openConnectModal } = useConnectModal();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [masaSdk,] = useAtom(masaAtom)

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<KelpVaultActionType>(KelpVaultActionType.ZapDeposit)

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  useEffect(() => {
    // set default input/output tokens
    setInputToken(tokenOptions.find(o => o.address === ETH.address))
    setOutputToken(vaultData.vault)
    setSteps(getKelpVaultActionSteps(action))
  }, [tokenOptions, vaultData])

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
      setInputToken(vaultData.vault);
      setOutputToken(vaultData.asset)
      setIsDeposit(false)
      setAction(KelpVaultActionType.Withdrawal)
      setSteps(getKelpVaultActionSteps(KelpVaultActionType.Withdrawal))
    } else {
      // Switch to Deposit
      setInputToken(tokenOptions.find(o => o.address === ETH.address));
      setOutputToken(vaultData.vault)
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
    if (stepCounter === steps.length) {
      newStepCounter = 0;
      stepsCopy = [...getKelpVaultActionSteps(action)]
      mutateTokenBalance({ inputToken: inputToken.address, outputToken: outputToken.address, vault: vault.address, chainId, account })
    }

    setSteps(stepsCopy)
    setStepCounter(newStepCounter)
  }

  return (
    <>
      <TabSelector
        className="mb-6"
        availableTabs={["Deposit", "Withdraw"]}
        activeTab={isDeposit ? "Deposit" : "Withdraw"}
        setActiveTab={switchTokens}
      />

      <InputTokenWithError
        captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
        onSelectToken={option => handleTokenSelect(option, vaultData.vault)}
        onMaxClick={handleMaxClick}
        chainId={1}
        value={inputBalance}
        onChange={handleChangeInput}
        selectedToken={inputToken}
        errorMessage={""}
        tokenList={tokenOptions}
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
        onSelectToken={option => handleTokenSelect(vaultData.vault, option)}
        onMaxClick={() => { }}
        chainId={1}
        value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
        onChange={() => { }}
        selectedToken={outputToken}
        errorMessage={""}
        tokenList={tokenOptions.filter(o => o.address !== ETHx.address)}
        allowSelection={!isDeposit}
        allowInput={false}
      />

      <div className="w-full flex justify-center my-6">
        <ActionSteps steps={steps} stepCounter={stepCounter} />
      </div>

      <div className="">
        {account && steps.length > 0 ? (
          <>
            {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
              <MainActionButton label={"Close Modal"} handleClick={hideModal} /> :
              <MainActionButton label={steps[stepCounter]?.label} handleClick={handleMainAction} disabled={inputBalance === "0" || steps[stepCounter]?.loading} />
            }
          </>
        )
          : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal} />
        }
      </div>
    </>)
}
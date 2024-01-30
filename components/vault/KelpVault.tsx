import MainActionButton from "@/components/button/MainActionButton";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import ActionSteps from "@/components/vault/ActionSteps";
import { masaAtom, yieldOptionsAtom } from "@/lib/atoms/sdk";
import { ActionStep, getKelpVaultActionSteps } from "@/lib/getActionSteps";
import { Clients, GaugeData, KelpVaultActionType, Token, VaultData } from "@/lib/types";
import { safeRound } from "@/lib/utils/formatBigNumber";
import { handleCallResult, validateInput } from "@/lib/utils/helpers";
import handleVaultInteraction from "@/lib/vault/kelp/handleVaultInteraction";
import { ArrowDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios"
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Address, PublicClient, formatUnits, getAddress, isAddress, maxUint256, zeroAddress } from "viem";
import { erc20ABI, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import VaultStats from "@/components/vault/VaultStats";
import AssetWithName from "@/components/vault/AssetWithName";
import Modal from "@/components/modal/Modal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { showSuccessToast } from "@/lib/toasts";
import { VaultInputsProps } from "@/components/vault/VaultInputs";
import Accordion from "@/components/common/Accordion";
import { VaultAbi } from "@/lib/constants";
import { YieldOptions } from "vaultcraft-sdk";
import { MutateTokenBalanceProps } from "@/lib/vault/mutateTokenBalance";
import { zapAssetsAtom } from "@/lib/atoms";
import { vaultsAtom } from "@/lib/atoms/vaults";

const minDeposit = 100000000000000;

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
  logoURI: "https://www.staderlabs.com/eth/ethx.svg?imwidth=32",
  balance: 0,
  price: 1
}

const rsETH: Token = {
  address: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
  name: "rsETH",
  symbol: "rsETH",
  decimals: 18,
  logoURI: "https://icons.llamao.fi/icons/protocols/kelp-dao?w=48&h=48",
  balance: 0,
  price: 1
}

const Vault: Token = {
  address: "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725",
  name: "VaultCraft rsETH Vault",
  symbol: "vc-rsETH",
  decimals: 27,
  logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
  balance: 0,
  price: 1
}

const Gauge: Token = {
  address: "0x35fCa05eb9d7B4BeEbDfa110Ea342e6d9CA972ac",
  name: `Vaultcraft rsETH Vault-gauge`,
  symbol: `st-vc-rsETH`,
  decimals: 27,
  logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
  balance: 0,
  price: 1
}

export async function getKelpVaultData(account: Address, publicClient: PublicClient, yieldOptions: YieldOptions): Promise<{ tokenOptions: Token[], vaultData: VaultData }> {
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
      {
        address: Gauge.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [account]
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

  const apy = await yieldOptions.getApy({
    chainId: 1,
    protocol: "kelpDao",
    asset: asset.address
  })

  const gaugeApyData = (await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/gauge-apy-data.json`)).data as GaugeData;

  const gaugeMinApy = gaugeApyData["0x35fCa05eb9d7B4BeEbDfa110Ea342e6d9CA972ac"]?.lowerAPR || 0;
  const gaugeMaxApy = gaugeApyData["0x35fCa05eb9d7B4BeEbDfa110Ea342e6d9CA972ac"]?.upperAPR || 0;

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
      performance: 0
    },
    depositLimit: Number(maxUint256),
    metadata: {
      creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
      feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E",
      cid: "",
      // @ts-ignore
      optionalMetadata: {
        protocol: { name: "KelpDAO", description: `**KelpDao Depositor** - rsETH is a Liquid Restaked Token (LRT) issued by Kelp DAO designed to offer liquidity to illiquid assets deposited into restaking platforms, such as EigenLayer. rsETH contracts distribute the deposited tokens into different Node Operators that operate with the Kelp DAO. 

        Rewards accrue from the various services to the rsETH contracts. The price of rsETH token assumes the underlying price of the various rewards and staked tokens
        
        Additionally, depositors earn Kelp Miles and Eigen Layer points along with any eligible boosts.` },
        resolver: "kelpDao"
      },
    },
    gauge: {
      ...Gauge,
      balance: account === zeroAddress ? 0 : Number(res[5]),
      price: pricePerShare * 1e9,
    },
    chainId: 1,
    apy: apy.total,
    totalApy: apy.total + gaugeMaxApy,
    gaugeMinApy: gaugeMinApy,
    gaugeMaxApy: gaugeMaxApy,
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

export interface KelpMutateTokenBalanceProps {
  vaultDataState: [VaultData, Function];
  tokenOptionState: [Token[], Function];
  account: Address;
  publicClient: PublicClient;
}

export async function mutateKelpTokenBalance({ vaultDataState, tokenOptionState, account, publicClient }: KelpMutateTokenBalanceProps) {
  const [vaultData, setVaultData] = vaultDataState;
  const [tokenOptions, setTokenOptions] = tokenOptionState;

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

export default function KelpVault({ searchTerm }: { searchTerm: string }) {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: 1 })
  const [yieldOptions] = useAtom(yieldOptionsAtom)

  const [showModal, setShowModal] = useState(false)

  const [vaultData, setVaultData] = useState<VaultData>()
  const [tokenOptions, setTokenOptions] = useState<Token[]>([])

  useEffect(() => {
    if (yieldOptions) getKelpVaultData(account || zeroAddress, publicClient, yieldOptions)
      .then(res => {
        setVaultData(res.vaultData);
        setTokenOptions(res.tokenOptions)
      })
  }, [account, yieldOptions])

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
              {vaultData.gauge && (
                <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                  <p className="text-primary font-normal">Gauge address:</p>
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-primary">
                      {vaultData.gauge.address.slice(0, 6)}...{vaultData.gauge.address.slice(-4)}
                    </p>
                    <div className='w-6 h-6 group/gaugeAddress'>
                      <CopyToClipboard text={vaultData.gauge.address} onCopy={() => showSuccessToast("Gauge address copied!")}>
                        <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]" />
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0 flex-grow rounded-lg border border-[#353945] bg-[#141416] p-6">
            <KelpVaultInputs
              vaultData={vaultData}
              tokenOptions={tokenOptions}
              chainId={vaultData.chainId}
              hideModal={() => setShowModal(false)}
              mutateTokenBalance={mutateKelpTokenBalance}
              setVaultData={setVaultData}
              setTokenOptions={setTokenOptions}
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


export function KelpVaultInputs(
  { vaultData, tokenOptions, chainId, hideModal, mutateTokenBalance, setVaultData, setTokenOptions }
    : VaultInputsProps
    & {
      mutateTokenBalance: (props: KelpMutateTokenBalanceProps) => void;
      setVaultData: Function;
      setTokenOptions: Function;
    }

): JSX.Element {
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
      setInputToken(vaultData.gauge);
      setOutputToken(vaultData.asset)
      setIsDeposit(false)
      setAction(KelpVaultActionType.Withdrawal)
      setSteps(getKelpVaultActionSteps(KelpVaultActionType.Withdrawal))
    } else {
      // Switch to Deposit
      setInputToken(tokenOptions.find(o => o.address === ETH.address));
      setOutputToken(vaultData.gauge)
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
          case Gauge.address:
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
          case Gauge.address:
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
          case Gauge.address:
          case Vault.address:
            setAction(KelpVaultActionType.Deposit)
            setSteps(getKelpVaultActionSteps(KelpVaultActionType.Deposit))
            return
          default:
            // error
            return
        }
      case Gauge.address:
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
      ethX: tokenOptions.find(o => o.address === ETHx.address) as Token,
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

    if (newStepCounter === steps.length) mutateTokenBalance({
      vaultDataState: [vaultData, setVaultData],
      tokenOptionState: [tokenOptions, setTokenOptions],
      account,
      publicClient
    })
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
        onSelectToken={option => handleTokenSelect(option, vaultData.gauge || vaultData.vault)}
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
        onSelectToken={option => handleTokenSelect(!!vaultData.gauge ? vaultData.gauge : vaultData.vault, option)}
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
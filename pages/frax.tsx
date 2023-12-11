import MainActionButton from "@/components/button/MainActionButton"
import TabSelector from "@/components/common/TabSelector"
import Title from "@/components/common/Title"
import InputTokenWithError from "@/components/input/InputTokenWithError"
import ActionSteps from "@/components/vault/ActionSteps"
import { masaAtom } from "@/lib/atoms/sdk"
import { StakingVaultAbi } from "@/lib/constants/abi/StakingVault"
import { showLoadingToast, showSuccessToast } from "@/lib/toasts"
import { ActionType, SimulationResponse, Token } from "@/lib/types"
import { networkMap } from "@/lib/utils/connectors"
import { NumberFormatter, formatAndRoundNumber, safeRound } from "@/lib/utils/formatBigNumber"
import { handleCallResult, validateInput } from "@/lib/utils/helpers"
import { ActionStep } from "@/lib/vault/getActionSteps"
import { ArrowDownIcon, Cog6ToothIcon, Square2StackIcon } from "@heroicons/react/24/outline"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { FormEventHandler, useEffect, useState } from "react"
import { Address, ReadContractParameters, formatUnits, zeroAddress } from "viem"
import { PublicClient, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi"
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { VaultAbi, VaultRegistryAbi } from "@/lib/constants"
import InputNumber from "@/components/input/InputNumber"
import { calcUnlockTime } from "@/lib/gauges/utils"
import SecondaryActionButton from "@/components/button/SecondaryActionButton"
import axios from "axios";

async function simulateCall({ address, account, args, functionName, publicClient }: any): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: StakingVaultAbi,
      // @ts-ignore
      functionName,
      args
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

async function handleDeposit({ chainId, vaultData, account, args, clients, fireEvent, referral }: any): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const success = await handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateCall({ address: vaultData.address, account, args, functionName: "deposit", publicClient: clients.publicClient }),
    clients
  })

  if (success && fireEvent) {
    void fireEvent("addLiquidity", {
      user_address: account,
      network: networkMap[chainId].toLowerCase(),
      contract_address: vaultData.address,
      asset_amount: String(args.amount / (10 ** vaultData.asset.decimals)),
      asset_ticker: vaultData.asset.symbol,
      additionalEventData: {
        referral: referral,
        vault_name: vaultData.metadata.vaultName
      }
    });
  }
  return success
}

async function handleIncreaseAmount({ chainId, vaultData, account, args, clients, fireEvent, referral }: any): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const success = await handleCallResult({
    successMessage: "Deposited into the vault!",
    simulationResponse: await simulateCall({ address: vaultData.address, account, args, functionName: "deposit", publicClient: clients.publicClient }),
    clients
  })
  return success
}

async function handleWithdraw({ chainId, vaultData, account, args, clients, fireEvent, referral }: any): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const success = await handleCallResult({
    successMessage: "Withdrawn from the vault!",
    simulationResponse: await simulateCall({ address: vaultData.address, account, args, functionName: "withdraw", publicClient: clients.publicClient }),
    clients
  })

  if (success && fireEvent) {
    void fireEvent("removeLiquidity", {
      user_address: account,
      network: networkMap[chainId].toLowerCase(),
      contract_address: vaultData.address,
      asset_amount: String(args.amount / (10 ** vaultData.vault.decimals)),
      asset_ticker: vaultData.asset.symbol,
      additionalEventData: {
        referral: referral,
        vault_name: vaultData.metadata.vaultName
      }
    });
  }
  return success
}

async function handleClaim({ chainId, vaultData, account, args, clients, fireEvent, referral }: any): Promise<boolean> {
  showLoadingToast("Claiming rewards...")

  const success = await handleCallResult({
    successMessage: "Claimed rewards!",
    simulationResponse: await simulateCall({ address: vaultData.address, account, args, functionName: "claim", publicClient: clients.publicClient }),
    clients
  })
  return success
}

function LockTimeButton({ label, isActive, handleClick }: { label: string, isActive: boolean, handleClick: Function }): JSX.Element {
  return (
    <button
      className={`w-10 h-10 border border-[#C8C8C8] hover:bg-[#23262f] rounded-lg ${isActive ? "bg-white text-black" : "text-white"}`}
      onClick={() => handleClick()}
    >
      {label}
    </button>
  )
}

function StakingVaultInterface({ account, vaultData, chainId }: any): JSX.Element {
  const { query } = useRouter()
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();
  const [masaSdk,] = useAtom(masaAtom)

  const [inputToken, setInputToken] = useState<Token>(vaultData.asset)
  const [outputToken, setOutputToken] = useState<Token>(vaultData.vault)

  const [stepCounter, setStepCounter] = useState<number>(0)
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [action, setAction] = useState<ActionType>(ActionType.Deposit)

  const [inputBalance, setInputBalance] = useState<string>("0");
  const [days, setDays] = useState<number>(1);

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  };

  const handleSetDays: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setDays(Number(value));
  };

  function handleMaxClick() {
    if (!inputToken) return
    const stringBal = inputToken.balance.toLocaleString("fullwide", { useGrouping: false })
    const rounded = safeRound(BigInt(stringBal), inputToken.decimals)
    const formatted = formatUnits(rounded, inputToken.decimals)
    handleChangeInput({ currentTarget: { value: formatted } })
  }

  return <>
    <TabSelector
      className="mb-6"
      availableTabs={["Deposit", "Withdraw"]}
      activeTab={isDeposit ? "Deposit" : "Withdraw"}
      setActiveTab={() => { }}
    />
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={option => { }}
      onMaxClick={handleMaxClick}
      chainId={chainId}
      value={inputBalance}
      onChange={() => { }}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={[]}
      allowSelection={false}
      allowInput
    />
    <div className="mt-6">
      <div className="flex flex-row items-center justify-between">
        <p className="text-primary font-semibold mb-1">Lockup Time</p>
        <p className="w-32 text-secondaryLight">Custom Time</p>
      </div>
      <div className="flex flex-row items-center justify-between">
        <LockTimeButton label="1W" isActive={days === 7} handleClick={() => setDays(7)} />
        <LockTimeButton label="1M" isActive={days === 30} handleClick={() => setDays(30)} />
        <LockTimeButton label="3M" isActive={days === 90} handleClick={() => setDays(90)} />
        <LockTimeButton label="6M" isActive={days === 180} handleClick={() => setDays(180)} />
        <LockTimeButton label="1Y" isActive={days === 365} handleClick={() => setDays(365)} />
        <div className="w-32 flex px-5 py-2 items-center rounded-lg border border-customLightGray">
          <InputNumber
            onChange={handleSetDays}
            value={days}
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={"0.0"}
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between text-secondaryLight">
        <p>Unlocks at:</p>
        <p>{new Date(calcUnlockTime(days)).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-customLightGray" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#141416] px-4">
          <ArrowDownIcon
            className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full cursor-pointer hover:text-primary hover:border-primary"
            aria-hidden="true"
            onClick={() => { }}
          />
        </span>
      </div>
    </div>
    <InputTokenWithError
      captionText={"Output Amount"}
      onSelectToken={option => { }}
      onMaxClick={() => { }}
      chainId={chainId}
      value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={[]}
      allowSelection={!isDeposit}
      allowInput={false}
    />
    <InputTokenWithError
      captionText={"Reward Shares"}
      onSelectToken={option => { }}
      onMaxClick={() => { }}
      chainId={chainId}
      value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) * (days / 365) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={[]}
      allowSelection={!isDeposit}
      allowInput={false}
    />
    <div className="w-full flex justify-center my-6">
      <ActionSteps steps={steps} stepCounter={stepCounter} />
    </div>
    <div className="">
      {account ? (
        <>
          {(stepCounter === steps.length || steps.some(step => !step.loading && step.error)) ?
            <MainActionButton label={"Close Modal"} handleClick={() => { }} /> :
            <MainActionButton label={steps[stepCounter].label} handleClick={() => { }} disabled={inputBalance === "0" || steps[stepCounter].loading} />
          }
        </>
      )
        : < MainActionButton label={"Connect Wallet"} handleClick={openConnectModal} />
      }
    </div>
  </>
}

function LockVaultStats({ account, vaultData }: any): JSX.Element {
  return (
    <>
      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Your Wallet</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {`${formatAndRoundNumber(vaultData.asset.balance, vaultData.asset.decimals)}`}
            </Title>
          </p>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="text-primary font-normal md:text-[14px]">Your Deposit</p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {account ? '$ ' +
                formatAndRoundNumber(vaultData.vault.balance * vaultData.vault.price, vaultData.vault.decimals)
                : "-"}
            </Title>
          </div>
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p className="leading-6 text-primary md:text-[14px]">TVL</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
          </Title>
        </div>
      </div>

      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">vAPY</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            7 %
          </Title>
        </div>
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Min Rewards</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            10 %
          </Title>
        </div>
        <div className="w-full mt-6 md:mt-0">
          <p className="font-normal text-primary md:text-[14px]">Max Rewards</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            25 %
          </Title>
        </div>
      </div>
    </>
  )
}

function LockVault({ account, vaultData }: any): JSX.Element {
  return (
    <div className="flex flex-col md:flex-row w-full md:gap-8">
      <div className="w-full md:w-1/2 text-start flex flex-col justify-between">

        <div className="space-y-4">
          <LockVaultStats
            account={account}
            vaultData={vaultData}
          />
        </div>

        <div className="hidden md:block space-y-4">
          <div className="w-10/12 flex justify-between gap-8 md:gap-4">
            <div className="w-full mt-6 md:mt-0">
              <p className="font-normal text-primary md:text-[14px]">Accrued Rewards</p>
              <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
                {account ? '$ ' +
                  formatAndRoundNumber(vaultData.reward.balance * vaultData.reward.price, vaultData.reward.decimals)
                  : "-"}
              </Title>
            </div>
            <SecondaryActionButton label={"Claim Rewards"} handleClick={() => { }} disabled={vaultData.reward.balance / vaultData.reward.decimals < 1} />
          </div>
          <div className="w-10/12 border border-[#353945] rounded-lg p-4">
            <p className="text-primary font-normal">Asset address:</p>
            <div className="flex flex-row items-center justify-between">
              <p className="font-bold text-primary">
                {vaultData.assetAddress.slice(0, 6)}...{vaultData.assetAddress.slice(-4)}
              </p>
              <div className='w-6 h-6 group/vaultAddress'>
                <CopyToClipboard text={vaultData.assetAddress} onCopy={() => showSuccessToast("Asset address copied!")}>
                  <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                </CopyToClipboard>
              </div>
            </div>
          </div>
          <div className="w-10/12 border border-[#353945] rounded-lg p-4">
            <p className="text-primary font-normal">Vault address:</p>
            <div className="flex flex-row items-center justify-between">
              <p className="font-bold text-primary">
                {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
              </p>
              <div className='w-6 h-6 group/vaultAddress'>
                <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                  <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="w-full md:w-1/2 mt-4 md:mt-0 flex-grow rounded-lg border border-[#353945] bg-[#141416] p-6">
        <StakingVaultInterface
          account={account}
          vaultData={vaultData}
          chainId={42161}
        />
      </div>
    </div>
  )
}

function calcRewards(lock, accruedRewards, rewardIndex, decimals) {
  if (lock.rewardShares == 0) return 0;

  const delta = rewardIndex - lock.userIndex;

  return accruedRewards + ((lock.rewardShares * delta) / (10 ** decimals));
}

async function getVaults(account: Address, publicClient: PublicClient): Promise<any[]> {
  const addresses = await publicClient.readContract({
    address: "0x504f828886aB10D09ca1c116d6E1C5b8963cB109",
    abi: VaultRegistryAbi,
    functionName: "getRegisteredAddresses",
  }) as Address[];

  const { data: vaults } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/42161.json`)
  const { data: vaultTokens } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/42161.json`)
  const { data: assets } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/assets/tokens/42161.json`)

  let result = addresses.map(address => vaults[address]).map(vault => {
    return {
      ...vault,
      vault: { ...vaultTokens[vault.address], balance: 0 },
      asset: { ...assets[vault.assetAddress], balance: 0 },
      lock: {
        unlockTime: 0,
        rewardIndex: 0,
        amount: 0,
        rewardShares: 0
      }
    }
  })

  const uniqueAssetAdresses: Address[] = []
  result.forEach(vault => {
    if (!uniqueAssetAdresses.includes(vault.assetAddress)) {
      uniqueAssetAdresses.push(vault.assetAddress)
    }
  })

  const res1 = await publicClient.multicall({
    contracts: result.map(vaultData => {
      return [{
        address: vaultData.address,
        abi: StakingVaultAbi,
        functionName: 'totalSupply'
      },
      {
        address: vaultData.strategies[0],
        abi: StakingVaultAbi,
        functionName: 'balanceOf',
        args: [vaultData.address]
      },
      {
        address: vaultData.address,
        abi: StakingVaultAbi,
        functionName: 'rewardToken'
      },
      {
        address: vaultData.address,
        abi: StakingVaultAbi,
        functionName: 'currIndex'
      }]
    }).flat(),
    allowFailure: false
  })
  result.forEach((vaultData, i) => {
    if (i > 0) i = i * 4
    vaultData.totalSupply = res1[i]
    vaultData.strategyShares = res1[i + 1]
    vaultData.rewardAddress = res1[i + 2]

    vaultData.reward = assets[res1[i + 2]]
    vaultData.rewardIndex = Number(assets[res1[i + 3]]);

    if (!uniqueAssetAdresses.includes(res1[i + 2])) {
      uniqueAssetAdresses.push(res1[i + 2])
    }
  })

  const res2 = await publicClient.multicall({
    contracts: result.map((vaulData, i) => {
      return {
        address: vaulData.strategies[0],
        abi: VaultAbi,
        functionName: 'previewRedeem',
        args: [vaulData.strategyShares]
      }
    }).flat(),
    allowFailure: false
  })

  const { data: priceData } = await axios.get(`https://coins.llama.fi/prices/current/${String(uniqueAssetAdresses.map(
    // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
    address => `arbitrum:${address}`
  ))}`)
  result.forEach((vaultData, i) => {
    const totalAssets = res2[i]
    const assetsPerShare = Number(vaultData.totalSupply) > 0 ? Number(totalAssets) / Number(vaultData.totalSupply) : 1
    const assetPrice = priceData.coins[`arbitrum:${vaultData.assetAddress}`].price
    const rewardPrice = priceData.coins[`arbitrum:${vaultData.rewardAddress}`].price
    const pricePerShare = assetsPerShare * assetPrice

    vaultData.totalAssets = totalAssets;
    vaultData.assetsPerShare = assetsPerShare;
    vaultData.assetPrice = assetPrice;
    vaultData.rewardPrice = rewardPrice;
    vaultData.pricePerShare = pricePerShare;
    vaultData.tvl = Number(totalAssets) > 0 ? Number(totalAssets) * assetPrice / (10 ** vaultData.asset.decimals) : 0;

    vaultData.vault.price = pricePerShare;
    vaultData.asset.price = assetPrice;
    vaultData.reward.price = rewardPrice;
  })

  if (account !== zeroAddress) {
    const res3 = await publicClient.multicall({
      contracts: result.map((vaultData, i) => {
        return [{
          address: vaultData.address,
          abi: StakingVaultAbi,
          functionName: 'locks',
          args: [account]
        },
        {
          address: vaultData.address,
          abi: StakingVaultAbi,
          functionName: 'accruedRewards',
          args: [account]
        },
        {
          address: vaultData.address,
          abi: VaultAbi,
          functionName: 'balanceOf',
          args: [account]
        },
        {
          address: vaultData.assetAddress,
          abi: VaultAbi,
          functionName: 'balanceOf',
          args: [account]
        }]
      }).flat(),
      allowFailure: false
    })
    result.forEach((vaultData, i) => {
      if (i > 0) i = i * 4
      vaultData.vault.balance = Number(res3[i + 2])
      vaultData.asset.balance = Number(res3[i + 3])

      const lock = {
        unlockTime: Number(res3[i][0]) * 1000,
        rewardIndex: Number(res3[i][1]),
        amount: Number(res3[i][2]),
        rewardShares: Number(res3[i][3])
      }

      vaultData.lock = lock

      vaultData.reward.balance = calcRewards(lock, Number(res3[i + 1]), vaultData.rewardIndex, vaultData.vault.decimals)
    })
  }

  return result
}

export default function Index(): JSX.Element {
  const { address: account } = useAccount()
  const publicClient = usePublicClient({ chainId: 42161 })
  const [vaults, setVaults] = useState<any[]>([])

  useEffect(() => {
    if (publicClient) getVaults(account || zeroAddress, publicClient).then(res => setVaults(res))
  },
    [publicClient]
  )

  console.log(vaults)

  return (
    <div className="w-1/2">
      <div className="border border-white p-4">
        {vaults.length > 0 && vaults.map(vault => <LockVault account={account} vaultData={vault} />)}
      </div>
    </div>
  )
}
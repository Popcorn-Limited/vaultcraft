import { vaultsAtom } from "@/lib/atoms/vaults";
import { Clients, Token, TokenByAddress, TokenType, VaultData, ZapProvider } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import VaultInputs from "@/components/vault/VaultInputs";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { ArrowDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { Networth, networthAtom, tokensAtom, TVL, tvlAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ManageLoanInterface from "@/components/lending/ManageLoanInterface";
import { FEE_RECIPIENT_PROXY, ST_VCX, VCX, VeTokenByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import StrategyDescription from "@/components/vault/StrategyDescription";
import ApyChart from "@/components/vault/ApyChart";
import VaultHero from "@/components/vault/VaultHero";
import { Address, createPublicClient, erc20Abi, formatUnits, http, isAddress, PublicClient, zeroAddress } from "viem";
import { mainnet } from "viem/chains";
import CardStat from "@/components/common/CardStat";
import { RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { LockVaultAbi } from "@/lib/constants/abi/LockVault";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import LargeCardStat from "@/components/common/LargeCardStat";
import { formatAndRoundNumber, formatNumber, formatTwoDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { validateInput } from "@/lib/utils/helpers";
import zap, { getZapProvider, handleZapAllowance } from "@/lib/vault/zap";
import MainActionButton from "@/components/button/MainActionButton";
import ActionSteps from "@/components/vault/ActionSteps";
import { handleAllowance } from "@/lib/approve";
import { deposit, increaseDeposit, withdraw } from "@/lib/vault/lockVault/interactions";
import PseudoRadioButton from "@/components/button/PseudoRadioButton";
import LockTimeButton from "@/components/button/LockTimeButton";

async function getUserLockVaultData(user: Address, vault: Address) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(RPC_URLS[mainnet.id]),
  })

  const block = await client.getBlock({
    blockTag: "latest"
  })

  const lockVaultData = await client.multicall({
    contracts: [
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "locks",
        args: [user]
      },
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "getCurrIndices",
      },
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "getUserIndices",
        args: [user]
      },
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "getAccruedRewards",
        args: [user]
      }
    ],
    allowFailure: false,
  })

  const rewardShares = Number(lockVaultData[0][2])
  const multiplier = Number(rewardShares / (Number(lockVaultData[0][1]) || 1))
  const vcxIndexDif = Number(lockVaultData[1][0]) - Number(lockVaultData[2][0])
  const newVCXRewards = rewardShares * vcxIndexDif
  const accruedVCX = (Number(lockVaultData[3][0]) + newVCXRewards) / 1e18

  const ovcxIndexDif = Number(lockVaultData[1][1]) - Number(lockVaultData[2][1])
  const newOVCXRewards = rewardShares * ovcxIndexDif
  const accruedOVCX = (Number(lockVaultData[3][1]) + newOVCXRewards) / 1e18

  return {
    unlockTime: Number(lockVaultData[0][0]) * 1000,
    unlocked: block.timestamp >= lockVaultData[0][0],
    hasLock: rewardShares > 0,
    isExit: (rewardShares > 0) && block.timestamp >= lockVaultData[0][0],
    multiplier,
    accruedVCX,
    accruedOVCX
  }
}

export default function Staking() {
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [tokens] = useAtom(tokensAtom)

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [lockVaultData, setLockVaultData] = useState<any>()
  const [userLockVaultData, setUserLockVaultData] = useState<any>()
  const [walletValue, setWalletValue] = useState<number>(0)
  const [depositValue, setDepositValue] = useState<number>(0)
  const [tvl, setTvl] = useState<number>(0)

  const [inputToken, setInputToken] = useState<Token>();
  const [outputToken, setOutputToken] = useState<Token>();
  const [inputBalance, setInputBalance] = useState<string>("0");
  const [lockTime, setLockTime] = useState<number>(31557600);

  const [actionType, setActionType] = useState<StakeActionType>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [zapProvider, setZapProvider] = useState(ZapProvider.none);
  const [zapAmount, setZapAmount] = useState<number>(0);
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (Object.keys(tokens).length > 0) {
      setTokenOptions([
        tokens[mainnet.id][VCX],
        ...ZapAssetAddressesByChain[mainnet.id].filter(addr => VCX !== addr).map(addr => tokens[mainnet.id][addr])
      ])
      const _asset = tokens[mainnet.id][VCX]
      const _vault = tokens[mainnet.id][ST_VCX]

      if (account) {
        refreshUserData()
      } else {
        setInputToken(_asset)
        setOutputToken(_vault)
        setActionType(StakeActionType.Deposit)
      }

      setAsset(_asset)
      setVault(_vault)
      setWalletValue((_asset.balance * _asset.price) / 1e18)
      setDepositValue((_vault.balance * _asset.price) / 1e18)
      setTvl((_vault.totalSupply * _asset.price) / 1e18)

    }
  }, [tokens, account]);

  async function refreshUserData() {
    const _asset = tokens[mainnet.id][VCX];
    const _vault = tokens[mainnet.id][ST_VCX]
    const _userLockVaultData = await getUserLockVaultData(account!, ST_VCX)
    setUserLockVaultData(_userLockVaultData)
    setInputToken(_userLockVaultData.isExit ? _vault : _asset)
    setOutputToken(_userLockVaultData.isExit ? _asset : _vault)
    setActionType(_userLockVaultData.isExit ? StakeActionType.Withdraw : _userLockVaultData.hasLock ? StakeActionType.IncreaseAmount : StakeActionType.Deposit)
    if (_userLockVaultData.isExit) {
      setInputBalance(String(_vault.balance / 1e18))
    }
  }

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputBalance(validateInput(value).isValid ? value : "0");

    setShowModal(false)
    setZapProvider(ZapProvider.none)
  }

  function handleMaxClick() {
    if (!asset) return;
    const stringBal = asset.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), asset.decimals);
    const formatted = formatUnits(rounded, asset.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
  }

  function handleTokenSelect(option: Token) {
    if (option.address === asset!.address) {
      setActionType(userLockVaultData.hasLock ? StakeActionType.IncreaseAmount : StakeActionType.Deposit)
    } else {
      setActionType(userLockVaultData.hasLock ? StakeActionType.ZapIncreaseAmount : StakeActionType.ZapDeposit)
    }
    setInputToken(option)
    setInputBalance("0")
    setShowModal(false)
    setZapProvider(ZapProvider.none)
  }

  async function findZapProvider(): Promise<boolean> {
    if (!inputToken || !outputToken || !asset || !account) return false
    const val = Number(inputBalance) * (10 ** inputToken.decimals)

    let newZapProvider = zapProvider
    showLoadingToast("Searching for the best price...")
    newZapProvider = await getZapProvider({ sellToken: inputToken, buyToken: asset, amount: val, chainId: 1, account, feeRecipient: FEE_RECIPIENT_PROXY })


    setZapProvider(newZapProvider)

    if (newZapProvider === ZapProvider.notFound) {
      showErrorToast("Zap not available. Please try a different token.")
      return false
    } else {
      showSuccessToast(`Using ${String(ZapProvider[newZapProvider])} for your zap`)
      return true
    }
  }

  async function handlePreview() {
    let success = true;
    if ([StakeActionType.ZapDeposit, StakeActionType.ZapIncreaseAmount].includes(actionType!)) {
      success = await findZapProvider();
    }
    if (success) setShowModal(true)
  }

  return <NoSSR>
    {
      (asset && vault && tokenOptions.length > 0) ? (
        <>
          <div className="min-h-screen">
            <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-0 ">
              <div className="w-full mb-8">
                <div
                  className="flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1"
                >
                  <div className="relative">
                    <NetworkSticker chainId={1} size={3} />
                    <TokenIcon
                      token={asset}
                      icon={asset.logoURI}
                      chainId={1}
                      imageSize={"w-12 h-12"}
                    />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-white mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}
                  >
                    VCX STAKING
                  </h2>
                </div>
              </div>

              <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-6 md:pr-10  gap-4 md:gap-10">
                  <div>
                    <LargeCardStat
                      id={"wallet"}
                      label="Your Wallet"
                      value={walletValue < 1 ? "$ 0" : `$ ${formatTwoDecimals(walletValue)}`}
                      secondaryValue={walletValue < 1 ? `0 ${asset.symbol}` : `${formatTwoDecimals(asset.balance / 10 ** asset.decimals)} ${asset.symbol}`}
                      tooltip="Value of deposit assets held in your wallet"
                    />
                  </div>
                  <div>
                    <LargeCardStat
                      id={"deposits"}
                      label="Deposits"
                      value={depositValue < 1 ? "$ 0" : `$ ${formatTwoDecimals(depositValue)}`}
                      secondaryValue={depositValue < 1 ? "$ 0" : `${formatAndRoundNumber(vault?.balance!, vault?.decimals!)} ${asset.symbol}`}
                      tooltip="Value of your vault deposits"
                    />
                  </div>
                  <div>
                    <LargeCardStat
                      id={"tvl"}
                      label="TVL"
                      value={`$ ${tvl < 1 ? "0" : formatTwoDecimals(tvl)
                        }`}
                      secondaryValue={
                        asset
                          ? `${formatTwoDecimals(vault.totalSupply / 1e18)} ${asset?.symbol!}`
                          : "0 TKN"
                      }
                      tooltip={``}
                    />
                  </div>
                  <div>
                    <LargeCardStat
                      id={"vapy"}
                      label="vAPY"
                      value={`40 %`}
                      tooltip="Current variable APY of the vault"
                    />
                  </div>
                  {userLockVaultData && userLockVaultData.unlockTime > 0 &&
                    <>
                      <div>
                        <LargeCardStat
                          id={"unlockDate"}
                          label="Unlock Date"
                          value={new Date(userLockVaultData.unlockTime).toLocaleDateString()}
                          tooltip="Current variable APY of the vault"
                        />
                      </div>
                    </>}
                </div>
              </div>
            </section>

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-0">
              <div className="w-full md:w-1/3">
                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">{userLockVaultData?.isExit ? "Withdraw" : "Deposit"}</p>
                  <div className="bg-customNeutral300 px-6 py-6 rounded-lg">
                    <InputTokenWithError
                      captionText={"Input Amount"}
                      onSelectToken={(option) => handleTokenSelect(option)}
                      onMaxClick={handleMaxClick}
                      chainId={1}
                      value={inputBalance}
                      onChange={handleChangeInput}
                      selectedToken={inputToken}
                      errorMessage={""}
                      tokenList={tokenOptions}
                      allowSelection={!userLockVaultData?.isExit}
                      allowInput
                    />
                    {!userLockVaultData?.isExit &&
                      <div className="flex flex-row items-center w-full space-x-4 mt-4">
                        <LockTimeButton label="60" handleClick={() => setLockTime(60)} isActive={lockTime === 60} />
                        <LockTimeButton label="1M" handleClick={() => setLockTime(2629800)} isActive={lockTime === 2629800} />
                        <LockTimeButton label="3M" handleClick={() => setLockTime(7889400)} isActive={lockTime === 7889400} />
                        <LockTimeButton label="6M" handleClick={() => setLockTime(15778800)} isActive={lockTime === 15778800} />
                        <LockTimeButton label="9M" handleClick={() => setLockTime(23668200)} isActive={lockTime === 23668200} />
                        <LockTimeButton label="12M" handleClick={() => setLockTime(31557600)} isActive={lockTime === 31557600} />
                      </div>
                    }
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-customGray500" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-customNeutral300 px-4">
                          <ArrowDownIcon
                            className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                    <InputTokenWithError
                      captionText={"Output Amount"}
                      onSelectToken={() => { }}
                      onMaxClick={() => { }}
                      chainId={1}
                      value={(Number(inputBalance) * Number(inputToken?.price)) /
                        Number(outputToken?.price) || 0}
                      onChange={() => { }}
                      selectedToken={outputToken}
                      errorMessage={""}
                      tokenList={[]}
                      allowSelection={false}
                      allowInput={false}
                    />
                    {!userLockVaultData?.isExit &&
                      <>
                        <InputTokenWithError
                          captionText={"Reward Shares"}
                          onSelectToken={() => { }}
                          onMaxClick={() => { }}
                          chainId={1}
                          value={((Number(inputBalance) * Number(inputToken?.price))
                            / Number(outputToken?.price) || 0)
                            / (31557600 / lockTime)
                          }
                          onChange={() => { }}
                          selectedToken={vault}
                          errorMessage={""}
                          tokenList={[]}
                          allowSelection={false}
                          allowInput={false}
                        />
                      </>
                    }
                  </div>
                  <div className="mt-4">
                    <MainActionButton
                      label={"Preview"}
                      handleClick={handlePreview}
                      disabled={showModal}
                    />
                  </div>
                  {showModal &&
                    <InteractionContainer
                      inputToken={inputToken!}
                      outputToken={outputToken!}
                      asset={asset}
                      vault={vault}
                      amount={Number(inputBalance)}
                      time={lockTime}
                      zapProvider={zapProvider}
                      action={selectActions(actionType!)[0]}
                      actions={selectActions(actionType!)}
                      setShowModal={setShowModal}
                      refreshUserData={refreshUserData}
                    />
                  }
                </div>
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">
                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Information</p>
                  <p className="text-white">
                    .....
                  </p>
                  <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4">

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Staking address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vault.address} onCopy={() => showSuccessToast("Staking address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Asset address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={asset.address} onCopy={() => showSuccessToast("Asset address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Strategies</p>
                </div>
              </div>
            </section>
          </div>
        </>
      )
        :
        <p className="text-white ml-4 md:ml-0">Loading...</p>
    }
  </NoSSR >
}

interface PassThroughProps {
  inputToken: Token,
  outputToken: Token,
  asset: Token,
  vault: Token,
  amount: number,
  time: number,
  zapProvider: ZapProvider,
  action: Action,
  setShowModal: Function,
}

function InteractionContainer({ inputToken, outputToken, asset, vault, zapProvider, amount, time, action, actions, setShowModal, refreshUserData }: PassThroughProps & {
  actions: Action[], refreshUserData: Function
}): JSX.Element {
  const [inputAmount, setInputAmount] = useState<number>(amount)
  const [valueStorage, setValueStorage] = useState<number>(amount)
  const [currentAction, setCurrentAction] = useState<Action>(action)
  const [step, setStep] = useState<number>(0);

  const [tvl, setTVL] = useAtom(tvlAtom);
  const [networth, setNetworth] = useAtom(networthAtom);

  async function interactionPreHook() {
    if (action === Action.zap) {
      setValueStorage(asset.balance)
    }
  }

  async function interactionPostHook(success: boolean) {
    if (success) {
      if (action === Action.deposit) {
        const val = (amount * vault.price) / 1e18
        setTVL({ ...tvl, stake: tvl.stake + val, total: tvl.total + val })
        setNetworth({ ...networth, stake: networth.stake + val, total: networth.total + val })
        refreshUserData();
      } else if (action === Action.withdraw) {
        const val = (amount * vault.price) / 1e18
        setTVL({ ...tvl, stake: tvl.stake - val, total: tvl.total - val })
        setNetworth({ ...networth, stake: networth.stake - val, total: networth.total - val })
        refreshUserData();
      } else if (action === Action.zap) {
        setInputAmount(asset.balance - valueStorage)
      }
      const nextStep = step + 1
      setCurrentAction(actions[nextStep])
      setStep(nextStep)
    } else {
      setCurrentAction(Action.done)
    }
  }

  return <div className="w-full flex flex-col mt-5">
    <Interaction
      inputToken={inputToken}
      outputToken={outputToken}
      asset={asset}
      vault={vault}
      zapProvider={zapProvider}
      action={currentAction}
      amount={inputAmount}
      time={time}
      interactionHooks={[interactionPreHook, interactionPostHook]}
      setShowModal={setShowModal}
    />
    <div className="mt-6">
      <ActionSteps
        steps={actions.slice(0, -1).map((a, i) => {
          const isError = action === Action.done && step < actions.length
          return {
            step: i + 1,
            label: getLabel(a),
            success: i < step,
            error: isError,
            loading: !isError && i === step,
            updateBalance: false
          }
        })}
        stepCounter={step}
      />
    </div>
  </div>
}

function Interaction({ inputToken, outputToken, asset, vault, zapProvider, amount, time, action, setShowModal, interactionHooks }: PassThroughProps & { interactionHooks: [Function, Function] }): JSX.Element {
  const [preHook, postHook] = interactionHooks
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const [tokens, setTokens] = useAtom(tokensAtom);

  async function handleMainAction() {
    if (!account) return
    if (action === Action.done) setShowModal(false)
    const val = amount * (10 ** inputToken.decimals)

    preHook()

    const clients = { publicClient: publicClient!, walletClient: walletClient! }
    const success = await handleInteraction(
      inputToken,
      outputToken,
      val,
      time,
      action,
      asset,
      vault,
      account,
      zapProvider,
      clients,
      [tokens, setTokens]
    )()
    postHook(success)
  }

  return (
    <>
      <p className="text-white text-start text-2xl font-bold leading-none mb-1">{getLabel(action)}</p>
      <p className="text-white text-start mb-2">{getDescription(inputToken, outputToken, amount, action)}</p>
      <MainActionButton label={getLabel(action)} handleClick={handleMainAction} />
    </>
  )
}

function getDescription(inputToken: Token, outputToken: Token, amount: number, action: Action) {
  switch (action) {
    case Action.depositApprove:
      return `Approving ${amount} ${inputToken.symbol} for Vault deposit.`
    case Action.zapApprove:
      return `Approving ${amount} ${inputToken.symbol} for zapping.`
    case Action.deposit:
    case Action.increaseAmount:
      return `Depositing ${amount} ${inputToken.symbol} into the Vault.`
    case Action.withdraw:
      return `Withdrawing ${amount} ${inputToken.symbol}.`
    case Action.zap:
      return `Selling ${amount} ${inputToken.symbol} for ${outputToken.symbol}.`
    case Action.done:
      return ""
  }
}

function getLabel(action: Action) {
  switch (action) {
    case Action.depositApprove:
    case Action.zapApprove:
      return "Approve"
    case Action.deposit:
    case Action.increaseAmount:
      return "Deposit"
    case Action.withdraw:
      return "Withdraw"
    case Action.zap:
      return "Zap"
    case Action.done:
      return "Done"
  }
}


function selectActions(action: StakeActionType) {
  switch (action) {
    case StakeActionType.Deposit:
      return [
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case StakeActionType.ZapDeposit:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositApprove,
        Action.deposit,
        Action.done
      ]
    case StakeActionType.IncreaseAmount:
      return [
        Action.depositApprove,
        Action.increaseAmount,
        Action.done
      ]
    case StakeActionType.ZapIncreaseAmount:
      return [
        Action.zapApprove,
        Action.zap,
        Action.depositApprove,
        Action.increaseAmount,
        Action.done
      ]
    case StakeActionType.Withdraw:
      return [
        Action.withdraw,
        Action.done
      ]
  }
}

function handleInteraction(
  inputToken: Token,
  outputToken: Token,
  amount: number,
  time: number,
  action: Action,
  asset: Token,
  vault: Token,
  account: Address,
  zapProvider: ZapProvider,
  clients: Clients,
  tokensAtom: [{ [key: number]: TokenByAddress }, Function]
) {
  switch (action) {
    case Action.depositApprove:
      return () =>
        handleAllowance({
          token: inputToken.address,
          amount,
          account,
          spender: vault.address,
          clients,
        });
    case Action.zapApprove:
      return () => handleZapAllowance({
        token: inputToken.address,
        amount,
        account,
        zapProvider,
        clients
      })
    case Action.deposit:
      return () =>
        deposit({
          amount,
          time,
          account,
          address: vault.address,
          chainId: 1,
          tokensToUpdate: [VCX, ST_VCX],
          tokensAtom,
          clients
        });
    case Action.increaseAmount:
      return () => increaseDeposit({
        amount,
        account,
        address: vault.address,
        chainId: 1,
        tokensToUpdate: [VCX, ST_VCX],
        tokensAtom,
        clients
      })
    case Action.withdraw:
      return () =>
        withdraw({
          account,
          address: vault.address,
          chainId: 1,
          tokensToUpdate: [VCX, ST_VCX],
          tokensAtom,
          clients
        })
    case Action.zap:
      return () => zap({
        chainId: 1,
        sellToken: inputToken,
        buyToken: outputToken,
        amount,
        account,
        zapProvider,
        slippage: 100,
        tradeTimeout: 300,
        clients,
        tokensAtom
      })
    case Action.done:
      return () => { }
  }
}

enum Action {
  depositApprove,
  zapApprove,
  deposit,
  increaseAmount,
  withdraw,
  zap,
  done
}

enum StakeActionType {
  Deposit,
  ZapDeposit,
  IncreaseAmount,
  ZapIncreaseAmount,
  Withdraw
}
import { Balance, RequestBalance, VaultActionType, Token, VaultAction, VaultData, ZapProvider } from "@/lib/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { VaultInputsProps } from "@/components/vault/VaultInputs";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { tokensAtom } from "@/lib/atoms";
import { OracleVaultAbi, RS_ETH_ASSETS } from "@/lib/constants";
import { http, createPublicClient, zeroAddress, Address, parseUnits, maxUint256, erc20Abi } from "viem";
import SpinningLogo from "@/components/common/SpinningLogo";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { calcBalance, EMPTY_BALANCE, formatBalance, formatBalanceUSD, handleCallResult, NumberFormatter, simulateCall } from "@/lib/utils/helpers";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import getVaultErrorMessage from "@/lib/vault/errorMessage";
import TokenIcon from "@/components/common/TokenIcon";
import SecondaryButtonGroup from "@/components/common/SecondaryButtonGroup";
import SelectToken from "@/components/input/SelectToken";
import VaultFeeBreakdown from "../VaultFees";
import findZapProvider from "@/lib/zap/findZapProvider";
import { selectActions } from "@/lib/vault/vaultHelpers";
import VaultInteractionContainer from "../VaultInteraction";
import { vaultCancelRedeem, vaultRedeem } from "@/lib/vault/interactions";

async function fetchData(user: Address, vaultData: VaultData) {
  const client = createPublicClient({
    chain: ChainById[vaultData.chainId],
    transport: http(RPC_URLS[vaultData.chainId])
  })

  const vault = await client.multicall({
    contracts: [
      {
        address: vaultData.vault,
        abi: OracleVaultAbi,
        functionName: "totalAssets"
      },
      {
        address: vaultData.vault,
        abi: OracleVaultAbi,
        functionName: "totalSupply"
      },
      {
        address: vaultData.vault,
        abi: OracleVaultAbi,
        functionName: "balanceOf",
        args: [user]
      },
      {
        address: vaultData.address,
        abi: OracleVaultAbi,
        functionName: "getRequestBalance",
        args: [user]
      }
    ]
  })

  return {
    totalAssets: vault[0].result as bigint,
    totalSupply: vault[1].result as bigint,
    assetsPerShare: Number(vault[1].result) / Number(vault[0].result),
    balance: vault[2].result as bigint,
    requestBalance: vault[3].result as RequestBalance
  }
}


export default function SafeVaultInteraction({
  vaultData,
  tokenOptions,
  chainId,
  hideModal,
}: VaultInputsProps) {
  const { address: account } = useAccount();
  const [tokens] = useAtom(tokensAtom)
  const [requestBalance, setRequestBalance] = useState<RequestBalance>();

  useEffect(() => {
    if (account) setUp()
  }, [account])

  async function setUp() {
    const data = await fetchData(account ? account : zeroAddress, vaultData)
    setRequestBalance(data.requestBalance)
  }

  return Object.keys(tokens).length > 0 ? (
    <>
      <div className="bg-customNeutral200 p-6 rounded-lg">
        <div className="bg-customNeutral300 px-6 py-6 rounded-lg">
          <SafeVaultInputs
            vaultData={vaultData}
            tokenOptions={tokenOptions}
            chainId={chainId}
            hideModal={() => { }}
            setUp={setUp}
          />
        </div>
      </div>
      <div className="">
        {!!requestBalance &&
          <ClaimableWithdrawal
            vaultData={vaultData}
            vault={tokens[chainId][vaultData.vault]}
            asset={tokens[chainId][vaultData.asset]}
            tokenOptions={tokenOptions}
            requestBalance={requestBalance}
            setUp={setUp}
          />
        }
      </div>
    </>
  ) : <SpinningLogo />
}

function SafeVaultInputs({
  vaultData,
  tokenOptions,
  chainId,
  hideModal,
  setUp,
}: VaultInputsProps & { setUp: Function }) {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId })

  const [tokens] = useAtom(tokensAtom)
  const asset = tokens[chainId][vaultData.asset]
  const vault = tokens[chainId][vaultData.vault]
  const gauge = vaultData.gauge && vaultData.gauge !== zeroAddress ? tokens[chainId][vaultData.gauge] : undefined

  const [inputToken, setInputToken] = useState<Token>(asset);
  const [outputToken, setOutputToken] = useState<Token>(gauge || vault);

  const [inputBalance, setInputBalance] = useState<Balance>(EMPTY_BALANCE);

  const [steps, setSteps] = useState<VaultAction[]>(gauge ? selectActions(VaultActionType.DepositAndStake) : selectActions(VaultActionType.Deposit));
  const [action, setAction] = useState<VaultActionType>(gauge ? VaultActionType.DepositAndStake : VaultActionType.Deposit);
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false)
  const [zapProvider, setZapProvider] = useState<ZapProvider>(ZapProvider.none)

  function switchTokens() {
    if (isDeposit) {
      setInputToken(gauge || vault)
      setOutputToken(asset)
      setAction(gauge ? VaultActionType.UnstakeAndRequestWithdrawal : VaultActionType.RequestWithdrawal)
      setSteps(selectActions(gauge ? VaultActionType.UnstakeAndRequestWithdrawal : VaultActionType.RequestWithdrawal))
    } else {
      setInputToken(asset)
      setOutputToken(gauge || vault)
      setAction(gauge ? VaultActionType.DepositAndStake : VaultActionType.Deposit)
      setSteps(selectActions(gauge ? VaultActionType.DepositAndStake : VaultActionType.Deposit))
    }
    setIsDeposit(!isDeposit)
    setShowModal(false)
  }

  function handleTokenSelect(option: Token, vault: Token) {
    setShowModal(false)
    setInputToken(option)

    if (isDeposit) {
      setOutputToken(gauge || vault)

      if (option.address !== asset.address) {
        if (vaultData.address === "0x11eAA7a46afE1023f47040691071e174125366C8" && RS_ETH_ASSETS.includes(option.address)) {
          setAction(VaultActionType.ZapRsETHDeposit)
          setSteps(selectActions(VaultActionType.ZapRsETHDeposit))
        } else {
          setAction(gauge ? VaultActionType.ZapDepositAndStake : VaultActionType.ZapDeposit)
          setSteps(selectActions(gauge ? VaultActionType.ZapDepositAndStake : VaultActionType.ZapDeposit))
        }
      } else {
        // reset after selecting another token 
        setAction(gauge ? VaultActionType.DepositAndStake : VaultActionType.Deposit)
        setSteps(selectActions(gauge ? VaultActionType.DepositAndStake : VaultActionType.Deposit))
      }
    }

    // the withdraw case is managed in the handle preview since the action there depends on float assets
  }

  function handleChangeInput(e: any) {
    if (!inputToken || !outputToken) return
    let value = e.currentTarget.value;

    const [integers, decimals] = String(value).split('.');
    let inputAmt = value;

    // if precision is more than token decimal, cut it
    if (decimals?.length > inputToken.decimals) {
      inputAmt = `${integers}.${decimals.slice(0, inputToken.decimals)}`;
    }

    // covert string amt to bigint
    const newAmt = parseUnits(inputAmt, inputToken.decimals)

    setInputBalance({ value: newAmt, formatted: inputAmt, formattedUSD: String(Number(inputAmt) * (inputToken.price || 0)) });
    setErrorMessage(getVaultErrorMessage(value, vaultData, inputToken, outputToken, isDeposit, action, tokens))
    setShowModal(false)
  }

  function handleMaxClick() {
    if (!inputToken) return;
    handleChangeInput({ currentTarget: { value: inputToken.balance.formatted } });
  }

  async function handlePreview() {
    if (!inputToken || !outputToken || !asset || !account || !publicClient) return;

    if (!isDeposit) {
      const res = await publicClient.multicall({
        contracts: [
          {
            address: vaultData.address,
            abi: OracleVaultAbi,
            functionName: "convertToAssets",
            args: [inputBalance.value]
          },
          {
            address: vaultData.asset,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [vaultData.safes![0]]
          }
        ]
      })

      const expectedAssets = res[0].result as bigint;
      const float = res[1].result as bigint;

      const vaultWithdraw = inputToken.address === vaultData.address;

      if (float >= expectedAssets) {
        if (vaultWithdraw) {
          // instant withdrawing vault input 
          setAction(VaultActionType.RequestFulfillAndWithdraw)
          setSteps(selectActions(VaultActionType.RequestFulfillAndWithdraw));
        } else {
          // instant withdrawing gauge input
          setAction(VaultActionType.UnstakeAndRequestFulfillWithdraw);
          setSteps(selectActions(VaultActionType.UnstakeAndRequestFulfillWithdraw))
        }
      } else {
        if (vaultWithdraw) {
          // request withdraw vault input 
          setAction(VaultActionType.RequestWithdrawal)
          setSteps(selectActions(VaultActionType.RequestWithdrawal));
        } else {
          // request withdraw gauge input
          setAction(VaultActionType.UnstakeAndRequestWithdrawal);
          setSteps(selectActions(VaultActionType.UnstakeAndRequestWithdrawal))
        }
      }

      setShowModal(true);
    } else {
      const success = await findZapProvider({
        action,
        inputToken,
        outputToken,
        asset,
        inputBalance,
        zapProvider,
        account,
        vaultData,
        setter: setZapProvider
      });
      if (success) setShowModal(true)
    }
  }

  return (
    <>
      <TabSelector
        className="mb-6"
        availableTabs={["Deposit", "Request Withdraw"]}
        activeTab={isDeposit ? "Deposit" : "Request Withdraw"}
        setActiveTab={switchTokens}
      />
      <InputTokenWithError
        captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
        onSelectToken={(option) =>
          handleTokenSelect(option, gauge ? gauge : vault!)
        }
        onMaxClick={handleMaxClick}
        chainId={chainId}
        value={inputBalance.formatted}
        onChange={handleChangeInput}
        selectedToken={inputToken}
        errorMessage={errorMessage}
        tokenList={isDeposit ? tokenOptions.filter(token => {
          return token.address !== vault!.address && token.address !== gauge?.address
        }) : gauge ? [gauge, vault] : [vault]}
        allowSelection={isDeposit ? true : gauge ? true : false}
        disabled={!isDeposit && !outputToken}
        allowInput
      />
      {
        isDeposit ?
          <>
            {vaultData.depositLimit < maxUint256 &&
              <span
                className="flex flex-row items-center justify-between text-customGray100 hover:text-customGray200 cursor-pointer mt-2"
                onClick={() => handleChangeInput({ currentTarget: { value: formatBalance(vaultData.depositLimit, asset?.decimals || 0) } })}
              >
                <p>Deposit Limit:</p>
                <p>{formatBalance(vaultData.depositLimit, asset?.decimals || 0)} {asset?.symbol}</p>
              </span>
            }
          </>
          :
          <>
            {vaultData.withdrawalLimit < vaultData.totalSupply &&
              <span
                className="flex flex-row items-center justify-between text-customGray100 hover:text-customGray200 cursor-pointer mt-2"
                onClick={() => handleChangeInput({ currentTarget: { value: formatBalance(vaultData.withdrawalLimit, vault?.decimals || 0) } })}
              >
                <p>Withdraw Limit:</p>
                <p>{vault ? formatBalance(vaultData.withdrawalLimit, vault?.decimals || 0) : "0"} {vault?.symbol}</p>
              </span>
            }
          </>
      }

      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-customGray500" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-customNeutral300 px-4">
            <ArrowDownIcon
              className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
              aria-hidden="true"
              onClick={switchTokens}
            />
          </span>
        </div>
      </div>

      <InputTokenWithError
        captionText={"Output Amount"}
        onSelectToken={(option) =>
          handleTokenSelect(gauge ? gauge : vault!, option)
        }
        onMaxClick={() => { }}
        chainId={chainId}
        value={
          (Number(inputBalance.formattedUSD) /
            (outputToken?.price || 0)) || "0"
        }
        onChange={() => { }}
        selectedToken={outputToken}
        errorMessage={""}
        tokenList={[]}
        allowSelection={false}
        allowInput={false}
        disabled={isDeposit && !inputToken}
      />

      <VaultFeeBreakdown vaultData={vaultData} />

      <div className="py-6 space-y-4">
        <MainButtonGroup
          label={"Preview"}
          mainAction={handlePreview}
          chainId={vaultData.chainId}
          disabled={!account || !inputToken || inputBalance.formatted === "0" || showModal}
        />
      </div>

      {inputToken && outputToken && showModal &&
        <VaultInteractionContainer
          _inputToken={inputToken}
          _outputToken={outputToken}
          zapProvider={zapProvider}
          _inputBalance={inputBalance}
          _action={steps[0]}
          actionSeries={action}
          actions={steps}
          vaultData={vaultData}
          setShowModal={setShowModal}
          callback={setUp}
        />
      }
    </>
  )
}

interface ClaimableWithdrawalProps {
  vaultData: VaultData;
  vault: Token;
  asset: Token;
  tokenOptions: Token[];
  requestBalance: RequestBalance;
  setUp: Function;
}

function ClaimableWithdrawal({ vaultData, vault, asset, tokenOptions, requestBalance, setUp }: ClaimableWithdrawalProps): JSX.Element {
  return (
    <>
      {requestBalance.claimableAssets > BigInt(0) &&
        <ClaimableAssets
          vaultData={vaultData}
          requestBalance={requestBalance}
          vault={vault}
          asset={asset}
          tokenOptions={tokenOptions}
          setUp={setUp}
        />
      }
      {requestBalance.pendingShares > BigInt(0) &&
        <RequestedShares
          vaultData={vaultData}
          requestBalance={requestBalance}
          asset={asset}
          vault={vault}
          tokenOptions={tokenOptions}
          setUp={setUp}
        />
      }
    </>
  )
}

function ClaimableAssets({ vaultData, vault, asset, tokenOptions, requestBalance, setUp }: ClaimableWithdrawalProps): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId: vaultData.chainId });

  const [outputToken, setOutputToken] = useState<Token>(vault);

  const [steps, setSteps] = useState<VaultAction[]>(selectActions(VaultActionType.Withdrawal));
  const [action, setAction] = useState<VaultActionType>(VaultActionType.Withdrawal);
  const [showModal, setShowModal] = useState<boolean>(false)
  const [zapProvider, setZapProvider] = useState<ZapProvider>(ZapProvider.none)

  function handleTokenSelect(vault: Token, option: Token) {
    setOutputToken(option)

    if (option.address !== asset.address) {
      setAction(VaultActionType.ZapWithdrawal)
      setSteps(selectActions(VaultActionType.ZapWithdrawal))
    }
  }

  async function handlePreview() {
    if (!asset || !outputToken || !asset || !account || !publicClient) return;

    const success = await findZapProvider({
      action,
      inputToken: asset,
      outputToken,
      asset,
      inputBalance: calcBalance(requestBalance.claimableAssets, asset.decimals, asset.price),
      zapProvider,
      account,
      vaultData,
      setter: setZapProvider
    });
    if (success) setShowModal(true)
  }

  return (
    <div className="bg-customNeutral200 p-6 rounded-lg mt-4">
      <p className="text-white font-bold text-xl mb-4">Claimable Withdrawals</p>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Assets:</p>
        <span className="flex flex-row items-center">
          <p className="">
            {formatBalance(requestBalance.claimableAssets, asset.decimals)}
          </p>
          <TokenIcon
            token={asset}
            icon={asset?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={asset.chainId!}
          />
          {asset.symbol}
        </span>
      </span>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Withdrawal Amount:</p>
        <span className="flex flex-row items-center">
          <p className="mr-2">
            {asset ? `~ ${NumberFormatter.format(Number(formatBalanceUSD(requestBalance.claimableAssets, asset.decimals, asset.price)) / outputToken.price)}` : ""}
          </p>
          <SelectToken
            chainId={asset.chainId!}
            allowSelection={false}
            selectedToken={outputToken}
            options={tokenOptions}
            selectToken={(option) => handleTokenSelect(vault, option)}
          />
        </span>
      </span>

      <div className="mt-2">
        <SecondaryButtonGroup
          label="Preview"
          mainAction={handlePreview}
          chainId={asset.chainId!}
          disabled={requestBalance.claimableAssets === BigInt(0) || !asset}
        />
      </div>

      {vault && outputToken && showModal &&
        <VaultInteractionContainer
          _inputToken={vault}
          _outputToken={outputToken}
          zapProvider={zapProvider}
          _inputBalance={calcBalance(requestBalance.claimableShares, vault.decimals, vault.price)}
          _action={steps[0]}
          actionSeries={action}
          actions={steps}
          vaultData={vaultData}
          setShowModal={setShowModal}
          callback={setUp}
        />
      }
    </div>
  )
}


function RequestedShares({ vaultData, vault, asset, tokenOptions, requestBalance, setUp }: ClaimableWithdrawalProps): JSX.Element {
  const [tokens, setTokens] = useAtom(tokensAtom)
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: asset.chainId });
  const { data: walletClient } = useWalletClient();

  async function handleCancelRedeem() {
    if (!account || !publicClient || !walletClient) return;

    const success = await vaultCancelRedeem({
      chainId: vaultData.chainId,
      vaultData: vaultData,
      asset,
      vault,
      account,
      amount: requestBalance.pendingShares,
      clients: { publicClient, walletClient },
      tokensAtom: [tokens, setTokens],
    })

    if (success) setUp()
  }

  return (
    <div className="bg-customNeutral200 p-6 rounded-lg mt-4">
      <p className="text-white font-bold text-xl mb-4">Requested Withdrawals</p>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Shares:</p>
        <span className="flex flex-row items-center">
          {formatBalance(requestBalance.pendingShares, vault.decimals)}
          <TokenIcon
            token={vault}
            icon={vault?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={vault.chainId!}
          />
          {vault.symbol}
        </span>
      </span>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Assets:</p>
        <span className="flex flex-row items-center">
          ~ {Number(formatBalanceUSD(requestBalance.pendingShares, vault.decimals, vault.price)) / asset.price}
          <TokenIcon
            token={asset}
            icon={asset?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={asset.chainId!}
          />
          {asset.symbol}
        </span>
      </span>
      <div className="mt-2">
        <SecondaryButtonGroup
          label="Cancel Withdrawal"
          mainAction={handleCancelRedeem}
          chainId={asset.chainId!}
          disabled={requestBalance.pendingShares === BigInt(0)}
        />
      </div>
    </div>
  )
}

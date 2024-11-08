import { vaultsAtom } from "@/lib/atoms/vaults";
import { Balance, SmartVaultActionType, Token, TokenType, VaultData, VaultLabel, ZapProvider } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import VaultInputs, { VaultInputsProps } from "@/components/vault/VaultInputs";
import { showLoadingToast, showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { ArrowDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { tokensAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import { OracleVaultAbi, VeTokenByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import StrategyDescription from "@/components/vault/StrategyDescription";
import ApyChart from "@/components/vault/ApyChart";
import VaultHero from "@/components/vault/VaultHero";
import { http, createPublicClient, isAddress, zeroAddress, Address, parseUnits, maxUint256, formatUnits, erc20Abi } from "viem";
import UserBoostSection from "@/components/vault/UserBoostSection";
import HtmlRenderer from "@/components/common/HtmlRenderer";
import SpinningLogo from "@/components/common/SpinningLogo";
import { EMPTY_LLAMA_APY_ENTRY } from "@/lib/resolver/apy";
import { arbitrum } from "viem/chains";
import { RPC_URLS } from "@/lib/utils/connectors";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { calcBalance, EMPTY_BALANCE, formatBalance, handleCallResult, handleMaxClick, NumberFormatter, simulateCall } from "@/lib/utils/helpers";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import getVaultErrorMessage from "@/lib/vault/errorMessage";
import TokenIcon from "@/components/common/TokenIcon";
import SecondaryButtonGroup from "@/components/common/SecondaryButtonGroup";
import SelectToken from "@/components/input/SelectToken";
import { setupDevBundler } from "next/dist/server/lib/router-utils/setup-dev-bundler";
import { handleAllowance } from "@/lib/approve";


const VAULT: Token = {
  address: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  name: "Vault",
  symbol: "oVault",
  decimals: 6,
  logoURI: "",
  balance: { value: BigInt(0), formatted: "0", formattedUSD: "0" },
  price: 1,
  totalSupply: BigInt(0),
  chainId: 42161,
  type: TokenType.Vault,
}

const SAFE_VAULT: VaultData = {
  address: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  vault: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  gauge: zeroAddress,
  chainId: 42161,
  fees: {
    deposit: BigInt(0),
    withdrawal: BigInt(0),
    management: BigInt(0),
    performance: BigInt(0)
  },
  totalAssets: BigInt(0),
  totalSupply: BigInt(0),
  assetsPerShare: 0,
  depositLimit: maxUint256,
  withdrawalLimit: maxUint256,
  minLimit: BigInt(0),
  tvl: 0,
  apyData: {
    targetApy: 0,
    baseApy: 0,
    rewardApy: 0,
    totalApy: 0,
    apyHist: [],
    apyId: "",
    apySource: undefined
  },
  gaugeData: undefined,
  metadata: {
    vaultName: "Test Safe Vault",
    labels: [VaultLabel.experimental],
    description: "",
    type: "multi-strategy-vault-v2",
    creator: "0x2C3B135cd7dc6C673b358BEF214843DAb3464278",
    feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E"
  },
  strategies: [
    {
      address: "0x3C99dEa58119DE3962253aea656e61E5fBE21613",
      asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      yieldToken: undefined,
      metadata: {
        name: "Safe",
        protocol: "Safe",
        description: "Experimental Gnosis Safe Vault",
        type: "Vanilla"
      },
      resolver: "",
      allocation: BigInt(0),
      allocationPerc: 0,
      apyData: {
        targetApy: 0,
        baseApy: 0,
        rewardApy: 0,
        totalApy: 0,
        apyHist: [EMPTY_LLAMA_APY_ENTRY],
        apyId: "",
        apySource: "custom"
      },
      totalAssets: BigInt(0),
      totalSupply: BigInt(0),
      assetsPerShare: 0,
      idle: BigInt(0),
    }
  ],
  idle: BigInt(0),
  liquid: BigInt(0),
  points: []
}

async function fetchData(user: Address) {
  const client = createPublicClient({
    chain: arbitrum,
    transport: http(RPC_URLS[42161])
  })

  const vault = await client.multicall({
    contracts: [
      {
        address: SAFE_VAULT.address,
        abi: OracleVaultAbi,
        functionName: "totalAssets"
      },
      {
        address: SAFE_VAULT.address,
        abi: OracleVaultAbi,
        functionName: "totalSupply"
      },
      {
        address: SAFE_VAULT.address,
        abi: OracleVaultAbi,
        functionName: "balanceOf",
        args: [user]
      },
      {
        address: VAULT.address,
        abi: OracleVaultAbi,
        functionName: "getRequestBalance",
        args: [user]
      },
      {
        address: SAFE_VAULT.asset,
        abi: erc20Abi,
        functionName: "allowance",
        args: [user, VAULT.address]
      },
      {
        address: SAFE_VAULT.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [user, VAULT.address]
      }
    ]
  })

  return {
    totalAssets: vault[0].result as bigint,
    totalSupply: vault[1].result as bigint,
    assetsPerShare: Number(vault[1].result) / Number(vault[0].result),
    balance: vault[2].result as bigint,
    requestBalance: vault[3].result as RequestBalance,
    assetAllowance: vault[4].result as bigint,
    vaultAllowance: vault[5].result as bigint
  }
}


interface RequestBalance {
  pendingShares: bigint;
  requestTime: bigint;
  claimableShares: bigint;
  claimableAssets: bigint;
}

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const { address: account } = useAccount()
  const chainId = 42161

  const [tokens] = useAtom(tokensAtom)
  const [vaultData, setVaultData] = useState<VaultData>();

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [requestBalance, setRequestBalance] = useState<RequestBalance>();
  const [assetAllowance, setAssetAllowance] = useState<bigint>(BigInt(0));
  const [vaultAllowance, setVaultAllowance] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (Object.keys(tokens).length > 0) setUp()
  }, [account]);

  async function setUp() {
    const data = await fetchData(account ? account : zeroAddress)

    setAsset(tokens[chainId][SAFE_VAULT.asset])
    setVault({ ...VAULT, balance: calcBalance(data.balance, VAULT.decimals, VAULT.price) })
    setVaultData({
      ...SAFE_VAULT,
      totalAssets: data.totalAssets,
      totalSupply: data.totalSupply,
      assetsPerShare: data.assetsPerShare,
      tvl: Number(formatBalance(data.totalAssets, VAULT.decimals)),
      strategies: [{
        ...SAFE_VAULT.strategies[0],
        allocation: data.totalAssets,
        allocationPerc: 1
      }]
    })
    setTokenOptions([
      tokens[chainId][SAFE_VAULT.asset],
      { ...VAULT, balance: calcBalance(data.balance, VAULT.decimals, VAULT.price) },
      ...ZapAssetAddressesByChain[chainId].filter(addr => SAFE_VAULT.asset !== addr).map(addr => tokens[chainId][addr])
    ])
    setRequestBalance(data.requestBalance)
    setAssetAllowance(data.assetAllowance)
    setVaultAllowance(data.vaultAllowance)
  }

  console.log(vaultData, asset, vault, tokenOptions, requestBalance)

  return <NoSSR>
    {
      (vaultData && asset && vault && tokenOptions.length > 0) ? (
        <>
          <div className="min-h-screen">
            <button
              className="border border-customGray500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-0 mt-10"
              type="button"
              onClick={() => router.push((!!query?.ref && isAddress(query.ref as string)) ? `/vaults?ref=${query.ref}` : "/vaults")}
            >
              <div className="w-5 h-5">
                <LeftArrowIcon color="#FFF" />
              </div>
              <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
            </button>

            <VaultHero
              vaultData={vaultData}
              asset={asset}
              vault={vault}
              gauge={gauge}
              showClaim
            />

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-0">
              <div className="w-full md:w-1/3">
                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <div className="bg-customNeutral300 px-6 py-6 rounded-lg">
                    <SafeVaultInputs
                      vaultData={vaultData}
                      tokenOptions={tokenOptions}
                      chainId={chainId}
                      hideModal={() => { }}
                      setUp={setUp}
                      assetAllowance={assetAllowance}
                      vaultAllowance={vaultAllowance}
                    />
                  </div>
                </div>
                <div className="">
                  {!!requestBalance &&
                    <ClaimableWithdrawal
                      vault={vault}
                      asset={asset}
                      tokenOptions={tokenOptions}
                      requestBalance={requestBalance}
                      setUp={setUp}
                    />
                  }
                </div>
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">
                {gauge && gauge?.balance.value > BigInt(0) && Object.keys(tokens).length > 0 && (vaultData.gaugeData?.lowerAPR || 0) > 0 &&
                  <UserBoostSection vaultData={vaultData} gauge={gauge} veToken={tokens[vaultData.chainId][VeTokenByChain[vaultData.chainId]]} />
                }

                {vaultData.apyData.apyHist.length > 0 && <ApyChart vault={vaultData} />}

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Information</p>
                  <div className="text-white">
                    {vaultData.metadata.description && vaultData.metadata.description.length > 0 && <HtmlRenderer htmlContent={vaultData.metadata.description} />}
                  </div>
                  <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4">

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Vault address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Asset address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {vaultData.asset.slice(0, 6)}...{vaultData.asset.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.asset} onCopy={() => showSuccessToast("Asset address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    {vaultData.gauge && vaultData.gauge !== zeroAddress &&
                      <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                        <p className="text-white font-normal">Gauge address:</p>
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-bold text-white">
                            {vaultData.gauge.slice(0, 6)}...{vaultData.gauge.slice(-4)}
                          </p>
                          <div className='w-6 h-6 group/gaugeAddress'>
                            <CopyToClipboard text={vaultData.gauge} onCopy={() => showSuccessToast("Gauge address copied!")}>
                              <Square2StackIcon className="text-white group-hover/gaugeAddress:text-primaryYellow" />
                            </CopyToClipboard>
                          </div>
                        </div>
                      </div>
                    }

                  </div>
                </div>

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Strategies</p>
                  {vaultData.strategies.map((strategy, i) =>
                    <StrategyDescription
                      key={`${strategy.resolver}-${i}`}
                      strategy={strategy}
                      asset={asset}
                      chainId={vaultData.chainId}
                      i={i}
                      stratLen={vaultData.strategies.length}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      )
        : <SpinningLogo />
    }
  </NoSSR >
}



function SafeVaultInputs({
  vaultData,
  tokenOptions,
  chainId,
  hideModal,
  setUp,
  assetAllowance,
  vaultAllowance
}: VaultInputsProps & { setUp: Function, assetAllowance: bigint, vaultAllowance: bigint }) {
  const asset = tokenOptions.find(t => t.address === vaultData.asset)
  const vault = tokenOptions.find(t => t.address === vaultData.vault)
  const gauge = tokenOptions.find(t => t.address === vaultData.gauge)

  const { address: account, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId });

  const [tokens] = useAtom(tokensAtom)

  const [inputToken, setInputToken] = useState<Token>();
  const [outputToken, setOutputToken] = useState<Token>();

  const [inputBalance, setInputBalance] = useState<Balance>(EMPTY_BALANCE);
  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    setErrorMessage(getVaultErrorMessage(value, vaultData, inputToken, outputToken, isDeposit, 1, tokens))
  }

  function handleMaxClick() {
    if (!inputToken) return;
    handleChangeInput({ currentTarget: { value: inputToken.balance.formatted } });
  }

  function switchTokens() {
    if (isDeposit) {
      setInputToken(vault)
      setOutputToken(asset)
    } else {
      setInputToken(asset)
      setOutputToken(vault)
    }
    setIsDeposit(!isDeposit)

  }

  function handleTokenSelect(option: Token, vault: Token) {
    setInputToken(option)
    setOutputToken(vault)
  }

  async function handleDeposit() {
    if (!account || !walletClient) return;

    showLoadingToast("Depositing...");

    const success = await handleCallResult({
      successMessage: "Deposited!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: VAULT.address,
          abi: OracleVaultAbi,
        },
        functionName: "deposit",
        publicClient: publicClient!,
        args: [inputBalance.value, account]
      }),
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!
      },
    });

    if (success) {
      setUp()
      setInputBalance({ value: BigInt(0), formatted: "0", formattedUSD: "0" });
    }
  }

  async function handleRequestRedeem() {
    if (!account || !walletClient) return;

    showLoadingToast("Requesting redeem...");

    const success = await handleCallResult({
      successMessage: "Redeem requested!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: VAULT.address,
          abi: OracleVaultAbi,
        },
        functionName: "requestRedeem",
        publicClient: publicClient!,
        args: [inputBalance.value, account, account]
      }),
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!
      },
    });

    if (success) {
      setUp()
      setInputBalance({ value: BigInt(0), formatted: "0", formattedUSD: "0" });
    }
  }

  async function handleApprove() {
    const success = await handleAllowance({
      token: inputToken!.address,
      amount: Number(inputBalance.value),
      account: account!,
      spender: VAULT.address,
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!
      },
    })

    if (success) {
      setUp()
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
        tokenList={[]}
        allowSelection={false}
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
                <p>{vault ? formatBalance(vaultData.withdrawalLimit, vault.decimals) : "0"} {vault?.symbol}</p>
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
      <div className="mt-4">
        <p className="text-white font-bold mb-2 text-start">Fee Breakdown</p>
        <div className="bg-customNeutral200 py-2 px-4 rounded-lg space-y-2">
          <span className="flex flex-row items-center justify-between text-white">
            <p>Deposit Fee</p>
            <p>{formatUnits(vaultData.fees.deposit, 16)} %</p>
          </span>
          <span className="flex flex-row items-center justify-between text-white">
            <p>Withdrawal Fee</p>
            <p>{formatUnits(vaultData.fees.withdrawal, 16)} %</p>
          </span>
          <span className="flex flex-row items-center justify-between text-white">
            <p>Management Fee</p>
            <p>{formatUnits(vaultData.fees.management, 16)} %</p>
          </span>
          <span className="flex flex-row items-center justify-between text-white">
            <p>Performance Fee</p>
            <p>{formatUnits(vaultData.fees.performance, 16)} %</p>
          </span>
        </div>
      </div>

      <div className="py-6 space-y-4">
        <MainButtonGroup
          label={isDeposit ? "Deposit" : "Request Withdraw"}
          mainAction={isDeposit ? handleDeposit : handleRequestRedeem}
          chainId={vaultData.chainId}
          disabled={!account || !inputToken || inputBalance.formatted === "0" || // Not connected / selected properly
            (isDeposit && assetAllowance < inputBalance.value) || // Not enough allowance
            (!isDeposit && vaultAllowance < inputBalance.value) // Not enough allowance
          }
        />
        <SecondaryButtonGroup
          label="Approve"
          mainAction={handleApprove}
          chainId={vaultData.chainId}
          disabled={false}
        />
      </div>
    </>
  )
}

interface ClaimableWithdrawalProps {
  vault: Token;
  asset: Token;
  tokenOptions: Token[];
  requestBalance: RequestBalance;
  setUp: Function;
}

function ClaimableWithdrawal({ vault, asset, tokenOptions, requestBalance, setUp }: ClaimableWithdrawalProps): JSX.Element {
  return <>
    <ClaimableAssets claimableAssets={requestBalance.claimableAssets} vault={vault} asset={asset} tokenOptions={tokenOptions} setUp={setUp} />
    <RequestedShares requestShares={requestBalance.pendingShares} asset={asset} vault={vault} setUp={setUp} />
  </>
}

function ClaimableAssets({ claimableAssets, vault, asset, tokenOptions, setUp }: { claimableAssets: bigint, vault: Token, asset: Token, tokenOptions: Token[], setUp: Function }): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: asset.chainId });
  const { data: walletClient } = useWalletClient();

  async function handleWithdraw() {
    if (!account || !walletClient) return;

    showLoadingToast("Withdrawing...");

    const success = await handleCallResult({
      successMessage: "Withdrawn!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: VAULT.address,
          abi: OracleVaultAbi,
        },
        functionName: "withdraw",
        publicClient: publicClient!,
        args: [claimableAssets, account, account]
      }),
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!
      },
    });

    if (success) {
      setUp()
    }
  }

  return (
    <div className="bg-customNeutral200 p-6 rounded-lg mt-4">
      <p className="text-white font-bold text-xl mb-4">Claimable Withdrawals</p>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Assets:</p>
        <span className="flex flex-row items-center">
          <p className="">
            {formatBalance(claimableAssets, asset.decimals)}
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
            {asset ? `~ ${formatBalance(claimableAssets, asset.decimals)}` : ""}
          </p>
          <SelectToken
            chainId={asset.chainId!}
            allowSelection={false}
            selectedToken={asset}
            options={tokenOptions}
            selectToken={() => { }}
          />
        </span>
      </span>

      <div className="mt-2">
        <SecondaryButtonGroup
          label="Claim Withdrawal"
          mainAction={handleWithdraw}
          chainId={asset.chainId!}
          disabled={claimableAssets === BigInt(0) || !asset}
        />
      </div>
    </div>
  )
}


function RequestedShares({ requestShares, vault, asset, setUp }: { requestShares: bigint, vault: Token, asset: Token, setUp: Function }): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: asset.chainId });
  const { data: walletClient } = useWalletClient();

  async function handleCancelRedeem() {
    if (!account || !walletClient) return;

    showLoadingToast("Canceling redeem request...");

    const success = await handleCallResult({
      successMessage: "Redeem request canceled!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: VAULT.address,
          abi: OracleVaultAbi,
        },
        functionName: "cancelRedeemRequest",
        publicClient: publicClient!,
        args: [account]
      }),
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!
      },
    });

    if (success) {
      setUp()
    }
  }

  return (
    <div className="bg-customNeutral200 p-6 rounded-lg mt-4">
      <p className="text-white font-bold text-xl mb-4">Requested Withdrawals</p>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Shares:</p>
        <span className="flex flex-row items-center">
          {formatBalance(requestShares, vault.decimals)}
          <TokenIcon
            token={vault}
            icon={vault?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={1}
          />
          {vault.symbol}
        </span>
      </span>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Assets:</p>
        <span className="flex flex-row items-center">
          ~ {formatBalance(requestShares, vault.decimals)}
          <TokenIcon
            token={asset}
            icon={asset?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={1}
          />
          {asset.symbol}
        </span>
      </span>
      <div className="mt-2">
        <SecondaryButtonGroup
          label="Cancel Request"
          mainAction={handleCancelRedeem}
          chainId={asset.chainId!}
          disabled={false}
        />
      </div>
    </div>
  )
}
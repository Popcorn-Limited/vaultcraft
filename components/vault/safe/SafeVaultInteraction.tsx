import { Balance, RequestBalance, Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { VaultInputsProps } from "@/components/vault/VaultInputs";
import { showLoadingToast } from "@/lib/toasts";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { tokensAtom } from "@/lib/atoms";
import { OracleVaultAbi, AsyncVaultRouterAbi } from "@/lib/constants";
import { http, createPublicClient, zeroAddress, Address, parseUnits, maxUint256, formatUnits, erc20Abi } from "viem";
import SpinningLogo from "@/components/common/SpinningLogo";
import { arbitrum } from "viem/chains";
import { RPC_URLS } from "@/lib/utils/connectors";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { EMPTY_BALANCE, formatBalance, handleCallResult, simulateCall } from "@/lib/utils/helpers";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import getVaultErrorMessage from "@/lib/vault/errorMessage";
import TokenIcon from "@/components/common/TokenIcon";
import SecondaryButtonGroup from "@/components/common/SecondaryButtonGroup";
import SelectToken from "@/components/input/SelectToken";
import { handleAllowance } from "@/lib/approve";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";


async function fetchData(user: Address, vaultData: VaultData) {
  const client = createPublicClient({
    chain: arbitrum,
    transport: http(RPC_URLS[42161])
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
      },
      {
        address: vaultData.asset,
        abi: erc20Abi,
        functionName: "allowance",
        args: [user, vaultData.address]
      },
      {
        address: vaultData.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [user, vaultData.address]
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

const ROUTER = "0x9E3c42A34140C0a72b1001751e836aac743F0208"

export default function SafeVaultInteraction({
  vaultData,
  tokenOptions,
  chainId,
  hideModal,
}: VaultInputsProps) {
  const { address: account } = useAccount();

  const [tokens] = useAtom(tokensAtom)

  const [requestBalance, setRequestBalance] = useState<RequestBalance>();
  const [assetAllowance, setAssetAllowance] = useState<bigint>(BigInt(0));
  const [vaultAllowance, setVaultAllowance] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (account) setUp()
  }, [account])

  async function setUp() {
    const data = await fetchData(account ? account : zeroAddress, vaultData)

    setRequestBalance(data.requestBalance)
    setAssetAllowance(data.assetAllowance)
    setVaultAllowance(data.vaultAllowance)
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
            assetAllowance={assetAllowance}
            vaultAllowance={vaultAllowance}
          />
        </div>
      </div>
      <div className="">
        {!!requestBalance &&
          <ClaimableWithdrawal
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
  assetAllowance,
  vaultAllowance
}: VaultInputsProps & { setUp: Function, assetAllowance: bigint, vaultAllowance: bigint }) {
  const { address: account, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId });

  const [tokens, setTokens] = useAtom(tokensAtom)
  const asset = tokens[chainId][vaultData.asset]
  const vault = tokens[chainId][vaultData.vault]
  const gauge = vaultData.gauge && vaultData.gauge !== zeroAddress ? tokens[chainId][vaultData.gauge] : undefined

  const [inputToken, setInputToken] = useState<Token>(asset);
  const [outputToken, setOutputToken] = useState<Token>(vault);

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
          address: vaultData.address,
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
      mutateTokenBalance({
        tokensToUpdate: [vault.address, asset.address],
        account,
        tokensAtom: [tokens, setTokens],
        chainId
      })
      setInputBalance({ value: BigInt(0), formatted: "0", formattedUSD: "0" });
    }
  }

  async function handleWithdraw() {
    if (!publicClient) return;

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
          args: [vaultData.safe!]
        }
      ]
    })

    const expectedAssets = res[0].result as bigint;
    const float = res[1].result as bigint;

    if (float >= expectedAssets) {
      handleRequestFulfillWithdraw()
    } else {
      handleRequestRedeem()
    }
  }

  async function handleRequestFulfillWithdraw() {
    if (!account || !walletClient) return;

    showLoadingToast("Redeeming...");

    const success = await handleCallResult({
      successMessage: "Redeemed!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: ROUTER,
          abi: AsyncVaultRouterAbi,
        },
        functionName: "requestFulfillWithdraw",
        publicClient: publicClient!,
        args: [vaultData.address, account, inputBalance.value]
      }),
      clients: {
        publicClient: publicClient!,
        walletClient: walletClient!
      },
    });

    if (success) {
      setUp()
      mutateTokenBalance({
        tokensToUpdate: [vault.address, asset.address],
        account,
        tokensAtom: [tokens, setTokens],
        chainId
      })
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
          address: vaultData.address,
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
      mutateTokenBalance({
        tokensToUpdate: [vault.address],
        account,
        tokensAtom: [tokens, setTokens],
        chainId
      })
      setInputBalance({ value: BigInt(0), formatted: "0", formattedUSD: "0" });
    }
  }

  async function handleApprove() {
    if (!account || !walletClient || !publicClient || !inputToken) return;

    const success1 = await handleAllowance({
      token: inputToken.address,
      amount: Number(inputBalance.value),
      account: account,
      spender: vaultData.liquid >= inputBalance.value ? ROUTER : vaultData.address,
      clients: {
        publicClient: publicClient,
        walletClient: walletClient
      },
    })


    // Handle Operator
    const isOperator = await publicClient.readContract({
      address: vaultData.address,
      abi: OracleVaultAbi,
      functionName: "isOperator",
      args: [account, ROUTER]
    })
    let success2 = true;
    if (!isOperator) {
      success2 = await handleCallResult({
        successMessage: "Operator set!",
        simulationResponse: await simulateCall({
          account,
          contract: {
            address: vaultData.address,
            abi: OracleVaultAbi,
          },
          functionName: "setOperator",
          publicClient: publicClient,
          args: [ROUTER, true]
        }),
        clients: {
          publicClient: publicClient,
          walletClient: walletClient
        },
      });
    }

    if (success1 && success2) {
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
          mainAction={isDeposit ? handleDeposit : handleWithdraw}
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
  const [tokens, setTokens] = useAtom(tokensAtom)
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
          address: vault.address,
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
      mutateTokenBalance({
        tokensToUpdate: [vault.address, asset.address],
        account,
        tokensAtom: [tokens, setTokens],
        chainId: vault.chainId!
      })
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
  const [tokens, setTokens] = useAtom(tokensAtom)
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
          address: vault.address,
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
      mutateTokenBalance({
        tokensToUpdate: [vault.address],
        account,
        tokensAtom: [tokens, setTokens],
        chainId: vault.chainId!
      })
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
            chainId={vault.chainId!}
          />
          {vault.symbol}
        </span>
      </span>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Assets:</p>
        <span className="flex flex-row items-center">
          {/* TODO: Convert to assets */}
          ~ {formatBalance(requestShares, vault.decimals)}
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
          label="Cancel Request"
          mainAction={handleCancelRedeem}
          chainId={asset.chainId!}
          disabled={false}
        />
      </div>
    </div>
  )
}

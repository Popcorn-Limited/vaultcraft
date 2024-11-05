import { ChainById } from "@/lib/utils/connectors";
import { http, createPublicClient, Address, zeroAddress, erc20Abi, parseUnits } from "viem";
import { RPC_URLS } from "@/lib/utils/connectors";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { formatBalance, handleCallResult, handleChangeInput, simulateCall } from "@/lib/utils/helpers";
import InputNumber from "@/components/input/InputNumber";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { Balance, Token, TokenType } from "@/lib/types";
import { handleAllowance } from "@/lib/approve";
import { showLoadingToast } from "@/lib/toasts";
import { OracleVaultAbi } from "@/lib/constants";


const VAULT: Token = {
  address: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137" as Address,
  name: "Vault",
  symbol: "Vault",
  decimals: 6,
  logoURI: "",
  balance: { value: BigInt(0), formatted: "0", formattedUSD: "0" },
  price: 1,
  totalSupply: BigInt(0),
  chainId: 42161,
  type: TokenType.Vault,
}

const ASSET: Token = {
  address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address,
  name: "USDC",
  symbol: "USDC",
  decimals: 6,
  logoURI: "",
  balance: { value: BigInt(0), formatted: "0", formattedUSD: "0" },
  price: 1,
  totalSupply: BigInt(0),
  chainId: 42161,
  type: TokenType.Asset,
}


async function fetchVault(user: Address = zeroAddress) {
  const publicClient = createPublicClient({
    chain: ChainById[42161],
    transport: http(RPC_URLS[42161]),
  });
  const baseCall = {
    address: VAULT.address,
    abi: OracleVaultAbi,
  }

  const vault = await publicClient.multicall({
    contracts: [{
      ...baseCall,
      functionName: "totalAssets",
    },
    {
      ...baseCall,
      functionName: "totalSupply",
    },
    {
      ...baseCall,
      functionName: "getRequestBalance",
      args: [user],
    },
    {
      ...baseCall,
      functionName: "balanceOf",
      args: [user],
    },
    {
      address: ASSET.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [user],
    },
    {
      address: ASSET.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: ["0x3C99dEa58119DE3962253aea656e61E5fBE21613" as Address],
    }],
    allowFailure: true
  });

  return {
    totalAssets: vault[0].result,
    totalSupply: vault[1].result,
    assetsPerShare: vault[1].result === BigInt(0) ? 1 : Number(vault[0].result) / Number(vault[1].result),
    requestBalance: vault[2].result,
    balanceOf: vault[3].result,
    balanceOfAsset: vault[4].result,
    balanceOfMultisig: vault[5].result,
  }
}



export default function Test() {
  const publicClient = usePublicClient({ chainId: 42161 });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();

  const [vault, setVault] = useState<any>(null)

  const [inputAmount, setInputAmount] = useState<Balance>({ value: BigInt(0), formatted: "0", formattedUSD: "0" })
  const [redeemAmount, setRedeemAmount] = useState<Balance>({ value: BigInt(0), formatted: "0", formattedUSD: "0" })

  const clients = { publicClient: publicClient!, walletClient: walletClient! }

  useEffect(() => {
    fetchVault(account).then(res => setVault(res))
  }, [account])

  function handleChangeInput(e: any, isDeposit: boolean) {
    let value = e.currentTarget.value;

    const [integers, decimals] = String(value).split('.');
    let inputAmt = value;

    // if precision is more than token decimal, cut it
    if (decimals?.length > 6) {
      inputAmt = `${integers}.${decimals.slice(0, 6)}`;
    }

    // covert string amt to bigint
    const newAmt = parseUnits(inputAmt, 6)

    const newBalance = { value: newAmt, formatted: inputAmt, formattedUSD: String(Number(inputAmt) * (1 || 0)) };
    isDeposit ? setInputAmount(newBalance) : setRedeemAmount(newBalance);
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
        args: [inputAmount.value, account]
      }),
      clients,
    });

    if (success) {
      // Refetch vault data after deposit
      const updatedVault = await fetchVault(account);
      setVault(updatedVault);
      // Reset input
      setInputAmount({ value: BigInt(0), formatted: "0", formattedUSD: "0" });
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
        args: [redeemAmount.value, account, account]
      }),
      clients,
    });

    if (success) {
      // Refetch vault data after redeem request
      const updatedVault = await fetchVault(account);
      setVault(updatedVault);
      // Reset input
      setRedeemAmount({ value: BigInt(0), formatted: "0", formattedUSD: "0" });
    }
  }

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
        args: [vault.requestBalance.claimableAssets, account, account]
      }),
      clients,
    });

    if (success) {
      // Refetch vault data after withdrawing
      const updatedVault = await fetchVault(account);
      setVault(updatedVault);
    }
  }

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
      clients,
    });

    if (success) {
      // Refetch vault data after canceling redeem
      const updatedVault = await fetchVault(account);
      setVault(updatedVault);
    }
  }

  async function handleFulfillRedeem() {
    if (!account || !walletClient) return;

    showLoadingToast("Fulfilling redeem request...");

    const success = await handleCallResult({
      successMessage: "Redeem request fulfilled!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: VAULT.address,
          abi: OracleVaultAbi,
        },
        functionName: "fulfillRedeem",
        publicClient: publicClient!,
        args: [vault.requestBalance.pendingShares, account]
      }),
      clients,
    });

    if (success) {
      // Refetch vault data after canceling redeem
      const updatedVault = await fetchVault(account);
      setVault(updatedVault);
    }
  }

  return <div className="text-white">
    {
      vault ? (
        <div>
          <div>
            <p>
              Your Wallet Assets: {formatBalance(vault.balanceOfAsset, 6)}
            </p>
            <p>
              Your Vault Shares: {formatBalance(vault.balanceOf, 6)}
            </p>
            <p>
              Total Assets: {formatBalance(vault.totalAssets, 6)}
            </p>
          </div>
          <div className="flex flex-row space-x-4 mt-8">
            <div className="w-1/2 space-y-4">
              <div
                className={`w-full px-5 pt-4 pb-2 rounded-lg border border-customGray100`}
              >
                <div className="xs:w-full xs:border-r xs:border-customGray500 xs:pr-4 smmd:p-0 smmd:border-none smmd:w-1/2">
                  <InputNumber
                    value={inputAmount.formatted}
                    onChange={(e) => handleChangeInput(e, true)}
                  />
                </div>
              </div>
              <MainActionButton
                label="Deposit"
                handleClick={handleDeposit}
              />
              <SecondaryActionButton
                label="Approve Asset"
                handleClick={() => handleAllowance({
                  token: ASSET.address,
                  amount: Number(inputAmount.value),
                  account: account!,
                  spender: VAULT.address,
                  clients: {
                    publicClient: publicClient!,
                    walletClient: walletClient!
                  },
                })}
              />
            </div>
            <div className="w-1/2 space-y-4">
              <div
                className={`w-full px-5 pt-4 pb-2 rounded-lg border border-customGray100`}
              >
                <div className="xs:w-full xs:border-r xs:border-customGray500 xs:pr-4 smmd:p-0 smmd:border-none smmd:w-1/2">
                  <InputNumber
                    value={redeemAmount.formatted}
                    onChange={(e) => handleChangeInput(e, false)}
                  />
                </div>
              </div>
              <MainActionButton
                label="Request Redeem"
                handleClick={handleRequestRedeem}
              />
              <SecondaryActionButton
                label="Approve Vault"
                handleClick={() => handleAllowance({
                  token: VAULT.address,
                  amount: Number(redeemAmount.value),
                  account: account!,
                  spender: VAULT.address,
                  clients: {
                    publicClient: publicClient!,
                    walletClient: walletClient!
                  },
                })}
              />
            </div>
          </div>
          <div className="mt-8">
            <div>
              <p>
                Claimable Assets: {formatBalance(vault.requestBalance.claimableAssets, 6)}
              </p>
              <MainActionButton
                label="Withdraw"
                handleClick={handleWithdraw}
              />
            </div>
            <div>
              <p>
                Redeem Request Balance: {formatBalance(vault.requestBalance.pendingShares, 6)}
              </p>
              <MainActionButton
                label="Cancel Redeem"
                handleClick={handleCancelRedeem}
              />
            </div>
          </div>
          <div className="mt-8">
            <p>
              Available Assets in Multsig: {formatBalance(vault.balanceOfMultisig, 6)}
            </p>
            <MainActionButton
              label="Fulfill Redeem"
              handleClick={handleFulfillRedeem}
            />
          </div>
        </div>
      )
        : <p>Loading...</p>
    }
  </div>
}
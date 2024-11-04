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


const OracleVaultAbi = [{ "inputs": [{ "components": [{ "internalType": "address", "name": "asset", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "owner", "type": "address" }, { "components": [{ "internalType": "uint256", "name": "depositLimit", "type": "uint256" }, { "internalType": "uint256", "name": "minAmount", "type": "uint256" }], "internalType": "struct Limits", "name": "limits", "type": "tuple" }, { "components": [{ "internalType": "uint64", "name": "performanceFee", "type": "uint64" }, { "internalType": "uint64", "name": "managementFee", "type": "uint64" }, { "internalType": "uint64", "name": "withdrawalIncentive", "type": "uint64" }, { "internalType": "uint64", "name": "feesUpdatedAt", "type": "uint64" }, { "internalType": "uint256", "name": "highWaterMark", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "internalType": "struct Fees", "name": "fees", "type": "tuple" }], "internalType": "struct InitializeParams", "name": "params", "type": "tuple" }, { "internalType": "address", "name": "oracle_", "type": "address" }, { "internalType": "address", "name": "multisig_", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "InvalidFee", "type": "error" }, { "inputs": [], "name": "Misconfigured", "type": "error" }, { "inputs": [], "name": "ZeroAmount", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "components": [{ "internalType": "uint256", "name": "upper", "type": "uint256" }, { "internalType": "uint256", "name": "lower", "type": "uint256" }], "indexed": false, "internalType": "struct Bounds", "name": "prev", "type": "tuple" }, { "components": [{ "internalType": "uint256", "name": "upper", "type": "uint256" }, { "internalType": "uint256", "name": "lower", "type": "uint256" }], "indexed": false, "internalType": "struct Bounds", "name": "next", "type": "tuple" }], "name": "BoundsUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "caller", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "assets", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "components": [{ "internalType": "uint64", "name": "performanceFee", "type": "uint64" }, { "internalType": "uint64", "name": "managementFee", "type": "uint64" }, { "internalType": "uint64", "name": "withdrawalIncentive", "type": "uint64" }, { "internalType": "uint64", "name": "feesUpdatedAt", "type": "uint64" }, { "internalType": "uint256", "name": "highWaterMark", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "indexed": false, "internalType": "struct Fees", "name": "prev", "type": "tuple" }, { "components": [{ "internalType": "uint64", "name": "performanceFee", "type": "uint64" }, { "internalType": "uint64", "name": "managementFee", "type": "uint64" }, { "internalType": "uint64", "name": "withdrawalIncentive", "type": "uint64" }, { "internalType": "uint64", "name": "feesUpdatedAt", "type": "uint64" }, { "internalType": "uint256", "name": "highWaterMark", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "indexed": false, "internalType": "struct Fees", "name": "next", "type": "tuple" }], "name": "FeesUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "components": [{ "internalType": "uint256", "name": "depositLimit", "type": "uint256" }, { "internalType": "uint256", "name": "minAmount", "type": "uint256" }], "indexed": false, "internalType": "struct Limits", "name": "prev", "type": "tuple" }, { "components": [{ "internalType": "uint256", "name": "depositLimit", "type": "uint256" }, { "internalType": "uint256", "name": "minAmount", "type": "uint256" }], "indexed": false, "internalType": "struct Limits", "name": "next", "type": "tuple" }], "name": "LimitsUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "controller", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "OperatorSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "oldOwner", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnerChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnerNominated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "controller", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "assets", "type": "uint256" }], "name": "RedeemRequest", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "controller", "type": "address" }, { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "RedeemRequestCanceled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "account", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "RoleUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }], "name": "Unpaused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "caller", "type": "address" }, { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "assets", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PAUSER_ROLE", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "accruedFees", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "asset", "outputs": [{ "internalType": "contract ERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "controller", "type": "address" }, { "internalType": "bytes32", "name": "nonce", "type": "bytes32" }], "name": "authorizations", "outputs": [{ "internalType": "bool", "name": "used", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "controller", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }, { "internalType": "bytes32", "name": "nonce", "type": "bytes32" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "name": "authorizeOperator", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "bounds", "outputs": [{ "internalType": "uint256", "name": "upper", "type": "uint256" }, { "internalType": "uint256", "name": "lower", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "controller", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }], "name": "cancelRedeemRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "controller", "type": "address" }], "name": "cancelRedeemRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "controller", "type": "address" }], "name": "claimableRedeemRequest", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "convertToAssets", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "convertToLowBoundAssets", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }], "name": "convertToShares", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }, { "internalType": "address", "name": "receiver", "type": "address" }], "name": "deposit", "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }], "name": "deposit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "fees", "outputs": [{ "internalType": "uint64", "name": "performanceFee", "type": "uint64" }, { "internalType": "uint64", "name": "managementFee", "type": "uint64" }, { "internalType": "uint64", "name": "withdrawalIncentive", "type": "uint64" }, { "internalType": "uint64", "name": "feesUpdatedAt", "type": "uint64" }, { "internalType": "uint256", "name": "highWaterMark", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "shares", "type": "uint256[]" }, { "internalType": "address[]", "name": "controllers", "type": "address[]" }], "name": "fulfillMultipleRedeems", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "address", "name": "controller", "type": "address" }], "name": "fulfillRedeem", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getBounds", "outputs": [{ "components": [{ "internalType": "uint256", "name": "upper", "type": "uint256" }, { "internalType": "uint256", "name": "lower", "type": "uint256" }], "internalType": "struct Bounds", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFees", "outputs": [{ "components": [{ "internalType": "uint64", "name": "performanceFee", "type": "uint64" }, { "internalType": "uint64", "name": "managementFee", "type": "uint64" }, { "internalType": "uint64", "name": "withdrawalIncentive", "type": "uint64" }, { "internalType": "uint64", "name": "feesUpdatedAt", "type": "uint64" }, { "internalType": "uint256", "name": "highWaterMark", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "internalType": "struct Fees", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "controller", "type": "address" }], "name": "getRequestBalance", "outputs": [{ "components": [{ "internalType": "uint256", "name": "pendingShares", "type": "uint256" }, { "internalType": "uint256", "name": "requestTime", "type": "uint256" }, { "internalType": "uint256", "name": "claimableShares", "type": "uint256" }, { "internalType": "uint256", "name": "claimableAssets", "type": "uint256" }], "internalType": "struct RequestBalance", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }, { "internalType": "address", "name": "", "type": "address" }], "name": "hasRole", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "isOperator", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "limits", "outputs": [{ "internalType": "uint256", "name": "depositLimit", "type": "uint256" }, { "internalType": "uint256", "name": "minAmount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "maxDeposit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "maxMint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "controller", "type": "address" }], "name": "maxRedeem", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "controller", "type": "address" }], "name": "maxWithdraw", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "address", "name": "receiver", "type": "address" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "multisig", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }], "name": "nominateNewOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "nominatedOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "oracle", "outputs": [{ "internalType": "contract IPriceOracle", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "controller", "type": "address" }], "name": "pendingRedeemRequest", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }], "name": "previewDeposit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "previewMint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "previewRedeem", "outputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "previewWithdraw", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "address", "name": "controller", "type": "address" }], "name": "redeem", "outputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }], "name": "redeem", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "requestBalances", "outputs": [{ "internalType": "uint256", "name": "pendingShares", "type": "uint256" }, { "internalType": "uint256", "name": "requestTime", "type": "uint256" }, { "internalType": "uint256", "name": "claimableShares", "type": "uint256" }, { "internalType": "uint256", "name": "claimableAssets", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" }], "name": "requestRedeem", "outputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "uint256", "name": "upper", "type": "uint256" }, { "internalType": "uint256", "name": "lower", "type": "uint256" }], "internalType": "struct Bounds", "name": "bounds_", "type": "tuple" }], "name": "setBounds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "uint64", "name": "performanceFee", "type": "uint64" }, { "internalType": "uint64", "name": "managementFee", "type": "uint64" }, { "internalType": "uint64", "name": "withdrawalIncentive", "type": "uint64" }, { "internalType": "uint64", "name": "feesUpdatedAt", "type": "uint64" }, { "internalType": "uint256", "name": "highWaterMark", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "internalType": "struct Fees", "name": "fees_", "type": "tuple" }], "name": "setFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "uint256", "name": "depositLimit", "type": "uint256" }, { "internalType": "uint256", "name": "minAmount", "type": "uint256" }], "internalType": "struct Limits", "name": "limits_", "type": "tuple" }], "name": "setLimits", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setOperator", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "share", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "takeFees", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "totalAssets", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "updateRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }], "name": "withdraw", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "address", "name": "controller", "type": "address" }], "name": "withdraw", "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }] as const
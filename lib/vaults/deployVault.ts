import { toast } from "react-hot-toast";
import { Address, parseUnits } from "viem";
import { PublicClient, WalletClient } from "wagmi";
import { ADDRESS_ZERO, EMPTY_BYTES, MAX_UINT256, ZERO } from "../constants";
import { AdapterConfig } from "../atoms";

const VAULT_CONTROLLER: { [key: number]: Address } = {
  1: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  1337: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  42161: "0xF40749d72Ab5422CC5d735A373E66d67f7cA9393",
}

async function simulateDeployVault(
  chain: any,
  walletClient: WalletClient,
  publicClient: PublicClient,
  fees: any,
  asset: any,
  limit: any,
  adapterData: AdapterConfig,
  strategyData: AdapterConfig,
  ipfsHash: string
): Promise<{ request: any | null, success: boolean, error: string | null }> {
  const [account] = await walletClient.getAddresses()

  if (VAULT_CONTROLLER[chain.id] === undefined) return { request: null, success: false, error: "Connected to the wrong network" }

  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: VAULT_CONTROLLER[chain.id],
      abi,
      functionName: "deployVault",
      args: [
        {
          asset: asset.address[chain.id],
          adapter: ADDRESS_ZERO,
          fees: {
            deposit: parseUnits(String(Number(fees.deposit) / 100), 18),
            withdrawal: parseUnits(String(Number(fees.withdrawal) / 100), 18),
            management: parseUnits(String(Number(fees.management) / 100), 18),
            performance: parseUnits(String(Number(fees.performance) / 100), 18),
          },
          feeRecipient: fees.recipient,
          depositLimit: Number(limit.maximum) === 0 ? MAX_UINT256 : BigInt(String(Number(limit.maximum) * (10 ** asset.decimals))),
          owner: account,
        },
        // @ts-ignore // TODO --> for some reason viem interprets this as needing Address and Address instead of the actual types bytes32 and bytes
        adapterData,
        // @ts-ignore // TODO --> for some reason viem interprets this as needing Address and Address instead of the actual types bytes32 and bytes
        strategyData,
        false,
        EMPTY_BYTES,
        {
          vault: ADDRESS_ZERO,
          staking: ADDRESS_ZERO,
          creator: account,
          metadataCID: ipfsHash,
          swapTokenAddresses: [
            ADDRESS_ZERO,
            ADDRESS_ZERO,
            ADDRESS_ZERO,
            ADDRESS_ZERO,
            ADDRESS_ZERO,
            ADDRESS_ZERO,
            ADDRESS_ZERO,
            ADDRESS_ZERO,
          ],
          swapAddress: ADDRESS_ZERO,
          exchange: ZERO,
        },
        ZERO
      ],
    });
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

export async function deployVault(
  chain: any,
  walletClient: WalletClient,
  publicClient: PublicClient,
  fees: any,
  asset: any,
  limit: any,
  adapterData: AdapterConfig,
  strategyData: AdapterConfig,
  ipfsHash: string
): Promise<boolean> {
  toast.loading("Deploying Vault...")

  const { request, success, error: simulationError } = await simulateDeployVault(chain, walletClient, publicClient, fees, asset, limit, adapterData, strategyData, ipfsHash)
  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log({ receipt })
      toast.dismiss()
      toast.success("Vault Deployed!");

      return true;
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.shortMessage)

      return false;
    }
  } else {
    toast.dismiss()
    toast.error(simulationError)

    return false;
  }
};

const abi = [
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "contract IERC20Upgradeable",
            "name": "asset",
            "type": "address"
          },
          {
            "internalType": "contract IERC4626Upgradeable",
            "name": "adapter",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint64",
                "name": "deposit",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "withdrawal",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "management",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "performance",
                "type": "uint64"
              }
            ],
            "internalType": "struct VaultFees",
            "name": "fees",
            "type": "tuple"
          },
          {
            "internalType": "address",
            "name": "feeRecipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "depositLimit",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "internalType": "struct VaultInitParams",
        "name": "vaultData",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct DeploymentArgs",
        "name": "adapterData",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct DeploymentArgs",
        "name": "strategyData",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "deployStaking",
        "type": "bool"
      },
      {
        "internalType": "bytes",
        "name": "rewardsData",
        "type": "bytes"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "vault",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "staking",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "metadataCID",
            "type": "string"
          },
          {
            "internalType": "address[8]",
            "name": "swapTokenAddresses",
            "type": "address[8]"
          },
          {
            "internalType": "address",
            "name": "swapAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "exchange",
            "type": "uint256"
          }
        ],
        "internalType": "struct VaultMetadata",
        "name": "metadata",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "initialDeposit",
        "type": "uint256"
      }
    ],
    "name": "deployVault",
    "outputs": [
      {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

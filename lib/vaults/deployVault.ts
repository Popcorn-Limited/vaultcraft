import { Contract, constants, ethers } from "ethers";
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { useAtom } from "jotai";
import { adapterDeploymentAtom, assetAtom, feeAtom, limitAtom, metadataAtom, strategyDeploymentAtom } from "@/lib/atoms"
import { parseUnits } from "ethers/lib/utils.js";
import { toast } from "react-hot-toast";
import { extractRevertReason } from "../helpers";

const VAULT_CONTROLLER = {
  "1": "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  "1337": "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  "42161": "0xF40749d72Ab5422CC5d735A373E66d67f7cA9393",
}


export async function deployVault(chain: any, connector: any, fees: any, asset: any, limit: any, account: any, adapterData: any, strategyData: any, ipfsHash: any): Promise<boolean> {
  toast.loading("Deploying Vault...")
  const signer = await connector.getSigner()

  const controller = new Contract("0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb", abi, signer)

  try {
    const tx = await controller.deployVault(
      {
        // @ts-ignore
        asset: asset.address[chain?.id],
        adapter: constants.AddressZero,
        fees: {
          deposit: parseUnits(String(Number(fees.deposit) / 100)),
          withdrawal: parseUnits(String(Number(fees.withdrawal) / 100)),
          management: parseUnits(String(Number(fees.management) / 100)),
          performance: parseUnits(String(Number(fees.performance) / 100)),
        },
        feeRecipient: fees.recipient,
        depositLimit: Number(limit.maximum) === 0 ? constants.MaxUint256 : String(Number(limit.maximum) * (10 ** asset.decimals)),
        owner: account,
      },
      adapterData,
      strategyData,
      false,
      "0x",
      {
        vault: constants.AddressZero,
        staking: constants.AddressZero,
        creator: account,
        metadataCID: ipfsHash,
        swapTokenAddresses: [
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
          constants.AddressZero,
        ],
        swapAddress: constants.AddressZero,
        exchange: 0,
      },
      0,
    );
    await tx.wait(1)
    toast.dismiss()
    toast.success("Vault Deployed!");
    return true
  } catch (error) {
    toast.dismiss()
    toast.error(extractRevertReason(error));
    return false
  }

  // const { config, error: configError } = usePrepareContractWrite({
  //   address: "0xd855ce0c298537ad5b5b96060cf90e663696bbf6",
  //   abi,
  //   functionName: "deployAdapter",
  //   chainId,
  //   args: [
  //     asset.address,
  //     adapterData,
  //     {
  //       id: stringToHex(""),
  //       data: "0x"
  //     },
  //     0
  //   ]
  // })
};

const abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20Upgradeable",
            name: "asset",
            type: "address",
          },
          {
            internalType: "contract IERC4626Upgradeable",
            name: "adapter",
            type: "address",
          },
          {
            components: [
              {
                internalType: "uint64",
                name: "deposit",
                type: "uint64",
              },
              {
                internalType: "uint64",
                name: "withdrawal",
                type: "uint64",
              },
              {
                internalType: "uint64",
                name: "management",
                type: "uint64",
              },
              {
                internalType: "uint64",
                name: "performance",
                type: "uint64",
              },
            ],
            internalType: "struct VaultFees",
            name: "fees",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "feeRecipient",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "depositLimit",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        internalType: "struct VaultInitParams",
        name: "vaultData",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct DeploymentArgs",
        name: "adapterData",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct DeploymentArgs",
        name: "strategyData",
        type: "tuple",
      },
      {
        internalType: "bool",
        name: "deployStaking",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "rewardsData",
        type: "bytes",
      },
      {
        components: [
          {
            internalType: "address",
            name: "vault",
            type: "address",
          },
          {
            internalType: "address",
            name: "staking",
            type: "address",
          },
          {
            internalType: "address",
            name: "creator",
            type: "address",
          },
          {
            internalType: "string",
            name: "metadataCID",
            type: "string",
          },
          {
            internalType: "address[8]",
            name: "swapTokenAddresses",
            type: "address[8]",
          },
          {
            internalType: "address",
            name: "swapAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "exchange",
            type: "uint256",
          },
        ],
        internalType: "struct VaultMetadata",
        name: "metadata",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "initialDeposit",
        type: "uint256",
      },
    ],
    name: "deployVault",
    outputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "VAULT",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultRegistry",
    outputs: [
      {
        internalType: "contract IVaultRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "acceptAdminProxyOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Upgradeable",
        name: "asset",
        type: "address",
      },
    ],
    name: "deployStaking",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Upgradeable",
        name: "asset",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct DeploymentArgs",
        name: "adapterData",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct DeploymentArgs",
        name: "strategyData",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "initialDeposit",
        type: "uint256",
      },
    ],
    name: "deployAdapter",
    outputs: [
      {
        internalType: "address",
        name: "adapter",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

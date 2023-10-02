export const VaultControllerAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "contract IAdminProxy",
        "name": "_adminProxy",
        "type": "address"
      },
      {
        "internalType": "contract IDeploymentController",
        "name": "_deploymentController",
        "type": "address"
      },
      {
        "internalType": "contract IVaultRegistry",
        "name": "_vaultRegistry",
        "type": "address"
      },
      {
        "internalType": "contract IPermissionRegistry",
        "name": "_permissionRegistry",
        "type": "address"
      },
      {
        "internalType": "contract IMultiRewardEscrow",
        "name": "_escrow",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ArrayLengthMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DeploymentInitFailed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "adapter",
        "type": "address"
      }
    ],
    "name": "DoesntExist",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "revertReason",
        "type": "bytes"
      }
    ],
    "name": "UnderlyingError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidConfig",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "deploymentController",
        "type": "address"
      }
    ],
    "name": "InvalidDeploymentController",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cooldown",
        "type": "uint256"
      }
    ],
    "name": "InvalidHarvestCooldown",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "InvalidPerformanceFee",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "templateCategory",
        "type": "bytes32"
      }
    ],
    "name": "KeyNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Mismatch",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "subject",
        "type": "address"
      }
    ],
    "name": "NotAllowed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "templateId",
        "type": "bytes32"
      }
    ],
    "name": "NotEndorsed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "NotSubmitter",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      }
    ],
    "name": "NotSubmitterNorOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "templateKey",
        "type": "bytes32"
      }
    ],
    "name": "SameKey",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "templateCategory",
        "type": "bytes32"
      }
    ],
    "name": "TemplateCategoryExists",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "templateId",
        "type": "bytes32"
      }
    ],
    "name": "TemplateExists",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "revertReason",
        "type": "bytes"
      }
    ],
    "name": "UnderlyingError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VaultAlreadyRegistered",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "oldKey",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "newKey",
        "type": "bytes32"
      }
    ],
    "name": "ActiveTemplateIdChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "oldController",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newController",
        "type": "address"
      }
    ],
    "name": "DeploymentControllerChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldCooldown",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newCooldown",
        "type": "uint256"
      }
    ],
    "name": "HarvestCooldownChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "oldOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnerChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnerNominated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "PerformanceFeeChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "staking",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "adapter",
        "type": "address"
      }
    ],
    "name": "VaultDeployed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ADAPTER",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "STAKING",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "STRATEGY",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "VAULT",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptAdminProxyOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "activeTemplateId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      },
      {
        "internalType": "bytes[]",
        "name": "rewardTokenData",
        "type": "bytes[]"
      }
    ],
    "name": "addStakingRewardsTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "templateCategories",
        "type": "bytes32[]"
      }
    ],
    "name": "addTemplateCategories",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "adminProxy",
    "outputs": [
      {
        "internalType": "contract IAdminProxy",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      },
      {
        "internalType": "contract IERC20Upgradeable[]",
        "name": "rewardTokens",
        "type": "address[]"
      },
      {
        "internalType": "uint160[]",
        "name": "rewardsSpeeds",
        "type": "uint160[]"
      }
    ],
    "name": "changeStakingRewardsSpeeds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      }
    ],
    "name": "changeVaultAdapters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      }
    ],
    "name": "changeVaultFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cloneRegistry",
    "outputs": [
      {
        "internalType": "contract ICloneRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20Upgradeable",
        "name": "asset",
        "type": "address"
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
        "internalType": "uint256",
        "name": "initialDeposit",
        "type": "uint256"
      }
    ],
    "name": "deployAdapter",
    "outputs": [
      {
        "internalType": "address",
        "name": "adapter",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20Upgradeable",
        "name": "asset",
        "type": "address"
      }
    ],
    "name": "deployStaking",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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
  },
  {
    "inputs": [],
    "name": "deploymentController",
    "outputs": [
      {
        "internalType": "contract IDeploymentController",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "escrow",
    "outputs": [
      {
        "internalType": "contract IMultiRewardEscrow",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      },
      {
        "internalType": "contract IERC20Upgradeable[]",
        "name": "rewardTokens",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "name": "fundStakingRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "harvestCooldown",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "nominateNewAdminProxyOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "nominateNewOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nominatedOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      }
    ],
    "name": "pauseAdapters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      }
    ],
    "name": "pauseVaults",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "performanceFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "permissionRegistry",
    "outputs": [
      {
        "internalType": "contract IPermissionRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      },
      {
        "internalType": "contract IERC4626Upgradeable[]",
        "name": "newAdapter",
        "type": "address[]"
      }
    ],
    "name": "proposeVaultAdapters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
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
        "internalType": "struct VaultFees[]",
        "name": "fees",
        "type": "tuple[]"
      }
    ],
    "name": "proposeVaultFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "templateCategory",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "templateId",
        "type": "bytes32"
      }
    ],
    "name": "setActiveTemplateId",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "adapters",
        "type": "address[]"
      }
    ],
    "name": "setAdapterHarvestCooldowns",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "adapters",
        "type": "address[]"
      }
    ],
    "name": "setAdapterPerformanceFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IDeploymentController",
        "name": "_deploymentController",
        "type": "address"
      }
    ],
    "name": "setDeploymentController",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20Upgradeable[]",
        "name": "tokens",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "fees",
        "type": "uint256[]"
      }
    ],
    "name": "setEscrowTokenFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newCooldown",
        "type": "uint256"
      }
    ],
    "name": "setHarvestCooldown",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "setPerformanceFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "bool",
            "name": "endorsed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "rejected",
            "type": "bool"
          }
        ],
        "internalType": "struct Permission[]",
        "name": "newPermissions",
        "type": "tuple[]"
      }
    ],
    "name": "setPermissions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "depositLimits",
        "type": "uint256[]"
      }
    ],
    "name": "setVaultDepositLimits",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      },
      {
        "internalType": "address[]",
        "name": "feeRecipients",
        "type": "address[]"
      }
    ],
    "name": "setVaultFeeRecipients",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "quitPeriods",
        "type": "uint256[]"
      }
    ],
    "name": "setVaultQuitPeriods",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "templateRegistry",
    "outputs": [
      {
        "internalType": "contract ITemplateRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "adapters",
        "type": "address[]"
      }
    ],
    "name": "toggleAdapterAutoHarvest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "templateCategories",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "templateIds",
        "type": "bytes32[]"
      }
    ],
    "name": "toggleTemplateEndorsements",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      }
    ],
    "name": "unpauseAdapters",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "vaults",
        "type": "address[]"
      }
    ],
    "name": "unpauseVaults",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vaultRegistry",
    "outputs": [
      {
        "internalType": "contract IVaultRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const 
export const VaultRegistyAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
        "internalType": "address",
        "name": "vaultAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadataCID",
        "type": "string"
      }
    ],
    "name": "VaultAdded",
    "type": "event"
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allVaults",
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
    "name": "getRegisteredAddresses",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "getSubmitter",
    "outputs": [
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
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalVaults",
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
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "getVault",
    "outputs": [
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
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      }
    ],
    "name": "getVaultsByAsset",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "metadata",
    "outputs": [
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
    "stateMutability": "view",
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
        "name": "_metadata",
        "type": "tuple"
      }
    ],
    "name": "registerVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "vaultsByAsset",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const
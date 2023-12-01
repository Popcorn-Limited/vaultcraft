export const VaultRouterAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC4626Upgradeable",
        "name": "vault",
        "type": "address"
      },
      {
        "internalType": "contract ICurveGauge",
        "name": "gauge",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "assetAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "depositAndStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC4626Upgradeable",
        "name": "vault",
        "type": "address"
      },
      {
        "internalType": "contract ICurveGauge",
        "name": "gauge",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "burnAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "unstakeAndWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
export const CONVEX_BOOSTER_ADDRESS = { 1: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31", 42161: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31" }

export const convexBoosterAbi = [
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "poolInfo",
      "outputs": [
          {
              "internalType": "address",
              "name": "lptoken",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "token",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "gauge",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "crvRewards",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "stash",
              "type": "address"
          },
          {
              "internalType": "bool",
              "name": "shutdown",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "poolLength",
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
]
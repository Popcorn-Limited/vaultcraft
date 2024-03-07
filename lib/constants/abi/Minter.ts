export const MinterAbi = [
  {
    inputs: [
      {
        internalType: "contract ITokenAdmin",
        name: "tokenAdmin",
        type: "address",
      },
      {
        internalType: "contract IGaugeController",
        name: "gaugeController",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "gauge",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minted",
        type: "uint256",
      },
    ],
    name: "Minted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "minter",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "approval", type: "bool" },
    ],
    name: "MinterApprovalSet",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "minter", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "allowed_to_mint_for",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGaugeController",
    outputs: [
      { internalType: "contract IGaugeController", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "minter", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getMinterApproval",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenAdmin",
    outputs: [
      { internalType: "contract ITokenAdmin", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "gauge", type: "address" }],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "gauge", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "mintFor",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "gauges", type: "address[]" }],
    name: "mintMany",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "gauges", type: "address[]" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "mintManyFor",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "gauge", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "mint_for",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[8]", name: "gauges", type: "address[8]" },
    ],
    name: "mint_many",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "address", name: "gauge", type: "address" },
    ],
    name: "minted",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "minter", type: "address" },
      { internalType: "bool", name: "approval", type: "bool" },
    ],
    name: "setMinterApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "minter", type: "address" }],
    name: "toggle_approve_mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

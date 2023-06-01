import { readContracts } from "wagmi";
import { BigNumber } from "ethers";

export async function yearn({ chainId }: { chainId: number }): Promise<string[]> {
    const tokens: string[] = []

    const [ numTokens ] = await readContracts({
        contracts: [{
            address: "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804",
            abi: abiRegistry,
            functionName: "numTokens",
            chainId: 1337,
            args: []
        }]
    }) as BigNumber[]

    const registryTokens = await readContracts({
        contracts: Array(numTokens.toNumber()).map((item, idx) => {
            return {
                address: "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804",
                abi: abiRegistry,
                functionName: "tokens",
                chainId: 1337,
                args: [idx]
            }
        })
    }) as string[]

    const [ allDeployedVaults ] = await readContracts({
        contracts: [{
            address: "0x21b1FC8A52f179757bf555346130bF27c0C2A17A",
            abi: abiFactory,
            functionName: "allDeployedVaults",
            chainId: 1337,
            args: []
        }]
    }) as `0x${string}`[][]

    const factoryTokens = await readContracts({
        contracts: allDeployedVaults.map(item => {
            return {
                address: item,
                abi: abiVault,
                functionName: "token",
                chainId: 1337,
                args: []
            }
        })
    }) as string[]

    tokens.push(...registryTokens, ...factoryTokens)

    return tokens.filter((item, idx, arr) => arr.indexOf(item) === idx)
}



const abiRegistry = [
    {
        "name": "NewRelease",
        "inputs": [
            {
                "name": "release_id",
                "type": "uint256",
                "indexed": true
            },
            {
                "name": "template",
                "type": "address",
                "indexed": false
            },
            {
                "name": "api_version",
                "type": "string",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "NewVault",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "indexed": true
            },
            {
                "name": "vault_id",
                "type": "uint256",
                "indexed": true
            },
            {
                "name": "vault",
                "type": "address",
                "indexed": false
            },
            {
                "name": "api_version",
                "type": "string",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "NewExperimentalVault",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "indexed": true
            },
            {
                "name": "deployer",
                "type": "address",
                "indexed": true
            },
            {
                "name": "vault",
                "type": "address",
                "indexed": false
            },
            {
                "name": "api_version",
                "type": "string",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "NewGovernance",
        "inputs": [
            {
                "name": "governance",
                "type": "address",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "VaultTagged",
        "inputs": [
            {
                "name": "vault",
                "type": "address",
                "indexed": false
            },
            {
                "name": "tag",
                "type": "string",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "stateMutability": "nonpayable",
        "type": "constructor",
        "inputs": [],
        "outputs": []
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "tokens",
        "inputs": [
            {
                "name": "arg0",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "numTokens",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
];
const abiFactory = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_registry",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_convexStratImplementation",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_curveStratImplementation",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_convexFraxStratImplementation",
                "type": "address"
            },
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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "category",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "lpToken",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "gauge",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "vault",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "convexStrategy",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "curveStrategy",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "convexFraxStrategy",
                "type": "address"
            }
        ],
        "name": "NewAutomatedVault",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "allDeployedVaults",
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
];
const abiVault = [
    {
        "name": "Transfer",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "indexed": true
            },
            {
                "name": "receiver",
                "type": "address",
                "indexed": true
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "Approval",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "indexed": true
            },
            {
                "name": "spender",
                "type": "address",
                "indexed": true
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "Deposit",
        "inputs": [
            {
                "name": "recipient",
                "type": "address",
                "indexed": true
            },
            {
                "name": "shares",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "Withdraw",
        "inputs": [
            {
                "name": "recipient",
                "type": "address",
                "indexed": true
            },
            {
                "name": "shares",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "Sweep",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "indexed": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "LockedProfitDegradationUpdated",
        "inputs": [
            {
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyAdded",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "name": "debtRatio",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "minDebtPerHarvest",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "maxDebtPerHarvest",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "performanceFee",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyReported",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "name": "gain",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "loss",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "debtPaid",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "totalGain",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "totalLoss",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "totalDebt",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "debtAdded",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "debtRatio",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "FeeReport",
        "inputs": [
            {
                "name": "management_fee",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "performance_fee",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "strategist_fee",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "duration",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "WithdrawFromStrategy",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "name": "totalDebt",
                "type": "uint256",
                "indexed": false
            },
            {
                "name": "loss",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdateGovernance",
        "inputs": [
            {
                "name": "governance",
                "type": "address",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdateManagement",
        "inputs": [
            {
                "name": "management",
                "type": "address",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdateRewards",
        "inputs": [
            {
                "name": "rewards",
                "type": "address",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdateDepositLimit",
        "inputs": [
            {
                "name": "depositLimit",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdatePerformanceFee",
        "inputs": [
            {
                "name": "performanceFee",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdateManagementFee",
        "inputs": [
            {
                "name": "managementFee",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdateGuardian",
        "inputs": [
            {
                "name": "guardian",
                "type": "address",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "EmergencyShutdown",
        "inputs": [
            {
                "name": "active",
                "type": "bool",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "UpdateWithdrawalQueue",
        "inputs": [
            {
                "name": "queue",
                "type": "address[20]",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyUpdateDebtRatio",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "name": "debtRatio",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyUpdateMinDebtPerHarvest",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "name": "minDebtPerHarvest",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyUpdateMaxDebtPerHarvest",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "name": "maxDebtPerHarvest",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyUpdatePerformanceFee",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "name": "performanceFee",
                "type": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyMigrated",
        "inputs": [
            {
                "name": "oldVersion",
                "type": "address",
                "indexed": true
            },
            {
                "name": "newVersion",
                "type": "address",
                "indexed": true
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyRevoked",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyRemovedFromQueue",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "StrategyAddedToQueue",
        "inputs": [
            {
                "name": "strategy",
                "type": "address",
                "indexed": true
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "name": "NewPendingGovernance",
        "inputs": [
            {
                "name": "pendingGovernance",
                "type": "address",
                "indexed": true
            }
        ],
        "anonymous": false,
        "type": "event"
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "token",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
];
import { readContracts } from "wagmi";
import {BigNumber} from "ethers";

export async function yearn({ chainId }: { chainId: number }): Promise<string[]> {
    const tokens: string[] = []

    const numTokens = (await readContracts({
        contracts: [{
            address: "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804",
            abi: abiRegistry,
            functionName: "numReleases",
            chainId: 1337,
            args: []
        }]
    }) as BigNumber[])[0].toNumber()

    const registryTokens = await readContracts({
        contracts: [...Array(numTokens)].map((item, idx) => {
            return {
                address: "0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804",
                abi: abiRegistry,
                functionName: "tokens",
                chainId: 1337,
                args: [idx]
            }
        })
    }) as string[]

    tokens.push(...registryTokens)

    const allDeployedVaults = (await readContracts({
        contracts: [{
            address: "0x21b1FC8A52f179757bf555346130bF27c0C2A17A",
            abi: abiFactory,
            functionName: "allDeployedVaults",
            chainId: 1337,
            args: []
        }]
    }) as `0x${string}`[][])[0]

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

    tokens.push(...factoryTokens)

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
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setGovernance",
        "inputs": [
            {
                "name": "governance",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "acceptGovernance",
        "inputs": [],
        "outputs": []
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "latestRelease",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "latestVault",
        "inputs": [
            {
                "name": "token",
                "type": "address"
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
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "newRelease",
        "inputs": [
            {
                "name": "vault",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "newVault",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "guardian",
                "type": "address"
            },
            {
                "name": "rewards",
                "type": "address"
            },
            {
                "name": "name",
                "type": "string"
            },
            {
                "name": "symbol",
                "type": "string"
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
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "newVault",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "guardian",
                "type": "address"
            },
            {
                "name": "rewards",
                "type": "address"
            },
            {
                "name": "name",
                "type": "string"
            },
            {
                "name": "symbol",
                "type": "string"
            },
            {
                "name": "releaseDelta",
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
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "newExperimentalVault",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "governance",
                "type": "address"
            },
            {
                "name": "guardian",
                "type": "address"
            },
            {
                "name": "rewards",
                "type": "address"
            },
            {
                "name": "name",
                "type": "string"
            },
            {
                "name": "symbol",
                "type": "string"
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
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "newExperimentalVault",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "governance",
                "type": "address"
            },
            {
                "name": "guardian",
                "type": "address"
            },
            {
                "name": "rewards",
                "type": "address"
            },
            {
                "name": "name",
                "type": "string"
            },
            {
                "name": "symbol",
                "type": "string"
            },
            {
                "name": "releaseDelta",
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
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "endorseVault",
        "inputs": [
            {
                "name": "vault",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "endorseVault",
        "inputs": [
            {
                "name": "vault",
                "type": "address"
            },
            {
                "name": "releaseDelta",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setBanksy",
        "inputs": [
            {
                "name": "tagger",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setBanksy",
        "inputs": [
            {
                "name": "tagger",
                "type": "address"
            },
            {
                "name": "allowed",
                "type": "bool"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "tagVault",
        "inputs": [
            {
                "name": "vault",
                "type": "address"
            },
            {
                "name": "tag",
                "type": "string"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "numReleases",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "releases",
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
        "name": "numVaults",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "vaults",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            },
            {
                "name": "arg1",
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
    {
        "stateMutability": "view",
        "type": "function",
        "name": "isRegistered",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "governance",
        "inputs": [],
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
        "name": "pendingGovernance",
        "inputs": [],
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
        "name": "tags",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "banksy",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    }
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
        "name": "CATEGORY",
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
        "name": "CVX",
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
        "name": "acceptOwner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
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
    {
        "inputs": [],
        "name": "baseFeeOracle",
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
        "name": "booster",
        "outputs": [
            {
                "internalType": "contract IBooster",
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
                "internalType": "address",
                "name": "_gauge",
                "type": "address"
            }
        ],
        "name": "canCreateVaultPermissionlessly",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "convexFraxPoolRegistry",
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
        "name": "convexFraxStratImplementation",
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
        "name": "convexPoolManager",
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
        "name": "convexStratImplementation",
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
        "name": "convexVoter",
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
                "internalType": "address",
                "name": "_gauge",
                "type": "address"
            }
        ],
        "name": "createNewVaultsAndStrategies",
        "outputs": [
            {
                "internalType": "address",
                "name": "vault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "convexStrategy",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "curveStrategy",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "convexFraxStrategy",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_gauge",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_symbol",
                "type": "string"
            }
        ],
        "name": "createNewVaultsAndStrategiesPermissioned",
        "outputs": [
            {
                "internalType": "address",
                "name": "vault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "convexStrategy",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "curveStrategy",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "convexFraxStrategy",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "curveStratImplementation",
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
        "name": "curveVoter",
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
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "deployedVaults",
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
        "name": "depositLimit",
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
                "name": "_gauge",
                "type": "address"
            }
        ],
        "name": "doesStrategyProxyHaveGauge",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fraxBooster",
        "outputs": [
            {
                "internalType": "contract IBooster",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fraxVoter",
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
                "internalType": "uint256",
                "name": "_convexPid",
                "type": "uint256"
            }
        ],
        "name": "getFraxInfo",
        "outputs": [
            {
                "internalType": "bool",
                "name": "hasFraxPool",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "convexFraxPid",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "stakingAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_gauge",
                "type": "address"
            }
        ],
        "name": "getPid",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "pid",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getProxy",
        "outputs": [
            {
                "internalType": "address",
                "name": "proxy",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "governance",
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
        "name": "guardian",
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
        "name": "harvestProfitMaxInUsdc",
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
        "name": "harvestProfitMinInUsdc",
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
        "name": "healthCheck",
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
        "name": "keepCRV",
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
        "name": "keepCVX",
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
        "name": "keepFXS",
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
        "name": "keeper",
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
                "internalType": "address",
                "name": "_gauge",
                "type": "address"
            }
        ],
        "name": "latestStandardVaultFromGauge",
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
        "name": "management",
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
        "name": "managementFee",
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
        "name": "numVaults",
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
        "inputs": [],
        "name": "pendingOwner",
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
        "name": "registry",
        "outputs": [
            {
                "internalType": "contract IRegistry",
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
                "internalType": "address",
                "name": "_baseFeeOracle",
                "type": "address"
            }
        ],
        "name": "setBaseFeeOracle",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_booster",
                "type": "address"
            }
        ],
        "name": "setBooster",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_convexFraxPoolRegistry",
                "type": "address"
            }
        ],
        "name": "setConvexFraxPoolRegistry",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_convexFraxStratImplementation",
                "type": "address"
            }
        ],
        "name": "setConvexFraxStratImplementation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_convexPoolManager",
                "type": "address"
            }
        ],
        "name": "setConvexPoolManager",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_convexStratImplementation",
                "type": "address"
            }
        ],
        "name": "setConvexStratImplementation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_curveStratImplementation",
                "type": "address"
            }
        ],
        "name": "setCurveStratImplementation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_depositLimit",
                "type": "uint256"
            }
        ],
        "name": "setDepositLimit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_fraxBooster",
                "type": "address"
            }
        ],
        "name": "setFraxBooster",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_governance",
                "type": "address"
            }
        ],
        "name": "setGovernance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_guardian",
                "type": "address"
            }
        ],
        "name": "setGuardian",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_harvestProfitMaxInUsdc",
                "type": "uint256"
            }
        ],
        "name": "setHarvestProfitMaxInUsdc",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_harvestProfitMinInUsdc",
                "type": "uint256"
            }
        ],
        "name": "setHarvestProfitMinInUsdc",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_health",
                "type": "address"
            }
        ],
        "name": "setHealthcheck",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_keepCRV",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_curveVoter",
                "type": "address"
            }
        ],
        "name": "setKeepCRV",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_keepCVX",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_convexVoter",
                "type": "address"
            }
        ],
        "name": "setKeepCVX",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_keepFXS",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_fraxVoter",
                "type": "address"
            }
        ],
        "name": "setKeepFXS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_keeper",
                "type": "address"
            }
        ],
        "name": "setKeeper",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_management",
                "type": "address"
            }
        ],
        "name": "setManagement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_managementFee",
                "type": "uint256"
            }
        ],
        "name": "setManagementFee",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "name": "setOwner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_performanceFee",
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
                "internalType": "address",
                "name": "_registry",
                "type": "address"
            }
        ],
        "name": "setRegistry",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tradeFactory",
                "type": "address"
            }
        ],
        "name": "setTradeFactory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_treasury",
                "type": "address"
            }
        ],
        "name": "setTreasury",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tradeFactory",
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
        "name": "treasury",
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
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "initialize",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "governance",
                "type": "address"
            },
            {
                "name": "rewards",
                "type": "address"
            },
            {
                "name": "nameOverride",
                "type": "string"
            },
            {
                "name": "symbolOverride",
                "type": "string"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "initialize",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "governance",
                "type": "address"
            },
            {
                "name": "rewards",
                "type": "address"
            },
            {
                "name": "nameOverride",
                "type": "string"
            },
            {
                "name": "symbolOverride",
                "type": "string"
            },
            {
                "name": "guardian",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "initialize",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "governance",
                "type": "address"
            },
            {
                "name": "rewards",
                "type": "address"
            },
            {
                "name": "nameOverride",
                "type": "string"
            },
            {
                "name": "symbolOverride",
                "type": "string"
            },
            {
                "name": "guardian",
                "type": "address"
            },
            {
                "name": "management",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "pure",
        "type": "function",
        "name": "apiVersion",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "DOMAIN_SEPARATOR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setName",
        "inputs": [
            {
                "name": "name",
                "type": "string"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setSymbol",
        "inputs": [
            {
                "name": "symbol",
                "type": "string"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setGovernance",
        "inputs": [
            {
                "name": "governance",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "acceptGovernance",
        "inputs": [],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setManagement",
        "inputs": [
            {
                "name": "management",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setRewards",
        "inputs": [
            {
                "name": "rewards",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setLockedProfitDegradation",
        "inputs": [
            {
                "name": "degradation",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setDepositLimit",
        "inputs": [
            {
                "name": "limit",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setPerformanceFee",
        "inputs": [
            {
                "name": "fee",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setManagementFee",
        "inputs": [
            {
                "name": "fee",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setGuardian",
        "inputs": [
            {
                "name": "guardian",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setEmergencyShutdown",
        "inputs": [
            {
                "name": "active",
                "type": "bool"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setWithdrawalQueue",
        "inputs": [
            {
                "name": "queue",
                "type": "address[20]"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transfer",
        "inputs": [
            {
                "name": "receiver",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transferFrom",
        "inputs": [
            {
                "name": "sender",
                "type": "address"
            },
            {
                "name": "receiver",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "approve",
        "inputs": [
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "increaseAllowance",
        "inputs": [
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "decreaseAllowance",
        "inputs": [
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "permit",
        "inputs": [
            {
                "name": "owner",
                "type": "address"
            },
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            },
            {
                "name": "expiry",
                "type": "uint256"
            },
            {
                "name": "signature",
                "type": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "totalAssets",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "deposit",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "deposit",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "deposit",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256"
            },
            {
                "name": "recipient",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "maxAvailableShares",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw",
        "inputs": [
            {
                "name": "maxShares",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw",
        "inputs": [
            {
                "name": "maxShares",
                "type": "uint256"
            },
            {
                "name": "recipient",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw",
        "inputs": [
            {
                "name": "maxShares",
                "type": "uint256"
            },
            {
                "name": "recipient",
                "type": "address"
            },
            {
                "name": "maxLoss",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "pricePerShare",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "addStrategy",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            },
            {
                "name": "debtRatio",
                "type": "uint256"
            },
            {
                "name": "minDebtPerHarvest",
                "type": "uint256"
            },
            {
                "name": "maxDebtPerHarvest",
                "type": "uint256"
            },
            {
                "name": "performanceFee",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "updateStrategyDebtRatio",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            },
            {
                "name": "debtRatio",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "updateStrategyMinDebtPerHarvest",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            },
            {
                "name": "minDebtPerHarvest",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "updateStrategyMaxDebtPerHarvest",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            },
            {
                "name": "maxDebtPerHarvest",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "updateStrategyPerformanceFee",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            },
            {
                "name": "performanceFee",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "migrateStrategy",
        "inputs": [
            {
                "name": "oldVersion",
                "type": "address"
            },
            {
                "name": "newVersion",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "revokeStrategy",
        "inputs": [],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "revokeStrategy",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "addStrategyToQueue",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "removeStrategyFromQueue",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "debtOutstanding",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "debtOutstanding",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "creditAvailable",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "creditAvailable",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "availableDepositLimit",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "expectedReturn",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "expectedReturn",
        "inputs": [
            {
                "name": "strategy",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "report",
        "inputs": [
            {
                "name": "gain",
                "type": "uint256"
            },
            {
                "name": "loss",
                "type": "uint256"
            },
            {
                "name": "_debtPayment",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "sweep",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "sweep",
        "inputs": [
            {
                "name": "token",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "decimals",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "balanceOf",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "allowance",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            },
            {
                "name": "arg1",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
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
    {
        "stateMutability": "view",
        "type": "function",
        "name": "governance",
        "inputs": [],
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
        "name": "management",
        "inputs": [],
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
        "name": "guardian",
        "inputs": [],
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
        "name": "strategies",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "components": [
                    {
                        "name": "performanceFee",
                        "type": "uint256"
                    },
                    {
                        "name": "activation",
                        "type": "uint256"
                    },
                    {
                        "name": "debtRatio",
                        "type": "uint256"
                    },
                    {
                        "name": "minDebtPerHarvest",
                        "type": "uint256"
                    },
                    {
                        "name": "maxDebtPerHarvest",
                        "type": "uint256"
                    },
                    {
                        "name": "lastReport",
                        "type": "uint256"
                    },
                    {
                        "name": "totalDebt",
                        "type": "uint256"
                    },
                    {
                        "name": "totalGain",
                        "type": "uint256"
                    },
                    {
                        "name": "totalLoss",
                        "type": "uint256"
                    }
                ]
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "withdrawalQueue",
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
        "name": "emergencyShutdown",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "depositLimit",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "debtRatio",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "totalIdle",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "totalDebt",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "lastReport",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "activation",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "lockedProfit",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "lockedProfitDegradation",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "rewards",
        "inputs": [],
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
        "name": "managementFee",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "performanceFee",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "nonces",
        "inputs": [
            {
                "name": "arg0",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ]
    }
];
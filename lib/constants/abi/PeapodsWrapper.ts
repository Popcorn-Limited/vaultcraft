export const PeapodsProxyAbi = [
    {
        inputs: [
            { internalType: "address", name: "_v2Router", type: "address" },
            { internalType: "contract IV3TwapUtilities", name: "_v3TwapUtilities", type: "address" }
        ],
        stateMutability: "nonpayable", type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
            { indexed: true, internalType: "address", name: "newOwner", type: "address" }
        ],
        name: "OwnershipTransferred", type: "event"
    },
    {
        inputs: [
            { internalType: "contract IDecentralizedIndex", name: "_indexFund", type: "address" },
            { internalType: "uint256", name: "_amountIdxTokens", type: "uint256" },
            { internalType: "address", name: "_pairedLpTokenProvided", type: "address" },
            { internalType: "uint256", name: "_amtPairedLpTokenProvided", type: "uint256" },
            { internalType: "uint256", name: "_amountPairedLpTokenMin", type: "uint256" },
            { internalType: "uint256", name: "_slippage", type: "uint256" },
            { internalType: "uint256", name: "_deadline", type: "uint256" }],
        name: "addLPAndStake",
        outputs: [],
        stateMutability: "payable", type: "function"
    },
    {
        inputs: [
            { internalType: "contract IDecentralizedIndex", name: "_indexFund", type: "address" },
            { internalType: "address", name: "_token", type: "address" },
            { internalType: "uint256", name: "_amount", type: "uint256" },
            { internalType: "uint256", name: "_amountMintMin", type: "uint256" }
        ],
        name: "bond",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "contract IDecentralizedIndex", name: "_indexFund", type: "address" },
            { internalType: "uint256", name: "_assetIdx", type: "uint256" },
            { internalType: "uint256", name: "_amountTokensForAssetIdx", type: "uint256" },
            { internalType: "uint256", name: "_amountMintMin", type: "uint256" },
            { internalType: "uint256", name: "_amountPairedLpTokenMin", type: "uint256" },
            { internalType: "uint256", name: "_slippage", type: "uint256" },
            { internalType: "uint256", name: "_deadline", type: "uint256" },
            { internalType: "bool", name: "_stakeAsWell", type: "bool" }
        ],
        name: "bondWeightedFromNative",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address[]", name: "_rewards", type: "address[]" }
        ],
        name: "claimRewardsMulti",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" }
        ],
        name: "curveTokenIdx",
        outputs: [
            { internalType: "int128", name: "", type: "int128" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            { internalType: "address", name: "", type: "address" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "pOHM",
        outputs: [
            { internalType: "address", name: "", type: "address" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "contract IERC20", name: "_token", type: "address" }
        ],
        name: "rescueERC20",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "rescueETH",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "_pOHM", type: "address" }
        ],
        name: "setPOHM",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "_slip", type: "uint256" }
        ],
        name: "setSlippage",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "_in", type: "address" },
            { internalType: "address", name: "_out", type: "address" },
            {
                components:
                    [
                        { internalType: "enum IZapper.PoolType", name: "poolType", type: "uint8" },
                        { internalType: "address", name: "pool1", type: "address" },
                        { internalType: "address", name: "pool2", type: "address" }
                    ],
                internalType: "struct IZapper.Pools",
                name: "_pools",
                type: "tuple"
            }
        ],
        name: "setZapMap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "enum IZapper.PoolType",
                name: "_type",
                type: "uint8"
            },
            {
                internalType: "address",
                name: "_pool",
                type: "address"
            }
        ],
        name: "setZapMapFromPoolSingle",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "newOwner", type: "address" }
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "contract IDecentralizedIndex", name: "_indexFund", type: "address" },
            { internalType: "uint256", name: "_amountStakedTokens", type: "uint256" },
            { internalType: "uint256", name: "_minLPTokens", type: "uint256" },
            { internalType: "uint256", name: "_minPairedLpToken", type: "uint256" },
            { internalType: "uint256", name: "_deadline", type: "uint256" }
        ],
        name: "unstakeAndRemoveLP",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" }
        ], name: "zapMap",
        outputs: [
            { internalType: "enum IZapper.PoolType", name: "poolType", type: "uint8" },
            { internalType: "address", name: "pool1", type: "address" },
            { internalType: "address", name: "pool2", type: "address" }
        ], stateMutability: "view", type: "function"
    },
    {
        stateMutability: "payable", type: "receive"
    }
] as const;

export const PeapodsPodAbi = [
    {
        inputs: [
            { internalType: "string", name: "_name", type: "string" },
            { internalType: "string", name: "_symbol", type: "string" },
            {
                components: [
                    { internalType: "address", name: "partner", type: "address" },
                    { internalType: "bool", name: "hasTransferTax", type: "bool" },
                    { internalType: "bool", name: "blacklistTKNpTKNPoolV2", type: "bool" }
                ],
                internalType: "struct IDecentralizedIndex.Config", name: "_config", type: "tuple"
            },
            {
                components: [{ internalType: "uint16", name: "burn", type: "uint16" }, { internalType: "uint16", name: "bond", type: "uint16" }, { internalType: "uint16", name: "debond", type: "uint16" },
                { internalType: "uint16", name: "buy", type: "uint16" }, { internalType: "uint16", name: "sell", type: "uint16" }, { internalType: "uint16", name: "partner", type: "uint16" }
                ],
                internalType: "struct IDecentralizedIndex.Fees", name: "_fees", type: "tuple"
            },
            { internalType: "address[]", name: "_tokens", type: "address[]" }, { internalType: "uint256[]", name: "_weights", type: "uint256[]" }, { internalType: "address", name: "_pairedLpToken", type: "address" },
            { internalType: "address", name: "_lpRewardsToken", type: "address" }, { internalType: "address", name: "_dexHandler", type: "address" }, { internalType: "bool", name: "_stakeRestriction", type: "bool" }],
        stateMutability: "nonpayable", type: "constructor"
    },
    { inputs: [], name: "InvalidShortString", type: "error" },
    {
        inputs: [
            { internalType: "string", name: "str", type: "string" }], name: "StringTooLong", type: "error"
    }, 
    {
        anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "wallet", type: "address" },
        { indexed: false, internalType: "uint256", name: "amountTokens", type: "uint256" },
        { indexed: false, internalType: "uint256", name: "amountDAI", type: "uint256" }], name: "AddLiquidity", type: "event"
    },
    {
        anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "owner", type: "address" },
        { indexed: true, internalType: "address", name: "spender", type: "address" }, { indexed: false, internalType: "uint256", name: "value", type: "uint256" }], name: "Approval", type: "event"
    },
    {
        anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "wallet", type: "address" }, { indexed: true, internalType: "address", name: "token", type: "address" },
        { indexed: false, internalType: "uint256", name: "amountTokensBonded", type: "uint256" },
        { indexed: false, internalType: "uint256", name: "amountTokensMinted", type: "uint256" }], name: "Bond", type: "event"
    },
    {
        anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "newIdx", type: "address" },
        { indexed: true, internalType: "address", name: "wallet", type: "address" }], name: "Create", type: "event"
    },
    {
        anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "wallet", type: "address" },
        { indexed: false, internalType: "uint256", name: "amountDebonded", type: "uint256" }], name: "Debond", type: "event"
    }, 
    { anonymous: false, inputs: [], name: "EIP712DomainChanged", type: "event" }, {
        anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "executor", type: "address" },
        { indexed: true, internalType: "address", name: "recipient", type: "address" }, { indexed: false, internalType: "address", name: "token", type: "address" }, { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }], name: "FlashLoan", type: "event"
    }, 
    { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "wallet", type: "address" }, 
        { indexed: false, internalType: "address", name: "v2Pool", type: "address" }], name: "Initialize", type: "event" }, 
    { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "wallet", type: "address" }, 
        { indexed: false, internalType: "uint256", name: "amountLiquidity", type: "uint256" }], name: "RemoveLiquidity", type: "event" }, 
    { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "wallet", type: "address" }, 
        { indexed: false, internalType: "address", name: "newPartner", type: "address" }], name: "SetPartner", type: "event" }, 
    { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "wallet", type: "address" }, 
        { indexed: false, internalType: "uint16", name: "newFee", type: "uint16" }], name: "SetPartnerFee", type: "event" }, 
    { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "from", type: "address" }, 
        { indexed: true, internalType: "address", name: "to", type: "address" }, 
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" }], name: "Transfer", type: "event" }, 
        { inputs: [], name: "BOND_FEE", outputs: [{ internalType: "uint16", name: "", type: "uint16" }], stateMutability: "view", type: "function" }, 
        { inputs: [], name: "DEBOND_FEE", outputs: [{ internalType: "uint16", name: "", type: "uint16" }], stateMutability: "view", type: "function" }, 
        { inputs: [], name: "DEX_HANDLER", outputs: [{ internalType: "contract IDexAdapter", name: "", type: "address" }], stateMutability: "view", type: "function" }, 
        { inputs: [], name: "DOMAIN_SEPARATOR", outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }], stateMutability: "view", type: "function" }, 
        { inputs: [], name: "FLASH_FEE_AMOUNT_DAI", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, 
        { inputs: [], name: "PAIRED_LP_TOKEN", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, 
        { inputs: [{ internalType: "uint256", name: "_idxLPTokens", type: "uint256" }, { internalType: "uint256", name: "_pairedLPTokens", type: "uint256" }, 
            { internalType: "uint256", name: "_slippage", type: "uint256" }, 
            { internalType: "uint256", name: "_deadline", type: "uint256" }], name: "addLiquidityV2", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "nonpayable", type: "function" }, 
            { inputs: [{ internalType: "address", name: "owner", type: "address" }, 
                { internalType: "address", name: "spender", type: "address" }], name: "allowance", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, 
            { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "amount", type: "uint256" }], name: "approve", outputs: [{ internalType: "bool", name: "", type: "bool" }], 
            stateMutability: "nonpayable", type: "function" }, 
            { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, 
            { inputs: [{ internalType: "address", name: "_token", type: "address" }, { internalType: "uint256", name: "_amount", type: "uint256" }, { internalType: "uint256", name: "_amountMintMin", type: "uint256" }], 
            name: "bond", outputs: [], stateMutability: "nonpayable", type: "function" }, 
            { inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }], 
            name: "burn", outputs: [], stateMutability: "nonpayable", type: "function" }, 
            { inputs: [], name: "config", outputs: [{ internalType: "address", name: "partner", type: "address" }, 
                { internalType: "bool", name: "hasTransferTax", type: "bool" }, { internalType: "bool", name: "blacklistTKNpTKNPoolV2", type: "bool" }], stateMutability: "view", type: "function" }, 
                { inputs: [], name: "created", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, 
                { inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }, { internalType: "address[]", name: "", type: "address[]" }, 
                    { internalType: "uint8[]", name: "", type: "uint8[]" }], name: "debond", outputs: [], stateMutability: "nonpayable", type: "function" }, 
                    { inputs: [], name: "decimals", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" }, 
                    { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "subtractedValue", type: "uint256" }], name: "decreaseAllowance", outputs: [
                        { internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }, 
                        { inputs: [], name: "eip712Domain", outputs: [
                            { internalType: "bytes1", name: "fields", type: "bytes1" }, { internalType: "string", name: "name", type: "string" }, { internalType: "string", name: "version", type: "string" }, { internalType: "uint256", name: "chainId", type: "uint256" }, { internalType: "address", name: "verifyingContract", type: "address" }, { internalType: "bytes32", name: "salt", type: "bytes32" }, { internalType: "uint256[]", name: "extensions", type: "uint256[]" }], stateMutability: "view", type: "function" }, { inputs: [], name: "fees", outputs: [{ internalType: "uint16", name: "burn", type: "uint16" }, { internalType: "uint16", name: "bond", type: "uint16" }, { internalType: "uint16", name: "debond", type: "uint16" }, { internalType: "uint16", name: "buy", type: "uint16" }, { internalType: "uint16", name: "sell", type: "uint16" }, { internalType: "uint16", name: "partner", type: "uint16" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "_recipient", type: "address" }, { internalType: "address", name: "_token", type: "address" }, { internalType: "uint256", name: "_amount", type: "uint256" }, { internalType: "bytes", name: "_data", type: "bytes" }], name: "flash", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "getAllAssets", outputs: [{ components: [{ internalType: "address", name: "token", type: "address" }, { internalType: "uint256", name: "weighting", type: "uint256" }, { internalType: "uint256", name: "basePriceUSDX96", type: "uint256" }, { internalType: "address", name: "c1", type: "address" }, { internalType: "uint256", name: "q1", type: "uint256" }], internalType: "struct IDecentralizedIndex.IndexAssetInfo[]", name: "", type: "tuple[]" }], stateMutability: "view", type: "function" }, { inputs: [], name: "getIdxPriceUSDX96", outputs: [{ internalType: "uint256", name: "", type: "uint256" }, { internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "_sourceToken", type: "address" }, { internalType: "uint256", name: "_sourceAmount", type: "uint256" }, { internalType: "address", name: "_targetToken", type: "address" }], name: "getInitialAmount", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "_token", type: "address" }], name: "getTokenPriceUSDX96", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "addedValue", type: "uint256" }], name: "increaseAllowance", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "uint256", name: "", type: "uint256" }], name: "indexTokens", outputs: [{ internalType: "address", name: "token", type: "address" }, { internalType: "uint256", name: "weighting", type: "uint256" }, { internalType: "uint256", name: "basePriceUSDX96", type: "uint256" }, { internalType: "address", name: "c1", type: "address" }, { internalType: "uint256", name: "q1", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [], name: "indexType", outputs: [{ internalType: "enum IDecentralizedIndex.IndexType", name: "", type: "uint8" }], stateMutability: "view", type: "function" }, { inputs: [], name: "initialize", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "_token", type: "address" }], name: "isAsset", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" }, { inputs: [], name: "lpRewardsToken", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, { inputs: [], name: "lpStakingPool", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "uint256", name: "_slip", type: "uint256" }], name: "manualProcessFee", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "nonces", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [], name: "partner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "owner", type: "address" }, { internalType: "address", name: "spender", type: "address" }, { internalType: "uint256", name: "value", type: "uint256" }, { internalType: "uint256", name: "deadline", type: "uint256" }, { internalType: "uint8", name: "v", type: "uint8" }, { internalType: "bytes32", name: "r", type: "bytes32" }, { internalType: "bytes32", name: "s", type: "bytes32" }], name: "permit", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "processPreSwapFeesAndSwap", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "uint256", name: "_lpTokens", type: "uint256" }, { internalType: "uint256", name: "_minIdxTokens", type: "uint256" }, { internalType: "uint256", name: "_minPairedLpToken", type: "uint256" }, { internalType: "uint256", name: "_deadline", type: "uint256" }], name: "removeLiquidityV2", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "_token", type: "address" }], name: "rescueERC20", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "rescueETH", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "address", name: "_partner", type: "address" }], name: "setPartner", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [{ internalType: "uint16", name: "_fee", type: "uint16" }], name: "setPartnerFee", outputs: [], stateMutability: "nonpayable", type: "function" }, { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }, { inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [{ internalType: "address", name: "to", type: "address" }, { internalType: "uint256", name: "amount", type: "uint256" }], name: "transfer", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" }, 
    {
        inputs: [{ internalType: "address", name: "from", type: "address" }, 
            { internalType: "address", name: "to", type: "address" }, 
            { internalType: "uint256", name: "amount", type: "uint256" }
        ], name: "transferFrom", outputs: [
            { internalType: "bool", name: "", type: "bool" }
        ],
        stateMutability: "nonpayable", type: "function"
    }
] as const;
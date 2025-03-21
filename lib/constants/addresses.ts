import { Address, zeroAddress } from "viem";
import { AddressByChain } from "@/lib/types";
import { mainnet, arbitrum, aurora, avalanche, bsc, fantom, optimism, polygon, xLayer, fraxtal, base, hemi } from "viem/chains";

export const VCX: Address = "0xcE246eEa10988C495B4A90a905Ee9237a0f91543";
export const VCX_LP: Address = "0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920";
export const VE_VCX: Address = "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A";
export const ST_VCX: Address = "0xE5d383FC43F6c370DdD3975cf9e363Ad42367697";
export const POP: Address = "0xD0Cd466b34A24fcB2f87676278AF2005Ca8A78c4";
export const VCX_POOL: Address = "0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920"; // Same as VCX_LP
export const OVCX_ORACLE: Address = "0xe2871224b413F55c5a2Fd21E49bD63A52e339b03";
export const VE_BOOST: Address = "0xa2E88993a0f0dc6e6020431477f3A70c86109bBf";
export const VE_DELEGATION: Address = "0xafE32869CAf311585647ADcD79050B83DbCF94C8";
export const MINTER: Address = "0x49f095B38eE6d8541758af51c509332e7793D4b0";
export const TOKEN_ADMIN: Address = "0x03d103c547B43b5a76df7e652BD0Bb61bE0BD70d";
export const VOTING_ESCROW: Address = "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A"; // Same as VE_VCX
export const GAUGE_CONTROLLER: Address = "0xD57d8EEC36F0Ba7D8Fd693B9D97e02D8353EB1F4";
export const GAUGE_FACTORY: Address = "0x8133cA3AB91B3FE3792992eA69720Ca6d3A92163";
export const SMART_WALLET_CHECKER: Address = "0x8427155770f7e6b973249E2f9D140a495aBE4f90";
export const VE_BEACON: Address = "0x6e220Be8511ACc1db8ACD4e2e66f987CF7529Af6";
export const FEE_DISTRIBUTOR = zeroAddress; // Change once deployed
export const ROOT_GAUGE_FACTORY: Address = "0x6aa03ebAb1e9CB8d44Fd79153d3a258FFd48169A"

export const VAULTRON: Address = "0x590e3A9260ffb7887ffD54A57d1FACf7db59c751"

export const FEE_RECIPIENT_PROXY: Address = "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E" // Is the same on all deployed chains

export const RS_ETH_ADAPTER: Address = "0x31CCeA38DaFdd20082645937f7235BCDC5aaaac2"

export const VaultRouterByChain: AddressByChain = {
  [mainnet.id]: "0x4995F3bb85E1381D02699e2164bC1C6c6Fa243cd",
  [optimism.id]: "0x3828845F4d7212b6a0Dc3D67482AFf4544002919",
  [arbitrum.id]: "0x48943F145686bF5c4580D545CDA405844D1f777b",
  [xLayer.id]: zeroAddress,
  [base.id]: "0x44874B65503bC48b950a5251C31D8C8e1e74b467",
  [fraxtal.id]: "0x44874B65503bC48b950a5251C31D8C8e1e74b467",
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const AsyncRouterByChain: AddressByChain = {
  [mainnet.id]: "0x7902c757a4A4B44C3B271Ce2f0c2A575C6D5f57A",
  [optimism.id]: "0x7902c757a4A4B44C3B271Ce2f0c2A575C6D5f57A",
  [arbitrum.id]: "0x7902c757a4A4B44C3B271Ce2f0c2A575C6D5f57A",
  [xLayer.id]: zeroAddress,
  [base.id]: "0x7902c757a4A4B44C3B271Ce2f0c2A575C6D5f57A",
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: "0x7902c757a4A4B44C3B271Ce2f0c2A575C6D5f57A",
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const VeRecipientByChain: AddressByChain = {
  [optimism.id]: "0xC1A6Db6793967Ff7fb7f211E044A4c285A0eB7FB",
  [arbitrum.id]: "0xC1A6Db6793967Ff7fb7f211E044A4c285A0eB7FB",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const VeTokenByChain: AddressByChain = {
  [mainnet.id]: VE_VCX,
  [optimism.id]: VeRecipientByChain[10],
  [arbitrum.id]: VeRecipientByChain[42161],
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const OptionTokenByChain: AddressByChain = {
  [mainnet.id]: "0xaFa52E3860b4371ab9d8F08E801E9EA1027C0CA2",
  [optimism.id]: "0xD41d34d6b50785fDC025caD971fE940B8AA1bE45",
  [arbitrum.id]: "0x59a696bF34Eae5AD8Fd472020e3Bed410694a230",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const WVCXByChain: AddressByChain = {
  [mainnet.id]: "0x18445923592be303fbd3BC164ee685C7457051b4",
  [optimism.id]: "0x43Ad2CFDDA3CEFf40d832eB9bc33eC3FACE86829",
  [arbitrum.id]: "0xFeae6470A79b7779888f4a64af315Ca997D6cF33",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const VcxByChain: AddressByChain = {
  [mainnet.id]: VCX,
  [optimism.id]: WVCXByChain[optimism.id],
  [arbitrum.id]: WVCXByChain[arbitrum.id],
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const GaugeFactoryByChain: AddressByChain = {
  [mainnet.id]: "0x8133cA3AB91B3FE3792992eA69720Ca6d3A92163",
  [optimism.id]: "0x6aa03ebAb1e9CB8d44Fd79153d3a258FFd48169A", // Same as Minter
  [arbitrum.id]: "0x6aa03ebAb1e9CB8d44Fd79153d3a258FFd48169A", // Same as Minter
  [xLayer.id]: zeroAddress,
  [base.id]: "0x6aa03ebAb1e9CB8d44Fd79153d3a258FFd48169A", // Same as Minter
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const MinterByChain: AddressByChain = {
  [mainnet.id]: "0x49f095B38eE6d8541758af51c509332e7793D4b0",
  [optimism.id]: "0x6aa03ebAb1e9CB8d44Fd79153d3a258FFd48169A", // Same as GaugeFactory
  [arbitrum.id]: "0x6aa03ebAb1e9CB8d44Fd79153d3a258FFd48169A", // Same as GaugeFactory
  [xLayer.id]: zeroAddress,
  [base.id]: "0x6aa03ebAb1e9CB8d44Fd79153d3a258FFd48169A", // Same as GaugeFactory
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const BridgerByDestination: AddressByChain = {
  [optimism.id]: "0xae167C59FB601260A317A803b5879D47621b1379",
  [arbitrum.id]: "0x44E6FD99a6df3E3D1792a71C1575519293894Ee2",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const LockboxAdapterByChain: AddressByChain = {
  [mainnet.id]: "0x45bf3c737e57b059a5855280ca1adb8e9606ac68",
  [optimism.id]: "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA",
  [arbitrum.id]: "0xEE9deC2712cCE65174B561151701Bf54b99C24C8",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const ExerciseByChain: AddressByChain = {
  [mainnet.id]: OptionTokenByChain[mainnet.id],
  [optimism.id]: "0x925Efe4B78a823d6AB22Ac5894516b898293a9E5",
  [arbitrum.id]: "0x89DC6A4549AFc3f9B111b0059d520Fd66cD510B7",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const ExerciseOracleByChain: AddressByChain = {
  [mainnet.id]: OVCX_ORACLE,
  [optimism.id]: "0x8Ee82Ad9919b7D272A732479305133B205dA297F",
  [arbitrum.id]: "0x8Ee82Ad9919b7D272A732479305133B205dA297F",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const ExerciseOracleOwnerByChain: AddressByChain = {
  [optimism.id]: "0xa03fc60b0EdC2b1F99Df84193BD392d1CD84a7dA",
  [arbitrum.id]: "0xe14b718e95699B40dc0E17b2061d8ee11d75709A",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const AssetPushOracleByChain: AddressByChain = {
  [mainnet.id]: "0xb3404F101F11A14988c4111E30006972EdbB99aB",
  [optimism.id]: "0xBe793893475073E7E403F4E206c304402Ca26d84",
  [arbitrum.id]: "0x3a7e41AdA7066109E2ebbb33921dd8a124d54B01",
  [xLayer.id]: zeroAddress,
  [base.id]: "0xe8f047DC264D62288BF16a0aD7Ff158ddfd14913",
  [fraxtal.id]: "0xe8f047DC264D62288BF16a0aD7Ff158ddfd14913",
  [avalanche.id]: "0x9bb694F1205d69BEF07367d77Fd07e2c30a5d8fc",
  [polygon.id]: "0x4d36fB416fd3287ECFCE367c64057F4ba6EFC20d",
  [bsc.id]: zeroAddress,
}

export const AssetPushOracleOwnerByChain: AddressByChain = {
  [mainnet.id]: "0x8A8A73B111e5fc0048a179a5d7DbC3BcA08D1EF4",
  [optimism.id]: "0x0f16B4F10Bc3C31169b5d5B6AEb69835E710c6Bd",
  [arbitrum.id]: "0x86f8d1C5dBd755854C1820592f2D8383FC374695",
  [xLayer.id]: zeroAddress,
  [base.id]: "0xD0Bc541E7c558cA50c33C4166a63ED2b899d2C70",
  [fraxtal.id]: "0xD0Bc541E7c558cA50c33C4166a63ED2b899d2C70",
  [avalanche.id]: "0x50206eD4578C325E3308ed6ff51B0DA920448777",
  [polygon.id]: "0x067e4c15B052C73998689D7A0e19D0B2910819dc",
  [bsc.id]: zeroAddress,
}

export const VaultOracleByChain: AddressByChain = {
  [mainnet.id]: "0x31f687C0F28bB10b0296DE15792407f6C0d62F5D",
  [optimism.id]: "0xa7df2Ff7a6E1FAEb480617A01aD80b99CE39Bcc3",
  [arbitrum.id]: "0xf7C42Db8bdD563539861de0ef2520Aa80c28e8c4",
  [xLayer.id]: zeroAddress,
  [base.id]: "0xDcC09A3984C6C3D6D349af3bc01C129d26609B42",
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: "0x0AcFFe851833f934b3ba4d49F279563513F7e110",
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const VaultOracleOwnerByChain: AddressByChain = {
  [mainnet.id]: "0xDF9b9c1151587D5c087cE208B38aea5a68083110",
  [optimism.id]: "0x9186a1B331112e17aE6555E941787b3dc87249d5",
  [arbitrum.id]: "0x9759573d033e09C9A224DFC429aa93E4BD677A6c",
  [xLayer.id]: zeroAddress,
  [base.id]: "0x36ADB538a7a8b8295c059A1220fF4A7f6064D5a7",
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: "0x6Ee09de47C67a858ae84ab0848a50ca2278bC959",
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const VaultOracleV2ByChain: AddressByChain = {
  [mainnet.id]: "0xff30A56c6413A5429d260a041d494509C8876E20",
  [optimism.id]: "0x7EbEa6054BDA446C4D781E323bE2068A57261889",
  [arbitrum.id]: "0x233E9cE41C553616141a000cC8E99BC9Ed9345e9",
  [xLayer.id]: zeroAddress,
  [base.id]: "0xA76331558b8D501dd644603e98aE02e291bBD197",
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
  [hemi.id]: "0xc67Ef06A3213c2212bC05e4cE34a8eEbA29278E2",
}

export const VaultOracleOwnerV2ByChain: AddressByChain = {
  [mainnet.id]: "0xD158eC0bc85c1b109B1d2fe962BE492F9f50499E",
  [optimism.id]: "0x04AE0847765C3a3894c147BfAe1C09f22d1acF64",
  [arbitrum.id]: "0xFfDca6ac9BF315409f8b4a60C9f2bc6af1e5dDdf",
  [xLayer.id]: zeroAddress,
  [base.id]: "0x1dD54D16B256658950d37a6D8657B3dD1a98B260",
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
  [hemi.id]: "0x0ae9515aC7900C6054F684795d554a9Dc202eb51",
}

export const ManagementMultisigByChain: AddressByChain = {
  [mainnet.id]: "0xB85e0d4ad9078676Ca86C6bAa51228aB3E21F5da",
  [optimism.id]: "0xE8021873695943499168052AF6983aE674285aF1",
  [arbitrum.id]: "0x24a1c01a0ca2393e03f292Be1A6EBcFe96956a50",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const FeeRecipientByChain: AddressByChain = {
  [mainnet.id]: FEE_RECIPIENT_PROXY,
  [polygon.id]: FEE_RECIPIENT_PROXY,
  [bsc.id]: FEE_RECIPIENT_PROXY,
  [avalanche.id]: "0xe3Bf0045C12C1CF31D7DAc40D0Fc0a49a410bBA2",
  [aurora.id]: FEE_RECIPIENT_PROXY,
  [fantom.id]: FEE_RECIPIENT_PROXY,
  [optimism.id]: FEE_RECIPIENT_PROXY,
  [arbitrum.id]: FEE_RECIPIENT_PROXY,
  [xLayer.id]: "0xA9c5E4484d0f204E758637f7Bf5A08A0AA09A39C",
  [base.id]: "0xe3Bf0045C12C1CF31D7DAc40D0Fc0a49a410bBA2",
  [fraxtal.id]: "0xe3Bf0045C12C1CF31D7DAc40D0Fc0a49a410bBA2",
}

export const TokenMigrationByChain: AddressByChain = {
  [mainnet.id]: "0xC016759a2D1FdD11B290b085176Bf86091A0e04B",
  [optimism.id]: "0xC016759a2D1FdD11B290b085176Bf86091A0e04B",
  [arbitrum.id]: "0xC016759a2D1FdD11B290b085176Bf86091A0e04B",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

// EXTERNAL
export const ENSO_ROUTER: Address = "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E"
export const BALANCER_VAULT: Address = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
export const BALANCER_QUERIES: Address = "0xE39B5e3B6D74016b2F6A9673D7d7493B6DF549d5";
export const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export const WethByChain: AddressByChain = {
  [mainnet.id]: WETH,
  [optimism.id]: "0x4200000000000000000000000000000000000006",
  [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const PendleRouterByChain: AddressByChain = {
  [mainnet.id]: "0x888888888889758f76e7103c6cbf23abbf58f946",
  [optimism.id]: zeroAddress,
  [arbitrum.id]: zeroAddress,
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const ZapAssetAddressesByChain: { [key: number]: Address[] } = {
  [mainnet.id]: [
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", // LUSD
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
    "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", // ETHx
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
    "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7", // rsETH
    "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
  ],
  [polygon.id]: [
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // DAI
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
    "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", // WBTC
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" // MATIC
  ],
  [optimism.id]: [
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
    "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // USDT
    "0xc40F949F8a4e094D1b49a23ea9241D289B7b2819", // LUSD
    "0x4200000000000000000000000000000000000006", // WETH
    "0x68f180fcCe6836688e9084f035309E29Bf0A2095", // WBTC
  ],
  [arbitrum.id]: [
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
    "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b", // LUSD
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC
  ],
  [bsc.id]: [],
  [xLayer.id]: [],
  [base.id]: [],
  [fraxtal.id]: [],
  [avalanche.id]: []
}


export const RS_ETH_ASSETS = [
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
  "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", // ETHx
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
]
// LEGACY


export const WrappedOptionTokenByChain: AddressByChain = {
  [mainnet.id]: "0x1AaAFe03A8a2E93A399DbCE03F88Bbaff1b08D60",
  [optimism.id]: "0xAe5CbB42F0Afa59B90769df4b4c6D623896E4573",
  [arbitrum.id]: "0xaF33642938172011f711bA530acc900Ae17620A7",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const RewardsClaimerByChain: AddressByChain = {
  [mainnet.id]: "0xa5F5e90304758250764Ad26CbdD04b68D6Ce5d2a",
  [optimism.id]: "0x268823d2D666643721A15462De02987F77DE7bbf",
  [arbitrum.id]: "0x925Efe4B78a823d6AB22Ac5894516b898293a9E5",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const XVCXByChain: AddressByChain = {
  [mainnet.id]: "0x18445923592be303fbd3BC164ee685C7457051b4",
  [optimism.id]: "0xfe7950eC9AfE82538CEAC95735f1daf31829d066",
  [arbitrum.id]: "0x18445923592be303fbd3BC164ee685C7457051b4",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
  [polygon.id]: zeroAddress,
  [bsc.id]: zeroAddress,
}

export const PermissionRegistryByChain: AddressByChain = {
  [mainnet.id]: "0x7a33b5b57C8b235A3519e6C010027c5cebB15CB4",
  [bsc.id]: "0x8c76AA6B65D0619042EAd6DF748f782c89a06357",
  [polygon.id]: "0x1F381429943AFBb6870b3b9B0aB4707a6BdC2356",
  [optimism.id]: "0xf5862457AA842605f8b675Af13026d3Fd03bFfF0",
  [arbitrum.id]: "0xB67C4c9C3CebCeC2FD3fDE436340D728D990A8d9",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
}

export const AdminProxyByChain: AddressByChain = {
  [mainnet.id]: "0x564fBe59c448743FA9382E691a0320458F6dCDE5",
  [bsc.id]: "0x0CfE90Bc6156360E003d5367fcC054Bd1656d1B1",
  [polygon.id]: "0x7Edd61A58B5920dF39208E9888D8be713f639A60",
  [optimism.id]: "0x7D224F9Eaf3855CE3109b205e6fA853d25Bb457f",
  [arbitrum.id]: "0xcC09F5bd7582D02Bb31825d09589F4773B65eCc9",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
}

export const VaultRegistryByChain: AddressByChain = {
  [mainnet.id]: "0x007318Dc89B314b47609C684260CfbfbcD412864",
  [polygon.id]: "0x2246c4c469735bCE95C120939b0C078EC37A08D0",
  [optimism.id]: "0xdD0d135b5b52B7EDd90a83d4A4112C55a1A6D23A",
  [arbitrum.id]: "0xB205e94D402742B919E851892f7d515592a7A6cC",
  [bsc.id]: "0x25172C73958064f9ABc757ffc63EB859D7dc2219",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
};

export const VaultControllerByChain: AddressByChain = {
  [mainnet.id]: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  [arbitrum.id]: "0xF40749d72Ab5422CC5d735A373E66d67f7cA9393",
  [optimism.id]: "0x757D953c53aD28748aCf94AD2d59C13955E09c08",
  [bsc.id]: "0x815B4A955169Ba1D66944A4d8F18B69bc9553a62",
  [polygon.id]: "0xCe22Ff6d00c5414E64b9253Dd49a35e0B9Ea8b60",
  [xLayer.id]: zeroAddress,
  [base.id]: zeroAddress,
  [fraxtal.id]: zeroAddress,
  [avalanche.id]: zeroAddress,
};
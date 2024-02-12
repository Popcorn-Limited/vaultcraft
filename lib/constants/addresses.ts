import { Address, zeroAddress } from "viem";
import { VeAddresses } from "lib/types";

export const VaultRegistryByChain: { [key: number]: Address } = {
  1: "0x007318Dc89B314b47609C684260CfbfbcD412864",
  137: "0x2246c4c469735bCE95C120939b0C078EC37A08D0",
  10: "0xdD0d135b5b52B7EDd90a83d4A4112C55a1A6D23A",
  42161: "0xB205e94D402742B919E851892f7d515592a7A6cC",
}

export const VaultControllerByChain: { [key: number]: Address } = {
  1: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  1337: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  42161: "0xF40749d72Ab5422CC5d735A373E66d67f7cA9393",
  10: "0x757D953c53aD28748aCf94AD2d59C13955E09c08",
  56: "0x815B4A955169Ba1D66944A4d8F18B69bc9553a62",
  137: "0xCe22Ff6d00c5414E64b9253Dd49a35e0B9Ea8b60"
}

export const VaultRouterByChain: { [key: number]: Address } = {
  1: "0x7D51BABA56C2CA79e15eEc9ECc4E92d9c0a7dbeb",
  11155111: "0xd6a81E846725256a910fC51Dce0b67582D4031b4",
  421614: "0xA5537e56fb1Ef1F892E6FeBb74B858B234D0eA7A"
}

const veAddresses: VeAddresses = {
  VCX: "0xcE246eEa10988C495B4A90a905Ee9237a0f91543",
  WETH_VCX_LP: "0x417755cDB723ddA17C781208bdAe81E7e9427398",
  VE_VCX: "0xC28a4F90C3669574Ff2E40540f1c7b28a82cC7d7",
  oVCX: "0xB434eA0fBf01884bD9e3F7b06D823277A27BfFBe",
  POP: "0xD0Cd466b34A24fcB2f87676278AF2005Ca8A78c4",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  BalancerPool: "0x417755cDB723ddA17C781208bdAe81E7e9427398", // Same as WETH_VCX_LP
  BalancerOracle: "0xe2871224b413F55c5a2Fd21E49bD63A52e339b03",
  BalancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
  VaultRegistry: "0x80D1648F5d6262299A9A7d496C22c838bf41113F",
  BoostV2: "0xDC3824c3e90D8383F874435f2004780B0972B980",
  Minter: "0x5E87fFa7a00Ecc0Bb37Cf1dF253435A81Ccc86d7",
  TokenAdmin: "0x23C510465ee06621Eb05B88B381153866d25B0da",
  VotingEscrow: "0xC28a4F90C3669574Ff2E40540f1c7b28a82cC7d7", // Same as VE_VCX
  GaugeController: "0xAAe633b4aE50023F74D6DEad99036c97f63Ce1c9",
  GaugeFactory: "0x4C85791b97C5EeB05f63F455e1Da408FDe80fc73",
  SmartWalletChecker: "0xcaC427993DD4D201fA5B37D65Bb0b1F5c5522315",
  VotingEscrowDelegation: "0x8F44f5e80964134d0A61351734eA6c0288924548",
  VeBeacon: "0xC3Eb4a04720AB8F30A111dB584a4C4d3620a0f65",
  VeRecipient: "0xe6C005625AB42B0168de5b91c429184756E923FA",
  ArbitrumBridge: "0xA66cBBa4f06E19EE424fC778c89a2dEf8982e183",
  FeeDistributor: zeroAddress
};

export function getVeAddresses(): VeAddresses {
  return veAddresses;
}

export const zapAssetAddressesByChain: { [key: number]: Address[] } = {
  1: [
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0", // LUSD
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
  ],
  137: [
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // DAI
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
    "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", // WBTC
  ],
  10: [
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
    "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // USDT
    "0xc40F949F8a4e094D1b49a23ea9241D289B7b2819", // LUSD
    "0x4200000000000000000000000000000000000006", // WETH
    "0x68f180fcCe6836688e9084f035309E29Bf0A2095", // WBTC
  ],
  42161: [
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
    "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b", // LUSD
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC
  ],
  56: []
}

import { veAddresses } from "lib/types";

const VeAddresses = {
    VCX: "0xcE246eEa10988C495B4A90a905Ee9237a0f91543",
    WETH_VCX_LP: "0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920",
    VE_VCX: "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A",
    oVCX: "0xaFa52E3860b4371ab9d8F08E801E9EA1027C0CA2",
    POP: "0xD0Cd466b34A24fcB2f87676278AF2005Ca8A78c4",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    BalancerPool: "0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920", // Same as WETH_VCX_LP
    BalancerOracle: "0xe2871224b413F55c5a2Fd21E49bD63A52e339b03",
    BalancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    VaultRegistry: "0x007318Dc89B314b47609C684260CfbfbcD412864",
    BoostV2: "0xa2E88993a0f0dc6e6020431477f3A70c86109bBf",
    Minter: "0x49f095B38eE6d8541758af51c509332e7793D4b0",
    TokenAdmin: "0x03d103c547B43b5a76df7e652BD0Bb61bE0BD70d",
    VotingEscrow: "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A", // Same as VE_VCX
    GaugeController: "0xD57d8EEC36F0Ba7D8Fd693B9D97e02D8353EB1F4",
    GaugeFactory: "0x3bd6418e90653945f781e3717D8F9404565444F6",
    SmartWalletChecker: "0x8427155770f7e6b973249E2f9D140a495aBE4f90",
    VotingEscrowDelegation: "0xafE32869CAf311585647ADcD79050B83DbCF94C8",
    VaultRouter: "0x8aed8Ea73044910760E8957B6c5b28Ac51f8f809",
};

export function getVeAddresses(): veAddresses {
    return VeAddresses as veAddresses;
}

import TokenMetadata, { addLpMetadata } from "@/lib/utils/metadata/tokenMetadata";
import ProtocolMetadata from "@/lib/utils/metadata/protocolMetadata";
import StrategyMetadata, { addGenericStrategyDescription } from "@/lib/utils/metadata/strategyMetadata";
import { Token } from "../types";
import { Address } from "viem";
import { OptionalMetadata } from "./getVault";

function getLocalMetadata(address: string): OptionalMetadata | undefined {
  switch (address) {
    case "0xDFd505B54E15D5B20842e868E4c19D7b6F0a4a5d":
      return {
        token: TokenMetadata.stgUsdt,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdt-matic/add",
        resolver: "beefy",
      }
    case "0xB38b9522005ffBb0e297c17A8e2a3f11C6433e8C":
      return {
        token: TokenMetadata.stgUsdc,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdc-matic/add",
        resolver: "beefy",
      }
    case "0x5d344226578DC100b2001DA251A4b154df58194f":
      return {
        token: TokenMetadata.dai,
        protocol: ProtocolMetadata.flux,
        strategy: StrategyMetadata.fluxLending,
        resolver: "flux",
      }
    case "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.flux,
        strategy: StrategyMetadata.fluxLending,
        resolver: "flux",
      }
    case "0xC2241a5B22Af50b2bb4C4960C23Ed1c8DB7f4D6c":
      return {
        token: TokenMetadata.dolaUsdcVeloLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyVelodromeCompounder,
        getTokenUrl: "https://app.velodrome.finance/liquidity/manage?address=0x6c5019d345ec05004a7e7b0623a91a0d9b8d590d",
        resolver: "beefy",
      }
    case "0x2F1698D249782dbA192aF2Bab91E5eA621b7C6f7":
      return {
        token: TokenMetadata.hopDai,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=optimism",
        resolver: "beefy",
      }
    case "0x36EC2111A68350dBb722B872963F05992dd08E42":
      return {
        token: TokenMetadata.hopUsdc,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDC&sourceNetwork=arbitrum",
        resolver: "beefy",
      }
    case "0xfC2193ac4E8145E192bC3d9Db9407A4aE0Dc4DF8":
      return {
        token: TokenMetadata.hopDai,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=arbitrum",
        resolver: "beefy",
      }
    case "0xe64E5e2E58904366A6E24CF1e0aC7922AfCe4332":
      return {
        token: TokenMetadata.hopUsdt,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDT&sourceNetwork=optimism",
        resolver: "beefy",
      }
    case "0xc8C88fdF2802733f8c4cd7c0bE0557fdC5d2471c":
      return {
        token: TokenMetadata.ousd,
        protocol: ProtocolMetadata.origin,
        strategy: StrategyMetadata.ousd,
        getTokenUrl: "https://app.ousd.com/",
        resolver: "origin",
      }
    case "0x8f4446a0857ca6E1f53E7a19a63631F9367bA97D":
      return {
        token: TokenMetadata.ankrBnbBnbEllipsisLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyEllipsisCompounder,
        getTokenUrl: "https://ellipsis.finance/pool/0x440bA409d402e25b95aC852E386445aF12E802a0",
        resolver: "beefy",
      }
    case "0xBae30fBD558A35f147FDBaeDbFF011557d3C8bd2":
      return {
        token: TokenMetadata.ohmDaiBalancerLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyAuraCompounder,
        getTokenUrl: "https://app.balancer.fi/#/ethereum/pool/0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c90002000000000000000003d2/add-liquidity",
        resolver: "beefy",
      }
    case "0xFd136eF035Cf18E8F2573CaEbb3c4554635DC4F5":
      return {
        token: TokenMetadata.lusdUsdcLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyVelodromeCompounder,
        getTokenUrl: "https://app.velodrome.finance/liquidity/manage?address=0x207addb05c548f262219f6bfc6e11c02d0f7fdbe",
        resolver: "beefy",
      }
    case "0x759281a408A48bfe2029D259c23D7E848A7EA1bC":
      return {
        token: TokenMetadata.yCrv,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.stYCrv,
        getTokenUrl: "https://yearn.finance/ycrv",
        resolver: "yearn",
      }
    case "0x9E237F8A3319b47934468e0b74F0D5219a967aB8":
      return {
        token: TokenMetadata.bbAvUsd,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnAuraCompounder,
        getTokenUrl: "https://app.balancer.fi/#/ethereum/pool/0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502/add-liquidity",
        resolver: "yearn",
      }
    case "0xF1649eC625Aca15831237D29cd09F3c71a5cca63":
      return {
        token: TokenMetadata.crvStEthLp,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnConvexCompounder,
        getTokenUrl: "https://curve.fi/#/ethereum/pools/factory-v2-303/deposit",
        resolver: "yearn",
      }
    case "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567":
      return {
        token: TokenMetadata.crvOhmFraxLp,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnConvexCompounder,
        getTokenUrl: "https://curve.fi/#/ethereum/pools/factory-crypto-158/deposit",
        resolver: "yearn",
      }
    case "0x30D6a7B8c985d5dd7B9823d3B6Ae2726c8FFf81F":
      return {
        token: TokenMetadata.dai,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Senior Tranche",
          description: `Idle is a decentralized yield automation protocol that aims to step up DeFi by reimagining how risk and yield are managed. This vault is connected to [Yield Tranches](https://docs.idle.finance/products/yield-tranches) (YTs): an innovative DeFi primitive that segments yields and risks to appeal to a diverse range of users, offering two risk-return profiles, Senior and Junior. Senior YTs withhold part of their yield in exchange for funds coverage, given by the Junior class’ liquidity. This way, Senior holders benefit from built-in protection on deposits. That yield is routed to the Junior side in exchange for first-loss liquidity to cover Senior funds.
 
          ---
          All Idle strategies feature automatically compounded interest and no lock-up periods. 
          ---
          STRATEGIES
          
          In this vault, USDC are deposited into Idle’s Senior YT based on [Clearpool](https://clearpool.finance/)%E2%80%99s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/). 
          
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques. 
          
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **built-in protection on deposits**.`
        },
        resolver: "idleSenior",
      }
    case "0x6cE9c05E159F8C4910490D8e8F7a63e95E6CEcAF":
      return {
        token: TokenMetadata.dai,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Junior Tranche",
          description: `Idle is a decentralized yield automation protocol that aims to step up DeFi by reimagining how risk and yield are managed. This vault is connected to [Yield Tranches](https://docs.idle.finance/products/yield-tranches) (YTs): an innovative DeFi primitive that segments yields and risks to appeal to a diverse range of users, offering two risk-return profiles, Senior and Junior. Senior YTs withhold part of their yield in exchange for funds coverage, given by the Junior class’ liquidity. That yield is routed to the Junior side in exchange for first-loss liquidity to cover Senior funds. This way, **Junior holders can benefit from boosted returns**.
          
          All Yield Tranches feature automatically compounded interest and no lock-up periods.
          ---
          STRATEGIES
          
          In this vault, USDC are deposited into Idle’s Junior YT based on [Clearpool](https://clearpool.finance/)%E2%80%99s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/).
          
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques. 
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **boosted returns**.`
        },
        resolver: "idleJunior",
      }
    case "0xcdc3CbF94114406a0b59aDA090807838369ced2b":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Senior Tranche",
          description: `In this vault, USDC is deposited into **Idle’s Senior YT based on [Clearpool](https://clearpool.finance/)’s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/)**.
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques.
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **built-in protection on deposits**.`
        },
        resolver: "idleSenior",
      }
    case "0x52Aef3ea0D3F93766D255A1bb0aA7F1C4885E622":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Junior Tranche",
          description: `In this vault, USDC is deposited into **Idle’s Junior YT based on [Clearpool](https://clearpool.finance/)’s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/)**. 
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques.
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **boosted returns**.`
        },
        resolver: "idleJunior",
      }
    case "0x11E10B12e8DbF7aE44EE50873c09e5C7c3e01385":
      return {
        token: TokenMetadata.usdt,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Senior Tranche",
          description: `In this vault, USDT are deposited into **Idle’s Senior YT based on [Clearpool](https://clearpool.finance/)’s borrowing pool from** [Fasanara Digital](https://www.fasanara.com/). 
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Fasanara Digital was started in 2019 as part of Fasanara Capital, a top-tier hedge fund specialized in alternative credit & fintech strategies, counting +$4b AUM across different funds. 
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **built-in protection on deposits**.`
        },
        resolver: "idleSenior",
      }
    case "0x3D04Aade5388962C9A4f83B636a3a8ED63ea5b4D":
      return {
        token: TokenMetadata.usdt,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Junior Tranche",
          description: `In this vault, USDT are deposited into **Idle’s Junior YT based on [Clearpool](https://clearpool.finance/)’s borrowing pool from** [Fasanara Digital](https://www.fasanara.com/). . 
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Fasanara Digital was started in 2019 as part of Fasanara Capital, a top-tier hedge fund specialized in alternative credit & fintech strategies, counting +$4b AUM across different funds. 
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **boosted returns**.`
        },
        resolver: "idleJunior",
      }
    case "0x95Ca391fB08F612Dc6b0CbDdcb6708C21d5A8295":
      return {
        token: TokenMetadata.oeth,
        protocol: ProtocolMetadata.origin,
        strategy: StrategyMetadata.oeth,
        getTokenUrl: "https://app.oeth.com/",
        resolver: "origin",
      }
    default:
      return undefined
  }
}

function getStargateMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.stargate,
    token: { name: `STG-${asset.symbol.slice(2)}`, description: addLpMetadata("stargate", asset.symbol.slice(2)) },
    strategy: { name: "Stargate Compounding", description: addGenericStrategyDescription("lpCompounding", "Stargate") },
    getTokenUrl: `https://stargate.finance/pool/${asset.symbol.slice(2)}-ETH/add`,
    resolver: "stargate"
  }
}

function getConvexMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.convex,
    token: { name: `STG-${asset.symbol.slice(2)}`, description: addLpMetadata("stableLp", "curve") },
    strategy: { name: "Convex Compounding", description: addGenericStrategyDescription("lpCompounding", "Convex") },
    getTokenUrl: `https://curve.fi/#/ethereum/pools`,
    resolver: "convex",
  }
}

function getAaveV2Metadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.aave,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Aave Lending", description: addGenericStrategyDescription("lending", "Aave") },
    resolver: "aaveV3",

  }
}

function getAaveV3Metadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.aave,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Aave Lending", description: addGenericStrategyDescription("lending", "Aave") },
    resolver: "aaveV3",

  }
}

function getAuraMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.aura,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Aura Compounding", description: addGenericStrategyDescription("lpCompounding", "Aura") },
    resolver: "aura",

  }
}

function getCompoundV2Metadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.compound,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Compound Lending", description: addGenericStrategyDescription("lending", "Compound") },
    resolver: "compoundV2",
  }
}

function getCompoundV3Metadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.compound,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Compound Lending", description: addGenericStrategyDescription("lending", "Compound") },
    resolver: "compoundV3",

  }
}

function getFluxMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.flux,
    token: { name: asset.symbol, description: "None available" },
    strategy: StrategyMetadata.fluxLending,
    resolver: "flux",

  }
}

function getBeefyMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.beefy,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Beefy Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Beefy") },
    resolver: "beefy",

  }
}

function getYearnMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.yearn,
    token: { name: asset.symbol, description: "None available" },
    strategy: { name: "Yearn Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Yearn") },
    resolver: "yearn",

  }
}

function getIdleMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.idle,
    token: { name: asset.symbol, description: "None available" },
    strategy: adapter?.name?.includes("Senior") ?
      { name: "Senior Tranche", description: addGenericStrategyDescription("seniorTranche", "Idle") } :
      { name: "Junior Tranche", description: addGenericStrategyDescription("juniorTranche", "Idle") },
    resolver: adapter?.name?.includes("Senior") ? "idleSenior" : "idleJunior",
  }
}

function getOriginMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    protocol: ProtocolMetadata.origin,
    token: adapter?.name?.includes("Ether") ? TokenMetadata.oeth : TokenMetadata.ousd,
    strategy: adapter?.name?.includes("Ether") ? StrategyMetadata.oeth : StrategyMetadata.ousd,
    resolver: "origin"
  }
}

function getEmptyMetadata(adapter: Token, asset: Token): OptionalMetadata {
  return {
    token: { name: "Token", description: "Not found" },
    protocol: { name: "Protocol", description: "Not found" },
    strategy: { name: "Strategy", description: "Not found" },
  }
}


function getFactoryMetadata({ adapter, asset }: { adapter: Token, asset: Token }): OptionalMetadata {
  if (adapter?.name?.includes("Stargate")) {
    return getStargateMetadata(adapter, asset)
  } else if (adapter?.name?.includes("Convex")) {
    return getConvexMetadata(adapter, asset)
  } else if (adapter?.name?.includes("AaveV2")) {
    return getAaveV2Metadata(adapter, asset)
  } else if (adapter?.name?.includes("AaveV3")) {
    return getAaveV3Metadata(adapter, asset)
  } else if (adapter?.name?.includes("Aura")) {
    return getAuraMetadata(adapter, asset)
  } else if (adapter?.name?.includes("CompoundV2")) {
    return getCompoundV2Metadata(adapter, asset)
  } else if (adapter?.name?.includes("CompoundV3")) {
    return getCompoundV3Metadata(adapter, asset)
  } else if (adapter?.name?.includes("Flux")) {
    return getFluxMetadata(adapter, asset)
  } else if (adapter?.name?.includes("Beefy")) {
    return getBeefyMetadata(adapter, asset)
  } else if (adapter?.name?.includes("Yearn")) {
    return getYearnMetadata(adapter, asset)
  } else if (adapter?.name?.includes("Idle")) {
    return getIdleMetadata(adapter, asset)
  } else if (adapter?.name?.includes("Origin")) {
    return getOriginMetadata(adapter, asset)
  }
  return getEmptyMetadata(adapter, asset)
}


export default function getOptionalMetadata({ vaultAddress, asset, adapter }: { vaultAddress: Address, asset: Token, adapter: Token }): OptionalMetadata {
  const localMetadata = getLocalMetadata(vaultAddress);
  if (localMetadata) { return localMetadata }
  else {
    return getFactoryMetadata({ adapter, asset })
  }
}
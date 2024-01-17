import { Address } from "viem"

// @dev Make sure the keys here are correct checksum addresses
export const tranches: {
  [key: number]: {
      [key: Address]: {
          cdo: Address,
          junior: Address,
          senior: Address
      }
  }
} = {
  1: {
      "0x6B175474E89094C44Da98b954EedeAC495271d0F": {
          cdo: "0x5dca0b3ed7594a6613c1a2acd367d56e1f74f92d",
          junior: "0x38d36353d07cfb92650822d9c31fb4ada1c73d6e",
          senior: "0x43ed68703006add5f99ce36b5182392362369c1c"
      }, // dai clearpool portofino
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
          cdo: "0xe7c6a4525492395d65e736c3593ac933f33ee46e",
          junior: "0xbcc845bb731632ebe8ac0bfacde056170aaaaa06",
          senior: "0xdca1dae87f5c733c84e0593984967ed756579bee"
      }, // usdc clearpool fasanara
      "0xdAC17F958D2ee523a2206206994597C13D831ec7": {
          cdo: "0xc4574C60a455655864aB80fa7638561A756C5E61",
          junior: "0x3Eb6318b8D9f362a0e1D99F6032eDB1C4c602500",
          senior: "0x0a6f2449c09769950cfb76f905ad11c341541f70"
      }, // usdt clearpool fasanara
      "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84": {
          cdo: "0x8e0a8a5c1e5b3ac0670ea5a613bb15724d51fc37",
          junior: "0x990b3af34ddb502715e1070ce6778d8eb3c8ea82",
          senior: "0xdf17c739b666b259da3416d01f0310a6e429f592"
      }, // stEth instadapp
  },
  10: {
      "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58": {
          cdo: "0x8771128e9E386DC8E4663118BB11EA3DE910e528",
          junior: "0xafbAeA12DE33bF6B44105Eceecec24B29163077c",
          senior: "0x8552801C75C4f2b1Cac088aF352193858B201D4E"
      }, // USDT clearpool Portfino
      "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85": {
          cdo: "0xe49174F0935F088509cca50e54024F6f8a6E08Dd",
          junior: "0xB1aD1E9309e5f10982d9bf480bC241580ccc4b02",
          senior: "0x6AB470a650E1E0E68b8D1C0f154E78ca1a7147BF"
      }, // USDC Clearpool Wincent
  }
}
import { AddressByChain } from "@/lib/types";

export * from "./handleAaveInteractions";
export * from "./interactions";
export * from "./userAccount";

export const AavePoolByChain: AddressByChain = {
  1: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  137: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  10: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  42161: "0x794a61358D6845594F94dc1DB02A252b5b4814aD"
}
export const AaveUiPoolProviderByChain: AddressByChain = {
  1: "0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d",
  137: "0xC69728f11E9E6127733751c8410432913123acf1",
  10: "0xbd83DdBE37fc91923d59C8c1E0bDe0CccCa332d5",
  42161: "0x145dE30c929a065582da84Cf96F88460dB9745A7"
}

export const AavePoolAddressProviderByChain: AddressByChain = {
  1: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
  137: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  10: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  42161: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"
}

export function getHealthFactorColor(suffix: string, healthFactor: number): string {
  if (!healthFactor) return `${suffix}-white`
  if (healthFactor === 0) {
    return `${suffix}-white`
  } else if (healthFactor > 3) {
    return `${suffix}-green-500`
  } else if (healthFactor > 1.3) {
    return `${suffix}-yellow-500`
  } else {
    return `${suffix}-red-500`
  }
}
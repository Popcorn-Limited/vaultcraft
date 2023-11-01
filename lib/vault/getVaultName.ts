import { Address } from "viem";
import { IpfsClient } from "@/lib/utils/ipfsClient";

const AddressToVaultName: { [key: Address]: string } = {
  "0x3D04Aade5388962C9A4f83B636a3a8ED63ea5b4D": "USDT Junior Tranche",
  "0x11E10B12e8DbF7aE44EE50873c09e5C7c3e01385": "USDT Senior Tranche",
  "0x52Aef3ea0D3F93766D255A1bb0aA7F1C4885E622": "USDC Junior Tranche",
  "0xcdc3CbF94114406a0b59aDA090807838369ced2b": "USDC Senior Tranche",
  "0x6cE9c05E159F8C4910490D8e8F7a63e95E6CEcAF": "DAI Junior Tranche",
  "0x30D6a7B8c985d5dd7B9823d3B6Ae2726c8FFf81F": "DAI Senior Tranche"
}

export default async function getVaultName({ address, cid }: { address: Address, cid: string }): Promise<string | undefined> {
  if (Object.keys(AddressToVaultName).includes(address)) return AddressToVaultName[address];
  if (["", "cid"].includes(cid)) return undefined
  return (await IpfsClient.get<{ name: string }>(cid)).name
}
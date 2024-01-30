import type { NextPage } from "next";
import { Address } from "wagmi";
import VaultsContainer from "@/components/vault/VaultsContainer";


const FLAGSHIP_VAULTS: Address[] = [
  // eth
  "0x6cE9c05E159F8C4910490D8e8F7a63e95E6CEcAF", // DAI IdleJunior
  "0x52Aef3ea0D3F93766D255A1bb0aA7F1C4885E622", // USDC IdleJunior
  "0x3D04Aade5388962C9A4f83B636a3a8ED63ea5b4D", // USDT IdleJunior
  "0xdC266B3D2c62Ce094ff4E12DC52399c430283417", // pCVX Pirex
  "0x6B2c5ef7FB59e6A1Ad79a4dB65234fb7bDDcaD6b", // oETH-LP Beefy
  "0xD211486ed1A04A176E588b67dd3A30a7dE164C0B", // WETH-AURA Beefy
  "0xA3cd112fFb1E3A358EF270a07F5901FF0fD1CD0f", // MIM Yearn
  "0xe1489Af32c45c51f94Acdb3F36B7032A82F6f55D", // WETH Sommelier
  "0x759281a408A48bfe2029D259c23D7E848A7EA1bC", // yCRV Yearn
  // op
  "0x5Df527eb4cE7dE09f8e966F9bbc9bc4Edbc7f458", // USDT IdleSenior
  "0x78C44B3A63b94d2EFc98c2Cc9701F9BEE1b6a56A", // USDT IdleJunior
  "0x5372c5AF5f078f2d4B5dbBE4377b2f0225f2863A", // USDC IdleSenior
  "0x4E564bC61Cf97737cE110c7929b17963E9232aE9", // USDC IdleJunior
  "0x400a838eeA2ec6Daf6fA30d7Bc60505f0CecCec1", // wstETH/WETH Beefy
  "0x5D45accb18A88895aCac95F13a2882C273E22e3A", // USDC/VELO Beefy
  "0x740dc6c1eA74BbbadCCA0aB6253319e200c421a5", // STG/USDC Beefy
  "0x48b2Bc0C40F4483EC982408F06Dc0E1e111D966b", // USDC/DOLA Beefy
  "0x1F01c6bFDE973be1573AbFC1B6b1dFb1D8F22A86", // wstETH/OP Beefy
  "0x0825bb2F6Ce26af1652584F1Da9e55e54015904A", // OP/USDC Beefy
  // arb
  "0x54d921B6397731222aB0b898bAE58c948d187Cd1", // StakedGlp Beefy
  "0x1225354B00372c531e1c39ECe1cec548358926bb", // pGMX Pirex
]


const Vaults: NextPage = () => {
  return <VaultsContainer hiddenVaults={[]} displayVaults={FLAGSHIP_VAULTS} />
};

export default Vaults;
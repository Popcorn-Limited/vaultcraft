import type { NextPage } from "next";
import { Address } from "wagmi";
import VaultsContainer from "@/components/vault/VaultsContainer";

const FLAGSHIP_VAULTS: Address[] = [
  // eth
  "0x6cE9c05E159F8C4910490D8e8F7a63e95E6CEcAF", // DAI IdleJunior
  "0x52Aef3ea0D3F93766D255A1bb0aA7F1C4885E622", // USDC IdleJunior
  "0x3D04Aade5388962C9A4f83B636a3a8ED63ea5b4D", // USDT IdleJunior
  "0xe1489Af32c45c51f94Acdb3F36B7032A82F6f55D", // WETH Sommelier
  "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725", // rsETH
  "0x59fD900cA80Bf914374AaFB1D16aB12aE1234F77", // prime eth
  "0xd24844c1eb111C1385A311DeEc62533A09d4C86B", // ezETH lp
  "0xBb5B77A1f61ece8feAb332f2d437815983c00574", // svETH/wstETH lp
  "0x434E7EA9BC77C93c3F4680862281603338c7aE02", // ION wstETH / weETH
  // "0xa48d49F63Dfc185cDD409B65f042955f509d9658", // ION wstETH / rsETH
  // op
  "0x78C44B3A63b94d2EFc98c2Cc9701F9BEE1b6a56A", // USDT IdleJunior
  "0x4E564bC61Cf97737cE110c7929b17963E9232aE9", // USDC IdleJunior
  // arb
  "0x54d921B6397731222aB0b898bAE58c948d187Cd1", // StakedGlp Beefy
];

const Vaults: NextPage = () => {
  return <VaultsContainer hiddenVaults={[]} displayVaults={FLAGSHIP_VAULTS} />;
};

export default Vaults;

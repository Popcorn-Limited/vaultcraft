import type { NextPage } from "next";
import VaultsContainer from "@/components/vault/VaultsContainer";
import { Address } from "viem";

const HIDDEN_VAULTS: Address[] = ["0xb6cED1C0e5d26B815c3881038B88C829f39CE949", "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340", "0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0x8bd3D95Ec173380AD546a4Bd936B9e8eCb642de1", // Sample Stargate Vault
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
  "0x860b717B360378E44A241b23d8e8e171E0120fF0", // R/Dai
  "0xBae30fBD558A35f147FDBaeDbFF011557d3C8bd2", // 50OHM - 50 DAI
  "0xa6fcC7813d9D394775601aD99874c9f8e95BAd78", // Automated Pool Token - Oracle Vault 3
]

const Vaults: NextPage = () => {
  return <VaultsContainer hiddenVaults={HIDDEN_VAULTS} displayVaults={[]} />
};

export default Vaults;

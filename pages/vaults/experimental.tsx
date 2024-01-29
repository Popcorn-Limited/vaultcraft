import type { NextPage } from "next";
import VaultsContainer from "@/components/vault/VaultsContainer";

const Vaults: NextPage = () => {
  return <VaultsContainer hiddenVaults={[]} displayVaults={["0x3B51bba174478D641770bF4356a1BF3c215AEd49", "0x10710562d45a5356d32aD27Eea9f61F6ec44Cc19", "0xcede40B40F7AF69f5Aa6b12D75fd5eA9cE138b93"]} showDescription />
};

export default Vaults;
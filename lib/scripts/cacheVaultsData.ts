import getTokenAndVaultsDataByChain from "../getTokenAndVaultsData";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { zeroAddress } from "viem";
import { StrategiesByChain, TokenByAddress, VaultData } from "@/lib/types";
import fs from "fs";
import path from "path";
import axios from "axios";

function deepStringify(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint" || typeof obj === "number") return obj;

  if (typeof obj !== "object") return String(obj);

  if (obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => deepStringify(item));
  }

  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepStringify(v)])
  );
}

export async function cacheVaultData() {
  // get vaultsData and tokens
  const newVaultsData: { [key: number]: VaultData[] } = {};
  const newTokensData: { [key: number]: TokenByAddress } = {};

  const newStrategies: StrategiesByChain = {};
  await Promise.all(
    SUPPORTED_NETWORKS.map(async (chain) => {
      console.log(`Fetching Data for chain ${chain.id} (${new Date()})`);
      const { vaultsData, tokens, strategies } =
        await getTokenAndVaultsDataByChain({
          chain,
          account: zeroAddress,
        });

      console.log(
        `Completed fetching Data for chain ${chain.id} (${new Date()})`
      );

      newVaultsData[chain.id] = vaultsData;
      newTokensData[chain.id] = tokens;
      newStrategies[chain.id] = strategies;

      const vaults = Object.fromEntries(
        Object.entries(newVaultsData).map(([chainId, vaults]) => [
          chainId,
          vaults.map((v) => deepStringify(v)),
        ])
      );

      const tokensData = Object.fromEntries(
        Object.entries(newTokensData).map(([chainId, tokens]) => [
          chainId,
          deepStringify(tokens),
        ])
      );

      const strategiesData = Object.fromEntries(
        Object.entries(newStrategies).map(([chainId, strats]) => [
          chainId,
          deepStringify(strats),
        ])
      );

      const vaultTVL = SUPPORTED_NETWORKS.map(
        (chain) => newVaultsData[chain.id]
      )
        .flat()
        .reduce((a, b) => a + (Number(b?.tvl) || 0), 0);
      const lockVaultTVL = 520000; // @dev hardcoded since we removed lock vaults
      let stakingTVL = 0;
      try {
        stakingTVL = await axios
          .get(
            `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/api/protocol/vaultcraft`
          )
          .then((res) => res.data.currentChainTvls["staking"]);
      } catch (e) {
        stakingTVL = 2590000;
      }

      const vaultData = {
        vaultsData: vaults,
        tokens: tokensData,
        strategies: strategiesData,
        vaultTVL,
        lockVaultTVL,
        stakingTVL,
      };

      const replacer = (_k: string, v: any) =>
        typeof v === "bigint" ? v.toString() : v;

      // write to file
      const OUTPUT_DIR_V2 = "cache";

      if (!fs.existsSync(OUTPUT_DIR_V2))
        fs.mkdirSync(OUTPUT_DIR_V2, { recursive: true });

      fs.writeFileSync(
        path.join(OUTPUT_DIR_V2, "vaultsData.json"),
        JSON.stringify(vaultData, replacer, 2)
      );
    })
  );
}

async function main() {
  await cacheVaultData();
}

main();

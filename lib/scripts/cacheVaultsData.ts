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

function isValidAddress(s: unknown): boolean {
  return typeof s === "string" && /^0x[a-fA-F0-9]{40}$/.test(s);
}

function validateChainVaults(chainId: number, vaults: VaultData[]): string[] {
  const errors: string[] = [];
  vaults.forEach((v, i) => {
    if (!isValidAddress(v?.address))
      errors.push(`chain ${chainId} vault #${i}: invalid address ${v?.address}`);
    if (!isValidAddress(v?.asset))
      errors.push(`chain ${chainId} vault #${i} (${v?.address}): invalid asset ${v?.asset}`);
    if (v?.totalAssets === undefined || v?.totalAssets === null)
      errors.push(`chain ${chainId} vault ${v?.address}: missing totalAssets`);
    if (v?.totalSupply === undefined || v?.totalSupply === null)
      errors.push(`chain ${chainId} vault ${v?.address}: missing totalSupply`);
  });
  return errors;
}

export async function cacheVaultData() {
  const newVaultsData: { [key: number]: VaultData[] } = {};
  const newTokensData: { [key: number]: TokenByAddress } = {};
  const newStrategies: StrategiesByChain = {};
  const successfulChains: number[] = [];
  const failedChains: { id: number; error: string }[] = [];

  const results = await Promise.allSettled(
    SUPPORTED_NETWORKS.map(async (chain) => {
      console.log(`Fetching Data for chain ${chain.id} (${new Date().toISOString()})`);
      try {
        const { vaultsData, tokens, strategies } =
          await getTokenAndVaultsDataByChain({
            chain,
            account: zeroAddress,
          });

        const validationErrors = validateChainVaults(chain.id, vaultsData);
        if (validationErrors.length > 0) {
          console.error(
            `Chain ${chain.id} dropped due to validation errors:`,
            validationErrors
          );
          failedChains.push({
            id: chain.id,
            error: `validation: ${validationErrors.length} errors`,
          });
          return;
        }

        newVaultsData[chain.id] = vaultsData;
        newTokensData[chain.id] = tokens;
        newStrategies[chain.id] = strategies;
        successfulChains.push(chain.id);
        console.log(
          `Completed fetching Data for chain ${chain.id} (${new Date().toISOString()}) — ${vaultsData.length} vaults`
        );
      } catch (e: any) {
        const msg = e?.message || String(e);
        console.error(`Chain ${chain.id} failed:`, msg);
        failedChains.push({ id: chain.id, error: msg });
      }
    })
  );

  // Unexpected throws inside .allSettled should still be logged (shouldn't happen since we try/catch inside, but belt-and-suspenders).
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `Unexpected top-level rejection for chain ${SUPPORTED_NETWORKS[i].id}:`,
        r.reason
      );
    }
  });

  if (successfulChains.length === 0) {
    console.error("All chains failed — aborting without write.");
    process.exit(1);
  }

  // Always emit every supported chain, even when empty, so the client code's
  // `vaultsData[chain.id]` access never returns undefined (shape-compat with old cache).
  SUPPORTED_NETWORKS.forEach((chain) => {
    if (!(chain.id in newVaultsData)) newVaultsData[chain.id] = [];
    if (!(chain.id in newTokensData)) newTokensData[chain.id] = {};
    if (!(chain.id in newStrategies)) newStrategies[chain.id] = {};
  });

  const vaults = Object.fromEntries(
    Object.entries(newVaultsData).map(([chainId, vaultsArr]) => [
      chainId,
      vaultsArr.map((v) => deepStringify(v)),
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

  const vaultTVL = successfulChains
    .map((id) => newVaultsData[id])
    .flat()
    .reduce((a, b) => a + (Number(b?.tvl) || 0), 0);

  // TODO: lockVaultTVL/stakingTVL fallbacks below are hardcoded from a stale point in time.
  // These should be replaced with on-chain reads or a real API — tracked separately.
  const lockVaultTVL = 520000; // @dev hardcoded since we removed lock vaults
  let stakingTVL = 0;
  let stakingTVLFromFallback = false;
  try {
    stakingTVL = await axios
      .get(
        `https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/api/protocol/vaultcraft`
      )
      .then((res) => res.data.currentChainTvls["staking"]);
    if (stakingTVL === undefined || stakingTVL === null || Number.isNaN(Number(stakingTVL))) {
      throw new Error("DefiLlama returned non-numeric staking TVL");
    }
  } catch (e: any) {
    console.error(
      `DefiLlama staking TVL fetch failed, using hardcoded fallback 2590000:`,
      e?.message || String(e)
    );
    stakingTVL = 2590000;
    stakingTVLFromFallback = true;
  }

  const vaultData = {
    generatedAt: new Date().toISOString(),
    chains: successfulChains,
    failedChains,
    stakingTVLFromFallback,
    vaultsData: vaults,
    tokens: tokensData,
    strategies: strategiesData,
    vaultTVL,
    lockVaultTVL,
    stakingTVL,
  };

  const replacer = (_k: string, v: any) =>
    typeof v === "bigint" ? v.toString() : v;

  const OUTPUT_DIR_V2 = "cache";
  if (!fs.existsSync(OUTPUT_DIR_V2))
    fs.mkdirSync(OUTPUT_DIR_V2, { recursive: true });

  fs.writeFileSync(
    path.join(OUTPUT_DIR_V2, "vaultsData.json"),
    JSON.stringify(vaultData, replacer, 2)
  );

  console.log(
    `Cache written: ${successfulChains.length}/${SUPPORTED_NETWORKS.length} chains succeeded. Failed: ${failedChains.map((f) => f.id).join(", ") || "none"}.`
  );
  // Partial success is acceptable — the file is written with the chains that worked.
  // The CI validation step decides whether to commit (it checks minimum chain count).
}

async function main() {
  await cacheVaultData();
}

main();

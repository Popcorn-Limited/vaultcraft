import { createPool } from "@viem/anvil";
import { YieldOptions, LiveProvider, Yield } from "vaultcraft-sdk";
import { Address, createPublicClient, getAddress, http } from "viem";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "fs";
import { mainnet, polygon, arbitrum, optimism } from "viem/chains";
import { NextApiRequest, NextApiResponse } from "next";
import { getEmptyYield } from "vaultcraft-sdk/dist/yieldOptions/providers/protocols";
import { ChainId } from "@/lib/utils/connectors";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("moving current file to archive");

  const result = {
    1: await getApy(mainnet.id),
  };

  console.log("return result");

  return res.status(200).json(result)
}

interface BeefyVault {
  id: string;
  status: "active" | "eol";
  network: string;
  tokenAddress: Address;
}

interface ApyBreakdown {
  [key: string]: VaultApy;
}

interface VaultApy {
  totalApy: number;
}

export const networkNames: { [key: number]: string } = {
  [ChainId.Ethereum]: "Ethereum",
  [ChainId.Goerli]: "Goerli",
  [ChainId.Arbitrum]: "Arbitrum",
  [ChainId.Polygon]: "Polygon",
  [ChainId.Localhost]: "Localhost",
  [ChainId.Optimism]: "Optimism",
  [ChainId.BNB]: "BNB",
  [ChainId.ALL]: "All Networks",
};

async function getApy(chainId: number): Promise<any> {
  let vaults = await getVaults(chainId)

  const apy = await getApys();

  let result = {}
  // @ts-ignore
  vaults.forEach(vault => {
    if (vault.tokenAddress) {
      // @ts-ignore
      result[getAddress(vault.tokenAddress)] = {
        asset: getAddress(vault.tokenAddress),
        yield: {
          total: apy[vault.id].totalApy * 100,
          apy: [{
            rewardToken: getAddress(vault.tokenAddress),
            apy: apy[vault.id].totalApy * 100
          }]
        }
      }
    }
  })
  return result
}


async function getVaults(chainId: number): Promise<BeefyVault[]> {
  let vaults = (await axios.get("https://api.beefy.finance/vaults", { timeout: 30000, })).data;
  // @ts-ignore
  vaults = vaults.filter((vault) => vault.status === "active").filter((vault) =>
    vault.network === networkNames[chainId].toLowerCase()
  );
  return vaults
}

async function getApys(): Promise<ApyBreakdown> {
  let apy = (await axios("https://api.beefy.finance/apy/breakdown", { timeout: 30000 })).data;

  return apy;
}
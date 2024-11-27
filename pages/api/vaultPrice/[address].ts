

import { NextApiRequest, NextApiResponse } from "next";
import { ChainById } from "@/lib/utils/connectors";
import { isAddress, getAddress } from "viem";
import getSafeVaultPrice from "@/lib/vault/getSafeVaultPrice";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "can only GET vaults" });
  }

  if (!req.query.address || !isAddress(req.query.address as string)) {
    res.status(400).json({ error: "invalid address" });
  }

  if (!req.query.chainId || !Object.keys(ChainById).includes(req.query.chainId as string)) {
    res.status(400).json({ error: "invalid chainId" });
  }

  const vault = getAddress(req.query.address as string)
  const chainId = Number(req.query.chainId)

  const price = await getSafeVaultPrice({ vault, chainId: chainId })

  return res.status(200).json({ vault: vault, asset: price.asset, shareValueInAssets: price.shareValueInAssets.toString(), assetValueInShares: price.assetValueInShares.toString() });
}

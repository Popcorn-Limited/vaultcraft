import { NextApiRequest, NextApiResponse } from "next";
import { vcx as getVcxPrice } from "@/lib/resolver/price/resolver";
import { OptionTokenByChain, VCX } from "@/lib/constants";
import { arbitrum, mainnet, optimism } from "viem/chains";

const CHAIN_IDS: number[] = [mainnet.id, optimism.id, arbitrum.id]

const BASE_TOKEN = {
  name: "VCX Call Option Token",
  symbol: "oVCX",
  decimals: 18,
  logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "can only GET vaults" });
  }

  if (!req.query.chainId || !CHAIN_IDS.includes(Number(req.query.chainId))) {
    res.status(400).json({ error: "invalid chainId" });
  }

  const chainId = Number(req.query.chainId)

  const vcxPrice = await getVcxPrice({ address: VCX, chainId: mainnet.id, client: undefined })

  return res
    .status(200)
    .json({ ...BASE_TOKEN, address: OptionTokenByChain[chainId], price: vcxPrice * 0.25 });
}

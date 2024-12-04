import { NextApiRequest, NextApiResponse } from "next";
import { ChainById } from "@/lib/utils/connectors";
import { getAddress, isAddress } from "viem";

const actions = ["deposit", "withdraw", "requestWithdrawal", "stake", "unstake", "claim"]

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
  const gauge = getAddress(req.query.gauge as string)
  const chainId = Number(req.query.chainId)
  const action = req.query.action as string


  return res.status(200).json({ res: "ok" })
}

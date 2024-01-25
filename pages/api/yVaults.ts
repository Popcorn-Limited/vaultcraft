import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import https from "https";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req
  const { chainId } = query
  const vaults = (await
    axios.get(`https://api.yexporter.io/v1/chains/${chainId}/vaults/all`,
      { timeout: 30000, httpsAgent: new https.Agent({ keepAlive: true }) }
    )
  ).data;
  return res.status(200).json(vaults)
}
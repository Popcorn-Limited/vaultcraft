import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { DuneQueryResult } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const duneRes = await axios.get<DuneQueryResult<any>>(
    "https://api.dune.com/api/v1/query/3238349/results",
    {
      headers: {
        "x-dune-api-key": process.env.DUNE_API_KEY,
      },
    }
  );
  return res.status(200).json(duneRes?.data?.result?.rows[0]?.totalsupply);
}

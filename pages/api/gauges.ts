import { NextApiRequest, NextApiResponse } from "next";
import getGauges from "@/lib/gauges/getGauges";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const result = await getGauges()

  return res
    .status(200)
    .json(result);
}
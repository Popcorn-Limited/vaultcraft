import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  console.log(req)

  return res
    .status(200)
    .json("ok");
}

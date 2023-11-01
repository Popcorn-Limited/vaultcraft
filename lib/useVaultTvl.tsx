import axios from "axios";
import { useEffect, useState } from "react";

export default function useVaultTvl() {
  const [tvl, setTvl] = useState<number>(0);

  useEffect(() => {
    async function getTvlFromLlama() {
      const res = (await axios.get<{
        tvl: {
          date: number
          totalLiquidityUSD: number
        }[]
      }>('https://api.llama.fi/protocol/popcorn')).data
      setTvl(res.tvl[res.tvl.length - 1].totalLiquidityUSD)
    }
    getTvlFromLlama()
  }, [])
  
  return tvl
}
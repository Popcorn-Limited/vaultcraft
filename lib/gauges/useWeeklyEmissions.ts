import { createPublicClient, http } from "viem";
import { RPC_URLS } from "@/lib/utils/connectors";
import { TOKEN_ADMIN, TokenAdminAbi } from "@/lib/constants";
import { mainnet } from "viem/chains";
import { useEffect, useState } from "react";

export default function useWeeklyEmissions() {
  const [rate, setRate] = useState<number>(0);

  useEffect(() => {
    async function loadRate() {
      const rate = await createPublicClient({
        chain: mainnet,
        transport: http(RPC_URLS[1]),
      }).readContract({
        address: TOKEN_ADMIN,
        abi: TokenAdminAbi,
        functionName: "rate",
      });

      // Emissions per second * seconds per week
      setRate((Number(rate) / 1e18) * 604800)
    }
    if (rate === 0) loadRate()
  }, [rate])

  return rate
}

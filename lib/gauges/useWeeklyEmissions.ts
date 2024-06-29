import { createPublicClient, http } from "viem";
import { mainnet } from "wagmi";
import { RPC_URLS } from "@/lib/utils/connectors";
import { TOKEN_ADMIN, TokenAdminAbi } from "@/lib/constants";

import useSwr from "swr";

export default function useWeeklyEmissions() {
  return useSwr(`weeklyEmissions`, {
    dedupingInterval: 15 * 60 * 1000, // 15 minutes cache
    fetcher: async () => {
      const rate = await createPublicClient({
        chain: mainnet,
        transport: http(RPC_URLS[1]),
      }).readContract({
        address: TOKEN_ADMIN,
        abi: TokenAdminAbi,
        functionName: "rate",
      });

      // Emissions per second * seconds per week
      return (Number(rate) / 1e18) * 604800;
    },
  });
}

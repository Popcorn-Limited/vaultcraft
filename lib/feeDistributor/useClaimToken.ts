import { showErrorToast, showSuccessToast } from "lib/toasts";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export function useClaimTokens(address: `0x${string}`, user: `0x${string}`, tokens: string[]) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function claimTokens(address user, address[] calldata tokens) external"],
    functionName: "claimTokens",
    args: [user, tokens],
    chainId: Number(5),
  });

  return useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("wETH Succesfully Claimed!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });
}
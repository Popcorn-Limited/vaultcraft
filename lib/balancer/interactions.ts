import {
  Abi,
  Address,
  PublicClient,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import { showLoadingToast } from "@/lib/toasts";
import { Clients, SimulationResponse } from "@/lib/types";
import { BalancerVaultAbi } from "@/lib/constants/abi/BalancerVault";
import { handleCallResult } from "@/lib/utils/helpers";
import { BALANCER_VAULT, VCX, WETH } from "@/lib/constants";

type SimulationContract = {
  address: Address;
  abi: Abi;
};

interface SimulateProps {
  account: Address;
  contract: SimulationContract;
  functionName: string;
  publicClient: PublicClient;
  args?: any[];
}

async function simulateCall({
  account,
  contract,
  functionName,
  publicClient,
  args,
}: SimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address: contract.address,
      abi: contract.abi,
      // @ts-ignore
      functionName,
      args,
    });
    return { request: request, success: true, error: null };
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage };
  }
}

interface DepositIntoPoolProps {
  maxAmountsIn: bigint[]; // @dev maxAmountsIn must be [wethAmount, vcxAmount]
  account: Address;
  clients: Clients;
}

export async function depositIntoPool({
  maxAmountsIn,
  account,
  clients,
}: DepositIntoPoolProps): Promise<boolean> {
  showLoadingToast("Depositing token into pool...");

  return handleCallResult({
    successMessage: "Deposited into pool succesfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: BALANCER_VAULT,
        abi: BalancerVaultAbi,
      },
      functionName: "joinPool",
      publicClient: clients.publicClient,
      args: [
        "0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633",
        account,
        account,
        {
          assets: [WETH, VCX],
          maxAmountsIn: maxAmountsIn,
          userData: encodeAbiParameters(
            parseAbiParameters("uint8 joinType, uint256[] memory maxAmountsIn"),
            [1, maxAmountsIn]
          ),
          fromInternalBalance: false,
        },
      ],
    }),
    clients,
  });
}

import {
    Abi,
    Address,
    PublicClient,
    encodeAbiParameters,
    parseAbiParameters,
  } from "viem";
  import { showLoadingToast } from "@/lib/toasts";
  import { Clients, SimulationResponse } from "@/lib/types";
  import { PeapodsProxyAbi, PeapodsPodAbi } from "@/lib/constants/abi/PeapodsWrapper";
  import { handleCallResult } from "@/lib/utils/helpers";
  
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

  interface UnwrapFromPodProps {
    account: Address;
    clients: Clients;
    pod: Address; //pToken to unwrap from
    amount: Number; // amount to debond
    outputTokens: Address[]; //output tokens to unwrap into
    percentages: Number[]; // percentages of output tokens - 100 to set 100% 
  }
  
  export async function unwrap({
    account,
    clients,
    pod,
    amount,
    outputTokens,
    percentages
  }: UnwrapFromPodProps): Promise<boolean> {
    showLoadingToast("Unwrapping from pod");
  
    return handleCallResult({
      successMessage: "Unwrapped succesfully!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: pod,
          abi: PeapodsPodAbi,
        },
        functionName: "debond",
        publicClient: clients.publicClient,
        args: [
          amount,
          outputTokens,
          percentages
        ],
      }),
      clients,
    });
  }
  
  interface WrapIntoPodProps {
    account: Address; 
    clients: Clients;
    indexUtils: Address; // target contract
    token: Address; // token to wrap
    pToken: Address; // pToken
    inputAmount: Number; // input amount
    amountOutMin: Number; // min out
  }
  
  export async function wrapIntoPod({
    account,
    clients,
    indexUtils,
    token,
    pToken,
    inputAmount,
    amountOutMin,
  }: WrapIntoPodProps): Promise<boolean> {
    showLoadingToast("Wrapping into pod");
  
    return handleCallResult({
      successMessage: "Wrapped succesfully!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: indexUtils,
          abi: PeapodsProxyAbi,
        },
        functionName: "bond",
        publicClient: clients.publicClient,
        args: [
          pToken,
          token,
          inputAmount,
          amountOutMin
        ],
      }),
      clients,
    });
  }

  interface AddLiquidityAndStakeProps {
    account: Address; 
    clients: Clients;
    indexUtils: Address; // target contract
    pToken: Address; // pVCX
    amountPToken: Number; // input pVCX
    pairedLPToken: Address; // pOHM
    amountLPToken: Number; // input pOHM
    amountLPTokenMin: Number; // min pOHM
    slippage: Number; 
    deadline: Number;
  }
  
  export async function addLiquidityAndStake({
    account,
    clients,
    indexUtils,
    pToken,
    amountPToken,
    pairedLPToken,
    amountLPToken,
    amountLPTokenMin,
    slippage,
    deadline
  }: AddLiquidityAndStakeProps): Promise<boolean> {
    showLoadingToast("Adding and staking liquidity");
  
    return handleCallResult({
      successMessage: "Liquidity succesfully staked",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: indexUtils,
          abi: PeapodsProxyAbi,
        },
        functionName: "addLPAndStake",
        publicClient: clients.publicClient,
        args: [
          pToken,
          amountPToken,
          pairedLPToken,
          amountLPToken,
          amountLPTokenMin,
          slippage,
          deadline
        ],
      }),
      clients,
    });
  }

  interface UnstakeAndRemoveLiquidityProps {
    account: Address; 
    clients: Clients;
    indexUtils: Address; // target contract
    pToken: Address; //pvcx
    amountStakedTokens: Number; // staked LP amount
    minLPTokens: Number; // min LP out
    minPairedLPToken: Number; // min pOHM out
    deadline: Number;
  }

  export async function unstakeAndRemoveLiquidity({
    account,
    clients,
    indexUtils,
    pToken,
    amountStakedTokens,
    minLPTokens,
    minPairedLPToken,
    deadline
  }: UnstakeAndRemoveLiquidityProps): Promise<boolean> {
    showLoadingToast("Unstaking and removing liquidity");
  
    return handleCallResult({
      successMessage: "Liquidity succesfully removed",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: indexUtils,
          abi: PeapodsProxyAbi,
        },
        functionName: "unstakeAndRemoveLP",
        publicClient: clients.publicClient,
        args: [
          pToken,
          amountStakedTokens,
          minLPTokens,
          minPairedLPToken,
          deadline
        ],
      }),
      clients,
    });
  }




  
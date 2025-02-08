import { ALT_NATIVE_ADDRESS } from "@/lib/constants";
import { Balance } from "@/lib/types";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import Safe from "@safe-global/protocol-kit";
import axios from "axios";
import { Address, createPublicClient, encodeFunctionData, erc20Abi, erc4626Abi, formatUnits, http, parseUnits, PublicClient, zeroAddress } from "viem";
import { base, mainnet } from "viem/chains";
import { OperationType, MetaTransactionData } from "@safe-global/types-kit";

type Farm = {
  name: string;
  llamaId: string;
  address: Address;
  apy: number;
  tvl: number;
  yearlyYield: number;
  allocation: bigint;
  plannedAllocation: bigint;
  type: FarmType;
}

enum FarmType {
  ERC20,
  ERC4626,
}

type Asset = {
  address: Address;
  decimals: number;
  balance: Balance;
  price: number;
}

const EMPTY_FARM: Farm = {
  name: "",
  llamaId: "",
  address: zeroAddress,
  apy: 0,
  tvl: 0,
  yearlyYield: 0,
  allocation: BigInt(0),
  plannedAllocation: BigInt(0),
  type: FarmType.ERC20,
};

const farms: Farm[] = [
  {
    ...EMPTY_FARM,
    name: "Aave",
    llamaId: "7e0661bf-8cf3-45e6-9424-31916d4c7b84",
    address: "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"
  },
  {
    ...EMPTY_FARM,
    name: "Compound",
    llamaId: "7e0661bf-8cf3-45e6-9424-31916d4c7b84",
    address: "0xb125E6687d4313864e53df431d5425969c15Eb2F",
  },
];

const ASSET: Asset = {
  address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  decimals: 6,
  balance: {
    value: BigInt(0),
    formatted: "0",
    formattedUSD: "0",
  },
  price: 1,
}

const ROUTER_ADDRESS = "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E"

export default function Test() {
  return <div className="text-white"><button onClick={() => rebalance(farms, 0, "0x3C99dEa58119DE3962253aea656e61E5fBE21613", ASSET, 8453)}>Do Stuff</button></div>;
}

async function rebalance(farms: Farm[], rebalanceThreshold: number, safe: Address, asset: Asset, chainId: number): Promise<void> {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  })

  const idleBudget = await client.readContract({
    address: asset.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [safe]
  })
  console.log("idleBudget: ", formatUnits(idleBudget, asset.decimals))

  farms = await Promise.all(farms.map(farm => prepareFarm(farm, asset, chainId, client)));

  const totalBudget: bigint = farms.reduce((acc, farm) => acc + farm.allocation, BigInt(0)) + idleBudget;
  console.log("totalBudget: ", formatUnits(totalBudget, asset.decimals))
  farms = calculateOptimalAllocation(totalBudget, farms, parseUnits("0.1", asset.decimals), asset, true);
  console.log("farms: ", farms)
  const currentProfit = farms.reduce((acc, farm) =>
    acc + (
      (Number(formatUnits(farm.allocation, asset.decimals)) * asset.price) *
      (farm.apy / 100)),
    0);
  const newProfit = farms.reduce((acc, farm) =>
    acc + (
      (Number(formatUnits(farm.plannedAllocation, asset.decimals)) * asset.price) *
      (farm.apy / 100)),
    0);
  console.log("currentProfit: ", currentProfit)
  console.log("newProfit: ", newProfit)
  if (newProfit > currentProfit + rebalanceThreshold) {
    console.log("rebalancing")
    for (const farm of farms) {
      if (farm.plannedAllocation < farm.allocation) {
        console.log("withdrawing")
        await createTransaction(farm.address, asset.address, farm.allocation - farm.plannedAllocation, chainId, safe, client, 100)
      }
    }
    for (const farm of farms) {
      if (farm.plannedAllocation > farm.allocation) {
        console.log("depositing")
        await createTransaction(asset.address, farm.address, farm.plannedAllocation - farm.allocation, chainId, safe, client, 100)
      }
    }
  } else {
    console.log("not rebalancing")
    if (idleBudget > parseUnits("1000", asset.decimals)) {
      console.log("depositing idle budget")
      farms = calculateOptimalAllocation(idleBudget, farms, parseUnits("1000", asset.decimals), asset, false);
      for (const farm of farms) {
        if (farm.plannedAllocation > farm.allocation) {
          await createTransaction(asset.address, farm.address, farm.plannedAllocation - farm.allocation, chainId, safe, client, 100)
        }
      }
    }
  }
}


async function createTransaction(sellToken: Address, buyToken: Address, amount: bigint, chainId: number, safeAddress: Address, client: PublicClient, slippage: number) {
  const safe = await Safe.init({
    provider: RPC_URLS[chainId],
    signer: process.env.TEST_BOT_PRIVATE_KEY,
    safeAddress: safeAddress,
  });

  const transactions = []
  const allowance = await client.readContract({
    address: sellToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: [safeAddress, ROUTER_ADDRESS],
  })
  if (allowance < amount) {
    const approveTx = await approve(sellToken, amount)
    transactions.push(approveTx)
  }

  const sellTokenAddress = sellToken === ALT_NATIVE_ADDRESS ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : sellToken
  const buyTokenAddress = buyToken === ALT_NATIVE_ADDRESS ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : buyToken
  const ensoRes = (await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=${chainId}&fromAddress=${safeAddress}&spender=${safeAddress}&receiver=${safeAddress}&amountIn=${amount.toLocaleString("fullwide", { useGrouping: false })}&slippage=${slippage}&tokenIn=${sellTokenAddress}&tokenOut=${buyTokenAddress}&routingStrategy=router`,
    { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
  )).data

  transactions.push({
    to: ensoRes.tx.to,
    value: ensoRes.tx.value,
    data: ensoRes.tx.data,
    operation: OperationType.Call,
  })
  console.log("sellToken: ", sellToken)
  console.log("buyToken: ", buyToken)
  console.log("transactions: ", transactions)

  const safeTx = await safe.createTransaction({
    transactions,
    onlyCalls: true,
  });
  const txResponse = await safe.executeTransaction(safeTx);
  console.log("txResponse: ", txResponse)
  const receipt = await client.waitForTransactionReceipt({
    hash: txResponse.hash as `0x${string}`,
  });
  console.log("receipt: ", receipt)
}

async function approve(sellToken: Address, amount: bigint): Promise<MetaTransactionData> {
  const callDataApprove = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [ROUTER_ADDRESS, amount],
  });

  return {
    to: sellToken,
    value: "0",
    data: callDataApprove,
    operation: OperationType.Call,
  };
}


function calculateOptimalAllocation(
  totalBudget: bigint,
  farms: Farm[],
  steps: bigint,
  asset: Asset,
  includeCurrentAllocation: boolean
): Farm[] {
  const stepSize = totalBudget / steps;

  // Allocate budget step by step
  let remainingBudget = totalBudget;

  while (remainingBudget > stepSize) {
    console.log("remainingBudget: ", formatUnits(remainingBudget, asset.decimals))
    let bestFarm: Farm | null = null;
    let bestAPR = -1;

    // Find the avenue that will give the best marginal return for the next allocation
    for (const farm of farms) {
      const currentAllocation = farm.plannedAllocation

      // Calculate marginal APR for next allocation
      const newAllocation = currentAllocation + stepSize;
      const newAllocationUSD = Number(formatUnits(newAllocation, asset.decimals)) * asset.price;
      const currentAllocationUSD = Number(formatUnits(currentAllocation, asset.decimals)) * asset.price;
      // we take out the current allocation from the tvl and add the new allocation as if we would withdraw first and than redeposit
      // we will later calculate how many funds we actually need to add to hit our allocation goal
      const tvlWithoutCurrentAllocation = farm.tvl - (includeCurrentAllocation ? currentAllocationUSD : 0);
      const marginalAPR = farm.yearlyYield / (tvlWithoutCurrentAllocation + newAllocationUSD);

      if (marginalAPR > bestAPR) {
        bestAPR = marginalAPR;
        bestFarm = farm;
      }
    }

    // If we found a valid avenue, allocate to it
    if (bestFarm) {
      console.log("bestFarm: ", bestFarm)
      const currentAllocation = bestFarm.plannedAllocation
      bestFarm.plannedAllocation = currentAllocation + stepSize;
      remainingBudget -= stepSize;
    } else {
      // No valid avenues left
      break;
    }
  }

  return farms;
}

async function prepareFarm(farm: Farm, asset: Asset, chainId: number, client: PublicClient): Promise<Farm> {
  const { apy, tvl } = await fetchLlamaData(farm.llamaId);
  const yearlyYield = (apy / 100) * tvl;
  const allocation = await getAllocation(farm, farm.address, asset, client);
  return {
    ...farm,
    apy,
    tvl,
    yearlyYield,
    allocation,
  }
}

async function fetchLlamaData(apyId: string): Promise<any> {
  const { data } = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/chart/${apyId}`)
  const current = data.data[data.data.length - 1]
  return { apy: current.apyBase, tvl: current.tvlUsd };
}

async function getAllocation(farm: Farm, safe: Address, asset: Asset, client: PublicClient): Promise<bigint> {
  switch (farm.type) {
    case FarmType.ERC20:
      return client.readContract({
        address: farm.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [safe]
      }) as unknown as bigint;
    case FarmType.ERC4626:
      const balance = await client.readContract({
        address: farm.address,
        abi: erc4626Abi,
        functionName: "balanceOf",
        args: [safe]
      }) as unknown as bigint;
      const allocation = await client.readContract({
        address: farm.address,
        abi: erc4626Abi,
        functionName: "convertToAssets",
        args: [balance]
      }) as unknown as bigint;
      return allocation;
  }
}
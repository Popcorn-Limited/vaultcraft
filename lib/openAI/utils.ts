import axios from "axios";
import {
  AssistantMessage,
  VaultDataToolCall,
  VaultDataRes,
  VaultDepositToolCall,
  EnsoCalldata,
  ToolCalls,
} from "./types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";
import { ChainById, ChainId } from "@/lib/utils/connectors";
import { handleAllowance } from "@/lib/approve";
import { Address, Hash, zeroAddress } from "viem";
import { Clients, TokenByAddress } from "../types";
import { AssetAddressesByChainAndName } from "../constants/addresses";

export async function handleToolCalls(
  toolCalls: ToolCalls,
  account: Address,
  clients: Clients,
  tokens: { [key: number]: TokenByAddress }
): Promise<string> {
  let output;

  if (toolCalls.functionName === "encode_deposit_transaction") {
    const res: EnsoCalldata | undefined = await prepareDepositTx(
      toolCalls.arguments,
      account,
      clients,
      tokens
    );

    if (res !== undefined) {
      // don't wait for execution so agent can reply on chat
      const txHash = await handleDepositTx(res, account, clients);

      output = txHash === undefined ? "Something went wrong.." : `Here's your transaction hash ${txHash}`;
    } else {
      output = "Something went wrong, try again with different inputs";
    }
  } else if (toolCalls.functionName === "get_vault_data") {
    output = JSON.stringify(await handleVaultData(toolCalls.arguments));
  } else {
    // uncovered functions to be implemented
    output = "I don't understand your request, specify more details please";
  }

  return output;
}

export const getMessageBody = (message: string) => {
  return {
    role: "user",
    content: `${message}`,
  };
};

export const filterAndMapMessages = (thread: any[]): AssistantMessage[] => {
  return thread
    .filter((msg: any) => msg.content.length > 0)
    .map((msg: any) => ({
      role: msg.role, // "user" or "assistant"
      content: formatContent(msg.content[0].text.value),
      timestamp: msg.created_at,
    }));
};

const handleVaultData = async (callArgs: string): Promise<VaultDataRes[]> => {
  const args: VaultDataToolCall = JSON.parse(callArgs);

  const excludeChains = [ChainId.ALL, ChainId.XLayer];

  if (args.chainId === 0) {
    // user wants data across all chains
    const chainIds = Object.values(ChainId).filter(
      (chainId): chainId is ChainId =>
        typeof chainId === "number" && !excludeChains.includes(chainId)
    );

    let allChainsVaults: VaultDataRes[] = [];
    await Promise.all(
      chainIds.map(async (chainId: number) => {
        if (chainId !== 0) {
          console.log("fetching vaults", chainId);
          const { vaultsData: allVaults } = await getTokenAndVaultsDataByChain({
            chain: ChainById[chainId],
          });
          let chainArgs = args;
          chainArgs.chainId = chainId;

          allChainsVaults.push(...filterVaultData(allVaults, chainArgs));
        }
      })
    );

    return allChainsVaults
      .sort((a, b) => {
        if (args?.apySort) return Number(b.apy) - Number(a.apy);
        else return Number(b.tvl) - Number(a.tvl);
      })
      .slice(0, args.items ?? 5);
  } else {
    // user specified a chain
    const { vaultsData: allVaults } = await getTokenAndVaultsDataByChain({
      chain: ChainById[args.chainId],
    });
    return filterVaultData(allVaults, args);
  }
};

// validate args and call enso
// notifies agent tx is ready to be signed
const prepareDepositTx = async (
  callArgs: string,
  account: Address,
  clients: Clients,
  tokens: { [key: number]: TokenByAddress }
): Promise<EnsoCalldata | undefined> => {
  const args: VaultDepositToolCall = JSON.parse(callArgs);

  const asset: Address =
    args.asset.slice(0, 2) === "0x"
      ? args.asset as Address
      : args.asset in AssetAddressesByChainAndName[args.chainId] ? AssetAddressesByChainAndName[args.chainId][args.asset!] : zeroAddress;

  // asset not found
  if (asset === zeroAddress)
    return undefined;

  const amount = args.amount * (10 ** tokens[args.chainId][asset].decimals);

  const ensoCallData = `https://api.enso.finance/api/v1/shortcuts/route?chainId=${args.chainId}&fromAddress=${account}&receiver=${account}&amountIn=${amount}&slippage=500&disableRFQs=false&tokenIn=${asset}&tokenOut=${args.vault}`;

  try {
    const response = await axios.get(ensoCallData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ENSO_API_KEY}`,
      },
    });

    console.log("ENSO Call submitted", response);

    const ensoRes: EnsoCalldata = response.data;
    ensoRes.amountIn = amount;
    ensoRes.chainId = args.chainId;

    return ensoRes;
  } catch (error) {
    console.error("OpenAI API Error sending message:", error);
    return undefined;
  }
};

const handleDepositTx = async (
  ensoRes: EnsoCalldata,
  account: Address,
  clients: Clients
) : Promise<Hash | undefined> => {
  try {
    await handleAllowance({
      token: ensoRes.route[0].tokenIn[0],
      amount: BigInt(ensoRes.amountIn!),
      account,
      spender: ensoRes.tx.to,
      clients,
    });

    const txHash = await clients.walletClient.sendTransaction({
      chain: ChainById[ensoRes.chainId!],
      account,
      to: ensoRes.tx.to,
      data: ensoRes.tx.data,
      value: BigInt(ensoRes.tx.value),
    });

    return txHash;
  } catch (err) {
    console.log("Error", err);
    return undefined;
  }
};

const filterVaultData = (
  vaults: any[],
  args: VaultDataToolCall
): VaultDataRes[] => {
  let filteredVaults = vaults;

  // filter by asset
  if (args?.asset) {
    const assetsByChain = AssetAddressesByChainAndName[args.chainId];
    if (args.asset in assetsByChain)
      filteredVaults = vaults.filter((vault) => vault.asset === AssetAddressesByChainAndName[args.chainId][args.asset!]);
  }

  filteredVaults = filteredVaults.map((vault) => ({
    address: vault.address,
    asset: vault.asset,
    tvl: vault.tvl,
    name:
      vault.strategies[0] !== undefined
        ? vault.strategies[0].metadata.description
        : "Not found",
    apy: vault.apyData.totalApy,
  }));

  // order by tvl or apy if requested
  // return only 5 items if not requested specifically
  return filteredVaults
    .sort((a, b) => {
      if (args?.apySort) return Number(b.apy) - Number(a.apy);
      else return Number(b.tvl) - Number(a.tvl);
    })
    .slice(0, args.items ?? 5);
};

const formatContent = (msg: string): string => {
  return msg.replace(/【[^】]*】/g, ""); // removes "[source]" from text
};

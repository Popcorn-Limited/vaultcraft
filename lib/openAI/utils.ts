import axios from "axios";
import {
  AssistantMessage,
  VaultDataToolCall,
  VaultDataRes,
  VaultActionToolCall,
  EnsoCalldata,
  ToolCalls,
  VaultBalanceToolCall,
  VaultBalancesRes,
  BalanceAndChain,
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

  if (toolCalls.functionName === "encode_deposit_transaction" || toolCalls.functionName === "encode_withdraw_transaction") {
    const res: EnsoCalldata | undefined = await prepareEnsoTx(
      toolCalls.functionName,
      toolCalls.arguments,
      account,
      tokens
    );

    if (res !== undefined) {
      // don't wait for execution so agent can reply on chat
      const txHash = await handleEnsoTx(res, account, clients);

      output = txHash === undefined ? "Something went wrong.." : `Here's your transaction hash ${txHash}`;
    } else {
      output = "Something went wrong, try again with different inputs";
    }
  } else if (toolCalls.functionName === "get_vault_data") {
    output = JSON.stringify(await handleVaultData(toolCalls.arguments));
  } else if (toolCalls.functionName === "get_balance") {
    output = JSON.stringify(await handleBalanceCall(toolCalls.arguments, tokens), (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  } else {
    // uncovered functions to be implemented
    output = "I don't understand your request, specify more details ple\ase";
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

const handleBalanceCall = async (callArgs: string, tokens: { [key: number]: TokenByAddress }): Promise<VaultBalancesRes> => {
  let balances: VaultBalancesRes = {}
  const zeroBal: BalanceAndChain = { balance: { value: BigInt(0), formatted: "0", formattedUSD: "0" }, chain: "undefined" };

  const args: VaultBalanceToolCall = JSON.parse(callArgs);

  if (args.vault !== undefined) {
    // return balance of a specified chain and vault
    if (args.chainId in ChainId)
      if (args.vault! in tokens[args.chainId])
        balances[args.vault!] = { balance: tokens[args.chainId][args.vault!].balance, chain: ChainById[args.chainId].name };
      else
        balances[args.vault!] = zeroBal;
    else
      balances[args.vault!] = zeroBal;
  } else {
    // return balances of all vaults on the specified chain

    if (args.chainId in ChainId && args.chainId !== ChainId.ALL) {
      const { vaultsData: allVaults } = await getTokenAndVaultsDataByChain({
        chain: ChainById[args.chainId],
      });

      allVaults.flatMap((vault) => vault.gauge !== zeroAddress ? [vault.address, vault.gauge!] : [vault.address])
        .filter((vault) => {
          if (tokens[args.chainId] === undefined) {
            return false;
          } else {
            if (vault in tokens[args.chainId])
              return tokens[args.chainId][vault].balance.value > 0
            return false;
          }
        })
        .map((vault) => balances[vault] = { balance: tokens[args.chainId][vault].balance, chain: ChainById[args.chainId].name })
    } else if (args.chainId === ChainId.ALL) {
      // return all balances across all chains
      const excludeChains = [ChainId.ALL, ChainId.XLayer];
      const chainIds = Object.values(ChainId).filter(
        (chainId): chainId is ChainId =>
          typeof chainId === "number" && !excludeChains.includes(chainId)
      );

      await Promise.all(
        chainIds.map(async (chainId: number) => {
          if (chainId !== 0) {
            const { vaultsData: allVaults } = await getTokenAndVaultsDataByChain({
              chain: ChainById[chainId],
            });

            allVaults.flatMap((vault) => vault.gauge !== zeroAddress ? [vault.address, vault.gauge!] : [vault.address])
              .filter((vault) => {
                if (tokens[chainId] === undefined) {
                  return false;
                } else {
                  if (vault in tokens[chainId])
                    return tokens[chainId][vault].balance.value > 0
                  return false;
                }
              })
              .map((vault) => balances[vault] = { balance: tokens[chainId][vault].balance, chain: ChainById[chainId].name })
          }
        })
      );
    } else {
      balances[zeroAddress] = zeroBal;
    }
  }
  return balances;
}

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

const prepareEnsoTx = async (
  functionName: string,
  callArgs: string,
  account: Address,
  tokens: { [key: number]: TokenByAddress }
): Promise<EnsoCalldata | undefined> => {

  const isDeposit: boolean = functionName === "encode_deposit_transaction";
  const args: VaultActionToolCall = JSON.parse(callArgs);

  const asset: Address =
    args.asset.slice(0, 2) === "0x"
      ? args.asset as Address
      : args.asset in AssetAddressesByChainAndName[args.chainId] ? AssetAddressesByChainAndName[args.chainId][args.asset!] : zeroAddress;

  // asset not found
  if (asset === zeroAddress)
    return undefined;

  // TODO vault/asset existance
  const amount = isDeposit
    ? args.amount !== undefined
      ? args.amount! ** (10 ** tokens[args.chainId][asset].decimals) // deposit specified amount
      : Number(tokens[args.chainId][asset].balance.value) // deposit all asset balance
    : args.amount !== undefined
      ? args.amount! * (10 ** tokens[args.chainId][args.vault].decimals) // withdraw a specific amount of shares
      : Number(tokens[args.chainId][args.vault].balance.value); // withdraw all shares

  let ensoCallData: string = "";
  isDeposit ?
    ensoCallData = `https://api.enso.finance/api/v1/shortcuts/route?chainId=${args.chainId}&fromAddress=${account}&receiver=${account}&amountIn=${amount}&slippage=500&disableRFQs=false&tokenIn=${asset}&tokenOut=${args.vault}`
    :
    ensoCallData = `https://api.enso.finance/api/v1/shortcuts/route?chainId=${args.chainId}&fromAddress=${account}&receiver=${account}&amountIn=${amount}&slippage=500&disableRFQs=false&tokenIn=${args.vault}&tokenOut=${asset}`;

  try {
    const response = await axios.get(ensoCallData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ENSO_API_KEY}`,
      },
    });

    const ensoRes: EnsoCalldata = response.data;
    ensoRes.amountIn = amount;
    ensoRes.chainId = args.chainId;

    return ensoRes;
  } catch (error) {
    console.error("OpenAI API Error sending message:", error);
    return undefined; // TODO err object
  }
};

const handleEnsoTx = async (
  ensoRes: EnsoCalldata,
  account: Address,
  clients: Clients
): Promise<Hash | undefined> => {
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
    chain: ChainById[vault.chainId].name,
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

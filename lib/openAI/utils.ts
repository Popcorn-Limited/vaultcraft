import axios from "axios";
import {
    AssistantMessage, VaultDataToolCall, VaultDataRes, VaultDepositToolCall
} from "./types";
import getTokenAndVaultsDataByChain from "@/lib/getTokenAndVaultsData";
import { ChainById } from "@/lib/utils/connectors";
import { Address, Hex } from "viem";
import { Clients } from "../types";
import { AssetAddressesByChainAndName } from "../constants/addresses";

export const handleVaultData = async (callArgs: string): Promise<VaultDataRes[]> => {
    const args: VaultDataToolCall = JSON.parse(callArgs);

    const { vaultsData: allVaults } = await getTokenAndVaultsDataByChain({ chain: ChainById[args.chainId] });

    return filterVaultData(allVaults, args);
}

// TODO split into prepare func and trigger func
export const handleDepositTx = async (callArgs: string, account: Address, clients: Clients): Promise<string> => {
    const args: VaultDepositToolCall = JSON.parse(callArgs);

    // get asset address from name
    // validate output vault 
    // return output in case of errors 
    const asset = args.asset.slice(0,2) === "0x" ? args.asset : AssetAddressesByChainAndName[args.chainId][args.asset];

    // TODO decimals
    const amount = args.amount * 1e6;    
    const ensoCallData = `https://api.enso.finance/api/v1/shortcuts/route?chainId=${args.chainId}&fromAddress=${account}&receiver=${account}&amountIn=${amount}&slippage=500&disableRFQs=false&tokenIn=${asset}&tokenOut=${args.vault}`;

    console.log("DEPOSIT tx", account, asset, ensoCallData);
    try {
        const response = await axios.get(ensoCallData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.ENSO_API_KEY}`,
            },
        });

        console.log("ENSO Call submitted", response);

        // TODO validate output data
        await clients.walletClient.sendTransaction({
            chain: ChainById[args.chainId],
            account,
            to: response.data.tx.to as Address,
            data: response.data.tx.data as Hex,
            value: response.data.tx.value as bigint
        });

        return "Ok"; // Todo continue flow
    } catch (error) {
        console.error("OpenAI API Error sending message:", error);
        return "Error";
    }
}

export const getMessageBody = (message: string) => {
    // TODO format message

    return {
        "role": "user",
        "content": `${message}`
    }
}

export const filterAndMapMessages = (thread: any[]): AssistantMessage[] => {
    return thread.filter((msg: any) => msg.content.length > 0).map((msg: any) => ({
        role: msg.role, // "user" or "assistant"
        content: formatContent(msg.content[0].text.value),
        timestamp: msg.created_at
    }));
}

const filterVaultData = (vaults: any[], args: VaultDataToolCall): VaultDataRes[] => {
    let filteredVaults = vaults;

    // filter by asset
    if (args?.asset) {
        const asset = AssetAddressesByChainAndName[args.chainId][args.asset];
        filteredVaults = vaults.filter((vault) => vault.asset === asset);
    }

    filteredVaults = filteredVaults.map((vault) => ({
        address: vault.address,
        asset: vault.asset,
        tvl: vault.tvl,
        name: vault.strategies[0] !== undefined ? vault.strategies[0].metadata.description : "Not found",
        apy: vault.apyData.totalApy
    }));

    // order by tvl or apy if requested
    // return only 5 items if not requested specifically
    return filteredVaults.sort((a, b) => {
        if (args?.apySort)
            return Number(b.apy) - Number(a.apy)
        else
            return Number(b.tvl) - Number(a.tvl)
    }).slice(0, args.items ?? 5);
}

const formatContent = (msg: string): string => {
    return msg.replace(/【[^】]*】/g, ""); // removes "[source]" from text
}
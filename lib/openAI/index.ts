import axios from "axios";
import {
    AssistantMessage, ToolCalls, RequiredActions, RunStatus, CreateThreadRunProps, SendMessageProps,
    GetMessagesProps, AgentReplyProps, PollRunProps,
    Thread,
    VaultDataToolCall, VaultDataRes
} from "./types";

const getMessageBody = (message: string) => {
    const fileSearch = message.toLowerCase().includes("mainnet") ? `${process.env.MAINNET_FILE_ID}`
        : message.toLowerCase().includes("arbitrum") ? `${process.env.ARBITRUM_FILE_ID}`
            : message.toLowerCase().includes("optimism") ? `${process.env.OPTIMISM_FILE_ID}`
                : message.toLowerCase().includes("base") ? `${process.env.BASE_FILE_ID}`
                    : "";

    // return fileSearch !== "" ?
    //     {
    //         "role": "user",
    //         "content": `${message}`,
    //         "attachments": [{ "file_id": fileSearch, "tools": [{ "type": "file_search" }] }]
    //     }
    //     :
    return {
        "role": "user",
        "content": `${message}`
    }
}

const filterVaultData = (vaults: any[], args: VaultDataToolCall): VaultDataRes[] => {
    const filteredVaults: any[] = vaults.filter((vault) => {
        if(args?.asset)
            return (vault.asset === args?.asset)
        return true;
    });
    
    // order vaults 

    // return only a few if asked

    console.log("FILTER", filteredVaults);

    return filteredVaults.map((vault) => ({
        address: vault.address,
        asset: vault.assetAddress,
        name: vault.name,
        apy: "10%"
    }));
}

const handleVaultData = async (callArgs: string): Promise<VaultDataRes[]> => {
    const args: VaultDataToolCall = JSON.parse(callArgs);

    console.log("FWTCHING", args.chainId);

    const { data: allVaults } = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/${args.chainId}.json`
    );

    const { data: hiddenVaults } = await axios.get(
        `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/vaults/hidden/${args.chainId}.json`
    );

    console.log("VAULTS", allVaults);

    const vaults = Object.values(allVaults)
        .filter((vault: any) => !hiddenVaults.includes(vault.address))
        .filter((vault: any) => vault.type !== "single-asset-lock-vault-v1")

    return filterVaultData(vaults, args);
}

const handleDepositTx = (callArgs: string): string => {
    const args = JSON.parse(callArgs);

    // use chainID to switch wallet
    // get asset address from name
    // validate output vault 
    // call enzo for calldata 
    // trigger tx

    return `0x6e553f65
        00000000000000000000000000000000000000000000000000005af3107a4000
        000000000000000000000000f2e9fec0f136c9e8992257855554c221856f769f
    `;
}

export async function handleToolCalls(runProps: PollRunProps, toolCalls: ToolCalls): Promise<boolean> {
    console.log("TOOL call", toolCalls);

    let output;

    if (toolCalls.functionName === "encode_deposit_transaction") {
        handleDepositTx(toolCalls.arguments);
        output = "executing...";
    } else if (toolCalls.functionName === "get_vault_data") {
        console.log("VAULT DATA");
        output = await handleVaultData(toolCalls.arguments);
        console.log(output)
    }

    try {
        const response = await axios.post(`https://api.openai.com/v1/threads/${runProps.threadId}/runs/${runProps.runId}/submit_tool_outputs`, {
            "tool_outputs": [
                {
                    "tool_call_id": toolCalls.id,
                    "output": output,
                }
            ]
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });
        console.log("TOOL OUTPUT SUBMITTED", response);
        return true;
    } catch (error) {
        console.error("OpenAI API Error sending message:", error);
        return false;
    }
}


export async function pollRunStatus({
    threadId,
    runId
}: PollRunProps): Promise<RunStatus> {
    console.log("Poll run status");

    try {
        const res = await axios.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });
        console.log("OK", res);

        if (res.data.status === "completed") {
            return { status: "completed" }
        } else if (res.data.status === "requires_action") {
            console.log("REQUIR")
            return {
                status: res.data.status,
                requiredActions: {
                    type: res.data.required_action.type,
                    toolCalls: [{
                        id: res.data.required_action.submit_tool_outputs.tool_calls[0].id,
                        functionName: res.data.required_action.submit_tool_outputs.tool_calls[0].function.name,
                        arguments: res.data.required_action.submit_tool_outputs.tool_calls[0].function.arguments,
                    }]
                }
            };
        } else if (res.data.status === "in_progress" || res.data.status === "queued") {
            return { status: "in_progress" };
        } else {
            // TODO
            return { status: "error" };
        }
    } catch (error) {
        console.error("OpenAI API Error sending message:", error);
        return { status: "error" };
    }
}

export async function createThreadAndRun({
    agentId,
    message
}: CreateThreadRunProps): Promise<Thread | null> {
    console.log("creating thread");

    try {
        const response = await axios.post(`https://api.openai.com/v1/threads/runs`, {
            "assistant_id": `${agentId}`,
            "thread": {
                "messages": [getMessageBody(message)]
            }
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });
        console.log("OK", response.data.thread_id);

        return { threadId: response.data.thread_id, runId: response.data.id };
    } catch (error) {
        console.error("OpenAI API Error sending message:", error);
        return null;
    }
}

export async function sendAgentMessage({
    threadId,
    message
}: SendMessageProps): Promise<boolean> {
    try {
        const response = await axios.post(`https://api.openai.com/v1/threads/${threadId}/messages`, getMessageBody(message), {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });
        console.log("MESSAGE SENT");
        return true;
    } catch (error) {
        console.error("OpenAI API Error sending message:", error);
        return false;
    }
}

const formatContent = (msg: string): string => {
    return msg.replace(/【[^】]*】/g, ""); // removes "[source]" from text
}

const filterAndMapMessages = (thread: any[]): AssistantMessage[] => {
    return thread.filter((msg: any) => msg.content.length > 0).map((msg: any) => ({
        role: msg.role, // "user" or "assistant"
        content: formatContent(msg.content[0].text.value),
        timestamp: msg.created_at
    }));
}

export async function getMessages({
    threadId
}: GetMessagesProps): Promise<AssistantMessage[]> {
    try {
        const response = await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });

        return filterAndMapMessages(response.data.data);
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return [];
    }
}

// todo res object
export async function agentReply({
    threadId,
    agentId
}: AgentReplyProps): Promise<boolean> {
    try {
        const res = await axios.post(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            "assistant_id": `${agentId}`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });

        console.log(res);

        return true;
    } catch (error) {
        return false;
    }
}


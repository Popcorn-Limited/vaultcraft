import axios from "axios";
import {
    AssistantMessage, ToolCalls, RunStatus, CreateThreadRunProps, SendMessageProps,
    GetMessagesProps, AgentReplyProps, PollRunProps,
    Thread
} from "./types";
import { Address } from "viem";
import { Clients } from "../types";
import { handleVaultData, handleDepositTx, getMessageBody, filterAndMapMessages } from "./utils";

// todo refactor
export async function handleToolCalls(runProps: PollRunProps, toolCalls: ToolCalls, account: Address, clients: Clients): Promise<boolean> {
    let output;

    if (toolCalls.functionName === "encode_deposit_transaction") {
        output = "executing...";
    } else if (toolCalls.functionName === "get_vault_data") {
        output = JSON.stringify(await handleVaultData(toolCalls.arguments));
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

        if (toolCalls.functionName === "encode_deposit_transaction") {
            // don't wait for it so agent can reply on chat
            handleDepositTx(toolCalls.arguments, account, clients)
        }

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

        if (res.data.status === "completed") {
            return { status: "completed" }
        } else if (res.data.status === "requires_action") {
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

export async function agentReply({
    threadId,
    agentId
}: AgentReplyProps): Promise<string | null> {
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

        return res.data.id;
    } catch (error) {
        return null;
    }
}
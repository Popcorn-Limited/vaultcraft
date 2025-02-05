import { showLoadingToast, showSuccessToast, showErrorToast } from "@/lib/toasts";
import { toast } from "react-hot-toast";
import axios from "axios";

export type AssistantMessages = {
    role: string;
    content: string;
    timestamp: number;
}

export interface CreateThreadRunProps {
    agentId: string;
    message: string;
}

export interface SendMessageProps {
    threadId: string;
    message: string;
}

export interface GetMessagesProps {
    threadId: string;
}

export interface AgentReplyProps {
    threadId: string;
    agentId: string;
}

export async function createThreadAndRun({
    agentId,
    message
}: CreateThreadRunProps): Promise<string | null> {
    showLoadingToast("Sending message..");

    try {
        const response = await axios.post(`https://api.openai.com/v1/threads/runs`, {
            "assistant_id": `${agentId}`,
            "thread": {
                "messages": [
                    { "role": "user", "content": `${message}` }
                ]
            }
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });

        showSuccessToast("ok");

        return response.data.thread_id;
    } catch (error) {
        showErrorToast(`OpenAI API Error:, ${error}`);
        console.error("OpenAI API Error sending message:", error);
        return null;
    }
}

export async function sendAgentMessage({
    threadId,
    message
}: SendMessageProps): Promise<boolean> {
    showLoadingToast("Sending message..");

    try {
        const response = await axios.post(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            "role": "user",
            "content": `${message}`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });
        showSuccessToast("ok");

        return true;
    } catch (error) {
        showErrorToast(`OpenAI API Error:, ${error}`);
        console.error("OpenAI API Error sending message:", error);
        return false;
    }
}

export async function getMessages({
    threadId
}: GetMessagesProps): Promise<AssistantMessages[]> {
    showLoadingToast("Fetching thread..");
    try {
        const response = await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });

        const formattedMessages = response.data.data.map((msg: any) => ({
            role: msg.role, // "user" or "assistant"
            content: msg.content[0].text.value,
            timestamp: msg.created_at
        }));

        showSuccessToast("ok");

        return formattedMessages
    } catch (error) {
        showErrorToast(`OpenAI API Error:, ${error}`);
        console.error("OpenAI API Error:", error);
        return [];
    }
}

export async function agentReply({
    threadId,
    agentId
}: AgentReplyProps): Promise<boolean> {
    showLoadingToast("Waiting for agent to reply..")
    try {
        // todo response obj?
        const response = await axios.post(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            "assistant_id": `${agentId}`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });

        showSuccessToast("Ok")
        return true;

    } catch (error) {
        showErrorToast(error);

        return false;
    }
}


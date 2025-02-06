import axios from "axios";

export type AssistantMessage = {
    role: string;
    content: string;
    timestamp: number;
    error?: boolean;
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

        return response.data.thread_id;
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
        return true;
    } catch (error) {
        console.error("OpenAI API Error sending message:", error);
        return false;
    }
}

const formatContent = (msg:string):string => {
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
        await axios.post(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            "assistant_id": `${agentId}`
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPEN_AI_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            },
        });

        return true;
    } catch (error) {
        return false;
    }
}


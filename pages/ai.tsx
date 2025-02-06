import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { getMessages, agentReply, sendAgentMessage, createThreadAndRun, AssistantMessage } from "@/lib/openAI/";
import MainActionButton from "@/components/button/MainActionButton";

export default function VaultcraftAgent() {
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [userInput, setUserInput] = useState("");
    const [thread, setThread] = useState("");

    const createThread = async (input: string) => {
        toast.loading("Waiting for agent..");
        setUserInput("");

        const threadId = await createThreadAndRun({ agentId: process.env.AGENT_ID!, message: input });

        if (threadId !== null) {
            setThread(threadId);

            // add new message at beginning
            setMessages([{ role: "user", content: input, timestamp: Date.now() / 1000 }]);

            // run response - reload messages
            await pollResponse(threadId);
        } else {
            // append error
            toast.dismiss();
            setMessages([
                { role: "assistant", content: "Error loading up the thread, try refreshing the page!", timestamp: Date.now() / 1000, error: true },
                { role: "user", content: input, timestamp: Date.now() / 1000 },
                ...messages,
            ]);
        }
    }

    const pollResponse = async (thread: string) => {
        let attempts = 0;

        while (attempts < 20) {
            const newMessages = await getMessages({ threadId: thread });

            if (newMessages.length > 0) {
                if (newMessages[0].role === "assistant") {
                    setMessages(newMessages);
                    toast.dismiss();
                    return;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
            attempts++;
        }

        // error polling
        setMessages([
            { role: "assistant", content: "Error loading up the thread, try refreshing the page!", timestamp: Date.now() / 1000, error: true },
            ...messages
        ]);
    };

    const replyToMessage = async (thread: string) => {
        toast.loading("Waiting for agent to reply..");

        // trigger agent reply
        const res = await agentReply({ threadId: thread, agentId: process.env.AGENT_ID! });

        if (res) {
            // pull response
            await pollResponse(thread);
        } else {
            // reply error
            setMessages([{ role: "assistant", content: "Assistant has encountered issues replying, try refreshing the page!", timestamp: Date.now() / 1000, error: true }, ...messages]);
            toast.dismiss();
        }

    }

    const sendMessage = async (input: string) => {
        toast.loading("Sending message..");
        setUserInput("");

        const res = await sendAgentMessage({ threadId: thread, message: input });

        if (res) {
            toast.dismiss();

            // push message
            setMessages([{ role: "user", content: input, timestamp: Date.now() / 1000 }, ...messages]);

            // run response
            await replyToMessage(thread);
        } else {
            // error
            setMessages([{ role: "assistant", content: "Error sending the message", timestamp: Date.now() / 1000, error: true }, ...messages]);
            toast.dismiss();
        }
    }

    const handleChange = (event: any) => {
        setUserInput(event.target.value);
    };

    const displayDate = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        const minutes = `0${date.getMinutes()}`;
        const seconds = `0${date.getSeconds()}`;

        return `${date.getHours()}:${minutes.slice(-2)}:${seconds.slice(-2)}`;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", height: "auto", width: "auto", backgroundColor: "#f0f2f5", padding: "20px", boxSizing: "border-box" }}>
            <h1 style={{ textAlign: "center", color: "#333"}}><b>Chat with the Vaultcraft Agent</b></h1>
            <div
                style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "8px",
                    height: "400px",
                    overflowY: "auto",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column-reverse"
                }}
            >
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        margin: "5px 0"
                    }}>
                        <span
                            style={{
                                display: "inline-block",
                                padding: "10px 15px",
                                borderRadius: "20px",
                                backgroundColor: msg.role === "user" ? "#0084ff" : "#e5e5ea",
                                color: msg.error ? "#ff0000" : msg.role === "user" ? "#fff" : "#000",
                                maxWidth: "75%",
                                fontSize: "14px",
                                lineHeight: "1.4"
                            }}
                        >
                            {`${msg.content} - ${displayDate(msg.timestamp)}`}
                        </span>
                    </div>
                ))}
            </div>
            <input style={{marginTop: "20px"}}
                type="text"
                value={userInput}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 w-full"
                placeholder="Type something..."
            />
            <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
                <MainActionButton disabled={userInput === ""} label="Send Message" handleClick={() => { thread === "" ? createThread(userInput) : sendMessage(userInput) }}/>
                <MainActionButton disabled={thread === ""} label="Reload thread" handleClick={() => pollResponse(thread)}/>
            </div>
        </div>
    );
};
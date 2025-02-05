import React, { useEffect, useState } from "react";
import { getMessages, agentReply, sendAgentMessage, createThreadAndRun } from "@/lib/openAI/index";
import { ethers } from "ethers";
import axios from "axios";
import { formatBalance, handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { sendTransaction } from '@wagmi/core'
import { http, createConfig } from '@wagmi/core'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { showErrorToast } from "@/lib/toasts";


export default function ChatbotTransaction() {
    // todo run a new thread on every new reload?
    // how can we associate a user to a thread without a db? 
    const [messages, setMessages] = useState<{ role: string; content: string, timestamp: number }[]>([]);
    const [userInput, setUserInput] = useState("");
    const [showActions, setShowActions] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [assetInputDeposit, setAssetInputDeposit] = useState()
    const [vaultOutput, setVaultOutput] = useState()
    const [thread, setThread] = useState("");

    const createThread = async (input: string) => {
        setUserInput("");
        
        const threadId = await createThreadAndRun({agentId: process.env.AGENT_ID!, message: input});
        
        if(threadId !== null) {
            setThread(threadId);
    
            // add new message at beginning
            setMessages([{ role: "user", content: input, timestamp: Date.now() }]);
    
            // run response - reload messages
            await pollResponse(threadId);
        }
    }

    const pollResponse = async (thread: string) => {
        let attempts = 0;

        while (attempts < 20) {
            console.log("POLLING", attempts);

            const newMessages = await getMessages({ threadId: thread });

            if (newMessages.length > 0) {
                console.log("MES", newMessages);

                if (newMessages[0].role === "assistant") {
                    setMessages(newMessages);
                    break;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 2 seconds
            attempts++;
        }
    };

    const replyToMessage = async (thread: string) => {
        const res = await agentReply({ threadId: thread, agentId: process.env.AGENT_ID! });

        // wait for response 
        if (res)
            await pollResponse(thread);

    }

    const sendMessage = async (input: string) => {
        setUserInput("");

        const res = await sendAgentMessage({threadId: thread, message: input});

        if(res) {
            // add new message at beginning
            setMessages([{ role: "user", content: input, timestamp: Date.now() }, ...messages]);

            // run response - reload messages
            await replyToMessage(thread);
        }
    }

    const handleChange = (event: any) => {
        setUserInput(event.target.value);
    };
    
    const handleInputDeposit = (event: any) => {
        setAssetInputDeposit(event.target.value);
    }

    const handleVaultOutput = (event: any) => {
        setVaultOutput(event.target.value);
    }

    const handleDeposit = async () => {
        console.log("SEND TX", assetInputDeposit, vaultOutput);
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", height: "100vh", backgroundColor: "#f0f2f5", padding: "20px", boxSizing: "border-box" }}>
            {
                !showActions && (
                    <div>
                        <h2 style={{ textAlign: "center", color: "#333" }}>Chat with Assistant</h2>
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
                                            color: msg.role === "user" ? "#fff" : "#000",
                                            maxWidth: "75%",
                                            fontSize: "14px",
                                            lineHeight: "1.4"
                                        }}
                                    >
                                        {`${msg.content} - ${msg.timestamp}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={userInput}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 w-full"
                            placeholder="Type something..."
                        />
                        <button onClick={() => { thread === "" ? createThread(userInput) : sendMessage(userInput) }} style={{ marginTop: "10px", padding: "10px", width: "100%", borderRadius: "5px", border: "none", backgroundColor: "#0084ff", color: "white", cursor: "pointer", fontSize: "16px" }}>
                            Send Message
                        </button>
                        <button disabled={thread === ""} onClick={() => pollResponse(thread)} style={{ marginTop: "10px", padding: "10px", width: "100%", borderRadius: "5px", border: "none", backgroundColor: "#0084ff", color: "white", cursor: "pointer", fontSize: "16px" }}>
                            Reload thread
                        </button>
                    </div>
                )}
            <div className="p-4">
                <button onClick={() => setShowActions(!showActions)} style={{ marginTop: "10px", padding: "10px", width: "100%", borderRadius: "5px", border: "none", backgroundColor: "#0084ff", color: "white", cursor: "pointer", fontSize: "16px" }}>
                    {!showActions ? "Select Action" : "Chat with Agent"}
                </button>
                {showActions && (
                    <div className="flex gap-2">
                        <button onClick={() => setShowDeposit(!showDeposit)} style={{ marginTop: "10px", padding: "10px", width: "100%", borderRadius: "5px", border: "none", backgroundColor: "#0084ff", color: "white", cursor: "pointer", fontSize: "16px" }}>Deposit</button>
                        <button style={{ marginTop: "10px", padding: "10px", width: "100%", borderRadius: "5px", border: "none", backgroundColor: "#0084ff", color: "white", cursor: "pointer", fontSize: "16px" }}>Withdraw</button>
                    </div>
                )}
            </div>
            <div className="p-4">
                {
                    showDeposit && showActions && (
                        <div>
                            <input
                                type="text"
                                value={assetInputDeposit}
                                onChange={handleInputDeposit}
                                className="border border-gray-300 rounded p-2 w-full"
                                placeholder="Input token address"
                            />
                            <input
                                type="text"
                                value={vaultOutput}
                                onChange={handleVaultOutput}
                                className="border border-gray-300 rounded p-2 w-full"
                                placeholder="Vault to deposit into"
                            />
                            <button onClick={() => handleDeposit} style={{ marginTop: "10px", padding: "10px", width: "100%", borderRadius: "5px", border: "none", backgroundColor: "#0084ff", color: "white", cursor: "pointer", fontSize: "16px" }}>
                                Deposit!
                            </button>
                        </div>
                    )}
            </div>
        </div>
    );
};
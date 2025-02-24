import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  getMessages,
  agentReply,
  sendAgentMessage,
  createThreadAndRun,
  pollRunStatus,
  serveToolCalls,
} from "@/lib/openAI/";
import {
  AssistantMessage,
  Thread,
  VaultActionToolCall,
} from "@/lib/openAI/types";
import MainActionButton from "@/components/button/MainActionButton";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useSwitchChain,
} from "wagmi";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function VaultcraftAgent() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [threadId, setThread] = useState("");
  const [runId, setRunId] = useState("");
  const [polling, setPolling] = useState(false);
  const [tokens] = useAtom(tokensAtom)

  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const createThread = async (input: string) => {
    toast.loading("Waiting for agent..");
    setUserInput("");

    const thread: Thread | null = await createThreadAndRun({
      agentId: process.env.AGENT_ID!,
      message: input,
    });

    if (thread !== null) {
      setThread(thread.threadId);
      setRunId(thread.runId);

      // add new message at beginning
      setMessages([
        { role: "user", content: input, timestamp: Date.now() / 1000 },
      ]);

      // run response - reload messages
      await pollResponse(thread.threadId, thread.runId);
    } else {
      // append error
      toast.dismiss();
      setMessages([
        {
          role: "assistant",
          content: "Error loading up the thread, try refreshing the page!",
          timestamp: Date.now() / 1000,
          error: true,
        },
        { role: "user", content: input, timestamp: Date.now() / 1000 },
        ...messages,
      ]);
    }
  };

  const loadThread = async (threadId: string) => {
    let attempts = 0;

    // load thread
    while (attempts < 15) {
      const newMessages = await getMessages({ threadId });

      // todo with 2 consecutives assistant message, last one might not be loaded
      // if the getMessages happen when second one isn't in yet
      if (newMessages.length > 0) {
        if (newMessages[0].role === "assistant") {
          setMessages(newMessages);
          toast.dismiss();
          setPolling(false);
          return;
        } else {
          setMessages(newMessages);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 4000));
      attempts++;
    }

    // error polling
    setMessages([
      {
        role: "assistant",
        content: "Error loading up the thread, try refreshing the page!",
        timestamp: Date.now() / 1000,
        error: true,
      },
      ...messages,
    ]);
  };

  const pollResponse = async (threadId: string, runId: string) => {
    setPolling(true);

    const runStatus = await pollRunStatus({ threadId, runId });

    if (runStatus.status === "completed") {
      await loadThread(threadId);
    } else if (runStatus.status === "requires_action") {
      if (
        runStatus.requiredActions!.toolCalls[0].functionName === "encode_deposit_transaction"
        || runStatus.requiredActions!.toolCalls[0].functionName === "encode_withdraw_transaction"
      ) {
        const args: VaultActionToolCall = JSON.parse(
          runStatus.requiredActions!.toolCalls[0].arguments
        );
        if (chain?.id !== args.chainId) {
          try {
            await switchChainAsync?.({ chainId: args.chainId });
          } catch (error) { }
        }
      }

      // function call response
      const res: boolean = await serveToolCalls(
        { threadId, runId },
        runStatus.requiredActions!.toolCalls[0],
        account!,
        { publicClient: publicClient!, walletClient: walletClient! },
        tokens
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await pollResponse(threadId, runId);
    } else if (runStatus.status === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await pollResponse(threadId, runId);
    } else {
      setPolling(false);
      // append error
      toast.dismiss();
      setMessages([
        {
          role: "assistant",
          content: "Error connecting to the assistant",
          timestamp: Date.now() / 1000,
          error: true,
        },
        ...messages,
      ]);
      // TODO error obj
    }
  };

  const replyToMessage = async (thread: string) => {
    toast.loading("Waiting for agent to reply..");

    // trigger agent reply
    const res: string | null = await agentReply({
      threadId: thread,
      agentId: process.env.AGENT_ID!,
    });

    if (res !== null) {
      // pull response - new runId is provided
      setRunId(res);
      await pollResponse(thread, res);
    } else {
      // reply error
      setMessages([
        {
          role: "assistant",
          content:
            "Assistant has encountered issues replying, try refreshing the page!",
          timestamp: Date.now() / 1000,
          error: true,
        },
        ...messages,
      ]);
      toast.dismiss();
    }
  };

  const sendMessage = async (input: string) => {
    toast.loading("Sending message..");
    setUserInput("");

    const res = await sendAgentMessage({ threadId, message: input });

    if (res) {
      toast.dismiss();

      // push message
      setMessages([
        { role: "assistant", content: "Thinking...", timestamp: Date.now() / 1000 },
        { role: "user", content: input, timestamp: Date.now() / 1000 },
        ...messages,
      ]);

      // run response
      await replyToMessage(threadId);
    } else {
      // error
      setMessages([
        {
          role: "assistant",
          content: "Error sending the message",
          timestamp: Date.now() / 1000,
          error: true,
        },
        ...messages,
      ]);
      toast.dismiss();
    }
  };

  const handleChange = (event: any) => {
    setUserInput(event.target.value);
  };

  const displayDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const minutes = `0${date.getMinutes()}`;
    const seconds = `0${date.getSeconds()}`;

    return `${date.getHours()}:${minutes.slice(-2)}:${seconds.slice(-2)}`;
  };


  const formatText = (text: string) => {
    const vaults = text.split(/(\d+\.\s)/g).filter(Boolean);

    return (
      <ul>
        {vaults.map((vault, index) => {
          if (/^\d+\.\s/.test(vault)) return null;

          return (
            <li key={index} style={{ marginBottom: "20px", lineHeight: "1.5" }}>
              {formatBold(vault.replace(/-\s/g, ""))}
            </li>
          );
        })}
      </ul>
    );
  };

  const formatBold = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <div key={index}>
            <b>{part.slice(2, -2)}</b>
          </div>
        );
      }
      return <span key={index}>{part.replace(/:\s/g, "")}</span>;
    });
  };


  return (
    <>
      <div
        style={{
          maxWidth: "1800px",
          margin: "0 auto",
          height: "auto",
          width: "auto",
          backgroundColor: "#f0f2f5",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#333" }}>
          <b>Chat with the Vaultcraft Agent</b>
        </h1>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "8px",
            height: "45vh",
            overflowY: "auto",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          {messages.map((msg, idx) => {
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  margin: "5px 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px 15px",
                    borderRadius: "20px",
                    backgroundColor: msg.role === "user" ? "#0084ff" : "#e5e5ea",
                    color: msg.error
                      ? "#ff0000"
                      : msg.role === "user"
                        ? "#fff"
                        : "#000",
                    maxWidth: "75%",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  {formatText(msg.content)}{displayDate(msg.timestamp)}
                </span>
              </div>
            )
          })}
        </div>
        <input
          style={{ marginTop: "20px" }}
          type="text"
          value={userInput}
          onChange={handleChange}
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="Type something..."
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          {!account &&
            <MainActionButton
              label={"Connect Wallet to continue"}
              handleClick={openConnectModal}
            />
          }
          {account &&
            <>
              <MainActionButton
                disabled={userInput === "" || polling}
                label="Send Message"
                handleClick={() => {
                  threadId === "" ? createThread(userInput) : sendMessage(userInput);
                }}
              />
              <MainActionButton
                disabled={threadId === "" || polling}
                label="Reload thread"
                handleClick={() => pollResponse(threadId, runId)}
              />
            </>
          }
        </div>
      </div>
    </>
  );
}

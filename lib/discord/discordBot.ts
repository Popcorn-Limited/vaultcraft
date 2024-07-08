import axios from 'axios';
import { Address } from "viem";

interface DiscordMessage {
  chainId?: number;
  target: Address;
  user: Address;
  isSimulation: boolean;
  method: string;
  txHash?: string;
  reason?: string;
}
export const sendMessageToDiscord = async (message: DiscordMessage): Promise<void> => {
  const webhookUrl: string = process.env.DISCORD_WEBHOOK as string;

  const title = "----------------- NEW MESSAGE -----------------"
  const content = `${title}
    Chain ID = ${message.chainId}
    Target Address = ${message.target}
    User = ${message.user}
    Action = ${message.method}
    Simulation? = ${message.isSimulation}
    TxHash = ${message.txHash?? "not provided"}
    Reason = ${message.reason?? "not provided"}`
  
  try {
    const response = await axios.post(webhookUrl, {content}, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    console.log(`Message sent: ${response.status}`);
  } catch (error) {
    console.error('Error sending message to Discord', error);
  }
};


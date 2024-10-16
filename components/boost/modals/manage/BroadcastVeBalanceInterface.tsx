import MainActionButton from "@/components/button/MainActionButton";
import { tokensAtom } from "@/lib/atoms";
import { VeRecipientByChain, VE_BEACON, VE_VCX } from "@/lib/constants/addresses";
import { broadcastVeBalance } from "@/lib/gauges/interactions";
import { RPC_URLS } from "@/lib/utils/connectors";
import { formatBalance, handleSwitchChain, NumberFormatter } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, Chain, createPublicClient, erc20Abi, http } from "viem";
import { arbitrum, optimism } from "viem/chains";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

async function getVeBalance(account: Address, chain: Chain): Promise<string> {
  const client = createPublicClient({
    chain: chain,
    transport: http(RPC_URLS[chain.id]),
  })
  const veBal = await client.readContract({
    address: VeRecipientByChain[chain.id],
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account]
  });
  return formatBalance(veBal, 18)
}

export default function BroadcastVeBalanceInterface({ setShowModal }: { setShowModal: Function }): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  const [tokens] = useAtom(tokensAtom);
  const [opVeBal, setOpVeBal] = useState<string>("0")
  const [arbVeBal, setArbVeBal] = useState<string>("0")

  useEffect(() => {
    if (account) {
      getVeBalance(account, optimism).then(res => setOpVeBal(res))
      getVeBalance(account, arbitrum).then(res => setArbVeBal(res))
    }
  }, [account])

  async function handleBroadcast(chainId: number) {
    if (!account || !walletClient) return
    await broadcastVeBalance({ targetChain: chainId, account, address: VE_BEACON, clients: { publicClient: publicClient!, walletClient } })
    setShowModal(false)
  }

  return (
    <div className="text-start">
      <h2 className="text-start text-5xl">Sync veBalance</h2>

      <div>
        <p className="text-start">
          Sync your veVCX to earn oVCX on Ethereum, Optimism, and Arbitrum.
          <br />
          IMPORTANT: If you don&apos;t sync, you will not earn oVCX so please make sure you sync every time you lock, increase your lock amount, or increase your lock time.
          <br />
          You will need to wait 15-30min before the veVCX balance is synced successfully.
        </p>
        <div className="mt-10">
          <span className="flex flex-row items-center justify-between">
            <p className="text-white font-semibold mb-1">Mainnet veBalance:</p>
            <p className="w-32 text-customGray300">{NumberFormatter.format(Number(tokens[1][VE_VCX].balance.formatted || "0"))}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-white font-semibold mb-1">Optimism veBalance:</p>
            <p className="w-32 text-customGray300">{NumberFormatter.format(Number(opVeBal || "0"))}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-white font-semibold mb-1">Arbitrum veBalance:</p>
            <p className="w-32 text-customGray300">{NumberFormatter.format(Number(arbVeBal || "0"))}</p>
          </span>
        </div>
        <div className="flex flex-row space-x-4 mt-10">
          {chain?.id !== 1
            ? <MainActionButton
              label="Switch Chain"
              handleClick={() => handleSwitchChain(1, switchChainAsync)}
            />
            : <>
              <div className="w-full md:w-60">
                <MainActionButton
                  label="Broadcast to Optimism"
                  handleClick={() => handleBroadcast(10)}
                />
              </div>
              <div className="w-full md:w-60">
                <MainActionButton
                  label="Broadcast to Arbitrum"
                  handleClick={() => handleBroadcast(42161)}
                />
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
}

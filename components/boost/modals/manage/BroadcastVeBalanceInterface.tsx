import MainActionButton from "@/components/button/MainActionButton";
import { VE_BEACON, VOTING_ESCROW, VeRecipientByChain, ZERO } from "@/lib/constants";
import { broadcastVeBalance } from "@/lib/gauges/interactions";
import useLockedBalanceOf from "@/lib/gauges/useLockedBalanceOf";
import { RPC_URLS } from "@/lib/utils/connectors";
import { NumberFormatter, formatNumber } from "@/lib/utils/formatBigNumber";
import { useEffect, useState } from "react";
import { createPublicClient, formatEther, http } from "viem";
import { arbitrum, optimism } from "viem/chains";
import { Address, Chain, erc20ABI, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";

async function getVeBalance(account: Address, chain: Chain): Promise<number> {
  const client = createPublicClient({
    chain: chain,
    transport: http(RPC_URLS[chain.id]),
  })
  const veBal = await client.readContract({
    address: VeRecipientByChain[chain.id],
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [account]
  });
  return Number(veBal) / 1e18
}

export default function BroadcastVeBalanceInterface({ setShowModal }: { setShowModal: Function }): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: veBal } = useBalance({
    chainId: 1,
    address: account,
    token: VOTING_ESCROW,
    watch: true,
  });

  const [opVeBal, setOpVeBal] = useState<number>(0)
  const [arbVeBal, setArbVeBal] = useState<number>(0)

  useEffect(() => {
    if (account) {
      getVeBalance(account, optimism).then(res => setOpVeBal(res))
      getVeBalance(account, arbitrum).then(res => setArbVeBal(res))
    }
  }, [account])

  async function handleBroadcast(chainId: number) {
    if (!account || !walletClient) return
    await broadcastVeBalance({ targetChain: chainId, account, address: VE_BEACON, clients: { publicClient, walletClient } })
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
            <p className="w-32 text-customGray300">{NumberFormatter.format(
              Number(formatEther(veBal?.value || ZERO))
            ) || "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-white font-semibold mb-1">Optimism veBalance:</p>
            <p className="w-32 text-customGray300">{formatNumber(opVeBal || 0)}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-white font-semibold mb-1">Arbitrum veBalance:</p>
            <p className="w-32 text-customGray300">{formatNumber(arbVeBal || 0)}</p>
          </span>
        </div>
        <div className="flex flex-row space-x-4 mt-10">
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
        </div>
      </div>
    </div>
  );
}

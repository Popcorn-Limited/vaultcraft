import MainActionButton from "@/components/button/MainActionButton";
import { VE_BEACON, VeRecipientByChain } from "@/lib/constants";
import { broadcastVeBalance } from "@/lib/gauges/interactions";
import { RPC_URLS } from "@/lib/utils/connectors";
import { formatNumber } from "@/lib/utils/formatBigNumber";
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { arbitrum, optimism } from "viem/chains";
import { Address, Chain, erc20ABI, useAccount, usePublicClient, useWalletClient } from "wagmi";

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

export default function BroadcastVeBalanceInterface({ amount, setShowModal }: { amount: number, setShowModal: Function }): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

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
    await broadcastVeBalance({ targetChain: chainId, account, address: VE_BEACON, publicClient, walletClient })
    setShowModal(false)
  }

  return (
    <div className="text-start">
      <h2 className="text-start text-5xl">Sync VeBalance</h2>

      <div>
        <p className="text-start">
          Broadcasting your veVCX balance on Ethereum mainnet to other chains (e.g. Arbitrum) enables you to boost your oVCX rewards on those chains.<br />
          Whenever you create a new lock or increase your veVCX balance by increasing your lock amount or extending your lock duration, you should broadcast your increased veVCX balance to L2s.
          If you aren&apos;t planning to, or don&apos;t already, deposit into vaults on L2&apos;s then there is no need to broadcast your veVCX balance. However, if you do decide to deposit on L2&apos;s and would like to boost your oVCX rewards, you will need to broadcast your veVCX balance.
        </p>
        <div className="mt-10">
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Mainnet VeBalance:</p>
            <p className="w-32 text-secondaryLight">{formatNumber(amount || 0)}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Optimism VeBalance:</p>
            <p className="w-32 text-secondaryLight">{formatNumber(opVeBal || 0)}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Arbitrum VeBalance:</p>
            <p className="w-32 text-secondaryLight">{formatNumber(arbVeBal || 0)}</p>
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

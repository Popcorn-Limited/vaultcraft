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
      <h2 className="text-start text-5xl">Broadcast VeBalance</h2>

      <div>
        <p className="text-start">
          In order to earn oVCX via gauges on other chains than ethereum you need to broadcast your ve balance.
          You will only earn oVCX If you have vault shares staked on other chains and broadcasted your ve balance.
          Therefore make sure to broadcast everytime you lock, increase your lock amount or lock time.
        </p>
        <div className="mt-10">
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Mainnet VeBalance:</p>
            <p className="w-32 text-secondaryLight">{formatNumber(amount)}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Optimism VeBalance:</p>
            <p className="w-32 text-secondaryLight">{formatNumber(opVeBal)}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Arbitrum VeBalance:</p>
            <p className="w-32 text-secondaryLight">{formatNumber(arbVeBal)}</p>
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

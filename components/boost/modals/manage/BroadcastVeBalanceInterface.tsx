import MainActionButton from "@/components/button/MainActionButton";
import { GaugeFactoryByChain, VE_BEACON } from "@/lib/constants";
import { broadcastVeBalance } from "@/lib/gauges/interactions";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";

export default function BroadcastVeBalanceInterface({ amount, setShowModal }: { amount: number, setShowModal: Function }): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: opVeBal } = useBalance({
    chainId: 10,
    address: account,
    token: GaugeFactoryByChain[10],
    watch: true,
  });
  const { data: arbVeBal } = useBalance({
    chainId: 42161,
    address: account,
    token: GaugeFactoryByChain[42161],
    watch: true,
  });

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
            <p className="w-32 text-secondaryLight">{amount}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Optimism VeBalance:</p>
            <p className="w-32 text-secondaryLight">{opVeBal ? Number(opVeBal) / 1e18 : "0"}</p>
          </span>
          <span className="flex flex-row items-center justify-between">
            <p className="text-primary font-semibold mb-1">Arbitrum VeBalance:</p>
            <p className="w-32 text-secondaryLight">{arbVeBal ? Number(arbVeBal) / 1e18 : "0"}</p>
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

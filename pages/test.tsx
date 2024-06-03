import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { handleAllowance } from "@/lib/approve";
import { WormholeBridgerAbi } from "@/lib/constants";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { useState } from "react";
import { parseEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { WalletClient, sepolia, useAccount, useBalance, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";

const ChainIdToWormholeChainId = {
  [sepolia.id]: 10002,
  [arbitrumSepolia.id]: 10003
}

const WormHoleIdToChainId = {
  [10002]: sepolia.id,
  [10003]: arbitrumSepolia.id
}

const WormholeBridger = {
  [sepolia.id]: "0x2Aa0489448bD52dE7B9559d0651595B244D3971C",
  [arbitrumSepolia.id]: "0x2Aa0489448bD52dE7B9559d0651595B244D3971C"
}

const XVCX = {
  [sepolia.id]: "0x18445923592be303fbd3BC164ee685C7457051b4",
  [arbitrumSepolia.id]: "0x1fa00Efd6Fe975E2D587016d863896FF0012e16c"
}

export default function Test() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const [destination, setDestination] = useState<number>(ChainIdToWormholeChainId[arbitrumSepolia.id])

  const { data: sepBal } = useBalance({ address: account, token: XVCX[sepolia.id], chainId: sepolia.id })
  const { data: arbBal } = useBalance({ address: account, token: XVCX[arbitrumSepolia.id], chainId: arbitrumSepolia.id })

  async function approve() {
    if (!chain) return;

    handleAllowance({
      token: XVCX[chain.id],
      amount: 1e18,
      account: account!,
      spender: WormholeBridger[chain.id],
      clients: {
        publicClient,
        walletClient: walletClient!,
      },
    });
  }

  async function bridge() {
    if (!chain || !account) return;

    const deliveryFee = await publicClient.readContract({
      address: WormholeBridger[chain.id],
      abi: WormholeBridgerAbi,
      functionName: "quoteDeliveryCost",
      args: [destination]
    })

    console.log({home:chain.id, destination, deliveryFee})

    handleCallResult({
      successMessage: "VCX bridged successfully!",
      simulationResponse: await simulateCall({
        account,
        contract: {
          address: WormholeBridger[chain.id],
          abi: WormholeBridgerAbi,
        },
        functionName: "bridge",
        publicClient: publicClient,
        args: [destination, account, parseEther("1")],
        // Add 10% to the deliveryFee
        value: (deliveryFee * BigInt(11)) / BigInt(10)
      }),
      clients: {
        publicClient,
        walletClient: walletClient as WalletClient
      },
    });
  }

  function switchDirection() {
    if (!chain) return;
    setDestination(chain?.id === sepolia.id ? ChainIdToWormholeChainId[sepolia.id] : ChainIdToWormholeChainId[arbitrumSepolia.id])
    switchNetworkAsync(chain?.id === sepolia.id ? arbitrumSepolia.id : sepolia.id)
  }

  return <>
    <p className="text-white">Bridge from {chain?.name} to {chain?.id === sepolia.id ? arbitrumSepolia.name : sepolia.name}</p>
    <p className="text-white">Sepolia Balance: {sepBal?.formatted}</p>
    <p className="text-white">Arbitrum Sepolia Balance: {arbBal?.formatted}</p>
    <div className="flex flex-row items-center space-x-4">
      <SecondaryActionButton label="Switch Direction" handleClick={switchDirection} />
      <SecondaryActionButton label="Approve" handleClick={approve} />
      <MainActionButton label="Bridge" handleClick={bridge} />
    </div>
  </>
}
import { getVotePeriodEndTime } from "@/lib/gauges/utils"
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"
import { AnyToAnyDepositorAbi, AssetPushOracleAbi, AssetPushOracleByChain, VaultAbi } from "@/lib/constants";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import axios from "axios";
import { useConnectModal } from "@rainbow-me/rainbowkit";


async function getPendleData() {
  const { data } = await axios.get("https://api-v2.pendle.finance/core/v1/sdk/1/markets/0xcae62858db831272a03768f5844cbe1b40bb381f/add-liquidity?receiver=0x17A604740a25D703f9848857BEB9E88d0ab0D3F8&slippage=0.01&enableAggregator=true&tokenIn=0x8236a87084f8B84306f72007F36F2618A5634494&amountIn=1000000")

  console.log(data)
  return data
}

export default function Test() {
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();


  async function doPendle() {
    if (!walletClient) {
      openConnectModal?.()
      return
    }

    const { data } = await axios.get(`https://api-v2.pendle.finance/core/v1/sdk/1/markets/0xcae62858db831272a03768f5844cbe1b40bb381f/add-liquidity?receiver=${account}&slippage=0.01&enableAggregator=true&tokenIn=0x8236a87084f8B84306f72007F36F2618A5634494&amountIn=160000`)
    console.log(data)

    const hash = await walletClient.sendTransaction({
      account: account,
      to: data.tx.to,
      data: data.tx.data,
    })
    console.log(hash)
    // console.log(request)
    // const serializedTransaction = await walletClient.signTransaction(request)
    // console.log(serializedTransaction)
    // const hash = await walletClient.sendRawTransaction({ serializedTransaction })
    // console.log(hash)
  }

  return <><button onClick={() => doPendle()}>Get Pendle Data</button></>
}
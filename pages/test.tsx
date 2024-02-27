import getTokens from "@/lib/getTokens"
import { polygon } from "viem/chains"
import { useAccount } from "wagmi"

export default function Test() {
  const { address: account } = useAccount()

  getTokens({ chain: polygon, account }).then(res => console.log(res))
  return <></>
}
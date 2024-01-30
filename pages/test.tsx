import { VaultLabel } from "@/lib/types"
import { Address, maxUint256 } from "viem"
import axios from "axios"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { ProtocolName } from "vaultcraft-sdk"

dayjs.extend(utc)

interface Apy {
  rewardToken: Address;
  apy: Number;
}

interface ApyEntry {
  timestamp: String;
  total: Number;
  apy: Apy[];
}

interface AssetEntry {
  assetAddress: Address;
  protocolAddress: Address;
  latest: ApyEntry;
  historic: ApyEntry[];
}


async function do_the_thing({ chainId, protocol }: { chainId: number, protocol: ProtocolName }) {
  const { data }: { data: AssetEntry[] } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/apy/${chainId}/${protocol}.json`);

  data["0xdAC17F958D2ee523a2206206994597C13D831ec7"].historic.unshift(data["0xdAC17F958D2ee523a2206206994597C13D831ec7"].latest)
  data["0xdAC17F958D2ee523a2206206994597C13D831ec7"].latest = {
    timestamp: dayjs.utc().format("YYYY-MM-DD"),
    total: 0,
    apy: [
      {
        rewardToken: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        apy: 0
      }
    ]
  }

  console.log(data)
}



export default function Test() {
  do_the_thing()
  return <></>
}
import { getVeAddresses } from '@/lib/utils/addresses';
import { RPC_URLS } from '@/lib/utils/connectors';
import axios from 'axios';
import { useAtom } from 'jotai';

async function fetchApy() {
  const res = await axios.get('https://api.sommelier.finance/dailyData/ethereum/0xfd6db5011b171B05E1Ea3b92f9EAcaEEb055e971/0/latest')
  console.log(res)
}

const { VCX, WETH } = getVeAddresses()

export default function Test() {
  //fetchPrice()

  //fetchApy()

  return <></>
}
import axios from 'axios';

async function fetchApy() {
  const res = await axios.get('https://api.sommelier.finance/dailyData/ethereum/0xfd6db5011b171B05E1Ea3b92f9EAcaEEb055e971/0/latest')
  console.log(res)
}


export default function Test() {
  fetchApy()
  return <></>
}
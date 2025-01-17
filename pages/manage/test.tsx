import axios from "axios";

async function fetchPerps() {
  const res = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/perps`)
  console.log(res.data)
}

async function fetchBorrow(){
  const res = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/poolsBorrow`)
  console.log(res.data)
}

async function fetchYields(){
  const res = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/pools`)
  console.log(res.data)
}

export default function Test() {
  return <div>
      
    <button onClick={fetchPerps}>Fetch Perps</button>
    <button onClick={fetchBorrow}>Fetch Borrow</button>
    <button onClick={fetchYields}>Fetch Yields</button>
    </div>;
}

import { ReclaimClient } from "@reclaimprotocol/zk-fetch";


async function fetchProof() {
  const client = new ReclaimClient(process.env.ZK_FETCH_APP_ID!, process.env.ZK_FETCH_SECRET!);
  
  const publicOptions = {
      method: 'GET', // or POST
      headers : {
          accept: 'application/json, text/plain, */*' 
      }
  }
  
  const proof = await client.zkFetch('https://your.url.org',publicOptions)
  return proof;
  
}

export default function ZKTest() {
  
  return <div>ZKTest</div>
}

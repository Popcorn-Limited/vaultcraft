
async function doStuff() {
  console.log("doing stuff")
  const response = await fetch("http://164.92.165.106:8000/subgraphs/id/QmR5K6YutZESdLk3czVrEvWUuJhjfQ4jAeAWnRtepPmMuZ", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/graphql-response+json",
    },
    body: JSON.stringify({
      query: `
      query MyQuery {
  collateralAddresses_collection(first: 10) {
    id
  }
}
      `
    })
  })

  const data = await response.json()
  console.log(data)
}

export default function Test() {


  return (
    <div><button onClick={doStuff} className="text-white">Do Stuff</button></div>
  );
}

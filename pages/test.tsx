import axios from "axios";

async function doSmth() {
  const params = {
    sellToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F', //DAI
    buyToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', //ETH
    // Note that the DAI token uses 18 decimal places, so `sellAmount` is `100 * 10^18`.
    sellAmount: '100000000000000000000',
    takerAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
  }

  // const response = await fetch(
  //   `https://api.0x.org/swap/v1/quote?buyToken=${params.buyToken}&sellToken=${params.sellToken}&sellAmount=${params.sellAmount}&takerAddress=${params.takerAddress}`, { headers: { '0x-api-key': 'c64b782e-bf45-46aa-aa8c-4344bb72fd02' } }
  // );

  const response = await fetch(
    `https://api.0x.org/swap/v1/quote?buyToken=0x6B175474E89094C44Da98b954EedeAC495271d0F&sellToken=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&sellAmount=100000000&excludedSources=Kyber&takerAddress=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`,
    {
      headers: {
        "0x-api-key": "c64b782e-bf45-46aa-aa8c-4344bb72fd02", // process.env.NEXT_PUBLIC_0X_API_KEY,
      },
    }
  );
  const zeroXRes = await response.json();
  console.log({ zeroXRes })

  const ensoRes = (await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&spender=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&receiver=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&amountIn=100000000&slippage=100&tokenIn=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&tokenOut=0x6B175474E89094C44Da98b954EedeAC495271d0F`,
    { headers: { Authorization: `Bearer ${process.env.ENSO_API_KEY}` } }
  )).data
  console.log({ ensoRes: ensoRes.tx })


  const oneInchRes = (await axios.get("https://api.1inch.dev/swap/v5.2/1/swap", {
    headers: {
      "Authorization": "Bearer PrbaHy9UX9eBMZ6adKeqXRc0S0dFQ75I"
    },
    params: {
      "src": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "dst": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "amount": "100000000",
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "slippage": "0"
    }
  })).data
  console.log({ oneInchRes })
}

export default function Test() {
  doSmth()
  return <></>
}
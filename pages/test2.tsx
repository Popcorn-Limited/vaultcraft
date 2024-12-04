import axios from "axios"


export default function Test2() {
  return <div className="text-white"><button onClick={doStuff}>Do stuff</button></div>;
}

async function doStuff() {
  const { data: spotTokens } = await axios.post("https://api.hyperliquid.xyz/info", {
    type: "spotMetaAndAssetCtxs",
    coin: "150",
    headers: { "Content-Type": "application/json" },
  })
  console.log({ spotTokens })
  
  // const { data: spotclearinghouseStateUser } = await axios.post("https://api.hyperliquid.xyz/info", {
  //   type: "spotClearinghouseState",
  //   user: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
  //   headers: { "Content-Type": "application/json" },
  // })
  // const { data: vaultDetails } = await axios.post("https://api-ui.hyperliquid.xyz/info", {
  //   type: "vaultDetails",
  //   user: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
  //   vaultAddress: "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303",
  //   headers: { "Content-Type": "application/json" },
  // })
  // console.log({ perpValue: clearinghouseStateUser.marginSummary.accountValue, spotValue: spotclearinghouseStateUser.balances, vaultDetails: vaultDetails.maxWithdrawable })
  // const { data: clearinghouseStateUser1 } = await axios.post("https://api.hyperliquid.xyz/info", {
  //   type: "clearinghouseState",
  //   user: "0x20c2d95a3dfdca9e9ad12794d5fa6fad99da44f5",
  //   headers: { "Content-Type": "application/json" },
  // })
  // const { data: spotclearinghouseStateUser1 } = await axios.post("https://api.hyperliquid.xyz/info", {
  //   type: "spotClearinghouseState",
  //   user: "0x20c2d95a3dfdca9e9ad12794d5fa6fad99da44f5",
  //   headers: { "Content-Type": "application/json" },
  // })
  // const { data: vaultDetails1 } = await axios.post("https://api-ui.hyperliquid.xyz/info", {
  //   type: "vaultDetails",
  //   user: "0x20c2d95a3dfdca9e9ad12794d5fa6fad99da44f5",
  //   vaultAddress: "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303",
  //   headers: { "Content-Type": "application/json" },
  // })
  // console.log({ perpValue: clearinghouseStateUser1.marginSummary.accountValue, spotValue: spotclearinghouseStateUser1.balances, vaultDetails: vaultDetails1.maxWithdrawable })
}

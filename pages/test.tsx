
const apr2apy = (apr: number) => {
  return (1 + (Number(apr) / 100) / 365) ** 365 - 1;
}

async function blub() {
  const poLidoStats = await (await fetch('https://api.idle.finance/poLidoStats', { headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkFwcDciLCJpYXQiOjE2NzAyMzc1Mjd9.L12KJEt8fW1Cvy3o7Nl4OJ2wtEjzlObaAYJ9aC_CY6M` } })).json();
  console.log(poLidoStats)
  const strategyApr = poLidoStats.apr;
  const FULL_ALLOC = 100000;
  let trancheAPRSplitRatio = 63361;
  let currentAARatio = 79184;

  const isBBTranche = true;
  if (isBBTranche) {
    trancheAPRSplitRatio = FULL_ALLOC - trancheAPRSplitRatio;
    currentAARatio = FULL_ALLOC - currentAARatio;
  }

  const APR = strategyApr * trancheAPRSplitRatio / currentAARatio;
  console.log({ APR })
  console.log({ apy: apr2apy(APR) })
}

export default function Test() {
  blub()
  return <></>
}
export async function yearn({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const res = await (await fetch(`https://api.yearn.finance/v1/chains/${chainId}/vaults/all`)).json()
  const vault = res.find((vault: any) => vault.token.address.toLowerCase() === address.toLowerCase())
  return vault === undefined ? 0 : vault.apy.net_apy * 100
}

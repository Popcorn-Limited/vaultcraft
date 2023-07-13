interface BeefyVault {
  id: string;
  tokenAddress: string;
}

interface ApyBreakdown {
  [key: string]: VaultApy;
}

interface VaultApy {
  totalApy: number;
}

export async function beefy({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const beefyVaults: BeefyVault[] = await (await fetch("https://api.beefy.finance/vaults")).json();
  const apyRes: ApyBreakdown = await (await fetch("https://api.beefy.finance/apy/breakdown")).json();
  const beefyVaultObj = beefyVaults.find(vault => vault.tokenAddress?.toLowerCase() === address.toLowerCase());
  
  return beefyVaultObj === undefined ? 0 : apyRes[beefyVaultObj.id].totalApy * 100;
};

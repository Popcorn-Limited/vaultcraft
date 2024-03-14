import { createPublicClient, http } from "viem";
import { Chain, arbitrum, optimism, polygon } from "viem/chains";
import { Address, mainnet } from "wagmi";
import { ChainId, RPC_URLS } from "@/lib/utils/connectors";
import { ERC20Abi, VCX, VCX_LP, VE_VCX, VotingEscrowAbi } from "@/lib/constants";
import { resolvePrice } from "@/lib/resolver/price/price";
import { VaultData } from "@/lib/types";

type TotalNetworth = {
  [key: number]: Networth;
  total: Networth;
};

export type Networth = {
  wallet: number;
  stake: number;
  vault: number;
  total: number;
};

export function getVaultNetworthByChain({
  vaults,
  chainId,
}: {
  vaults: VaultData[];
  chainId: number;
}): number {
  const vaultValue = vaults
    .filter((vaultData) => vaultData.chainId === chainId)
    .map(
      (vaultData) =>
        (vaultData.vault.balance * vaultData.vault.price) /
        10 ** vaultData.vault.decimals
    )
    .reduce((a, b) => a + b, 0);
  const gaugeValue = vaults
    .filter(
      (vaultData) => vaultData.chainId === chainId && !!vaultData.gauge?.address
    )
    .map(
      (vaultData) =>
        ((vaultData.gauge?.balance || 0) * (vaultData.gauge?.price || 0)) /
        10 ** (vaultData.gauge?.decimals || 0)
    )
    .reduce((a, b) => a + b, 0);
  return vaultValue + gaugeValue;
}

export async function getNetworthByChain({
  account,
  chain,
}: {
  account: Address;
  chain: Chain;
}): Promise<Networth> {
  const client = createPublicClient({
    chain,
    transport: http(RPC_URLS[chain.id]),
  });
  if (chain.id === 1) {
    // Get balances
    const vcxBal = await client.readContract({
      address: VCX,
      abi: ERC20Abi,
      functionName: "balanceOf",
      args: [account],
    });
    const lpBal = await client.readContract({
      address: VCX_LP,
      abi: ERC20Abi,
      functionName: "balanceOf",
      args: [account],
    });
    const stake = await client.readContract({
      address: VE_VCX,
      abi: VotingEscrowAbi,
      functionName: "locked",
      args: [account],
    });

    // Get value of VCX holdings
    const vcxPrice = await resolvePrice({
      address: VCX,
      chainId: 1,
      client: undefined,
      resolver: "llama",
    });
    const lpPrice = await resolvePrice({
      address: VCX_LP,
      chainId: 1,
      client: undefined,
      resolver: "llama",
    });

    const vcxVal = (Number(vcxBal) / 1e18) * vcxPrice;
    const veVal = (Number(stake.amount) / 1e18) * lpPrice;
    const lpVal = (Number(lpBal) / 1e18) * lpPrice;

    return {
      wallet: vcxVal + lpVal,
      stake: veVal,
      vault: 0,
      total: vcxVal + veVal + lpVal,
    };
  } else {
    return { wallet: 0, stake: 0, vault: 0, total: 0 };
  }
}

export async function getTotalNetworth({
  account,
}: {
  account: Address;
}): Promise<TotalNetworth> {
  const ethereumNetworth = await getNetworthByChain({
    account,
    chain: mainnet,
  });
  const polygonNetworth = await getNetworthByChain({ account, chain: polygon });
  const optimismNetworth = await getNetworthByChain({
    account,
    chain: optimism,
  });
  const arbitrumNetworth = await getNetworthByChain({
    account,
    chain: arbitrum,
  });

  return {
    [ChainId.Ethereum]: ethereumNetworth,
    [ChainId.Polygon]: polygonNetworth,
    [ChainId.Optimism]: optimismNetworth,
    [ChainId.Arbitrum]: arbitrumNetworth,
    total: {
      wallet:
        ethereumNetworth.wallet +
        polygonNetworth.wallet +
        optimismNetworth.wallet +
        arbitrumNetworth.wallet,
      stake:
        ethereumNetworth.stake +
        polygonNetworth.stake +
        optimismNetworth.stake +
        arbitrumNetworth.stake,
      vault: 0,
      total:
        ethereumNetworth.total +
        polygonNetworth.total +
        optimismNetworth.total +
        arbitrumNetworth.total,
    },
  };
}

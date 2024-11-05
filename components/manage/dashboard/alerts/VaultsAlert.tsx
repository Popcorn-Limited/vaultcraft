import { tokensAtom } from "@/lib/atoms";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData, VaultLabel } from "@/lib/types";
import { ChainById, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { formatBalanceUSD, NumberFormatter } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function VaultsAlert() {
  const [vaultsData] = useAtom(vaultsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [vaults, setVaults] = useState<VaultData[]>([]);

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat());
    }
  }, [vaultsData, vaults]);

  return vaults.length > 0 && Object.keys(tokens).length > 0 ? (
    <>
      {vaults
        .filter(
          vault => vault.metadata.labels
            ? vault.metadata.labels?.filter(label => [VaultLabel.experimental, VaultLabel.deprecated].includes(label)).length === 0
            : true
        )
        .filter(vault => vault.totalAssets - vault.liquid > 0)
        .map(vault =>
          <>
            {/* Check that Vaults have enough liquid cash */}
            {Number(formatBalanceUSD(vault.liquid, tokens[vault.chainId][vault.asset].decimals, tokens[vault.chainId][vault.asset].price)) < 100_000 ?
              <div className="w-1/3 p-4">
                <div className="border border-red-500 bg-red-500 bg-opacity-30 rounded-lg p-4">
                  <p className="text-red-500 text-lg">
                    Low Cash: {ChainById[vault.chainId].name} {tokens[vault.chainId][vault.asset].symbol}-{vault.strategies.length > 1
                      ? "Multistrategy"
                      : vault.strategies[0].metadata.protocol}
                  </p>
                  <p className="text-red-500 text-sm">
                    {`Free up cash for withdrawals! Either deallocate funds from strategies or convert YieldTokens in strategies. ( $${formatBalanceUSD(vault.liquid, tokens[vault.chainId][vault.asset].decimals, tokens[vault.chainId][vault.asset].price)} < $100k )`}
                  </p>
                </div>
              </div>
              : <>
                {((vault.liquid / (vault.totalAssets || BigInt(1))) * BigInt(100)) < BigInt(20) &&
                  <div className="w-1/3 p-4">
                    <div className="border border-secondaryYellow bg-secondaryYellow bg-opacity-30 rounded-lg p-4">
                      <p className="text-secondaryYellow text-lg">
                        Low Cash: {ChainById[vault.chainId].name} {tokens[vault.chainId][vault.asset].symbol}-{vault.strategies.length > 1
                          ? "Multistrategy"
                          : vault.strategies[0].metadata.protocol}
                      </p>
                      <p className="text-secondaryYellow text-sm">
                        {`Free up cash for withdrawals. Either deallocate funds from strategies or convert YieldTokens in strategies. (${NumberFormatter.format(Number(vault.liquid / (vault.totalAssets || BigInt(1)) * BigInt(100)))}% < 20% )`}
                      </p>
                    </div>
                  </div>
                }
              </>
            }
          </>
        )}
    </>
  )
    : <></>
}
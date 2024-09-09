import AssetWithName from "@/components/common/AssetWithName";
import { tokensAtom } from "@/lib/atoms";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData } from "@/lib/types";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { formatNumber, formatTwoDecimals } from "@/lib/utils/formatBigNumber";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function VaultsDashboard({ dashboardData }: { dashboardData: any }) {
  const [vaultsData] = useAtom(vaultsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [vaults, setVaults] = useState<VaultData[]>([]);

  useEffect(() => {
    if (Object.keys(vaultsData).length > 0 && vaults.length === 0) {
      setVaults(SUPPORTED_NETWORKS.map((chain) => vaultsData[chain.id]).flat());
    }
  }, [vaultsData, vaults]);

  // TODO
  // - fees
  // - last harvested

  return vaults.length > 0 && Object.keys(tokens).length > 0 ?
    (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full">
              <thead className="">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Assets
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Liquid
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Liquid %
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Idle
                  </th>
                </tr>
              </thead>
              <tbody className="">
                {vaults
                  .map(vault =>
                    <>
                      <tr className="border-t border-gray-200">
                        <th
                          scope="colgroup"
                          colSpan={5}
                          className="bg-customGray600 py-2 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3"
                        >
                          <AssetWithName vault={vault} />
                        </th>
                      </tr>
                      <tr
                        className="border-gray-300 border-t"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-3">
                          Vault
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatNumber(vault.totalAssets / (10 ** tokens[vault.chainId][vault.asset].decimals))}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatNumber(vault.liquid / (10 ** tokens[vault.chainId][vault.asset].decimals))}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatTwoDecimals((vault.liquid / vault.totalAssets) * 100)} %
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatNumber(vault.idle / (10 ** tokens[vault.chainId][vault.asset].decimals))}
                        </td>
                      </tr>
                      {vault.strategies.map(strategy => (
                        <tr
                          key={vault.address + strategy.address}
                          className="border-gray-200 border-t"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-3">
                            {strategy.metadata.protocol} - {strategy.metadata.name} - ({strategy.yieldToken ? tokens[vault.chainId][strategy.yieldToken].symbol : tokens[vault.chainId][vault.asset].symbol})
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatNumber(strategy.allocation / (10 ** tokens[vault.chainId][vault.asset].decimals))}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatNumber(strategy.idle / (10 ** tokens[vault.chainId][vault.asset].decimals))}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatTwoDecimals((strategy.idle / strategy.allocation) * 100)} %
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            0
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
    : <p className="text-white">Loading...</p>
}
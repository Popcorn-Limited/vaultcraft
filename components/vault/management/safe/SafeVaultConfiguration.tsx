import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { VaultData } from "@/lib/types";
import { OracleVaultAbi, VaultOracleOwnerByChain } from "@/lib/constants";
import fetchWithdrawalRequests, { WithdrawalRequest } from "@/lib/vault/management/safe/fetchWithdrawalRequests";
import { showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { formatBalance, simulateCall } from "@/lib/utils/helpers";
import { handleCallResult } from "@/lib/utils/helpers";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import SecondaryButtonGroup from "@/components/common/SecondaryButtonGroup";
import AssetWithName from "@/components/common/AssetWithName";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";
import Fieldset from "@/components/input/Fieldset";
import { Input } from "@headlessui/react";
import InputNumber from "@/components/input/InputNumber";
import SimpleInput from "@/components/input/SimpleInput";
import { TiDivide, TiEquals } from "react-icons/ti";
import getSafeVaultPriceV2 from "@/lib/vault/getSafeVaultPriceV2";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { formatEther, parseEther } from "viem";
import { setVaultPrice } from "@/lib/vault/management/safe/interactions";


export default function SafeVaultConfiguration({ vault }: { vault: VaultData }) {
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [tokens] = useAtom(tokensAtom)

  const [show, setShow] = useState(false)
  const [vaultValueUSD, setVaultValueUSD] = useState("0")
  const [assetValueUSD, setAssetValueUSD] = useState("0")
  const [totalSupply, setTotalSupply] = useState("0")
  const [vaultPriceInAssets, setVaultPriceInAssets] = useState("0")
  const [assetPriceInShares, setAssetPriceInShares] = useState("0")
  const [vaultPriceInAssetsRaised, setVaultPriceInAssetsRaised] = useState("0")
  const [assetPriceInSharesRaised, setAssetPriceInSharesRaised] = useState("0")


  async function getSafeVaultPrice() {
    showLoadingToast("Fetching Price Data")
    const price = await getSafeVaultPriceV2({
      configuration: {
        vault: vault.address,
        asset: vault.asset,
        safes: vault.safes!,
        chainIds: SUPPORTED_NETWORKS.map(chain => chain.id),
        hyperliquid: {
          spot: true,
          perp: true,
          vaults: ["0xdfc24b077bc1425ad1dea75bcb6f8158e10df303"]
        }
      },
      chainId: vault.chainId,
      totalSupply: vault.totalSupply,
      decimals: tokens[vault.chainId][vault.address].decimals
    })

    setVaultValueUSD(price.totalValueUSD.toString())
    setAssetValueUSD(tokens[vault.chainId][vault.asset].price.toString())
    setTotalSupply(price.formattedTotalSupply.toString())
    setVaultPriceInAssets(formatEther(price.shareValueInAssets))
    setAssetPriceInShares(formatEther(price.assetValueInShares))
    setVaultPriceInAssetsRaised(price.shareValueInAssets.toString())
    setAssetPriceInSharesRaised(price.assetValueInShares.toString())

    showSuccessToast("Price Data Fetched")
  }

  function calculateVaultPrice() {
    const vaultValueInAssets = Number(vaultValueUSD) / Number(assetValueUSD)
    const vaultPriceInAssets = vaultValueInAssets / Number(totalSupply)
    const assetValueInShares = 1 / Number(vaultPriceInAssets)

    setVaultPriceInAssets(vaultPriceInAssets.toString())
    setVaultPriceInAssetsRaised(parseEther(vaultPriceInAssets.toString()).toString())
    setAssetPriceInShares(assetValueInShares.toString())
    setAssetPriceInSharesRaised(parseEther(assetValueInShares.toString()).toString())
  }


  async function changeVaultPrice() {
    if (!account || !walletClient || !publicClient) return
    
    setVaultPrice({
      vaultPrice: BigInt(vaultPriceInAssetsRaised),
      assetPrice: BigInt(assetPriceInSharesRaised),
      vaultData: vault,
      address: VaultOracleOwnerByChain[vault.chainId],
      account: account,
      clients: { publicClient, walletClient }
    })
  }

  return (
    <div>
      <div
        className="bg-customGray600 py-2 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3 flex flex-row justify-between"
      >
        <AssetWithName vault={vault} />
        <div className="w-60">
          <MainActionButton
            label={show ? "Hide" : "Show"}
            handleClick={() => setShow(!show)}
            disabled={false}
          />
        </div>
      </div>
      {show && (
        <div className="py-4 bg-customNeutral200">
          <div className="px-4 py-4">
            <div className="flex flex-row justify-between">
              <p className="text-white text-2xl font-semibold mb-4">Set Vault Price</p>
              <div className="grid grid-cols-2 gap-2 h-10">
                <SecondaryActionButton
                  label="Fetch"
                  handleClick={getSafeVaultPrice}
                  disabled={false}
                />
                <MainActionButton
                  label="Calculate"
                  handleClick={calculateVaultPrice}
                  disabled={false}
                />
              </div>
            </div>
            <div className="w-full flex flex-row gap-2 items-center justify-between">
              <Fieldset label="Total Value USD" description="" >
                <SimpleInput type="text" value={vaultValueUSD} onChange={(e) => setVaultValueUSD(e.currentTarget.value)} />
              </Fieldset>

              <TiDivide className="text-customGray300 text-2xl mt-14" />

              <Fieldset label="Asset Value USD" description="" >
                <SimpleInput type="text" value={assetValueUSD} onChange={(e) => setAssetValueUSD(e.currentTarget.value)} />
              </Fieldset>

              <TiDivide className="text-customGray300 text-2xl mt-14" />

              <Fieldset label="Total Supply" description="" >
                <SimpleInput type="text" value={totalSupply} onChange={(e) => setTotalSupply(e.currentTarget.value)} />
              </Fieldset>

              <TiEquals className="text-customGray300 text-2xl mt-14" />

              <Fieldset label="Share Value In Assets" description="" >
                <SimpleInput type="text" value={vaultPriceInAssets} onChange={(e) => setVaultPriceInAssets(e.currentTarget.value)} />
              </Fieldset>

              <p className="text-customGray300 text-xl font-semibold mt-14">* 1e18</p>

              <Fieldset label="Share Value In Assets" description="" >
                <SimpleInput type="text" value={vaultPriceInAssetsRaised} onChange={(e) => setVaultPriceInAssets(e.currentTarget.value)} />
              </Fieldset>
            </div>

            <div className="w-full flex flex-row gap-2 items-center justify-between border-b border-customGray600 pb-8">
              <div className="w-108 mr-11 flex flex-row space-x-6 mt-14">
                {/* Spacing Div to align both rows */}
              </div>

              <p className="text-customGray300 text-xl font-semibold mt-14">1 /</p>

              <Fieldset label="Share Value In Assets" description="" >
                <SimpleInput type="text" value={vaultPriceInAssets} onChange={(e) => setVaultPriceInAssets(e.currentTarget.value)} />
              </Fieldset>

              <TiEquals className="text-customGray300 text-2xl mt-14" />

              <Fieldset label="Asset Value in Shares" description="" >
                <SimpleInput type="text" value={assetPriceInShares} onChange={(e) => setAssetPriceInShares(e.currentTarget.value)} />
              </Fieldset>

              <p className="text-customGray300 text-xl font-semibold mt-14">* 1e18</p>

              <Fieldset label="Asset Value in Shares" description="" >
                <SimpleInput type="text" value={assetPriceInSharesRaised} onChange={(e) => setAssetPriceInSharesRaised(e.currentTarget.value)} />
              </Fieldset>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-8 items-bottom">
              <Fieldset label="Vault Address" description="" >
                <SimpleInput type="text" value={vault.address} onChange={(e) => { }} disabled={true} />
              </Fieldset>

              <Fieldset label="Asset Address" description="" >
                <SimpleInput type="text" value={vault.asset} onChange={(e) => { }} disabled={true} />
              </Fieldset>

              <Fieldset label="Share Value In Assets" description="" >
                <SimpleInput type="text" value={vaultPriceInAssetsRaised} onChange={(e) => setVaultPriceInAssets(e.currentTarget.value)} />
              </Fieldset>

              <Fieldset label="Asset Value in Shares" description="" >
                <SimpleInput type="text" value={assetPriceInSharesRaised} onChange={(e) => setAssetPriceInSharesRaised(e.currentTarget.value)} />
              </Fieldset>
              <div className="h-24">
                <div className="h-12">
                </div>
                <div className="h-12">
                  <MainButtonGroup
                    label="Set Vault Price"
                    mainAction={changeVaultPrice}
                    chainId={vault.chainId}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div >
  )
}
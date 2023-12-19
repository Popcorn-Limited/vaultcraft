import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useEffect, useState } from "react";
import { Address, useAccount } from "wagmi";
import { getAddress } from "viem";
import AssetWithName from "@/components/vault/AssetWithName";
import VaultInputs from "@/components/vault/VaultInputs";
import Accordion from "@/components/common/Accordion";
import { Token, VaultData } from "@/lib/types";
import Modal from "@/components/modal/Modal";
import VaultStats from "@/components/vault/VaultStats";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { showSuccessToast } from '@/lib/toasts';
import { MutateTokenBalanceProps } from '@/components/vault/VaultsContainer';
import { useAtom } from 'jotai';
import { availableZapAssetAtom, zapAssetsAtom } from '@/lib/atoms';
import axios from "axios";

async function isDefiPosition({ address, chainId }: { address: Address, chainId: number }): Promise<boolean> {
  const { data } = await axios.get(`https://api.enso.finance/api/v1/positions?verified=false&tokenAddress=${address}&page=1&chainId=${chainId}`)
  return data.data.length > 0
}

function getTokenOptions(vaultData: VaultData, zapAssets?: Token[]): Token[] {
  const tokenOptions = [vaultData.vault, vaultData.asset]
  if (!!vaultData.gauge) tokenOptions.push(vaultData.gauge)
  if (zapAssets) tokenOptions.push(...zapAssets.filter(asset => getAddress(asset.address) !== getAddress(vaultData.asset.address)))
  return tokenOptions;
}

interface SmartVaultsProps {
  vaultData: VaultData;
  searchString: string;
  mutateTokenBalance: (props: MutateTokenBalanceProps) => void;
}

export default function SmartVault({
  vaultData,
  searchString,
  mutateTokenBalance,
}: SmartVaultsProps) {
  const { address: account } = useAccount();

  const asset = vaultData.asset;
  const vault = vaultData.vault;
  const gauge = vaultData.gauge;

  const [zapAssets] = useAtom(zapAssetsAtom)
  const [availableZapAssets] = useAtom(availableZapAssetAtom)

  const [zapAvailable, setZapAvailable] = useState<boolean>(false)
  const [tokenOptions, setTokenOptions] = useState<Token[]>([])

  useEffect(() => {
    if (!!vaultData && Object.keys(availableZapAssets).length > 0) {
      if (availableZapAssets[vaultData.chainId].includes(asset.address)) {
        setZapAvailable(true)
        setTokenOptions(getTokenOptions(vaultData, zapAssets[vaultData.chainId]))
      } else {
        isDefiPosition({ address: asset.address, chainId: vaultData.chainId }).then(isZapable => {
          if (isZapable) {
            setZapAvailable(true)
            setTokenOptions(getTokenOptions(vaultData, zapAssets[vaultData.chainId]))
          } else {
            setTokenOptions(getTokenOptions(vaultData))
          }
        })
      }
    }
  }, [availableZapAssets, vaultData])

  const [showModal, setShowModal] = useState(false)

  // Is loading / error
  if (!vaultData || tokenOptions.length === 0) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault.name.toLowerCase().includes(searchString) &&
    !vault.symbol.toLowerCase().includes(searchString) &&
    !vaultData.metadata.optionalMetadata.protocol?.name.toLowerCase().includes(searchString)) return <></>
  return (
    <>
      <Modal visibility={[showModal, setShowModal]} title={<AssetWithName vault={vaultData} />} >
        <div className="flex flex-col md:flex-row w-full md:gap-8">
          <div className="w-full md:w-1/2 text-start flex flex-col justify-between">

            <div className="space-y-4">
              <VaultStats vaultData={vaultData} account={account} zapAvailable={zapAvailable} />
            </div>

            <div className="hidden md:block space-y-4">
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Asset address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/assetAddress'>
                    <CopyToClipboard text={asset.address} onCopy={() => showSuccessToast("Asset address copied!")}>
                      <Square2StackIcon className="text-white group-hover/assetAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/vaultAddress'>
                    <CopyToClipboard text={vault.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              {gauge &&
                <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                  <p className="text-primary font-normal">Gauge address:</p>
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-primary">
                      {gauge.address.slice(0, 6)}...{gauge.address.slice(-4)}
                    </p>
                    <div className='w-6 h-6 group/gaugeAddress'>
                      <CopyToClipboard text={gauge.address} onCopy={() => showSuccessToast("Gauge address copied!")}>
                        <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]" />
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              }
            </div>

          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0 flex-grow rounded-lg border border-[#353945] bg-[#141416] p-6">
            <VaultInputs
              vaultData={vaultData}
              tokenOptions={tokenOptions}
              chainId={vaultData.chainId}
              hideModal={() => setShowModal(false)}
              mutateTokenBalance={mutateTokenBalance}
            />
          </div>
        </div>
      </Modal>
      <Accordion handleClick={() => setShowModal(true)}>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">

          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>

          <VaultStats vaultData={vaultData} account={account} zapAvailable={zapAvailable} />

        </div>
      </Accordion >
    </>
  )
}

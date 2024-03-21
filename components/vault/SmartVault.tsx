import { CopyToClipboard } from "react-copy-to-clipboard";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import AssetWithName from "@/components/vault/AssetWithName";
import VaultInputs from "@/components/vault/VaultInputs";
import Accordion from "@/components/common/Accordion";
import { Token, VaultData } from "@/lib/types";
import Modal from "@/components/modal/Modal";
import VaultStats from "@/components/vault/VaultStats";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import { showSuccessToast } from '@/lib/toasts';
import { useAtom } from 'jotai';
import { availableZapAssetAtom, tokensAtom, zapAssetsAtom } from '@/lib/atoms';
import { getTokenOptions, isDefiPosition } from '@/lib/vault/utils';
import { MutateTokenBalanceProps } from '@/lib/vault/mutateTokenBalance';
import { useRouter } from 'next/router';


interface SmartVaultsProps {
  vaultData: VaultData;
  searchTerm: string;
  mutateTokenBalance: (props: MutateTokenBalanceProps) => void;
  description?: string;
}

export default function SmartVault({
  vaultData,
  searchTerm,
  mutateTokenBalance,
  description,
}: SmartVaultsProps) {
  const router = useRouter();
  const { address: account } = useAccount();

  const [tokens] = useAtom(tokensAtom)

  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();

  useEffect(() => {
    if (vaultData) {
      setAsset(tokens[vaultData.chainId][vaultData.asset])
      setVault(tokens[vaultData.chainId][vaultData.vault])

      if (vaultData.gauge) {
        setGauge(tokens[vaultData.chainId][vaultData.gauge])
      }
    }
  }, [vaultData])

  const [showModal, setShowModal] = useState(false);

  // Is loading / error
  if (!vaultData) return <></>;
  // Vault is not in search term
  if (
    searchTerm !== "" &&
    !vault?.name.toLowerCase().includes(searchTerm) &&
    !vault?.symbol.toLowerCase().includes(searchTerm) &&
    !asset?.symbol.toLowerCase().includes(searchTerm) &&
    !vaultData.strategies.map(strategy =>
      strategy.metadata.name.toLowerCase())
      .includes(searchTerm)
  )
    return <></>;
  return (
    <>
      <Modal
        visibility={[showModal, setShowModal]}
        title={<AssetWithName vault={vaultData} />}
      >
        <div className="flex flex-col md:flex-row w-full md:gap-8">
          <div className="w-full md:w-1/2 text-start flex flex-col justify-between">
            <div className="space-y-4">
              <VaultStats
                vaultData={vaultData}
                account={account}
                zapAvailable={true}
              />
            </div>

            <div className="hidden md:block space-y-4">
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Asset address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.asset.slice(0, 6)}...{vaultData.asset.slice(-4)}
                  </p>
                  <div className="w-6 h-6 group/assetAddress">
                    <CopyToClipboard
                      text={vaultData.asset}
                      onCopy={() => showSuccessToast("Asset address copied!")}
                    >
                      <Square2StackIcon className="text-white group-hover/assetAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vaultData.vault.slice(0, 6)}...{vaultData.vault.slice(-4)}
                  </p>
                  <div className="w-6 h-6 group/vaultAddress">
                    <CopyToClipboard
                      text={vaultData.vault}
                      onCopy={() => showSuccessToast("Vault address copied!")}
                    >
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              {vaultData.gauge && (
                <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                  <p className="text-primary font-normal">Gauge address:</p>
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-primary">
                      {vaultData.gauge.slice(0, 6)}...{vaultData.gauge.slice(-4)}
                    </p>
                    <div className="w-6 h-6 group/gaugeAddress">
                      <CopyToClipboard
                        text={vaultData.gauge}
                        onCopy={() => showSuccessToast("Gauge address copied!")}
                      >
                        <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]" />
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              )}
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
      <Accordion handleClick={() => router.push(`/vaults/${vaultData.vault}?chainId=${vaultData.chainId}`)}>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>

          <VaultStats
            vaultData={vaultData}
            account={account}
            zapAvailable={true}
          />

          {description && (
            <p className="text-gray-500">{vaultData.metadata.description}</p>
          )}
        </div>
      </Accordion>
    </>
  );
}

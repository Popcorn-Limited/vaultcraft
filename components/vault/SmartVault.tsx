// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useEffect, useState } from "react";
import { Address, useAccount, usePublicClient, } from "wagmi";
import { getAddress } from "viem";
import { useAtom } from "jotai";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { NumberFormatter, formatAndRoundNumber, formatNumber } from "@/lib/utils/formatBigNumber";
import MarkdownRenderer from "@/components/vault/MarkdownRenderer";
import AssetWithName from "@/components/vault/AssetWithName";
import VaultInputs from "@/components/vault/VaultInputs";
import Accordion from "@/components/common/Accordion";
import TokenIcon from "@/components/common/TokenIcon";
import Title from "@/components/common/Title";
import { Token, VaultData } from "@/lib/types";
import Modal from "../modal/Modal";
import VaultStats from "./VaultStats";
import calculateAPR from "@/lib/gauges/calculateGaugeAPR";
import { MutateTokenBalanceProps } from "pages/vaults";
import { Square2StackIcon } from "@heroicons/react/24/outline";


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
  zapAssets?: Token[];
  deployer?: Address;
}

export default function SmartVault({
  vaultData,
  searchString,
  mutateTokenBalance,
  zapAssets,
  deployer,
}: SmartVaultsProps) {
  const { address: account } = useAccount();

  const vault = vaultData.vault;
  const asset = vaultData.asset;
  const gauge = vaultData.gauge;
  const tokenOptions = getTokenOptions(vaultData, zapAssets);

  const [showModal, setShowModal] = useState(false)

  // Is loading / error
  if (!vaultData || tokenOptions.length === 0) return <></>
  // Dont show if we filter by deployer
  if (!!deployer && getAddress(deployer) !== getAddress(vaultData?.metadata?.creator)) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault.name.toLowerCase().includes(searchString) &&
    !vault.symbol.toLowerCase().includes(searchString) &&
    !vaultData.metadata.optionalMetadata.protocol?.name.toLowerCase().includes(searchString)) return <></>
  return (
    <>
      <Modal visibility={[showModal, setShowModal]} title={<AssetWithName vault={vaultData} />} >
        <div className="flex flex-col md:flex-row w-full">
          <div className="w-full md:w-1/2 text-start flex flex-col justify-between">

            <div className="space-y-4">
              <VaultStats vaultData={vaultData} account={account} />
            </div>

            <div className="hidden md:block space-y-4">
              <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                <p className="text-primary font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-primary">
                    {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                  </p>
                  <div className='w-6 h-6 group/vaultAddress'>
                    <CopyToClipboard text={vault.address}>
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
                      <CopyToClipboard text={gauge.address}>
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
              vault={vault}
              asset={asset}
              gauge={gauge}
              tokenOptions={tokenOptions}
              chainId={vaultData.chainId}
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

          <VaultStats vaultData={vaultData} account={account} />

        </div>
      </Accordion >
    </>
  )
}

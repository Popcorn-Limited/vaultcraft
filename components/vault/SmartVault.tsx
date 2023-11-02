import { useEffect, useState } from "react";
import { Address, useAccount, } from "wagmi";
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


function getBaseToken(vaultData: VaultData): Token[] {
  const baseToken = [vaultData.vault, vaultData.asset]
  if (!!vaultData.gauge) baseToken.push(vaultData.gauge)
  return baseToken;
}

export default function SmartVault({
  vaultData,
  searchString,
  deployer,
}: {
  vaultData: VaultData,
  searchString: string,
  deployer?: Address
}) {
  const [yieldOptions] = useAtom(yieldOptionsAtom);
  const { address: account } = useAccount();
  const vault = vaultData.vault;
  const asset = vaultData.asset;
  const gauge = vaultData.gauge;
  const baseToken = getBaseToken(vaultData);

  const [apy, setApy] = useState<number | undefined>(0);

  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!apy) {
      // @ts-ignore
      yieldOptions?.getApy(vaultData.chainId, vaultData.metadata.optionalMetadata.resolver, vaultData.asset.address).then(res => setApy(!!res ? res.total : 0))
    }
  }, [apy])

  // Is loading / error
  if (!vaultData || baseToken.length === 0) return <></>
  // Dont show if we filter by deployer
  if (!!deployer && getAddress(deployer) !== getAddress(vaultData?.metadata?.creator)) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault.name.toLowerCase().includes(searchString) &&
    !vault.symbol.toLowerCase().includes(searchString) &&
    !vaultData.metadata.optionalMetadata.protocol?.name.toLowerCase().includes(searchString)) return <></>
  return (
    <>
      <Modal visibility={[showModal, setShowModal]} classNames="md:w-1/2"
        title={<AssetWithName vault={vaultData} />}
      >
        <div className="flex flex-row w-full">
          <div className="w-1/2 text-start flex flex-col justify-between">

            <div className="space-y-4">
              <VaultStats vaultData={vaultData} account={account} apy={apy} />
            </div>

            <div>
              <div className="w-10/12 border border-[#F0EEE0] rounded-lg p-4">
                <p className="text-primary font-normal">Vault address:</p>
                <p className="font-bold text-primary">
                  {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                </p>
              </div>
              {gauge &&
                <div className="w-10/12 border border-[#F0EEE0] rounded-lg p-4">
                  <p className="text-primary font-normal">Gauge address:</p>
                  <p className="font-bold text-primary">
                    {gauge.address.slice(0, 6)}...{gauge.address.slice(-4)}
                  </p>
                </div>
              }
            </div>

          </div>
          <div className="w-1/2 flex-grow rounded-lg border border-customLightGray p-6">
            <VaultInputs
              vault={vault}
              asset={asset}
              gauge={gauge}
              tokenOptions={[vaultData.vault, vaultData.asset]}
              chainId={vaultData.chainId}
            />
          </div>
        </div>
      </Modal>
      <Accordion handleClick={() => setShowModal(true)}>
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">

          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>

          <VaultStats vaultData={vaultData} account={account} apy={apy} />

        </div>
      </Accordion >
    </>
  )
}

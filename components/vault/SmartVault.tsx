import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import AssetWithName from "@/components/vault/AssetWithName";
import Accordion from "@/components/common/Accordion";
import { Token, VaultData } from "@/lib/types";
import VaultStats from "@/components/vault/VaultStats";
import { useAtom } from 'jotai';
import { tokensAtom } from '@/lib/atoms';
import { useRouter } from 'next/router';
import { isAddress, zeroAddress } from "viem";


interface SmartVaultsProps {
  vaultData: VaultData;
  searchTerm: string;
  description?: string;
}

export default function SmartVault({
  vaultData,
  searchTerm,
  description,
}: SmartVaultsProps) {
  const router = useRouter();
  const { query } = router;

  const { address: account } = useAccount();

  const [tokens] = useAtom(tokensAtom)

  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();

  useEffect(() => {
    if (vaultData) {
      const asset_ = tokens[vaultData.chainId][vaultData.asset];
      const vault_ = tokens[vaultData.chainId][vaultData.address];
      const gauge_ = vaultData.gauge && vaultData.gauge !== zeroAddress ? tokens[vaultData.chainId][vaultData.gauge] : undefined

      setAsset(asset_);
      setVault(vault_);
      setGauge(gauge_);
    }
  }, [vaultData])

  // Is loading / error
  if (!vaultData || !asset || !vault) return <></>;
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
      <Accordion
        handleClick={() =>
          router.push((!!query?.ref && isAddress(query.ref as string))
            ? `/vaults/${vaultData.vault}?chainId=${vaultData.chainId}&ref=${query.ref}`
            : `/vaults/${vaultData.vault}?chainId=${vaultData.chainId}`)
        }
      >
        <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
          <div className="flex items-center justify-between select-none w-full">
            <AssetWithName vault={vaultData} />
          </div>

          <VaultStats
            vaultData={vaultData}
            asset={asset}
            vault={vault}
            gauge={gauge}
            account={account}
            zapAvailable={false}
          />

          {description && (
            <p className="text-customGray500">{vaultData.metadata.description}</p>
          )}
        </div>
      </Accordion>
    </>
  );
}

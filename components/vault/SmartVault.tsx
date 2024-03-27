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
import { tokensAtom, zapAssetsAtom } from '@/lib/atoms';
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
      <Accordion handleClick={() => router.push(`/vaults/${vaultData.vault}?chainId=${vaultData.chainId}`)}>
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
            <p className="text-gray-500">{vaultData.metadata.description}</p>
          )}
        </div>
      </Accordion>
    </>
  );
}

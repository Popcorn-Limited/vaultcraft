import MainActionButton from "@/components/button/MainActionButton";
import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData } from "@/lib/types";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import { ArrowRightCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";


// TODO
// - Change Fees
// -- Propose
// -- Accept
// - Change Strategy
// -- Propose
// -- Accept
// - Take Fees
// - Change FeeRecipient
// - Change DepositLimit
// - Pause / Unpause

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [vaults, setVaults] = useAtom(vaultsAtom)
  const [vault, setVault] = useState<VaultData>()

  useEffect(() => {
    if (!vault && query && vaults.length > 0) {
      setVault(vaults.find(vault => vault.address === query?.id && vault.chainId === Number(query?.chainId)))
    }
  }, [vaults, query, vault])

  return <NoSSR>
    {
      vault ? (
        <section className="py-10 px-4 md:px-8 text-white">
          <AssetWithName vault={vault} />
          <div>
            <div className="flex flex-row justify-between items-center">
              <div>
                <p>Current Strategy</p>
                <p>Name: {vault.metadata.optionalMetadata.protocol.name}</p>
                <p>Description: {vault.metadata.optionalMetadata.protocol.description}</p>
                <p>Apy: {`${NumberFormatter.format(roundToTwoDecimalPlaces(vault.totalApy))} %`}</p>
                <p>Propose new Strategy in: 3d</p>
                <MainActionButton label="Propose new Strategy" />
              </div>
              <div>
                <ArrowRightIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <p>Proposed Strategy</p>
                <p>Name: {vault.metadata.optionalMetadata.protocol.name}</p>
                <p>Description: {vault.metadata.optionalMetadata.protocol.description}</p>
                <p>Apy: {`${NumberFormatter.format(roundToTwoDecimalPlaces(vault.totalApy))} %`}</p>
                <p>Accept in: 0s</p>
                <MainActionButton label="Accept new Strategy" />
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div>
                <p>Current Fee Config:</p>
                <p>Deposit: {vault.fees.deposit / 1e16} %</p>
                <p>Withdrawal: {vault.fees.withdrawal / 1e16} %</p>
                <p>Management: {vault.fees.management / 1e16} %</p>
                <p>Performance: {vault.fees.performance / 1e16} %</p>
                <p>Propose new Fee in: 3d</p>
                <MainActionButton label="Propose new Fee" />
              </div>
              <div>
                <ArrowRightIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <p>Proposed Fee Config:</p>
                <p>Deposit: {vault.fees.deposit / 1e16} %</p>
                <p>Withdrawal: {vault.fees.withdrawal / 1e16} %</p>
                <p>Management: {vault.fees.management / 1e16} %</p>
                <p>Performance: {vault.fees.performance / 1e16} %</p>
                <p>Accept in: 0s</p>
                <MainActionButton label="Accept new Fee" />
              </div>
            </div>
            <div>
              <p>FeeRecipient:</p>
              {/* TODO change to actual fee recipient */}
              <p>Fee recipient: {vault.metadata.creator}</p>
              <MainActionButton label="Change Fee Recipient" />
            </div>
            <div>
              <p>Deposit Limit</p>
              <p>Deposit Limit: {vault.depositLimit}</p>
              <MainActionButton label="Change Deposit Limit" />
            </div>
            <div>
              <p>Accumulated Fees</p>
              <p>Accumulated Fees: $10k</p>
              <MainActionButton label="Take Fees" />
            </div>
            <div>
              <p>IsPaused: false</p>
              <MainActionButton label="Pause Vault" />
            </div>
          </div>
        </section>
      ) :
        <p className="text-white">Loading...</p>
    }
  </NoSSR>
}
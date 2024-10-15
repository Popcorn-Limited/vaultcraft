import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData, Token } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { createPublicClient, http, isAddress } from "viem";
import { VaultAbi } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { tokensAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ApyChart from "@/components/vault/management/vault/ApyChart";
import NetFlowChart from "@/components/vault/management/vault/NetFlowChart";
import VaultHero from "@/components/vault/VaultHero";
import RewardsSection from "@/components/vault/management/vault/RewardsSection";
import VaultsV1Settings from "@/components/vault/management/vault/VaultsV1Settings";
import VaultsV2Settings from "@/components/vault/management/vault/VaultsV2Settings";
import StrategyDescription from "@/components/vault/StrategyDescription";
import Link from "next/link";
import CopyAddress from "@/components/common/CopyAddress";

async function getLogs(vault: VaultData, asset: Token) {
  const client = createPublicClient({
    chain: ChainById[vault.chainId],
    transport: http(RPC_URLS[vault.chainId]),
  });

  const initLog = await client.getContractEvents({
    address: vault.address,
    abi: VaultAbi,
    eventName: "VaultInitialized",
    fromBlock: "earliest",
    toBlock: "latest",
  });
  const creationBlockNumber = initLog[0].blockNumber;
  const creationBlock = await client.getBlock({
    blockNumber: creationBlockNumber,
  });
  const creationTime = new Date(Number(creationBlock.timestamp) * 1000);
  const creationDate = Date.UTC(
    creationTime.getFullYear(),
    creationTime.getMonth(),
    creationTime.getDate(),
    0,
    0,
    0
  );

  const depositLogs = await client.getContractEvents({
    address: vault.address,
    abi: VaultAbi,
    eventName: "Deposit",
    fromBlock: creationBlockNumber,
    toBlock: "latest",
  });
  const withdrawLogs = await client.getContractEvents({
    address: vault.address,
    abi: VaultAbi,
    eventName: "Withdraw",
    fromBlock: creationBlockNumber,
    toBlock: "latest",
  });

  const latestBlock = await client.getBlock({ blockTag: "latest" });

  let result = [];
  let startBlock =
    creationBlockNumber -
    BigInt(
      Math.floor((Number(creationBlock.timestamp) - creationDate / 1000) / 13)
    );
  let day = 0;
  while (startBlock < latestBlock.number) {
    const newBlock = startBlock + BigInt(7200);

    const deposits = depositLogs.filter(
      (log) => log.blockNumber > startBlock && log.blockNumber < newBlock
    );
    const withdrawals = withdrawLogs.filter(
      (log) => log.blockNumber > startBlock && log.blockNumber < newBlock
    );

    const totalDeposits =
      deposits.reduce((acc, obj) => acc + Number(obj.args.assets), 0) /
      10 ** asset.decimals;
    const totalWithdrawals =
      withdrawals.reduce((acc, obj) => acc + Number(obj.args.assets), 0) /
      10 ** asset.decimals;
    const netFlows = totalDeposits - totalWithdrawals;
    result.push({
      day,
      logs: [...deposits, ...withdrawals],
      deposits: totalDeposits,
      withdrawals: totalWithdrawals,
      net: netFlows,
    });

    startBlock = newBlock;
    day += 1;
  }
  return result;
}

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const [vaults] = useAtom(vaultsAtom);
  const [tokens] = useAtom(tokensAtom);

  const [asset, setAsset] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [vault, setVault] = useState<Token>();

  const [vaultData, setVaultData] = useState<VaultData>();

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function setupVault() {
      const vault_ = vaults[Number(query?.chainId)].find(
        (vault) => vault.address === query?.id
      );

      if (vault_) {
        const logs_ = await getLogs(
          vault_,
          tokens[vault_.chainId][vault_.asset]
        );
        setAsset(tokens[vault_.chainId][vault_.asset]);
        setVault(tokens[vault_.chainId][vault_.vault]);
        if (vault_.gauge) setGauge(tokens[vault_.chainId][vault_.gauge]);

        setVaultData(vault_);
        setLogs(logs_);
      }
    }
    if (
      !vaultData &&
      query &&
      Object.keys(vaults).length > 0 &&
      Object.keys(tokens).length > 0
    )
      setupVault();
  }, [vaults, tokens, query, vaultData]);

  return (
    <NoSSR>
      {vaultData && asset && vault ? (
        <div className="min-h-screen">
          <button
            className="border border-customGray500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-0 mt-10"
            type="button"
            onClick={() =>
              router.push(
                !!query?.ref && isAddress(query.ref as string)
                  ? `/manage/vaults?ref=${query.ref}`
                  : "/manage/vaults"
              )
            }
          >
            <div className="w-5 h-5">
              <LeftArrowIcon color="#FFF" />
            </div>
            <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
          </button>

          <VaultHero vaultData={vaultData} asset={asset} vault={vault} gauge={gauge} isManaged />

          <section className="px-4 md:px-0 text-white">
            <div className="md:flex mt-12 md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4 px-6">
                <p className="text-white font-normal">Vault address:</p>
                <div className="text-white w-full">
                  <CopyAddress address={vaultData.address} label="Vault" />
                </div>
              </div>

              <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                <p className="text-white font-normal">Asset address:</p>
                <div className="text-white w-full">
                  <CopyAddress address={vaultData.asset} label="Asset" />
                </div>
              </div>

              {vaultData.gauge && (
                <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                  <p className="text-white font-normal">Gauge address:</p>
                  <div className="text-white w-full">
                    <CopyAddress address={vaultData.gauge} label="Gauge" />
                  </div>
                </div>
              )}
            </div>

            <div className="border border-customNeutral100 rounded-lg p-4 mt-4">
              <p className="text-white text-2xl font-bold">Strategies</p>
              {vaultData.strategies.map((strategy, i) =>
                <Link
                  key={`${strategy.resolver}-${i}`}
                  href={`/manage/strategies/${strategy.address}?chainId=${vaultData.chainId}`}
                  passHref
                >
                  <StrategyDescription
                    strategy={strategy}
                    asset={asset}
                    chainId={vaultData.chainId}
                    i={i}
                    stratLen={vaultData.strategies.length}
                    isManaged
                  />
                </Link>
              )}
            </div>

            <div className="grid md:grid-cols-2 mb-12">
              <ApyChart strategy={vaultData.strategies[0]} />
              <NetFlowChart logs={logs} asset={asset} />
            </div>
          </section>

          {
            vaultData.gauge && (
              <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0 text-white">
                <h2 className="text-white font-bold text-2xl">
                  Manage Gauge Rewards
                </h2>
                <RewardsSection gauge={vaultData.gauge} chainId={vaultData.chainId} />
              </section>
            )
          }

          {
            ["multi-strategy-vault-v2", "multi-strategy-vault-v2.5"].includes(vaultData.metadata.type)
              ? <VaultsV2Settings vaultData={vaultData} />
              : <VaultsV1Settings vaultData={vaultData} />
          }

        </div >
      ) : (
        <p className="text-white">Loading...</p>
      )
      }
    </NoSSR >
  );
}
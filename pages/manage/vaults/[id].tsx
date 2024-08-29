import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData, Token } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { createPublicClient, http, isAddress } from "viem";
import { VaultAbi } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { tokensAtom } from "@/lib/atoms";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ApyChart from "@/components/vault/management/vault/ApyChart";
import NetFlowChart from "@/components/vault/management/vault/NetFlowChart";
import VaultHero from "@/components/vault/VaultHero";
import RewardsSection from "@/components/vault/management/vault/RewardsSection";
import VaultsV1Settings from "@/components/vault/management/vault/VaultsV1Settings";
import VaultsV2Settings from "@/components/vault/management/vault/VaultsV2Settings";
import StrategyDescription from "@/components/vault/StrategyDescription";
import Link from "next/link";

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

  const [yieldOptions] = useAtom(yieldOptionsAtom);

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
      Object.keys(tokens).length > 0 &&
      yieldOptions
    )
      setupVault();
  }, [vaults, tokens, query, vaultData, yieldOptions]);

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

          <VaultHero vaultData={vaultData} asset={asset} vault={vault} gauge={gauge} showClaim={false} />

          {vaultData.gauge && (
            <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0 text-white">
              <h2 className="text-white font-bold text-2xl">
                Manage Gauge Rewards
              </h2>
              <RewardsSection gauge={vaultData.gauge} chainId={vaultData.chainId} />
            </section>
          )}

          <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0 text-white">
            <div className="grid md:grid-cols-2 mb-12">
              <ApyChart strategy={vaultData.strategies[0]} />
              <NetFlowChart logs={logs} asset={asset} />
            </div>

            <div className="md:flex mt-12 md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4 px-6">
                <p className="text-white font-normal">Vault address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-white">
                    {vaultData.address.slice(0, 6)}...
                    {vaultData.address.slice(-4)}
                  </p>
                  <div className="w-6 h-6 group/vaultAddress">
                    <CopyToClipboard
                      text={vaultData.address}
                      onCopy={() => showSuccessToast("Vault address copied!")}
                    >
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                <p className="text-white font-normal">Asset address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-white">
                    {vaultData.asset.slice(0, 6)}...{vaultData.asset.slice(-4)}
                  </p>
                  <div className="w-6 h-6 group/vaultAddress">
                    <CopyToClipboard
                      text={vaultData.asset}
                      onCopy={() => showSuccessToast("Asset address copied!")}
                    >
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>

              {vaultData.gauge && (
                <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                  <p className="text-white font-normal">Gauge address:</p>
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-white">
                      {vaultData.gauge.slice(0, 6)}...
                      {vaultData.gauge.slice(-4)}
                    </p>
                    <div className="w-6 h-6 group/gaugeAddress">
                      <CopyToClipboard
                        text={vaultData.gauge}
                        onCopy={() => showSuccessToast("Gauge address copied!")}
                      >
                        <Square2StackIcon className="text-white group-hover/gaugeAddress:text-primaryYellow" />
                      </CopyToClipboard>
                    </div>
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
                    i={i}
                    stratLen={vaultData.strategies.length}
                  />
                </Link>
              )}
            </div>

          </section>

          {vaultData.metadata.type === "multi-strategy-vault-v2"
            ? <VaultsV2Settings vaultData={vaultData} />
            : <VaultsV1Settings vaultData={vaultData} />
          }

        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </NoSSR>
  );
}
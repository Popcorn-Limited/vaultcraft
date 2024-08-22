import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData, Token, Strategy } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { Address, createPublicClient, getAddress, http, isAddress } from "viem";
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
import AssetWithName from "@/components/common/AssetWithName";
import ProtocolIcon from "@/components/common/ProtocolIcon";
import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";

async function getLogs(vault: Address, asset: Token, chainId: number) {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  });

  const initLog = await client.getContractEvents({
    address: vault,
    abi: VaultAbi,
    eventName: "Deposit",
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
    address: vault,
    abi: VaultAbi,
    eventName: "Deposit",
    fromBlock: creationBlockNumber,
    toBlock: "latest",
  });
  const withdrawLogs = await client.getContractEvents({
    address: vault,
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
  const [chainId, setChainId] = useState<number>()
  const [strategy, setStrategy] = useState<Strategy>();

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function setupVault() {
      const vault_ = vaults[Number(query?.chainId)].find(
        (vault) => vault.strategies.find(strategy => strategy.address === query?.id)
      );

      if (vault_) {
        const strategyAddr = getAddress(query?.id as string)
        const logs_ = await getLogs(
          strategyAddr,
          tokens[vault_.chainId][vault_.asset],
          vault_.chainId
        );
        setChainId(Number(query?.chainId))
        setAsset(tokens[vault_.chainId][vault_.asset]);
        setStrategy(vault_.strategies.find(strategy => strategy.address === strategyAddr));
        setLogs(logs_);
      }
    }
    if (
      !strategy &&
      query &&
      Object.keys(vaults).length > 0 &&
      Object.keys(tokens).length > 0
    )
      setupVault();
  }, [vaults, tokens, query, strategy]);

  return (
    <NoSSR>
      {strategy && asset && chainId ? (
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

          <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-0 ">
            <div
              className={"flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1"}
            >
              <div className="relative">
                <NetworkSticker chainId={chainId} size={3} />
                <TokenIcon
                  token={asset}
                  icon={asset.logoURI}
                  chainId={chainId}
                  imageSize={"w-12 h-12"}
                />
              </div>
              <h2
                className={`text-4xl font-bold text-white mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}
              >
                {strategy.metadata.name}
              </h2>
              <div className="flex flex-row flex-wrap w-max space-x-2">
                <ProtocolIcon
                  protocolName={strategy.metadata.protocol}
                  tooltip={{
                    id: "strategyDescription",
                    content: (
                      <p className="w-60">
                        {strategy.metadata.description}
                      </p>
                    ),
                  }}
                  size={3}
                />
              </div>
            </div>
            <p className="text-white mt-4">{strategy.metadata.description}</p>
          </section>

          <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0 text-white">
            <div className="grid md:grid-cols-2 mb-12">
              <ApyChart strategy={strategy} />
              <NetFlowChart logs={logs} asset={asset} />
            </div>

            <div className="md:flex mt-12 md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4 px-6">
                <p className="text-white font-normal">Strategy address:</p>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-white">
                    {strategy.address.slice(0, 6)}...
                    {strategy.address.slice(-4)}
                  </p>
                  <div className="w-6 h-6 group/vaultAddress">
                    <CopyToClipboard
                      text={strategy.address}
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
                    {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
                  </p>
                  <div className="w-6 h-6 group/vaultAddress">
                    <CopyToClipboard
                      text={asset.address}
                      onCopy={() => showSuccessToast("Asset address copied!")}
                    >
                      <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </NoSSR>
  );
}
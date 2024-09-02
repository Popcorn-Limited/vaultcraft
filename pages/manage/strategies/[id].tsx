import { vaultsAtom } from "@/lib/atoms/vaults";
import { VaultData, Token, Strategy } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { Address, createPublicClient, erc20Abi, formatUnits, getAddress, http, isAddress, PublicClient, zeroAddress } from "viem";
import { AnyToAnyDepositorAbi, AssetPushOracleAbi, AssetPushOracleByChain, VaultAbi } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { tokensAtom } from "@/lib/atoms";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { ArrowDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
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
import TabSelector from "@/components/common/TabSelector";
import InputNumber from "@/components/input/InputNumber";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";
import { handleAllowance } from "@/lib/approve";
import { formatNumber, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { claimReserve, pullFunds, pushFunds } from "@/lib/vault/management/strategyInteractions";

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
  const creationBlockNumber = initLog[0]?.blockNumber || BigInt(0);
  const creationBlock = creationBlockNumber === BigInt(0)
    ? await client.getBlock({
      blockNumber: creationBlockNumber,
    })
    : await client.getBlock();
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
                  <div className="w-6 h-6 group/strategyAddress">
                    <CopyToClipboard
                      text={strategy.address}
                      onCopy={() => showSuccessToast("Vault address copied!")}
                    >
                      <Square2StackIcon className="text-white group-hover/strategyAddress:text-primaryYellow" />
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
                  <div className="w-6 h-6 group/assetAddress">
                    <CopyToClipboard
                      text={asset.address}
                      onCopy={() => showSuccessToast("Asset address copied!")}
                    >
                      <Square2StackIcon className="text-white group-hover/assetAddress:text-primaryYellow" />
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              {strategy.yieldAsset && strategy.yieldAsset !== zeroAddress &&
                <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                  <p className="text-white font-normal">YieldAsset address:</p>
                  <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-white">
                      {strategy.yieldAsset.slice(0, 6)}...{strategy.yieldAsset.slice(-4)}
                    </p>
                    <div className="w-6 h-6 group/yieldAssetAddress">
                      <CopyToClipboard
                        text={strategy.yieldAsset}
                        onCopy={() => showSuccessToast("YieldAsset address copied!")}
                      >
                        <Square2StackIcon className="text-white group-hover/yieldAssetAddress:text-primaryYellow" />
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

          {
            strategy && strategy.metadata.type === "AnyToAnyV1" &&
            <div>
              <AnyToAnyV1DepositorSettings strategy={strategy} asset={asset} yieldAsset={tokens[chainId][strategy.yieldAsset!]} chainId={chainId} />
            </div>
          }

        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </NoSSR>
  );
}


async function getAnyToAnyData(address: Address, asset: Token, yieldAsset: Token, chainId: number): Promise<AnyToAnySettings> {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  });

  const res1 = await client.multicall({
    contracts: [
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "owner",
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "keeper",
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "floatRatio",
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "proposedFloatRatio",
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "slippage",
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "proposedSlippage",
      },
      {
        address: yieldAsset.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address]
      },
      {
        address: asset.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address]
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "totalReservedAssets",
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "totalReservedYieldAssets",
      },
      {
        address: AssetPushOracleByChain[chainId],
        abi: AssetPushOracleAbi,
        functionName: "prices",
        args: [yieldAsset.address, asset.address]
      },
      {
        address: AssetPushOracleByChain[chainId],
        abi: AssetPushOracleAbi,
        functionName: "prices",
        args: [asset.address, yieldAsset.address]
      }
    ],
    allowFailure: false
  })
  const assetBal = Number(res1[7] - res1[8]);
  const yieldAssetBal = Number(res1[6] - res1[9])
  return {
    owner: res1[0],
    keeper: res1[1],
    assetBal: assetBal,
    yieldAssetBal: yieldAssetBal,
    reservedAssets: Number(res1[2]),
    reservedYieldAssets: Number(res1[3]),
    float: res1[2],
    proposedFloat: { value: res1[3][0], time: res1[3][1] },
    slippage: res1[4],
    proposedSlippage: { value: res1[5][0], time: res1[5][1] },
    bqPrice: Number(res1[10]),
    qbPrice: Number(res1[11]),
    totalAssets: assetBal + ((yieldAssetBal * (Number(res1[10]) / 1e18)) / (10 ** (yieldAsset.decimals - asset.decimals)))
  }
}

interface ProposedChange {
  value: bigint;
  time: bigint;
}

interface AnyToAnySettings {
  owner: Address;
  keeper: Address;
  assetBal: number;
  yieldAssetBal: number;
  reservedAssets: number;
  reservedYieldAssets: number;
  float: bigint;
  proposedFloat: ProposedChange;
  slippage: bigint;
  proposedSlippage: ProposedChange;
  bqPrice: number;
  qbPrice: number;
  totalAssets: number;
}

interface PassThroughProps {
  strategy: Strategy;
  asset: Token;
  yieldAsset: Token;
  settings: AnyToAnySettings;
  chainId: number;
}

const DEFAULT_TABS = ["Convert", "Slippage", "Float"]

function AnyToAnyV1DepositorSettings({ strategy, asset, yieldAsset, chainId }: { strategy: Strategy, asset: Token, yieldAsset: Token, chainId: number }) {
  const [settings, setSettings] = useState<AnyToAnySettings>()
  const [tab, setTab] = useState<string>("Convert")

  useEffect(() => {
    if (strategy.address) getAnyToAnyData(strategy.address, asset, yieldAsset, chainId).then(res => setSettings(res))
  }, [strategy, asset, chainId])

  return settings ? (
    <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0 text-white">
      <h2 className="text-white font-bold text-2xl">Vault Settings</h2>
      <TabSelector
        className="mt-6 mb-12"
        availableTabs={DEFAULT_TABS}
        activeTab={tab}
        setActiveTab={(t: string) => setTab(t)}
      />
      {
        tab === "Convert" && <ConvertSection strategy={strategy} asset={asset} yieldAsset={yieldAsset} settings={settings} chainId={chainId} />
      }
    </section>
  )
    : <p className="text-white">Loading...</p>
}

async function getReserveLogs(address: Address, account: Address, client: PublicClient) {
  let addedLogs = await client.getContractEvents({
    address: address,
    abi: AnyToAnyDepositorAbi,
    eventName: "ReserveAdded",
    fromBlock: "earliest",
    toBlock: "latest",
  });
  const removeLogs = await client.getContractEvents({
    address: address,
    abi: AnyToAnyDepositorAbi,
    eventName: "ReserveClaimed",
    fromBlock: "earliest",
    toBlock: "latest",
  });
  // Filter out claimed reserves
  const removedBlocks = removeLogs.map(log => log.args.blockNumber)
  addedLogs = addedLogs.filter(log => !removedBlocks.includes(log.args.blockNumber))

  // Filter out reserves that are not for account
  addedLogs = addedLogs.filter(log => log.args.user === account);

  return addedLogs
}

function ConvertSection({ strategy, asset, yieldAsset, settings, chainId }: PassThroughProps) {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const [reserves, setReserves] = useState<any[]>()

  useEffect(() => {
    if (publicClient && account && !reserves) updateReserves()
  }, [publicClient, account, strategy])

  async function updateReserves() {
    const logs = await getReserveLogs(strategy.address, account!, publicClient!)
    setReserves(logs)
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between space-x-8">
        <div className="w-1/2">
          <p className="text-white text-2xl">Deposit YieldAsset</p>
          <p>Deposit yieldAssets to claim assets at an equivalent value after</p>
          <ConvertToken token={yieldAsset} strategy={strategy} asset={asset} yieldAsset={yieldAsset} settings={settings} chainId={chainId} updateReserves={updateReserves} />
        </div>
        <div className="w-1/2">
          <p className="text-white text-2xl">Deposit Asset</p>
          <p>Deposit assets to claim yieldAssets at an equivalent value after</p>
          <ConvertToken token={asset} strategy={strategy} asset={asset} yieldAsset={yieldAsset} settings={settings} chainId={chainId} updateReserves={updateReserves} />
        </div>
      </div>
      <div className="w-full border border-customNeutral100 rounded-lg p-4 my-4 flex flex-row justify-between">
        <div className="w-1/2 px-4">
          <p className="text-xl">Price</p>
          <span className="flex space-x-2">
            <p>Assets p. YieldAsset:</p>
            <p className="text-customGray300">{settings.bqPrice / 1e18}</p>
          </span>
          <span className="flex space-x-2">
            <p>YieldAssets p. Asset:</p>
            <p className="text-customGray300">{settings.qbPrice / 1e18}</p>
          </span>
        </div>
        <div className="w-1/2 px-4">
          <p className="text-xl">Balance</p>
          <span className="flex space-x-2">
            <p>Assets:</p>
            <p className="text-customGray300">{settings.assetBal / (10 ** asset.decimals)}</p>
          </span>
          <span className="flex space-x-2">
            <p>YieldAssets:</p>
            <p className="text-customGray300">{settings.yieldAssetBal / (10 ** yieldAsset.decimals)}</p>
          </span>
          <span className="flex space-x-2">
            <p>Total Assets:</p>
            <p className="text-customGray300">{settings.totalAssets / (10 ** asset.decimals)}</p>
          </span>
        </div>
      </div>
      <ReservesContainer strategy={strategy} asset={asset} yieldAsset={yieldAsset} settings={settings} chainId={chainId} reserves={reserves} updateReserves={updateReserves} />
    </>
  )
}

function ConvertToken({ token, strategy, asset, yieldAsset, settings, chainId, updateReserves }: PassThroughProps & { token: Token, updateReserves: Function }) {
  const { owner, keeper, assetBal, yieldAssetBal, bqPrice, qbPrice } = settings;
  const isAsset = token.address === asset.address
  const price = isAsset ? qbPrice : bqPrice
  const float = (settings.assetBal / (10 ** asset.decimals)) / (10_000 / Number(settings.float))
  const depositLimit = isAsset ? (yieldAssetBal / (10 ** yieldAsset.decimals)) / (bqPrice / 1e18) : ((assetBal / (10 ** asset.decimals)) - float) / (price / 1e18)

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [tokens, setTokens] = useAtom(tokensAtom);

  const [amount, setAmount] = useState<string>("0");

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setAmount(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!token) return;
    const stringBal = token.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), token.decimals);
    const formatted = formatUnits(rounded, token.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
  }

  async function handleApprove() {
    let val = Number(amount)
    if (val === 0 || !account || !publicClient || !walletClient) return
    val = val * (10 ** token.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    handleAllowance({
      token: token.address,
      spender: strategy.address,
      amount: val,
      account: account,
      clients: {
        publicClient,
        walletClient
      }
    })
  }

  async function handleDeposit() {
    let val = Number(amount)
    if (val === 0 || !account || !publicClient || !walletClient) return
    val = val * (10 ** token.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    let success
    if (isAsset) {
      success = await pullFunds({
        amount: val,
        address: strategy.address,
        account,
        clients: {
          publicClient,
          walletClient
        }
      })
    }
    else {
      success = await pushFunds({
        amount: val,
        address: strategy.address,
        account,
        clients: {
          publicClient,
          walletClient
        }
      })
    }
    if (success) updateReserves()
  }

  return (
    <div className="">
      <div className="">
        <div>
          <p>Input Amount</p>
          <InputTokenWithError
            onSelectToken={() => { }}
            onMaxClick={handleMaxClick}
            chainId={chainId}
            value={amount}
            onChange={handleChangeInput}
            selectedToken={token}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput={true}
          />
          <p>DepositLimit: {isAsset
            ? formatNumber(depositLimit)
            : formatNumber(depositLimit)}
          </p>
        </div>
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-customGray500" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-customNeutral300 px-4">
              <ArrowDownIcon
                className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                aria-hidden="true"
                onClick={() => { }}
              />
            </span>
          </div>
        </div>
        <div>
          <p>Claimable Amount</p>
          <InputTokenWithError
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={chainId}
            value={(Number(amount) * price) / 1e18}
            onChange={() => { }}
            selectedToken={isAsset ? yieldAsset : asset}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput={false}
          />
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <SecondaryActionButton
          label="Approve"
          handleClick={handleApprove} disabled={!account || (account !== owner && account !== keeper)}
        />
        <MainActionButton
          label="Deposit"
          handleClick={handleDeposit}
          disabled={!account || (account !== owner && account !== keeper) || Number(amount) >= depositLimit}
        />
      </div>
    </div>
  )
}

function ReservesContainer({ strategy, asset, yieldAsset, settings, chainId, reserves, updateReserves }: PassThroughProps & { reserves?: any[], updateReserves: Function }) {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  async function handleMainAction(log: any) {
    if (!account || !publicClient || !walletClient) return

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    const success = await claimReserve({
      blockNumber: log.args.blockNumber,
      isYieldAsset: log.args.asset === asset.address,
      address: strategy.address,
      account,
      clients: {
        publicClient,
        walletClient
      }
    })
    if (success) updateReserves()
  }

  return (
    <div className="mt-4">
      <p className="text-white text-2xl">Claim Withdrawable</p>
      <div className="w-full flex flex-row items-center mt-4">
        <p className="w-1/3">Deposited</p>
        <p className="w-1/3">Withdrawable</p>
        <p className="w-1/3"></p>
      </div>
      {
        reserves?.map(log => {
          const isAsset = log.args.asset === asset.address
          return (
            <div key={log.blockHash} className="w-full flex flex-row items-center">
              <p className="w-1/3">{Number(log.args.amount) / (10 ** (isAsset ? asset.decimals : yieldAsset.decimals))} {isAsset ? asset.symbol : yieldAsset.symbol}</p>
              <p className="w-1/3">{Number(log.args.withdrawable) / (10 ** (isAsset ? yieldAsset.decimals : asset.decimals))} {isAsset ? yieldAsset.symbol : asset.symbol}</p>
              <div className="w-1/3">
                <MainActionButton label="Claim" handleClick={() => handleMainAction(log)} disabled={!account} />
              </div>
            </div>
          )
        }
        )
      }
    </div>
  )
}

// set slippage
// set float
import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import {
  VaultFees,
  VaultData,
  Token,
  Strategy,
  TokenByAddress,
} from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import {
  Fragment,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import NoSSR from "react-no-ssr";
import { createConfig, erc20ABI, useAccount, useContractWrite, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import axios from "axios";
import {
  Address,
  createPublicClient,
  extractChain,
  formatEther,
  formatUnits,
  getContract,
  http,
  isAddress,
  zeroAddress,
} from "viem";
import {
  AdminProxyByChain,
  GaugeAbi,
  MultiStrategyVaultAbi,
  VaultAbi,
  VaultControllerByChain,
} from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import * as chains from "viem/chains";
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import TabSelector from "@/components/common/TabSelector";
import VaultStrategyConfiguration from "@/components/vault/management/vault/Strategy";
import VaultPausing from "@/components/vault/management/vault/Pausing";
import VaultDepositLimit from "@/components/vault/management/vault/DepositLimit";
import VaultFeeRecipient from "@/components/vault/management/vault/FeeRecipient";
import VaultFeeConfiguration from "@/components/vault/management/vault/FeeConfiguration";
import VaultTakeFees from "@/components/vault/management/vault/Fees";
import VaultStrategiesConfiguration from "@/components/vault/management/vault/Strategies";
import VaultRebalance from "@/components/vault/management/vault/Rebalance";
import { tokensAtom } from "@/lib/atoms";
import InputNumber from "@/components/input/InputNumber";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";
import {
  NumberFormatter,
  formatAndRoundNumber,
  safeRound,
} from "@/lib/utils/formatBigNumber";
import {
  roundToTwoDecimalPlaces,
  validateInput,
} from "@/lib/utils/helpers";
import Modal from "@/components/modal/Modal";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ApyChart from "@/components/vault/management/vault/ApyChart";
import NetFlowChart from "@/components/vault/management/vault/NetFlowChart";
import { votingPeriodEnd } from "@/components/boost/StakingInterface";
import TokenIcon from "@/components/common/TokenIcon";
import { getRewardData } from "@/lib/gauges/useGaugeRewardData";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { fundReward } from "@/lib/gauges/interactions";
import { handleAllowance } from "@/lib/approve";

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

export interface VaultSettings {
  proposedStrategies: Address[];
  proposedStrategyTime: number;
  proposedFees: VaultFees;
  proposedFeeTime: number;
  paused: boolean;
  feeBalance: number;
  accruedFees: number;
  owner: Address;
}

function getMulticalls(vault: VaultData) {
  const vaultContract = {
    address: vault.address,
    abi: vault.strategies.length > 1 ? MultiStrategyVaultAbi : VaultAbi,
  };
  const result = [
    {
      ...vaultContract,
      functionName: "proposedFees",
    },
    {
      ...vaultContract,
      functionName: "proposedFeeTime",
    },
    {
      ...vaultContract,
      functionName: "paused",
    },
    {
      ...vaultContract,
      functionName: "balanceOf",
      args: [vault.metadata.feeRecipient],
    },
    {
      ...vaultContract,
      functionName: "accruedManagementFee",
    },
    {
      ...vaultContract,
      functionName: "accruedPerformanceFee",
    },
    {
      ...vaultContract,
      functionName: "owner",
    },
  ];

  if (vault.strategies.length > 1) {
    return [
      {
        ...vaultContract,
        functionName: "getProposedStrategies",
      },
      {
        ...vaultContract,
        functionName: "proposedStrategyTime",
      },
      ...result,
    ];
  } else {
    return [
      {
        ...vaultContract,
        functionName: "proposedAdapter",
      },
      {
        ...vaultContract,
        functionName: "proposedAdapterTime",
      },
      ...result,
    ];
  }
}

async function getVaultSettings(
  vault: VaultData,
  yieldOptions: YieldOptions
): Promise<VaultSettings> {
  const client = createPublicClient({
    chain: extractChain({
      chains: Object.values(chains),
      // @ts-ignore
      id: vault.chainId,
    }),
    transport: http(RPC_URLS[vault.chainId]),
  });

  const res: any[] = await client.multicall({
    contracts: getMulticalls(vault),
    allowFailure: false,
  });

  return {
    proposedStrategies: vault.strategies.length > 1 ? res[0] : [res[0]],
    proposedStrategyTime: Number(res[1]),
    proposedFees: {
      deposit: Number(res[2][0]),
      withdrawal: Number(res[2][1]),
      management: Number(res[2][2]),
      performance: Number(res[2][3]),
    },
    proposedFeeTime: Number(res[3]),
    paused: res[4],
    feeBalance: Number(res[5]),
    accruedFees: Number(res[6]) + Number(res[7]),
    owner: res[8],
  };
}

const DEFAULT_TABS = [
  "Strategy",
  "Fee Configuration",
  "Fee Recipient",
  "Take Fees",
  "Deposit Limit",
  "Pausing",
];

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const { address: account } = useAccount();

  const [vaults, setVaults] = useAtom(vaultsAtom);
  const [tokens] = useAtom(tokensAtom);

  const [asset, setAsset] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [vault, setVault] = useState<Token>();

  const [vaultData, setVaultData] = useState<VaultData>();
  const [settings, setSettings] = useState<VaultSettings>();
  const [callAddress, setCallAddress] = useState<Address>();

  const [logs, setLogs] = useState<any[]>([]);
  const [availableTabs, setAvailableTabs] = useState<string[]>(DEFAULT_TABS);
  const [tab, setTab] = useState<string>("Strategy");

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
        const settings_ = await getVaultSettings(vault_, yieldOptions!);

        setAsset(tokens[vault_.chainId][vault_.asset]);
        setVault(tokens[vault_.chainId][vault_.vault]);
        if (vault_.gauge) setGauge(tokens[vault_.chainId][vault_.gauge]);

        setVaultData(vault_);
        setSettings(settings_);
        setCallAddress(
          settings_.owner === AdminProxyByChain[vault_.chainId]
            ? VaultControllerByChain[vault_.chainId]
            : vault_.address
        );
        setLogs(logs_);

        if (vault_.strategies.length > 1) {
          setAvailableTabs(["Rebalance", ...DEFAULT_TABS]);
          setTab("Rebalance");
        }
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

  function changeTab(tab: string) {
    setTab(tab);
  }

  return (
    <NoSSR>
      {vaultData ? (
        <div className="min-h-screen">
          <button
            className="border border-customGray500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-8 mt-10"
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

          <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-8">
            <div className="w-full mb-8">
              <AssetWithName vault={vaultData} size={3} />
            </div>

            <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
              <div className="flex flex-wrap md:flex-row md:pr-10 md:w-fit gap-y-4 md:gap-10">
                <div className="w-1/2 md:w-[120px]">
                  <p className="leading-6 text-base text-customGray100 md:text-white">
                    Your Wallet
                  </p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white leading-0">
                    {asset
                      ? `$ ${formatAndRoundNumber(
                        asset.balance * asset.price,
                        asset.decimals
                      )}`
                      : "$ 0"}
                  </p>
                  <p className="text-xl whitespace-nowrap text-customGray300 -mt-2">
                    {asset
                      ? `${formatAndRoundNumber(
                        asset.balance,
                        asset.decimals
                      )} TKN`
                      : "0 TKN"}
                  </p>
                </div>

                <div className="w-1/2 md:w-[120px]">
                  <p className="leading-6 text-base text-customGray100 md:text-white">
                    Deposits
                  </p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white">
                    {vaultData
                      ? `${!!gauge
                        ? NumberFormatter.format(
                          (gauge.balance * gauge.price) /
                          10 ** gauge.decimals +
                          (vault?.balance! * vault?.price!) /
                          10 ** vault?.decimals!
                        )
                        : formatAndRoundNumber(
                          vault?.balance! * vault?.price!,
                          vault?.decimals!
                        )
                      }`
                      : "0"}
                  </p>
                  <p className="text-xl whitespace-nowrap text-customGray300 -mt-2">
                    {`${!!gauge
                      ? NumberFormatter.format(
                        gauge.balance / 10 ** gauge.decimals +
                        vault?.balance! / 10 ** vault?.decimals!
                      )
                      : formatAndRoundNumber(
                        vault?.balance!,
                        vault?.decimals!
                      )
                      } TKN`}
                  </p>
                </div>

                <div className="w-1/2 md:w-max">
                  <p className="leading-6 text-base text-customGray100 md:text-white">
                    TVL
                  </p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white">
                    ${" "}
                    {vaultData.tvl < 1
                      ? "0"
                      : NumberFormatter.format(vaultData.tvl)}
                  </p>
                  <p className="text-xl whitespace-nowrap text-customGray300 -mt-2">
                    {asset
                      ? `${formatAndRoundNumber(
                        vaultData.totalAssets,
                        asset.decimals
                      )} TKN`
                      : "0 TKN"}
                  </p>
                </div>

                <div className="w-1/2 md:w-max">
                  <p className="w-max leading-6 text-base text-customGray100 md:text-white">
                    vAPY
                  </p>
                  <p className="text-3xl font-bold whitespace-nowrap text-white">
                    {`${NumberFormatter.format(
                      roundToTwoDecimalPlaces(vaultData.apy)
                    )} %`}
                  </p>
                </div>
                {vaultData.minGaugeApy ? (
                  <div className="w-1/2 md:w-max">
                    <p className="w-max leading-6 text-base text-customGray100 md:text-white">
                      Min Rewards
                    </p>
                    <p className="text-3xl font-bold whitespace-nowrap text-white">
                      {`${NumberFormatter.format(
                        roundToTwoDecimalPlaces(vaultData.minGaugeApy)
                      )} %`}
                    </p>
                  </div>
                ) : (
                  <></>
                )}
                {vaultData.maxGaugeApy ? (
                  <div className="w-1/2 md:w-max">
                    <p className="w-max leading-6 text-base text-customGray100 md:text-white">
                      Max Rewards
                    </p>
                    <p className="text-3xl font-bold whitespace-nowrap text-white">
                      {`${NumberFormatter.format(
                        roundToTwoDecimalPlaces(vaultData.maxGaugeApy)
                      )} %`}
                    </p>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </section>

          <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8 text-white">
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
          </section>

          <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8 text-white">
            <h2 className="text-white font-bold text-2xl">Vault Settings</h2>
            {account === vaultData.metadata.creator ? (
              <>
                <TabSelector
                  className="mt-6 mb-12"
                  availableTabs={availableTabs}
                  activeTab={tab}
                  setActiveTab={changeTab}
                />
                {settings && callAddress ? (
                  <div>
                    {tab === "Rebalance" && (
                      <VaultRebalance
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Strategy" && (
                      <>
                        {vaultData.strategies.length > 1 ? (
                          <VaultStrategiesConfiguration
                            vaultData={vaultData}
                            settings={settings}
                            callAddress={callAddress}
                          />
                        ) : (
                          <VaultStrategyConfiguration
                            vaultData={vaultData}
                            settings={settings}
                            callAddress={callAddress}
                          />
                        )}
                      </>
                    )}
                    {tab === "Fee Configuration" && (
                      <VaultFeeConfiguration
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Fee Recipient" && (
                      <VaultFeeRecipient
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Deposit Limit" && (
                      <VaultDepositLimit
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Take Fees" && (
                      <VaultTakeFees
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                    {tab === "Pausing" && (
                      <VaultPausing
                        vaultData={vaultData}
                        settings={settings}
                        callAddress={callAddress}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-white">Loading...</p>
                )}
              </>
            ) : (
              <p className="text-white">
                Only the Vault Creator ({vaultData.metadata.creator}) has access
                to this page.
              </p>
            )}
          </section>

          {vaultData.gauge && (
            <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8 text-white">
              <h2 className="text-white font-bold text-2xl">
                Manage Gauge Rewards
              </h2>
              <RewardsSection gauge={vaultData.gauge} chainId={vaultData.chainId} />
            </section>
          )}
        </div>
      ) : (
        <p className="text-white">Loading...</p>
      )}
    </NoSSR>
  );
}

function RewardsSection({ gauge, chainId }: { gauge: Address; chainId: number }) {
  const { address: account } = useAccount();

  const [tokens] = useAtom(tokensAtom);

  const [rewardData, setRewardData] = useState<any[]>([])

  useEffect(() => {
    getRewardData(gauge, chainId).then(res => setRewardData(res))
  }, [gauge])

  // const { write } = useContractWrite({
  //   abi: GaugeAbi,
  //   address: gauge,
  //   functionName: "claim_rewards",
  // });


  // function handleClaimRewards() {
  //   if (!address) return openAccountModal();
  //   write({
  //     args: [address, zeroAddress],
  //   });
  // }

  return (
    <Fragment>
      <table className="mb-8 [&_th]:px-6 [&_th]:h-12 [&_td]:px-6 [&_td]:h-12">
        <tr className="border-b">
          <th className="font-normal text-left !pl-0">Token</th>
          <th className="font-normal text-left">Rate</th>
          <th className="font-normal text-left">Remaining Rewards</th>
          <th className="font-normal text-left">Period Finish</th>
          <th className="font-normal text-left hidden lg:table-cell">
            Distributor
          </th>
          <th className="font-normal text-left hidden lg:table-cell">
            Fund Rewards
          </th>
        </tr>
        {rewardData.length > 0 ?
          rewardData?.map(reward =>
            <RewardColumn
              key={`reward-gauge-${reward.address}`}
              gauge={gauge}
              reward={reward}
              token={tokens[chainId][reward.address]}
              chainId={chainId}
            />
          )
          : <p>No rewards</p>
        }
      </table>
    </Fragment>
  );
}


function RewardColumn({ gauge, reward, token, chainId }: { gauge: Address, reward: any, token: Token, chainId: number }): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
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

  async function handleFundReward() {
    console.log("handle")
    let val = Number(amount)
    console.log({ val, account, publicClient: !!publicClient, walletClient: !!walletClient })
    if (val === 0 || !account || !publicClient || !walletClient) return
    console.log("blub", chain?.id, chainId)
    val = val * (10 ** token.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchNetworkAsync?.(Number(chainId));
      } catch (error) {
        return;
      }
    }

    const clients = {
      publicClient,
      walletClient
    }

    console.log(val, token, gauge)

    const success = await handleAllowance({
      token: token.address,
      spender: gauge,
      amount: val,
      account: account,
      clients
    })



    if (success) {
      await fundReward({
        gauge,
        rewardToken: token.address,
        amount: val,
        account,
        clients,
        tokensAtom: [tokens, setTokens]
      })
    }
  }

  console.log({ reward })

  return (
    <tr>
      <td className="!pl-0">
        <nav className="flex items-center gap-2">
          <TokenIcon
            imageSize="w-9 h-9 border border-customNeutral100 rounded-full"
            token={token}
            icon={token.logoURI}
            chainId={chainId}
          />
          <strong>${token?.symbol ?? "TKN"}</strong>
        </nav>
      </td>
      <td className="text-left">{reward.rate}</td>
      <td className="text-left">{reward.remainingRewards}</td>
      <td className="text-left">
        {reward.periodFinish.toLocaleDateString()}
      </td>
      <td className="text-left hidden lg:table-cell">
        {reward.distributor}
      </td>
      <td className="text-left hidden lg:table-cell">
        <div className="flex flex-row">
          <div>
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
          </div>
          <div className="w-40 h-14">
            <MainActionButton label="Fund Rewards" handleClick={handleFundReward} disabled={!account || account !== reward.distributor} />
          </div>
        </div>
      </td>
    </tr>
  )
}
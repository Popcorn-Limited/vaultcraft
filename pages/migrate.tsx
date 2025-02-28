import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import SpinningLogo from "@/components/common/SpinningLogo";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { tokensAtom } from "@/lib/atoms";
import { ERC20Abi, OptionTokenAbi, OptionTokenByChain, TokenMigrationAbi, TokenMigrationByChain, VcxByChain } from "@/lib/constants";
import { formatBalance, handleMaxClick, simulateCall } from "@/lib/utils/helpers";
import { showLoadingToast } from "@/lib/toasts";
import { Clients } from "@/lib/types";
import { handleCallResult } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { Address, parseUnits, createPublicClient, http, zeroAddress } from "viem";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { handleAllowance } from "@/lib/approve";
import { ChainById, GAUGE_NETWORKS, RPC_URLS } from "@/lib/utils/connectors";
import Highcharts from "highcharts";

export async function migrate({
  token, amount, account, chainId, clients
}: {
  token: Address,
  amount: number,
  account: Address,
  chainId: number,
  clients: Clients
}): Promise<boolean> {
  showLoadingToast("Migrating tokens...");

  return handleCallResult({
    successMessage: "Tokens migrated successfully!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: TokenMigrationByChain[chainId],
        abi: TokenMigrationAbi,
      },
      functionName: "migrate",
      publicClient: clients.publicClient,
      args: [token, BigInt(amount.toLocaleString("fullwide", { useGrouping: false }))],
    }),
    clients,
  });
}


export type MigrationData = {
  vcx: bigint;
  ovcx: bigint;
}

export type MigrationDataByChain = {
  [key: number]: MigrationData;
}

const DEFAULT_MIGRATION_DATA: MigrationDataByChain = {
  [mainnet.id]: { vcx: BigInt(0), ovcx: BigInt(0) },
  [arbitrum.id]: { vcx: BigInt(0), ovcx: BigInt(0) },
  [optimism.id]: { vcx: BigInt(0), ovcx: BigInt(0) },
}

export default function Migrate() {
  const [tokens] = useAtom(tokensAtom);
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [chainId, setChainId] = useState<number>(mainnet.id);
  const [selectedTab, setSelectedTab] = useState<string>("VCX");
  const [amount, setAmount] = useState<string>("0");

  const globalStatsElem = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (globalStatsElem.current) {
      getMigrationData(globalStatsElem.current);
    }
  }, [globalStatsElem])

  async function getMigrationData(elem: HTMLDivElement) {
    const _migrationData: MigrationDataByChain = {};

    for (const chainId of GAUGE_NETWORKS) {
      const client = createPublicClient({
        chain: ChainById[chainId],
        transport: http(RPC_URLS[chainId])
      })

      const globalData = await client.multicall({
        contracts: [
          {
            address: VcxByChain[chainId],
            abi: ERC20Abi,
            functionName: "balanceOf",
            args: [TokenMigrationByChain[chainId]]
          },
          {
            address: OptionTokenByChain[chainId],
            abi: OptionTokenAbi,
            functionName: "balanceOf",
            args: [TokenMigrationByChain[chainId]]
          }
        ]
      })

      _migrationData[chainId] = {
        vcx: globalData[0].result!,
        ovcx: globalData[1].result!
      }
    }

    Highcharts.chart(elem, {
      chart: {
        type: 'column',
        backgroundColor: "transparent",
      },
      title: {
        text: ''
      },
      legend: {
        itemStyle: {
          color: "#fff",
        },
      },
      xAxis: {
        categories: ["VCX", "oVCX"],
        crosshair: true,
        accessibility: {
          description: 'Tokens'
        },
        labels: {
          style: {
            color: "#fff",
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        },
        labels: {
          style: {
            color: "#fff",
          },
        },
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: [
        {
          name: 'Mainnet',
          data: [
            Number(formatBalance(_migrationData[mainnet.id].vcx, 18, 2)),
            Number(formatBalance(_migrationData[mainnet.id].ovcx, 18, 2))
          ],
          type: 'column'
        },
        {
          name: 'Arbitrum',
          data: [
            Number(formatBalance(_migrationData[arbitrum.id].vcx, 18, 2)),
            Number(formatBalance(_migrationData[arbitrum.id].ovcx, 18, 2))
          ],
          type: 'column'
        },
        {
          name: 'Optimism',
          data: [
            Number(formatBalance(_migrationData[optimism.id].vcx, 18, 2)),
            Number(formatBalance(_migrationData[optimism.id].ovcx, 18, 2))
          ],
          type: 'column'
        }
      ]
    })
  }

  async function handleMigrate() {
    if (!account || !walletClient || !publicClient) return;

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    migrate({
      token: selectedTab === "VCX" ? VcxByChain[chainId] : OptionTokenByChain[chainId],
      amount: Number(amount) * 1e18,
      account: account,
      chainId: chainId,
      clients: {
        publicClient,
        walletClient
      }
    })
  }

  async function handleApprove() {
    if (!account || !walletClient || !publicClient) return;

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    handleAllowance({
      token: selectedTab === "VCX" ? VcxByChain[chainId] : OptionTokenByChain[chainId],
      spender: TokenMigrationByChain[chainId],
      amount: parseUnits(amount, 18),
      account: account,
      clients: {
        publicClient,
        walletClient
      }
    })
  }

  function handleChangeInput(e: any) {
    let value = e.currentTarget.value;

    const [integers, decimals] = String(value).split('.');
    let inputAmt = value;

    // if precision is more than token decimal, cut it
    if (decimals?.length > 18) {
      inputAmt = `${integers}.${decimals.slice(0, 18)}`;
    }

    setAmount(inputAmt)
  }

  return (
    <>
      <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-top justify-between py-4 md:py-10 px-4 md:px-0 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
            Token Migration
          </h1>
          <p className="text-customGray100 md:text-white md:opacity-80">
            Migrate your tokens to VCRAFT.
          </p>
        </div>
      </section>

      <section className="mt-8 space-y-8 px-4 md:px-0">
        <div
          className={`w-full h-[20rem] flex justify-center`}
          ref={globalStatsElem}
        />
        {Object.keys(tokens).length > 0 ?
          <>
            <TabSelector
              availableTabs={["VCX", "oVCX"]}
              activeTab={selectedTab}
              setActiveTab={setSelectedTab}
            />
            <div className="">
              <InputTokenWithError
                onMaxClick={() => handleMaxClick(tokens[chainId][selectedTab === "VCX" ? VcxByChain[chainId] : OptionTokenByChain[chainId]], setAmount)}
                value={amount}
                onChange={handleChangeInput}
                onSelectToken={() => { }}
                tokenList={[tokens[chainId][selectedTab === "VCX" ? VcxByChain[chainId] : OptionTokenByChain[chainId]]]}
                selectedToken={tokens[chainId][selectedTab === "VCX" ? VcxByChain[chainId] : OptionTokenByChain[chainId]]}
                chainId={chainId}
                allowInput
              />
              <div className="flex flex-row gap-4 mt-2">
                <SecondaryActionButton
                  handleClick={handleApprove}
                  label={`Approve ${selectedTab === "VCX" ? "VCX" : "oVCX"} Migration`}
                />
                <MainActionButton
                  handleClick={handleMigrate}
                  label={`Migrate ${selectedTab === "VCX" ? "VCX" : "oVCX"}`}
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 mt-8 border-t border-customNeutral100 pt-8 px-4 md:px-0">
              <SecondaryActionButton
                handleClick={() => setChainId(mainnet.id)}
                disabled={chainId === mainnet.id}
                label="Migrate on Ethereum"
              />
              <SecondaryActionButton
                handleClick={() => setChainId(optimism.id)}
                disabled={chainId === optimism.id}
                label="Migrate on OP"
              />
              <SecondaryActionButton
                handleClick={() => setChainId(arbitrum.id)}
                disabled={chainId === arbitrum.id}
                label="Migrate on Arbitrum"
              />
            </div>
          </>
          : <SpinningLogo />
        }
      </section>
    </>
  )
}


function MigrationTable({ title, migrationData }: { title: string, migrationData: MigrationDataByChain }) {
  return (
    <div className="shadow-lg rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Chain</th>
            <th className="border border-gray-300 p-2">VCX</th>
            <th className="border border-gray-300 p-2">oVCX</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(migrationData).map((chainId) => (
            <tr key={chainId} className="text-center border border-gray-300">
              <td className="border border-gray-300 p-2">
                {ChainById[Number(chainId)].name}
              </td>
              <td className="border border-gray-300 p-2">
                {formatBalance(migrationData[Number(chainId)].vcx, 18, 2)}
              </td>
              <td className="border border-gray-300 p-2">
                {formatBalance(migrationData[Number(chainId)].ovcx, 18, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
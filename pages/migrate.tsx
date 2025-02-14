import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import SpinningLogo from "@/components/common/SpinningLogo";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { tokensAtom } from "@/lib/atoms";
import { ERC20Abi, OptionTokenAbi, OptionTokenByChain, TokenMigrationAbi, TokenMigrationByChain, VcxByChain } from "@/lib/constants";
import { handleMaxClick, simulateCall } from "@/lib/utils/helpers";
import { showLoadingToast } from "@/lib/toasts";
import { Clients } from "@/lib/types";
import { handleCallResult } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, parseUnits, createPublicClient, http } from "viem";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { handleAllowance } from "@/lib/approve";

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
  vcx: number;
  ovcx: number;
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
  const [migrationData, setMigrationData] = useState<MigrationData[]>();
  const [userMigrationData, setUserMigrationData] = useState<MigrationData[]>();

  useEffect(() => {
    const getData = async () => await getMigrationData();
    getData();
  }, [account])


  async function getMigrationData() {
    const chainConfigs = [
      { chain: mainnet, id: 1 },
      { chain: arbitrum, id: 42161 },
      { chain: optimism, id: 10 }
    ];

    const clients = chainConfigs.map(({ chain, id }) =>
      createPublicClient({
        chain,
        transport: http(),
      })
    );

    const multicalls = clients.map((client, index) =>
      client.multicall({
        contracts: [
          {
            address: VcxByChain[chainConfigs[index].id],
            abi: ERC20Abi,
            functionName: "balanceOf",
            args: [TokenMigrationByChain[chainConfigs[index].id]]
          },
          {
            address: OptionTokenByChain[chainConfigs[index].id],
            abi: OptionTokenAbi,
            functionName: "balanceOf",
            args: [TokenMigrationByChain[chainConfigs[index].id]]
          }
        ]
      })
    );

    var migData: MigrationData[];
    Promise.all(multicalls)
      .then((results) => {
        migData = results.map((chainResult) => {
          return { vcx: Number(chainResult[0].result!), ovcx: Number(chainResult[1].result!) }
        });

        console.log("MIG DATA", migData);

        setMigrationData(migData);
      })
      .catch((error) => console.error("Multicall Error:", error));

    if (account) {
      const multicalls = clients.map((client, index) =>
        client.multicall({
          contracts: [
            {
              address: TokenMigrationByChain[chainConfigs[index].id],
              abi: TokenMigrationAbi,
              functionName: "burnedBalance",
              args: [account, VcxByChain[chainConfigs[index].id]]
            },
            {
              address: TokenMigrationByChain[chainConfigs[index].id],
              abi: TokenMigrationAbi,
              functionName: "burnedBalance",
              args: [account, OptionTokenByChain[chainConfigs[index].id]]
            }
          ]
        })
      );

      var userMigData: MigrationData[];
      Promise.all(multicalls)
        .then((results) => {
          userMigData = results.map((chainResult) => {
            return { vcx: Number(chainResult[0].result!), ovcx: Number(chainResult[1].result!) }
          });

          setUserMigrationData(userMigData);
        })
        .catch((error) => console.error("Multicall Error:", error));
    }
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

  const MigrationTable = ({ title, migrationData }: { title: string, migrationData: MigrationData[] }) => (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Chain</th>
            <th className="border border-gray-300 p-2">VCX</th>
            <th className="border border-gray-300 p-2">OVCX</th>
          </tr>
        </thead>
        <tbody>
          {migrationData.map((data, index) => (
            <tr key={index} className="text-center border border-gray-300">
              <td className="border border-gray-300 p-2">{index === 0 ? "Ethereum" : index === 1 ? "Arbitrum" : "Optimism"}</td>
              <td className="border border-gray-300 p-2">{data.vcx / 1e18}</td>
              <td className="border border-gray-300 p-2">{data.ovcx / 1e18}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return Object.keys(tokens).length > 0 ? (
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
      </section>
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
      <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-top justify-between py-4 md:py-10 px-4 md:px-0 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none margin-top:50px">
            Migrated so far..
          </h1>
        </div>
      </section>

      <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-top justify-between py-4 md:py-10 px-4 md:px-0 md:gap-4">
        <div className="flex flex-wrap justify-center gap-20 mt-10 w-full md:w-max">
          <MigrationTable title="Global Migration Status" migrationData={migrationData!} />
          {account && userMigrationData !== undefined && (
            <MigrationTable title="User Status" migrationData={userMigrationData!} />
          )}
          <SecondaryActionButton
            handleClick={() => getMigrationData()}
            label="Refresh"
          />
        </div>

      </section>
    </>
  )
    : <SpinningLogo />
}
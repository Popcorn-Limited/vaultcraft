import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import SpinningLogo from "@/components/common/SpinningLogo";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { tokensAtom } from "@/lib/atoms";
import { OptionTokenByChain, TokenMigrationAbi, TokenMigrationByChain, VCX, VcxByChain } from "@/lib/constants";
import { handleMaxClick, simulateCall } from "@/lib/utils/helpers";
import { showLoadingToast } from "@/lib/toasts";
import { Clients } from "@/lib/types";
import { handleCallResult } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useState } from "react";
import { Address, parseUnits } from "viem";
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


export default function Migrate() {
  const [tokens] = useAtom(tokensAtom);
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [chainId, setChainId] = useState<number>(mainnet.id);
  const [selectedTab, setSelectedTab] = useState<string>("VCX");
  const [amount, setAmount] = useState<string>("0");

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

  console.log(amount)

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
    </>
  )
    : <SpinningLogo />
}
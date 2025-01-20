import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import SpinningLogo from "@/components/common/SpinningLogo";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { tokensAtom } from "@/lib/atoms";
import { OptionTokenByChain, VCX, VcxByChain } from "@/lib/constants";
import { Token } from "@/lib/types";
import { useAtom } from "jotai";
import { useState } from "react";
import { arbitrum, mainnet, optimism } from "viem/chains";


export default function Migrate() {
  const [tokens] = useAtom(tokensAtom);
  const [chainId, setChainId] = useState<number>(mainnet.id);
  const [selectedTab, setSelectedTab] = useState<string>("VCX");

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

      <section className="mt-8 space-y-8">
        <TabSelector
          availableTabs={["VCX", "oVCX"]}
          activeTab={selectedTab}
          setActiveTab={setSelectedTab}
        />
        <div className="">
          <InputTokenWithError
            onMaxClick={() => { }}
            onSelectToken={() => { }}
            tokenList={[tokens[chainId][selectedTab === "VCX" ? VcxByChain[chainId] : OptionTokenByChain[chainId]]]}
            selectedToken={tokens[chainId][selectedTab === "VCX" ? VcxByChain[chainId] : OptionTokenByChain[chainId]]}
            chainId={chainId}
            allowInput
          />
          <div className="flex flex-row gap-4 mt-2">
            <SecondaryActionButton
              handleClick={() => { }}
              label="Approve VCX Migration"
            />
            <MainActionButton
              handleClick={() => { }}
              label="Migrate VCX"
            />
          </div>
        </div>
      </section>
      <div className="flex flex-row gap-4 mt-8 border-t border-customNeutral100 pt-8">
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
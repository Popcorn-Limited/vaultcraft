import { Token, Strategy } from "@/lib/types";
import { useEffect, useState } from "react";
import { Address, createPublicClient, erc20Abi, http } from "viem";
import { AnyToAnyDepositorAbi, AssetPushOracleAbi, AssetPushOracleByChain } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import TabSelector from "@/components/common/TabSelector";
import ConvertTokenSection from "./ConvertTokenSection";
import ChangeSettingSection from "./ChangeSettingSetion";
import SpinningLogo from "@/components/common/SpinningLogo";

export interface ProposedChange {
  value: bigint;
  time: bigint;
}

export interface AnyToAnySettings {
  owner: Address;
  keeper: Address;
  assetBal: number;
  yieldTokenBal: number;
  reservedAssets: number;
  reservedYieldTokens: number;
  float: bigint;
  proposedFloat: ProposedChange;
  slippage: bigint;
  proposedSlippage: ProposedChange;
  bqPrice: number;
  qbPrice: number;
  totalAssets: number;
  block: any;
}

export interface PassThroughProps {
  strategy: Strategy;
  asset: Token;
  yieldToken: Token;
  settings: AnyToAnySettings;
  chainId: number;
}

async function getAnyToAnyData(address: Address, asset: Token, yieldToken: Token, chainId: number): Promise<AnyToAnySettings> {
  const client = createPublicClient({
    chain: ChainById[chainId],
    transport: http(RPC_URLS[chainId]),
  });

  const vaultRes = await client.multicall({
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
        address: yieldToken.address,
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
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "totalReservedyieldTokens",
      },
      {
        address,
        abi: AnyToAnyDepositorAbi,
        functionName: "totalReservedYieldTokens",
      },
      {
        address: AssetPushOracleByChain[chainId],
        abi: AssetPushOracleAbi,
        functionName: "prices",
        args: [yieldToken.address, asset.address]
      },
      {
        address: AssetPushOracleByChain[chainId],
        abi: AssetPushOracleAbi,
        functionName: "prices",
        args: [asset.address, yieldToken.address]
      }
    ],
    allowFailure: true
  })
  const block = await client.getBlock()

  const reservedYieldTokens = Number(vaultRes[9].status === "success" ? vaultRes[9].result : vaultRes[10].status === "success" ? vaultRes[10].result : vaultRes[11].result);
  const assetBal = Number(vaultRes[7].result! - vaultRes[8].result!);
  const yieldTokenBal = Number(vaultRes[6].result!) - reservedYieldTokens
  return {
    owner: vaultRes[0].result!,
    keeper: vaultRes[1].result!,
    assetBal: assetBal,
    yieldTokenBal: yieldTokenBal,
    reservedAssets: Number(vaultRes[2].result!),
    reservedYieldTokens: reservedYieldTokens,
    float: vaultRes[2].result!,
    proposedFloat: { value: vaultRes[3].result![0], time: vaultRes[3].result![1] },
    slippage: vaultRes[4].result!,
    proposedSlippage: { value: vaultRes[5].result![0], time: vaultRes[5].result![1] },
    bqPrice: Number(vaultRes[12].result!),
    qbPrice: Number(vaultRes[13].result!),
    totalAssets: assetBal + ((yieldTokenBal * (Number(vaultRes[12].result) / 1e18)) / (10 ** (yieldToken.decimals - asset.decimals))),
    block
  }
}

const DEFAULT_TABS = ["Convert", "Slippage", "Float"]

export default function AnyToAnyV1DepositorSettings({ strategy, asset, yieldToken, chainId }: { strategy: Strategy, asset: Token, yieldToken: Token, chainId: number }) {
  const [settings, setSettings] = useState<AnyToAnySettings>()
  const [tab, setTab] = useState<string>("Convert")

  useEffect(() => {
    if (strategy.address) getAnyToAnyData(strategy.address, asset, yieldToken, chainId).then(res => setSettings(res))
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
        tab === "Convert" && <ConvertTokenSection strategy={strategy} asset={asset} yieldToken={yieldToken} settings={settings} chainId={chainId} />
      }
      {
        tab === "Slippage" && <ChangeSettingSection strategy={strategy} asset={asset} yieldToken={yieldToken} settings={settings} chainId={chainId} id={"slippage"} />
      }
      {
        tab === "Float" && <ChangeSettingSection strategy={strategy} asset={asset} yieldToken={yieldToken} settings={settings} chainId={chainId} id={"float"} />
      }
    </section>
  )
    : <SpinningLogo />
}
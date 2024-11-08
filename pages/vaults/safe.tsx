import { vaultsAtom } from "@/lib/atoms/vaults";
import { Balance, SmartVaultActionType, Token, TokenType, VaultData, VaultLabel, ZapProvider } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import VaultInputs, { VaultInputsProps } from "@/components/vault/VaultInputs";
import { showLoadingToast, showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { ArrowDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { tokensAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import { OracleVaultAbi, VeTokenByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import StrategyDescription from "@/components/vault/StrategyDescription";
import ApyChart from "@/components/vault/ApyChart";
import VaultHero from "@/components/vault/VaultHero";
import { http, createPublicClient, isAddress, zeroAddress, Address, parseUnits, maxUint256, formatUnits, erc20Abi } from "viem";
import UserBoostSection from "@/components/vault/UserBoostSection";
import HtmlRenderer from "@/components/common/HtmlRenderer";
import SpinningLogo from "@/components/common/SpinningLogo";
import { EMPTY_LLAMA_APY_ENTRY } from "@/lib/resolver/apy";
import { arbitrum } from "viem/chains";
import { RPC_URLS } from "@/lib/utils/connectors";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { calcBalance, EMPTY_BALANCE, formatBalance, handleCallResult, handleMaxClick, NumberFormatter, simulateCall } from "@/lib/utils/helpers";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import getVaultErrorMessage from "@/lib/vault/errorMessage";
import TokenIcon from "@/components/common/TokenIcon";
import SecondaryButtonGroup from "@/components/common/SecondaryButtonGroup";
import SelectToken from "@/components/input/SelectToken";
import { setupDevBundler } from "next/dist/server/lib/router-utils/setup-dev-bundler";
import { handleAllowance } from "@/lib/approve";


const VAULT: Token = {
  address: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  name: "Vault",
  symbol: "oVault",
  decimals: 6,
  logoURI: "",
  balance: { value: BigInt(0), formatted: "0", formattedUSD: "0" },
  price: 1,
  totalSupply: BigInt(0),
  chainId: 42161,
  type: TokenType.Vault,
}

const SAFE_VAULT: VaultData = {
  address: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  vault: "0x39e6ACC140395862aaaC5FdA063Bb2D11fAeF137",
  asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  gauge: zeroAddress,
  chainId: 42161,
  fees: {
    deposit: BigInt(0),
    withdrawal: BigInt(0),
    management: BigInt(0),
    performance: BigInt(0)
  },
  totalAssets: BigInt(0),
  totalSupply: BigInt(0),
  assetsPerShare: 0,
  depositLimit: maxUint256,
  withdrawalLimit: maxUint256,
  minLimit: BigInt(0),
  tvl: 0,
  apyData: {
    targetApy: 0,
    baseApy: 0,
    rewardApy: 0,
    totalApy: 0,
    apyHist: [],
    apyId: "",
    apySource: undefined
  },
  gaugeData: undefined,
  metadata: {
    vaultName: "Test Safe Vault",
    labels: [VaultLabel.experimental],
    description: "",
    type: "multi-strategy-vault-v2",
    creator: "0x2C3B135cd7dc6C673b358BEF214843DAb3464278",
    feeRecipient: "0x47fd36ABcEeb9954ae9eA1581295Ce9A8308655E"
  },
  strategies: [
    {
      address: "0x3C99dEa58119DE3962253aea656e61E5fBE21613",
      asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      yieldToken: undefined,
      metadata: {
        name: "Safe",
        protocol: "Safe",
        description: "Experimental Gnosis Safe Vault",
        type: "Vanilla"
      },
      resolver: "",
      allocation: BigInt(0),
      allocationPerc: 0,
      apyData: {
        targetApy: 0,
        baseApy: 0,
        rewardApy: 0,
        totalApy: 0,
        apyHist: [EMPTY_LLAMA_APY_ENTRY],
        apyId: "",
        apySource: "custom"
      },
      totalAssets: BigInt(0),
      totalSupply: BigInt(0),
      assetsPerShare: 0,
      idle: BigInt(0),
    }
  ],
  idle: BigInt(0),
  liquid: BigInt(0),
  points: []
}

async function fetchData(user: Address) {
  const client = createPublicClient({
    chain: arbitrum,
    transport: http(RPC_URLS[42161])
  })

  const vault = await client.multicall({
    contracts: [
      {
        address: SAFE_VAULT.address,
        abi: OracleVaultAbi,
        functionName: "totalAssets"
      },
      {
        address: SAFE_VAULT.address,
        abi: OracleVaultAbi,
        functionName: "totalSupply"
      },
      {
        address: SAFE_VAULT.address,
        abi: OracleVaultAbi,
        functionName: "balanceOf",
        args: [user]
      },
      {
        address: VAULT.address,
        abi: OracleVaultAbi,
        functionName: "getRequestBalance",
        args: [user]
      },
      {
        address: SAFE_VAULT.asset,
        abi: erc20Abi,
        functionName: "allowance",
        args: [user, VAULT.address]
      },
      {
        address: SAFE_VAULT.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [user, VAULT.address]
      }
    ]
  })

  return {
    totalAssets: vault[0].result as bigint,
    totalSupply: vault[1].result as bigint,
    assetsPerShare: Number(vault[1].result) / Number(vault[0].result),
    balance: vault[2].result as bigint,
    requestBalance: vault[3].result as RequestBalance,
    assetAllowance: vault[4].result as bigint,
    vaultAllowance: vault[5].result as bigint
  }
}


interface RequestBalance {
  pendingShares: bigint;
  requestTime: bigint;
  claimableShares: bigint;
  claimableAssets: bigint;
}

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const { address: account } = useAccount()
  const chainId = 42161

  const [tokens] = useAtom(tokensAtom)
  const [vaultData, setVaultData] = useState<VaultData>();

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();
  const [requestBalance, setRequestBalance] = useState<RequestBalance>();
  const [assetAllowance, setAssetAllowance] = useState<bigint>(BigInt(0));
  const [vaultAllowance, setVaultAllowance] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (Object.keys(tokens).length > 0) setUp()
  }, [account]);

  async function setUp() {
    const data = await fetchData(account ? account : zeroAddress)

    setAsset(tokens[chainId][SAFE_VAULT.asset])
    setVault({ ...VAULT, balance: calcBalance(data.balance, VAULT.decimals, VAULT.price) })
    setVaultData({
      ...SAFE_VAULT,
      totalAssets: data.totalAssets,
      totalSupply: data.totalSupply,
      assetsPerShare: data.assetsPerShare,
      tvl: Number(formatBalance(data.totalAssets, VAULT.decimals)),
      strategies: [{
        ...SAFE_VAULT.strategies[0],
        allocation: data.totalAssets,
        allocationPerc: 1
      }]
    })
    setTokenOptions([
      tokens[chainId][SAFE_VAULT.asset],
      { ...VAULT, balance: calcBalance(data.balance, VAULT.decimals, VAULT.price) },
      ...ZapAssetAddressesByChain[chainId].filter(addr => SAFE_VAULT.asset !== addr).map(addr => tokens[chainId][addr])
    ])
    setRequestBalance(data.requestBalance)
    setAssetAllowance(data.assetAllowance)
    setVaultAllowance(data.vaultAllowance)
  }

  console.log(vaultData, asset, vault, tokenOptions, requestBalance)

  return <NoSSR>
    {
      (vaultData && asset && vault && tokenOptions.length > 0) ? (
        <>
          <div className="min-h-screen">
            <button
              className="border border-customGray500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-0 mt-10"
              type="button"
              onClick={() => router.push((!!query?.ref && isAddress(query.ref as string)) ? `/vaults?ref=${query.ref}` : "/vaults")}
            >
              <div className="w-5 h-5">
                <LeftArrowIcon color="#FFF" />
              </div>
              <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
            </button>

            <VaultHero
              vaultData={vaultData}
              asset={asset}
              vault={vault}
              gauge={gauge}
              showClaim
            />

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-0">
              <div className="w-full md:w-1/3">
                
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">
                {gauge && gauge?.balance.value > BigInt(0) && Object.keys(tokens).length > 0 && (vaultData.gaugeData?.lowerAPR || 0) > 0 &&
                  <UserBoostSection vaultData={vaultData} gauge={gauge} veToken={tokens[vaultData.chainId][VeTokenByChain[vaultData.chainId]]} />
                }

                {vaultData.apyData.apyHist.length > 0 && <ApyChart vault={vaultData} />}

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Information</p>
                  <div className="text-white">
                    {vaultData.metadata.description && vaultData.metadata.description.length > 0 && <HtmlRenderer htmlContent={vaultData.metadata.description} />}
                  </div>
                  <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4">

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Vault address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
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
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.asset} onCopy={() => showSuccessToast("Asset address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    {vaultData.gauge && vaultData.gauge !== zeroAddress &&
                      <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                        <p className="text-white font-normal">Gauge address:</p>
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-bold text-white">
                            {vaultData.gauge.slice(0, 6)}...{vaultData.gauge.slice(-4)}
                          </p>
                          <div className='w-6 h-6 group/gaugeAddress'>
                            <CopyToClipboard text={vaultData.gauge} onCopy={() => showSuccessToast("Gauge address copied!")}>
                              <Square2StackIcon className="text-white group-hover/gaugeAddress:text-primaryYellow" />
                            </CopyToClipboard>
                          </div>
                        </div>
                      </div>
                    }

                  </div>
                </div>

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Strategies</p>
                  {vaultData.strategies.map((strategy, i) =>
                    <StrategyDescription
                      key={`${strategy.resolver}-${i}`}
                      strategy={strategy}
                      asset={asset}
                      chainId={vaultData.chainId}
                      i={i}
                      stratLen={vaultData.strategies.length}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      )
        : <SpinningLogo />
    }
  </NoSSR >
}
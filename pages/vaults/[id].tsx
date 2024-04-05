import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { erc20ABI, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { Address, WalletClient, createPublicClient, http, zeroAddress } from "viem";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { NumberFormatter, formatAndRoundNumber, formatNumber } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import { claimOPop } from "@/lib/optionToken/interactions";
import VaultInputs from "@/components/vault/VaultInputs";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { ArrowDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { gaugeRewardsAtom, tokensAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ManageLoanInterface from "@/components/lending/ManageLoanInterface";
import { MinterByChain, OptionTokenByChain, VCX, VE_VCX, VeTokenByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import TabSelector from "@/components/common/TabSelector";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import Slider from "rc-slider";
import Modal from "@/components/modal/Modal";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import CardStat from "@/components/common/CardStat";
import ProtocolIcon, { IconByProtocol } from "@/components/common/ProtocolIcon";

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const [tokens, setTokens] = useAtom(tokensAtom)
  const [vaults] = useAtom(vaultsAtom);
  const [vaultData, setVaultData] = useState<VaultData>();

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();

  useEffect(() => {
    if (!vaultData && query && yieldOptions && Object.keys(vaults).length > 0) {
      const chainId = Number(query?.chainId)
      const foundVault = vaults[chainId].find(vault => vault.address === query?.id)
      if (foundVault) {
        const newTokenOptions = [
          tokens[chainId][foundVault.asset],
          tokens[chainId][foundVault.vault],
          ...ZapAssetAddressesByChain[chainId].filter(addr => foundVault.asset !== addr).map(addr => tokens[chainId][addr])
        ]

        setAsset(tokens[chainId][foundVault.asset])
        setVault(tokens[chainId][foundVault.vault])

        if (foundVault.gauge) {
          setGauge(tokens[chainId][foundVault.gauge])
          newTokenOptions.push(tokens[chainId][foundVault.gauge])
        }
        setTokenOptions(newTokenOptions)
        setVaultData(foundVault)
      }
    }
  }, [vaults, query, vaultData]);

  const [oBal, setOBal] = useState<number>(0)

  useEffect(() => {
    async function getOToken() {
      const client = createPublicClient({
        chain: ChainById[vaultData?.chainId!],
        transport: http(RPC_URLS[vaultData?.chainId!]),
      })
      const newOBal = client.readContract({
        address: OptionTokenByChain[vaultData?.chainId!],
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [account!]
      })
      setOBal(Number(newOBal) / 1e18)
    }
    if (account && vaultData) getOToken()
  }, [account])

  const [gaugeRewards, setGaugeRewards] = useAtom(gaugeRewardsAtom);

  const [showLendModal, setShowLendModal] = useState(false)

  async function handleClaim() {
    if (!vaultData || !account) return

    if (chain?.id !== vaultData?.chainId) {
      try {
        await switchNetworkAsync?.(vaultData?.chainId);
      } catch (error) {
        return;
      }
    }

    const success = await claimOPop({
      gauges: [vaultData.gauge || zeroAddress],
      account: account as Address,
      minter: MinterByChain[vaultData?.chainId],
      clients: { publicClient, walletClient: walletClient as WalletClient }
    })

    if (success) {
      await mutateTokenBalance({
        tokensToUpdate: [OptionTokenByChain[vaultData?.chainId]],
        account,
        tokensAtom: [tokens, setTokens],
        chainId: vaultData?.chainId
      })
      setGaugeRewards({
        ...gaugeRewards,
        [vaultData?.chainId]: await getGaugeRewards({
          gauges: vaults[vaultData?.chainId].filter(vault => !!vault.gauge).map(vault => vault.gauge) as Address[],
          account: account,
          chainId: vaultData?.chainId,
          publicClient
        })
      })
    }
  }

  return <NoSSR>
    {
      (vaultData && tokenOptions.length > 0) ? (
        <>
          {/* <Modal visibility={[true, () => { }]}>
            <div className="bg-customNeutral200 p-6 rounded-lg">
              <p className="text-white text-2xl font-bold mb-4">Loan Deposit</p>
              <TabSelector
                className="mb-6"
                availableTabs={["Deposit", "Withdraw"]}
                activeTab={"Deposit"}
                setActiveTab={() => { }}
              />
              <InputTokenWithError
                captionText={"Deposit Amount"}
                onSelectToken={(option) => { }}
                onMaxClick={() => { }}
                chainId={1}
                value={1000}
                onChange={() => { }}
                selectedToken={asset}
                errorMessage={""}
                tokenList={tokenOptions.filter((token) =>
                  gauge?.address
                    ? token.address !== gauge?.address
                    : token.address !== vault?.address
                )}
                allowSelection={true}
                allowInput
              />
              <p className="text-customGray100">Collateral Value: $ 1000</p>

              <div className="relative py-4">
                <div className="relative flex justify-center">
                  <span className="px-4">
                    <ArrowDownIcon
                      className="h-10 w-10 p-2 text-customGray500 cursor-pointer hover:text-white hover:border-white"
                      aria-hidden="true"
                      onClick={() => { }}
                    />
                  </span>
                </div>
              </div>

              <InputTokenWithError
                captionText={"Borrow Amount"}
                onSelectToken={(option) => { }}
                onMaxClick={() => { }}
                chainId={1}
                value={100}
                onChange={() => { }}
                selectedToken={asset}
                errorMessage={""}
                tokenList={[]}
                allowSelection={false}
                allowInput={false}
              />
              <p className="text-customGray100">Borrow Value: $ 100</p>
              <div className="w-full">
                <p className="text-white font-normal text-sm">Loan Percentage: {(1000 || 0) / 100} %</p>
                <div className="flex flex-row items-center justify-between">
                  <div className="w-full mt-4 ml-4">
                    <Slider
                      railStyle={{
                        backgroundColor: "#FFFFFF",
                        height: 4,
                      }}
                      trackStyle={{
                        backgroundColor: "#FFFFFF",
                        height: 4,
                      }}
                      handleStyle={{
                        height: 22,
                        width: 22,
                        marginLeft: 0,
                        marginTop: -9,
                        borderWidth: 4,
                        opacity: 1,
                        borderColor: "#C391FF",
                        backgroundColor: "#fff",
                        zIndex: 0,
                      }}
                      value={1000}
                      onChange={() => { }}
                      max={10000}
                    />
                  </div>
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-customGray500" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-customNeutral200 px-4">
                    <ArrowDownIcon
                      className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                      aria-hidden="true"
                      onClick={() => { }}
                    />
                  </span>
                </div>
              </div>

              <InputTokenWithError
                captionText={"Output Amount"}
                onSelectToken={(option) => { }}
                onMaxClick={() => { }}
                chainId={1}
                value={20}
                onChange={() => { }}
                selectedToken={gauge}
                errorMessage={""}
                tokenList={[]}
                allowSelection={false}
                allowInput={false}
              />
              <div className="mt-6">
                <p className="text-white font-bold mb-2 text-start">Action Breakdown</p>
                <div className="bg-customNeutral200 py-2 px-4 rounded-lg space-y-2">
                  <span className="flex flex-row items-center justify-between text-white">
                    <p>Net Loan Apy</p>
                    <p>3.2 %</p>
                  </span>
                  <span className="flex flex-row items-center justify-between text-white">
                    <p>Health Factor</p>
                    <p>5.42</p>
                  </span>
                  <span className="flex flex-row items-center justify-between text-white">
                    <p>Lending Net Worth</p>
                    <p>$ 400</p>
                  </span>
                </div>
              </div>
            </div>
          </Modal> */}
          <ManageLoanInterface visibilityState={[showLendModal, setShowLendModal]} vaultData={vaultData} />
          <div className="min-h-screen">
            <button
              className="border border-customGray500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-8 mt-10"
              type="button"
              onClick={() => router.push("/vaults")}
            >
              <div className="w-5 h-5">
                <LeftArrowIcon color="#FFF" />
              </div>
              <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
            </button>
            <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8">

              <div className="w-full mb-8">
                <AssetWithName vault={vaultData} size={3} />
              </div>

              <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
                <div className="flex flex-wrap md:flex-row md:items-center md:pr-10 gap-4 md:gap-10 md:w-fit">

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-customGray100 md:text-white">
                      Your Wallet
                    </p>
                    <div className="text-3xl font-bold whitespace-nowrap text-white">
                      {asset ? `${formatAndRoundNumber(
                        asset.balance,
                        asset.decimals
                      )}` : "0"}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-customGray100 md:text-white">
                      Deposits
                    </p>
                    <div className="text-3xl font-bold whitespace-nowrap text-white">
                      {vaultData ?
                        `${!!gauge ?
                          formatAndRoundNumber(gauge.balance * gauge.price, gauge.decimals)
                          : formatAndRoundNumber(vault?.balance! * vault?.price!, vault?.decimals!)
                        }` : "0"}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-customGray100 md:text-white">TVL</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-white">
                      $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="w-max leading-6 text-base text-customGray100 md:text-white">vAPY</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-white">
                      {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))} %`}
                    </div>
                  </div>
                  {
                    vaultData.minGaugeApy ? (
                      <div className="w-[120px] md:w-max">
                        <p className="w-max leading-6 text-base text-customGray100 md:text-white">Min Rewards</p>
                        <div className="text-3xl font-bold whitespace-nowrap text-white">
                          {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.minGaugeApy))} %`}
                        </div>
                      </div>
                    )
                      : <></>
                  }
                  {
                    vaultData.maxGaugeApy ? (
                      <div className="w-[120px] md:w-max">
                        <p className="w-max leading-6 text-base text-customGray100 md:text-white">Max Rewards</p>
                        <div className="text-3xl font-bold whitespace-nowrap text-white">
                          {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.maxGaugeApy))} %`}
                        </div>
                      </div>
                    )
                      : <></>
                  }
                </div>

                <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
                  <div className="flex gap-4 md:gap-10 w-fit">
                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-customGray100 md:text-white">My oVCX</p>
                      <div className="w-max text-3xl font-bold whitespace-nowrap text-white">
                        {`$${oBal && tokens[1][VCX] ? NumberFormatter.format(oBal * (tokens[1][VCX].price * 0.25)) : "0"}`}
                      </div>
                    </div>

                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-customGray100 md:text-white">Claimable oVCX</p>
                      <div className="w-max text-3xl font-bold whitespace-nowrap text-white">
                        {`$${gaugeRewards && tokens[1][VCX] ?
                          NumberFormatter.format((Number(gaugeRewards?.[vaultData.chainId]?.total || 0) / 1e18) * (tokens[1][VCX].price * 0.25)) : "0"}`}
                      </div>
                    </div>
                  </div>

                  <div className="hidden align-bottom md:block md:mt-auto w-fit mb-2">
                    <MainActionButton
                      label="Claim oVCX"
                      handleClick={handleClaim}
                      disabled={!gaugeRewards || gaugeRewards?.[vaultData.chainId]?.total < 0}
                    />
                  </div>
                </div>
                <div className="md:hidden">
                  <MainActionButton
                    label="Claim oVCX"
                    handleClick={handleClaim}
                    disabled={!gaugeRewards || gaugeRewards?.[vaultData.chainId]?.total < 0}
                  />
                </div>
              </div>
            </section>

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-8">
              <div className="w-full md:w-1/3">
                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <div className="bg-customNeutral300 px-6 py-6 rounded-lg">
                    <VaultInputs
                      vaultData={vaultData}
                      tokenOptions={tokenOptions}
                      chainId={vaultData.chainId}
                      hideModal={() => router.reload()}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">



                {(gauge && gauge?.balance > 0) &&
                  <div className="bg-customNeutral200 p-6 rounded-lg">
                    <p className="text-white text-2xl font-bold mb-4">Your Boost 🚀</p>
                    <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4">
                      <CardStat
                        id="your-apy"
                        label="Your APY"
                        value={`${formatNumber((vaultData.workingBalance / (gauge?.balance || 0)) * vaultData.maxGaugeApy)} %`}
                        tooltip="Total value of all assets deposited into the vault"
                      />
                      <CardStat
                        id="boost"
                        label="Your Boost"
                        value={`${formatNumber((vaultData.workingBalance / (gauge?.balance || 0)) * 5)} X`}
                        tooltip="Total value of all assets deposited into the vault"
                      />
                      <CardStat
                        id="ve-missing"
                        label="VeVCX Missing for max Boost"
                        value={`${formatNumber((((gauge?.balance || 0) / vaultData.gaugeSupply) * (tokens[vaultData.chainId][VeTokenByChain[vaultData.chainId]].totalSupply / 1e18)) - (tokens[vaultData.chainId][VeTokenByChain[vaultData.chainId]].balance / 1e18))} VeVCX`}
                        tooltip="Total value of all assets deposited into the vault"
                      />
                    </div>
                  </div>
                }

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold mb-4">Leverage Farm 🧑‍🌾</p>
                  <p className='text-white mb-4'>
                    The borrow modal allows liquidity providers to borrow against their collateral and deposit more into Smart Vaults, enhancing capital efficiency and premiums earned.
                  </p>
                  <div className="md:flex md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                    <div className="w-full md:w-60">
                      <MainActionButton
                        label="Instant Loan Deposit"
                        handleClick={() => setShowLendModal(true)}
                      />
                    </div>
                    <div className="w-full md:w-60">
                      <SecondaryActionButton
                        label="Loan Management Modal"
                        handleClick={() => setShowLendModal(true)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Strategies</p>
                  {vaultData.strategies.map((strategy, i) =>
                    <div
                      key={`${strategy.resolver}-${i}`}
                      className={`py-4 ${i + 1 < vaultData.strategies.length ? "border-b border-customGray500" : ""}`}
                    >
                      <div className="w-max flex flex-row items-center mb-2">
                        <img
                          src={IconByProtocol[strategy.metadata.name] || "/images/tokens/vcx.svg"}
                          className={`h-7 w-7 mr-2 mb-1.5 rounded-full border border-white`}
                        />
                        <h2 className="text-2xl font-bold text-white">
                          {strategy.metadata.name}
                        </h2>
                      </div>
                      <p className='text-white'>
                        {strategy.metadata.description}
                      </p>
                      <div className="mt-2 md:flex md:flex-row md:items-center">
                        <CardStat
                          id={`${strategy.resolver}-${i}-allocation`}
                          label="Allocation"
                          tooltip="Total value of all assets deposited into the vault"
                        >
                          <span className="md:flex md:flex-row md:items-center w-full md:space-x-2">
                            <p className="text-white text-xl leading-6 md:leading-8 text-end md:text-start">
                              $ {formatAndRoundNumber(strategy.allocation * asset?.price!, asset?.decimals!)}
                            </p>
                            <p className="hidden md:block text-white">|</p>
                            <p className="text-white text-xl leading-6 md:leading-8 text-end md:text-start">
                              {NumberFormatter.format(roundToTwoDecimalPlaces(strategy.allocationPerc * 100))} %
                            </p>
                          </span>
                        </CardStat>
                        <CardStat
                          id={`${strategy.resolver}-${i}-apy`}
                          label="APY"
                          value={`${NumberFormatter.format(roundToTwoDecimalPlaces(strategy.apy))} %`}
                          tooltip="Total value of all assets deposited into the vault"
                        />
                      </div>
                    </div>
                  )}

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

                    {vaultData.gauge &&
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
              </div>
            </section>
          </div>
        </>
      )
        :
        <p className="text-white ml-4 md:ml-8">Loading...</p>
    }
  </NoSSR >
}

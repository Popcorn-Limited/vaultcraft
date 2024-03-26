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
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import { claimOPop } from "@/lib/optionToken/interactions";
import VaultInputs from "@/components/vault/VaultInputs";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { tokensAtom, zapAssetsAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import LoanInterface from "@/components/lending/LoanInterface";
import { MinterByChain, OptionTokenByChain, VCX } from "@/lib/constants";
import { ChainById } from "@/lib/utils/connectors";

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const [tokens] = useAtom(tokensAtom)
  const [zapAssets] = useAtom(zapAssetsAtom);
  const [vaults] = useAtom(vaultsAtom);
  const [vaultData, setVaultData] = useState<VaultData>();

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [gauge, setGauge] = useState<Token>();

  useEffect(() => {
    if (!vaultData && query && yieldOptions && Object.keys(vaults).length > 0) {
      const foundVault = vaults[Number(query?.chainId)].find(vault => vault.address === query?.id)
      if (foundVault) {
        const newTokenOptions = [tokens[foundVault.chainId][foundVault.asset], tokens[foundVault.chainId][foundVault.vault], ...zapAssets[foundVault.chainId]]

        setAsset(tokens[foundVault.chainId][foundVault.asset])
        setVault(tokens[foundVault.chainId][foundVault.vault])

        if (foundVault.gauge) {
          setGauge(tokens[foundVault.chainId][foundVault.gauge])
          newTokenOptions.push(tokens[foundVault.chainId][foundVault.gauge])
        }
        setTokenOptions(newTokenOptions)
        setVaultData(foundVault)
      }
    }
  }, [vaults, query, vaultData]);

  const [vcxPrice, setVcxPrice] = useState<number>(0);
  const [oBal, setOBal] = useState<number>(0)

  useEffect(() => {
    async function getOToken() {
      const client = createPublicClient({
        chain: ChainById[vaultData?.chainId!],
        transport: http(),
      })
      const newOBal = client.readContract({
        address: OptionTokenByChain[vaultData?.chainId!],
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [account!]
      })
      setOBal(Number(newOBal) / 1e18)
      setVcxPrice(tokens[1][VCX].price)
    }
    if (account && vaultData) getOToken()
  }, [account])

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>();

  useEffect(() => {
    async function getRewardsData() {
      const rewards = await getGaugeRewards({
        gauges: [vaultData?.gauge!],
        account: account!,
        chainId: vaultData?.chainId!,
        publicClient
      })
      setGaugeRewards(rewards)
    }
    if (account && vaultData?.gauge) getRewardsData();
  }, [account]);

  const [showLendModal, setShowLendModal] = useState(false)

  async function handleClaim() {
    if (!vaultData) return

    if (chain?.id !== vaultData?.chainId) {
      try {
        await switchNetworkAsync?.(vaultData?.chainId);
      } catch (error) {
        return;
      }
    }

    claimOPop({
      gauges: [vaultData.gauge || zeroAddress],
      account: account as Address,
      minter: MinterByChain[vaultData?.chainId],
      clients: { publicClient, walletClient: walletClient as WalletClient }
    })
  }

  return <NoSSR>
    {
      vaultData ? (
        <>
          <LoanInterface visibilityState={[showLendModal, setShowLendModal]} vaultData={vaultData} />
          <div className="min-h-screen">
            <button
              className="border border-gray-500 rounded-lg flex flex-row items-center px-4 py-2 ml-4 md:ml-8 mt-10"
              type="button"
              onClick={() => router.push("/vaults")}
            >
              <div className="w-5 h-5">
                <LeftArrowIcon color="#FFF" />
              </div>
              <p className="text-white leading-0 mt-1 ml-2">Back to Vaults</p>
            </button>
            <section className="md:border-b border-[#353945] py-10 px-4 md:px-8">

              <div className="w-full mb-8">
                <AssetWithName vault={vaultData} size={3} />
              </div>

              <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
                <div className="flex flex-wrap md:flex-row md:items-center md:pr-10 gap-4 md:gap-10 md:w-fit">

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-primaryDark md:text-primary">
                      Your Wallet
                    </p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {asset ? `${formatAndRoundNumber(
                        asset.balance,
                        asset.decimals
                      )}` : "0"}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-primaryDark md:text-primary">
                      Deposits
                    </p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {vaultData ? `${formatAndRoundNumber(
                        (!!gauge ? gauge.balance : vault?.balance!) * vault?.price!,
                        vault?.decimals!
                      )}` : "0"}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="leading-6 text-base text-primaryDark md:text-primary">TVL</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="w-max leading-6 text-base text-primaryDark md:text-primary">vAPY</p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.apy))} %`}
                    </div>
                  </div>
                  {
                    vaultData.boostMin ? (
                      <div className="w-[120px] md:w-max">
                        <p className="w-max leading-6 text-base text-primaryDark md:text-primary">Min Rewards</p>
                        <div className="text-3xl font-bold whitespace-nowrap text-primary">
                          {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.boostMin))} %`}
                        </div>
                      </div>
                    )
                      : <></>
                  }
                  {
                    vaultData.boostMax ? (
                      <div className="w-[120px] md:w-max">
                        <p className="w-max leading-6 text-base text-primaryDark md:text-primary">Max Rewards</p>
                        <div className="text-3xl font-bold whitespace-nowrap text-primary">
                          {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.boostMax))} %`}
                        </div>
                      </div>
                    )
                      : <></>
                  }
                </div>

                <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
                  <div className="flex gap-4 md:gap-10 w-fit">
                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-primaryDark md:text-primary">My oVCX</p>
                      <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                        {`$${oBal && vcxPrice ? NumberFormatter.format(oBal * (vcxPrice * 0.25)) : "0"}`}
                      </div>
                    </div>

                    <div className="w-[120px] md:w-max">
                      <p className="w-max leading-6 text-base text-primaryDark md:text-primary">Claimable oVCX</p>
                      <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                        {`$${gaugeRewards && vcxPrice ? NumberFormatter.format((Number(gaugeRewards?.total) / 1e18) * (vcxPrice * 0.25)) : "0"}`}
                      </div>
                    </div>
                  </div>

                  <div className="hidden align-bottom md:block md:mt-auto w-fit mb-2">
                    <MainActionButton
                      label="Claim oVCX"
                      handleClick={handleClaim}
                      disabled={!gaugeRewards || gaugeRewards?.total < 0}
                    />
                  </div>
                </div>
                <div className="md:hidden">
                  <MainActionButton
                    label="Claim oVCX"
                    handleClick={handleClaim}
                    disabled={!gaugeRewards || gaugeRewards?.total < 0}
                  />
                </div>
              </div>
            </section>

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-8">
              <div className="w-full md:w-1/3">
                <div className="bg-[#23262f] p-6 rounded-lg">
                  <div className="bg-[#141416] px-6 py-6 rounded-lg">
                    <VaultInputs
                      vaultData={vaultData}
                      tokenOptions={tokenOptions}
                      chainId={vaultData.chainId}
                      hideModal={() => router.reload()}
                      mutateTokenBalance={mutateTokenBalance}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">

                <div className="bg-[#23262f] p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold mb-8">Farm with any Token</p>
                  <p className='text-white'>
                    Explanation / Marketing text....
                  </p>
                  <MainActionButton
                    label="Open Loan Modal"
                    handleClick={() => setShowLendModal(true)}
                  />
                </div>

                <div className="bg-[#23262f] p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold mb-8">Strategies</p>
                  {vaultData.strategies.map(strategy =>
                    <p className='text-white'>
                      {strategy.metadata.name} {strategy.allocationPerc} %
                    </p>
                  )}

                  <div className="mt-8">

                  </div>

                  <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-8">

                    <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                      <p className="text-primary font-normal">Vault address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-primary">
                          {vaultData.address.slice(0, 6)}...{vaultData.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.address} onCopy={() => showSuccessToast("Vault address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                      <p className="text-primary font-normal">Asset address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-primary">
                          {vaultData.asset.slice(0, 6)}...{vaultData.asset.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vaultData.asset} onCopy={() => showSuccessToast("Asset address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    {vaultData.gauge &&
                      <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                        <p className="text-primary font-normal">Gauge address:</p>
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-bold text-primary">
                            {vaultData.gauge.slice(0, 6)}...{vaultData.gauge.slice(-4)}
                          </p>
                          <div className='w-6 h-6 group/gaugeAddress'>
                            <CopyToClipboard text={vaultData.gauge} onCopy={() => showSuccessToast("Gauge address copied!")}>
                              <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]" />
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

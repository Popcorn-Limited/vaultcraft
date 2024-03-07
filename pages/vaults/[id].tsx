import AssetWithName from "@/components/vault/AssetWithName";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { FeeConfiguration, Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import {
  Address,
  WalletClient,
  createPublicClient,
  extractChain,
  http,
  zeroAddress,
} from "viem";
import { VaultAbi, getVeAddresses } from "@/lib/constants";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import {
  NumberFormatter,
  formatAndRoundNumber,
} from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import MainActionButton from "@/components/button/MainActionButton";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import { claimOPop } from "@/lib/optionToken/interactions";
import { llama } from "@/lib/resolver/price/resolver";
import VaultInputs from "@/components/vault/VaultInputs";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import { availableZapAssetAtom, zapAssetsAtom } from "@/lib/atoms";
import { getTokenOptions, isDefiPosition } from "@/lib/vault/utils";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import {
  KelpVaultInputs,
  getKelpVaultData,
  mutateKelpTokenBalance,
} from "@/components/vault/KelpVault";

const { oVCX: OVCX, VCX, Minter: MINTER } = getVeAddresses();

export default function Index() {
  const router = useRouter();
  const { query } = router;

  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [yieldOptions] = useAtom(yieldOptionsAtom);

  const [vaults] = useAtom(vaultsAtom);
  const [vaultData, setVaultData] = useState<VaultData>();

  useEffect(() => {
    if (!vaultData && query && yieldOptions && vaults.length > 0) {
      if (query?.id === "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725") {
        getKelpVaultData(
          account || zeroAddress,
          publicClient,
          yieldOptions
        ).then((res) => {
          setVaultData(res.vaultData);
          setTokenOptions(res.tokenOptions);
        });
      } else {
        setVaultData(
          vaults.find(
            (vault) =>
              vault.address === query?.id &&
              vault.chainId === Number(query?.chainId)
          )
        );
      }
    }
  }, [vaults, query, vaultData]);

  const [zapAssets] = useAtom(zapAssetsAtom);
  const [availableZapAssets] = useAtom(availableZapAssetAtom);
  const [zapAvailable, setZapAvailable] = useState<boolean>(false);
  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);

  useEffect(() => {
    if (
      !!vaultData &&
      Object.keys(availableZapAssets).length > 0 &&
      vaultData.address !== "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725"
    ) {
      if (
        availableZapAssets[vaultData.chainId].includes(vaultData.asset.address)
      ) {
        setZapAvailable(true);
        setTokenOptions(
          getTokenOptions(vaultData, zapAssets[vaultData.chainId])
        );
      } else {
        isDefiPosition({
          address: vaultData.asset.address,
          chainId: vaultData.chainId,
        }).then((isZapable) => {
          if (isZapable) {
            setZapAvailable(true);
            setTokenOptions(
              getTokenOptions(vaultData, zapAssets[vaultData.chainId])
            );
          } else {
            setTokenOptions(getTokenOptions(vaultData));
          }
        });
      }
    }
  }, [availableZapAssets, vaultData]);

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>();
  const { data: oBal } = useBalance({
    chainId: 1,
    address: account,
    token: OVCX,
    watch: true,
  });
  const [vcxPrice, setVcxPrice] = useState<number>(0);

  useEffect(() => {
    async function getRewardsData() {
      const rewards = await getGaugeRewards({
        gauges: vaults
          .filter((vault) => vault.gauge && vault.chainId === 1)
          .map((vault) => vault.gauge?.address) as Address[],
        account: account as Address,
        chainId: 1,
        publicClient
      })
      setGaugeRewards(rewards)
      const vcxPriceInUsd = await llama({ address: VCX, chainId: 1 })
      setVcxPrice(vcxPriceInUsd)
    }
    if (account) getRewardsData();
  }, [account]);

  return (
    <NoSSR>
      {vaultData ? (
        <div className="min-h-screen overflow-scroll">
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
                    {`${formatAndRoundNumber(
                      vaultData.asset.balance,
                      vaultData.asset.decimals
                    )}`}
                  </div>
                </div>

                <div className="w-[120px] md:w-max">
                  <p className="leading-6 text-base text-primaryDark md:text-primary">
                    Deposits
                  </p>
                  <div className="text-3xl font-bold whitespace-nowrap text-primary">
                    {`${formatAndRoundNumber(
                      vaultData.vault.balance,
                      vaultData.vault.decimals
                    )}`}
                  </div>
                </div>

                <div className="w-[120px] md:w-max">
                  <p className="leading-6 text-base text-primaryDark md:text-primary">
                    TVL
                  </p>
                  <div className="text-3xl font-bold whitespace-nowrap text-primary">
                    ${" "}
                    {vaultData.tvl < 1
                      ? "0"
                      : NumberFormatter.format(vaultData.tvl)}
                  </div>
                </div>

                <div className="w-[120px] md:w-max">
                  <p className="w-max leading-6 text-base text-primaryDark md:text-primary">
                    vAPY
                  </p>
                  <div className="text-3xl font-bold whitespace-nowrap text-primary">
                    {`${NumberFormatter.format(
                      roundToTwoDecimalPlaces(vaultData.apy)
                    )} %`}
                  </div>
                </div>
                {vaultData.gaugeMinApy ? (
                  <div className="w-[120px] md:w-max">
                    <p className="w-max leading-6 text-base text-primaryDark md:text-primary">
                      Min Boost
                    </p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {vaultData.gaugeMinApy.toFixed(2)} %
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {vaultData.gaugeMaxApy ? (
                  <div className="w-[120px] md:w-max">
                    <p className="w-max leading-6 text-base text-primaryDark md:text-primary">
                      Max Boost
                    </p>
                    <div className="text-3xl font-bold whitespace-nowrap text-primary">
                      {vaultData.gaugeMaxApy.toFixed(2)} %
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <div className="flex flex-row items-center md:gap-6 md:w-fit md:pl-12">
                <div className="flex gap-4 md:gap-10 w-fit">
                  <div className="w-[120px] md:w-max">
                    <p className="w-max leading-6 text-base text-primaryDark md:text-primary">
                      My oVCX
                    </p>
                    <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                      {`$${
                        oBal && vcxPrice
                          ? NumberFormatter.format(
                              (Number(oBal?.value) / 1e18) * (vcxPrice * 0.25)
                            )
                          : "0"
                      }`}
                    </div>
                  </div>

                  <div className="w-[120px] md:w-max">
                    <p className="w-max leading-6 text-base text-primaryDark md:text-primary">
                      Claimable oVCX
                    </p>
                    <div className="w-max text-3xl font-bold whitespace-nowrap text-primary">
                      {`$${
                        gaugeRewards && vcxPrice
                          ? NumberFormatter.format(
                              (Number(gaugeRewards?.total) / 1e18) *
                                (vcxPrice * 0.25)
                            )
                          : "0"
                      }`}
                    </div>
                  </div>
                </div>

                <div className="hidden align-bottom md:block md:mt-auto w-fit mb-2">
                  <MainActionButton
                    label="Claim oVCX"
                    handleClick={() =>
                      claimOPop({
                        gauges: gaugeRewards?.amounts
                          ?.filter((gauge) => Number(gauge.amount) > 0)
                          .map((gauge) => gauge.address) as Address[],
                        account: account as Address,
                        minter: MINTER,
                        clients: { publicClient, walletClient: walletClient as WalletClient }
                      })}
                  />
                </div>
              </div>
              <div className="md:hidden">
                <MainActionButton
                  label="Claim oVCX"
                  handleClick={() =>
                    claimOPop({
                      gauges: gaugeRewards?.amounts
                        ?.filter((gauge) => Number(gauge.amount) > 0)
                        .map((gauge) => gauge.address) as Address[],
                      account: account as Address,
                      minter: MINTER,
                      clients: { publicClient, walletClient: walletClient as WalletClient }
                    })}
                />
              </div>
            </div>
          </section>

          <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-8">
            <div className="w-full md:w-1/3">
              <div className="bg-[#23262f] p-6 rounded-lg">
                <div className="bg-[#141416] px-6 py-6 rounded-lg">
                  {vaultData.address ===
                  "0x7CEbA0cAeC8CbE74DB35b26D7705BA68Cb38D725" ? (
                    <KelpVaultInputs
                      vaultData={vaultData}
                      tokenOptions={tokenOptions}
                      chainId={vaultData.chainId}
                      hideModal={() => router.reload()}
                      mutateTokenBalance={mutateKelpTokenBalance}
                      setVaultData={setVaultData}
                      setTokenOptions={setTokenOptions}
                    />
                  ) : (
                    <VaultInputs
                      vaultData={vaultData}
                      tokenOptions={tokenOptions}
                      chainId={vaultData.chainId}
                      hideModal={() => router.reload()}
                      mutateTokenBalance={mutateTokenBalance}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3 mt-8 md:mt-0">
              <div className="bg-[#23262f] p-6 rounded-lg">
                <p className="text-white text-2xl font-bold mb-8">Strategy</p>
                <p className="text-white">
                  {
                    vaultData.metadata.optionalMetadata.protocol.description.split(
                      "** - "
                    )[1]
                  }
                </p>

                <div className="mt-8"></div>

                <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-8">
                  <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                    <p className="text-primary font-normal">Vault address:</p>
                    <div className="flex flex-row items-center justify-between">
                      <p className="font-bold text-primary">
                        {vaultData.address.slice(0, 6)}...
                        {vaultData.address.slice(-4)}
                      </p>
                      <div className="w-6 h-6 group/vaultAddress">
                        <CopyToClipboard
                          text={vaultData.address}
                          onCopy={() =>
                            showSuccessToast("Vault address copied!")
                          }
                        >
                          <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                        </CopyToClipboard>
                      </div>
                    </div>
                  </div>

                  <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                    <p className="text-primary font-normal">Asset address:</p>
                    <div className="flex flex-row items-center justify-between">
                      <p className="font-bold text-primary">
                        {vaultData.asset.address.slice(0, 6)}...
                        {vaultData.asset.address.slice(-4)}
                      </p>
                      <div className="w-6 h-6 group/vaultAddress">
                        <CopyToClipboard
                          text={vaultData.asset.address}
                          onCopy={() =>
                            showSuccessToast("Asset address copied!")
                          }
                        >
                          <Square2StackIcon className="text-white group-hover/vaultAddress:text-[#DFFF1C]" />
                        </CopyToClipboard>
                      </div>
                    </div>
                  </div>

                  {vaultData.gauge && (
                    <div className="w-10/12 border border-[#353945] rounded-lg p-4">
                      <p className="text-primary font-normal">Gauge address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-primary">
                          {vaultData.gauge.address.slice(0, 6)}...
                          {vaultData.gauge.address.slice(-4)}
                        </p>
                        <div className="w-6 h-6 group/gaugeAddress">
                          <CopyToClipboard
                            text={vaultData.gauge.address}
                            onCopy={() =>
                              showSuccessToast("Gauge address copied!")
                            }
                          >
                            <Square2StackIcon className="text-white group-hover/gaugeAddress:text-[#DFFF1C]" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <p className="text-white ml-4 md:ml-8">Loading...</p>
      )}
    </NoSSR>
  );
}

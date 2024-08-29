import { vaultsAtom } from "@/lib/atoms/vaults";
import { Token, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NoSSR from "react-no-ssr";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import VaultInputs from "@/components/vault/VaultInputs";
import { showSuccessToast } from "@/lib/toasts";
import CopyToClipboard from "react-copy-to-clipboard";
import { ArrowDownIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { tokensAtom } from "@/lib/atoms";
import LeftArrowIcon from "@/components/svg/LeftArrowIcon";
import ManageLoanInterface from "@/components/lending/ManageLoanInterface";
import { ST_VCX, VCX, VeTokenByChain, ZapAssetAddressesByChain } from "@/lib/constants";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import StrategyDescription from "@/components/vault/StrategyDescription";
import ApyChart from "@/components/vault/ApyChart";
import VaultHero from "@/components/vault/VaultHero";
import { Address, createPublicClient, formatUnits, http, isAddress, zeroAddress } from "viem";
import { mainnet } from "viem/chains";
import CardStat from "@/components/common/CardStat";
import { RPC_URLS } from "@/lib/utils/connectors";
import { LockVaultAbi } from "@/lib/constants/abi/LockVault";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import LargeCardStat from "@/components/common/LargeCardStat";
import { formatAndRoundNumber, formatTwoDecimals, safeRound } from "@/lib/utils/formatBigNumber";
import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { validateInput } from "@/lib/utils/helpers";

async function getUserLockVaultData(user: Address, vault: Address) {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(RPC_URLS[mainnet.id]),
  })

  const block = await client.getBlock({
    blockTag: "latest"
  })

  const lockVaultData = await client.multicall({
    contracts: [
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "locks",
        args: [user]
      },
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "getCurrIndices",
      },
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "getUserIndices",
        args: [user]
      },
      {
        address: vault,
        abi: LockVaultAbi,
        functionName: "getAccruedRewards",
        args: [user]
      }
    ],
    allowFailure: false,
  })

  const rewardShares = Number(lockVaultData[0][2])
  const multiplier = Number(rewardShares / (Number(lockVaultData[0][1]) || 1))
  const vcxIndexDif = Number(lockVaultData[1][0]) - Number(lockVaultData[2][0])
  const newVCXRewards = rewardShares * vcxIndexDif
  const accruedVCX = (Number(lockVaultData[3][0]) + newVCXRewards) / 1e18

  const ovcxIndexDif = Number(lockVaultData[1][1]) - Number(lockVaultData[2][1])
  const newOVCXRewards = rewardShares * ovcxIndexDif
  const accruedOVCX = (Number(lockVaultData[3][1]) + newOVCXRewards) / 1e18

  return {
    unlockTime: Number(lockVaultData[0][0]) * 1000,
    unlocked: block.timestamp >= lockVaultData[0][0],
    hasLock: rewardShares > 0,
    isExit: (rewardShares > 0) && block.timestamp >= lockVaultData[0][0],
    multiplier,
    accruedVCX,
    accruedOVCX
  }
}

export default function Staking() {
  const publicClient = usePublicClient({ chainId: 1 });
  const { data: walletClient } = useWalletClient();
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [tokens] = useAtom(tokensAtom)

  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);
  const [asset, setAsset] = useState<Token>();
  const [vault, setVault] = useState<Token>();
  const [lockVaultData, setLockVaultData] = useState<any>()
  const [userLockVaultData, setUserLockVaultData] = useState<any>()
  const [walletValue, setWalletValue] = useState<number>(0)
  const [depositValue, setDepositValue] = useState<number>(0)
  const [tvl, setTvl] = useState<number>(0)

  const [inputToken, setInputToken] = useState<Token>();
  const [outputToken, setOutputToken] = useState<Token>();
  const [inputBalance, setInputBalance] = useState<string>("0");
  const [lockTime, setLockTime] = useState<number>(0);

  useEffect(() => {
    if (Object.keys(tokens).length > 0) {
      setTokenOptions([
        tokens[mainnet.id][VCX],
        ...ZapAssetAddressesByChain[mainnet.id].filter(addr => VCX !== addr).map(addr => tokens[mainnet.id][addr])
      ])

      setAsset(tokens[mainnet.id][VCX])
      setVault(tokens[mainnet.id][ST_VCX])
      setWalletValue((tokens[mainnet.id][VCX].balance * tokens[mainnet.id][VCX].price) / 1e18)
      setDepositValue((tokens[mainnet.id][ST_VCX].balance * tokens[mainnet.id][VCX].price) / 1e18)
      setTvl((tokens[mainnet.id][ST_VCX].totalSupply * tokens[mainnet.id][VCX].price) / 1e18)


      if (account) {
        getUserLockVaultData(account, ST_VCX).then(res => {
          setUserLockVaultData(res)
          setInputToken(res.isExit ? vault : asset)
          setOutputToken(res.isExit ? asset : vault)
        })
      } else {
        setInputToken(asset)
        setOutputToken(vault)
      }
    }
  }, [tokens, account]);

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setInputBalance(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!asset) return;
    const stringBal = asset.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), asset.decimals);
    const formatted = formatUnits(rounded, asset.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
  }

  function handleTokenSelect(option: Token) {
    setInputToken(option)
  }

  async function handleMainAction() {
    let val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !asset || !vault || !account || !walletClient) return;
    val = val * (10 ** inputToken.decimals)

    if (userLockVaultData.isExit) {
      // exit
    } else {
      if (userLockVaultData.hasLock) {
        // increase
      } else {
        // lock
      }
    }
  }

  return <NoSSR>
    {
      (asset && vault && tokenOptions.length > 0) ? (
        <>
          <div className="min-h-screen">
            <section className="md:border-b border-customNeutral100 pt-10 pb-6 px-4 md:px-0 ">
              <div className="w-full mb-8">
                <div
                  className="flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1"
                >
                  <div className="relative">
                    <NetworkSticker chainId={1} size={3} />
                    <TokenIcon
                      token={asset}
                      icon={asset.logoURI}
                      chainId={1}
                      imageSize={"w-12 h-12"}
                    />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-white mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}
                  >
                    VCX STAKING
                  </h2>
                </div>
              </div>

              <div className="w-full md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 mt-4 md:mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-6 md:pr-10  gap-4 md:gap-10">
                  <div>
                    <LargeCardStat
                      id={"wallet"}
                      label="Your Wallet"
                      value={walletValue < 1 ? "$ 0" : `$ ${formatTwoDecimals(walletValue)}`}
                      secondaryValue={walletValue < 1 ? `0 ${asset.symbol}` : `${formatTwoDecimals(asset.balance / 10 ** asset.decimals)} ${asset.symbol}`}
                      tooltip="Value of deposit assets held in your wallet"
                    />
                  </div>
                  <div>
                    <LargeCardStat
                      id={"deposits"}
                      label="Deposits"
                      value={depositValue < 1 ? "$ 0" : `$ ${formatTwoDecimals(depositValue)}`}
                      secondaryValue={depositValue < 1 ? "$ 0" : `${formatAndRoundNumber(vault?.balance!, vault?.decimals!)} ${asset.symbol}`}
                      tooltip="Value of your vault deposits"
                    />
                  </div>
                  <div>
                    <LargeCardStat
                      id={"tvl"}
                      label="TVL"
                      value={`$ ${tvl < 1 ? "0" : formatTwoDecimals(tvl)
                        }`}
                      secondaryValue={
                        asset
                          ? `${formatTwoDecimals(vault.totalSupply / 1e18)} ${asset?.symbol!}`
                          : "0 TKN"
                      }
                      tooltip={``}
                    />
                  </div>
                  <div>
                    <LargeCardStat
                      id={"vapy"}
                      label="vAPY"
                      value={`40 %`}
                      tooltip="Current variable APY of the vault"
                    />
                  </div>
                  {/* {vaultData.gaugeData?.lowerAPR ?
                    (
                      <div className="w-1/2 md:w-max">
                        <LargeCardStat
                          id={"boost"}
                          label="Boost APR"
                          value={`${formatTwoDecimals(vaultData.gaugeData?.lowerAPR * boost)} %`}
                          tooltip={`Minimum oVCX boost APR based on most current epoch's distribution. (Based on the current emissions for this gauge of
                     ${formatTwoDecimals((vaultData?.gaugeData.annualEmissions / 5) * boost)} oVCX p. year)`}
                        />
                      </div>
                    )
                    : <></>
                  }
                  {vaultData.gaugeData?.rewardApy.apy ?
                    (
                      <div className="w-1/2 md:w-max">
                        <LargeCardStat
                          id={"add-rewards"}
                          label="Add. Rewards"
                          value={`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.gaugeData?.rewardApy.apy))} %`}
                          tooltipChild={
                            <div className="w-42">
                              <p className="font-bold">Annual Rewards</p>
                              {vaultData.gaugeData?.rewardApy.rewards
                                .filter(reward => reward.emissions > 0)
                                .map(reward =>
                                  <p key={reward.address}>{NumberFormatter.format(reward.emissions)} {tokens[vaultData.chainId][reward.address].symbol} | ${NumberFormatter.format(reward.emissionsValue)} | {NumberFormatter.format(roundToTwoDecimalPlaces(reward.apy))}%</p>
                                )}
                            </div>
                          }
                        />
                      </div>
                    )
                    : <></>
                  } */}
                </div>
              </div>
            </section>

            <section className="w-full md:flex md:flex-row md:justify-between md:space-x-8 py-10 px-4 md:px-0">
              <div className="w-full md:w-1/3">
                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">{userLockVaultData?.isExit ? "Withdraw" : "Deposit"}</p>
                  <div className="bg-customNeutral300 px-6 py-6 rounded-lg">
                    {/*
                     1. if no lock -> deposit
                     2. If lock and not expired -> increase
                     3. If lock and expired -> exit
                    */}
                    <InputTokenWithError
                      captionText={"Input Amount"}
                      onSelectToken={(option) => handleTokenSelect(option)}
                      onMaxClick={handleMaxClick}
                      chainId={1}
                      value={inputBalance}
                      onChange={handleChangeInput}
                      selectedToken={inputToken}
                      errorMessage={""}
                      tokenList={tokenOptions}
                      allowSelection={!userLockVaultData?.isExit}
                      allowInput
                    />
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-customGray500" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-customNeutral300 px-4">
                          <ArrowDownIcon
                            className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                    <InputTokenWithError
                      captionText={"Output Amount"}
                      onSelectToken={() => { }}
                      onMaxClick={() => { }}
                      chainId={1}
                      value={(Number(inputBalance) * Number(inputToken?.price)) /
                        Number(outputToken?.price) || 0}
                      onChange={() => { }}
                      selectedToken={vault}
                      errorMessage={""}
                      tokenList={[]}
                      allowSelection={false}
                      allowInput={false}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 mt-8 md:mt-0 space-y-4">
                <div>
                  <CardStat
                    id={`${vault.address.slice(1)}-deposit`}
                    label="Your Deposit"
                    value={`${formatAndRoundNumber(vault.balance, vault.decimals)}`}
                    tooltip="Vault Shares held in your wallet"
                  />
                  <CardStat
                    id={`${vault.address.slice(1)}-unlockDate`}
                    label="Unlock Date"
                    value={userLockVaultData ? new Date(userLockVaultData.unlockTime).toLocaleDateString() : "?"}
                    tooltip="The date when you are able to withdraw your funds"
                  />
                  <CardStat
                    id={`${vault.address.slice(1)}-tvl`}
                    label="Unlockable"
                    value={userLockVaultData ? String(userLockVaultData.unlocked) : "?"}
                    tooltip="Can you withdraw your funds"
                  />
                </div>

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Information</p>
                  <p className="text-white">
                    .....
                  </p>
                  <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4">

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Staking address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={vault.address} onCopy={() => showSuccessToast("Staking address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-10/12 border border-customNeutral100 rounded-lg p-4">
                      <p className="text-white font-normal">Asset address:</p>
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-bold text-white">
                          {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
                        </p>
                        <div className='w-6 h-6 group/vaultAddress'>
                          <CopyToClipboard text={asset.address} onCopy={() => showSuccessToast("Asset address copied!")}>
                            <Square2StackIcon className="text-white group-hover/vaultAddress:text-primaryYellow" />
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-customNeutral200 p-6 rounded-lg">
                  <p className="text-white text-2xl font-bold">Strategies</p>
                </div>
              </div>
            </section>
          </div>
        </>
      )
        :
        <p className="text-white ml-4 md:ml-0">Loading...</p>
    }
  </NoSSR >
}
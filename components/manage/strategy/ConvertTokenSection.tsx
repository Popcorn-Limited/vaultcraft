import { Token } from "@/lib/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, PublicClient } from "viem";
import axios from "axios";
import { AnyToAnyDepositorAbi, PendleRouterByChain } from "@/lib/constants";
import { tokensAtom } from "@/lib/atoms";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";
import { handleAllowance } from "@/lib/approve";
import { NumberFormatter, validateInput } from "@/lib/utils/helpers";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { claimReserve, pullFunds, pushFunds } from "@/lib/vault/management/strategyInteractions";
import { PassThroughProps } from "@/components/manage/strategy/AnyToAnyV1DepositorSettings";
import TabSelector from "@/components/common/TabSelector";
import { ZapAssetAddressesByChain } from "@/lib/constants";
import { showErrorToast } from "@/lib/toasts";

async function getReserveLogs(address: Address, account: Address, client: PublicClient) {
  let addedLogs = await client.getContractEvents({
    address: address,
    abi: AnyToAnyDepositorAbi,
    eventName: "ReserveAdded",
    fromBlock: "earliest",
    toBlock: "latest",
  });
  const removeLogs = await client.getContractEvents({
    address: address,
    abi: AnyToAnyDepositorAbi,
    eventName: "ReserveClaimed",
    fromBlock: "earliest",
    toBlock: "latest",
  });
  // Filter out claimed reserves
  const removedBlocks = removeLogs.map(log => log.args.blockNumber)
  addedLogs = addedLogs.filter(log => !removedBlocks.includes(log.args.blockNumber))

  // Filter out reserves that are not for account
  addedLogs = addedLogs.filter(log => log.args.user === account);

  return addedLogs
}

const DEFAULT_TABS = ["Deposit", "Withdraw"]

export default function ConvertTokenSection({ strategy, asset, yieldToken, settings, chainId }: PassThroughProps) {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const [reserves, setReserves] = useState<any[]>()
  const [tab, setTab] = useState<string>("Deposit")

  useEffect(() => {
    if (publicClient && account && !reserves) updateReserves()
  }, [publicClient, account, strategy])

  async function updateReserves() {
    const logs = await getReserveLogs(strategy.address, account!, publicClient!)
    setReserves(logs)
  }

  return (
    <>
      <div className="">
        <TabSelector
          className="mt-6 mb-12"
          availableTabs={DEFAULT_TABS}
          activeTab={tab}
          setActiveTab={(t: string) => setTab(t)}
        />
        {tab === "Deposit"
          ? <div className="">
            <p className="text-white text-2xl">Deposit into Strategy</p>
            <p>Convert idle assets into productive yield token by depositing yield token and claiming a refund in assets of an equivalent value</p>
            <ConvertToken token={yieldToken} strategy={strategy} asset={asset} yieldToken={yieldToken} settings={settings} chainId={chainId} updateReserves={updateReserves} />
          </div>
          : <div className="">
            <p className="text-white text-2xl">Withdraw From Strategy</p>
            <p>Convert yield token to withdrawable assets by depositing assets and claiming a refund in yield token of an equivalent value</p>
            <ConvertToken token={asset} strategy={strategy} asset={asset} yieldToken={yieldToken} settings={settings} chainId={chainId} updateReserves={updateReserves} />
          </div>
        }
      </div>
      <div className="w-full border border-customNeutral100 rounded-lg p-4 my-4 flex flex-row justify-between">
        <div className="w-1/2 px-4">
          <p className="text-xl">Price</p>
          <span className="flex space-x-2">
            <p>Assets per. YieldToken:</p>
            <p className="text-customGray300">1 {yieldToken.symbol} = {NumberFormatter.format(settings.bqPrice / 1e18)} {asset.symbol}</p>
          </span>
          <span className="flex space-x-2">
            <p>YieldTokens per. Asset:</p>
            <p className="text-customGray300">1 {asset.symbol} = {NumberFormatter.format(settings.qbPrice / 1e18)} {yieldToken.symbol}</p>
          </span>
        </div>
        <div className="w-1/2 px-4">
          <p className="text-xl">Balance</p>
          <span className="flex space-x-2">
            <p>Assets:</p>
            <p className="text-customGray300">{NumberFormatter.format(settings.assetBal / (10 ** asset.decimals))} {asset.symbol}</p>
          </span>
          <span className="flex space-x-2">
            <p>YieldTokens:</p>
            <p className="text-customGray300">{NumberFormatter.format(settings.yieldTokenBal / (10 ** yieldToken.decimals))} {yieldToken.symbol}</p>
          </span>
          <span className="flex space-x-2">
            <p>Total Assets:</p>
            <p className="text-customGray300">{NumberFormatter.format(settings.totalAssets / (10 ** asset.decimals))} {asset.symbol}</p>
          </span>
        </div>
      </div>
      <ReservesContainer strategy={strategy} asset={asset} yieldToken={yieldToken} settings={settings} chainId={chainId} reserves={reserves} updateReserves={updateReserves} />
    </>
  )
}

function ConvertToken({ token, strategy, asset, yieldToken, settings, chainId, updateReserves }: PassThroughProps & { token: Token, updateReserves: Function }) {
  const { owner, keeper, assetBal, yieldTokenBal, bqPrice, qbPrice } = settings;
  const [isAsset, setIsAsset] = useState<boolean>(token.address === asset.address);
  const [price, setPrice] = useState<number>(isAsset ? qbPrice : bqPrice);
  const float = (settings.assetBal / (10 ** asset.decimals)) / (10_000 / Number(settings.float))
  const [depositLimit, setDepositLimit] = useState<number>(isAsset ? (yieldTokenBal / (10 ** yieldToken.decimals)) / (price / 1e18) : ((assetBal / (10 ** asset.decimals)) - float) / (price / 1e18))

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [tokens, setTokens] = useAtom(tokensAtom);
  const [inputToken, setInputToken] = useState<Token>(yieldToken);
  const [isZap, setIsZap] = useState<boolean>(false);

  const zapList = [asset, yieldToken, ...ZapAssetAddressesByChain[chainId].filter(addr => strategy.asset !== addr).map(addr => tokens[chainId][addr])];

  const [amount, setAmount] = useState<string>("0");

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setAmount(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!inputToken) return;
    handleChangeInput({ currentTarget: { value: inputToken.balance.formatted } });
  }

  async function handleApprove() {
    let val = Number(amount)
    if (val === 0 || !account || !publicClient || !walletClient) return
    val = val * (10 ** token.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    handleAllowance({
      token: inputToken.address,
      spender: isZap ? PendleRouterByChain[1] : strategy.address,
      amount: val,
      account: account,
      clients: {
        publicClient,
        walletClient
      }
    })
  }

  async function handleDeposit() {
    let val = Number(amount)
    if (val === 0 || !account || !publicClient || !walletClient) return
    val = val * (10 ** token.decimals)

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    let success
    if (isAsset) {
      success = await pullFunds({
        amount: val,
        address: strategy.address,
        account,
        clients: {
          publicClient,
          walletClient
        }
      })
    }
    else {
      success = await pushFunds({
        amount: val,
        address: strategy.address,
        account,
        clients: {
          publicClient,
          walletClient
        }
      })
    }
    if (success) updateReserves()
  }

  async function handleZap() {
    let val = Number(amount)
    if (val === 0 || !account || !publicClient || !walletClient) return
    val = val * (10 ** inputToken.decimals)

    try {
      const { data } = await axios.get(`https://api-v2.pendle.finance/core/v1/sdk/1/markets/0xcae62858db831272a03768f5844cbe1b40bb381f/add-liquidity?receiver=${account}&slippage=0.05&enableAggregator=true&tokenIn=${inputToken.address}&amountIn=${val}`)
      const hash = await walletClient!.sendTransaction({
        account: account,
        to: data.tx.to,
        data: data.tx.data,
      })
    } catch (err) {
      showErrorToast("Error getting zap calldata");
    }
  }

  function handleTokenSelect(input: Token): void {
    setInputToken(input);
    setAmount("0");
    const isNowAsset = input.address === asset.address;
    setIsAsset(isNowAsset);

    if (![token, asset, yieldToken].includes(input)) {
      setIsZap(true);
      const newPrice = input.price * 10 ** 18 / asset.price;

      setPrice(newPrice);
      setDepositLimit((Number(input.balance.formatted) - float) / (newPrice / 1e18));
    }
    else {
      setIsZap(false);
      const newPrice = isNowAsset ? qbPrice : bqPrice;
      setPrice(newPrice);
      setDepositLimit(isNowAsset ? (yieldTokenBal / (10 ** yieldToken.decimals)) / (bqPrice / 1e18) : ((assetBal / (10 ** asset.decimals)) - float) / (newPrice / 1e18));
    }
  }
  return (
    <div className="mt-4">
      <div className="">
        <div>
          <p>Convert Amount</p>
          <InputTokenWithError
            onSelectToken={(option) => handleTokenSelect(option)}
            onMaxClick={handleMaxClick}
            chainId={chainId}
            value={amount}
            onChange={handleChangeInput}
            selectedToken={inputToken}
            errorMessage={""}
            tokenList={zapList}
            allowSelection={true}
            allowInput={true}
          />
          <p
            onClick={() => handleChangeInput({ currentTarget: { value: NumberFormatter.format(depositLimit).replace(",", ".") } })}
          >
            {isAsset ? "Withdraw" : "Deposit"} Limit: {NumberFormatter.format(depositLimit)}
          </p>
        </div>
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-customGray500" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-customNeutral300 px-4">
              <ArrowDownIcon
                className="h-10 w-10 p-2 text-customGray500 border border-customGray500 rounded-full cursor-pointer hover:text-white hover:border-white"
                aria-hidden="true"
                onClick={() => { }}
              />
            </span>
          </div>
        </div>
        <div>
          <p>Refund Amount</p>
          <InputTokenWithError
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={chainId}
            value={(Number(amount) * price) / 1e18}
            onChange={() => { }}
            selectedToken={isAsset ? yieldToken : asset}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput={false}
          />
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <SecondaryActionButton
          label="Approve"
          handleClick={handleApprove} disabled={!account || (account !== owner && account !== keeper)}
        />
        <MainActionButton
          label={isZap ? "Zap to Yield Asset" : "Convert"}
          handleClick={isZap ? handleZap : handleDeposit}
          disabled={!account || (account !== owner && account !== keeper)}
        />
      </div>
    </div>
  )
}

function ReservesContainer({ strategy, asset, yieldToken, settings, chainId, reserves, updateReserves }: PassThroughProps & { reserves?: any[], updateReserves: Function }) {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  async function handleMainAction(log: any) {
    if (!account || !publicClient || !walletClient) return

    if (chain?.id !== Number(chainId)) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    const success = await claimReserve({
      blockNumber: log.args.blockNumber,
      isYieldToken: log.args.asset === asset.address,
      address: strategy.address,
      account,
      clients: {
        publicClient,
        walletClient
      }
    })
    if (success) updateReserves()
  }

  return (
    <div className="mt-4">
      <p className="text-white text-2xl">Claim Refund</p>
      <div className="w-full flex flex-row items-center mt-4">
        <p className="w-1/3">Deposited</p>
        <p className="w-1/3">Withdrawable</p>
        <p className="w-1/3"></p>
      </div>
      {
        reserves?.map(log => {
          const isAsset = log.args.asset === asset.address
          return (
            <div key={log.blockHash} className="w-full flex flex-row items-center">
              <p className="w-1/3">{Number(log.args.amount) / (10 ** (isAsset ? asset.decimals : yieldToken.decimals))} {isAsset ? asset.symbol : yieldToken.symbol}</p>
              <p className="w-1/3">{Number(log.args.withdrawable) / (10 ** (isAsset ? yieldToken.decimals : asset.decimals))} {isAsset ? yieldToken.symbol : asset.symbol}</p>
              <div className="w-1/3">
                <MainActionButton label="Claim" handleClick={() => handleMainAction(log)} disabled={!account} />
              </div>
            </div>
          )
        }
        )
      }
    </div>
  )
}
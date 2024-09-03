import { Token } from "@/lib/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, formatUnits, PublicClient } from "viem";
import { AnyToAnyDepositorAbi } from "@/lib/constants";
import { tokensAtom } from "@/lib/atoms";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";
import { handleAllowance } from "@/lib/approve";
import { formatNumber, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { claimReserve, pullFunds, pushFunds } from "@/lib/vault/management/strategyInteractions";
import { PassThroughProps } from "./AnyToAnyV1DepositorSettings";

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

export default function ConvertTokenSection({ strategy, asset, yieldAsset, settings, chainId }: PassThroughProps) {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const [reserves, setReserves] = useState<any[]>()

  useEffect(() => {
    if (publicClient && account && !reserves) updateReserves()
  }, [publicClient, account, strategy])

  async function updateReserves() {
    const logs = await getReserveLogs(strategy.address, account!, publicClient!)
    setReserves(logs)
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between space-x-8">
        <div className="w-1/2">
          <p className="text-white text-2xl">Deposit YieldAsset</p>
          <p>Deposit yieldAssets to claim assets at an equivalent value after</p>
          <ConvertToken token={yieldAsset} strategy={strategy} asset={asset} yieldAsset={yieldAsset} settings={settings} chainId={chainId} updateReserves={updateReserves} />
        </div>
        <div className="w-1/2">
          <p className="text-white text-2xl">Deposit Asset</p>
          <p>Deposit assets to claim yieldAssets at an equivalent value after</p>
          <ConvertToken token={asset} strategy={strategy} asset={asset} yieldAsset={yieldAsset} settings={settings} chainId={chainId} updateReserves={updateReserves} />
        </div>
      </div>
      <div className="w-full border border-customNeutral100 rounded-lg p-4 my-4 flex flex-row justify-between">
        <div className="w-1/2 px-4">
          <p className="text-xl">Price</p>
          <span className="flex space-x-2">
            <p>Assets p. YieldAsset:</p>
            <p className="text-customGray300">{settings.bqPrice / 1e18}</p>
          </span>
          <span className="flex space-x-2">
            <p>YieldAssets p. Asset:</p>
            <p className="text-customGray300">{settings.qbPrice / 1e18}</p>
          </span>
        </div>
        <div className="w-1/2 px-4">
          <p className="text-xl">Balance</p>
          <span className="flex space-x-2">
            <p>Assets:</p>
            <p className="text-customGray300">{settings.assetBal / (10 ** asset.decimals)}</p>
          </span>
          <span className="flex space-x-2">
            <p>YieldAssets:</p>
            <p className="text-customGray300">{settings.yieldAssetBal / (10 ** yieldAsset.decimals)}</p>
          </span>
          <span className="flex space-x-2">
            <p>Total Assets:</p>
            <p className="text-customGray300">{settings.totalAssets / (10 ** asset.decimals)}</p>
          </span>
        </div>
      </div>
      <ReservesContainer strategy={strategy} asset={asset} yieldAsset={yieldAsset} settings={settings} chainId={chainId} reserves={reserves} updateReserves={updateReserves} />
    </>
  )
}

function ConvertToken({ token, strategy, asset, yieldAsset, settings, chainId, updateReserves }: PassThroughProps & { token: Token, updateReserves: Function }) {
  const { owner, keeper, assetBal, yieldAssetBal, bqPrice, qbPrice } = settings;
  const isAsset = token.address === asset.address
  const price = isAsset ? qbPrice : bqPrice
  const float = (settings.assetBal / (10 ** asset.decimals)) / (10_000 / Number(settings.float))
  const depositLimit = isAsset ? (yieldAssetBal / (10 ** yieldAsset.decimals)) / (bqPrice / 1e18) : ((assetBal / (10 ** asset.decimals)) - float) / (price / 1e18)

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [tokens, setTokens] = useAtom(tokensAtom);

  const [amount, setAmount] = useState<string>("0");

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value;
    setAmount(validateInput(value).isValid ? value : "0");
  }

  function handleMaxClick() {
    if (!token) return;
    const stringBal = token.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const rounded = safeRound(BigInt(stringBal), token.decimals);
    const formatted = formatUnits(rounded, token.decimals);
    handleChangeInput({ currentTarget: { value: formatted } });
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
      token: token.address,
      spender: strategy.address,
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

  return (
    <div className="">
      <div className="">
        <div>
          <p>Input Amount</p>
          <InputTokenWithError
            onSelectToken={() => { }}
            onMaxClick={handleMaxClick}
            chainId={chainId}
            value={amount}
            onChange={handleChangeInput}
            selectedToken={token}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput={true}
          />
          <p>DepositLimit: {isAsset
            ? formatNumber(depositLimit)
            : formatNumber(depositLimit)}
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
          <p>Claimable Amount</p>
          <InputTokenWithError
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={chainId}
            value={(Number(amount) * price) / 1e18}
            onChange={() => { }}
            selectedToken={isAsset ? yieldAsset : asset}
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
          label="Deposit"
          handleClick={handleDeposit}
          disabled={!account || (account !== owner && account !== keeper) || Number(amount) >= depositLimit}
        />
      </div>
    </div>
  )
}

function ReservesContainer({ strategy, asset, yieldAsset, settings, chainId, reserves, updateReserves }: PassThroughProps & { reserves?: any[], updateReserves: Function }) {
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
      isYieldAsset: log.args.asset === asset.address,
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
      <p className="text-white text-2xl">Claim Withdrawable</p>
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
              <p className="w-1/3">{Number(log.args.amount) / (10 ** (isAsset ? asset.decimals : yieldAsset.decimals))} {isAsset ? asset.symbol : yieldAsset.symbol}</p>
              <p className="w-1/3">{Number(log.args.withdrawable) / (10 ** (isAsset ? yieldAsset.decimals : asset.decimals))} {isAsset ? yieldAsset.symbol : asset.symbol}</p>
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
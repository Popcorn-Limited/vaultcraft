import { ArrowDownIcon } from "@heroicons/react/24/outline";
import MainButtonGroup from "../common/MainButtonGroup";
import SecondaryButtonGroup from "../common/SecondaryButtonGroup";
import TokenIcon from "../common/TokenIcon";
import InputTokenWithError from "../input/InputTokenWithError";
import SelectToken from "../input/SelectToken";
import { Token } from "@/lib/types";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Address, PublicClient } from "viem";
import { VaultRouterAbi, VaultRouterByChain } from "@/lib/constants";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils/formatBigNumber";
import { vaultCancelWithdrawal, vaultClaimWithdrawal } from "@/lib/vault/interactions";
import { useAtom } from "jotai";
import { tokensAtom } from "@/lib/atoms";
import { vaultsAtom } from "@/lib/atoms/vaults";

interface ClaimableWithdrawalProps {
  vault: Token;
  asset: Token;
  tokenOptions: Token[]
}

async function getWithdrawalRequests(vault: Token, asset: Token, account: Address, client: PublicClient) {
  const data = await client.multicall({
    contracts: [
      {
        address: VaultRouterByChain[client.chain!.id],
        abi: VaultRouterAbi,
        functionName: "claimableAssets",
        args: [asset.address, account]
      },
      {
        address: VaultRouterByChain[client.chain!.id],
        abi: VaultRouterAbi,
        functionName: "requestShares",
        args: [vault.address, account]
      }
    ]
  })
  return data.map(e => Number(e.result))
}

export default function ClaimableWithdrawal({ vault, asset, tokenOptions }: ClaimableWithdrawalProps): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: vault.chainId });

  const [claimableAssets, setClaimableAssets] = useState<number>(0)
  const [requestShares, setRequestShares] = useState<number>(0)

  useEffect(() => {
    if (account && vault && publicClient) {
      getWithdrawalRequests(vault, asset, account, publicClient)
        .then(res => {
          setClaimableAssets(res[0])
          setRequestShares(res[1])
        })
    }
  }, [vault, asset, account, publicClient])

  return <>
    <ClaimableAssets claimableAssets={claimableAssets} vault={vault} asset={asset} tokenOptions={tokenOptions} />
    <RequestedShares requestShares={requestShares} asset={asset} vault={vault} />
  </>
}

function ClaimableAssets({ claimableAssets, vault, asset, tokenOptions }: { claimableAssets: number, vault: Token, asset: Token, tokenOptions: Token[] }): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: asset.chainId });
  const { data: walletClient } = useWalletClient();
  const [tokens, setTokens] = useAtom(tokensAtom);
  const [vaultsData] = useAtom(vaultsAtom);

  const [selectedToken, setSelectedToken] = useState<Token>()

  return (
    <div className="bg-customNeutral200 p-6 rounded-lg mt-4">
      <p className="text-white font-bold text-xl mb-4">Claimable Withdrawals</p>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Assets:</p>
        <span className="flex flex-row items-center">
          <p className="">
            {claimableAssets / (10 ** asset.decimals)}
          </p>
          <TokenIcon
            token={asset}
            icon={asset?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={asset.chainId!}
          />
          {asset.symbol}
        </span>
      </span>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Withdrawal Amount:</p>
        <span className="flex flex-row items-center">
          <p className="mr-2">
            {selectedToken ? `~ ${formatNumber(((claimableAssets / (10 ** asset.decimals)) * asset.price) / (selectedToken?.price || 0))}` : ""}
          </p>
          <SelectToken
            chainId={asset.chainId!}
            allowSelection={true}
            selectedToken={selectedToken}
            options={tokenOptions}
            selectToken={setSelectedToken}
          />
        </span>
      </span>

      <div className="mt-2">
        <SecondaryButtonGroup
          label="Claim Withdrawal"
          mainAction={() =>
            vaultClaimWithdrawal({
              chainId: asset.chainId!,
              router: VaultRouterByChain[asset.chainId!],
              vaultData: vaultsData[asset.chainId!].find(vaultData => vaultData.address === vault.address)!,
              asset: asset,
              vault: vault,
              account: account!,
              amount: claimableAssets,
              clients: {
                publicClient: publicClient!,
                walletClient: walletClient!
              },
              tokensAtom: [tokens, setTokens]
            })}
          chainId={asset.chainId!}
          disabled={claimableAssets === 0 || !selectedToken}
        />
      </div>
    </div>
  )

  {/* <div className="bg-customNeutral200 p-6 rounded-lg mt-4">
      <p className="text-white font-bold text-xl mb-4">Claimable Withdrawals</p>
      <InputTokenWithError
        captionText={"Asset Amount"}
        onSelectToken={() => { }}
        onMaxClick={() => { }}
        chainId={1}
        value={1000}
        onChange={() => { }}
        selectedToken={asset}
        errorMessage={""}
        tokenList={[]}
        allowSelection={false}
        allowInput={false}
        disabled={false}
      />
      <div className="relative pt-3">
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
        captionText={"Withdrawal Amount"}
        onSelectToken={() => { }}
        onMaxClick={() => { }}
        chainId={1}
        value={1000}
        onChange={() => { }}
        selectedToken={undefined}
        errorMessage={""}
        tokenList={tokenOptions}
        allowSelection={true}
        allowInput={false}
        disabled={false}
      />
      <div className="mt-2">
        <MainButtonGroup
          label="Claim Withdrawal"
          mainAction={() => { }}
          chainId={1}
          disabled={false}
        />
      </div>
    </div> */}
}


function RequestedShares({ requestShares, vault, asset }: { requestShares: number, vault: Token, asset: Token }): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: asset.chainId });
  const { data: walletClient } = useWalletClient();
  const [tokens, setTokens] = useAtom(tokensAtom);
  const [vaultsData] = useAtom(vaultsAtom);

  return (
    <div className="bg-customNeutral200 p-6 rounded-lg mt-4">
      <p className="text-white font-bold text-xl mb-4">Requested Withdrawals</p>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Shares:</p>
        <span className="flex flex-row items-center">
          {requestShares / (10 ** vault.decimals)}
          <TokenIcon
            token={vault}
            icon={vault?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={1}
          />
          {vault.symbol}
        </span>
      </span>
      <span className="text-white text-lg flex flex-row items-center justify-between">
        <p>Assets:</p>
        <span className="flex flex-row items-center">
          ~ {formatNumber(((requestShares / (10 ** vault.decimals)) * vault.price) / asset.price)}
          <TokenIcon
            token={asset}
            icon={asset?.logoURI}
            imageSize="w-5 h-5 mb-1 ml-2 mr-1"
            chainId={1}
          />
          {asset.symbol}
        </span>
      </span>
      <div className="mt-2">
        <SecondaryButtonGroup
          label="Cancel Request"
          mainAction={() =>
            vaultCancelWithdrawal({
              chainId: asset.chainId!,
              router: VaultRouterByChain[asset.chainId!],
              vaultData: vaultsData[asset.chainId!].find(vaultData => vaultData.address === vault.address)!,
              asset: asset,
              vault: vault,
              account: account!,
              amount: requestShares,
              clients: {
                publicClient: publicClient!,
                walletClient: walletClient!
              },
              tokensAtom: [tokens, setTokens]
            })}
          chainId={asset.chainId!}
          disabled={false}
        />
      </div>
    </div>
  )
}
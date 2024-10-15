import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import TokenIcon from "@/components/common/TokenIcon";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { handleAllowance } from "@/lib/approve";
import { tokensAtom } from "@/lib/atoms";
import { fundReward } from "@/lib/gauges/interactions";
import { getRewardData } from "@/lib/gauges/useGaugeRewardData";
import { Token } from "@/lib/types";
import { formatAndRoundNumber, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, formatUnits } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

export default function RewardsSection({ gauge, chainId }: { gauge: Address; chainId: number }) {
  const [tokens] = useAtom(tokensAtom);

  const [rewardData, setRewardData] = useState<any[]>([])

  useEffect(() => {
    getRewardData(gauge, chainId).then(res => setRewardData(res))
  }, [gauge])

  return (
    <>
      <table className="mb-8 [&_th]:px-6 [&_th]:h-12 [&_td]:px-6 [&_td]:h-12 w-full">
        <tr className="border-b">
          <th className="font-normal text-left !pl-0">Token</th>
          <th className="font-normal text-left">Rate</th>
          <th className="font-normal text-left">Remaining Rewards</th>
          <th className="font-normal text-left">Period Finish</th>
          <th className="font-normal text-left hidden lg:table-cell">
            Distributor
          </th>
          <th className="font-normal text-left hidden lg:table-cell">
            Fund Rewards
          </th>
        </tr>
        {rewardData.length > 0 ?
          rewardData?.map(reward =>
            <RewardColumn
              key={`reward-gauge-${reward.address}`}
              gauge={gauge}
              reward={reward}
              token={tokens[chainId][reward.address]}
              chainId={chainId}
            />
          )
          : <p>No rewards</p>
        }
      </table>
    </>
  );
}


function RewardColumn({ gauge, reward, token, chainId }: { gauge: Address, reward: any, token: Token, chainId: number }): JSX.Element {
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
    handleChangeInput({ currentTarget: { value: token.balance.formatted } });
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
      spender: gauge,
      amount: val,
      account: account,
      clients: {
        publicClient,
        walletClient
      }
    })
  }

  async function handleFundReward() {
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

    fundReward({
      gauge,
      rewardToken: token.address,
      amount: val,
      account,
      clients: {
        publicClient,
        walletClient
      },
      tokensAtom: [tokens, setTokens]
    })
  }

  return (
    <tr>
      <td className="!pl-0">
        <nav className="flex items-center gap-2">
          <TokenIcon
            imageSize="w-9 h-9 border border-customNeutral100 rounded-full"
            token={token}
            icon={token.logoURI}
            chainId={chainId}
          />
          <strong>${token?.symbol ?? "TKN"}</strong>
        </nav>
      </td>
      <td className="text-left">{formatAndRoundNumber(reward.rate, token.decimals)} {token?.symbol!}/s</td>
      <td className="text-left">{formatAndRoundNumber(reward.remainingRewards, token.decimals)} {token?.symbol!}</td>
      <td className="text-left">
        {reward.periodFinish.toLocaleDateString()}
      </td>
      <td className="text-left hidden lg:table-cell">
        {reward.distributor}
      </td>
      <td className="text-left hidden lg:table-cell">
        <div className="flex flex-row">
          <div>
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
          </div>
          <div className="ml-4">
            <SecondaryActionButton label="Approve" handleClick={handleApprove} disabled={!account || account !== reward.distributor} className="h-14" />
            <MainActionButton label="Fund Rewards" handleClick={handleFundReward} disabled={!account || account !== reward.distributor} className="h-14" />
          </div>
        </div>
      </td>
    </tr>
  )
}
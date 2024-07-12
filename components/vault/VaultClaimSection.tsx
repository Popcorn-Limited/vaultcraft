import { vaultsAtom } from "@/lib/atoms/vaults";
import { ClaimableReward, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Address, createPublicClient, erc20Abi, http, zeroAddress } from "viem";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import getGaugeRewards from "@/lib/gauges/getGaugeRewards";
import { claimOPop } from "@/lib/optionToken/interactions";
import { gaugeRewardsAtom, tokensAtom } from "@/lib/atoms";
import { MinterByChain, OptionTokenByChain, VCX, } from "@/lib/constants";
import { ChainById, RPC_URLS } from "@/lib/utils/connectors";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { claimRewards } from "@/lib/gauges/interactions";
import LargeCardStat from "../common/LargeCardStat";
import MainActionButton from "../button/MainActionButton";
import { getClaimableRewards } from "@/lib/gauges/useGaugeRewardData";
import ResponsiveTooltip from "../common/Tooltip";

export default function VaultClaimSection({ vaultData }: { vaultData: VaultData }) {
  const { switchChainAsync } = useSwitchChain();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [tokens, setTokens] = useAtom(tokensAtom)
  const [vaults] = useAtom(vaultsAtom);

  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>([])

  const [gaugeRewards, setGaugeRewards] = useAtom(gaugeRewardsAtom);

  const [oBal, setOBal] = useState<number>(0)

  useEffect(() => {
    async function getOToken() {
      const client = createPublicClient({
        chain: ChainById[vaultData?.chainId!],
        transport: http(RPC_URLS[vaultData?.chainId!]),
      })
      const newOBal = client.readContract({
        address: OptionTokenByChain[vaultData?.chainId!],
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account!]
      })
      setOBal(Number(newOBal) / 1e18)

      if (vaultData.gauge && vaultData.gauge !== zeroAddress) {
        const newClaimableReward = await getClaimableRewards({
          gauge: vaultData.gauge,
          account: account!,
          tokens: tokens[vaultData.chainId],
          chainId: vaultData.chainId
        })
        setClaimableRewards(newClaimableReward)
      }
    }
    if (account && vaultData) getOToken()
  }, [account])


  async function handleClaimRewards() {
    if (!vaultData || !account) return

    if (chain?.id !== vaultData?.chainId) {
      try {
        await switchChainAsync?.({ chainId: vaultData?.chainId });
      } catch (error) {
        return;
      }
    }

    const success = await claimRewards({
      gauge: vaultData.gauge!,
      account: account,
      clients: { publicClient: publicClient!, walletClient: walletClient! }
    })

    if (success) {
      await mutateTokenBalance({
        tokensToUpdate: claimableRewards.map(reward => reward.token.address),
        account,
        tokensAtom: [tokens, setTokens],
        chainId: vaultData?.chainId
      })
      setClaimableRewards([])
    }
  }

  async function handleClaim() {
    if (!vaultData || !account) return

    if (chain?.id !== vaultData?.chainId) {
      try {
        await switchChainAsync?.({ chainId: vaultData?.chainId });
      } catch (error) {
        return;
      }
    }

    const success = await claimOPop({
      gauges: [vaultData.gauge || zeroAddress],
      chainId: vaultData.chainId!,
      account: account as Address,
      minter: MinterByChain[vaultData?.chainId],
      clients: { publicClient: publicClient!, walletClient: walletClient! }
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
          gauges: vaults[vaultData?.chainId].filter(vault => vault.gauge && vault.gauge !== zeroAddress).map(vault => vault.gauge) as Address[],
          account: account,
          chainId: vaultData?.chainId,
          publicClient: publicClient!
        })
      })
    }
  }

  return (
    <>
      <div className="w-full flex flex-row md:gap-6 md:w-fit md:pl-12">
        <div className="w-full flex flex-wrap md:gap-x-4">
          <div className="w-1/2 md:w-max">
            <LargeCardStat
              id={"my-ovcx"}
              label="My oVCX"
              value={`$${oBal && tokens[1][VCX] ? NumberFormatter.format(oBal * (tokens[1][VCX].price * 0.25)) : "0"}`}
              tooltip="Value of oVCX held in your wallet across all blockchains."
            />
          </div>

          <div className="w-1/2 md:w-max">
            <LargeCardStat
              id={"claimable-ovcx"}
              label="Claimable oVCX"
              value={`$${gaugeRewards && tokens[1][VCX]
                ? NumberFormatter.format((Number(gaugeRewards?.[vaultData.chainId]?.total || 0) / 1e18) * (tokens[1][VCX].price * 0.25))
                : "0"}`}
              tooltip="Cumulative value of claimable oVCX from vaults across all blockchains."
            />
          </div>
          {claimableRewards.length > 0 &&
            <div className="w-1/2 md:w-max">
              <LargeCardStat
                id={"claimable-rewards"}
                label="Claimable Rewards"
                value={`$${NumberFormatter.format(claimableRewards.reduce((a, b) => a + b.value, 0))}`}
                tooltipChild={
                  <div className="w-42">
                    <p className="font-bold">Claimable Rewards</p>
                    {claimableRewards
                      .filter(reward => reward.value > 0.1)
                      .map(reward =>
                        <p key={reward.token.address}>{NumberFormatter.format(reward.amount)} {reward.token.symbol} | ${NumberFormatter.format(reward.value)}</p>
                      )}
                  </div>
                }
              />
            </div>
          }
        </div>

        <div className="hidden md:block md:mt-auto w-52 mb-8 space-y-2">
          <MainActionButton
            label="Claim oVCX"
            handleClick={handleClaim}
            disabled={!gaugeRewards || gaugeRewards?.[vaultData.chainId]?.total < 0}
          />
          {claimableRewards.length > 0 &&
            <SecondaryActionButton
              label="Claim Rewards"
              handleClick={handleClaimRewards}
              disabled={!account}
            />
          }
        </div>
      </div>
      <div className="md:hidden">
        <MainActionButton
          label="Claim oVCX"
          handleClick={handleClaim}
          disabled={!gaugeRewards || gaugeRewards?.[vaultData.chainId]?.total < 0}
        />
      </div>
    </>
  )
}
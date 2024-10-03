import { vaultsAtom } from "@/lib/atoms/vaults";
import { ClaimableReward, VaultData } from "@/lib/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { Address, zeroAddress } from "viem";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import getGaugeRewards from "@/lib/gauges/getGaugeRewards";
import { claimOPop } from "@/lib/optionToken/interactions";
import { gaugeRewardsAtom, tokensAtom } from "@/lib/atoms";
import { MinterByChain, OptionTokenByChain, RewardsClaimerByChain, VCX, WrappedOptionTokenByChain } from "@/lib/constants";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { claimRewards } from "@/lib/gauges/interactions";
import LargeCardStat from "../common/LargeCardStat";
import MainActionButton from "../button/MainActionButton";
import { getClaimableRewards } from "@/lib/gauges/useGaugeRewardData";
import { handleAllowance } from "@/lib/approve";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { handleSwitchChain } from "@/lib/utils/helpers";

export default function VaultClaimSection({ vaultData }: { vaultData: VaultData }) {
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [tokens, setTokens] = useAtom(tokensAtom);
  const [vaults] = useAtom(vaultsAtom);

  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>(
    []
  );
  const [gaugeRewards, setGaugeRewards] = useAtom(gaugeRewardsAtom);
  const rewardValue = claimableRewards.reduce((a, b) => a + b.value, 0) || 0;

  useEffect(() => {
    async function getOToken() {
      if (vaultData.gauge && vaultData.gauge !== zeroAddress) {
        const newClaimableReward = await getClaimableRewards({
          gauge: vaultData.gauge,
          account: account!,
          tokens: tokens[vaultData.chainId],
          chainId: vaultData.chainId,
        });
        setClaimableRewards(newClaimableReward);
      }
    }
    if (account && vaultData) getOToken();
  }, [account]);

  async function handleClaimRewards() {
    if (!vaultData || !account) return;

    if (chain?.id !== vaultData?.chainId) {
      try {
        await switchChainAsync?.({ chainId: vaultData?.chainId });
      } catch (error) {
        return;
      }
    }

    const clients = {
      publicClient: publicClient!,
      walletClient: walletClient!,
    }

    let success;
    const wrappedTokenReward = claimableRewards.find(reward => reward.token.address === WrappedOptionTokenByChain[vaultData?.chainId])
    if (wrappedTokenReward && wrappedTokenReward.amount > 0) {
      success = await handleAllowance({
        token: wrappedTokenReward.token.address,
        amount: wrappedTokenReward.amount,
        account: account,
        spender: RewardsClaimerByChain[vaultData?.chainId],
        clients
      });
    }

    success = await claimRewards({
      gauge: vaultData.gauge!,
      account: account,
      clients,
      chainId: vaultData?.chainId
    })

    if (success) {
      await mutateTokenBalance({
        tokensToUpdate: claimableRewards.map((reward) => reward.token.address),
        account,
        tokensAtom: [tokens, setTokens],
        chainId: vaultData?.chainId,
      });
      setClaimableRewards([]);
    }
  }

  async function handleClaim() {
    if (!vaultData || !account) return;

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
        chainId: vaultData?.chainId,
      });
      setGaugeRewards({
        ...gaugeRewards,
        [vaultData?.chainId]: await getGaugeRewards({
          gauges: vaults[vaultData?.chainId]
            .filter((vault) => vault.gauge && vault.gauge !== zeroAddress)
            .map((vault) => vault.gauge) as Address[],
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
              id={"claimable-ovcx"}
              label="Claimable oVCX"
              value={`$${gaugeRewards && tokens[1][VCX]
                ? NumberFormatter.format(
                  (Number(gaugeRewards?.[vaultData.chainId]?.total || 0) /
                    1e18) *
                  (tokens[1][VCX].price * 0.25)
                )
                : "0"
                }`}
              tooltip="Cumulative value of claimable oVCX from vaults across all blockchains."
            />
          </div>
          {claimableRewards.length > 0 && rewardValue > 0.1 ? (
            <div className="w-1/2 md:w-max">
              <LargeCardStat
                id={"claimable-rewards"}
                label="Claimable Rewards"
                value={`$${NumberFormatter.format(rewardValue)}`}
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
          )
            : <></>
          }
        </div>

        <div className="hidden md:block md:mt-auto w-52 mb-8 space-y-2">
          {!account &&
            <MainActionButton
              label={"Connect Wallet"}
              handleClick={openConnectModal}
            />
          }
          {(account && chain?.id !== Number(vaultData.chainId)) &&
            <MainActionButton
              label="Switch Chain"
              handleClick={() => handleSwitchChain(vaultData.chainId, switchChainAsync)}
            />
          }
          {(account && chain?.id === Number(vaultData.chainId)) &&
            <>
              <MainActionButton
                label="Claim oVCX"
                handleClick={handleClaim}
                disabled={
                  !gaugeRewards || gaugeRewards?.[vaultData.chainId]?.total < 0
                }
              />
              {claimableRewards.length > 0 && rewardValue > 0.1 && (
                <SecondaryActionButton
                  label="Claim Rewards"
                  handleClick={handleClaimRewards}
                  disabled={!account}
                />
              )}
            </>}
        </div>
      </div>
      <div className="md:hidden pt-8">
        {!account &&
          <MainActionButton
            label={"Connect Wallet"}
            handleClick={openConnectModal}
          />
        }
        {(account && chain?.id !== Number(vaultData.chainId)) &&
          <MainActionButton
            label="Switch Chain"
            handleClick={() => handleSwitchChain(vaultData.chainId, switchChainAsync)}
          />
        }
        {(account && chain?.id === Number(vaultData.chainId)) &&
          <>
            <MainActionButton
              label="Claim oVCX"
              handleClick={handleClaim}
              disabled={
                !gaugeRewards || gaugeRewards?.[vaultData.chainId]?.total < 0
              }
            />
            <SecondaryActionButton
              label="Claim Rewards"
              handleClick={handleClaimRewards}
              disabled={!account || claimableRewards.length === 0 || rewardValue <= 0.1}
            />
          </>
        }
      </div>
    </>
  );
}

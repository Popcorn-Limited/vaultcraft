import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { claimOPop } from "@/lib/optionToken/interactions";
import { Address, zeroAddress } from "viem";
import { MinterByChain, OptionTokenByChain, VCX } from "@/lib/constants";
import { useAtom } from "jotai";
import { gaugeRewardsAtom, tokensAtom } from "@/lib/atoms";
import mutateTokenBalance from "@/lib/vault/mutateTokenBalance";
import getGaugeRewards from "@/lib/gauges/getGaugeRewards";
import { vaultsAtom } from "@/lib/atoms/vaults";
import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { handleSwitchChain } from "@/lib/utils/helpers";

interface OptionTokenInterfaceProps {
  setShowOptionTokenModal?: Dispatch<SetStateAction<boolean>>;
}

export default function OptionTokenInterface({ setShowOptionTokenModal }: OptionTokenInterfaceProps): JSX.Element {
  const { switchChainAsync } = useSwitchChain();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [tokens, setTokens] = useAtom(tokensAtom)
  const [vaults, setVaults] = useAtom(vaultsAtom)
  const [gaugeRewards, setGaugeRewards] = useAtom(gaugeRewardsAtom);

  async function handleClaim(chainId: number) {
    if (chain?.id !== chainId) {
      try {
        await switchChainAsync?.({ chainId });
      } catch (error) {
        return;
      }
    }

    const success = await claimOPop({
      gauges: gaugeRewards[chainId].amounts
        ?.filter((gauge) => Number(gauge.amount) > 0)
        .map((gauge) => gauge.address) as Address[],
      chainId: chainId,
      account: account!,
      minter: MinterByChain[chainId],
      clients: { publicClient: publicClient!, walletClient: walletClient! }
    })

    if (success) {
      await mutateTokenBalance({
        tokensToUpdate: [OptionTokenByChain[chainId]],
        account: account!,
        tokensAtom: [tokens, setTokens],
        chainId
      })
      setGaugeRewards({
        ...gaugeRewards,
        [chainId]: await getGaugeRewards({
          gauges: vaults[chainId].filter(vault => vault.gauge && vault.gauge !== zeroAddress).map(vault => vault.gauge) as Address[],
          account: account!,
          chainId: chainId,
          publicClient: publicClient!
        })
      })
    }
  }

  return (
    <div className="w-full bg-transparent border border-customNeutral100 rounded-3xl p-8 text-white md:h-fit">
      <h3 className="text-2xl pb-6 border-b border-customNeutral100">oVCX</h3>
      <div className="space-y-6 mt-6">
        <span className="flex flex-row items-center justify-between ml-2">
          <div className="flex flex-row items-center">
            <div className="relative mb-0.5">
              <NetworkSticker chainId={1} size={1} />
              <TokenIcon
                token={tokens?.[1]?.[OptionTokenByChain[1]]}
                icon={"/images/tokens/claimableOVcx.svg"}
                chainId={1}
                imageSize={"w-8 h-8"}
              />
            </div>
            <p className="ml-2">Mainnet Claimable oVCX</p>
          </div>
          <p className="font-bold">
            {`$${(gaugeRewards && gaugeRewards[1] && tokens?.[1]?.[VCX]?.price > 0)
              ? NumberFormatter.format(
                (Number(gaugeRewards[1].total) / 1e18) * (tokens?.[1]?.[VCX]?.price * 0.25)
              )
              : "0"
              }`}
          </p>
        </span>
        <span className="flex flex-row items-center justify-between ml-2">
          <div className="flex flex-row items-center">
            <div className="relative mb-0.5">
              <NetworkSticker chainId={10} size={1} />
              <TokenIcon
                token={tokens?.[1]?.[OptionTokenByChain[1]]}
                icon={"/images/tokens/claimableOVcx.svg"}
                chainId={1}
                imageSize={"w-8 h-8"}
              />
            </div>
            <p className="ml-2">Optimism Claimable oVCX</p>
          </div>
          <p className="font-bold">
            {`$${(gaugeRewards && gaugeRewards[10] && tokens?.[1]?.[VCX]?.price > 0)
              ? NumberFormatter.format(
                (Number(gaugeRewards[10].total) / 1e18) * (tokens?.[1]?.[VCX]?.price * 0.25)
              )
              : "0"
              }`}
          </p>
        </span>
        <span className="flex flex-row items-center justify-between ml-2">
          <div className="flex flex-row items-center">
            <div className="relative mb-0.5">
              <NetworkSticker chainId={42161} size={1} />
              <TokenIcon
                token={tokens?.[1]?.[OptionTokenByChain[1]]}
                icon={"/images/tokens/claimableOVcx.svg"}
                chainId={1}
                imageSize={"w-8 h-8"}
              />
            </div>
            <p className="ml-2">Arbitrum Claimable oVCX</p>
          </div>
          <p className="font-bold">
            {`$${(gaugeRewards && gaugeRewards[42161] && tokens?.[1]?.[VCX]?.price > 0)
              ? NumberFormatter.format(
                (Number(gaugeRewards[42161].total) / 1e18) * (tokens?.[1]?.[VCX]?.price * 0.25)
              )
              : "0"
              }`}
          </p>
        </span>
        <span className="flex flex-row items-center justify-between ml-2">
          <div className="flex flex-row items-center">
            <div className="relative mb-0.5">
              <NetworkSticker chainId={1} size={1} />
              <TokenIcon
                token={tokens?.[1]?.[OptionTokenByChain[1]]}
                chainId={1}
                imageSize={"w-8 h-8"}
              />
            </div>
            <p className="ml-2">My oVCX</p>
          </div>
          <p className="font-bold">
            {`$${tokens[1][OptionTokenByChain[1]].balance && tokens?.[1]?.[VCX]?.price > 0
              ? NumberFormatter.format(
                (tokens[1][OptionTokenByChain[1]].balance / 1e18) * (tokens?.[1]?.[VCX]?.price * 0.25)
              )
              : "0"
              }`}
          </p>
        </span>
      </div>
      <span className="flex flex-row items-center justify-between pb-6 border-b border-customNeutral100"></span>

      <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6">
        {(gaugeRewards && Object.keys(gaugeRewards).length > 0) ?
          <>
            <div className="w-full md:w-60">
              {chain?.id === 1
                ? <MainActionButton
                  label="Claim ETH oVCX"
                  handleClick={() => handleClaim(1)}
                  disabled={!account || (gaugeRewards ? Number(gaugeRewards[1].total) === 0 : true)}
                />
                : <MainActionButton
                  label="Connect to Ethereum"
                  handleClick={() => handleSwitchChain(1, switchChainAsync)}
                />
              }
            </div>
            <div className="w-full md:w-60">
              {chain?.id === 10
                ? <MainActionButton
                  label="Claim OPT oVCX"
                  handleClick={() => handleClaim(10)}
                  disabled={!account || (gaugeRewards ? Number(gaugeRewards[10].total) === 0 : true)}
                />
                : <MainActionButton
                  label="Connect to Optimism"
                  handleClick={() => handleSwitchChain(10, switchChainAsync)}
                />
              }
            </div>
            <div className="w-full md:w-60">
              {chain?.id === 42161
                ? <MainActionButton
                  label="Claim ARB oVCX"
                  handleClick={() => handleClaim(42161)}
                  disabled={!account || (gaugeRewards ? Number(gaugeRewards[42161].total) === 0 : true)}
                />
                : <MainActionButton
                  label="Connect to Arbitrum"
                  handleClick={() => handleSwitchChain(42161, switchChainAsync)}
                />
              }
            </div>
          </>
          :
          <>
            <div className="w-full md:w-60">
              <MainActionButton
                label="Claim ETH oVCX"
                handleClick={() => { }}
                disabled={true}
              />
            </div>
            <div className="w-full md:w-60">
              <MainActionButton
                label="Claim OPT oVCX"
                handleClick={() => { }}
                disabled={true}
              />
            </div>
            <div className="w-full md:w-60">
              <MainActionButton
                label="Claim ARB oVCX"
                handleClick={() => { }}
                disabled={true}
              />
            </div>
          </>
        }
        {
          setShowOptionTokenModal && (
            <div className="w-full md:w-60">
              <SecondaryActionButton
                label="Exercise your oVCX"
                handleClick={() => setShowOptionTokenModal(true)}
              />
            </div>
          )}
      </div>
    </div>
  );
}

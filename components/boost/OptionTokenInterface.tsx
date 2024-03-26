import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Address,
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { claimOPop } from "@/lib/optionToken/interactions";
import { WalletClient } from "viem";
import { llama } from "@/lib/resolver/price/resolver";
import { MinterByChain, OptionTokenByChain, VCX } from "@/lib/constants";
import { useAtom } from "jotai";
import { gaugeRewardsAtom } from "@/lib/atoms";

interface OptionTokenInterfaceProps {
  setShowOptionTokenModal?: Dispatch<SetStateAction<boolean>>;
}

export default function OptionTokenInterface({ setShowOptionTokenModal }: OptionTokenInterfaceProps): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [gaugeRewards, setGaugeRewards] = useAtom(gaugeRewardsAtom);

  const { data: oBal } = useBalance({
    chainId: 1,
    address: account,
    token: OptionTokenByChain[1],
    watch: true,
  });

  const [vcxPrice, setVcxPrice] = useState<number>(0);

  useEffect(() => {
    llama({ address: VCX, chainId: 1 }).then((res: number) => setVcxPrice(res));
  }, []);



  return (
    <div className="w-full bg-transparent border border-[#353945] rounded-3xl p-8 text-primary md:h-fit">
      <h3 className="text-2xl pb-6 border-b border-[#353945]">oVCX</h3>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">Mainnet Claimable oVCX</p>
        <p className="font-bold">{`$${(gaugeRewards && gaugeRewards[1] && vcxPrice > 0)
          ? NumberFormatter.format(
            (Number(gaugeRewards[1].total) * (vcxPrice * 0.25)) / 1e18
          )
          : "0"
          }`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">Optimism Claimable oVCX</p>
        <p className="font-bold">{`$${(gaugeRewards && gaugeRewards[10] && vcxPrice > 0)
          ? NumberFormatter.format(
            (Number(gaugeRewards[10].total) * (vcxPrice * 0.25)) / 1e18
          )
          : "0"
          }`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">Arbitrum Claimable oVCX</p>
        <p className="font-bold">{`$${(gaugeRewards && gaugeRewards[42161] && vcxPrice > 0)
          ? NumberFormatter.format(
            (Number(gaugeRewards[42161].total) * (vcxPrice * 0.25)) / 1e18
          )
          : "0"
          }`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My oVCX</p>
        <p className="font-bold">{`$${oBal && vcxPrice > 0
          ? NumberFormatter.format(
            (Number(oBal?.value) * (vcxPrice * 0.25)) / 1e18
          )
          : "0"
          }`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6 pb-6 border-b border-[#353945]"></span>
      <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6">
        {(gaugeRewards && Object.keys(gaugeRewards).length > 0) &&
          <>
            <div className="w-full md:w-60">
              <MainActionButton
                label="Claim ETH oVCX"
                handleClick={() =>
                  claimOPop({
                    gauges: gaugeRewards[1].amounts
                      ?.filter((gauge) => Number(gauge.amount) > 0)
                      .map((gauge) => gauge.address) as Address[],
                    account: account as Address,
                    minter: MinterByChain[1],
                    clients: { publicClient, walletClient: walletClient as WalletClient }
                  })}
                disabled={gaugeRewards ? Number(gaugeRewards[1].total) === 0 : true}
              />
            </div>
            <div className="w-full md:w-60">
              <MainActionButton
                label="Claim OP oVCX"
                handleClick={() =>
                  claimOPop({
                    gauges: gaugeRewards[10].amounts
                      ?.filter((gauge) => Number(gauge.amount) > 0)
                      .map((gauge) => gauge.address) as Address[],
                    account: account as Address,
                    minter: MinterByChain[10],
                    clients: { publicClient, walletClient: walletClient as WalletClient }
                  })}
                disabled={gaugeRewards ? Number(gaugeRewards[10].total) === 0 : true}
              />
            </div>
            <div className="w-full md:w-60">
              <MainActionButton
                label="Claim ARB oVCX"
                handleClick={() =>
                  claimOPop({
                    gauges: gaugeRewards[42161].amounts
                      ?.filter((gauge) => Number(gauge.amount) > 0)
                      .map((gauge) => gauge.address) as Address[],
                    account: account as Address,
                    minter: MinterByChain[42161],
                    clients: { publicClient, walletClient: walletClient as WalletClient }
                  })}
                disabled={gaugeRewards ? Number(gaugeRewards[42161].total) === 0 : true}
              />
            </div>
          </>
        }
        {
          setShowOptionTokenModal && (
            <div className="w-full md:w-60">
              <SecondaryActionButton
                label="Exercise oVCX"
                handleClick={() => setShowOptionTokenModal(true)}
                disabled={oBal ? Number(oBal?.value) === 0 : true}
              />
            </div>
          )}
      </div>
    </div>
  );
}

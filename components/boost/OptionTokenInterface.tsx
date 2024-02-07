import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards"
import { getVeAddresses } from "@/lib/constants";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Address, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi"
import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import { claimOPop } from "@/lib/optionToken/interactions";
import { WalletClient } from "viem";
import { Token } from "@/lib/types";
import { llama } from "@/lib/resolver/price/resolver";

const {
  oVCX: OVCX,
  VCX,
  WETH,
  Minter: MINTER
} = getVeAddresses();

interface OptionTokenInterfaceProps {
  gauges: Token[];
  setShowOptionTokenModal: Dispatch<SetStateAction<boolean>>;
}

export default function OptionTokenInterface({ gauges, setShowOptionTokenModal }: OptionTokenInterfaceProps): JSX.Element {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const { data: vcxBal } = useBalance({ chainId: 1, address: account, token: VCX, watch: true })
  const { data: oBal } = useBalance({ chainId: 1, address: account, token: OVCX, watch: true })
  const { data: wethBal } = useBalance({ chainId: 1, address: account, token: WETH, watch: true })

  const [vcxPrice, setVcxPrice] = useState<number>(0)
  const [wethPrice, setWethPrice] = useState<number>(0)

  useEffect(() => {
    llama({ address: VCX, chainId: 1 }).then((res: number) => setVcxPrice(res))
    llama({ address: WETH, chainId: 1 }).then((res: number) => setWethPrice(res))
  }, [])

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>()

  useEffect(() => {
    async function getValues() {
      const rewards = await getGaugeRewards({
        gauges: gauges.map(gauge => gauge.address) as Address[],
        account: account as Address,
        chainId: 1,
        publicClient
      })
      setGaugeRewards(rewards)
    }
    if (account && gauges.length > 0) getValues()
  }, [gauges, account])

  return (
    <div className="w-full lg:w-1/2 bg-transparent border border-[#353945] rounded-3xl p-8 text-primary md:h-fit">
      <h3 className="text-2xl pb-6 border-b border-[#353945]">oVCX</h3>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">Claimable oVCX</p>
        <p className="font-bold">{`$${gaugeRewards && vcxPrice > 0 ? NumberFormatter.format(Number(gaugeRewards?.total) * (vcxPrice * 0.25) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My VCX</p>
        <p className="font-bold">{`$${vcxBal && vcxPrice > 0 ? NumberFormatter.format(Number(vcxBal?.value) * vcxPrice / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My oVCX</p>
        <p className="font-bold">{`$${oBal && vcxPrice > 0 ? NumberFormatter.format(Number(oBal?.value) * (vcxPrice * 0.25) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My WETH</p>
        <p className="font-bold">{`$${wethBal && wethPrice > 0 ? NumberFormatter.format(Number(wethBal?.value) * wethPrice / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6 pb-6 border-b border-[#353945]">
      </span>
      <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6">
        <div className="w-full md:w-60">
          <MainActionButton
            label="Claim oVCX"
            handleClick={() =>
              claimOPop({
                gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                account: account as Address,
                minter: MINTER,
                clients: { publicClient, walletClient: walletClient as WalletClient }
              })}
            disabled={gaugeRewards ? Number(gaugeRewards?.total) === 0 : true}
          />
        </div>
        <div className="w-full md:w-60">
          <SecondaryActionButton label="Exercise oVCX" handleClick={() => setShowOptionTokenModal(true)} disabled={oBal ? Number(oBal?.value) === 0 : true} />
        </div>
      </div>
    </div>
  )
}

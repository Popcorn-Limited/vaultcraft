import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards"
import getGauges from "@/lib/gauges/getGauges";
import { getVeAddresses } from "@/lib/utils/addresses";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Address, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi"
import MainActionButton from "../buttons/MainActionButton";
import SecondaryActionButton from "../buttons/SecondaryActionButton";
import { claimOPop } from "@/lib/oPop/interactions";
import { WalletClient } from "viem";

const {
  GaugeController: GAUGE_CONTROLLER,
  oPOP: OPOP,
  POP,
  WETH
} = getVeAddresses();

interface OPopInterfaceProps {
  setShowOPopModal: Dispatch<SetStateAction<boolean>>;
}

export default function OPopInterface({ setShowOPopModal }: OPopInterfaceProps): JSX.Element {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>()
  const { data: popBal } = useBalance({ chainId: 1, address: account, token: POP, watch: true })
  const { data: oBal } = useBalance({ chainId: 1, address: account, token: OPOP, watch: true })
  const { data: wethBal } = useBalance({ chainId: 1, address: account, token: WETH, watch: true })

  const [initalLoad, setInitalLoad] = useState<boolean>(false);

  useEffect(() => {
    async function getValues() {
      setInitalLoad(true)
      const gauges = await getGauges({ address: GAUGE_CONTROLLER, account: account, publicClient })

      const rewards = await getGaugeRewards({
        gauges: gauges.filter(gauge => gauge.chainId === 1).map(gauge => gauge.address) as Address[],
        account: account as Address,
        publicClient
      })
      setGaugeRewards(rewards)
    }
    if (account && !initalLoad) getValues()
  }, [account])

  return (
    <div className="w-full lg:w-1/2 bg-transparent border border-[#353945] rounded-3xl p-8 text-primary md:h-fit">
      <h3 className="text-2xl pb-6 border-b border-[#353945]">oPOP</h3>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">Claimable oPOP</p>
        <p className="font-bold">{`${gaugeRewards ? NumberFormatter.format(Number(gaugeRewards?.total) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My POP</p>
        <p className="font-bold">{`${popBal ? NumberFormatter.format(Number(popBal?.value) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My oPOP</p>
        <p className="font-bold">{`${oBal ? NumberFormatter.format(Number(oBal?.value) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">My WETH</p>
        <p className="font-bold">{`${oBal ? NumberFormatter.format(Number(wethBal?.value) / 1e18) : "0"}`}</p>
      </span>
      <span className="flex flex-row items-center justify-between mt-6 pb-6 border-b border-[#353945]">
      </span>
      <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6">
          <div className="lg:max-w-fit">
              <MainActionButton
                  label="Claim oPOP"
                  handleClick={() =>
                      claimOPop({
                          gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                          account: account as Address,
                          clients: { publicClient, walletClient: walletClient as WalletClient }
                      })}
                  disabled={gaugeRewards ? Number(gaugeRewards?.total) === 0 : true}
              />
          </div>
          <div className="ls:max-w-fit lg:w-60 h-12">
              <SecondaryActionButton label="Exercise oPOP" handleClick={() => setShowOPopModal(true)} disabled={oBal ? Number(oBal?.value) === 0 : true} />
          </div>
      </div>
    </div>
  )
}

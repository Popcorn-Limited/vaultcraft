import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import TabSelector from "@/components/common/TabSelector";
import MainActionButton from "@/components/button/MainActionButton";
import { WVCXByChain, XVCXByChain } from "@/lib/constants/addresses";
import { Token } from "@/lib/types";
import { tokensAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useAccount } from "wagmi";
import SecondaryActionButton from "../button/SecondaryActionButton";
import { useRouter } from "next/router";
import { NumberFormatter } from "@/lib/utils/helpers";

export default function BridgeModal({ show }: { show: [boolean, Dispatch<SetStateAction<boolean>>] }): JSX.Element {
  const { address: account } = useAccount();
  const router = useRouter();

  const [tokens] = useAtom(tokensAtom)

  const [xVCX, setXVCX] = useState<Token>()
  const [wVCX, setWVCX] = useState<Token>()

  const [activeTab, setActiveTab] = useState<string>("OP -> ETH")

  useEffect(() => {
    if (Object.keys(tokens).length > 0 && Object.keys(tokens[10]).length > 0) {
      setXVCX(tokens[10][XVCXByChain[10]])
      setWVCX(tokens[10][WVCXByChain[10]])
    }
  }, [account, tokens])

  function switchTab(newTab: string) {

    if (newTab === "OP -> ETH") {
      setXVCX(tokens[10][XVCXByChain[10]])
      setWVCX(tokens[10][WVCXByChain[10]])
    } else {
      setXVCX(tokens[42161][XVCXByChain[42161]])
      setWVCX(tokens[42161][WVCXByChain[42161]])
    }

    setActiveTab(newTab)
  }

  return (
    <Modal visibility={show} title={<h2 className="text-2xl font-bold">Bridge VCX</h2>}>
      <TabSelector
        className="mb-6"
        availableTabs={["OP -> ETH", "ARB -> ETH"]}
        activeTab={activeTab}
        setActiveTab={switchTab}
      />
      {
        Object.keys(tokens).length > 0 && xVCX?.address && wVCX?.address &&
        <>
          <div className="text-start ">
            <div className="mt-4 w-full bg-customNeutral300 bg-opacity-30 border border-customNeutral100 rounded-lg p-4">
              <h3 className="text-lg font-bold">wVCX</h3>
              <div className="flex flex-row gap-4">
                <p className="w-2/3">You have <b>{NumberFormatter.format(Number(wVCX.balance.formatted))} wVCX</b>. Bridge it via wormhole with unparalled security and speed. Tokens are on average transfered in under 30 minutes on Portal.</p>
                <div className="w-1/3 flex flex-row gap-4">
                  <MainActionButton
                    label="Bridge wVCX"
                    icon="/images/icons/wormhole.svg"
                    handleClick={() => router.push(activeTab === "OP -> ETH" ?
                      "https://portalbridge.com/?sourceChain=optimism&targetChain=ethereum&asset=0x43Ad2CFDDA3CEFf40d832eB9bc33eC3FACE86829"
                      : "https://portalbridge.com/?sourceChain=arbitrum&targetChain=ethereum&asset=0xFeae6470A79b7779888f4a64af315Ca997D6cF33")
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-customNeutral300 bg-opacity-30 border border-customNeutral100 rounded-lg p-4">
              <h3 className="text-lg font-bold">xVCX</h3>
              <div className="flex flex-row gap-4">
                <p className="w-2/3">You have <b>{NumberFormatter.format(Number(wVCX.balance.formatted))}</b> xVCX. xVCX is no longer actively used but you can still bridge it to ethereum and redeem it for VCX.</p>
                <div className="w-1/3 flex flex-row gap-4">
                  <SecondaryActionButton
                    label="Bridge xVCX"
                    handleClick={() => router.push(activeTab === "OP -> ETH" ?
                      "https://bridge.connext.network/VCX-from-optimism-to-ethereum?symbol=VCX"
                      : "https://bridge.connext.network/VCX-from-arbitrum-to-ethereum?symbol=VCX")}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      }
    </Modal >
  )
}
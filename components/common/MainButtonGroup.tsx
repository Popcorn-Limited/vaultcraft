import MainActionButton from "@/components/button/MainActionButton";
import { handleSwitchChain } from "@/lib/utils/helpers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";

export default function MainButtonGroup({ label, mainAction, chainId, disabled }: { label: string, mainAction: Function, chainId: number, disabled: boolean }) {
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  return (
    <>
      {!account &&
        <MainActionButton
          label={"Connect Wallet"}
          handleClick={openConnectModal}
        />
      }
      {
        (account && chain?.id !== chainId) &&
        <MainActionButton
          label="Switch Chain"
          handleClick={() => handleSwitchChain(chainId, switchChainAsync)}
        />
      }
      {
        (account && chain?.id === chainId) &&
        <MainActionButton
          label={label}
          handleClick={() => mainAction()}
          disabled={disabled}
        />
      }
    </>
  )
}
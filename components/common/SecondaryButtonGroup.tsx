import { handleSwitchChain } from "@/lib/utils/helpers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";

export default function SecondaryButtonGroup({ label, mainAction, chainId, disabled }: { label: string, mainAction: Function, chainId: number, disabled: boolean }) {
  const { address: account, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  return (
    <>
      {!account &&
        <SecondaryActionButton
          label={"Connect Wallet"}
          handleClick={openConnectModal}
        />
      }
      {
        (account && chain?.id !== chainId) &&
        <SecondaryActionButton
          label="Switch Chain"
          handleClick={() => handleSwitchChain(chainId, switchChainAsync)}
        />
      }
      {
        (account && chain?.id === chainId) &&
        <SecondaryActionButton
          label={label}
          handleClick={() => mainAction()}
          disabled={disabled}
        />
      }
    </>
  )
}
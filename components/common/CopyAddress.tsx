import { showSuccessToast } from "@/lib/toasts";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import CopyToClipboard from "react-copy-to-clipboard";
import { Address } from "viem";

export default function CopyAddress({ address, label }: { address: Address, label: string }): JSX.Element {
  return (
    <CopyToClipboard
      text={address}
      onCopy={() => showSuccessToast(`${label} address copied!`)}
    >
      <div className="flex flex-row items-center justify-between group/address cursor-pointer">
        <p className="font-bold group-hover/address:text-primaryYellow">
          {address.slice(0, 6)}...
          {address.slice(-4)}
        </p>
        <div className={`w-6 h-6`}>
          <Square2StackIcon className={`group-hover/address:text-primaryYellow`} />
        </div>
      </div>
    </CopyToClipboard>
  )
}
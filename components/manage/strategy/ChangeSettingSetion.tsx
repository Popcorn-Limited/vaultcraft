import Input from "@/components/input/Input";
import { PassThroughProps } from "./AnyToAnyV1DepositorSettings";
import MainButtonGroup from "@/components/common/MainButtonGroup";
import { useState } from "react";
import { changeFloat, changeSlippage, proposeFloat, proposeSlippage } from "@/lib/vault/management/strategyInteractions";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export default function ChangeSettingSection({ strategy, asset, yieldAsset, settings, chainId, id }: PassThroughProps & { id: "slippage" | "float" }) {
  const proposedKey = id === "slippage" ? "proposedSlippage" : "proposedFloat"
  const [value, setValue] = useState<number>(Number(settings[id]))

  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();

  function handlePropose() {
    if (id === "slippage") {
      proposeSlippage({
        slippage: value,
        address: strategy.address,
        account: account!,
        clients: {
          publicClient: publicClient!,
          walletClient: walletClient!
        }
      })
    } else {
      proposeFloat({
        float: value,
        address: strategy.address,
        account: account!,
        clients: {
          publicClient: publicClient!,
          walletClient: walletClient!
        }
      })
    }
  }

  function handleChange() {
    if (id === "slippage") {
      changeSlippage({
        address: strategy.address,
        account: account!,
        clients: {
          publicClient: publicClient!,
          walletClient: walletClient!
        }
      })
    } else {
      changeFloat({
        address: strategy.address,
        account: account!,
        clients: {
          publicClient: publicClient!,
          walletClient: walletClient!
        }
      })
    }
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="w-full">
        <p className="text-customGray500">
          Change the {id} for this strategy.
        </p>
        <div className="mb-8 mt-4">
          <p className="font-bold">Old {id[0].toUpperCase()}{id.slice(1)}</p>
          <p className="">
            {Number(settings[id]) / 10_000} % ({Number(settings[id])})
          </p>
        </div>
        {settings[proposedKey].time === BigInt(0) ?
          <>
            <div>
              <p className="font-bold text-start">New {id[0].toUpperCase()}{id.slice(1)}</p>
              <div className="w-80 flex flex-row items-center">
                <Input value={String(value)} onChange={(e) => setValue(Number(e.currentTarget.value))} />
                <p className="text-xl ml-2">= {value / 100} %</p>
              </div>
            </div>
            <div className="w-60 mt-4">
              <MainButtonGroup
                label={`Propose ${id[0].toUpperCase()}${id.slice(1)}`}
                mainAction={handlePropose}
                chainId={chainId}
                disabled={false}
              />
            </div>
          </>
          : <>
            <div className="mb-8 mt-4">
              <p className="font-bold">Proposed {id[0].toUpperCase()}{id.slice(1)}</p>
              <p className="">
                {Number(settings[proposedKey].value) / 10_000} % ({Number(settings[proposedKey].value)})
              </p>
            </div>
            <div className="mt-4">
              <p className="font-bold text-start">Set proposed change at:</p>
              <p className="text-white">{(new Date(Number(settings[proposedKey].time) * 1000)).toLocaleString()} UTC</p>
            </div>
            <div className="w-60 mt-4">
              <MainButtonGroup
                label={`Change ${id[0].toUpperCase()}${id.slice(1)}`}
                mainAction={handleChange}
                chainId={chainId}
                disabled={settings[proposedKey].time > settings.block.timestamp}
              />
            </div>
          </>
        }
      </div>
    </div>
  )
}
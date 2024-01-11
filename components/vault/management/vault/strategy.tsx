import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import ProtocolIcon from "@/components/common/ProtocolIcon";
import Modal from "@/components/modal/Modal";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { VaultData } from "@/lib/types";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import axios from "axios";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ProtocolName, YieldOptions } from "vaultcraft-sdk";

async function getStrategies(vaultData: VaultData, yieldOptions: YieldOptions) {
  const { data: strategyDescriptions } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/descriptions/strategies/${vaultData.chainId}.json`)
  return await Promise.all(Object.values(strategyDescriptions)
    .filter((strategy: any) => strategy.asset === vaultData.asset.address)
    .map(async (strategy: any) => {
      return {
        ...strategy,
        apy: (await yieldOptions.getApy({
          chainId: vaultData.chainId,
          protocol: strategy.resolver as ProtocolName,
          asset: vaultData.asset.address
        })).total
      }
    })
  )
}

export default function VaultStrategyConfiguration({ vaultData, settings }: { vaultData: VaultData, settings: any }): JSX.Element {
  const [yieldOptions] = useAtom(yieldOptionsAtom)
  const [show, setShow] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([])
  const [strategy, setStrategy] = useState<any>()

  useEffect(() => {
    if (vaultData && yieldOptions) {
      getStrategies(vaultData, yieldOptions).then(res => setStrategies(res))
    }
  }, [vaultData, yieldOptions])

  return (
    <>
      <Modal visibility={[show, setShow]} title={<h2 className="text-xl">Select Strategy</h2>}>
        <div className="text-start space-y-4">
          {strategies.map(strategy =>
            <div
              className="px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-500"
              onClick={() => {
                setStrategy(strategy)
                setShow(false)
              }}
            >
              <span className="flex flex-row items-center gap-x-4">
                <ProtocolIcon protocolName={strategy.name} />
                <p >
                  {`${NumberFormatter.format(roundToTwoDecimalPlaces(strategy.apy))} %`}
                </p>
              </span>
              <p>{strategy.description.split("** - ")[1]}</p>
            </div>
          )}
        </div>
      </Modal>
      <div className="flex flex-row justify-center">
        <div className="w-1/2">
          <p className="text-gray-500">
            Change the strategy used by this vault.
            The new strategy must use the same asset as the current.
            This process happens in two steps. First a new strategy must be proposed.
            Users now have three days to withdraw their funds if they dislike the change.
            After three days the change can be accepted.
            When accepting all funds from the old strategy will be withdrawn and deposited into the new strategy.
          </p>
          {Number(settings.proposedAdapterTime) > 0 ?
            <></>
            :
            <div className="mt-4">
              <h2 className="text-xl">Current Strategy</h2>
              <div className="mt-1 border border-gray-500 p-4 rounded-md">
                <span className="flex flex-row items-center gap-x-4 mb-2">
                  <ProtocolIcon protocolName={vaultData.metadata.optionalMetadata.protocol.name} />
                  <p >
                    {`${NumberFormatter.format(roundToTwoDecimalPlaces(vaultData.totalApy))} %`}
                  </p>
                </span>
                <p>{vaultData.metadata.optionalMetadata.protocol.description.split("** - ")[1]}</p>
              </div>
              {strategy && (
                <div className="mt-4">
                  <h2 className="text-xl">Proposed Strategy</h2>
                  <div className="mt-1 border border-gray-500 p-4 rounded-md">
                    <span className="flex flex-row items-center gap-x-4 mb-2">
                      <ProtocolIcon protocolName={strategy.name} />
                      <p >
                        {`${NumberFormatter.format(roundToTwoDecimalPlaces(strategy.apy))} %`}
                      </p>
                    </span>
                    <p>{strategy.description.split("** - ")[1]}</p>
                  </div>
                </div>
              )}
            </div>
          }
          <div className="flex flex-row items-center gap-x-4">
            <div className="w-60 mt-4">
              {Number(settings.proposedAdapterTime) > 0 ?
                <MainActionButton label="Accept new Strategy" handleClick={() => setShow(true)} />
                : <>
                  {strategy ?
                    <SecondaryActionButton label="Select new Strategy" handleClick={() => setShow(true)} />
                    : <MainActionButton label="Select new Strategy" handleClick={() => setShow(true)} />
                  }
                </>

              }
            </div>
            {(Number(settings.proposedAdapterTime) === 0 && strategy) &&
              <div className="w-60 mt-4">
                <MainActionButton label="Propose new Strategy" handleClick={() => setShow(true)} />
              </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}
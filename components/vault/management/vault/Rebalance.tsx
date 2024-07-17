import MainActionButton from "@/components/button/MainActionButton";
import { IconByProtocol } from "@/components/common/ProtocolIcon";
import TabSelector from "@/components/common/TabSelector";
import InputNumber from "@/components/input/InputNumber";
import { tokensAtom } from "@/lib/atoms";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { addStrategyData } from "@/lib/getTokenAndVaultsData";
import { Token, VaultAllocation, VaultData } from "@/lib/types";
import { validateInput } from "@/lib/utils/helpers";
import { allocateToStrategies, deallocateFromStrategies } from "@/lib/vault/management/interactions";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useBlockNumber, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";

export default function VaultRebalance({
  vaultData,
}: {
  vaultData: VaultData;
}): JSX.Element {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  const [yieldOptions] = useAtom(yieldOptionsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [asset, setAsset] = useState<Token>()

  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { data: float, refetch } = useBalance({
    chainId: vaultData.chainId,
    address: vaultData.address,
    token: vaultData.asset,
  });

  useEffect(() => { refetch() }, [blockNumber])

  const [activeTab, setActiveTab] = useState<string>("Deallocate")
  const [inputValues, setInputValues] = useState<string[]>(vaultData.strategies.map(s => "0"))

  useEffect(() => {
    setAsset(tokens[vaultData.chainId][vaultData.asset])
  }, [vaultData, tokens])

  function switchTab() {
    setInputValues(vaultData.strategies.map(s => "0"))

    if (activeTab === "Deallocate") {
      setActiveTab("Allocate")
    } else {
      setActiveTab("Deallocate")
    }
  }

  function handleChangeInput(value: string, i: number) {
    let newValue = validateInput(value).isValid ? value : "0";

    if (activeTab === "Deallocate") {
      // Cant deallocate more than the allocation of a strategy
      const formattedAllocation = vaultData.strategies[i].allocation / (10 ** asset!.decimals)
      if (Number(newValue) > formattedAllocation) {
        newValue = String(formattedAllocation)
      }
    } else {
      // Cant allocate more than float
      if (Number(newValue) > Number(float!.formatted)) {
        newValue = float!.formatted
      }
    }

    const newValues = [...inputValues]
    newValues[i] = newValue

    setInputValues(newValues);
  }

  async function handleMainAction() {
    if (inputValues.reduce((a, b) => Number(a) + Number(b), 0) === 0 || !asset || !vaultData || !account || !walletClient || !yieldOptions) return;

    if (chain?.id !== vaultData.chainId) {
      try {
        await switchChainAsync?.({ chainId: vaultData.chainId });
      } catch (error) {
        return;
      }
    }

    let allocations: VaultAllocation[] = []
    if (activeTab === "Deallocate") {
      allocations = inputValues.map((value, i) => {
        const amount = Number(value) >= (vaultData.strategies[i].allocation / (10 ** asset!.decimals))
          ? vaultData.strategies[i].allocation
          : (Number(value) * (10 ** asset!.decimals))
        return {
          index: BigInt(i),
          amount: BigInt(
            Number(amount).toLocaleString("fullwide", { useGrouping: false })
          )
        }
      }).filter(allocation => allocation.amount > BigInt(0))

      const success = await deallocateFromStrategies({
        allocations,
        address: vaultData.address,
        vaultData,
        account,
        clients: {
          publicClient: publicClient!,
          walletClient: walletClient!,
        }
      })

      if (success) {
        const updatedVault = await addStrategyData({ [vaultData.address]: vaultData }, vaultData.chainId, publicClient!)
        vaultData = updatedVault[vaultData.address]
      }
      return
    } else {
      allocations = inputValues.map((value, i) => {
        return {
          index: BigInt(i),
          amount: BigInt(
            (Number(value) * (10 ** asset!.decimals)).toLocaleString("fullwide", { useGrouping: false })
          )
        }
      }).filter(allocation => allocation.amount > BigInt(0))

      const success = await allocateToStrategies({
        allocations,
        address: vaultData.address,
        vaultData,
        account,
        clients: {
          publicClient: publicClient!,
          walletClient: walletClient!,
        }
      })

      if (success) {
        const updatedVault = await addStrategyData({ [vaultData.address]: vaultData }, vaultData.chainId, publicClient!)
        vaultData = updatedVault[vaultData.address]
      }
      return
    }

  }

  return (
    <>
      <div className="flex flex-row justify-center">
        <div className="w-full">
          <p className="text-customGray500 mb-12">
            To rebalance between strategies you need to free up funds first (Float) before you can allocate those.
            Deallocating and Allocating are two seperate transactions.
            Keep in mind that by dellocating or allocating funds you might be charged fees or slippage from the underlying protocols.
          </p>
          <TabSelector activeTab={activeTab} availableTabs={["Deallocate", "Allocate"]} setActiveTab={switchTab} />
          {(asset && float) ?
            <div className="mt-4">
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0">Strategy</th>
                    <th scope="col" className="px-3 py-3.5 text-left font-semibold">Allocation</th>
                    <th scope="col" className="px-3 py-3.5 text-left font-semibold">Change</th>
                    <th scope="col" className="px-3 py-3.5 text-left font-semibold">New Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultData.strategies.map(
                    (strategy, i) =>
                      <tr key={strategy.address}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium sm:pl-0">
                          <div className="w-max flex flex-row items-center">
                            <img
                              src={IconByProtocol[strategy.metadata.name] || "/images/tokens/vcx.svg"}
                              className={`h-5 w-5 mr-2  rounded-full border border-white`}
                            />
                            <h2 className="text-lg text-white">
                              {strategy.metadata.name}
                            </h2>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-500">
                          {strategy.allocation / (10 ** asset.decimals)} {asset.symbol}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-500">
                          <div className="mt-1 border border-customGray500 p-4 rounded-md">
                            <InputNumber
                              value={inputValues[i]}
                              onChange={(e) => handleChangeInput(e.currentTarget.value, i)}
                              type="text"
                            />
                          </div>
                        </td>


                        <td className="whitespace-nowrap px-3 py-4 text-gray-500">
                          {activeTab === "Deallocate"
                            ? (strategy.allocation / (10 ** asset.decimals)) - Number(inputValues[i])
                            : (strategy.allocation / (10 ** asset.decimals)) + Number(inputValues[i])
                          }
                          {" "}{asset.symbol}
                        </td>
                      </tr>
                  )}

                </tbody>
              </table>
              <div className="flex flex-row justify-center items-center space-x-4">
                <p className="text-lg mt-4">
                  Float: {float?.formatted}{" "}
                  {activeTab === "Deallocate"
                    ? <span className="text-green-500">+ {inputValues.reduce((a, b) => Number(a) + Number(b), 0)}</span>
                    : <span className="text-red-500">- {inputValues.reduce((a, b) => Number(a) + Number(b), 0)}</span>
                  }
                  {" "}{asset.symbol}
                </p>
                <div className="w-60 mt-4">
                  <MainActionButton
                    label={activeTab}
                    handleClick={handleMainAction}
                    disabled={inputValues.reduce((a, b) => Number(a) + Number(b), 0) === 0}
                  />
                </div>
              </div>
            </div>
            : <p className="text-white">Loading...</p>
          }
        </div>
      </div >
    </>
  );
}

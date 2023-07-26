import Modal from "@/components/Modal";
import MainActionButton from "@/components/buttons/MainActionButton";
import SecondaryActionButton from "@/components/buttons/SecondaryActionButton";
import Input from "@/components/inputs/Input";
import addProtocolAssets from "@/lib/addProtocolAssets";
import { useAdapters } from "@/lib/atoms";
import { networkLogos } from "@/lib/connectors";
import { resolveAdapterApy } from "@/lib/resolver/adapterApy/adapterApy";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Balance, getBalances } from "wido";

interface NetworkStickerProps {
  chainId?: number;
}

const NetworkSticker: FC<NetworkStickerProps> = ({ chainId }) => {
  return (
    <div className="absolute top-0 -left-2 md:-left-4">
      <Image
        // @ts-ignore
        src={networkLogos[chainId]}
        alt={String(chainId)}
        height="24"
        width="24"
      />
    </div>
  );
};


async function getTokenApy(address: string, assetAddresses: any): Promise<{ key: string, apy: number } | null> {
  let protocols: string[] = []
  Object.keys(assetAddresses).forEach(key => assetAddresses[key].includes(address) && protocols.push(key))

  if (protocols.length === 0) return null

  const apys = await Promise.all(protocols.map(async (protocol) => {
    const apy = await resolveAdapterApy({ chainId: 1, address, resolver: protocol })
    return { key: protocol, apy: apy === Infinity ? 0 : apy }
  }))

  const highestApy = apys.sort((a, b) => b.apy - a.apy)[0]
  return highestApy.apy === 0 ? null : highestApy
}


interface BalanceWithApy extends Balance {
  apy: any | null
}

export default function Dashboard() {
  const { address: account } = useAccount()
  const [availableToken, setAvailableToken] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [availableAssetAddresses, setAvailableAssetsAddresses] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

  const adapters = useAdapters();

  useEffect(() => {
    async function setUp() {
      const adr = await addProtocolAssets(adapters.filter(adapter => adapter.chains.includes(1)), 1)
      setAvailableAssetsAddresses(adr)
    }

    if (Object.keys(availableAssetAddresses).length === 0) {
      setUp()
    }
  }, []);

  useEffect(() => {
    async function getAvailableToken() {
      let balances = await getBalances(
        account as string, // Address of the user 
        [1] // Optional Array of chain ids to filter by. //137, 56, 42161, 10
      );
      balances = balances.filter(balance => Number(balance.balanceUsdValue) > 1)

      const newBalances = await Promise.all(balances.map(async (balance) => await getTokenApy(balance.address, availableAssetAddresses)))
      newBalances.forEach((balance, index) => (balances[index] as BalanceWithApy).apy = balance)

      const tempTotal = balances.reduce((acc, balance) => acc + Number(balance.balanceUsdValue), 0)

      setTotal(tempTotal)

      setAvailableToken(balances.map(balance => {
        return {
          ...balance,
          allocation: 100 * Number(balance.balanceUsdValue) / tempTotal,
        }
      }))
    }

    if (account !== undefined && Object.keys(availableAssetAddresses).length > 0 && availableToken.length === 0) getAvailableToken();
  }, [account, availableAssetAddresses])

  return (
    <div className="text-white">
      <Modal show={showModal} setShowModal={setShowModal} >
        <>
          <h2 className="text-white text-2xl mb-8">
            Deposit
          </h2>
          <Input
            // onChange={(e) => handleChange((e.target as HTMLInputElement).value)}
            // defaultValue={formatUnits(limit)}
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={"0.0"}
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />
          <p className="text-gray-400 mt-1">Deposit to earn {selectedFarm?.apy?.toFixed(2)} % via {selectedFarm?.key[0].toUpperCase() + selectedFarm?.key?.slice(1)}</p>

          <div className="flex flex-row items-center mt-8 space-x-8">
            <SecondaryActionButton label="Cancel" handleClick={() => setShowModal(false)} />
            <MainActionButton label="Deposit" handleClick={() => setShowModal(false)} />
          </div>
        </>
      </Modal>
      <div className="mb-8">
        <h1 className="text-5xl">Portfolio</h1>
        <p className="text-gray-400">
          Watch your portfolio and find <br />
          yield opportinitues for any of your assets
        </p>
      </div>
      <div className="w-full flex flex-row items-center mb-2">
        <div className="w-6/12 flex flex-row items-center">
          <h1 className="text-3xl">
            Assets
          </h1>
          <div className="flex flex-row items-center ml-2">
            <Image
              src={networkLogos[1]}
              alt={"1"}
              height="24"
              width="24"
            />
          </div>
        </div>
        <div className="w-3/12 flex flex-row justify-end">
          <div>
            <p className="font-medium text-xs md:text-lg">
              Allocation
            </p>
            <p className="text-tokenTextGray text-[10px] md:text-base">
              100 %
            </p>
          </div>
        </div>
        <div className="w-3/12 flex flex-row items-center">
          <div className="w-5/12"></div>
          <div className="w-7/12">
            <div>
              <p className="font-medium text-xs md:text-lg">
                Balance
              </p>
              <p className="text-tokenTextGray text-[10px] md:text-base">
                $ {total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {availableToken.sort((a, b) => Number(b.balanceUsdValue) - Number(a.balanceUsdValue)).map(token =>
          <div key={token.symbol} className="bg-gray-700 px-8 py-2 rounded-md">
            <div className="flex flex-row items-center justify-between">

              <div className="flex flex-row items-center w-4/12">
                <div className="flex flex-row items-center">
                  <div className="relative">
                    <NetworkSticker chainId={token.chainId} />
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      height="40"
                      width="40"
                    />
                  </div>

                  <div className="ml-4">
                    <p className="font-medium text-xs md:text-lg">
                      {token.name}
                    </p>
                    <p className="text-tokenTextGray text-[10px] md:text-base">
                      $ {token.usdPrice}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-2/12">
                {token.apy && token.apy.apy.toFixed(2) > 0 &&
                  <button
                    onClick={() => {
                      setSelectedFarm(token.apy)
                      setShowModal(true)
                    }}
                    className="bg-white text-black rounded-3xl px-3 py-2 hover:bg-[#DFFF1C]"
                  >
                    Earn {token.apy.apy.toFixed(2)} %
                  </button>
                }
              </div>

              <div className="w-3/12 flex flex-row items-center justify-end">
                <div>
                  <p className="font-medium text-xs md:text-lg">
                    {token.allocation.toFixed(2)} %
                  </p>
                </div>
              </div>

              <div className="w-3/12 flex flex-row items-center justify-end">
                <div className="w-6/12">
                  <p className="font-medium text-xs md:text-lg">
                    $ {token.balanceUsdValue}
                  </p>
                  <p className="text-tokenTextGray text-[10px] md:text-base">
                    {Number(Number(token.balance) / (10 ** token.decimals)).toFixed(2)} {token.symbol.slice(0, 10)}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
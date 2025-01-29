import LargeCardStat from "@/components/common/LargeCardStat";
import { IconByProtocol } from "@/components/common/ProtocolIcon";
import SpinningLogo from "@/components/common/SpinningLogo";
import TokenIcon from "@/components/common/TokenIcon";
import NetworkSticker from "@/components/network/NetworkSticker";
import { tokensAtom, vaultsAtom } from "@/lib/atoms";
import { Token, VaultData } from "@/lib/types";
import { formatBalance, NumberFormatter } from "@/lib/utils/helpers";
import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Kelp() {
  const router = useRouter()
  const [vaults] = useAtom(vaultsAtom)
  const [tokens] = useAtom(tokensAtom)
  const [wethVault, setWethVault] = useState<VaultData>()
  const [rsethVault, setRsethVault] = useState<VaultData>()
  const [weth, setWeth] = useState<Token>()
  const [rseth, setRseth] = useState<Token>()

  useEffect(() => {
    if (Object.keys(vaults).length > 0) {
      setWethVault(vaults[1].find(vault => vault.address === "0xcF9273BA04b875F94E4A9D8914bbD6b3C1f08EDb"))
      setRsethVault(vaults[1].find(vault => vault.address === "0x11eAA7a46afE1023f47040691071e174125366C8"))
      setWeth(tokens[1]["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"])
      setRseth(tokens[1]["0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7"])
    }
  }, [vaults])

  return wethVault && rsethVault && weth && rseth ? (
    <div className="text-white">
      <section className="md:flex md:flex-row items-top justify-between py-4 md:py-10 px-4 md:px-0 md:gap-4">
        <div className="w-full md:w-max">
          <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
            Grizzly Gains Vault
          </h1>
          <p className="text-customGray100 md:text-white md:opacity-80">
            Participate in Boyco and earn yield instantly on your WETH and rsETH.
          </p>
        </div>
      </section>
      <div className="lg:flex lg:flex-row gap-4 space-y-4 lg:space-y-0 mx-4 md:mx-0">
        <div className="lg:w-1/2 border border-customGray100/40 rounded-lg p-4 hover:bg-primaryGreen/10 hover:border-primaryGreen cursor-pointer"
          onClick={() => router.push(`/vaults/0xcF9273BA04b875F94E4A9D8914bbD6b3C1f08EDb?chainId=1`)}>
          <div className="p-4">
            <div className="sm:flex sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <div
                  className={`flex items-center gap-4 max-w-full flex-wrap sm:flex-nowrap flex-1`}
                >
                  <div className="relative">
                    <NetworkSticker chainId={wethVault.chainId} size={3} />
                    <TokenIcon
                      token={tokens[wethVault.chainId][wethVault.asset]}
                      icon={tokens[wethVault.chainId][wethVault.asset].logoURI}
                      chainId={wethVault.chainId}
                      imageSize={"w-10 h-10"}
                    />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-white mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}
                  >
                    Deposit WETH
                  </h2>
                </div>
                <div className="flex flex-row items-center space-x-4 mt-4">
                  {wethVault.points.map(point =>
                    <div
                      key={point.provider}
                      className="flex flex-col justify-center items-center"
                    >
                      <img
                        src={
                          point.provider
                            ? IconByProtocol[point.provider]
                            : "/images/tokens/vcx.svg"
                        }
                        className={`w-8 h-8 rounded-full border border-gray-400`}
                      />
                      <p className="text-white text-lg mt-2" >{point.multiplier === 0 ? "TBD" : `${point.multiplier}x`}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-1/3 flex flex-row space-x-8">
                <LargeCardStat
                  id={"tvl"}
                  label="TVL"
                  value={`$ ${wethVault.tvl < 1 ? "0" : NumberFormatter.format(wethVault.tvl)}`}
                  secondaryValue={
                    weth
                      ? `${NumberFormatter.format(Number(formatBalance(wethVault.totalAssets, weth.decimals)))} ${weth.symbol}`
                      : "0 TKN"
                  }
                  tooltip={`This Vault deploys its TVL $ ${wethVault.tvl < 1 ? "0" : NumberFormatter.format(wethVault.tvl)}
                      (${NumberFormatter.format(Number(formatBalance(wethVault.totalAssets, weth?.decimals || 0)))} ${weth?.symbol || "TKN"}) 
                      in $ ${wethVault.metadata.type.includes("safe-vault")
                      ? "?"
                      : NumberFormatter.format(wethVault.strategies.reduce((a, b) => a + b.apyData.apyHist[b.apyData.apyHist.length - 1].tvl, 0))} 
                      TVL of underlying protocols`}
                />
                <LargeCardStat
                  id={"vapy"}
                  label="vAPY"
                  value={`${NumberFormatter.format(wethVault.apyData.targetApy)} %`}
                  secondaryValue={`${NumberFormatter.format(wethVault.apyData.baseApy + wethVault.apyData.rewardApy)} %`}
                  tooltipChild={
                    <div className="w-40">
                      {wethVault.apyData.targetApy !== (wethVault.apyData.baseApy + wethVault.apyData.rewardApy) &&
                        <span className="w-full flex justify-between">
                          <p className="font-bold text-lg">Target vAPY:</p>
                          <p className="font-bold text-lg">{NumberFormatter.format(wethVault.apyData.targetApy)} %</p>
                        </span>
                      }
                      <span className="w-full flex justify-between">
                        <p className="font-bold text-lg">Total vAPY:</p>
                        <p className="font-bold text-lg">{NumberFormatter.format(wethVault.apyData.baseApy + wethVault.apyData.rewardApy)} %</p>
                      </span>
                      <span className="w-full flex justify-between">
                        <p className="">Base vAPY:</p>
                        <p className="">{NumberFormatter.format(wethVault.apyData.baseApy)} %</p>
                      </span>
                      {wethVault.apyData.rewardApy && wethVault.apyData.rewardApy > 0
                        ? <span className="w-full flex justify-between">
                          <p className="">Reward vAPY:</p>
                          <p className="">{NumberFormatter.format(wethVault.apyData.rewardApy)} %</p>
                        </span>
                        : <></>
                      }
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 border border-customGray100/40 rounded-lg p-4 hover:bg-primaryGreen/10 hover:border-primaryGreen cursor-pointer"
          onClick={() => router.push(`/vaults/0xB64D29F6AB71A11e55953a6EE030A92E6ACB8814?chainId=1`)}>
          <div className="p-4">
          <div className="sm:flex sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
                <div
                  className={`flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1`}
                >
                  <div className="relative">
                    <NetworkSticker chainId={rsethVault.chainId} size={3} />
                    <TokenIcon
                      token={tokens[rsethVault.chainId][rsethVault.asset]}
                      icon={
                        tokens[rsethVault.chainId][rsethVault.address].logoURI === "https://app.vaultcraft.io/images/tokens/vcx.svg"
                          ? tokens[rsethVault.chainId][rsethVault.asset].logoURI
                          : tokens[rsethVault.chainId][rsethVault.address].logoURI
                      }
                      chainId={rsethVault.chainId}
                      imageSize={"w-10 h-10"}
                    />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-white mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}
                  >
                    Deposit rsETH
                  </h2>
                </div>
                <div className="flex flex-row items-center space-x-4 mt-4">
                  {rsethVault.points.map(point =>
                    <div
                      key={point.provider}
                      className="flex flex-col justify-center items-center"
                    >
                      <img
                        src={
                          point.provider
                            ? IconByProtocol[point.provider]
                            : "/images/tokens/vcx.svg"
                        }
                        className={`w-8 h-8 rounded-full border border-gray-400`}
                      />
                      <p className="text-white text-lg mt-2" >{point.multiplier === 0 ? "TBD" : `${point.multiplier}x`}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-1/3 flex flex-row space-x-8">
                <LargeCardStat
                  id={"tvl"}
                  label="TVL"
                  value={`$ ${rsethVault.tvl < 1 ? "0" : NumberFormatter.format(rsethVault.tvl)}`}
                  secondaryValue={
                    rseth
                      ? `${NumberFormatter.format(Number(formatBalance(rsethVault.totalAssets, rseth.decimals)))} ${rseth.symbol}`
                      : "0 TKN"
                  }
                  tooltip={`This Vault deploys its TVL $ ${rsethVault.tvl < 1 ? "0" : NumberFormatter.format(rsethVault.tvl)}
                      (${NumberFormatter.format(Number(formatBalance(rsethVault.totalAssets, rseth?.decimals || 0)))} ${rseth?.symbol || "TKN"}) 
                      in $ ${rsethVault.metadata.type.includes("safe-vault")
                      ? "?"
                      : NumberFormatter.format(rsethVault.strategies.reduce((a, b) => a + b.apyData.apyHist[b.apyData.apyHist.length - 1].tvl, 0))} 
                      TVL of underlying protocols`}
                />
                <LargeCardStat
                  id={"vapy"}
                  label="vAPY"
                  value={`${NumberFormatter.format(rsethVault.apyData.targetApy)} %`}
                  secondaryValue={`${NumberFormatter.format(rsethVault.apyData.baseApy + rsethVault.apyData.rewardApy)} %`}
                  tooltipChild={
                    <div className="w-40">
                      {rsethVault.apyData.targetApy !== (rsethVault.apyData.baseApy + rsethVault.apyData.rewardApy) &&
                        <span className="w-full flex justify-between">
                          <p className="font-bold text-lg">Target vAPY:</p>
                          <p className="font-bold text-lg">{NumberFormatter.format(rsethVault.apyData.targetApy)} %</p>
                        </span>
                      }
                      <span className="w-full flex justify-between">
                        <p className="font-bold text-lg">Total vAPY:</p>
                        <p className="font-bold text-lg">{NumberFormatter.format(rsethVault.apyData.baseApy + rsethVault.apyData.rewardApy)} %</p>
                      </span>
                      <span className="w-full flex justify-between">
                        <p className="">Base vAPY:</p>
                        <p className="">{NumberFormatter.format(rsethVault.apyData.baseApy)} %</p>
                      </span>
                      {rsethVault.apyData.rewardApy && rsethVault.apyData.rewardApy > 0
                        ? <span className="w-full flex justify-between">
                          <p className="">Reward vAPY:</p>
                          <p className="">{NumberFormatter.format(rsethVault.apyData.rewardApy)} %</p>
                        </span>
                        : <></>
                      }
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
    : <SpinningLogo />
}

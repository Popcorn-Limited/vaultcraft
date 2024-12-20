import React, { useState } from "react";
import Product from "@/components/landing/Product";
import PopSmileyIcon from "@/components/svg/popcorn/PopSmileyIcon";
import SmileyIcon from "@/components/svg/popcorn/SmileyIcon";
import PopIcon from "@/components/svg/popcorn/PopIcon";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import InfoIconWithTooltip from "@/components/common/InfoIconWithTooltip";
import TokenIcon from "@/components/common/TokenIcon";
import { Token } from "@/lib/types";
import { useRouter } from "next/router";
import { isAddress } from "viem";
import CopyToClipboard from "react-copy-to-clipboard";
import { showErrorToast, showSuccessToast } from "@/lib/toasts";
import { useAccount } from "wagmi";

export default function Products(): JSX.Element {
  const router = useRouter();
  const { query } = router;
  const { address: account } = useAccount();

  return (
    <>
      <section className="py-12 md:py-10 mx-4 md:mx-0 h-max">
        <p className="text-2xl mb-6 text-white smmd:hidden"> Our products </p>
        <div className="flex flex-col gap-1 smmd:flex-wrap lg:flex-nowrap space-y-4 md:space-y-0 md:space-x-4 md:flex-row md:justify-between">
          <Product
            title={
              <div className="flex flex-row w-full justify-between items-end">
                <h2 className="text-white text-4xl md:text-6xl leading-none">
                  Smart <br className="hidden md:inline" />
                  Vaults
                </h2>
                <div className="mb-3 z-10">
                  <InfoIconWithTooltip
                    id="depositor-tooltip"
                    content={
                      <div className="w-60">
                        <p className="text-white font-bold mb-2">
                          Depositors Earn
                        </p>
                        <div className="space-y-2">
                          <p className="text-white">Vault APY</p>
                          <p className="text-white">Restaking APY</p>
                          <p className="text-white">LRT Points</p>
                          <div className="flex flex-row items-center justify-between">
                            <p className="text-white">oVCX Rewards</p>
                            <TokenIcon
                              token={{} as Token}
                              icon={"/images/tokens/oVcx.svg"}
                              chainId={1}
                              imageSize="w-6 h-6 mb-1 ml-1"
                            />
                          </div>
                          <div className="flex flex-row items-center justify-between">
                            <p className="text-white">Eigenlayer Points</p>
                            <TokenIcon
                              token={{} as Token}
                              icon={
                                "https://icons.llamao.fi/icons/protocols/eigenlayer?w=48&h=48"
                              }
                              chainId={1}
                              imageSize="w-6 h-6 mb-1 ml-1"
                            />
                          </div>
                          <div className="w-full flex flex-row items-center justify-between">
                            <p className="text-white">Deposit</p>
                            <div className="flex flex-row items-center">
                              <p className="text-white">25 XP</p>
                              <TokenIcon
                                token={{} as Token}
                                icon={"/images/tokens/XP.svg"}
                                chainId={1}
                                imageSize="w-6 h-6 mb-1 ml-1"
                              />
                            </div>
                          </div>
                          <div className="w-full flex flex-row items-center justify-between">
                            <p className="text-white">Create Vault</p>
                            <div className="flex flex-row items-center">
                              <p className="text-white">25 XP</p>
                              <TokenIcon
                                token={{} as Token}
                                icon={"/images/tokens/XP.svg"}
                                chainId={1}
                                imageSize="w-6 h-6 mb-1 ml-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            }
            customContent={
              <PopSmileyIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-secondaryFuchsia"
              />
            }
            description="Deposit and optimize your yield with automated, non-custodial DeFi strategies"
            route="vaults"
          />
          <Product
            title={
              <div className="flex flex-row w-full justify-between items-end">
                <h2 className="text-white text-4xl md:text-6xl leading-none">
                  Voting
                </h2>
                <div className="mb-3 z-10">
                  <InfoIconWithTooltip
                    id="boost-tooltip"
                    content={
                      <div className="w-60">
                        <p className="text-white font-bold mb-2">Earn XP</p>
                        <div className="space-y-2">
                          <div className="w-full flex flex-row items-center justify-between">
                            <p className="text-white">Buy VCX</p>
                            <div className="flex flex-row items-center">
                              <p className="text-white">25 XP</p>
                              <TokenIcon
                                token={{} as Token}
                                icon={"/images/tokens/XP.svg"}
                                chainId={1}
                                imageSize="w-6 h-6 mb-1 ml-1"
                              />
                            </div>
                          </div>
                          <div className="w-full flex flex-row items-center justify-between">
                            <p className="text-white">Hold VCX</p>
                            <div className="flex flex-row items-center">
                              <p className="text-white">Up to 1250 XP</p>
                              <TokenIcon
                                token={{} as Token}
                                icon={"/images/tokens/XP.svg"}
                                chainId={1}
                                imageSize="w-6 h-6 mb-1 ml-1"
                              />
                            </div>
                          </div>
                          <div className="w-full flex flex-row items-center justify-between">
                            <p className="text-white">Exercise oVCX</p>
                            <div className="flex flex-row items-center">
                              <p className="text-white">Up to 300 XP</p>
                              <TokenIcon
                                token={{} as Token}
                                icon={"/images/tokens/XP.svg"}
                                chainId={1}
                                imageSize="w-6 h-6 mb-1 ml-1"
                              />
                            </div>
                          </div>
                          <div className="w-full flex flex-row items-center justify-between">
                            <p className="text-white">Mint veVCX</p>
                            <div className="flex flex-row items-center">
                              <p className="text-white">200 XP</p>
                              <TokenIcon
                                token={{} as Token}
                                icon={"/images/tokens/XP.svg"}
                                chainId={1}
                                imageSize="w-6 h-6 mb-1 ml-1"
                              />
                            </div>
                          </div>
                          <div className="w-full flex flex-row items-center justify-between">
                            <p className="text-white">Exercise oVCX</p>
                            <div className="flex flex-row items-center">
                              <p className="text-white">Up to 300 XP</p>
                              <TokenIcon
                                token={{} as Token}
                                icon={"/images/tokens/XP.svg"}
                                chainId={1}
                                imageSize="w-6 h-6 mb-1 ml-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            }
            customContent={
              <SmileyIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-secondaryViolet"
              />
            }
            description="Lock your VCX LP token to earn additional perpetual call options on your Smart Vault deposits"
            stats={[]}
            route="boost"
          />
          <Product
            title={
              <div className="flex flex-row w-full justify-between items-end">
                <h2 className="text-white text-4xl md:text-6xl leading-none">
                  Stake <br className="hidden md:inline" />
                  VCX
                </h2>
              </div>
            }
            customContent={
              <PopIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-secondaryYellow"
              />
            }
            description="Stake VCX to earn up to 25% APY and 4x voting power"
            route="staking"
          />
          <div className="w-full lg:max-w-full min-h-[40rem] relative flex flex-col space-y-4">
            <Link
              href={
                !!query?.ref && isAddress(query.ref as string)
                  ? `vaultron?ref=${query.ref}`
                  : `vaultron`
              }
            >
              <div
                className="rounded w-full min-h-[12rem] bg-customNeutral300 border border-customNeutral100 border-opacity-75 hover:shadow-lg ease-in-out duration-250 hover:opacity-50 flex flex-col justify-start bg-cover"
                style={{
                  backgroundImage:
                    "url('https://resolve.mercle.xyz/ipfs/bafkreibn26tzshouo6ayr33uhwwqzxpp5h6zgzitzgxwhsacsuuxoo7fuq')",
                }}
              >
                <h2 className="text-white text-2xl leading-none mb-2 py-6 px-8">
                  Vaultron
                </h2>
              </div>
            </Link>
            <Link
              href={
                !!query?.ref && isAddress(query.ref as string)
                  ? `stats?ref=${query.ref}`
                  : `stats`
              }
              className="rounded w-full min-h-[9rem] relative flex flex-col bg-customNeutral300 border border-customNeutral100 border-opacity-75 smmd:items-center py-6 px-6 hover:shadow-lg ease-in-out duration-250 hover:bg-customNeutral200"
            >
              <div className="col-span-12 md:col-span-4 xs:self-start">
                <div className="relative flex flex-row">
                  <h2 className="text-white text-3xl leading-none mb-2">
                    VaultCraft Stats
                  </h2>
                </div>
                <p className="mt-2 text-white">
                  See all stats regarding VCX and VaultCraft
                </p>
              </div>
            </Link>
            <div
              className="rounded w-full min-h-[9rem] relative flex flex-col bg-customNeutral300 border border-customNeutral100 border-opacity-75 smmd:items-center
              py-6 px-6 hover:shadow-lg ease-in-out duration-250 hover:bg-customNeutral200"
            >
              <CopyToClipboard
                text={`https://app.vaultcraft.io/vaults?ref=${account}`}
                onCopy={() =>
                  account
                    ? showSuccessToast("Referal link copied!")
                    : showErrorToast("Connect your Wallet to copy referal link")
                }
              >
                <div className="col-span-12 md:col-span-4 xs:self-start">
                  <div className="relative flex flex-row">
                    <h2 className="text-white text-3xl leading-none mb-2">
                      Copy referral link
                    </h2>
                  </div>
                  <p className="mt-2 text-white">Invite people to VaultCraft</p>
                </div>
              </CopyToClipboard>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
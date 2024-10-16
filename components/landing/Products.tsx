import React, { useState } from "react";
import Product from "@/components/landing/Product";
import PopSmileyIcon from "@/components/svg/popcorn/PopSmileyIcon";
import SmileyIcon from "@/components/svg/popcorn/SmileyIcon";
import PopIcon from "@/components/svg/popcorn/PopIcon";
import { useAtom } from "jotai";
import Link from "next/link";
import { tvlAtom } from "@/lib/atoms";
import Modal from "@/components/modal/Modal";
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

  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Modal
        visibility={[showModal, setShowModal]}
        title="How to use VaultCraft"
      >
        <Tutorial />
      </Modal>
      <section className="py-12 md:py-10 mx-4 md:mx-0 h-max">
        <p className="text-2xl mb-6 text-white smmd:hidden"> Our products </p>
        <div className="flex flex-col gap-1 smmd:flex-wrap lg:flex-nowrap space-y-4 md:space-y-0 md:space-x-4 md:flex-row md:justify-between">
          <Product
            title={
              <div className="flex flex-row w-full justify-between items-end">
                <h2 className="text-white text-4xl md:text-6xl leading-none">
                  Instruction <br className="hidden md:inline" />
                  Manual
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
            description="Learn how to use VaultCraft and optimize your yield with our perpetual call options 🚀"
            route=""
            handleClick={() => setShowModal(true)}
          />
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
                  Boost <br className="hidden md:inline" />
                  Vaults
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

const TutorialImageByStep: { [key: number]: string } = {
  1: "/images/tutorial/desktop/1.png",
  2: "/images/tutorial/desktop/2.png",
  3: "/images/tutorial/desktop/3.png",
};

const TutorialTitleByStep: { [key: number]: string } = {
  1: "Deposit into a Smart Vault",
  2: "Get and Lock VCX-LP",
  3: "Vote on Gauges",
};

function Tutorial(): JSX.Element {
  const [step, setStep] = useState<number>(1);

  function handleStep(newStep: number) {
    if (newStep === 0) newStep = 3;
    if (newStep === 4) newStep = 1;
    setStep(newStep);
  }

  return (
    <div className="flex flex-row justify-between">
      <div className="text-start space-y-8 w-full lg:w-1/3 xl:w-1/2 lg:pr-8">
        <div className="">
          <h2 className="text-lg font-bold text-primaryYellow border-b border-customGray500 pb-2">
            Step 1
          </h2>
          <div className="flex flex-row justify-between">
            <ul className="list-inside list-disc mt-2 ml-4">
              <li>Deposit into Smart Vaults 🪙</li>
              <li>Borrow and deposit more ♻️</li>
              <li>Earn 10%+ base APY 🙂</li>
              <li>Earn 25%+ APY with perpetual call options (oVCX) 😏</li>
              <li>
                Mint Vaultron NFT to earn XP Points for future airdrops 🪂
              </li>
            </ul>
          </div>
          <img
            src={TutorialImageByStep[1]}
            className="rounded-md mt-4 md:w-2/3 lg:hidden"
          />
        </div>
        <div>
          <h2 className="text-lg font-bold text-primaryYellow border-b border-customGray500 pb-2">
            Step 2
          </h2>
          <div className="flex flex-row justify-between">
            <ul className="list-inside list-disc mt-2 ml-4">
              <li>Provide liquidity in the 80 VCX 20 WETH Balancer Pool 🤓</li>
              <li>
                Lock the VCX LP token on app.vaultcraft.io for voting power 🗳️
              </li>
              <li>Earn multiples on you oVCX 🚀</li>
            </ul>
          </div>
          <img
            src={TutorialImageByStep[2]}
            className="rounded-md mt-4 md:w-2/3 lg:hidden"
          />
        </div>
        <div>
          <h2 className="text-lg font-bold text-primaryYellow border-b border-customGray500 pb-2">
            Step 3
          </h2>
          <div className="flex flex-row justify-between">
            <ul className="list-inside list-disc mt-2 ml-4">
              <li>Claim your oVCX rewards 🫴 </li>
              <li>
                Exercise for VCX, and then you can either
                <ul className="list-inside list-disc ml-6">
                  <li>HODL 💎</li>
                  <li>
                    Provide more liquidity to earn higher multiples on oVCX 😝
                  </li>
                  <li>Arbitrage instantly for 25% ROI on Balancer 🤪</li>
                </ul>
              </li>
            </ul>
          </div>
          <img
            src={TutorialImageByStep[3]}
            className="rounded-md mt-4 md:w-2/3 lg:hidden"
          />
        </div>
      </div>
      <div className="hidden lg:block lg:w-2/3 h-fit rounded-md border border-customGray500 bg-customNeutral300 px-4 pb-16 pt-4">
        <div className="flex flex-row justify-between mb-2">
          <div className="flex flex-row items-end">
            <p className="mb-1 mr-2">{step}/3</p>
            <h2 className="text-3xl">{TutorialTitleByStep[step]}</h2>
          </div>
          <div className="w-1/5 flex flex-row justify-end items-center">
            <ChevronLeftIcon
              className="opacity-100 text-primaryYellow h-8 cursor-pointer hover:opacity-50"
              onClick={() => handleStep(step - 1)}
            />
            <ChevronRightIcon
              className="opacity-100 text-primaryYellow h-8 cursor-pointer hover:opacity-50"
              onClick={() => handleStep(step + 1)}
            />
          </div>
        </div>
        <img src={TutorialImageByStep[step]} className="rounded-md" />
      </div>
    </div>
  );
}

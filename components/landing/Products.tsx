import React, { useState } from "react";
import Product from "@/components/landing/Product";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import PopSmileyIcon from "@/components/svg/popcorn/PopSmileyIcon";
import SmileyIcon from "@/components/svg/popcorn/SmileyIcon";
import { useAtom } from "jotai";
import Link from "next/link";
import { tvlAtom } from "@/lib/atoms";
import Modal from "@/components/modal/Modal";
import RightArrowIcon from "../svg/RightArrowIcon";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Products(): JSX.Element {
  const [tvl] = useAtom(tvlAtom);
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <Modal
        visibility={[showModal, setShowModal]}
        title="How to use VaultCraft"
      >
        <Tutorial />
      </Modal>
      {/* @dev Product.tsx has `md:mx-2` so with `md:mx-6` that adds up to consistent mx-8*/}
      <section className="py-12 md:py-10 mx-4 md:mx-6">
        <p className="text-2xl mb-6 text-primary smmd:hidden"> Our products </p>
        <div className="flex flex-col gap-6 smmd:flex-wrap lg:flex-nowrap space-y-4 md:space-y-0 md:flex-row md:justify-between">
          <div
            className="group cursor-pointer border rounded w-full lg:max-w-full h-[600px] relative flex flex-col bg-[#141416] border-[#353945] border-opacity-75 smmd:items-center py-6 px-8 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:bg-[#23262f]"
            onClick={() => setShowModal(true)}
          >
            <div className="col-span-12 md:col-span-4 xs:self-start flex-1">
              <div className="relative flex flex-row">
                <h2 className="text-primary text-4xl md:text-[56px] leading-none mb-2">
                  Instruction Manual
                </h2>
              </div>
              <p className="mt-2 text-primary">Learn how to use VaultCraft and optimize your yield with our perpetual call options</p>
            </div>
          </div>

          <Product
            title={
              <>
                Smart <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={
              <PopSmileyIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-[#FFA0B4]"
              />
            }
            description="Deposit and optimize your yield with automated, non-custodial DeFi strategies"
            stats={[
              {
                label: "TVL",
                content: `$${NumberFormatter.format(tvl.vault)}`,
                infoIconProps: {
                  title: "Total Value Locked",
                  content: (
                    <p>
                      The total value of assets held <br /> by the underlying
                      smart contracts.
                    </p>
                  ),
                  id: "smart-vault-tvl",
                },
              },
            ]}
            route="vaults"
          />
          <Product
            title={
              <>
                Boost <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={
              <SmileyIcon
                size={"60"}
                color={"white"}
                className="group-hover:fill-[#C391FF]"
              />
            }
            description="Lock your VCX LP token to earn additional perpetual call options on your Smart Vault deposits"
            stats={[]}
            route="boost"
          />
          <div className="w-full lg:max-w-full h-[600px] relative flex flex-col space-y-4 md:mx-2">
            <Link href="vaultron">
              <div className="rounded w-full md:h-[200px] h-[300px] bg-[#141416] border border-[#353945] border-opacity-75 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:opacity-50 flex flex-col justify-start bg-cover"
                style={{ backgroundImage: "url('https://resolve.mercle.xyz/ipfs/bafkreibn26tzshouo6ayr33uhwwqzxpp5h6zgzitzgxwhsacsuuxoo7fuq')" }}
              >
                <h2 className="text-primary text-3xl leading-none mb-2 py-6 px-8">
                  Vaultron
                </h2>
              </div>
            </Link>
            <Link
              href="create-vault"
              className="rounded w-full relative flex flex-col bg-[#141416] border border-[#353945] border-opacity-75 smmd:items-center py-6 px-8 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:bg-[#23262f]"
            >
              <div className="col-span-12 md:col-span-4 xs:self-start flex-1">
                <div className="relative flex flex-row">
                  <h2 className="text-primary text-3xl leading-none mb-2">
                    Create Vaults
                  </h2>
                </div>
                <p className="mt-2 text-primary">Customize and deploy your own Smart Vault</p>
              </div>
            </Link>
            <Link
              href="stats"
              className="rounded w-full relative flex flex-col bg-[#141416] border border-[#353945] border-opacity-75 smmd:items-center py-6 px-8 md:mx-2 hover:shadow-lg ease-in-out duration-250 hover:bg-[#23262f]"
            >
              <div className="col-span-12 md:col-span-4 xs:self-start flex-1">
                <div className="relative flex flex-row">
                  <h2 className="text-primary text-3xl leading-none mb-2">
                    VaultCraft Stats
                  </h2>
                </div>
                <p className="mt-2 text-primary">See all stats regarding VCX and VaultCraft</p>
              </div>
            </Link>
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
}

const TutorialTitleByStep: { [key: number]: string } = {
  1: "Deposit into a Smart Vault",
  2: "Get and Lock VCX-LP",
  3: "Vote on Gauges",
}

function Tutorial(): JSX.Element {
  const [step, setStep] = useState<number>(1)

  function handleStep(newStep: number) {
    if (newStep === 0) newStep = 3
    if (newStep === 4) newStep = 1
    setStep(newStep)
  }

  return <div className="flex flex-row justify-between">
    <div className="text-start space-y-8 w-full xl:w-1/2 xl:pr-8">
      <div className="">
        <h2 className="text-lg font-bold text-[#DFFF1C] border-b border-gray-500 pb-2">Step 1</h2>
        <div className="flex flex-row justify-between">
          <ul className="list-inside list-disc mt-2 ml-4">
            <li>Deposit into Smart Vaults 🪙</li>
            <li>Borrow and deposit more ♻️</li>
            <li>Earn 10%+ base APY 🙂</li>
            <li>Earn 25%+ APY with perpetual call options (oVCX) 😏</li>
          </ul>
        </div>
        <img src={TutorialImageByStep[1]} className="rounded-md mt-4 lg:w-2/3 xl:hidden" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[#DFFF1C] border-b border-gray-500 pb-2">Step 2</h2>
        <div className="flex flex-row justify-between">
          <ul className="list-inside list-disc mt-2 ml-4">
            <li>Provide liquidity in the 80 VCX 20 WETH Balancer Pool 🤓</li>
            <li>Lock the VCX LP token on app.vaultcraft.io for voting power 🗳️</li>
            <li>Earn multiples on you oVCX 🚀</li>
          </ul>
        </div>
        <img src={TutorialImageByStep[2]} className="rounded-md mt-4 lg:w-2/3 xl:hidden" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[#DFFF1C] border-b border-gray-500 pb-2">Step 3</h2>
        <div className="flex flex-row justify-between">
          <ul className="list-inside list-disc mt-2 ml-4">
            <li>Claim your oVCX rewards 🫴 </li>
            <li>
              Exercise for VCX, and then you can either
              <ul className="list-inside list-disc ml-6">
                <li>HODL </li>
                <li>Provide more liquidity to earn higher multiples on oVCX 😝</li>
                <li>Arbitrage instantly for 25% ROI on Balancer 🤪</li>
              </ul>
            </li>
          </ul>
        </div>
        <img src={TutorialImageByStep[3]} className="rounded-md mt-4 lg:w-2/3 xl:hidden" />
      </div>
    </div>
    <div className="hidden xl:block xl:w-1/2 rounded-md border border-gray-500 bg-[#141416] px-4 pb-16 pt-4">
      <div className="flex flex-row justify-between mb-2">
        <div className="flex flex-row items-end">
          <p className="mb-1 mr-2">{step}/3</p>
          <h2 className="text-3xl">{TutorialTitleByStep[step]}</h2>
        </div>
        <div className="w-1/5 flex flex-row justify-end items-center">
          <ChevronLeftIcon className="opacity-100 text-[#DFFF1C] h-8 cursor-pointer hover:opacity-50" onClick={() => handleStep(step - 1)} />
          <ChevronRightIcon className="opacity-100 text-[#DFFF1C] h-8 cursor-pointer hover:opacity-50" onClick={() => handleStep(step + 1)} />
        </div>
      </div>
      <img src={TutorialImageByStep[step]} className="rounded-md" />
    </div>
  </div>
}
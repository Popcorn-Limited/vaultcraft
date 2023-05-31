import MainActionButton from "@/components/Buttons/MainActionButton";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-[#141416] w-full flex flex-col justify-center items-center mx-auto md:px-8 px-6">
      <div className="flex h-fit rounded-[20px] border-[#23262F] border-2 md:w-[600px] p-6 flex-col justify-start md:mt-20 mt-14">
        <img src="/images/icons/pinkCircles.svg" className="h-26 w-26 self-start mb-4" />
        <h1 className="text-[white] text-3xl mb-2">Ready to Create Your Vaultcraft?</h1>
        <p className="text-[white] weight-[400] mb-8">Create a vaultcraft vault and start managing your assets</p>

        <div className="w-full flex flex-row gap-x-4 items-center mb-2">
          <img src="/images/icons/tickIcon.svg" className="w-3 h-3" />
          <p className="text-[white]">Anyone can deposit</p>
        </div>

        <div className="w-full flex flex-row gap-x-4 items-center mb-2">
          <img src="/images/icons/tickIcon.svg" className="w-3 h-3" />
          <p className="text-[white]">No prior relationship required between you and your depositors
          </p>
        </div>

        <div className="w-full flex flex-row gap-x-4 items-center mb-2">
          <img src="/images/icons/tickIcon.svg" className="w-3 h-3" />
          <p className="text-[white]">Settings prioritise depositor protection over access to DeFi features
          </p>
        </div>

        <div className="w-full flex flex-row gap-x-4 items-center mb-9">
          <img src="/images/icons/tickIcon.svg" className="w-3 h-3" />
          <p className="text-[white]">Example: A Yearn- or Ribbon-like strategy
          </p>
        </div>

        <MainActionButton handleClick={() => router.push('/create/basics')} label="Create a vault" />

      </div>
    </div>
  )
}

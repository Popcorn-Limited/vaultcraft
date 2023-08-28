import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-[#141416] w-full flex flex-col justify-center items-center mx-auto md:px-8 px-6 text-white">
      <div className="flex h-fit w-full max-w-[500px] rounded-[20px] border-[#23262F] border-2 p-6 flex-col justify-start md:mt-20 mt-14">
        <h1 className="text-[32px]">Ready to Create Your Vault?</h1>
        <p className="text-[16px] mb-4 max-w-[400px]">Deploy an automated asset strategy in just a few clicks with VaultCraft</p>

        <div className={`flex flex-col gap-3 pt-4 pb-6 border-y-[1px] border-[#353945]`}>
          <button
            className={`
              p-4 border-[1px] border-[#353945] flex flex-col items-stretch gap-2 rounded-[12px]
              duration-[0.1s] hover:border-[#DFFF1C] hover:bg-[#23262F] group
            `}
            type="button"
            onClick={() => router.push('/easy/basics')}
          >
            <div className={`flex justify-between`}>
              <p className={`text-[24px] font-[500]`}>Easy mode</p>
              <img src="/images/icons/arrow-right-icon.svg" className={`w-6 h-6 group-hover:hidden`} />
              <img src="/images/icons/arrow-right-icon-green.svg" className={`w-6 h-6 hidden group-hover:block`} />
            </div>
            <p className={`text-left`}>
              Recommended for most user. Set up a vault in just a few clicks. We take care of the rest.
            </p>
          </button>

          <button
            className={`
              p-4 border-[1px] border-[#353945] flex flex-col items-stretch gap-2 rounded-[12px]
              duration-[0.1s] hover:border-[#DFFF1C] hover:bg-[#23262F] group
            `}
            type="button"
            onClick={() => router.push('/pro/basics')}
          >
            <div className={`flex justify-between`}>
              <p className={`text-[24px] font-[500]`}>Dev mode</p>
              <img src="/images/icons/arrow-right-icon.svg" className={`w-6 h-6 group-hover:hidden`} />
              <img src="/images/icons/arrow-right-icon-green.svg" className={`w-6 h-6 hidden group-hover:block`} />
            </div>
            <p className={`text-left`}>
              Users see all pre-configured settings and have complete control to change anything. Only recommended for experienced users.
            </p>
          </button>
        </div>

        <a className={`mt-6 p-4 border-[1px] border-[#353945] flex flex-col items-stretch gap-2 rounded-[12px] bg-[url(/images/guide-bg.png)] bg-cover group`} href="https://google.com">
          <div className={`flex justify-between`}>
            <p className={`text-[24px] font-[500]`}>Step by step guide</p>
            <img src="/images/icons/arrow-right-icon.svg" className={`w-6 h-6 group-hover:hidden`} />
            <img src="/images/icons/arrow-right-icon-green.svg" className={`w-6 h-6 hidden group-hover:block`} />
          </div>
          <p className={`text-left`}>
            How to create your vaults
          </p>
        </a>
      </div>
    </div>
  )
}

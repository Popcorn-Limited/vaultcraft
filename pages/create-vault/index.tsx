import { useRouter } from "next/router";

export default function CreateVault() {
  const router = useRouter();
  return (
    <div className="bg-customNeutral300 w-full flex flex-col justify-center items-center mx-auto md:px-8 px-6 text-white">
      <div className="flex h-fit w-full max-w-[500px] rounded-3xl border-customNeutral200 border-2 p-6 flex-col justify-start md:mt-20 mt-14">
        <h1 className="text-3xl">Ready to build your vault?</h1>
        <p className="text-base mb-4 max-w-[400px]">
          Deploy an automated asset strategy in just a few clicks with
          VaultCraft!
        </p>

        <div
          className={`flex flex-col gap-3 pt-4 pb-6 border-y border-customNeutral100`}
        >
          <button
            className={`
              p-4 border border-customNeutral100 flex flex-col items-stretch gap-2 rounded-xl
              duration-1 hover:border-primaryYellow hover:bg-customNeutral200 group
            `}
            type="button"
            onClick={() => router.push("create-vault/easy/basics")}
          >
            <div className={`flex justify-between`}>
              <p className={`text-2xl font-semibold`}>Easy mode</p>
              <img
                src="/images/icons/arrow-right-icon.svg"
                className={`w-6 h-6 group-hover:hidden`}
              />
              <img
                src="/images/icons/arrow-right-icon-green.svg"
                className={`w-6 h-6 hidden group-hover:block`}
              />
            </div>
            <p className={`text-left`}>
              Recommended for most users. Build a custom vault in minutes.
            </p>
          </button>

          <button
            className={`
              p-4 border border-customNeutral100 flex flex-col items-stretch gap-2 rounded-xl
              duration-100 hover:border-primaryYellow hover:bg-customNeutral200 group
            `}
            type="button"
            onClick={() => router.push("create-vault/pro/basics")}
          >
            <div className={`flex justify-between`}>
              <p className={`text-2xl font-semibold`}>Dev mode</p>
              <img
                src="/images/icons/arrow-right-icon.svg"
                className={`w-6 h-6 group-hover:hidden`}
              />
              <img
                src="/images/icons/arrow-right-icon-green.svg"
                className={`w-6 h-6 hidden group-hover:block`}
              />
            </div>
            <p className={`text-left`}>
              Users can view all pre-configured settings and have complete
              control to modify them as desired. Dev mode is recommended
              exclusively for experienced users.
            </p>
          </button>
        </div>

        <a
          className={`mt-6 p-4 border border-customNeutral100 flex flex-col items-stretch gap-2 rounded-xl bg-[url(/images/guide-bg.png)] bg-cover group`}
          href="https://www.youtube.com/watch?v=H4iDCa37LfQ"
        >
          <div className={`flex justify-between`}>
            <p className={`text-2xl font-semibold`}>How do I build a vault?</p>
            <img
              src="/images/icons/arrow-right-icon.svg"
              className={`w-6 h-6 group-hover:hidden`}
            />
            <img
              src="/images/icons/arrow-right-icon-green.svg"
              className={`w-6 h-6 hidden group-hover:block`}
            />
          </div>
          <p className={`text-left`}>Watch our tutorials.</p>
        </a>
      </div>
    </div>
  );
}

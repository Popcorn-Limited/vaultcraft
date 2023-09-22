import DesktopMenu from "@/components/navbar/DesktopMenu";

export default function Page({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      <div className="bg-[#141416] w-full min-h-screen">
        {/* <DesktopMenu /> */}
        <main className="max-w-screen-lg md:mx-auto py-4 w-full">
          {children}
        </main>
      </div>
    </>
  );
}

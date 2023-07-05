import DesktopMenu from "@/components/navbar/DesktopMenu";

export default function Page({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      <div className="bg-[#141416] min-h-screen w-full h-full">
        <DesktopMenu />
        <main className="py-4">
          {children}
        </main>
      </div>
    </>
  );
}

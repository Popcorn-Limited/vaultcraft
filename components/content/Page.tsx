import DesktopMenu from "../navbar/DesktopMenu";
import Navbar from "./Navbar";

export default function Page({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      <nav className="flex bg-[#141416] flex-col min-h-screen h-fit z-10 font-landing">
        <DesktopMenu />
        <main className="max-w-screen-lg md:mx-auto py-4 w-full">
          {children}
        </main>
      </nav>
    </>
  );
}

import Link from "next/link";

interface NavbarLinkProps {
  label: string;
  url?: string;
  isActive: boolean;
  onClick?: Function;
  target?: string;
  hidden?: boolean;
}

export default function NavbarLink({
  label,
  url,
  isActive,
  onClick,
  target,
}: NavbarLinkProps): JSX.Element {
  const className = `leading-5 text-lg text-black hover:font-bold transition-all ease-in-out delay-250 cursor-pointer ${isActive ? "font-bold" : "font-medium"}`;
  return (
    <>
      <span className={`${!url ? "" : "hidden"}`}>
        <a
          className={className}
          target={target || "_self"}
          onClick={(e) => {
            onClick && onClick();
          }}
        >
          {label}
        </a>
      </span>
      <span className={`${url ? "" : "hidden"}`}>
        <Link
          href={url ? url : "#"}
          passHref
          className={className}
          target={target || "_self"}
          onClick={(e) => {
            onClick && onClick();
          }}
        >
          {label}
        </Link>
      </span>
    </>
  );
}

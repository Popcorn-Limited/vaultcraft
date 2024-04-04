interface AccordionProps {
  children: any;
  handleClick?: Function;
  containerClassName?: string;
}

export default function Accordion({
  children,
  handleClick,
  containerClassName,
}: AccordionProps): JSX.Element {
  const style = `w-full px-8 pt-6 pb-5 rounded-3xl border border-customNeutral100 group hover:bg-customNeutral200 [&_summary::-webkit-details-marker]:hidden ${containerClassName} `;
  return handleClick ? (
    <div className={style + "cursor-pointer"} onClick={() => handleClick()}>
      {children}
    </div>
  ) : (
    <div className={style}>{children}</div>
  );
}

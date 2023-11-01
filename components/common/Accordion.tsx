
interface AccordionProps {
  children: any,
  header: any,
  initiallyOpen?: boolean,
  containerClassName?: string
}


export default function Accordion({ children, header, initiallyOpen, containerClassName }: AccordionProps): JSX.Element {
  return (
    <details
      className={`group min-w-[440px] flex-1 h-51 px-8 pt-6 pb-5 md:pl-11 md:rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden xs:border-gray-500 xs:rounded-3xl mx-auto xs:min-w-[330px] xs:p-6 ${containerClassName}`}
      open={initiallyOpen || false}
    >
      <summary className="block cursor-pointer marker:hidden">{header}</summary>
      {children}
    </details>
  );
}

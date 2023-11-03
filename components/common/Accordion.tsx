
interface AccordionProps {
  children: any,
  header: any,
  initiallyOpen?: boolean,
  containerClassName?: string
}


export default function Accordion({ children, header, initiallyOpen, containerClassName }: AccordionProps): JSX.Element {
  return (
    <details
      className={`group smmd:w-[447px] smmd:max-w-[447px] smmd:min-w-[447px] flex-1 h-51 px-8 pt-6 pb-5 md:pl-11 md:rounded-3xl border border-[#353945] [&_summary::-webkit-details-marker]:hidden ease-in-out  duration-300 hover:bg-[#23262F] xs:rounded-3xl mx-auto xs:min-w-[330px] xs:p-6 ${containerClassName}`}
      open={initiallyOpen || false}
    >
      <summary className="block cursor-pointer marker:hidden">{header}</summary>
      {children}
    </details>
  );
}


interface AccordionProps {
  children: any,
  handleClick: Function
  containerClassName?: string
}


export default function Accordion({ children, handleClick, containerClassName }: AccordionProps): JSX.Element {
  return (
    <div
      className={`group min-w-[440px] flex-1 h-51 px-8 pt-6 pb-5 md:pl-11 md:rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden xs:border-gray-500 xs:rounded-3xl mx-auto xs:min-w-[330px] xs:p-6 ${containerClassName} cursor-pointer`}
      onClick={() => handleClick()}
    >
      {children}
    </div>
  );
}

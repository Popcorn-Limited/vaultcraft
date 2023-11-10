
interface AccordionProps {
  children: any,
  handleClick?: Function
  containerClassName?: string
}


export default function Accordion({ children, handleClick, containerClassName }: AccordionProps): JSX.Element {
  const style = `group laptop:min-w-[440px] lg:max-w-[33.33%] flex-1 h-51 px-8 pt-6 pb-5 md:pl-11 md:rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden xs:border-gray-500 xs:rounded-3xl mx-auto xs:min-w-[330px] xs:p-6 cursor-pointer hover:bg-[#23262f] ${containerClassName} `
  return handleClick ? <div className={style} onClick={() => handleClick()}>{children}</div> : <div className={style}>{children}</div>
}

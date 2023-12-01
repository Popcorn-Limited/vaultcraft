import { IconProps } from "@/lib/types"


const SwitchIcon: React.FC<IconProps> = ({ className, color, size}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} viewBox="0 0 21 20" fill="none" className={className}>
            <path d="M6.33333 13.3334V3.33337M6.33333 3.33337L3 6.66671M6.33333 3.33337L9.66667 6.66671M14.6667 6.66671V16.6667M14.6667 16.6667L18 13.3334M14.6667 16.6667L11.3333 13.3334" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export default SwitchIcon;

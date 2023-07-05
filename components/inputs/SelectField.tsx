import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function SelectField({
    className,
    options,
    value,
    onChange,
}: {
    className?: string,
    options: {
        image?: string
        label: string
    }[],
    value: {
        image?: string
        label: string
    },
    onChange: (option: {
        image?: string
        label: string
    }) => void
}) {
    const [isOpened, setIsOpened] = useState(false)
    const changeValue = (option: {
        image?: string
        label: string
    }) => {
        onChange(option)
        setIsOpened(false)
    }

    return (
        <div className={`relative flex items-center ${className} myClass`}>
            <button className={`flex gap-2`} type="button" onClick={() => setIsOpened(!isOpened)}>
                {value?.image && (
                    <img className={`w-6 h-6 rounded-[50%]`} src={value.image} />
                )}
                <div className={`text-white`}>
                    {value.label}
                </div>
                {!isOpened ? (
                    <ChevronDownIcon className={`text-white w-5`} />
                ) : (
                    <ChevronUpIcon className={`text-white w-5`} />
                )}
            </button>

            {isOpened && (
                <div className={`absolute flex flex-col w-[16rem] p-2 right-0 top-[100%] z-100 bg-[#23262F] rounded-[0.75rem] border-[0.125rem] border-[#353945]`}>
                    {options.map((option, index) => {
                        return (
                            <button
                                key={index}
                                className={`
                                    p-2 rounded-[0.5rem] gap-2 flex items-center w-full
                                    ${index !== 0 && 'mt-2.5'}
                                    ${option.label === value.label ? 'bg-white' : 'hover:bg-[#353945]'}
                                `}
                                type="button"
                                onClick={() => changeValue(option)}
                            >
                                {option?.image && (
                                    <img className={`w-6 h-6 rounded-[50%]`} src={option.image} />
                                )}
                                <div className={option.label === value.label ? 'text-black' : 'text-white'}>
                                    {option.label}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
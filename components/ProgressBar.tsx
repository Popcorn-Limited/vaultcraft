import { useState } from "react"

export default function ProgressBar({ stages }: { stages: string[] }) {

    const [activeStage, setActiveStage] = useState(0);
    const length = stages.length;
    return (
        <div className="flex flex-col">
            <div className="flex flex-row items-center justify-center w-full py-4 h-fit bg-transparent relative">
                {stages.map((stage, index) => {
                    return (
                        <div className="flex flex-row justify-start items-center h-12 w-full">
                            <div className={`flex grow w-full border-1 border h-0 ${index === 0 ? 'border-transparent' : 'border-[#353945]'}`} />
                            <div className="flex flex-col items-center gap-y-2 relative">
                                <div className={`flex flex-row border-1 border justify-center h-6 w-6 items-center rounded-full ${activeStage >= index ? 'bg-[#dfff1c66] border-[#7AFB79]' : ' border-[#d7d7d766] bg-[#35394599]'}`}>
                                    <div className={`rounded-full h-2 w-2 ${activeStage >= index ? 'bg-[#7AFB79]' : 'bg-[#d7d7d766]'}`} />
                                </div>
                                <p className={`${activeStage >= index ? 'text-white' : 'text-[#ffffff66]'} absolute text-xs top-8`}>{stage}</p>
                            </div>
                            <div className={`flex grow w-full border-1 border  h-0 ${index + 1 !== length ? 'border-[#353945]' : 'border-transparent'}`} />
                        </div>
                    )
                })
                }
            </div>
        </div>
    )
}
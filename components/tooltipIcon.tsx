import { MouseEventHandler, useState } from "react"
import Modal from "./Modal"

export default function TooltipIcon({
    message,
    title,
    className,
}: {
    message?: string,
    title?: string,
    className?: string,
}) {
    const [isModalShown, setIsModalShown] = useState(false)

    const openModal = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsModalShown(true)
    }

    const closeModal = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsModalShown(false)
    }

    return (
        <div className={`flex items-center`}>
            <button type="button" onClick={openModal} className={`z-[10] ${className}`}>
                <img src="/images/icons/questionCircleIconWhite.svg" alt="" />
            </button>

            <Modal show={isModalShown} setShowModal={setIsModalShown}>
                <div className={`flex flex-col gap-8 text-white`}>
                    <div className={`flex gap-4`}>
                        <button type="button" onClick={closeModal}>
                            <img src="/images/icons/arrowLeftIcon.svg" alt="" />
                        </button>
                        <span className={`text-[32px]`}>{title}</span>
                    </div>
                    <span>{message}</span>
                </div>
            </Modal>
        </div>
    )
}
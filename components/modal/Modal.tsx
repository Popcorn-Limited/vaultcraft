import { Dispatch, Fragment, SetStateAction } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  visibility: [boolean, Dispatch<SetStateAction<boolean>>],
  children: any,
  title?: any,
  classNames?: string
}

export default function Modal({ visibility, children, title, classNames = "" }: ModalProps): JSX.Element {
  const [show, setShowModal] = visibility;
  
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setShowModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center md:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`md:min-w-[700px] md:w-1/2 relative transform overflow-hidden rounded-lg bg-[#23262f] border border-[#353945] px-8 py-9 transition-all text-white ${classNames}`}
              >
                <div className="flex flex-row justify-between font-medium md:items-center mb-8">
                  <>{title}</>
                  <XMarkIcon className="w-10 h-10 text-white" onClick={() => setShowModal(false)} role="button" />
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

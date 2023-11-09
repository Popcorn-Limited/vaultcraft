import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment } from "react";

interface PopUpModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClosePopUpModal: () => void;
}
export default function PopUpModal({ children, visible, onClosePopUpModal }: PopUpModalProps): JSX.Element {

  const onClickParent = (e: any) => {
    if (e.target === e.currentTarget) {
      onClosePopUpModal();
    }
  };

  return (
    <Transition.Root show={visible}>
      <Dialog as="div" className="relative z-10" onClose={onClickParent}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#141416] bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-t-4xl transition-all w-full border-t border-[#F0EEE0]">
                <div className="bg-[#141416] rounded-t-4xl p-6 w-full h-full">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
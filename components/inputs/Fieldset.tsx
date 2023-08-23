import { Switch } from '@headlessui/react'

function Fieldset({
  children,
  label,
  description,
  className,
  isOpened,
  handleIsOpenedChange,
  isSwitchNeeded = true,
}: {
  children: any;
  label: string;
  description: string;
  className?: string;
  isOpened?: boolean;
  handleIsOpenedChange?: (val: boolean) => void;
  isSwitchNeeded?: boolean;
}) {
  return (
    <fieldset className={`${className} flex flex-col mt-4`}>
      <div>
        <div className={`flex justify-between`}>
          <h2 className="text-white text-[18px]">{label}</h2>
          {
            isSwitchNeeded && (
              <Switch
                checked={isOpened}
                onChange={handleIsOpenedChange}
                className={`${isOpened ? 'bg-[#45B26B]' : 'bg-[#353945]'} 
                relative inline-flex items-center h-5 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
              >
                <span
                  aria-hidden="true"
                  className={`${isOpened ? 'translate-x-6 bg-white' : 'translate-x-1 bg-[#3772FF]'} first-letter:pointer-events-none inline-block h-3 w-3 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            )
          }
        </div>
        <p className="text-white opacity-40 text-[14px]">{description}</p>
      </div>

      <div className={`flex flex-col mt-4 ${!isOpened && isSwitchNeeded && 'hidden'}`}>
        {children}
      </div>
    </fieldset>
  );
}

export default Fieldset;

import { Switch } from "@headlessui/react";

function Fieldset({
  children,
  label,
  description,
  className,
  isOpened,
  handleIsOpenedChange,
}: {
  children: any;
  label: string;
  description: string;
  className?: string;
  isOpened?: boolean;
  handleIsOpenedChange?: (val: boolean) => void;
}) {
  return (
    <fieldset className={`${className} flex flex-col mt-4`}>
      <div>
        <div className={`flex justify-between`}>
          <h2 className="text-white text-lg">{label}</h2>
          {handleIsOpenedChange && (
            <Switch
              checked={isOpened}
              onChange={handleIsOpenedChange}
              className={`${isOpened ? "bg-green-500" : "bg-customNeutral100"} 
                relative inline-flex items-center h-5 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
              <span
                aria-hidden="true"
                className={`${
                  isOpened
                    ? "translate-x-6 bg-white"
                    : "translate-x-1 bg-customGray500"
                } first-letter:pointer-events-none inline-block h-3 w-3 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          )}
        </div>
        {description && description !== "" && <p className="text-white opacity-40 text-sm">{description}</p>}
      </div>

      <div
        className={`flex flex-col mt-2 ${
          !isOpened && handleIsOpenedChange && "hidden"
        }`}
      >
        {children}
      </div>
    </fieldset>
  );
}

export default Fieldset;

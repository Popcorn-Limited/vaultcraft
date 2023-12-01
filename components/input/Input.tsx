import type { HTMLProps } from "react";

export type InputProps = HTMLProps<HTMLInputElement> & { errors?: string[], info?: string };

function Input({ errors, info, className, ...props }: InputProps) {
  return (
    <>
      <div className={`border-2 ${errors ? "border-red-500" : "border-[#353945]"} rounded-[4px] h-full`}>
        <input
          className={`${className || ""} flex flex-row justify-between w-full px-2 py-4 h-full bg-[#23262F] text-white leading-none`}
          autoComplete="off"
          autoCorrect="off"
          // text-specific options
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minLength={1}
          maxLength={79}
          spellCheck="false"
          {...props}
        />
      </div>
      {info && <p className="text-gray-500 text-xs">{info}</p>}
      {errors &&
        <div className="">
          {errors.map(error =>
            <p key={error} className="text-red-500 text-xs mt-1">{error}</p>
          )}
        </div>
      }
    </>
  );
}

export default Input;

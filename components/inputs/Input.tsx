import type { HTMLProps } from "react";

export type InputProps = HTMLProps<HTMLInputElement> & { errors?: string[], info?: string };

function Input({ errors, info, className, ...props }: InputProps) {
  return (
    <>
      <input
        className={`${className || ""} border-2 ${errors ? "border-red-500" : "border-[#353945]"} 
        rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-[#23262F] text-white`}
        type="text"
        {...props}
      />
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

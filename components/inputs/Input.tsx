import type { HTMLProps } from "react";

export type InputProps = HTMLProps<HTMLInputElement> & { error?: string };

function Input({ error, className, ...props }: InputProps) {
  return (
    <>
      <input
        className={`${className || ""} border-2 ${error ? "border-red-500" : "border-[#353945]"} 
        rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-[#23262F] text-white`}
        type="text"
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}

export default Input;

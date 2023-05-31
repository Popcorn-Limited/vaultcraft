import type { HTMLProps } from "react";

export type InputProps = HTMLProps<HTMLInputElement>;
function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`${className} border-2 border-[#353945] rounded-lg flex flex-row justify-between w-full px-2 py-3 h-full bg-[#23262F] text-white`}
      type="text"
      {...props}
    />
  );
}

export default Input;

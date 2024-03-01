import type { HTMLProps } from "react";

export default function InputNumber(
  props: HTMLProps<HTMLInputElement>
): JSX.Element {
  return (
    <input
      {...props}
      className="block w-full p-0 border-none text-primaryDark text-lg bg-inherit focus:ring-0"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={"0.0"}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  );
}

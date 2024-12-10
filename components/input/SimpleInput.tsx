import type { HTMLProps } from "react";

export default function SimpleInput(props: HTMLProps<HTMLInputElement>): JSX.Element {

  return (
    <div
      className={`w-full px-4 py-2 rounded-lg border border-customGray400`}
    >
      <input
        {...props}
        className="block w-full p-0 border-none text-customGray100 text-md bg-inherit focus:ring-0"
        autoComplete="off"
        autoCorrect="off"
        // text-specific options
        type="text"
        spellCheck="false"
      />
    </div>
  )
}
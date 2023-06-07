import { readStableAtom, writeStableAtom } from "@/lib/atoms/test"
import { useAtom } from "jotai"

export default function TestComponent() {
  const [value] = useAtom(readStableAtom)
  const [, setValue] = useAtom(writeStableAtom)

  return <>
    <p className="text-white">{value}</p>
    <button className="text-white border border-white" onClick={() => setValue(value)}>{value} +1</button>
  </>
}
import TestComponent from "@/components/TestComponent"
import { readStableAtom, stableAtom, writeStableAtom } from "@/lib/atoms/test"
import { useAtom } from "jotai"
import { useRouter } from "next/router"

export default function Test1() {
  const router = useRouter()
  const [value, setValue] = useAtom(stableAtom)

  return <>
    <p className="text-white">Test 1</p>
    <p className="text-white">{value}</p>
    <button className="text-white border border-white" onClick={() => setValue(value)}>{value} +1</button>
    <button className="text-white" onClick={() => router.push("/test2")}>Travel</button>
  </>
}
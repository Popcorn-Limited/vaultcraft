import { Dispatch, FormEventHandler, SetStateAction, useMemo } from "react";
import { useAccount, useBalance, useToken } from "wagmi";
import { getVeAddresses } from "@/lib/constants";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import InputNumber from "@/components/input/InputNumber";
import { calcUnlockTime, calculateVeOut } from "@/lib/gauges/utils";
import { ZERO } from "@/lib/constants";
import { validateInput } from "@/lib/utils/helpers";
import {formatEther} from "viem";

const { BalancerPool: VCX_LP } = getVeAddresses();

function LockTimeButton({ label, isActive, handleClick }: { label: string, isActive: boolean, handleClick: Function }): JSX.Element {
  return (
    <button
      className={`w-10 h-10 border border-[#C8C8C8] hover:bg-[#23262f] rounded-lg ${isActive ? "bg-white text-black" : "text-white"}`}
      onClick={() => handleClick()}
    >
      {label}
    </button>
  )
}

interface LockVcxInterfaceProps {
  amountState: [string, Dispatch<SetStateAction<string>>];
  daysState: [number, Dispatch<SetStateAction<number>>];
  showLpModal: () => void
}

export default function LockVcxInterface({ amountState, daysState, showLpModal }: LockVcxInterfaceProps): JSX.Element {
  const { address: account } = useAccount()
  const { data: lpToken } = useToken({ chainId: 1, address: VCX_LP });
  const { data: lpBal } = useBalance({ chainId: 1, address: account, token: VCX_LP })

  const [amount, setAmount] = amountState
  const [days, setDays] = daysState

  const errorMessage = useMemo(() => {
    return (Number(amount) || 0) > Number(lpBal?.formatted) ? "* Balance not available" : "";
  }, [amount, lpBal?.formatted]);

  const handleMaxClick = () => setAmount(formatEther(lpBal?.value || ZERO));

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setAmount(validateInput(value).isValid ? value : "0");
  };

  const handleSetDays: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setDays(Number(value));
  };

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Lock your VCX-LP</h2>

      <div>
        <p className="text-primary font-semibold">Amount VCX-LP</p>
        <InputTokenWithError
          captionText={``}
          onSelectToken={() => { }}
          onMaxClick={handleMaxClick}
          chainId={1}
          value={String(amount)}
          onChange={handleChangeInput}
          selectedToken={
            {
              ...lpToken,
              name: "VCX-LP",
              symbol: "VCX-LP",
              decimals: 18,
              price: 1,
              balance: Number(lpBal?.value || 0),
            } as any
          }
          errorMessage={errorMessage}
          allowInput
          tokenList={[]}
          getToken={() => window.open("https://app.balancer.fi/#/ethereum/pool/0x577a7f7ee659aa14dc16fd384b3f8078e23f1920000200000000000000000633/add-liquidity", "_blank")}
        />
      </div>

      <div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-primary font-semibold mb-1">Lockup Time</p>
          <p className="w-32 text-secondaryLight">Custom Time</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <LockTimeButton label="1W" isActive={days === 7} handleClick={() => setDays(7)} />
          <LockTimeButton label="1M" isActive={days === 30} handleClick={() => setDays(30)} />
          <LockTimeButton label="3M" isActive={days === 90} handleClick={() => setDays(90)} />
          <LockTimeButton label="6M" isActive={days === 180} handleClick={() => setDays(180)} />
          <LockTimeButton label="1Y" isActive={days === 365} handleClick={() => setDays(365)} />
          <LockTimeButton label="2Y" isActive={days === 730} handleClick={() => setDays(730)} />
          <LockTimeButton label="4Y" isActive={days === 1460} handleClick={() => setDays(1460)} />
          <div className="w-32 flex px-5 py-2 items-center rounded-lg border border-customLightGray">
            <InputNumber
              onChange={handleSetDays}
              value={days}
              autoComplete="off"
              autoCorrect="off"
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder={"0.0"}
              minLength={1}
              maxLength={79}
              spellCheck="false"
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlocks at:</p>
          <p>{new Date(calcUnlockTime(days)).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <p className="text-primary font-semibold mb-1">Voting Power</p>
        <div className="w-full border border-customLightGray rounded-lg p-4">
          <p className="text-primaryDark">{Number(amount) > 0 ? calculateVeOut(Number(amount), days).toFixed(2) : "Enter the amount to view your voting power"}</p>
        </div>
      </div>

    </div>
  )
}

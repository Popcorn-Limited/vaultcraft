import TertiaryActionButton from "@/components/button/TertiaryActionButton";
import { ManagementOption } from "@/components/boost/modals/manage/ManageLockModal";

export default function SelectManagementOption({
  setStep,
  setManagementOption,
}: {
  setStep: Function;
  setManagementOption: Function;
}): JSX.Element {
  return (
    <div className="space-y-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="88"
        height="88"
        viewBox="0 0 88 88"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M88 44C88 32.3305 83.3643 21.1389 75.1127 12.8873C66.8611 4.6357 55.6695 2.34134e-06 44 0C32.3305 0 21.1389 4.6357 12.8873 12.8873C4.6357 21.1389 0 32.3305 0 44V88H87.8523V44H88ZM66 44C66 38.1652 63.6821 32.5695 59.5564 28.4437C55.4305 24.3179 49.8348 22 44 22C38.1652 22 32.5695 24.3178 28.4437 28.4436C24.3179 32.5694 22 38.1652 22 44C22 49.8348 24.3179 55.4306 28.4437 59.5564C32.5695 63.6822 38.1652 66 44 66C49.8348 66 55.4305 63.6821 59.5564 59.5564C63.6821 55.4305 66 49.8348 66 44Z"
          fill="white"
        />
      </svg>

      <div>
        <h2 className="text-start text-5xl">Update your Lock</h2>
        <p className="text-start text-primaryDark">
          Increase your veVCX by locking more VCX-LP or increasing the lock time
          for your locked VCX-LP balance. Alternatively Unlock your locked
          VCX-LP.
        </p>
      </div>
      <div className="space-y-4">
        <div className="w-full px-4 py-4 border border-gray-500 rounded-lg">
          <TertiaryActionButton
            label="Increase Lock Amount"
            handleClick={() => {
              setManagementOption(ManagementOption.IncreaseLock);
              setStep(1);
            }}
          />
        </div>
        <div className="w-full px-4 py-4 border border-gray-500 rounded-lg">
          <TertiaryActionButton
            label="Increase Lock Time"
            handleClick={() => {
              setManagementOption(ManagementOption.IncreaseTime);
              setStep(1);
            }}
          />
        </div>
        <div className="w-full px-4 py-4 border border-gray-500 rounded-lg">
          <TertiaryActionButton
            label="Unlock VCX"
            handleClick={() => {
              setManagementOption(ManagementOption.Unlock);
              setStep(1);
            }}
          />
        </div>
        <div className="w-full px-4 py-4 border border-gray-500 rounded-lg">
          <TertiaryActionButton
            label="Broadcast VeBalance"
            handleClick={() => {
              setManagementOption(ManagementOption.BroadcastVeBalance);
              setStep(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}

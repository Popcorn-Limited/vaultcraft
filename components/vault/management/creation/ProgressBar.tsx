export interface ProgressBarProps {
  stages: string[];
  activeStage: number;
}

export default function ProgressBar({ stages, activeStage }: ProgressBarProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-center w-full py-4 h-fit bg-transparent relative">
        {stages.map((stage, index) => {
          return (
            <div
              key={stage}
              className="flex flex-row justify-start items-center h-12 w-full"
            >
              <div
                className={`flex grow w-full border-1 border h-0 ${borderColor(
                  index,
                  stages.length,
                  activeStage,
                  "left"
                )}`}
              />
              <div className="flex flex-col items-center gap-y-2 relative">
                <div
                  className={`flex flex-row border-1 border justify-center h-6 w-6 items-center rounded-full 
                                ${
                                  activeStage >= index
                                    ? "bg-primaryYellow bg-opacity-50 border-primaryYellow"
                                    : " border-customGray300 bg-customGray500"
                                }`}
                >
                  {index < activeStage ? (
                    <img
                      src="/images/icons/checkIconYellow.svg"
                      className={`h-4 w-4`}
                    />
                  ) : (
                    <div
                      className={`rounded-full h-2 w-2 ${
                        activeStage >= index ? "bg-primaryYellow" : "bg-customGray100"
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`${
                    activeStage >= index ? "text-white" : "text-customGray100"
                  } absolute text-xs top-8`}
                >
                  {stage}
                </p>
              </div>
              <div
                className={`flex grow w-full border-1 border  h-0 ${borderColor(
                  index,
                  stages.length,
                  activeStage,
                  "right"
                )}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function borderColor(
  index: number,
  length: number,
  activeStage: number,
  direction: "left" | "right"
) {
  if (direction === "left") {
    if (index === 0) return "border-transparent";
    return activeStage >= index ? "border-primaryYellow" : "border-customNeutral100";
  } else {
    if (index + 1 === length) return "border-transparent";
    return activeStage > index ? "border-primaryYellow" : "border-customNeutral100";
  }
}

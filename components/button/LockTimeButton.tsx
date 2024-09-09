export default function LockTimeButton({
  label,
  isActive,
  handleClick,
}: {
  label: string;
  isActive: boolean;
  handleClick: Function;
}): JSX.Element {
  return (
    <button
      className={`w-10 h-10 border border-customGray200 hover:bg-customNeutral200 rounded-lg ${isActive ? "bg-white text-black" : "text-white"
        }`}
      onClick={() => handleClick()}
    >
      {label}
    </button>
  );
}
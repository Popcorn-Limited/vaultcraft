export default function SpinningLogo() {
  return (
    <div className="w-full mx-auto flex justify-center items-center">
      <img
        src="/images/icons/popLogo.svg"
        alt="Pop Logo"
        className="w-24 h-24 animate-spin-slow"
      />
    </div>
  );
};
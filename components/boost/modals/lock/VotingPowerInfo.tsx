export default function VotingPowerInfo(): JSX.Element {
  return (
    <div className="space-y-8 mb-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="88"
        height="88"
        viewBox="0 0 88 88"
        fill="none"
      >
        <path
          d="M88 44C88 49.7782 86.8619 55.4998 84.6507 60.8381C82.4395 66.1764 79.1985 71.0269 75.1127 75.1127C71.0269 79.1985 66.1764 82.4395 60.8381 84.6507C55.4997 86.8619 49.7782 88 44 88C38.2218 88 32.5002 86.8619 27.1619 84.6507C21.8236 82.4395 16.9731 79.1985 12.8873 75.1127C8.80152 71.0269 5.5605 66.1764 3.3493 60.8381C1.13809 55.4997 -1.00944e-06 49.7782 0 44L44 44L88 44Z"
          fill="white"
        />
        <path
          d="M88 9.85741e-06C88 5.77817 86.8619 11.4998 84.6507 16.8381C82.4395 22.1764 79.1985 27.0269 75.1127 31.1127C71.0269 35.1985 66.1764 38.4395 60.8381 40.6507C55.4997 42.8619 49.7781 44 44 44C38.2218 44 32.5002 42.8619 27.1619 40.6507C21.8236 38.4395 16.9731 35.1985 12.8873 31.1127C8.80152 27.0269 5.5605 22.1764 3.3493 16.8381C1.13809 11.4997 -1.23133e-06 5.77816 0 0L44 7.18168e-06L88 9.85741e-06Z"
          fill="white"
        />
      </svg>

      <div>
        <h2 className="text-start text-5xl">Voting Power</h2>
        <p className="text-start">
          Lock your VCX-LP longer for more veVCX. Your veVCX balance represents
          your voting power which decreases linearly until expiry.
        </p>
      </div>
      <div className="flex flex-row items-center justify-center space-x-4">
        <div className="h-2 w-20 rounded-2xl bg-customNeutral100"></div>
        <div className="h-2 w-20 rounded-2xl bg-white"></div>
      </div>
    </div>
  );
}

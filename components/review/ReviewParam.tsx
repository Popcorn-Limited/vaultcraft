export default function ReviewParam({ title, value, img }: { title: string, value: string, img?: string }): JSX.Element {
  return (
    <span className="flex flex-row items-center justify-between w-full">
      <p className="text-white w-3/12">{title}</p>
      <span className="flex flex-row flex-wrap items-center w-9/12 justify-end">
        <p className="text-white break-all">{value}</p>
        {img &&
          <figure className="h-6 flex-row items-center flex relative ml-2">
            <img
              className="object-contain h-full w-fit"
              alt="logo"
              src={img}
            />
          </figure>
        }
      </span>
    </span>
  )
}
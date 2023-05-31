function Fieldset({
  children,
  label,
  description,
  className,
}: {
  children: any;
  label: string;
  description: string;
  className?: string;
}) {
  return (
    <fieldset className={`${className} flex flex-col`}>
      <div>
        <p className="text-white text-lg">{label}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>

      <div className="flex flex-col mt-4">
        <label className="text-white text-sm">{label}</label>
        {children}
      </div>
    </fieldset>
  );
}

export default Fieldset;

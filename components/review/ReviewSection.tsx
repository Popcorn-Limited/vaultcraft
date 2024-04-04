export default function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: any;
}): JSX.Element {
  return (
    <div className="border-b-2 border-customNeutral100 py-4 ">
      <h2 className="text-white text-lg mb-4 font-bold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

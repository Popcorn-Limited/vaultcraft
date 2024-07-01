import { cn } from "@/lib/utils/helpers";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchBar({
  searchTerm,
  handleSearch,
  className,
}: {
  searchTerm: string;
  handleSearch: (value: string) => void;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        "md:w-96 flex px-6 py-3 items-center rounded-lg border border-customGray300 border-opacity-40 group/search hover:border-opacity-80 gap-2",
        className
      )}
    >
      <MagnifyingGlassIcon className="w-8 h-8 text-customGray400 group-hover/search:text-customGray200" />
      <input
        className="w-10/12 md:w-80 focus:outline-none border-0 text-customGray500 focus:text-customGray200 leading-none bg-transparent"
        type="text"
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value.toLowerCase())}
        defaultValue={searchTerm}
      />
    </div>
  );
}

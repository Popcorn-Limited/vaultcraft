import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchBar({
  searchTerm,
  handleSearch,
}: {
  searchTerm: string;
  handleSearch: (value: string) => void;
}): JSX.Element {
  return (
    <div className="md:w-96 flex px-6 py-3 items-center rounded-lg border border-gray-300 border-opacity-40 group/search hover:border-opacity-80 gap-2">
      <MagnifyingGlassIcon className="w-8 h-8 text-gray-400 group-hover/search:text-gray-200" />
      <input
        className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 focus:text-gray-200 leading-none bg-transparent"
        type="text"
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value.toLowerCase())}
        defaultValue={searchTerm}
      />
    </div>
  );
}

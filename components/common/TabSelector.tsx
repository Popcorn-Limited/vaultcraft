interface TabSelectorProps {
  activeTab: any;
  setActiveTab: Function;
  availableTabs: any[];
  className?: string;
}

export default function TabSelector({
  activeTab,
  setActiveTab,
  availableTabs,
  className,
}: TabSelectorProps): JSX.Element {
  return (
    <div className={`w-full flex flex-row ${className}`}>
      {availableTabs.map((tab) => (
        <div
          key={tab}
          className={`w-1/2 cursor-pointer group border-b ${
            activeTab === tab
              ? "border-white"
              : "border-customGray500 hover:border-white"
          }`}
          onClick={(e) => setActiveTab(tab)}
        >
          <p
            className={`text-base md:text-center mb-1 cursor-pointer word-spacing-full sm:word-spacing-normal 
            ${
              activeTab === tab
                ? "text-white font-medium"
                : "text-customGray500 group-hover:text-white"
            }`}
          >
            {tab}
          </p>
        </div>
      ))}
    </div>
  );
}

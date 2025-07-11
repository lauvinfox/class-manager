import { ClassHeaderProps } from "../types/types";

export const ClassHeader = ({
  title,
  activeTab,
  handleTab,
}: ClassHeaderProps) => {
  const tabs = [
    "Overview",
    "Statistics",
    "Instructors",
    "Students",
    "Assignments",
    "Journals",
    "Subjects",
  ];
  return (
    <div className="relative top-0 z-40 flex flex-col gap-1 justify-between bg-primary border-b border-slate-200 px-6 dark:bg-gray-900 dark:border-gray-800 min-w-0">
      <span className="flex py-4 text-lg font-semibold text-font-primary dark:text-white select-none">
        {title}
      </span>
      <div className="flex border-b gap-5 border-slate-200 dark:border-gray-700 bg-primary dark:bg-gray-900">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`py-2 pb-4 cursor-pointer text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-indigo-700 dark:text-white"
                : "text-slate-500 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white"
            }`}
            onClick={() => handleTab(tab)}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-indigo-600 rounded-t" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

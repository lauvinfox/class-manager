interface SettingSidebarProps {
  selected: string;
  setSelected: (tab: string) => void;
}

const options = [
  //   { title: "General" },
  { title: "Preferences" },
  { title: "Account" },
];

export const SettingSidebar = ({
  selected,
  setSelected,
}: SettingSidebarProps) => {
  return (
    <nav
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-primary p-2 dark:bg-gray-900 dark:border-gray-700"
      style={{ width: "225px" }}
    >
      <div className="space-y-1">
        {options.map((opt) => (
          <button
            key={opt.title}
            onClick={() => setSelected(opt.title)}
            className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors text-sm ${
              selected === opt.title
                ? "bg-indigo-100 text-indigo-800 dark:bg-gray-800 dark:text-white dark:border-indigo-400"
                : "text-slate-600 hover:bg-slate-100 border-transparent dark:text-slate-200 dark:hover:bg-gray-800"
            }`}
          >
            {opt.title}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default SettingSidebar;

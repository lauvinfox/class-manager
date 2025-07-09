interface HeaderProps {
  title: string;
  fontSize?: string;
}

const Header = ({ title, fontSize }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-45 bg-white">
      <nav className="relative top-0 z-40 flex items-center justify-between bg-primary border-b border-slate-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-800 min-w-0">
        <span
          className={`${fontSize} font-bold text-font-primary dark:text-white select-none`}
        >
          {title}
        </span>
      </nav>
    </div>
  );
};

export default Header;

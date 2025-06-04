import { FaMoon, FaSun } from "react-icons/fa";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

interface HeaderProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  toggleSidebar?: () => void;
}

const Header = ({ darkMode, toggleDarkMode, toggleSidebar }: HeaderProps) => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-primary border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              onClick={toggleSidebar}
            >
              <HiOutlineMenuAlt2 className="text-2xl text-font-primary dark:text-form-bg hover:text-font-primary-hover" />
            </button>
            <a href="#" className="flex items-center ml-2">
              <span className="self-center text-xl font-roboto font-semibold whitespace-nowrap dark:text-white">
                Class Manager
              </span>
            </a>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              onChange={toggleDarkMode}
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={darkMode}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors duration-200">
              {darkMode ? (
                <FaMoon className="text-yellow-500" />
              ) : (
                <FaSun className="text-gray-500" />
              )}
            </span>
          </label>
        </div>
      </div>
    </nav>
  );
};

export default Header;

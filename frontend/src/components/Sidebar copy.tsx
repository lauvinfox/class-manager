import { HiDotsVertical } from "react-icons/hi";
import { JSX } from "react";
import {
  FaCalendarAlt,
  FaChartBar,
  FaFacebookMessenger,
  FaUsersCog,
} from "react-icons/fa";

interface SidebarProps {
  children?: React.ReactNode;
  sidebarOpen?: boolean;
}

interface SidebarItemProps {
  icon: JSX.Element;
  text: string;
  sidebarOpen?: boolean;
  active?: boolean;
  alert?: boolean;
}

export const Sidebar = ({ sidebarOpen }: SidebarProps) => {
  return (
    <aside
      className={`h-screen fixed top-0 left-0 z-40 transition-transform duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      } dark:bg-gray-800 dark:border-gray-700`}
    >
      <nav className="h-full flex flex-col pt-18 bg-primary border-r border-gray-400 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <ul className="flex-1 px-3 dark:text-white">
          <SidebarItem
            icon={<FaChartBar size={20} />}
            text="Dashboard"
            active
            sidebarOpen={sidebarOpen}
          />
          <SidebarItem
            icon={<FaCalendarAlt size={20} />}
            text="Kanban"
            sidebarOpen={sidebarOpen}
          />
          <SidebarItem
            icon={<FaFacebookMessenger size={20} />}
            text="Inbox"
            alert
            sidebarOpen={sidebarOpen}
          />
          <SidebarItem
            icon={<FaUsersCog size={20} />}
            text="Users"
            sidebarOpen={sidebarOpen}
          />
        </ul>
        <div className="border-t flex p-3 border-gray-400">
          <img
            src="https://ui-avatars.com/api/?background=0D8ABC&color=fff"
            alt=""
            className="w-10 h-10 rounded-md"
          />
          <div
            className={`flex justify-between items-center transition-all duration-300 ${
              sidebarOpen ? "w-52 ml-3" : "w-0 overflow-hidden"
            } dark:bg-gray-800 dark:border-gray-700`}
          >
            <div className="leading-4">
              <h4 className="font-semibold dark:text-white">John Doe</h4>
              <span className="text-xs text-gray-600 dark:text-white">
                johndoe@gmail.com
              </span>
            </div>
            <HiDotsVertical size={20} className="dark:text-white" />
          </div>
        </div>
      </nav>
    </aside>
  );
};

export const SidebarItem = ({
  icon,
  text,
  sidebarOpen = true,
  active,
  alert,
}: SidebarItemProps) => {
  return (
    <li
      className={`relative flex items-center py-2 px-3 font-medium rounded-md cursor-pointer transition-colors ${
        active
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
      }`}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "w-52 ml-3" : "w-0"
        }`}
      >
        {sidebarOpen && text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded-md bg-indigo-400 ${
            sidebarOpen ? "" : "top-2"
          }`}
        />
      )}
    </li>
  );
};

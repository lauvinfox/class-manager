import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { useTheme } from "../contexts/ThemeContext";
import SettingSidebar from "../components/SettingSidebar";
import { FaMoon, FaSun } from "react-icons/fa";
import { getUserInfo } from "../lib/api";

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState("Preferences");

  useEffect(() => {
    let isMounted = true;
    getUserInfo()
      .then((res) => {
        if (isMounted) {
          if (res?.data?.username && res?.data?.email) {
            setUser({
              username: res.data.username,
              email: res.data.email,
            });
          }
        }
      })
      .catch(() => {
        // error handling removed
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`${
        darkMode && "dark"
      } min-h-screen bg-primary dark:bg-gray-900 text-font-primary`}
    >
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <Header title="Class Manager" fontSize="text-xl" />
          <SettingHeader tab={selectedTab} />
          <div className="flex">
            <SettingSidebar
              selected={selectedTab}
              setSelected={setSelectedTab}
            />
            <div className="flex-1">
              {/* Konten tab aktif bisa diatur di sini */}
              {selectedTab === "Account" && (
                <div className="flex flex-col gap-2 dark:bg-gray-900 dark:text-slate-200 dark:border-slate-200 p-6">
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium mb-2">Username</span>
                      <p className="font-light mb-2">{user?.username}</p>
                    </div>
                    <div className="justify-center items-center flex">
                      <button
                        type="button"
                        className="text-sm dark:text-slate-50 border dark:border-slate-50 font-bold rounded-md h-8 w-16 min-w-0 min-h-0"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium mb-2">Email</span>
                      <p className="font-light mb-2">{user?.email}</p>
                    </div>
                    <div className="justify-center items-center flex">
                      <button className="text-sm dark:text-slate-50 border dark:border-slate-50 font-bold rounded-md h-8 w-16 min-w-0 min-h-0">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {selectedTab === "Preferences" && (
                <div className="flex flex-col dark:bg-gray-900 dark:text-slate-200 dark:border-slate-200 p-6">
                  <div className="flex flex-row justify-between">
                    <span className="font-medium mb-2">Change mode</span>
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
              )}
              {selectedTab === "General" && <div>General Content</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingHeader = ({ tab }: { tab: string }) => {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between bg-primary border-b border-slate-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-800 min-w-0">
      <span className="flex text-lg font-semibold text-font-primary dark:text-white select-none gap-1">
        Settings <span>&gt;</span> <span className="font-light">{tab}</span>
      </span>
    </nav>
  );
};

export default Settings;

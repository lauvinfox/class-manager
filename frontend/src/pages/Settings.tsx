import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { useTheme } from "../contexts/ThemeContext";
import SettingSidebar from "../components/SettingSidebar";
import { FaMoon, FaSun } from "react-icons/fa";
import { changeUsername, getUserInfo } from "../lib/api";
import { AuthProvider } from "../contexts/AuthContext";

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState("Preferences");

  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");

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
    <AuthProvider>
      <div
        className={`${
          darkMode ? "dark" : ""
        } h-screen bg-primary dark:bg-gray-900 text-font-primary`}
      >
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 h-full">
            <Header title="Class Manager" fontSize="text-xl" />
            <SettingHeader tab={selectedTab} />
            <div className="flex h-[83.18%] border-b overflow-hidden">
              <SettingSidebar
                selected={selectedTab}
                setSelected={setSelectedTab}
              />
              <div className="flex-1 h-full">
                {/* Konten tab aktif bisa diatur di sini */}
                {selectedTab === "Account" && (
                  <div className="flex flex-col gap-2 dark:bg-gray-900 dark:text-slate-200 dark:border-slate-200 p-6 h-full">
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium mb-2">Username</span>
                        <p className="font-light mb-2">{user?.username}</p>
                      </div>
                      <div className="justify-center items-center flex">
                        <button
                          type="button"
                          className="text-sm dark:text-slate-50 border dark:border-slate-50 font-bold rounded-md h-8 w-16 min-w-0 min-h-0"
                          onClick={() => setShowChangeUsername(true)}
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
                  <div className="flex flex-col dark:bg-gray-900 dark:text-slate-200 dark:border-slate-200 p-6 h-full">
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
                {selectedTab === "General" && (
                  <div className="h-full">General Content</div>
                )}
                {showChangeUsername && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                        onClick={() => setShowChangeUsername(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
                        Change Username
                      </h2>
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setChangeLoading(true);
                          setChangeError("");
                          try {
                            await changeUsername({
                              password: passwordInput,
                              newUsername,
                            });
                            setUser(
                              (prev) =>
                                prev && { ...prev, username: newUsername }
                            );
                            setShowChangeUsername(false);
                            setPasswordInput("");
                            setNewUsername("");
                          } finally {
                            setChangeLoading(false);
                          }
                        }}
                      >
                        <div>
                          <label className="block text-sm font-medium mb-1 text-slate-50">
                            New Username
                          </label>
                          <input
                            type="text"
                            className="w-full rounded border border-slate-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-font-primary dark:text-white"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-slate-50">
                            Password
                          </label>
                          <input
                            type="password"
                            className="w-full rounded border border-slate-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-font-primary dark:text-white"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            required
                          />
                        </div>
                        {changeError && (
                          <div className="text-red-500 text-xs">
                            {changeError}
                          </div>
                        )}
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={() => setShowChangeUsername(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                            disabled={changeLoading}
                          >
                            {changeLoading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
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

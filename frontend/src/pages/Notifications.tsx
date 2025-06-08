import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Notifications = () => {
  const { darkMode } = useTheme();
  return (
    <AuthProvider>
      <div
        className={`${
          darkMode && "dark"
        } min-h-screen bg-primary dark:bg-gray-900 text-font-primary dark:text-slate-200`}
      >
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Header title="Class Manager" fontSize="text-xl" />
            <div className="flex flex-col h-[76.5%] items-center justify-center">
              <h1 className="text-2xl font-bold mb-4">Notifications</h1>
              <p className="text-gray-600">This page is under construction.</p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Notifications;

import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Classes = () => {
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
          <div className="flex-1 min-h-screen">
            <Header title="Class Manager" fontSize="text-xl" />
            <div className="flex flex-col items-center justify-center h-screen overflow-hidden">
              <h1 className="text-2xl font-bold mb-4">Classes</h1>
              <p className="text-gray-600">This page is under construction.</p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Classes;

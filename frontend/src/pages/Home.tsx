import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../lib/api";
// import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { useTheme } from "../contexts/ThemeContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    getMe().catch(() => {
      navigate("/signin", { replace: true });
    });
  }, [navigate]);

  return (
    <div
      className={`${
        darkMode && "dark"
      } min-h-screen bg-primary text-font-primary`}
    >
      <Sidebar />
    </div>
  );
};

export default HomePage;

import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { getClassByClassId } from "../lib/api";
import { useParams } from "react-router-dom";

interface Instructor {
  instructorId: string;
  role: string;
  status: string;
}

interface ClassInfo {
  classId: string;
  name: string;
  description?: string;
  classOwner: string;
  instructors?: Instructor[];
  roles?: string[];
  students?: string[];
}

const ClassPage = () => {
  const { darkMode } = useTheme();
  const { classId } = useParams();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null); // agar state awal tidak undefined secara eksplisit

  const [activeTab, setActiveTab] = useState("Overview");

  const handleTab = (tab: string) => {
    setActiveTab(tab);
  };

  const isMounted = useRef(false);

  const fetchUserInfo = async (classId: string) => {
    try {
      const res = await getClassByClassId(classId);
      return res?.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isMounted.current || !classId) return;
      const classData = await fetchUserInfo(classId);
      if (classData) {
        setClassInfo(classData);
        isMounted.current = true;
      }
    };

    fetchData();
  }, [classId]);

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
            <ClassHeader
              title={classInfo ? classInfo?.name : ""}
              activeTab={activeTab}
              handleTab={handleTab}
            />
            {/* Content */}
            {/* <div className="flex flex-1 h-[76.5%] overflow-hidden">
              <div className="flex flex-col top-0 w-[30%] border-r border-slate-300 bg-primary dark:bg-gray-900 dark:border-gray-700 items-center">
                <div className="space-y-1 border-b border-slate-300 w-[90%] pt-2 pb-4">
                  <ProfileTitleSection
                    name={classInfo?.name || ""}
                    username={fullUserInfo?.username || ""}
                    firstName={fullUserInfo?.firstName || ""}
                    lastName={fullUserInfo?.lastName || ""}
                  />
                  <div className="px-4 text-sm text-slate-500 dark:text-slate-300">
                    <div className="mb-2 text-sm font-semibold">About</div>
                    <div className="flex items-center gap-1 mb-1">
                      <FiMail className="text-base mt-0.5" />
                      <span className="font-medium">Email:</span>
                      <span className="text-slate-700 dark:text-slate-100">
                        {fullUserInfo?.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 border-b border-slate-300 w-[90%] pt-2 pb-4">
                  <div className="px-4 text-sm text-slate-500 dark:text-slate-300">
                    <div className="mb-2 text-sm font-semibold">
                      Account details
                    </div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <FiMail className="text-base mt-0.5" />
                      <span className="font-medium">Date of birth:</span>
                      <span className="text-slate-700 dark:text-slate-100">
                        {formatIndoDate(fullUserInfo?.dateOfBirth ?? "", true)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <FiMail className="text-base mt-0.5" />
                      <span className="font-medium">Date joined:</span>
                      <span className="text-slate-700 dark:text-slate-100">
                        {fullUserInfo?.dateJoined}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <FiMail className="text-base mt-0.5" />
                      <span className="font-medium">Verified:</span>
                      <span className="text-slate-700 dark:text-slate-100">
                        {fullUserInfo?.verified ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">Job information</div>
            </div> */}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

interface ClassHeaderProps {
  title: string;
  activeTab: string;
  handleTab: (tab: string) => void;
}

const ClassHeader = ({ title, activeTab, handleTab }: ClassHeaderProps) => {
  const tabs = ["Overview", "Statistics", "Instructors", "Students"];
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

export default ClassPage;

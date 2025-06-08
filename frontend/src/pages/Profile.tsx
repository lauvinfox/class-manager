import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { memo, useMemo, useRef, useState } from "react";
import { getFullUserInfo } from "../lib/api";
import { useParams } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { formatIndoDate } from "../utils/formatIndoDate";

const ProfilePage = () => {
  const { darkMode } = useTheme();
  const { username } = useParams();

  const [fullUserInfo, setFullUserInfo] = useState<{
    name: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    dateOfBirth: string;
    dateJoined: string;
    verified: string;
  }>();
  const isMounted = useRef(false);

  const fetchUserInfo = async (username: string) => {
    try {
      const res = await getFullUserInfo(username);
      console.log(res);
      return res?.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const fetchData = async (username: string) => {
    if (isMounted.current) return;
    const userData = await fetchUserInfo(username);
    setFullUserInfo(userData);
  };

  useState(() => {
    if (username) {
      fetchData(username);
    }
  });

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
            <ProfileHeader />
            {/* Content */}
            <div className="flex flex-1 h-[76.5%] overflow-hidden">
              <div className="flex flex-col top-0 w-[30%] border-r border-slate-300 bg-primary dark:bg-gray-900 dark:border-gray-700 items-center">
                <div className="space-y-1 border-b border-slate-300 w-[90%] pt-2 pb-4">
                  <ProfileTitleSection
                    name={fullUserInfo?.name || ""}
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
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

const ProfileHeader = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview"];
  return (
    <div className="relative top-0 z-40 flex flex-col gap-1 justify-between bg-primary border-b border-slate-200 px-6 dark:bg-gray-900 dark:border-gray-800 min-w-0">
      <span className="flex py-4 text-lg font-semibold text-font-primary dark:text-white select-none">
        Profile
      </span>
      <div className="flex border-b border-slate-200 dark:border-gray-700 bg-primary dark:bg-gray-900">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`py-2 pb-4 cursor-pointer text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-indigo-700 dark:text-white"
                : "text-slate-500 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white"
            }`}
            onClick={() => setActiveTab(tab)}
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

interface ProfileTitleSectionProps {
  username: string;
  name: string;
  firstName: string;
  lastName: string;
}

const ProfileTitleSection = ({
  name,
  firstName,
  lastName,
  username,
}: ProfileTitleSectionProps) => {
  return (
    <div className="mb-3 pb-3 px-4 pt-3">
      <div className="relative flex items-center justify-between rounded-md transition-colors">
        <div className="flex items-center gap-4">
          <ProfilePic firstName={firstName} lastName={lastName} />
          <div>
            <span className="block text-sm font-semibold dark:text-slate-50">
              {name}
            </span>
            <span className="block text-base text-slate-500 dark:text-slate-50">
              {username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface ProfilePicProps {
  firstName?: string;
  lastName?: string;
}

const ProfilePic = memo(({ firstName, lastName }: ProfilePicProps) => {
  // Memoize the avatar URL so it doesn't change on every render
  const avatarUrl = useMemo(() => {
    return `https://ui-avatars.com/api/?name=${firstName || ""}+${
      lastName || ""
    }&background=4D46D3&color=fff&`;
  }, [firstName, lastName]);
  return (
    <div className="grid size-20 shrink-0 place-content-center rounded-md bg-indigo-600">
      <img src={avatarUrl} alt="" className="size-20 rounded-md" />
    </div>
  );
});

export default ProfilePage;

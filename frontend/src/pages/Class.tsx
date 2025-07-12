import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";

import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

import { getClassByClassId, getUserInfo } from "../lib/api";
import { ClassInfo } from "../types/types";
import InstructorsTab from "../components/InstructorsTab";
import { ClassHeader } from "../components/ClassHeader";

import AssignmentsTab from "../components/AssignmentsTab";
import SubjectsTab from "../components/SubjectsTab";
import StudentsTab from "../components/StudentsTab";
import JournalsTab from "../components/JournalsTab";
import StatisticsTab from "../components/StatisticsTab";

const ClassPage = () => {
  const { darkMode } = useTheme();
  const { classId } = useParams();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  // Get username
  const [currentUser, setCurrentUser] = useState<{
    username: string;
  } | null>(null);

  const isMounted = useRef(false);

  const handleTab = (tab: string) => {
    setActiveTab(tab);
  };

  //  Fetch class data
  const fetchClassInfo = async (classId: string) => {
    try {
      const res = await getClassByClassId(classId);
      return res?.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleRefresh = async () => {
    if (classId) {
      const classData = await fetchClassInfo(classId);
      if (classData) setClassInfo(classData);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isMounted.current || !classId) return;
      const classData = await fetchClassInfo(classId);
      if (classData) {
        setClassInfo(classData);
        isMounted.current = true;
      }
    };

    fetchData();
  }, [classId]);

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo();
      return res?.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isMounted.current) return; // Hindari refetch jika sudah dilakukan
      const userData = await fetchUserInfo();
      setCurrentUser(userData);
      isMounted.current = true;
    };
    fetchData();
  }, []);

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

            {activeTab == "Instructors" && (
              <InstructorsTab
                classInfo={classInfo}
                currentUser={currentUser}
                classId={classId}
                handleRefresh={handleRefresh}
              />
            )}
            {activeTab == "Students" && (
              <StudentsTab
                classId={classId as string}
                classInfo={classInfo}
                handleRefresh={handleRefresh}
              />
            )}
            {activeTab == "Assignments" && (
              <AssignmentsTab
                classId={classId}
                classInfo={classInfo}
                handleRefresh={handleRefresh}
              />
            )}
            {activeTab == "Journals" && (
              <JournalsTab classId={classId as string} classInfo={classInfo} />
            )}
            {activeTab == "Subjects" && (
              <SubjectsTab
                classId={classId as string}
                classInfo={classInfo}
                handleRefresh={handleRefresh}
              />
            )}
            {activeTab == "Overview" && (
              <StatisticsTab
                classId={classId as string}
                classInfo={classInfo}
              />
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default ClassPage;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";

import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

import { getClassByClassId } from "../lib/api";
import { ClassInfo } from "../types/types";
import InstructorsTab from "../components/InstructorsTab";
import { ClassHeader } from "../components/ClassHeader";

import AssignmentsTab from "../components/AssignmentsTab";
import SubjectsTab from "../components/SubjectsTab";
import StudentsTab from "../components/StudentsTab";
import JournalsTab from "../components/JournalsTab";
import StatisticsTab from "../components/StatisticsTab";
import { useQuery } from "@tanstack/react-query";

import AssistancesTab from "../components/AssistancesTab";
import LearningPlansTab from "../components/LearningPlansTab";

const ClassPage = () => {
  const { darkMode } = useTheme();

  const { classId } = useParams();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const handleTab = (tab: string) => {
    setActiveTab(tab);
  };

  //  Fetch class data
  // Refresh handler using react-query refetch
  const { data: classData, refetch: refetchClassInfo } = useQuery({
    queryKey: ["classInfo", classId],
    queryFn: () => getClassByClassId(classId as string),
    enabled: !!classId,
  });

  useEffect(() => {
    setClassInfo(classData?.data ?? null);
  }, [classData]);

  const handleRefresh = async () => {
    await refetchClassInfo();
  };

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
            {activeTab == "Subject Weights" && (
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
            {activeTab == "Assistances" && (
              <AssistancesTab
                classId={classId as string}
                classInfo={classInfo}
              />
            )}
            {activeTab == "Learning Plans" && (
              <LearningPlansTab
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

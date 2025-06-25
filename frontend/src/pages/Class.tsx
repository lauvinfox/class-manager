import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { IoPersonAddOutline, IoSearchOutline } from "react-icons/io5";

import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import Dropzone from "../components/Dropzone";

import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

import { addStudentsToClass, getClassByClassId, getUserInfo } from "../lib/api";
import { useMutation } from "@tanstack/react-query";
import { ClassInfo } from "../types/types";
import InstructorsTab from "../components/InstructorsTab";
import { ClassHeader } from "../components/ClassHeader";

const ClassPage = () => {
  const { darkMode } = useTheme();
  const { classId } = useParams();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  // Get username
  const [currentUser, setCurrentUser] = useState<{
    username: string;
  } | null>(null);

  // Student management state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [addStudentTab, setAddStudentTab] = useState<"single" | "bulk">(
    "single"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: uploadStudentsCsv } = useMutation({
    mutationFn: async (file: File) => {
      if (!classId) throw new Error("Class ID not found");
      return await addStudentsToClass(classId, file);
    },
  });

  const isMounted = useRef(false);

  const handleTab = (tab: string) => {
    setActiveTab(tab);
  };

  //  Fetch class data
  const fetchClassInfo = async (classId: string) => {
    try {
      const res = await getClassByClassId(classId);
      console.log("Class data fetched:", res.data);
      return res?.data;
    } catch (error) {
      console.error(error);
      return null;
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

  const handleRefresh = async () => {
    if (!classId) return;
    const classData = await fetchClassInfo(classId);
    if (classData) setClassInfo(classData);
  };

  // Search student
  const [searchStudentTerm, setSearchStudentTerm] = useState("");
  const handleStudentSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStudentTerm(event.target.value);
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
                currentUser={currentUser}
                classId={classId}
                handleRefresh={handleRefresh}
              />
            )}
            {activeTab == "Students" && (
              <div className="max-w-full overflow-x-auto py-4 px-4">
                <div className="flex justify-between mb-4">
                  <div className="flex md:w-[30%] w-[70%] items-center gap-5 rounded-lg px-3 py-2 bg-gray-200">
                    <IoSearchOutline className="text-gray-800" />
                    <input
                      type="text"
                      placeholder="Search student"
                      value={searchStudentTerm}
                      onChange={handleStudentSearch}
                      className="w-full outline-none bg-transparent"
                    />
                  </div>
                  {classInfo?.role == "owner" && (
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
                      onClick={() => setShowAddStudentModal(true)}
                    >
                      <IoPersonAddOutline className="text-lg" />
                      Add Student
                    </button>
                  )}
                </div>
                <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="max-h-76 overflow-y-auto">
                    <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Username</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Subject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classInfo?.students &&
                        classInfo.students.length > 0 ? (
                          classInfo.students
                            .filter((student) =>
                              searchStudentTerm.trim() === ""
                                ? true
                                : student.name
                                    .toLowerCase()
                                    .includes(
                                      searchStudentTerm.trim().toLowerCase()
                                    )
                            )
                            .map((student, idx) => (
                              <tr
                                key={student.studentId}
                                className={`${
                                  idx % 2 === 0
                                    ? "bg-white dark:bg-gray-900"
                                    : "bg-gray-50 dark:bg-gray-800"
                                } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                              >
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                  {student.name}
                                </td>
                                <td className="px-6 py-4">
                                  {student.studentId}
                                </td>
                                <td className="px-6 py-4">
                                  {new Date(
                                    student.birthDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    type="button"
                                    className="text-sm dark:text-slate-50 border dark:border-slate-50 font-bold rounded-md h-8 w-16 min-w-0 min-h-0"
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center">
                              No students found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {showAddStudentModal && (
                  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                        onClick={() => setShowAddStudentModal(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
                        Add Students
                      </h2>
                      <div className="flex gap-2 mb-4">
                        <button
                          className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors duration-150 ${
                            addStudentTab === "single"
                              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                              : "border-transparent text-gray-500 dark:text-gray-400"
                          }`}
                          onClick={() => setAddStudentTab("single")}
                        >
                          Single
                        </button>
                        <button
                          className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors duration-150 ${
                            addStudentTab === "bulk"
                              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                              : "border-transparent text-gray-500 dark:text-gray-400"
                          }`}
                          onClick={() => setAddStudentTab("bulk")}
                        >
                          Bulk Upload
                        </button>
                      </div>
                      {addStudentTab === "single" ? (
                        <form className="flex flex-col gap-2 h-90">
                          {/* Form input satu-satu student */}
                          <input
                            className="border rounded px-3 py-2"
                            placeholder="Name"
                          />
                          <input
                            className="border rounded px-3 py-2"
                            placeholder="Student Id"
                          />
                          <input
                            className="border rounded px-3 py-2"
                            placeholder="Birth date (YYYY-MM-DD)"
                          />
                          <input
                            className="border rounded px-3 py-2"
                            placeholder="Birth place"
                          />
                          <input
                            className="border rounded px-3 py-2"
                            placeholder="Contact"
                          />
                          <input
                            className="border rounded px-3 py-2"
                            placeholder="Address"
                          />
                          <div className="flex justify-end gap-2 mt-auto">
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                              onClick={() => setShowAddStudentModal(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form
                          className="flex flex-col gap-4 h-90"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!selectedFile) {
                              alert("Please select a CSV file to upload.");
                              return;
                            }
                            try {
                              await uploadStudentsCsv(selectedFile as File);
                              alert("Students uploaded successfully.");
                              setShowAddStudentModal(false);
                              setSelectedFile(null);
                              // Optionally, refresh class info to show new students
                              if (classId) {
                                const classData = await fetchClassInfo(classId);
                                if (classData) setClassInfo(classData);
                              }
                            } catch {
                              alert("Failed to upload students.");
                            }
                          }}
                        >
                          {/* Dropzone untuk upload file */}
                          <Dropzone
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                          />
                          <div className="flex justify-end gap-2 mt-auto pt-8">
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                              onClick={() => {
                                setShowAddStudentModal(false);
                                setSelectedFile(null);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default ClassPage;

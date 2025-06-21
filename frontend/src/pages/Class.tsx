import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";
import {
  getClassByClassId,
  getUserInfo,
  getUsersByUsername,
  inviteInstructors,
} from "../lib/api";
import { useParams } from "react-router-dom";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";
import { IoPersonAddOutline } from "react-icons/io5";
import { FiTrash2 } from "react-icons/fi";
import Spinner from "../components/Spinner";

interface Instructor {
  instructorId: string;
  name: string;
  username: string;
  id: string;
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

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);

  const [activeTab, setActiveTab] = useState("Overview");

  const [showAddTeacherModal, setshowAddTeacherModal] = useState(false);
  const [teacher, setTeacher] = useState("");
  const [searchResults, setSearchResults] = useState<Instructor[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedInstructor, setSelectedInstructor] = useState<
    Instructor[] | null
  >(null);

  // Get username
  const [currentUser, setCurrentUser] = useState<{
    username: string;
  } | null>(null);

  const isMounted = useRef(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTab = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleAddTeacherModal = () => {
    setshowAddTeacherModal((prev) => !prev);
    setTeacher("");
    setSelectedInstructor(null);
  };

  const toggleAddInstructor = (instructor: Instructor) => {
    setSelectedInstructor((prev) =>
      prev ? [...prev, instructor] : [instructor]
    );
    setSearchResults([]);
    setTeacher("");
  };

  // Debounced search effect
  useEffect(() => {
    if (!teacher) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await getUsersByUsername(teacher);
        if (res.data && Array.isArray(res.data)) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [teacher]);

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

  useEffect(() => {
    const fetchData = async () => {
      if (isMounted.current || !classId) return;
      const classData = await fetchClassInfo(classId);
      console.log(classData);
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
              <div className="max-w-full overflow-x-auto py-4 px-4">
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
                    onClick={toggleAddTeacherModal}
                  >
                    <IoPersonAddOutline className="text-lg" />
                    Add Instructor
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Subject</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classInfo?.instructors &&
                      classInfo.instructors.length > 0 ? (
                        classInfo.instructors.map((instructor, idx) => (
                          <tr
                            key={instructor.instructorId}
                            className={`${
                              idx % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50 dark:bg-gray-800"
                            } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {instructor.name}
                            </td>
                            <td className="px-6 py-4">{instructor.username}</td>
                            <td className="px-6 py-4">{instructor.status}</td>
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
                            No instructors found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {showAddTeacherModal && (
                  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                        onClick={toggleAddTeacherModal}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
                        Invite users as Instructors
                      </h2>
                      <form
                        className="flex flex-col gap-4 h-90"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (
                            !selectedInstructor ||
                            selectedInstructor.length === 0
                          ) {
                            alert("Please select at least one instructor.");
                            return;
                          }
                          if (!classId) {
                            alert("Class ID not found.");
                            return;
                          }
                          try {
                            await inviteInstructors(
                              classId,
                              selectedInstructor.map((i) => ({
                                username: i.username,
                                id: i.id,
                              }))
                            );
                            alert("Instructors invited successfully.");
                            setSelectedInstructor(null);
                            setTeacher("");
                            setSearchResults([]);
                            setshowAddTeacherModal(false);
                          } catch (error) {
                            console.error(
                              "Failed to invite instructors:",
                              error
                            );
                            alert("Failed to invite instructors.");
                          }
                        }}
                      >
                        <div className="relative flex flex-col gap-2">
                          <label>Instructors</label>
                          <div className="relative w-full">
                            <input
                              type="text"
                              value={teacher}
                              onChange={(e) => {
                                setTeacher(e.target.value);
                              }}
                              autoComplete="off"
                              className="mt-1 block w-full px-4 py-2 border h-8 p-2 rounded-md pr-10"
                            />
                            {searchLoading && <Spinner />}
                          </div>
                          {!searchLoading &&
                            teacher !== "" &&
                            searchResults.length === 0 && (
                              <div className="mt-1 text-xs text-red-500">
                                User not found
                              </div>
                            )}
                          {!searchLoading &&
                            teacher !== "" &&
                            searchResults.length > 0 && (
                              <div className="absolute top-18 left-0 right-0 mt-1 z-30 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 shadow-lg overflow-hidden">
                                {searchResults
                                  .filter(
                                    (user) =>
                                      user.username !== currentUser?.username &&
                                      !selectedInstructor?.some(
                                        (selected) =>
                                          selected.username === user.username
                                      )
                                  )
                                  .map((user) => (
                                    <button
                                      key={user.username}
                                      type="button"
                                      onClick={() => {
                                        toggleAddInstructor(user);
                                      }}
                                      className="flex items-center w-full z-50 px-4 py-2 text-left text-sm hover:bg-indigo-100 dark:hover:bg-gray-800 transition-colors border-b last:border-b-0 border-slate-100 dark:border-gray-800"
                                    >
                                      <div className="grid h-8 w-8 place-content-center text-lg bg-indigo-100 dark:bg-gray-800 rounded-full mr-3 text-indigo-700 dark:text-white font-bold uppercase">
                                        {user.username.charAt(0)}
                                      </div>
                                      <span className="block text-xs font-semibold text-font-primary dark:text-slate-50">
                                        {user.username}
                                      </span>
                                    </button>
                                  ))}
                              </div>
                            )}
                          {selectedInstructor && (
                            <div
                              className="relative left-0 right-0 mt-1 z-20 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-md overflow-hidden"
                              style={{
                                maxHeight:
                                  selectedInstructor &&
                                  selectedInstructor.length > 4
                                    ? "200px"
                                    : "auto",
                                overflowY:
                                  selectedInstructor &&
                                  selectedInstructor.length > 4
                                    ? "auto"
                                    : "visible",
                              }}
                            >
                              {selectedInstructor &&
                                selectedInstructor.map((user) => (
                                  <div
                                    key={user.username}
                                    className="flex items-center w-full px-4 py-2 text-left text-sm border-b last:border-b-0 border-slate-100 dark:border-gray-800"
                                  >
                                    <div className="grid h-8 w-8 place-content-center text-lg bg-indigo-100 dark:bg-gray-800 rounded-full mr-3 text-indigo-700 dark:text-white font-bold uppercase">
                                      {user.username.charAt(0)}
                                    </div>
                                    <span className="block text-xs font-semibold text-font-primary dark:text-slate-50 flex-1">
                                      {user.username}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated =
                                          selectedInstructor.filter(
                                            (i) => i.username !== user.username
                                          );
                                        setSelectedInstructor(
                                          updated.length ? updated : null
                                        );
                                        setTeacher("");
                                        setSearchResults([]);
                                      }}
                                      className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-auto pt-8">
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={toggleAddTeacherModal}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                          >
                            Invite
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab == "Students" && (
              <div className="max-w-full overflow-x-auto py-4 px-4">
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
                  >
                    <IoPersonAddOutline className="text-lg" />
                    Add Student
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Subject</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classInfo?.instructors &&
                      classInfo.instructors.length > 0 ? (
                        classInfo.instructors.map((instructor, idx) => (
                          <tr
                            key={instructor.instructorId}
                            className={`${
                              idx % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50 dark:bg-gray-800"
                            } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {instructor.name}
                            </td>
                            <td className="px-6 py-4">
                              {instructor.instructorId}
                            </td>
                            <td className="px-6 py-4">{instructor.status}</td>
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
                            No instructors found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

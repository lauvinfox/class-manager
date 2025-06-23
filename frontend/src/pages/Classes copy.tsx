import { MdGroupAdd } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { FaThLarge, FaList } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";

import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getUserInfo, getUsersByUsername } from "../lib/api";
import Spinner from "../components/Spinner";

interface Instructor {
  username: string;
}

interface InstructorRole {
  role: string;
}

const Classes = () => {
  const { darkMode } = useTheme();
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [showModal, setShowModal] = useState(false);

  const [modalStep, setModalStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [student, setStudent] = useState("");

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

  // Role
  const [roleInput, setRoleInput] = useState("");
  const [instructorRoles, setInstructorRoles] = useState<{subjectName: string}[]>([]);

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

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const toggleShowModal = () => {
    setShowModal((prev) => !prev);
    setModalStep(1);
    setName("");
    setDescription("");
    setStudent("");
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
            <ClassHeader
              viewMode={viewMode}
              setViewMode={setViewMode}
              toggleShowModal={toggleShowModal}
            />
            <div className="w-full">
              {viewMode === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-6">
                  {dummyClasses.map((cls) => (
                    <ClassCard key={cls.id} title={cls.title} img={cls.img} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col">
                  {dummyClasses.map((cls) => (
                    <ClassListItem
                      key={cls.id}
                      title={cls.title}
                      img={cls.img}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={toggleShowModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
              Create Class
            </h2> 
            
            
          </div>
        </div>

           
            {modalStep === 3 && (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  toggleShowModal();
                }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="w-full rounded border border-slate-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-font-primary dark:text-white"
                      placeholder="Add role"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                      onClick={() => {
                        if (roleInput.trim() !== "") {
                          setInstructorRoles((prev) => [
                            ...prev,
                            { subjectName: roleInput.trim() },
                          ]);
                          setRoleInput("");
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {instructorRoles.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {instructorRoles.map((r, idx) => (
                        <li
                          key={idx}
                          className="flex items-center bg-indigo-100 dark:bg-gray-800 rounded px-2 py-1"
                        >
                          <span className="font-semibold text-indigo-700 dark:text-white mr-2">
                            {r.subjectName}
                          </span>
                          <button
                            type="button"
                            className="text-xs text-red-500 hover:underline"
                            onClick={() =>
                              setInstructorRoles(
                                instructorRoles.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex justify-between gap-2 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={(e) => {
                      e.preventDefault();
                      setModalStep(1);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    disabled={!student || !teacher}
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
            {modalStep === 4 && (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  toggleShowModal();
                }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Student
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-font-primary dark:text-white"
                    placeholder="Student name or ID"
                    value={student}
                    onChange={(e) => setStudent(e.target.value)}
                  />
                </div>
                <div className="flex justify-between gap-2 mt-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={(e) => {
                      e.preventDefault();
                      setModalStep(1);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    disabled={!student || !teacher}
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthProvider>
  );
};

interface ClassHeaderProps {
  viewMode: "card" | "list";
  setViewMode: (v: "card" | "list") => void;
  toggleShowModal: () => void;
}

const ClassHeader = ({
  viewMode,
  setViewMode,
  toggleShowModal,
}: ClassHeaderProps) => {
  return (
    <nav className="relative top-0 z-40 flex items-center justify-between bg-primary border-b border-slate-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-800 min-w-0">
      <span className="text-lg font-semibold text-font-primary dark:text-white select-none">
        Classes
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`flex items-center justify-center rounded-md border px-2 py-1 text-base ${
            viewMode === "card"
              ? "bg-indigo-100 dark:bg-gray-800 border-indigo-400"
              : "border-slate-300 dark:border-gray-700"
          }`}
          onClick={() => setViewMode("card")}
          aria-label="Card view"
        >
          <FaThLarge />
        </button>
        <button
          type="button"
          className={`flex items-center justify-center rounded-md border px-2 py-1 text-base ${
            viewMode === "list"
              ? "bg-indigo-100 dark:bg-gray-800 border-indigo-400"
              : "border-slate-300 dark:border-gray-700"
          }`}
          onClick={() => setViewMode("list")}
          aria-label="List view"
        >
          <FaList />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-4 text-sm dark:text-slate-50 border dark:border-slate-50 font-bold rounded-md h-10 min-w-0 min-h-0 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800 ml-2"
          onClick={toggleShowModal}
        >
          <MdGroupAdd className="text-lg" />
          <span>Create class</span>
        </button>
      </div>
    </nav>
  );
};

const dummyClasses = [
  {
    id: 1,
    title: "Mathematics 101",
    img: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    title: "Physics Advanced",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    title: "History of Art",
    img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    title: "History of Art",
    img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80",
  },
];

const ClassCard = ({ title, img }: { title: string; img: string }) => (
  <div className="bg-white hover:bg-slate-100 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-row items-center transition h-40 w-76 justify-center gap-4">
    <img
      src={img}
      alt={title}
      className="size-24 object-cover rounded-md mb-3 border border-slate-200 dark:border-gray-700"
    />
    <div className="text-base font-semibold text-font-primary dark:text-white text-center">
      {title}
    </div>
  </div>
);

const ClassListItem = ({ title, img }: { title: string; img: string }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition hover:bg-slate-100 dark:hover:bg-gray-700">
    <img
      src={img}
      alt={title}
      className="size-10 object-cover rounded-md border border-slate-200 dark:border-gray-700"
    />
    <div className="text-base font-semibold text-font-primary dark:text-white">
      {title}
    </div>
  </div>
);

export default Classes;

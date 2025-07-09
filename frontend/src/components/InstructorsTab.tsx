import { IoPersonAddOutline, IoSearchOutline } from "react-icons/io5";
import { ClassInfo, Instructor } from "../types/types";
import { useEffect, useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import {
  addSubjectsToClass,
  getUsersByUsername,
  giveSubjectToInstructor,
  inviteInstructors,
} from "../lib/api";
import Spinner from "./Spinner";

interface CurrentUser {
  username: string;
}

const InstructorsTab = ({
  classInfo,
  currentUser,
  classId,
  handleRefresh,
}: {
  classInfo: ClassInfo | null;
  currentUser: CurrentUser | null;
  classId: string | undefined;
  handleRefresh: () => void;
}) => {
  // Instructor
  const [showAddTeacherModal, setshowAddTeacherModal] = useState(false);
  const [teacher, setTeacher] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<
    Instructor[] | null
  >(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Instructor[]>([]);
  const [searchInstructorTerm, setSearchInstructorTerm] = useState("");

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const { mutate: inviteInstructorsMutation } = useMutation({
    mutationFn: async (instructors: { username: string; id: string }[]) => {
      if (!classId) throw new Error("Class ID not found");
      return inviteInstructors(classId, instructors);
    },
    onSuccess: () => {
      alert("Instructors invited successfully.");
      setshowAddTeacherModal(false);
      setSelectedInstructor(null);
      setTeacher("");
      setSearchResults([]);
      handleRefresh();
    },
    onError: (error) => {
      console.error("Failed to invite instructors:", error);
      alert("Failed to invite instructors.");
    },
  });

  const handleAddInstructors = async () => {
    if (!selectedInstructor || selectedInstructor.length === 0) {
      alert("Please select at least one instructor.");
      return;
    }
    if (!classId) {
      alert("Class ID not found.");
      return;
    }
    inviteInstructorsMutation(
      selectedInstructor.map((i) => ({
        username: i.username,
        id: i.id,
      }))
    );
  };

  const handleInstructorSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInstructorTerm(event.target.value);
  };

  const toggleAddTeacherModal = () => {
    setshowAddTeacherModal((prev) => !prev);
    setTeacher("");
    setSelectedInstructor(null);
  };

  const handleTeacherInput = (input: string) => {
    setTeacher(input);
  };

  const toggleAddInstructor = (instructor: Instructor) => {
    setSelectedInstructor((prev) =>
      prev ? [...prev, instructor] : [instructor]
    );
    setSearchResults([]);
    setTeacher("");
  };

  const handleChooseInstructor = (
    selectedInstructor: Instructor[],
    user: Instructor
  ) => {
    const updated = selectedInstructor.filter(
      (i) => i.username !== user.username
    );
    setSelectedInstructor(updated.length ? updated : null);
    setTeacher("");
    setSearchResults([]);
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

  // Subject
  const { mutate: addSubjects } = useMutation({
    mutationFn: async (subjects: string[]) => {
      if (!classId) throw new Error("Class ID not found");
      // Simulate API call to add subjects
      const response = await addSubjectsToClass(classId, subjects);
      return response.data;
    },
    onSuccess: () => {
      alert("Subjects added successfully.");
      setShowSubjectModal(false);
      setSubjectInput("");
      setInstructorSubject([]);
      handleRefresh();
    },
    onError: (error) => {
      console.error("Failed to add subjects:", error);
      alert("Failed to add subjects.");
    },
  });

  const { mutate: giveSubject } = useMutation({
    mutationFn: async ({
      classId,
      instructorId,
      subjectName,
    }: {
      classId: string;
      instructorId: string;
      subjectName: string;
    }) => {
      const response = await giveSubjectToInstructor(
        classId,
        instructorId,
        subjectName
      );

      return response.data;
    },
    onSuccess: () => {
      alert("Subject given to instructor successfully.");
      setShowGiveSubjectModal(false);
      setSelectedInstructorForSubject(null);
      setSelectedSubject(null);
      handleRefresh();
    },
    onError: (error) => {
      console.error("Failed to give subject to instructor:", error);
      alert("Failed to give subject to instructor.");
    },
  });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showGiveSubjectModal, setShowGiveSubjectModal] = useState(false);
  const [selectedInstructorForSubject, setSelectedInstructorForSubject] =
    useState<Instructor | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [instructorSubjects, setInstructorSubject] = useState<
    { subjectName: string }[]
  >([]);
  const [subjectInput, setSubjectInput] = useState("");

  const handleSubjectInput = (subject: string) => setSubjectInput(subject);
  const toggleAddSubjectModal = () => {
    setShowSubjectModal((prev) => !prev);
  };

  const handleGiveSubjectModal = (instructor: Instructor) => {
    if (showGiveSubjectModal) {
      setShowGiveSubjectModal(false);
    } else {
      setSelectedInstructorForSubject(instructor);
      setShowGiveSubjectModal(true);
    }
  };

  const handleDeleteSelectedSubject = (idx: number) => {
    setInstructorSubject(
      instructorSubjects.filter(
        (_: { subjectName: string }, i: number) => i !== idx
      )
    );
  };

  const toggleAddSubjectInput = () => {
    if (subjectInput.trim() !== "") {
      setInstructorSubject((prev) => [
        ...prev,
        { subjectName: subjectInput.trim() },
      ]);
      setSubjectInput("");
    }
  };

  const handleSelectedSubject = (subject: string) =>
    setSelectedSubject(subject);

  const handleGiveSubject = async () => {
    if (!selectedSubject || !selectedInstructorForSubject || !classId) return;
    giveSubject({
      classId,
      instructorId: selectedInstructorForSubject.instructorId,
      subjectName: selectedSubject,
    });
    setShowGiveSubjectModal(false);
    setSelectedSubject(null);
  };

  return (
    <div className="max-w-full overflow-x-auto py-4 px-4">
      <div className="flex justify-between items-center mb-4 gap-2">
        {/* Search bar di kiri */}
        <div className="flex md:w-[30%] w-[70%] items-center gap-5 rounded-lg px-3 py-2 bg-gray-200">
          <IoSearchOutline className="text-gray-800" />
          <input
            type="text"
            placeholder="Search instructor"
            value={searchInstructorTerm}
            onChange={handleInstructorSearch}
            className="w-full outline-none bg-transparent"
          />
        </div>
        {classInfo?.role == "owner" && (
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              onClick={handleRefresh}
              title="Refresh Table"
            >
              {/* Icon Refresh */}
              Refresh
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              onClick={toggleAddSubjectModal}
              title="Add Subject"
            >
              {/* Icon Add Subject */}
              Add Subject
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              onClick={toggleAddTeacherModal}
            >
              <IoPersonAddOutline className="text-lg" />
              Add Instructor
            </button>
          </div>
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
              {classInfo?.instructors && classInfo.instructors.length > 0 ? (
                classInfo.instructors
                  .filter((instructor) => {
                    // Filter by search term
                    const matchesSearch =
                      searchInstructorTerm.trim() === ""
                        ? true
                        : instructor.username
                            .toLowerCase()
                            .includes(
                              searchInstructorTerm.trim().toLowerCase()
                            );
                    // If not owner, hide instructors with status "pending"
                    if (
                      classInfo.role !== "owner" &&
                      instructor.status === "pending"
                    ) {
                      return false;
                    }
                    return matchesSearch;
                  })
                  .map((instructor, idx) => {
                    return (
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
                        <td
                          className={`px-6 py-4 ${
                            instructor.status == "accepted"
                              ? "text-green-500"
                              : "text-yellow-400"
                          }`}
                        >
                          {instructor.status}
                        </td>
                        <td className="px-6 py-4 text-center relative">
                          <div className="inline-block">
                            {instructor.subject ? (
                              <span className="inline-block px-3 py-1 rounded-md bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white font-semibold">
                                {instructor.subject}
                              </span>
                            ) : instructor.status === "pending" ? (
                              <span className="inline-block px-3 py-1 rounded-md dark:bg-yellow-700 text-yellow-700 dark:text-white font-semibold">
                                need confirmation
                              </span>
                            ) : classInfo?.role === "owner" ? (
                              <button
                                type="button"
                                className="flex items-center justify-center gap-1 text-sm font-semibold rounded-md h-8 px-3 min-w-0 min-h-0 border border-gray-300 dark:border-slate-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-slate-50 hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                                onClick={() =>
                                  handleGiveSubjectModal(instructor)
                                }
                              >
                                <span>Give Subject</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">
                                Undetermined
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
      {showGiveSubjectModal && selectedInstructorForSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={() =>
                handleGiveSubjectModal(selectedInstructorForSubject)
              }
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
              Give Subject to {selectedInstructorForSubject.name}
            </h2>
            <div>
              <p className="mb-4">Choose one subject to give to</p>
              <div className="flex flex-col gap-2 mb-4 max-h-56 overflow-y-auto">
                {classInfo?.subjects && classInfo.subjects.length > 0 ? (
                  classInfo.subjects
                    .filter((subject: string) => {
                      // Jangan tampilkan jika subject sudah dipakai oleh instructor manapun
                      return !classInfo.instructors?.some(
                        (inst) => inst.subject === subject
                      );
                    })
                    .map((subject: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        className={`w-full px-3 py-2 rounded dark:bg-gray-800 dark:text-white font-semibold transition text-left ${
                          selectedSubject === subject
                            ? "bg-indigo-200 dark:bg-indigo-700 border-indigo-500"
                            : "hover:bg-indigo-200 dark:hover:bg-gray-700 dark:border-gray-700"
                        }`}
                        onClick={() => handleSelectedSubject(subject)}
                      >
                        {subject}
                      </button>
                    ))
                ) : (
                  <span className="text-gray-500">No subjects available.</span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() =>
                  handleGiveSubjectModal(selectedInstructorForSubject)
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                disabled={!selectedSubject}
                onClick={handleGiveSubject}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={toggleAddTeacherModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
              Invite Instructors
            </h2>
            <form
              className="flex flex-col gap-4 h-90"
              onSubmit={async (e) => {
                e.preventDefault();
                handleAddInstructors();
              }}
            >
              <div className="relative flex flex-col gap-2">
                <label>Instructors</label>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={teacher}
                    onChange={(e) => {
                      handleTeacherInput(e.target.value);
                    }}
                    autoComplete="off"
                    className="mt-1 block w-full px-4 py-2 border h-8 p-2 rounded-md pr-10"
                  />
                  {searchLoading && <Spinner />}
                </div>
                {(() => {
                  const filteredResults = searchResults.filter(
                    (user) =>
                      user.username !== currentUser?.username &&
                      !selectedInstructor?.some(
                        (selected) => selected.username === user.username
                      ) &&
                      !classInfo?.instructors?.some(
                        (inst) => inst.username === user.username
                      )
                  );
                  if (
                    !searchLoading &&
                    teacher !== "" &&
                    (searchResults.length === 0 ||
                      (searchResults.length > 0 &&
                        filteredResults.length === 0))
                  ) {
                    return (
                      <div className="mt-1 text-xs text-red-500">
                        User not found
                      </div>
                    );
                  }
                  if (
                    !searchLoading &&
                    teacher !== "" &&
                    filteredResults.length > 0
                  ) {
                    return (
                      <div className="absolute top-18 left-0 right-0 mt-1 z-30 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 shadow-lg overflow-hidden">
                        {filteredResults.map((user) => (
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
                    );
                  }
                  return null;
                })()}
                {selectedInstructor && (
                  <div
                    className="relative left-0 right-0 mt-1 z-20 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-md overflow-hidden"
                    style={{
                      maxHeight:
                        selectedInstructor && selectedInstructor.length > 4
                          ? "200px"
                          : "auto",
                      overflowY:
                        selectedInstructor && selectedInstructor.length > 4
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
                            onClick={() =>
                              handleChooseInstructor(selectedInstructor, user)
                            }
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
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={toggleAddSubjectModal}
              aria-label="Close"
            >
              &times;
            </button>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                addSubjects(instructorSubjects.map((s) => s.subjectName));
                handleRefresh();
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="w-full rounded border border-slate-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-font-primary dark:text-white"
                    placeholder="Add subject"
                    value={subjectInput}
                    onChange={(e) => handleSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        toggleAddSubjectInput();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    onClick={toggleAddSubjectInput}
                  >
                    Add
                  </button>
                </div>
                {instructorSubjects.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {instructorSubjects.map(
                      (r: { subjectName: string }, idx: number) => (
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
                            onClick={() => handleDeleteSelectedSubject(idx)}
                          >
                            <FiTrash2 />
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
              <div className="flex justify-between gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAddSubjectModal();
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                  disabled={instructorSubjects.length === 0}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsTab;

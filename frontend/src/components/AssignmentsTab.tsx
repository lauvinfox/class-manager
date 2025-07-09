import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAssignmentByClassId,
  getAssignmentById,
  getAssignmentsByClass,
  giveScores,
} from "../lib/api";
import { useState } from "react";
import { getThisMonthRange, getThisWeekRange } from "../utils/date";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { MdSort } from "react-icons/md";
import { Assignment, ClassInfo } from "../types/types";
import Spinner from "./Spinner";
import { FaSortAlphaUp, FaSortAlphaDownAlt } from "react-icons/fa";

interface Grade {
  studentId: {
    _id: string;
    name: string;
  };
  notes?: string;
  score: number;
}

interface AssignmentInfo {
  _id: string;
  assignedBy: { _id: string; name: string };
  assignmentDate: Date;
  assignmentType: "homework" | "quiz" | "exam" | "project" | "finalExam";
  classId: string;
  createdAt: Date;
  description: string;
  endTime: string;
  grades: Grade[];
  startTime: string;
  subject: string;
  title: string;
}

const AssignmentsTab = ({
  classId,
  classInfo,
  handleRefresh,
}: {
  classId: string | undefined;
  classInfo: ClassInfo | null;
  handleRefresh: () => void;
}) => {
  // Assignments
  const { data: assignmentsData } = useQuery({
    queryKey: ["assignmentsClass"],
    queryFn: async () => {
      const res = await getAssignmentsByClass(classId as string);
      return res.data;
    },
  });

  const subjects = classInfo?.subjects || [];

  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectDropdown, setSubjectDropdown] = useState(false);

  // Add missing sort dropdown state
  const [sortDropdown, setSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState<"all" | "week" | "month">("all");

  const { weekStart, weekEnd } = getThisWeekRange();

  const { monthStart, monthEnd } = getThisMonthRange();

  const { mutateAsync: getAssignment, isPending } = useMutation({
    mutationFn: async ({
      classId,
      assignmentId,
    }: {
      classId: string;
      assignmentId: string;
    }) => {
      const res = await getAssignmentById(classId, assignmentId);
      console.log("Assignment Data:", res.data);
      return res.data;
    },
  });

  const { mutateAsync: createAssignment } = useMutation({
    mutationFn: async ({
      classId,
      assignment,
    }: {
      classId: string;
      assignment: {
        title: string;
        description: string;
        assignmentDate: string;
        assignmentType: "homework" | "quiz" | "exam" | "project" | "finalExam";
        startTime: string;
        endTime: string;
      };
    }) => {
      const res = await createAssignmentByClassId(classId, assignment);
      return res.data;
    },
  });

  const { mutate: giveScore } = useMutation({
    mutationFn: async ({
      classId,
      assignmentId,
      scoresData,
    }: {
      classId: string;
      assignmentId: string;
      scoresData: {
        studentId: string;
        score: number;
        notes?: string;
      }[];
    }) => {
      const res = await giveScores(classId, assignmentId, scoresData);
      console.log(res);
      return res.data;
    },
  });

  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentInfo | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const memberSubject =
    classInfo?.instructors && classInfo.instructors.length > 0
      ? classInfo.instructors[0].subject
      : "";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignmentDate: "",
    assignmentType: "homework" as
      | "homework"
      | "quiz"
      | "exam"
      | "project"
      | "finalExam",
    startTime: "",
    endTime: "",
  });

  const handleCreateAssignment = async (
    e: React.FormEvent,
    classId: string,
    assignment: {
      title: string;
      description: string;
      assignmentDate: string;
      assignmentType: "homework" | "quiz" | "exam" | "project" | "finalExam";
      startTime: string;
      endTime: string;
    }
  ) => {
    e.preventDefault();
    // TODO: panggil API create assignment di sini
    createAssignment({
      classId: classId as string,
      assignment: assignment,
    })
      .then(() => {
        setForm({
          title: "",
          description: "",
          assignmentDate: "",
          assignmentType: "homework" as
            | "homework"
            | "quiz"
            | "exam"
            | "project"
            | "finalExam",
          startTime: "",
          endTime: "",
        });
      })
      .catch((error) => {
        console.error("Error creating assignment:", error);
      });
    setShowCreateModal(false);
    alert("Assignment created successfully!");
  };
  const [studentNameSort, setStudentNameSort] = useState<"asc" | "desc">("asc");
  return (
    <div className="max-w-full overflow-x-auto py-4 px-4">
      <div className="flex justify-end mb-4 gap-2">
        {classInfo?.role == "owner" && (
          <>
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
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => setSubjectDropdown((v) => !v)}
            >
              <span>{selectedSubject == "" ? "Subject" : selectedSubject}</span>
              <FiChevronDown className="ml-auto" />
            </button>
          </>
        )}
        {classInfo?.role == "member" && (
          <>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              title="Create Assignment"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus />
              Create Assignment
            </button>
            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
            >
              <span>
                {classInfo.instructors && classInfo.instructors.length > 0
                  ? classInfo.instructors[0].subject
                  : ""}
              </span>
            </button>
          </>
        )}
        {classInfo?.role == "owner" && subjectDropdown && (
          <div className="z-10 absolute mt-12 mr-42 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              {subjects.length === 0 ? (
                <li>
                  <span className="block px-4 py-2 text-gray-400">
                    No subjects
                  </span>
                </li>
              ) : (
                subjects.map((subject) => (
                  <li key={subject}>
                    <button
                      type="button"
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                        selectedSubject === subject
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSubjectDropdown(false);
                      }}
                    >
                      {subject}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <button
          type="button"
          className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 w-40 rounded-lg shadow"
          title="Sort"
          onClick={() => setSortDropdown((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <MdSort className="text-lg" />
            {sortOption === "all"
              ? "All"
              : sortOption === "week"
              ? "This Week"
              : "This Month"}
          </span>
          <FiChevronDown className="ml-auto" />
        </button>
        {sortDropdown && (
          <div className="z-10 absolute mt-12  bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700">
            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button
                  type="button"
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                    sortOption === "all"
                      ? "font-bold text-indigo-600 dark:text-indigo-400"
                      : ""
                  }`}
                  onClick={() => {
                    setSortOption("all");
                    setSortDropdown(false);
                  }}
                >
                  All
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                    sortOption === "week"
                      ? "font-bold text-indigo-600 dark:text-indigo-400"
                      : ""
                  }`}
                  onClick={() => {
                    setSortOption("week");
                    setSortDropdown(false);
                  }}
                >
                  This Week
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                    sortOption === "month"
                      ? "font-bold text-indigo-600 dark:text-indigo-400"
                      : ""
                  }`}
                  onClick={() => {
                    setSortOption("month");
                    setSortDropdown(false);
                  }}
                >
                  This Month
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {classInfo?.role === "owner" &&
          selectedSubject &&
          assignmentsData &&
          assignmentsData[selectedSubject] &&
          assignmentsData[selectedSubject]
            .filter((assignment: Assignment) => {
              if (sortOption === "all") return true;
              const date = new Date(assignment.assignmentDate);
              if (sortOption === "week") {
                return date >= weekStart && date <= weekEnd;
              }
              if (sortOption === "month") {
                return date >= monthStart && date <= monthEnd;
              }
              return true;
            })
            .map((assignment: Assignment) => (
              <div
                key={assignment.assignmentId}
                className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100  hover:bg-indigo-50 dark:hover:bg-gray-700"
                onClick={async () => {
                  const data = await getAssignment({
                    classId: classId as string,
                    assignmentId: assignment.assignmentId,
                  });
                  setSelectedAssignment(data);
                  setShowAssignmentModal(true);
                }}
              >
                <div className="font-semibold text-lg mb-2">
                  {assignment.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {assignment.assignmentDate &&
                    (() => {
                      const date = new Date(assignment.assignmentDate);
                      const day = date.getDate();
                      const month = date.toLocaleString("id-ID", {
                        month: "long",
                      });
                      const year = date.getFullYear();
                      return `${month} ${day}, ${year}`;
                    })()}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                  <div>
                    {/* Left side: you can add more info here if needed */}
                  </div>
                  {assignment.grades.length === 0 ? (
                    <div className="ml-auto text-right">Ungraded</div>
                  ) : (
                    <div className="ml-auto text-right">
                      {
                        assignment.grades.filter(
                          (grade) =>
                            grade.score !== undefined && grade.score !== null
                        ).length
                      }
                      /{classInfo?.students?.length}
                    </div>
                  )}
                </div>
                {/* Optionally, show more details here */}
              </div>
            ))}
        {classInfo?.role === "member" &&
          assignmentsData &&
          assignmentsData[memberSubject] &&
          assignmentsData[memberSubject]
            .filter((assignment: Assignment) => {
              if (sortOption === "all") return true;
              const date = new Date(assignment.assignmentDate);
              if (sortOption === "week") {
                return date >= weekStart && date <= weekEnd;
              }
              if (sortOption === "month") {
                return date >= monthStart && date <= monthEnd;
              }
              return true;
            })
            .map((assignment: Assignment) => (
              <div
                key={assignment.assignmentId}
                className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100  hover:bg-indigo-50 dark:hover:bg-gray-700"
                onClick={async () => {
                  const data = await getAssignment({
                    classId: classId as string,
                    assignmentId: assignment.assignmentId,
                  });
                  setSelectedAssignment(data);
                  setShowAssignmentModal(true);
                }}
              >
                <div className="font-semibold text-lg mb-2">
                  {assignment.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {assignment.assignmentDate &&
                    (() => {
                      const date = new Date(assignment.assignmentDate);
                      const day = date.getDate();
                      const month = date.toLocaleString("id-ID", {
                        month: "long",
                      });
                      const year = date.getFullYear();
                      return `${month} ${day}, ${year}`;
                    })()}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                  <div>
                    {/* Left side: you can add more info here if needed */}
                  </div>
                  {assignment.grades.length === 0 ? (
                    <div className="ml-auto text-right">Ungraded</div>
                  ) : (
                    <div className="ml-auto text-right">
                      {
                        assignment.grades.filter(
                          (grade) =>
                            grade.score !== undefined && grade.score !== null
                        ).length
                      }
                      /{classInfo?.students?.length}
                    </div>
                  )}
                </div>
                {/* Optionally, show more details here */}
              </div>
            ))}
      </div>
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex items-center justify-center h-full w-full">
            <Spinner />
          </div>
        </div>
      )}
      {showAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[960px] h-[560px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={() => {
                setShowAssignmentModal(false);
                setSelectedAssignment(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">
              {selectedAssignment.title}
            </h2>
            <div className="mb-2 text-gray-500 dark:text-gray-300">
              {selectedAssignment.assignmentDate &&
                (() => {
                  const date = new Date(selectedAssignment.assignmentDate);
                  const day = date.getDate();
                  const month = date.toLocaleString("id-ID", { month: "long" });
                  const year = date.getFullYear();
                  return `${month} ${day}, ${year}`;
                })()}
            </div>
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-4">
              <div>
                <span className="font-semibold">Assigned By:</span>{" "}
                {selectedAssignment.assignedBy.name}
              </div>
              <div>
                <span className="font-semibold">Type:</span>{" "}
                {selectedAssignment.assignmentType}
              </div>
              <div>
                <span className="font-semibold">Start Time:</span>{" "}
                {selectedAssignment.startTime
                  ? new Date(selectedAssignment.startTime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )
                  : ""}
              </div>
              <div>
                <span className="font-semibold">End Time:</span>{" "}
                {selectedAssignment.endTime
                  ? new Date(selectedAssignment.endTime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )
                  : ""}
              </div>
            </div>
            <div className="mb-2">{selectedAssignment.description}</div>
            <div className="mt-5 overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="max-h-76 overflow-y-auto">
                {classInfo?.role === "owner" && (
                  <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th
                          className="px-6 py-4"
                          onClick={() => {
                            setStudentNameSort((prev) =>
                              prev === "asc" ? "desc" : "asc"
                            );
                          }}
                        >
                          <span className="flex items-center gap-0.5">
                            Name{" "}
                            {studentNameSort === "asc" ? (
                              <FaSortAlphaUp />
                            ) : (
                              <FaSortAlphaDownAlt />
                            )}
                          </span>
                        </th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAssignment.grades &&
                      selectedAssignment.grades.length > 0 ? (
                        [...selectedAssignment.grades]
                          .sort((a, b) => {
                            const nameA = a.studentId.name.toLowerCase();
                            const nameB = b.studentId.name.toLowerCase();
                            if (studentNameSort === "asc") {
                              return nameA.localeCompare(nameB);
                            } else {
                              return nameB.localeCompare(nameA);
                            }
                          })
                          .map((grade, idx) => (
                            <tr
                              key={grade.studentId._id}
                              className={`${
                                idx % 2 === 0
                                  ? "bg-white dark:bg-gray-900"
                                  : "bg-gray-50 dark:bg-gray-800"
                              } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                            >
                              <td
                                className="px-6 py-4 font-medium text-gray-900 dark:text-white"
                                onClick={() => {
                                  console.log("Clicked on student name");
                                }}
                              >
                                {typeof grade.studentId === "object" &&
                                  grade.studentId !== null &&
                                  "name" in grade.studentId &&
                                  (
                                    grade.studentId as {
                                      _id: string;
                                      name: string;
                                    }
                                  ).name}
                              </td>
                              <td
                                className="px-6 py-4"
                                onClick={() => {
                                  console.log("Clicked on student score");
                                }}
                              >
                                {grade.score !== undefined ? grade.score : ""}
                              </td>
                              <td
                                className="px-6 py-4"
                                onClick={() => {
                                  console.log("Clicked on student notes");
                                }}
                              >
                                {grade.notes ? grade.notes : ""}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-4 text-center text-gray-400"
                          >
                            No grades available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                {classInfo?.role === "member" && (
                  <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th
                          className="px-6 py-4"
                          onClick={() => {
                            setStudentNameSort((prev) =>
                              prev === "asc" ? "desc" : "asc"
                            );
                          }}
                        >
                          <span className="flex items-center gap-0.5">
                            Name{" "}
                            {studentNameSort === "asc" ? (
                              <FaSortAlphaUp />
                            ) : (
                              <FaSortAlphaDownAlt />
                            )}
                          </span>
                        </th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAssignment.grades &&
                        selectedAssignment.grades.length > 0 &&
                        [...selectedAssignment.grades]
                          .sort((a, b) => {
                            const nameA = a.studentId.name.toLowerCase();
                            const nameB = b.studentId.name.toLowerCase();
                            if (studentNameSort === "asc") {
                              return nameA.localeCompare(nameB);
                            } else {
                              return nameB.localeCompare(nameA);
                            }
                          })
                          .map((grade, idx) => (
                            <tr
                              key={grade.studentId._id}
                              className={`${
                                idx % 2 === 0
                                  ? "bg-white dark:bg-gray-900"
                                  : "bg-gray-50 dark:bg-gray-800"
                              } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                            >
                              <td
                                className="px-6 py-4 font-medium text-gray-900 dark:text-white"
                                onClick={() => {
                                  console.log("Clicked on student name");
                                }}
                              >
                                {typeof grade.studentId === "object" &&
                                  grade.studentId !== null &&
                                  "name" in grade.studentId &&
                                  (
                                    grade.studentId as {
                                      _id: string;
                                      name: string;
                                    }
                                  ).name}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  className="border border-transparent rounded px-2 py-1 w-20"
                                  value={
                                    grade.score !== undefined ? grade.score : ""
                                  }
                                  min={0}
                                  max={100}
                                  onChange={(e) => {
                                    // Update score locally (you may want to handle API update here)
                                    const newScore = Number(e.target.value);
                                    setSelectedAssignment((prev) => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        grades: prev.grades.map((g) =>
                                          g.studentId._id ===
                                          grade.studentId._id
                                            ? { ...g, score: newScore }
                                            : g
                                        ),
                                      };
                                    });
                                  }}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  className="rounded px-2 py-1 w-32"
                                  value={grade.notes || ""}
                                  onChange={(e) => {
                                    // Update notes locally (you may want to handle API update here)
                                    const newNotes = e.target.value;
                                    setSelectedAssignment((prev) => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        grades: prev.grades.map((g) =>
                                          g.studentId._id ===
                                          grade.studentId._id
                                            ? { ...g, notes: newNotes }
                                            : g
                                        ),
                                      };
                                    });
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {classInfo?.role === "member" && (
              <div className="mt-4 flex items-center gap-4">
                <button
                  className="mt-8 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                  onClick={() => {
                    if (selectedAssignment && selectedAssignment.grades) {
                      const newScoresData = selectedAssignment.grades.map(
                        (grade) => ({
                          studentId: grade.studentId._id,
                          score:
                            grade.score === undefined || grade.score === null
                              ? 0
                              : grade.score,
                          notes: grade.notes || "",
                        })
                      );
                      giveScore({
                        classId: classId as string,
                        assignmentId: selectedAssignment._id,
                        scoresData: newScoresData, // gunakan data baru ini!
                      });
                      alert("Changes saved!");
                    }
                  }}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[400px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={() => setShowCreateModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Create Assignment</h2>
            <form
              className="flex flex-col gap-1.5"
              onSubmit={(e) => {
                handleCreateAssignment(e, classId as string, form);
              }}
            >
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="title"
                >
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Assignment Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="border rounded-lg px-3 py-2 w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Assignment Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="assignmentType"
                >
                  Assignment Type<span className="text-red-500">*</span>
                </label>
                <select
                  id="assignmentType"
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.assignmentType || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      assignmentType: e.target.value as
                        | "homework"
                        | "quiz"
                        | "exam"
                        | "project"
                        | "finalExam",
                    }))
                  }
                  required
                >
                  <option value="homework">Homework</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                  <option value="finalExam">Final Exam</option>
                </select>
              </div>
              <div className="flex-col">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="assignmentDate"
                >
                  Date<span className="text-red-500">*</span>
                </label>
                <input
                  id="assignmentDate"
                  type="date"
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.assignmentDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assignmentDate: e.target.value }))
                  }
                  required
                />
                <div className="flex mt-2">
                  <div className="flex-1 mr-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="startTime"
                    >
                      Start Time<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startTime: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex-1 ml-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="endTime"
                    >
                      End Time<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endTime: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
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

export default AssignmentsTab;

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAssignmentByClassId,
  createAssistance,
  deleteAssignmentById,
  getAssignmentAdvice,
  getAssignmentById,
  getAssignmentsByClass,
  getSubjectByClassId,
  giveScores,
} from "../lib/api";
import { useState } from "react";
import { useRef, useEffect } from "react";
import { getThisMonthRange, getThisWeekRange } from "../utils/date";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { MdSort } from "react-icons/md";
import { Assignment, ClassInfo } from "../types/types";
import Spinner from "./Spinner";
import { FaSortAlphaUp, FaSortAlphaDownAlt } from "react-icons/fa";
import queryClient from "../config/queryClient";
import { useLanguage } from "../contexts/LanguageContext";
import { wordTranslations } from "../constants";

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
  grades: Grade[];
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
  const { language } = useLanguage();

  // Translation dictionary
  const t = wordTranslations(language);

  // Assignments
  const { data: assignmentsData } = useQuery({
    queryKey: ["assignmentsClass"],
    queryFn: async () => {
      const res = await getAssignmentsByClass(classId as string);
      return res.data;
    },
  });

  // OpenAI
  const {
    mutate: studentAssignmentAdvice,
    isPending: assignmentAdvicePending,
  } = useMutation({
    mutationFn: async ({
      studentName,
      studentScore,
      averageScore,
      description,
      note,
    }: {
      studentName: string;
      studentScore: number;
      averageScore: number;
      description: string;
      note?: string;
    }) => {
      const res = await getAssignmentAdvice(
        studentName,
        studentScore,
        averageScore,
        description,
        note
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAssignmentAdviceText(data);
      setShowAssistanceModal(true);
    },
  });

  const subjects = classInfo?.subjects || [];

  const [selectedSubject, setSelectedSubject] = useState(() => {
    return subjects.length > 0 ? subjects[0] : "";
  });

  // Dropdown state
  const [assignmentDropdown, setAssignmentDropdown] = useState<
    "sort" | "subject" | ""
  >("");

  // Ref for dropdown area
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (assignmentDropdown === "") return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAssignmentDropdown("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [assignmentDropdown]);

  // Add missing sort dropdown state
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
      };
    }) => {
      const res = await createAssignmentByClassId(classId, assignment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignmentsClass"],
      });
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
      return res.data;
    },
  });

  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentInfo | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const { data: memberSubject } = useQuery({
    queryKey: ["memberSubject", classId],
    queryFn: async () => {
      if (!classId) return "";
      const res = await getSubjectByClassId(classId);
      return res.data;
    },
  });

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
  });

  const handleCreateAssignment = async (
    e: React.FormEvent,
    classId: string,
    assignment: {
      title: string;
      description: string;
      assignmentDate: string;
      assignmentType: "homework" | "quiz" | "exam" | "project" | "finalExam";
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
        });
      })
      .catch((error) => {
        console.error("Error creating assignment:", error);
      });
    setShowCreateModal(false);
    alert("Assignment created successfully!");
  };
  const [studentNameSort, setStudentNameSort] = useState<"asc" | "desc" | "">(
    "asc"
  );
  const [scoreSort, setScoreSort] = useState<"asc" | "desc" | "">("");

  const { mutate: deleteAssignment } = useMutation({
    mutationFn: async ({ assignmentId }: { assignmentId: string }) => {
      if (!classId) throw new Error("Class ID is required");
      const res = await deleteAssignmentById(classId, assignmentId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignmentsClass"],
      });
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Show assistance modal
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [assignmentAdviceText, setAssignmentAdviceText] = useState("");

  const handleCreateStudentAssistance = async ({
    e,
    classId,
    subject,
    studentName,
    assignmentId,
    assignmentName,
    assignmentDescription,
    assistantResponse,
  }: {
    e: React.FormEvent;
    classId: string;
    subject: string;
    studentName: string;
    assignmentId: string;
    assignmentName: string;
    assignmentDescription: string;
    assistantResponse: string;
  }) => {
    e.preventDefault();
    try {
      await createAssistance({
        studentName,
        classId,
        subject,
        assignmentId,
        assignmentName,
        assignmentDescription,
        assistantResponse,
      });
      console.log("Assistance:", {
        studentName,
        classId,
        subject,
        assignmentId,
        assignmentName,
        assignmentDescription,
        assistantResponse,
      });
      alert("Assistance created successfully!");
      setShowAssistanceModal(false);
    } catch (error) {
      console.error("Error creating student assistance:", error);
    }
  };

  const [selectedStudentForAssistance, setSelectedStudentForAssistance] =
    useState<Grade | null>(null);

  return (
    <div className="max-w-full overflow-x-auto py-4 px-4" ref={dropdownRef}>
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
              {t.refresh}
            </button>
            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => {
                if (assignmentDropdown === "subject") {
                  setAssignmentDropdown("");
                } else {
                  setAssignmentDropdown("subject");
                }
              }}
            >
              <span>
                {selectedSubject === "" ? "Subject" : selectedSubject}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
            <button
              type="button"
              className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 w-40 rounded-lg shadow"
              title="Sort"
              onClick={() => {
                if (assignmentDropdown === "sort") {
                  setAssignmentDropdown("");
                } else {
                  setAssignmentDropdown("sort");
                }
              }}
            >
              <span className="flex items-center gap-2">
                <MdSort className="text-lg" />
                {sortOption === "all"
                  ? t.all
                  : sortOption === "week"
                  ? t.thisWeek
                  : t.thisMonth}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
          </>
        )}
        {classInfo?.role == "member" && memberSubject && (
          <>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              title="Create Assignment"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus />
              {t.createAssignment}
            </button>

            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
            >
              <span>{memberSubject}</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 w-40 rounded-lg shadow"
              title="Sort"
              onClick={() => {
                if (assignmentDropdown === "sort") {
                  setAssignmentDropdown("");
                } else {
                  setAssignmentDropdown("sort");
                }
              }}
            >
              <span className="flex items-center gap-2">
                <MdSort className="text-lg" />
                {sortOption === "all"
                  ? t.all
                  : sortOption === "week"
                  ? t.thisWeek
                  : t.thisMonth}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
          </>
        )}
        {classInfo?.role == "owner" && assignmentDropdown === "subject" && (
          <div className="z-10 absolute mt-12 mr-42 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              {subjects.length === 0 ? (
                <li>
                  <span className="block px-4 py-2 text-gray-400">
                    {t.noSubjects}
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
                        setAssignmentDropdown("");
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

        {assignmentDropdown === "sort" && (
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
                    setAssignmentDropdown("");
                  }}
                >
                  {t.all}
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
                    setAssignmentDropdown("");
                  }}
                >
                  {t.thisWeek}
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
                    setAssignmentDropdown("");
                  }}
                >
                  {t.thisMonth}
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
                  <div className="ml-auto text-right">
                    {assignment.assignmentType === "homework" ? (
                      <div className="text-green-800">{t.homework}</div>
                    ) : assignment.assignmentType === "quiz" ? (
                      <div className="text-blue-800">{t.quiz}</div>
                    ) : assignment.assignmentType === "exam" ? (
                      <div className="text-orange-800">{t.exam}</div>
                    ) : assignment.assignmentType === "project" ? (
                      <div className="text-yellow-800">{t.project}</div>
                    ) : (
                      <div className="text-red-800">{t.finalExam}</div>
                    )}
                  </div>
                </div>
                {/* Optionally, show more details here */}
              </div>
            ))}
        {classInfo?.role == "owner" &&
          selectedSubject == "" &&
          assignmentsData &&
          Object.entries(assignmentsData)
            .flatMap(([subject, assignments]) =>
              (assignments as Assignment[]).map((assignment: Assignment) => ({
                ...assignment,
                subject,
              }))
            )
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
                  <div className="text-gray-600 dark:text-gray-400 mt-1">
                    {assignment.assignedBy}
                  </div>
                  <div className="ml-auto text-right">
                    {assignment.assignmentType === "homework" ? (
                      <div className="text-green-800">{t.homework}</div>
                    ) : assignment.assignmentType === "quiz" ? (
                      <div className="text-blue-800">{t.quiz}</div>
                    ) : assignment.assignmentType === "exam" ? (
                      <div className="text-orange-800">{t.exam}</div>
                    ) : assignment.assignmentType === "project" ? (
                      <div className="text-yellow-800">{t.project}</div>
                    ) : (
                      <div className="text-red-800">{t.finalExam}</div>
                    )}
                  </div>
                </div>
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
                  <div className="ml-auto text-right">
                    {assignment.assignmentType === "homework" ? (
                      <div className="text-green-800">{t.homework}</div>
                    ) : assignment.assignmentType === "quiz" ? (
                      <div className="text-blue-800">{t.quiz}</div>
                    ) : assignment.assignmentType === "exam" ? (
                      <div className="text-orange-800">{t.exam}</div>
                    ) : assignment.assignmentType === "project" ? (
                      <div className="text-yellow-800">{t.project}</div>
                    ) : (
                      <div className="text-red-800">{t.finalExam}</div>
                    )}
                  </div>
                </div>
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
        <div className="fixed inset-0 z-49 flex items-center justify-center bg-black/40">
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
                <span className="font-semibold">{t.assignedBy}:</span>{" "}
                {selectedAssignment.assignedBy.name}
              </div>
              <div>
                <span className="font-semibold">{t.type}:</span>{" "}
                {selectedAssignment.assignmentType === "homework"
                  ? t.homework
                  : selectedAssignment.assignmentType === "quiz"
                  ? t.quiz
                  : selectedAssignment.assignmentType === "exam"
                  ? t.exam
                  : selectedAssignment.assignmentType === "project"
                  ? t.project
                  : t.finalExam}
              </div>
              <div>
                <span className="font-semibold">{t.description}: </span>{" "}
                {selectedAssignment.description || t.noDescriptionProvided}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="max-h-76 overflow-y-auto">
                {classInfo?.role === "owner" && (
                  <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th
                          className="px-6 py-4"
                          onClick={() => {
                            if (studentNameSort === "") {
                              setStudentNameSort("asc");
                              setScoreSort("");
                            } else {
                              setStudentNameSort((prev) =>
                                prev === "asc" ? "desc" : "asc"
                              );
                              setScoreSort("");
                            }
                          }}
                        >
                          <span className="flex items-center gap-0.5">
                            {t.name}{" "}
                            {studentNameSort === "asc" ? (
                              <FaSortAlphaUp />
                            ) : (
                              <FaSortAlphaDownAlt />
                            )}
                          </span>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => {
                            if (scoreSort === "") {
                              setScoreSort((prev) =>
                                prev === "" ? "asc" : "desc"
                              );
                              setStudentNameSort("");
                            } else {
                              setScoreSort((prev) =>
                                prev === "asc" ? "desc" : "asc"
                              );
                              setStudentNameSort("");
                            }
                          }}
                        >
                          <span className="flex items-center gap-0.5">
                            {t.score}{" "}
                            {scoreSort === "" || scoreSort === "asc" ? (
                              <FaSortAlphaUp />
                            ) : (
                              <FaSortAlphaDownAlt />
                            )}
                          </span>
                        </th>
                        <th className="px-6 py-4">{t.notes}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAssignment.grades &&
                      selectedAssignment.grades.length > 0 ? (
                        [...selectedAssignment.grades]
                          .sort((a, b) => {
                            // Sort by score if scoreSort is toggled, else by name
                            if (scoreSort !== "") {
                              if (scoreSort === "asc") {
                                return (a.score ?? 0) - (b.score ?? 0);
                              } else {
                                return (b.score ?? 0) - (a.score ?? 0);
                              }
                            }
                            // fallback ke sort nama jika scoreSort tidak ada
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
                            {t.noGradesAvailable}
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
                            if (studentNameSort === "") {
                              setStudentNameSort("asc");
                              setScoreSort("");
                            } else {
                              setStudentNameSort((prev) =>
                                prev === "asc" ? "desc" : "asc"
                              );
                              setScoreSort("");
                            }
                          }}
                        >
                          <span className="flex items-center gap-0.5">
                            {t.name}{" "}
                            {studentNameSort === "asc" ? (
                              <FaSortAlphaUp />
                            ) : (
                              <FaSortAlphaDownAlt />
                            )}
                          </span>
                        </th>
                        <th className="px-6 py-4 text-center">{t.action}</th>
                        <th className="px-6 py-4 text-center">{t.score}</th>
                        <th className="px-6 py-4 text-center">{t.notes}</th>
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
                              <td className="px-6 py-4 text-center">
                                <button
                                  className="px-3 py-2 rounded bg-slate-500 text-white font-semibold hover:bg-slate-800"
                                  onClick={() => {
                                    setSelectedStudentForAssistance(grade);
                                    // Hitung nilai rata-rata dari semua siswa
                                    const scores =
                                      selectedAssignment.grades.map(
                                        (g) => g.score ?? 0
                                      );
                                    const averageScore =
                                      scores.length > 0
                                        ? scores.reduce((a, b) => a + b, 0) /
                                          scores.length
                                        : 0;
                                    studentAssignmentAdvice({
                                      studentName: grade.studentId.name,
                                      studentScore: grade.score,
                                      averageScore,
                                      description:
                                        selectedAssignment.description,
                                      note: grade.notes,
                                    });
                                  }}
                                >
                                  {t.getAssistance}
                                </button>
                                {showAssistanceModal && (
                                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/2.5">
                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[400px] relative ">
                                      <button
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                                        onClick={() =>
                                          setShowAssistanceModal(false)
                                        }
                                        aria-label="Close"
                                      >
                                        &times;
                                      </button>
                                      <h2 className="text-xl font-bold mb-4">
                                        {t.createAssistance}
                                      </h2>
                                      <form
                                        className="flex flex-col gap-1.5"
                                        onSubmit={(e) => {
                                          handleCreateStudentAssistance({
                                            e,
                                            classId: classId as string,
                                            subject: memberSubject,
                                            studentName:
                                              selectedStudentForAssistance
                                                ?.studentId.name || "",
                                            assignmentId:
                                              selectedAssignment?._id || "",
                                            assignmentName:
                                              selectedAssignment?.title || "",
                                            assignmentDescription:
                                              selectedAssignment?.description ||
                                              "",
                                            assistantResponse:
                                              assignmentAdviceText,
                                          });
                                        }}
                                      >
                                        <div>
                                          <label
                                            className="block text-sm text-left font-medium mb-1"
                                            htmlFor="description"
                                          >
                                            {t.description}
                                          </label>
                                          <textarea
                                            id="description"
                                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full min-h-[250px] resize-none"
                                            placeholder={
                                              t.assignmentDescription
                                            }
                                            value={assignmentAdviceText}
                                            onChange={(e) =>
                                              setAssignmentAdviceText(
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4">
                                          <button
                                            type="submit"
                                            className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                                          >
                                            {t.save}
                                          </button>
                                        </div>
                                      </form>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  className="active:border-0 rounded px-2 py-1 w-15 translate-x-9"
                                  value={
                                    grade.score !== undefined ? grade.score : ""
                                  }
                                  min={0}
                                  max={100}
                                  onChange={(e) => {
                                    let newScore = Number(e.target.value);
                                    if (isNaN(newScore)) newScore = 0;
                                    if (newScore < 0) newScore = 0;
                                    if (newScore > 100) newScore = 100;
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
                                  onBlur={(e) => {
                                    let val = Number(e.target.value);
                                    if (isNaN(val) || val < 0) val = 0;
                                    if (val > 100) val = 100;
                                    setSelectedAssignment((prev) => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        grades: prev.grades.map((g) =>
                                          g.studentId._id ===
                                          grade.studentId._id
                                            ? { ...g, score: val }
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
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              <div className="mt-4 flex items-center justify-end gap-4">
                <button
                  className="mt-8 px-4 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-700 transition"
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t.deleteAssignment}
                </button>
                <button
                  className="mt-8 px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
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
                        scoresData: newScoresData,
                      });

                      alert(t.changesSaved);
                    }
                  }}
                >
                  {t.saveChanges}
                </button>
              </div>
            )}
            {showDeleteModal && (
              // Modal style mirip Sign Out Modal di Sidebar
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div
                  className="relative z-50"
                  aria-labelledby="modal-title"
                  role="dialog"
                  aria-modal="true"
                >
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-gray-500/75 transition-opacity"
                    aria-hidden="true"
                  ></div>
                  <div className="fixed inset-0 z-50 w-screen overflow-y-auto translate-y-[-25px]">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                              <svg
                                className="size-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                />
                              </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                              <h3
                                className="text-base font-semibold text-gray-900"
                                id="modal-title"
                              >
                                {t.deleteAssignment}
                              </h3>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  {t.deleteAssignmentConfirmation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                            onClick={() => {
                              deleteAssignment({
                                assignmentId: selectedAssignment._id,
                              });
                              setShowDeleteModal(false);
                              setShowAssignmentModal(false);
                              setSelectedAssignment(null);
                              alert("Assignment deleted!");
                            }}
                          >
                            {t.delete}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setShowDeleteModal(false)}
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Assignment Advice */}
      {assignmentAdvicePending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex items-center justify-center h-full w-full">
            <Spinner />
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
                  {t.title}
                  <span className="text-red-500">*</span>
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
                  {t.description}
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
                  {t.assignmentType}
                  <span className="text-red-500">*</span>
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
                  <option value="homework">{t.homework}</option>
                  <option value="quiz">{t.quiz}</option>
                  <option value="exam">{t.exam}</option>
                  <option value="project">{t.project}</option>
                  <option value="finalExam">{t.finalExam}</option>
                </select>
              </div>
              <div className="flex-col">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="assignmentDate"
                >
                  {t.date}
                  <span className="text-red-500">*</span>
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
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => setShowCreateModal(false)}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  {t.create}
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

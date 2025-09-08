import { useQuery, useMutation } from "@tanstack/react-query";
import { ClassInfo } from "../types/types";
import queryClient from "../config/queryClient";

import {
  createJournal,
  deleteJournalById,
  getJournalById,
  getJournalsByClassId,
  getJournalsBySubject,
  getSubjectByClassId,
  giveAttendancesAndNotes,
} from "../lib/api";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { MdSort } from "react-icons/md";
import { getThisMonthRange, getThisWeekRange } from "../utils/date";
import { FaSortAlphaDownAlt, FaSortAlphaUp } from "react-icons/fa";
import Spinner from "./Spinner";
import { useLanguage } from "../contexts/LanguageContext";
import { wordTranslations } from "../constants";

interface Journal {
  id?: string;
  journalId?: string;
  createdBy?: string;
  createdByName?: string;
  classId?: string;
  title?: string;
  description?: string;
  journalDate?: string;
  startTime?: string;
  endTime?: string;
  subject: string;
  journals?: {
    studentId: string;
    status: "present" | "absent" | "late" | "sick" | "excused" | "pending";
    note?: string;
  }[];
}
interface JournalInfo {
  _id: string;
  createdBy: {
    _id: string;
    name: string;
  };
  classId: string;
  subject: string;
  title: string;
  journals: {
    studentId: {
      _id: string;
      name: string;
    };
    status: "present" | "absent" | "late" | "sick" | "excused" | "pending";
    note?: string;
  }[];
  description?: string;
  journalDate: string;
  startTime: string;
  endTime: string;
}

const Journals = ({
  classId,
  classInfo,
}: {
  classId: string | undefined;
  classInfo: ClassInfo | null;
}) => {
  const { language } = useLanguage();

  const t = wordTranslations(language);

  const subjects = classInfo?.subjects || [];

  const [selectedSubject, setSelectedSubject] = useState(() => {
    return subjects.length > 0 ? subjects[0] : "";
  });

  const [dropdownType, setDropdownType] = useState<"subject" | "sort" | "">("");
  // Ref for dropdown area
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dropdownType === "") return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownType("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownType]);

  const [sortOption, setSortOption] = useState<"all" | "week" | "month">("all");

  const [form, setForm] = useState({
    title: "",
    description: "",
    journalDate: "",
    startTime: "",
    endTime: "",
  });

  const [showCreateJournalModal, setShowCreateJournalModal] = useState(false);

  const { data: journalsData } = useQuery({
    queryKey: ["journalsData", classId],
    queryFn: async () => {
      if (!classId) return [];
      const res = await getJournalsByClassId(classId);
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: getJournal, isPending } = useMutation({
    mutationFn: async (journalId: string) => {
      if (!classId) return null;
      const res = await getJournalById(classId, journalId);
      return res.data;
    },
  });

  const { mutate: createJournals } = useMutation({
    mutationFn: async (newJournal: {
      title: string;
      description?: string;
      journalDate: string;
      startTime: string;
      endTime: string;
    }) => {
      const res = await createJournal({
        classId: classId as string,
        title: newJournal.title,
        description: newJournal.description,
        journalDate: newJournal.journalDate,
        startTime: newJournal.startTime,
        endTime: newJournal.endTime,
      });

      return res.data;
    },
    onSuccess: () => {
      // Refetch journals after successful creation
      queryClient.invalidateQueries({ queryKey: ["journalsData", classId] });
      queryClient.invalidateQueries({
        queryKey: ["journalsSubject", classId],
      });
    },
  });

  const { data: memberSubject } = useQuery({
    queryKey: ["memberSubject", classId],
    queryFn: async () => {
      if (!classId) return "";
      const res = await getSubjectByClassId(classId);
      return res.data;
    },
  });

  const { data: journalsBySubject } = useQuery({
    queryKey: ["journalsSubject", classId],
    queryFn: async () => {
      const res = await getJournalsBySubject(classId as string);
      return res.data;
    },
    enabled: !!classId,
    refetchOnWindowFocus: false,
  });

  const { mutate: deleteJournal } = useMutation({
    mutationFn: async ({ journalId }: { journalId: string }) => {
      if (!classId) throw new Error("Class ID is required");
      const res = await deleteJournalById(classId, journalId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["journalsData"],
      });
    },
  });

  const { weekStart, weekEnd } = getThisWeekRange();

  const { monthStart, monthEnd } = getThisMonthRange();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: giveNotesAndAttendances } = useMutation({
    mutationFn: async (data: {
      classId: string;
      journalId: string;
      journals: { studentId: string; status: string; note?: string }[];
    }) => {
      const res = await giveAttendancesAndNotes({
        classId: data.classId,
        journalId: data.journalId,
        journals: data.journals,
      });

      return res.data;
    },
  });

  const handleCreateJournal = async ({
    e,
    classId,
    journal,
  }: {
    e: React.FormEvent;
    classId: string;
    journal: {
      title: string;
      description: string;
      journalDate: string;
      startTime: string;
      endTime: string;
    };
  }) => {
    e.preventDefault();
    if (!classId || !journal) return;

    try {
      createJournals({
        title: journal.title,
        description: journal.description,
        journalDate: journal.journalDate,
        startTime: journal.startTime,
        endTime: journal.endTime,
      });
    } catch (error) {
      console.error("Error creating journal:", error);
    }
  };

  const [selectedJournal, setSelectedJournal] = useState<JournalInfo | null>(
    null
  );
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [studentNameSort, setStudentNameSort] = useState<"asc" | "desc">("asc");
  console.log("Selected Journal:", selectedJournal);
  return (
    <div className="max-w-full overflow-x-auto py-4 px-4" ref={dropdownRef}>
      <div className="flex justify-end mb-4 gap-2">
        {classInfo?.role === "owner" && (
          <>
            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => {
                if (dropdownType === "subject") {
                  setDropdownType("");
                } else {
                  setDropdownType("subject");
                }
              }}
            >
              <span>{selectedSubject == "" ? "Subject" : selectedSubject}</span>
              <FiChevronDown className="ml-auto" />
            </button>
            <button
              type="button"
              className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 w-40 rounded-lg shadow"
              title="Sort"
              onClick={() => {
                if (dropdownType === "sort") {
                  setDropdownType("");
                } else {
                  setDropdownType("sort");
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
        {classInfo?.role === "member" && memberSubject && (
          <>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              title="Create Assignment"
              onClick={() => setShowCreateJournalModal(true)}
            >
              <FiPlus />
              {t.createJournal}
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
                if (dropdownType === "sort") {
                  setDropdownType("");
                } else {
                  setDropdownType("sort");
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
        {classInfo?.role === "owner" && dropdownType === "subject" && (
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
                        setDropdownType("");
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
        {dropdownType === "sort" && (
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
                    setDropdownType("");
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
                    setDropdownType("");
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
                    setDropdownType("");
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
          selectedSubject == "" &&
          Array.isArray(journalsData) &&
          journalsData
            .filter((journal: Journal) => {
              if (sortOption === "all") return true;
              const date = new Date(journal.journalDate ?? "");
              if (sortOption === "week") {
                return date >= weekStart && date <= weekEnd;
              }
              if (sortOption === "month") {
                return date >= monthStart && date <= monthEnd;
              }
              return true;
            })
            .map((journal: Journal) => (
              <div
                key={journal.journalId}
                className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100  hover:bg-indigo-50 dark:hover:bg-gray-700"
                onClick={async () => {
                  const data = await getJournal(journal.journalId ?? "");
                  setSelectedJournal(data);
                  setShowJournalModal(true);
                }}
              >
                <div className="font-semibold text-lg mb-2">
                  {journal.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {journal.journalDate &&
                    (() => {
                      const date = new Date(journal.journalDate);
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
                </div>
                {/* Optionally, show more details here */}
              </div>
            ))}
        {classInfo?.role === "owner" &&
          selectedSubject &&
          Array.isArray(journalsData) &&
          journalsData
            .filter((journal: Journal) => journal.subject === selectedSubject)
            .filter((journal: Journal) => {
              if (sortOption === "all") return true;
              const date = new Date(journal.journalDate ?? "");
              if (sortOption === "week") {
                return date >= weekStart && date <= weekEnd;
              }
              if (sortOption === "month") {
                return date >= monthStart && date <= monthEnd;
              }
              return true;
            })
            .map((journal: Journal) => (
              <div
                key={journal.journalId}
                className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100  hover:bg-indigo-50 dark:hover:bg-gray-700"
                onClick={async () => {
                  const data = await getJournal(journal.journalId ?? "");
                  setSelectedJournal(data);
                  setShowJournalModal(true);
                }}
              >
                <div className="font-semibold text-lg mb-2">
                  {journal.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {journal.journalDate &&
                    (() => {
                      const date = new Date(journal.journalDate);
                      const day = date.getDate();
                      const month = date.toLocaleString("id-ID", {
                        month: "long",
                      });
                      const year = date.getFullYear();
                      return `${month} ${day}, ${year}`;
                    })()}
                </div>
              </div>
            ))}
        {classInfo?.role === "member" &&
          Array.isArray(journalsBySubject) &&
          journalsBySubject
            .filter((journal: Journal) => {
              if (sortOption === "all") return true;
              const date = new Date(journal.journalDate ?? "");
              if (sortOption === "week") {
                return date >= weekStart && date <= weekEnd;
              }
              if (sortOption === "month") {
                return date >= monthStart && date <= monthEnd;
              }
              return true;
            })
            .map((journal: Journal) => (
              <div
                key={journal.id}
                className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100  hover:bg-indigo-50 dark:hover:bg-gray-700"
                onClick={async () => {
                  const data = await getJournal(journal.id ?? "");
                  setSelectedJournal(data);
                  setShowJournalModal(true);
                  if (data) {
                    setSelectedJournal(data);
                    setShowJournalModal(true);
                  } else {
                    alert("Failed to load journal detail");
                  }
                }}
              >
                <div className="font-semibold text-lg mb-2">
                  {journal.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {journal.journalDate &&
                    (() => {
                      const date = new Date(journal.journalDate ?? "");
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
      {showJournalModal && selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[960px] h-[560px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={() => {
                setShowJournalModal(false);
                setSelectedJournal(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedJournal.title}</h2>
            <div className="mb-2 text-gray-500 dark:text-gray-300">
              {selectedJournal.journalDate &&
                (() => {
                  const date = new Date(selectedJournal.journalDate);
                  const day = date.getDate();
                  const month = date.toLocaleString("id-ID", { month: "long" });
                  const year = date.getFullYear();
                  return `${month} ${day}, ${year}`;
                })()}
            </div>
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-4">
              <div>
                <span className="font-semibold">{t.createdBy}:</span>{" "}
                {selectedJournal.createdBy.name}
              </div>
              <div>
                <span className="font-semibold">{t.startTime}:</span>{" "}
                {selectedJournal.startTime
                  ? new Date(selectedJournal.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
              <div>
                <span className="font-semibold">{t.endTime}:</span>{" "}
                {selectedJournal.endTime
                  ? new Date(selectedJournal.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
            <div className="mb-2">{selectedJournal.description}</div>
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
                        <th className="px-6 py-4">Attendance</th>
                        <th className="px-6 py-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJournal.journals &&
                      selectedJournal.journals.length > 0 ? (
                        [...selectedJournal.journals]
                          .sort((a, b) => {
                            const nameA = a.studentId.name.toLowerCase();
                            const nameB = b.studentId.name.toLowerCase();
                            if (studentNameSort === "asc") {
                              return nameA.localeCompare(nameB);
                            } else {
                              return nameB.localeCompare(nameA);
                            }
                          })
                          .map((journal, idx) => (
                            <tr
                              key={journal.studentId._id}
                              className={`${
                                idx % 2 === 0
                                  ? "bg-white dark:bg-gray-900"
                                  : "bg-gray-50 dark:bg-gray-800"
                              } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                            >
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {typeof journal.studentId === "object" &&
                                  journal.studentId !== null &&
                                  "name" in journal.studentId &&
                                  (
                                    journal.studentId as {
                                      _id: string;
                                      name: string;
                                    }
                                  ).name}
                              </td>
                              <td className="px-6 py-4">
                                {(() => {
                                  switch (journal.status) {
                                    case "present":
                                      return "Present";
                                    case "absent":
                                      return "Absent";
                                    case "late":
                                      return "Late";
                                    case "sick":
                                      return "Sick";
                                    case "excused":
                                      return "Excused";
                                    case "pending":
                                      return "Pending";
                                    default:
                                      return "";
                                  }
                                })()}
                              </td>
                              <td className="px-6 py-4">
                                {journal.note ? journal.note : ""}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-4 text-center text-gray-400"
                          >
                            No attendances or notes available.
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
                        <th className="px-6 py-4 text-center">Attendance</th>
                        <th className="px-6 py-4 text-center">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJournal.journals &&
                        selectedJournal.journals.length > 0 &&
                        [...selectedJournal.journals]
                          .sort((a, b) => {
                            const nameA = a.studentId.name.toLowerCase();
                            const nameB = b.studentId.name.toLowerCase();
                            if (studentNameSort === "asc") {
                              return nameA.localeCompare(nameB);
                            } else {
                              return nameB.localeCompare(nameA);
                            }
                          })
                          .map((journal, idx) => (
                            <tr
                              key={journal.studentId._id}
                              className={`${
                                idx % 2 === 0
                                  ? "bg-white dark:bg-gray-900"
                                  : "bg-gray-50 dark:bg-gray-800"
                              } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                            >
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {typeof journal.studentId === "object" &&
                                  journal.studentId !== null &&
                                  "name" in journal.studentId &&
                                  (
                                    journal.studentId as {
                                      _id: string;
                                      name: string;
                                    }
                                  ).name}
                              </td>
                              <td className="px-6 py-4">
                                <div className="relative">
                                  <select
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg pr-8 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 appearance-none"
                                    value={journal.status}
                                    onChange={(e) => {
                                      const newStatus = e.target.value as
                                        | "present"
                                        | "absent"
                                        | "late"
                                        | "sick"
                                        | "excused"
                                        | "pending";
                                      setSelectedJournal((prev) => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          journals: prev.journals.map((j) =>
                                            j.studentId._id ===
                                            journal.studentId._id
                                              ? { ...j, status: newStatus }
                                              : j
                                          ),
                                        };
                                      });
                                    }}
                                  >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="sick">Sick</option>
                                    <option value="excused">Excused</option>
                                    <option value="pending">Pending</option>
                                  </select>
                                  <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                    <FiChevronDown className="text-gray-400" />
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  value={journal.note || ""}
                                  onChange={(e) => {
                                    // Update notes locally (you may want to handle API update here)
                                    const newNotes = e.target.value;
                                    setSelectedJournal((prev) => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        journals: prev.journals.map((j) =>
                                          j.studentId._id ===
                                          journal.studentId._id
                                            ? { ...j, note: newNotes }
                                            : j
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
              <div className="flex items-center gap-4">
                <button
                  className="mt-8 px-4 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-700 transition"
                  onClick={() => setShowDeleteModal(true)}
                >
                  {t.deleteJournal}
                </button>
                <button
                  className="mt-8 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                  onClick={() => {
                    if (selectedJournal && selectedJournal.journals) {
                      const newJournalsData = selectedJournal.journals.map(
                        (journal) => ({
                          studentId: journal.studentId._id,
                          status: journal.status || "",
                          note: journal.note || "",
                        })
                      );
                      giveNotesAndAttendances({
                        classId: classId as string,
                        journalId: selectedJournal._id,
                        journals: newJournalsData,
                      });

                      alert("Changes saved!");
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
                                Delete Assignment
                              </h3>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Are you sure you want to delete this
                                  assignment? This action cannot be undone.
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
                              deleteJournal({
                                journalId: selectedJournal._id,
                              });
                              setShowDeleteModal(false);
                              setShowJournalModal(false);
                              setSelectedJournal(null);
                              alert("Journal deleted!");
                            }}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setShowDeleteModal(false)}
                          >
                            Cancel
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
      {showCreateJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[400px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={() => setShowCreateJournalModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Create Journal</h2>
            <form
              className="flex flex-col gap-1.5"
              onSubmit={(e) => {
                handleCreateJournal({
                  e,
                  classId: classId as string,
                  journal: form,
                });
                alert("Journal created successfully!");
                setShowCreateJournalModal(false);
                setForm({
                  title: "",
                  description: "",
                  journalDate: "",
                  startTime: "",
                  endTime: "",
                });
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
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
                  placeholder={t.journalTitle}
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
                  className="border rounded-lg px-3 py-2 w-full min-h-[60px] focus:outline-none focus:ring-2 bg-primary text-font-primary"
                  placeholder={t.journalDescription}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex-col">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="journalDate"
                >
                  {t.date}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="journalDate"
                  type="date"
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
                  value={form.journalDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, journalDate: e.target.value }))
                  }
                  required
                />
                <div className="flex mt-2">
                  <div className="flex-1 mr-2">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="startTime"
                    >
                      {t.startTime}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
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
                      {t.endTime}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
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
                  onClick={() => setShowCreateJournalModal(false)}
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

export default Journals;

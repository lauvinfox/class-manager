import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { IoSearchOutline } from "react-icons/io5";
import { FiChevronDown } from "react-icons/fi";
import { CgArrowsExchangeV } from "react-icons/cg";
import { TiMessageTyping } from "react-icons/ti";

import {
  ClassAttendanceSummary,
  ClassInfo,
  StudentAttendanceSummary,
} from "../types/types";

import {
  getAssignmentsSummaryBySubjects,
  getClassAttendanceSummary,
  getSubjectAttendanceSummary,
  getSubjectByClassId,
} from "../lib/api";

const StatisticsTab = ({
  classId,
  classInfo,
}: {
  classId: string;
  classInfo: ClassInfo | null;
}) => {
  const [searchStudentTerm, setSearchStudentTerm] = useState("");
  const handleStudentSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStudentTerm(event.target.value);
  };
  const { data: memberSubject } = useQuery({
    queryKey: ["memberSubject", classId],
    queryFn: async () => {
      if (!classId) return "";
      const res = await getSubjectByClassId(classId);
      return res.data;
    },
  });
  const subjects = classInfo?.subjects || [];
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectDropdown, setSubjectDropdown] = useState(false);

  const [selectedAssignmentType, setSelectedAssignmentType] = useState<
    "homework" | "quiz" | "exam" | "project" | "finalExam" | ""
  >("homework");
  const [selectAssignmentTypeDropdown, setSelectAssignmentTypeDropdown] =
    useState(false);

  const { data: classAttendanceSummary } = useQuery({
    queryKey: ["classAttendanceSummary", classId],
    queryFn: async () => {
      const res = await getClassAttendanceSummary(classId);
      return res.data;
    },
    enabled: !!classId,
  });

  const { data: subjectAttendanceSummary } = useQuery({
    queryKey: ["subjectAttendanceSummary", classId],
    queryFn: async () => {
      const res = await getSubjectAttendanceSummary(classId);
      return res.data;
    },
    enabled: !!classId,
  });

  const [subjectAttendanceDropdown, setSubjectAttendanceDropdown] =
    useState(false);
  const [selectedSubjectAttendance, setSelectedSubjectAttendance] =
    useState("");

  if (
    classInfo?.role === "owner" &&
    classAttendanceSummary &&
    classAttendanceSummary.length > 0 &&
    !selectedSubjectAttendance
  ) {
    setSelectedSubjectAttendance(classAttendanceSummary[0].subject);
  }

  if (
    classInfo?.role === "member" &&
    subjectAttendanceSummary &&
    subjectAttendanceSummary.length > 0 &&
    !selectedSubjectAttendance
  ) {
    setSelectedSubjectAttendance(subjectAttendanceSummary[0].subject);
  }

  const { data: assignmentsSummaryBySubjects } = useQuery({
    queryKey: ["assignmentsSummaryBySubjects", classId],
    queryFn: async () => {
      const res = await getAssignmentsSummaryBySubjects(classId);
      return res.data;
    },
    enabled: !!classId,
  });

  const [overviewMode, setOverviewMode] = useState<"attendance" | "grade">(
    "attendance"
  );
  const [overviewModeDropdown, setOverviewModeDropdown] = useState(false);

  // Sorting state
  const [columnSorts, setColumnSorts] = useState<string[]>([]);
  const [studentNameSort, setStudentNameSort] = useState<"asc" | "desc" | "">(
    ""
  );
  const [attendanceSorts, setAttendanceSorts] = useState<{
    [key: string]: "asc" | "desc" | "";
  }>({
    present: "",
    absent: "",
    late: "",
    sick: "",
    excused: "",
    pending: "",
  });

  return (
    <div className="max-w-full overflow-x-auto py-4 px-4">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <div className="flex md:w-[30%] w-[70%] items-center gap-3 rounded-lg px-3 py-2 bg-gray-200">
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
          <div className="flex gap-2">
            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => setSubjectDropdown((v) => !v)}
            >
              <span>
                {selectedSubject === "" ? "Subject" : selectedSubject}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 w-35 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => setOverviewModeDropdown((v) => !v)}
            >
              <span>
                {overviewMode === "attendance" ? "Attendance" : "Grade"}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
            <button
              className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 w-35 rounded-lg shadow"
              type="button"
              onClick={() => setSelectAssignmentTypeDropdown((v) => !v)}
            >
              <span>
                {selectedAssignmentType === ""
                  ? "Assignment Type"
                  : selectedAssignmentType === "homework"
                  ? "Homework"
                  : selectedAssignmentType === "exam"
                  ? "Exam"
                  : selectedAssignmentType === "quiz"
                  ? "Quiz"
                  : selectedAssignmentType === "project"
                  ? "Project"
                  : "Final Exam"}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
          </div>
        )}

        {classInfo?.role == "owner" && overviewModeDropdown && (
          <div className="z-50 absolute right-40 mt-36 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              {["attendance", "grade"].map((mode) => (
                <li key={mode}>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                      overviewMode === mode
                        ? "font-bold text-indigo-600 dark:text-indigo-400"
                        : ""
                    }`}
                    onClick={() => {
                      setOverviewMode(mode as "attendance" | "grade");
                      if (mode === "attendance") {
                        setSelectedSubject("");
                      } else if (mode === "grade") {
                        setSelectedSubject(
                          subjects.length > 0 ? subjects[0] : ""
                        );
                      }
                      setOverviewModeDropdown(false);
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {classInfo?.role == "member" && selectAssignmentTypeDropdown && (
          <div className="z-50 absolute right-4 mt-62 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              {["homework", "quiz", "exam", "project", "finalExam"].map(
                (type) => (
                  <li key={type}>
                    <button
                      type="button"
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                        selectedAssignmentType === type
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedAssignmentType(
                          type as
                            | ""
                            | "homework"
                            | "quiz"
                            | "exam"
                            | "project"
                            | "finalExam"
                        );
                        setOverviewMode("grade");
                        setSelectAssignmentTypeDropdown(false);
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {classInfo?.role == "owner" && subjectDropdown && (
          <div className="z-50 absolute right-51 mt-35 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
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
                        setOverviewMode("grade");
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

        {classInfo?.role == "member" && (
          <div className="flex gap-2">
            {memberSubject && (
              <button
                className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-md px-4 py-2 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                type="button"
                disabled
              >
                <span>{memberSubject}</span>
              </button>
            )}

            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 w-35 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => setOverviewModeDropdown((v) => !v)}
            >
              <span>
                {overviewMode === "attendance" ? "Attendance" : "Grade"}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
            <button
              className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 w-45 rounded-lg shadow"
              type="button"
              onClick={() => setSelectAssignmentTypeDropdown((v) => !v)}
            >
              <span>
                {selectedAssignmentType === ""
                  ? "Assignment Type"
                  : selectedAssignmentType === "homework"
                  ? "Homework"
                  : selectedAssignmentType === "exam"
                  ? "Exam"
                  : selectedAssignmentType === "quiz"
                  ? "Quiz"
                  : selectedAssignmentType === "project"
                  ? "Project"
                  : "Final Exam"}
              </span>
              <FiChevronDown className="ml-auto" />
            </button>
          </div>
        )}

        {classInfo?.role == "member" && overviewModeDropdown && (
          <div className="z-50 absolute right-40 mt-36 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              {["attendance", "grade"].map((mode) => (
                <li key={mode}>
                  <button
                    type="button"
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                      overviewMode === mode
                        ? "font-bold text-indigo-600 dark:text-indigo-400"
                        : ""
                    }`}
                    onClick={() => {
                      setOverviewMode(mode as "attendance" | "grade");
                      setOverviewModeDropdown(false);
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {classInfo?.role == "owner" && subjectAttendanceDropdown && (
          <div className="z-50 absolute left-110 mt-64 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
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
                        selectedSubjectAttendance === subject
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedSubjectAttendance(subject);
                        setSubjectAttendanceDropdown(false);
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

        {classInfo?.role == "owner" && selectAssignmentTypeDropdown && (
          <div className="z-50 absolute right-4 mt-62 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              {["homework", "quiz", "exam", "project", "finalExam"].map(
                (type) => (
                  <li key={type}>
                    <button
                      type="button"
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                        selectedAssignmentType === type
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedAssignmentType(
                          type as
                            | ""
                            | "homework"
                            | "quiz"
                            | "exam"
                            | "project"
                            | "finalExam"
                        );
                        setSelectAssignmentTypeDropdown(false);
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
      {classInfo?.role === "owner" && selectedSubject === "" && (
        <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="max-h-103 overflow-y-auto">
            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th
                    className="px-6 py-4 text-center cursor-pointer"
                    onClick={() => {
                      setStudentNameSort((prev) => {
                        if (prev === "") return "asc";
                        if (prev === "asc") return "desc";
                        if (prev === "desc") return "asc";
                        return "";
                      });
                    }}
                  >
                    <div className="flex items-center gap-1 cursor-pointer">
                      Name <CgArrowsExchangeV className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 flex items-center gap-2 cursor-pointer"
                    onClick={() => setSubjectAttendanceDropdown((v) => !v)}
                  >
                    Subject <FiChevronDown />
                  </th>
                  {[
                    { key: "present", label: "Present" },
                    { key: "absent", label: "Absent" },
                    { key: "late", label: "Late" },
                    { key: "sick", label: "Sick" },
                    { key: "excused", label: "Excused" },
                    { key: "pending", label: "Pending" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-4 text-center cursor-pointer"
                      onClick={() => {
                        setAttendanceSorts((prev) => ({
                          ...Object.fromEntries(
                            Object.keys(prev).map((k) => [k, ""])
                          ),
                          [key]:
                            prev[key] === ""
                              ? "asc"
                              : prev[key] === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setStudentNameSort("");
                      }}
                    >
                      <div className="flex items-center justify-center gap-1 cursor-pointer">
                        {label} <CgArrowsExchangeV />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 cursor-pointer">
                      Total Journals <CgArrowsExchangeV className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {classAttendanceSummary && classAttendanceSummary.length > 0 ? (
                  (() => {
                    const subjectSummary = classAttendanceSummary.find(
                      (summary: ClassAttendanceSummary) =>
                        summary.subject === selectedSubjectAttendance
                    );
                    if (!subjectSummary) {
                      return (
                        <tr>
                          <td colSpan={10} className="px-6 py-4 text-center">
                            No attendance summary found for selected subject.
                          </td>
                        </tr>
                      );
                    }
                    // Sorting logic for attendance columns
                    const sortedAttendance = [
                      ...subjectSummary.attendancesSummary,
                    ];
                    if (studentNameSort === "asc") {
                      sortedAttendance.sort((a, b) =>
                        a.name.localeCompare(b.name)
                      );
                    } else if (studentNameSort === "desc") {
                      sortedAttendance.sort((a, b) =>
                        b.name.localeCompare(a.name)
                      );
                    } else {
                      const activeAttendanceSort = Object.entries(
                        attendanceSorts
                      ).find(([, v]) => v === "asc" || v === "desc");
                      if (activeAttendanceSort) {
                        const [key, dir] = activeAttendanceSort;
                        sortedAttendance.sort((a, b) => {
                          const valA =
                            a.attendances[key as keyof typeof a.attendances] ??
                            0;
                          const valB =
                            b.attendances[key as keyof typeof b.attendances] ??
                            0;
                          if (dir === "asc") return valA - valB;
                          if (dir === "desc") return valB - valA;
                          return 0;
                        });
                      }
                    }
                    return sortedAttendance
                      .filter((student: StudentAttendanceSummary) =>
                        student.name
                          .toLowerCase()
                          .includes(searchStudentTerm.toLowerCase())
                      )
                      .map((student: StudentAttendanceSummary) => (
                        <tr
                          key={student.studentId + subjectSummary.subject}
                          className={`$
                            idx % 2 === 0
                              ? "bg-white dark:bg-gray-900"
                              : "bg-gray-50 dark:bg-gray-800"
                          } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </td>
                          <td className="px-6 py-4">
                            {subjectSummary.subject}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.present}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.absent}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.late}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.sick}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.excused}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.pending}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.present}/
                            {subjectSummary.totalJournals}
                          </td>
                        </tr>
                      ));
                  })()
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center">
                      No attendance summary found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {classInfo?.role === "owner" &&
        selectedSubject !== "" &&
        (() => {
          // Ambil data untuk subject yang dipilih
          const subjectData = assignmentsSummaryBySubjects?.[selectedSubject];
          if (!subjectData || Object.keys(subjectData).length === 0) {
            return (
              <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mt-4">
                <div className="p-4 text-center">
                  No assignment summary found for selected subject.
                </div>
              </div>
            );
          }
          // Render tabel
          return (
            <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mt-4">
              <div className="max-h-103 overflow-y-auto">
                <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => {
                          setStudentNameSort((prev) => {
                            if (prev === "") return "asc";
                            if (prev === "asc") return "desc";
                            if (prev === "desc") return "asc";
                            return "";
                          });
                          setColumnSorts([]);
                        }}
                      >
                        <div className="flex items-center">
                          Name
                          <CgArrowsExchangeV />
                        </div>
                      </th>
                      {/* Ambil jumlah assignment dari data sesuai selectedAssignmentType */}
                      {(() => {
                        const subjectData =
                          assignmentsSummaryBySubjects?.[selectedSubject];
                        const students = subjectData
                          ? Object.keys(subjectData)
                          : [];
                        // Cari jumlah assignment terbanyak dari semua siswa
                        let maxAssignment = 0;
                        students.forEach((studentName) => {
                          const arr =
                            subjectData[studentName]?.[
                              selectedAssignmentType
                            ] || [];
                          if (arr.length > maxAssignment)
                            maxAssignment = arr.length;
                        });
                        // Render th sesuai jumlah assignment, dengan sort icon dan handler
                        return Array.from({ length: maxAssignment }, (_, i) => (
                          <th
                            key={i}
                            className="px-6 py-4 text-center cursor-pointer"
                            onClick={() => {
                              // Ensure columnSorts has the correct length
                              if (studentNameSort !== "") {
                                setStudentNameSort("");
                              }
                              setColumnSorts((prev) => {
                                const newLength = maxAssignment;
                                const newSorts = Array.from(
                                  { length: newLength },
                                  (_, idx) => prev[idx] || ""
                                );
                                return newSorts.map((sort, idx) => {
                                  if (idx !== i) return "";
                                  if (sort === "") return "asc";
                                  if (sort === "asc") return "desc";
                                  if (sort === "desc") return "asc";
                                  return "";
                                });
                              });
                            }}
                          >
                            <div className="flex items-center justify-center">
                              {`${
                                selectedAssignmentType.charAt(0).toUpperCase() +
                                selectedAssignmentType.slice(1)
                              } ${i + 1}`}
                              <CgArrowsExchangeV
                                className={
                                  columnSorts[i] === "asc" ? "rotate-180" : ""
                                }
                              />
                            </div>
                          </th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sort rows by selected column score if columnSorts is set */}
                    {(() => {
                      const subjectDataAll =
                        assignmentsSummaryBySubjects?.[selectedSubject];
                      if (!subjectDataAll) return null;
                      const studentsAll = Object.keys(subjectDataAll);
                      let maxAssignment = 0;
                      studentsAll.forEach((name) => {
                        const arr =
                          subjectDataAll[name]?.[selectedAssignmentType] || [];
                        if (arr.length > maxAssignment)
                          maxAssignment = arr.length;
                      });
                      // Sort students by name or by selected column
                      const activeSortIdx = columnSorts.findIndex(
                        (v) => v === "asc" || v === "desc"
                      );
                      const sortedStudents = [...studentsAll];
                      if (studentNameSort === "asc") {
                        sortedStudents.sort((a, b) => a.localeCompare(b));
                      } else if (studentNameSort === "desc") {
                        sortedStudents.sort((a, b) => b.localeCompare(a));
                      } else if (activeSortIdx !== -1) {
                        sortedStudents.sort((a, b) => {
                          const arrA =
                            subjectDataAll[a]?.[selectedAssignmentType] || [];
                          const arrB =
                            subjectDataAll[b]?.[selectedAssignmentType] || [];
                          const scoreA =
                            arrA[activeSortIdx]?.score ?? -Infinity;
                          const scoreB =
                            arrB[activeSortIdx]?.score ?? -Infinity;
                          if (columnSorts[activeSortIdx] === "asc")
                            return scoreA - scoreB;
                          if (columnSorts[activeSortIdx] === "desc")
                            return scoreB - scoreA;
                          return 0;
                        });
                      }
                      return sortedStudents.map((studentName, idx) => {
                        const assignmentArr =
                          subjectDataAll[studentName]?.[
                            selectedAssignmentType
                          ] || [];
                        return (
                          <tr
                            key={studentName}
                            className={`${
                              idx % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50 dark:bg-gray-800"
                            } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {studentName}
                            </td>
                            {Array.from({ length: maxAssignment }, (_, i) => {
                              const assignment = assignmentArr[i];
                              return (
                                <td
                                  key={i}
                                  className="px-6 py-4 relative group"
                                >
                                  <span className="flex items-center gap-1 justify-center">
                                    {assignment ? assignment.score : "-"}
                                    {assignment && assignment.notes ? (
                                      <span className="text-xs text-gray-400">
                                        <TiMessageTyping />
                                      </span>
                                    ) : null}
                                  </span>
                                  {assignment && assignment.notes && (
                                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 min-w-[120px] max-w-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs rounded shadow px-3 py-2 border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                      {assignment.notes}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

      {classInfo?.role === "member" && overviewMode === "attendance" && (
        <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="max-h-103 overflow-y-auto">
            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th
                    className="px-6 py-4 text-center cursor-pointer"
                    onClick={() => {
                      setStudentNameSort((prev) => {
                        if (prev === "") return "asc";
                        if (prev === "asc") return "desc";
                        if (prev === "desc") return "asc";
                        return "";
                      });
                    }}
                  >
                    <div className="flex items-center gap-1 cursor-pointer">
                      Name <CgArrowsExchangeV className="w-3 h-3" />
                    </div>
                  </th>
                  {[
                    { key: "present", label: "Present" },
                    { key: "absent", label: "Absent" },
                    { key: "late", label: "Late" },
                    { key: "sick", label: "Sick" },
                    { key: "excused", label: "Excused" },
                    { key: "pending", label: "Pending" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-4 text-center cursor-pointer"
                      onClick={() => {
                        setAttendanceSorts((prev) => ({
                          ...Object.fromEntries(
                            Object.keys(prev).map((k) => [k, ""])
                          ),
                          [key]:
                            prev[key] === ""
                              ? "asc"
                              : prev[key] === "asc"
                              ? "desc"
                              : "asc",
                        }));
                        setStudentNameSort("");
                      }}
                    >
                      <div className="flex items-center justify-center gap-1 cursor-pointer">
                        {label} <CgArrowsExchangeV />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 cursor-pointer">
                      Total Journals <CgArrowsExchangeV className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjectAttendanceSummary ? (
                  (() => {
                    // Sorting logic for attendance columns
                    const sortedAttendance = [
                      ...subjectAttendanceSummary.attendancesSummary,
                    ];
                    if (studentNameSort === "asc") {
                      sortedAttendance.sort((a, b) =>
                        a.name.localeCompare(b.name)
                      );
                    } else if (studentNameSort === "desc") {
                      sortedAttendance.sort((a, b) =>
                        b.name.localeCompare(a.name)
                      );
                    } else {
                      const activeAttendanceSort = Object.entries(
                        attendanceSorts
                      ).find(([, v]) => v === "asc" || v === "desc");
                      if (activeAttendanceSort) {
                        const [key, dir] = activeAttendanceSort;
                        sortedAttendance.sort((a, b) => {
                          const valA =
                            a.attendances[key as keyof typeof a.attendances] ??
                            0;
                          const valB =
                            b.attendances[key as keyof typeof b.attendances] ??
                            0;
                          if (dir === "asc") return valA - valB;
                          if (dir === "desc") return valB - valA;
                          return 0;
                        });
                      }
                    }
                    return sortedAttendance
                      .filter((student: StudentAttendanceSummary) =>
                        student.name
                          .toLowerCase()
                          .includes(searchStudentTerm.toLowerCase())
                      )
                      .map((student: StudentAttendanceSummary, idx: number) => (
                        <tr
                          key={student.studentId + selectedSubjectAttendance}
                          className={`${
                            idx % 2 === 0
                              ? "bg-white dark:bg-gray-900"
                              : "bg-gray-50 dark:bg-gray-800"
                          } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.present}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.absent}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.late}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.sick}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.excused}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.pending}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {student.attendances.present}/
                            {subjectAttendanceSummary.totalJournals}
                          </td>
                        </tr>
                      ));
                  })()
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center">
                      No attendance summary found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {classInfo?.role === "member" &&
        overviewMode === "grade" &&
        (() => {
          // Ambil data untuk subject yang dipilih
          const subjectData = memberSubject;
          if (!subjectData) {
            return (
              <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mt-4">
                <div className="p-4 text-center">
                  No assignment summary found for this subject.
                </div>
              </div>
            );
          }
          // Render tabel
          return (
            <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mt-4">
              <div className="max-h-103 overflow-y-auto">
                <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => {
                          setStudentNameSort((prev) => {
                            if (prev === "") return "asc";
                            if (prev === "asc") return "desc";
                            if (prev === "desc") return "asc";
                            return "";
                          });
                          setColumnSorts([]);
                        }}
                      >
                        <div className="flex items-center">
                          Name
                          <CgArrowsExchangeV />
                        </div>
                      </th>
                      {/* Ambil jumlah assignment dari data sesuai selectedAssignmentType */}
                      {(() => {
                        // Only show subject data for classInfo.instructors[0].subject
                        const subjectName = memberSubject || "";
                        const subjectData =
                          assignmentsSummaryBySubjects?.[subjectName];
                        const students = subjectData
                          ? Object.keys(subjectData)
                          : [];
                        // Cari jumlah assignment terbanyak dari semua siswa
                        let maxAssignment = 0;
                        students.forEach((studentName) => {
                          const arr =
                            subjectData[studentName]?.[
                              selectedAssignmentType
                            ] || [];
                          if (arr.length > maxAssignment)
                            maxAssignment = arr.length;
                        });
                        // Render th sesuai jumlah assignment, dengan sort icon dan handler
                        return Array.from({ length: maxAssignment }, (_, i) => (
                          <th
                            key={i}
                            className="px-6 py-4 text-center cursor-pointer"
                            onClick={() => {
                              // Ensure columnSorts has the correct length
                              if (studentNameSort !== "") {
                                setStudentNameSort("");
                              }
                              setColumnSorts((prev) => {
                                const newLength = maxAssignment;
                                const newSorts = Array.from(
                                  { length: newLength },
                                  (_, idx) => prev[idx] || ""
                                );
                                return newSorts.map((sort, idx) => {
                                  if (idx !== i) return "";
                                  if (sort === "") return "asc";
                                  if (sort === "asc") return "desc";
                                  if (sort === "desc") return "asc";
                                  return "";
                                });
                              });
                            }}
                          >
                            <div className="flex items-center justify-center">
                              {`${
                                selectedAssignmentType.charAt(0).toUpperCase() +
                                selectedAssignmentType.slice(1)
                              } ${i + 1}`}
                              <CgArrowsExchangeV
                                className={
                                  columnSorts[i] === "asc" ? "rotate-180" : ""
                                }
                              />
                            </div>
                          </th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sort rows by selected column score if columnSorts is set */}
                    {(() => {
                      // Only show subject data for classInfo.instructors[0].subject
                      const subjectName = memberSubject || "";
                      const subjectDataAll =
                        assignmentsSummaryBySubjects?.[subjectName];
                      if (!subjectDataAll) return null;
                      const studentsAll = Object.keys(subjectDataAll);
                      let maxAssignment = 0;
                      studentsAll.forEach((name) => {
                        const arr =
                          subjectDataAll[name]?.[selectedAssignmentType] || [];
                        if (arr.length > maxAssignment)
                          maxAssignment = arr.length;
                      });
                      // Sort students by name or by selected column
                      const activeSortIdx = columnSorts.findIndex(
                        (v) => v === "asc" || v === "desc"
                      );
                      const sortedStudents = [...studentsAll];
                      if (studentNameSort === "asc") {
                        sortedStudents.sort((a, b) => a.localeCompare(b));
                      } else if (studentNameSort === "desc") {
                        sortedStudents.sort((a, b) => b.localeCompare(a));
                      } else if (activeSortIdx !== -1) {
                        sortedStudents.sort((a, b) => {
                          const arrA =
                            subjectDataAll[a]?.[selectedAssignmentType] || [];
                          const arrB =
                            subjectDataAll[b]?.[selectedAssignmentType] || [];
                          const scoreA =
                            arrA[activeSortIdx]?.score ?? -Infinity;
                          const scoreB =
                            arrB[activeSortIdx]?.score ?? -Infinity;
                          if (columnSorts[activeSortIdx] === "asc")
                            return scoreA - scoreB;
                          if (columnSorts[activeSortIdx] === "desc")
                            return scoreB - scoreA;
                          return 0;
                        });
                      }
                      return sortedStudents.map((studentName, idx) => {
                        const assignmentArr =
                          subjectDataAll[studentName]?.[
                            selectedAssignmentType
                          ] || [];
                        return (
                          <tr
                            key={studentName}
                            className={`${
                              idx % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50 dark:bg-gray-800"
                            } hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {studentName}
                            </td>
                            {Array.from({ length: maxAssignment }, (_, i) => {
                              const assignment = assignmentArr[i];
                              return (
                                <td
                                  key={i}
                                  className="px-6 py-4 relative group"
                                >
                                  <span className="flex items-center gap-1 justify-center">
                                    {assignment ? assignment.score : "-"}
                                    {assignment && assignment.notes ? (
                                      <span className="text-xs text-gray-400">
                                        <TiMessageTyping />
                                      </span>
                                    ) : null}
                                  </span>
                                  {assignment && assignment.notes && (
                                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 min-w-[120px] max-w-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs rounded shadow px-3 py-2 border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                      {assignment.notes}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default StatisticsTab;

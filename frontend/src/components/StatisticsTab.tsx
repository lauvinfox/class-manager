import { IoSearchOutline } from "react-icons/io5";
import { ClassInfo } from "../types/types";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

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

  const subjects = classInfo?.subjects || [];
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectDropdown, setSubjectDropdown] = useState(false);

  const [assignmentType, setAssignmentType] = useState<
    "homework" | "quiz" | "exam" | "project" | "finalExam" | ""
  >("");
  const [assignmentTypeDropdown, setAssignmentTypeDropdown] = useState(false);

  // Button style improvement
  const buttonClass =
    "flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-md px-4 py-2 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-400";

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
          <>
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
                className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 w-45 rounded-lg shadow"
                type="button"
                onClick={() => setAssignmentTypeDropdown((v) => !v)}
              >
                <span>
                  {assignmentType === ""
                    ? "Assignment Type"
                    : assignmentType === "homework"
                    ? "Homework"
                    : assignmentType === "exam"
                    ? "Exam"
                    : assignmentType === "quiz"
                    ? "Quiz"
                    : assignmentType === "project"
                    ? "Project"
                    : "Final Exam"}
                </span>
                <FiChevronDown className="ml-auto" />
              </button>
            </div>
          </>
        )}
        {classInfo?.role == "member" && (
          <button className={buttonClass} type="button" disabled>
            <span>
              {classInfo.instructors && classInfo.instructors.length > 0
                ? classInfo.instructors[0].subject
                : ""}
            </span>
          </button>
        )}

        {classInfo?.role == "owner" && subjectDropdown && (
          <div className="z-10 absolute right-51 mt-35 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
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
        {classInfo?.role == "owner" && assignmentTypeDropdown && (
          <div className="z-10 absolute right-4 mt-62 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
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
                        assignmentType === type
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : ""
                      }`}
                      onClick={() => {
                        setAssignmentType(type as any);
                        setAssignmentTypeDropdown(false);
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
      <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="max-h-196 overflow-y-auto">
          <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Birth Date</th>
                <th className="px-6 py-4 text-center">Subject</th>
              </tr>
            </thead>
            <tbody>
              {classInfo?.students && classInfo.students.length > 0 ? (
                classInfo.students
                  .filter((student) =>
                    searchStudentTerm.trim() === ""
                      ? true
                      : student.name
                          .toLowerCase()
                          .includes(searchStudentTerm.trim().toLowerCase())
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
                      <td className="px-6 py-4">{student.studentId}</td>
                      <td className="px-6 py-4">
                        {new Date(student.birthDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )}
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
    </div>
  );
};

export default StatisticsTab;

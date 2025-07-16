import { useQuery } from "@tanstack/react-query";
import { getAssistanceByClassId, getSubjectByClassId } from "../lib/api";
import { ClassInfo } from "../types/types";
import { FiChevronDown } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { useState } from "react";

interface Assistance {
  studentName: string;
  classId: string;
  subject: string;
  assignmentId: string;
  assignmentName: string;
  assignmentDescription: string;
  assistantResponse: string;
  id: string;
}

const AssistancesTab = ({
  classId,
  classInfo,
}: {
  classId: string;
  classInfo: ClassInfo | null;
}) => {
  // Class Assistances By Class Id
  const { data: classAssistances } = useQuery({
    queryKey: ["classAssistances"],
    queryFn: async () => {
      const res = await getAssistanceByClassId(classId);
      return res.data;
    }, // Replace with actual API call
    refetchOnWindowFocus: false,
  });

  // Member subject data
  const { data: memberSubject } = useQuery({
    queryKey: ["memberSubject", classId],
    queryFn: async () => {
      if (!classId) return "";
      const res = await getSubjectByClassId(classId);
      return res.data;
    },
  });

  // Student search
  const [searchStudentTerm, setSearchStudentTerm] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectDropdown, setSubjectDropdown] = useState(false);
  const subjects = classInfo?.subjects || [];

  const handleStudentSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStudentTerm(event.target.value);
  };

  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [selectedAssistance, setSelectedAssistance] =
    useState<Assistance | null>(null);

  return (
    <div className="max-w-full overflow-x-auto py-4 px-4">
      <div className="flex justify-end mb-4 gap-2">
        <div className="flex w-full items-center gap-2">
          <div className="flex w-96 items-center gap-5 rounded-lg px-3 py-2 bg-gray-200 ">
            <IoSearchOutline className="text-gray-800" />
            <input
              type="text"
              placeholder="Search student"
              value={searchStudentTerm}
              onChange={handleStudentSearch}
              className="w-full outline-none bg-transparent"
            />
          </div>
        </div>
        {classInfo?.role === "owner" && (
          <>
            <button
              className="flex translate-x-[-8px] w-50 items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => setSubjectDropdown((v) => !v)}
            >
              <span>{selectedSubject == "" ? "Subject" : selectedSubject}</span>
              <FiChevronDown className="ml-auto" />
            </button>
          </>
        )}
        {classInfo?.role == "owner" && subjectDropdown && (
          <div className="z-10 absolute mt-12 mr-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
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
        {classInfo?.role === "member" && (
          <button
            className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
            type="button"
          >
            <span>{memberSubject}</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* Table for assistances, similar to assignments */}
        {classInfo?.role === "owner" &&
          selectedSubject === "" &&
          classAssistances && (
            <>
              {/* Filter by selectedSubject if chosen */}
              {(selectedSubject
                ? classAssistances[selectedSubject] || []
                : Object.values(classAssistances).flat()
              )
                .filter((assistance: Assistance) =>
                  assistance.studentName
                    .toLowerCase()
                    .includes(searchStudentTerm.toLowerCase())
                )
                .map((assistance: Assistance, idx: number) => (
                  <div
                    key={assistance.id || idx}
                    className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedAssistance(assistance);
                      setShowAssistanceModal(true);
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-lg mb-1">
                        {assistance.assignmentName || "Assistance Request"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                        {assistance.assignmentDescription}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                        <div className="text-gray-600 dark:text-gray-400">
                          {assistance.studentName}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {assistance.subject}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}
        {classInfo?.role === "owner" &&
          selectedSubject !== "" &&
          classAssistances && (
            <>
              {(Array.isArray(classAssistances[selectedSubject])
                ? classAssistances[selectedSubject]
                : Object.values(classAssistances).flat()
              )
                .filter(
                  (assistance: Assistance) =>
                    assistance.subject === selectedSubject &&
                    assistance.studentName
                      .toLowerCase()
                      .includes(searchStudentTerm.toLowerCase())
                )
                .map((assistance: Assistance, idx: number) => (
                  <div
                    key={assistance.id || idx}
                    className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedAssistance(assistance);
                      setShowAssistanceModal(true);
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-lg mb-1">
                        {assistance.assignmentName || "Assistance Request"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                        {assistance.assignmentDescription}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                        <div className="text-gray-600 dark:text-gray-400">
                          {assistance.studentName}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {assistance.subject}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}
        {classInfo?.role === "member" && classAssistances && (
          <>
            {(Array.isArray(classAssistances[selectedSubject])
              ? classAssistances[selectedSubject]
              : Object.values(classAssistances).flat()
            )
              .filter(
                (assistance: Assistance) =>
                  assistance.subject === memberSubject &&
                  assistance.studentName
                    .toLowerCase()
                    .includes(searchStudentTerm.toLowerCase())
              )
              .map((assistance: Assistance, idx: number) => (
                <div
                  key={assistance.id || idx}
                  className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSelectedAssistance(assistance);
                    setShowAssistanceModal(true);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-lg mb-1">
                      {assistance.assignmentName || "Assistance Request"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                      {assistance.assignmentDescription}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                      <div className="text-gray-600 dark:text-gray-400">
                        {assistance.studentName}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {assistance.subject}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
        {showAssistanceModal && selectedAssistance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[960px] h-[560px] relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                onClick={() => {
                  setShowAssistanceModal(false);
                  setSelectedAssistance(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-2">
                {selectedAssistance.assignmentName}
              </h2>
              <div className="mb-2 text-gray-500 dark:text-gray-300">
                {selectedAssistance.assignmentDescription}
              </div>
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-4">
                <div>
                  <span className="font-semibold">Student Name:</span>{" "}
                  {selectedAssistance.studentName}
                </div>
                <div>
                  <span className="font-semibold">Subject:</span>{" "}
                  {selectedAssistance.subject}
                </div>
                <div className="w-full break-words whitespace-pre-wrap max-h-86 overflow-y-auto p-2 bg-gray-100 rounded">
                  {selectedAssistance.assistantResponse
                    .split(/\r/)
                    .map((line, idx) => {
                      // Replace **text** with <b>text</b> for bold
                      const formattedLine = line.replace(
                        /\*\*(.+?)\*\*/g,
                        "<b>$1</b>"
                      );
                      return (
                        <div
                          key={idx}
                          dangerouslySetInnerHTML={{ __html: formattedLine }}
                        />
                      );
                    })}
                </div>
              </div>
              {classInfo?.role === "member" && (
                <div className="mt-4 flex items-center gap-4">
                  <button
                    className="mt-3 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition w-20"
                    onClick={() => {}}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistancesTab;

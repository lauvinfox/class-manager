import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { IoPersonAddOutline, IoSearchOutline } from "react-icons/io5";
import {
  addStudentsToClass,
  addStudentToClass,
  deleteStudentFromClass,
  deleteStudentsByClassId,
  getFullStudentReport,
} from "../lib/api";
import Dropzone from "./Dropzone";
import { ClassInfo } from "../types/types";
import { MdDelete, MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md";
import { generatePDF, studentDataToPDFRows } from "../utils/pdf";

const StudentsTab = ({
  classId,
  classInfo,
  handleRefresh,
}: {
  classId: string;
  classInfo: ClassInfo | null;
  handleRefresh: () => void;
}) => {
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
    onSuccess: () => {
      handleRefresh();
      setShowAddStudentModal(false);
      setSelectedFile(null);
      alert("Students uploaded successfully.");
    },
    onError: (error) => {
      console.error("Failed to upload students:", error);
      alert("Failed to upload students.");
    },
  });

  // Search student
  const [searchStudentTerm, setSearchStudentTerm] = useState("");
  const handleStudentSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchStudentTerm(event.target.value);
  };

  const [deleteStudentModal, setDeleteStudentModal] = useState(false);

  const { mutate: deleteStudents } = useMutation({
    mutationFn: async () => {
      if (!classId) throw new Error("Class ID not found");
      return await deleteStudentsByClassId(classId);
    },
    onSuccess: () => {
      handleRefresh();
      setDeleteStudentModal(false);
      alert("Students deleted successfully.");
    },
    onError: (error) => {
      console.error("Failed to delete students:", error);
      alert("Failed to delete students.");
    },
  });

  const { mutateAsync: addStudent } = useMutation({
    mutationFn: async (studentData: {
      studentId: number;
      name: string;
      birthDate: string;
      birthPlace: string;
      contact: string;
      address: string;
    }) => {
      if (!classId) throw new Error("Class ID not found");
      const res = await addStudentToClass(classId, studentData);
      return res.data;
    },
    onSuccess: () => {
      handleRefresh();
      setShowAddStudentModal(false);
      alert("Student added successfully.");
    },
    onError: (error) => {
      console.error("Failed to add student:", error);
      alert("Failed to add student.");
    },
  });

  const [addStudentForm, setStudentForm] = useState({
    studentId: "",
    name: "",
    birthDate: "",
    birthPlace: "",
    contact: "",
    address: "",
  });

  const handleAddStudent = (
    e: React.FormEvent<HTMLFormElement>,
    student: {
      studentId: string;
      name: string;
      birthDate: string;
      birthPlace: string;
      contact: string;
      address: string;
    }
  ) => {
    e.preventDefault();
    addStudent({
      studentId: parseInt(student.studentId, 10),
      name: student.name,
      birthDate: student.birthDate,
      birthPlace: student.birthPlace,
      contact: student.contact,
      address: student.address,
    })
      .then(() => {
        setStudentForm({
          studentId: "",
          name: "",
          birthDate: "",
          birthPlace: "",
          contact: "",
          address: "",
        });
      })
      .catch((error) => {
        console.error("Error creating assignment:", error);
      });
    setShowAddStudentModal(false);
    alert("Student added successfully!");
  };

  const { mutate: deleteStudent } = useMutation({
    mutationFn: async (id: string) => {
      return await deleteStudentFromClass(classId, id);
    },
    onSuccess: () => {
      handleRefresh();
      alert("Student deleted successfully.");
    },
    onError: (error) => {
      console.error("Failed to delete student:", error);
      alert("Failed to delete student.");
    },
  });

  const [showCreateReportModal, setShowCreateReportModal] = useState<
    string | null
  >(null);
  const [reportTab, setReportTab] = useState<"full" | "byTime">("full");
  const [fullReportNote, setFullReportNote] = useState("");
  const [byTimeReportNote, setByTimeReportNote] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { mutateAsync: createFullReport } = useMutation({
    mutationFn: async ({
      studentId,
      note,
    }: {
      studentId: string;
      note: string;
    }) => {
      if (!classId) throw new Error("Class ID not found");
      return await getFullStudentReport(classId, studentId, note);
    },
    onSuccess: () => {
      setShowCreateReportModal(null);
      setFullReportNote("");
      alert("Full report created successfully!");
    },
    onError: (error) => {
      console.error("Failed to create full report:", error);
      alert("Failed to create full report.");
    },
  });

  return (
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
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              onClick={() => setShowAddStudentModal(true)}
            >
              <IoPersonAddOutline className="text-lg" />
              Add Student
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-white bg-red-600 hover:bg-red-700 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow"
              onClick={() => setDeleteStudentModal(true)}
            >
              <MdDelete className="text-lg" />
              Delete Students
            </button>
            {deleteStudentModal && (
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
                              Delete All Students
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to delete all students in
                                this class? This action cannot be undone.
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
                            deleteStudents();
                          }}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={() => setDeleteStudentModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="max-h-80 overflow-y-auto">
          <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Birth Date</th>

                {classInfo?.role === "owner" && (
                  <th className="px-6 py-4 text-center">Report</th>
                )}
                {classInfo?.role === "owner" && (
                  <th className="px-6 py-4 text-center">Action</th>
                )}
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
                      {classInfo?.role === "owner" && (
                        <>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              className="px-3 py-2 rounded bg-slate-500 text-white font-semibold hover:bg-slate-800"
                              onClick={() =>
                                setShowCreateReportModal(student.studentId)
                              }
                            >
                              Create Report
                            </button>
                            {showCreateReportModal === student.studentId && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative h-120">
                                  <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                                    onClick={() =>
                                      setShowCreateReportModal(null)
                                    }
                                    aria-label="Close"
                                  >
                                    &times;
                                  </button>
                                  <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
                                    Create Report for {student.name}
                                  </h2>
                                  {/* Tabs for report type */}
                                  <div className="flex gap-2 mb-4">
                                    <button
                                      className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors duration-150 ${
                                        reportTab === "full"
                                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                          : "border-transparent text-gray-500 dark:text-gray-400"
                                      }`}
                                      onClick={() => setReportTab("full")}
                                    >
                                      Full Report
                                    </button>
                                    <button
                                      className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors duration-150 ${
                                        reportTab === "byTime"
                                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                          : "border-transparent text-gray-500 dark:text-gray-400"
                                      }`}
                                      onClick={() => setReportTab("byTime")}
                                    >
                                      Report by Time
                                    </button>
                                  </div>
                                  {reportTab === "full" ? (
                                    <form
                                      className="flex flex-col gap-2"
                                      onSubmit={async (e) => {
                                        e.preventDefault();
                                        const response = await createFullReport(
                                          {
                                            studentId: student.id,
                                            note: fullReportNote,
                                          }
                                        );
                                        const studentData = response.data;
                                        const rows =
                                          studentDataToPDFRows(studentData);
                                        generatePDF({
                                          title: "Student Report",
                                          rows,
                                          data: studentData,
                                        });
                                        setShowCreateReportModal(null);
                                        setFullReportNote("");
                                      }}
                                    >
                                      <div className="flex items-center gap-2 mt-2">
                                        <label className="whitespace-nowrap font-bold">
                                          Note
                                        </label>
                                      </div>
                                      <textarea
                                        className="border rounded px-3 py-2 mb-20"
                                        placeholder="Note for the report"
                                        rows={8}
                                        value={fullReportNote}
                                        onChange={(e) =>
                                          setFullReportNote(e.target.value)
                                        }
                                      />
                                      <div className="flex justify-end gap-2 mt-auto">
                                        <button
                                          type="button"
                                          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                                          onClick={() =>
                                            setShowCreateReportModal(null)
                                          }
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="submit"
                                          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                                        >
                                          Create
                                        </button>
                                      </div>
                                    </form>
                                  ) : (
                                    <form
                                      className="flex flex-col gap-2"
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        // TODO: handle create report by time logic here
                                        setShowCreateReportModal(null);
                                        alert("Report by time created!");
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <label className="whitespace-nowrap font-bold">
                                          Start Date
                                        </label>
                                      </div>
                                      <input
                                        className="border rounded px-3 py-2"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                          setStartDate(e.target.value)
                                        }
                                      />
                                      <div className="flex items-center gap-2">
                                        <label className="whitespace-nowrap font-bold">
                                          End Date
                                        </label>
                                      </div>
                                      <input
                                        className="border rounded px-3 py-2"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                          setEndDate(e.target.value)
                                        }
                                      />
                                      <div className="flex items-center gap-2">
                                        <label className="whitespace-nowrap font-bold">
                                          Note
                                        </label>
                                      </div>
                                      <textarea
                                        className="border rounded px-3 py-2 mb-5"
                                        placeholder="Report Description"
                                        rows={4}
                                        value={byTimeReportNote}
                                        onChange={(e) =>
                                          setByTimeReportNote(e.target.value)
                                        }
                                      />
                                      <div className="flex justify-end gap-2 mt-auto">
                                        <button
                                          type="button"
                                          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                                          onClick={() =>
                                            setShowCreateReportModal(null)
                                          }
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="submit"
                                          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                                        >
                                          Create
                                        </button>
                                      </div>
                                    </form>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Edit"
                              >
                                <MdOutlineModeEdit className="text-lg" />
                              </button>
                              <button
                                type="button"
                                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Delete"
                                onClick={() => {
                                  setDeleteStudentModal(true);
                                }}
                              >
                                <MdDeleteOutline className="text-lg" />
                              </button>
                              {deleteStudentModal && (
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
                                                Delete Student
                                              </h3>
                                              <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                  Are you sure you want to
                                                  delete this student? This
                                                  action cannot be undone.
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
                                              deleteStudent(student.id);
                                              setDeleteStudentModal(false);
                                            }}
                                          >
                                            Delete
                                          </button>
                                          <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() =>
                                              setDeleteStudentModal(false)
                                            }
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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
              <form
                className="flex flex-col gap-2 h-90"
                onSubmit={(e) => {
                  handleAddStudent(e, addStudentForm);
                }}
              >
                {/* Form input satu-satu student */}
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Name"
                  value={addStudentForm.name}
                  onChange={(e) =>
                    setStudentForm({
                      ...addStudentForm,
                      name: e.target.value,
                    })
                  }
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Student Id"
                  value={addStudentForm.studentId}
                  onChange={(e) =>
                    setStudentForm({
                      ...addStudentForm,
                      studentId: e.target.value,
                    })
                  }
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Birth date (YYYY-MM-DD)"
                  value={addStudentForm.birthDate}
                  onChange={(e) =>
                    setStudentForm({
                      ...addStudentForm,
                      birthDate: e.target.value,
                    })
                  }
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Birth place"
                  value={addStudentForm.birthPlace}
                  onChange={(e) =>
                    setStudentForm({
                      ...addStudentForm,
                      birthPlace: e.target.value,
                    })
                  }
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Contact"
                  value={addStudentForm.contact}
                  onChange={(e) =>
                    setStudentForm({
                      ...addStudentForm,
                      contact: e.target.value,
                    })
                  }
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Address"
                  value={addStudentForm.address}
                  onChange={(e) =>
                    setStudentForm({
                      ...addStudentForm,
                      address: e.target.value,
                    })
                  }
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
                  uploadStudentsCsv(selectedFile as File);
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
  );
};

export default StudentsTab;

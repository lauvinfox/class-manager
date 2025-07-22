import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getClassWeightBySubject,
  getClassWeights,
  getSubjectByClassId,
  giveSubjectWeights,
} from "../lib/api";
import { ClassInfo } from "../types/types";
import { useState } from "react";

interface AssignmentWeights {
  subject: string;
  assignmentWeight: {
    homework: number;
    quiz: number;
    exam: number;
    project: number;
    finalExam: number;
  };
}

const SubjectsTab = ({
  classId,
  classInfo,
}: {
  classId: string;
  classInfo: ClassInfo | null;
  handleRefresh: () => void;
}) => {
  const { mutate: updateClassWeights } = useMutation({
    mutationFn: async ({
      classId,
      subject,
      assignmentWeight,
    }: {
      classId: string;
      subject: string;
      assignmentWeight: {
        homework?: number;
        quiz?: number;
        exam?: number;
        project?: number;
        finalExam?: number;
      };
    }) => {
      return await giveSubjectWeights({ classId, subject, assignmentWeight });
    },
    onSuccess: () => {
      refetchWeight();
      refetchSubjectWeight();
    },
  });

  const { data: classWeights, refetch: refetchWeight } = useQuery({
    queryKey: ["classWeights", classId],
    queryFn: async () => {
      const response = await getClassWeights(classId);
      return response.data;
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

  const { data: classWeightBySubject, refetch: refetchSubjectWeight } =
    useQuery({
      queryKey: ["classWeightBySubject", classId, memberSubject],
      queryFn: async () => {
        const response = await getClassWeightBySubject(classId, memberSubject);
        return response.data;
      },
    });

  const [showUpdateWeight, setShowUpdateWeight] = useState(false);
  const [newAssignmentWeight, setNewAssignmentWeights] = useState<{
    homework: number;
    quiz: number;
    exam: number;
    project: number;
    finalExam: number;
  }>({
    homework: 0,
    quiz: 0,
    exam: 0,
    project: 0,
    finalExam: 0,
  });

  const handleUpdateWeights = ({
    classId,
    subject,
    assignmentWeight,
  }: {
    classId: string;
    subject: string;
    assignmentWeight: {
      homework: number;
      quiz: number;
      exam: number;
      project: number;
      finalExam: number;
    };
  }) => {
    if (!classId || !memberSubject) return;
    updateClassWeights({
      classId,
      subject,
      assignmentWeight,
    });
    alert("Subject weights updated successfully");
    setShowUpdateWeight(false);
  };

  return (
    <div className="mx-auto py-4 px-4">
      {classInfo?.role === "owner" && (
        <div className="mx-auto py-8 px-4">
          <h2 className="text-2xl font-semibold mb-6">Subject Weights</h2>
          <div className="space-y-4 pb-4">
            {classWeights && classWeights.length > 0 ? (
              // Chunk classWeights into groups of 4
              Array.from(
                { length: Math.ceil(classWeights.length / 4) },
                (_, rowIdx) => (
                  <div key={rowIdx} className="flex flex-row gap-4">
                    {classWeights
                      .slice(rowIdx * 4, rowIdx * 4 + 4)
                      .map((subjectWeight: AssignmentWeights, idx: number) => (
                        <div
                          key={subjectWeight.subject || idx}
                          className="min-w-[260px] bg-white shadow rounded-lg p-6 flex-shrink-0"
                        >
                          <h3 className="text-lg font-bold mb-2">
                            {subjectWeight.subject}
                          </h3>
                          <ul className="text-sm space-y-1">
                            <li>
                              <span className="font-medium">Homework:</span>{" "}
                              {subjectWeight.assignmentWeight?.homework}%
                            </li>
                            <li>
                              <span className="font-medium">Quiz:</span>{" "}
                              {subjectWeight.assignmentWeight?.quiz}%
                            </li>
                            <li>
                              <span className="font-medium">Exam:</span>{" "}
                              {subjectWeight.assignmentWeight?.exam}%
                            </li>
                            <li>
                              <span className="font-medium">Project:</span>{" "}
                              {subjectWeight.assignmentWeight?.project}%
                            </li>
                            <li>
                              <span className="font-medium">Final Exam:</span>{" "}
                              {subjectWeight.assignmentWeight?.finalExam}%
                            </li>
                          </ul>
                        </div>
                      ))}
                  </div>
                )
              )
            ) : (
              <div className="text-gray-500">No subject weights found.</div>
            )}
          </div>
        </div>
      )}
      {classInfo?.role === "member" && (
        <div className="flex flex-col gap-2 dark:bg-gray-900 dark:text-slate-200 dark:border-slate-200 p-6 h-full">
          <h2 className="text-2xl font-semibold mb-4">Subject Weights</h2>
          {classWeightBySubject ? (
            <div className="min-w-[260px] bg-white shadow rounded-lg p-6 flex-shrink-0 dark:bg-gray-800 relative">
              <h3 className="text-lg font-bold mb-2">
                {classWeightBySubject.subject}
              </h3>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="font-medium">Homework:</span>{" "}
                  {classWeightBySubject.assignmentWeight?.homework ?? 0}%
                </li>
                <li>
                  <span className="font-medium">Quiz:</span>{" "}
                  {classWeightBySubject.assignmentWeight?.quiz ?? 0}%
                </li>
                <li>
                  <span className="font-medium">Exam:</span>{" "}
                  {classWeightBySubject.assignmentWeight?.exam ?? 0}%
                </li>
                <li>
                  <span className="font-medium">Project:</span>{" "}
                  {classWeightBySubject.assignmentWeight?.project ?? 0}%
                </li>
                <li>
                  <span className="font-medium">Final Exam:</span>{" "}
                  {classWeightBySubject.assignmentWeight?.finalExam ?? 0}%
                </li>
              </ul>
              <button
                className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                onClick={() => {
                  setNewAssignmentWeights({
                    homework:
                      classWeightBySubject.assignmentWeight?.homework ?? 0,
                    quiz: classWeightBySubject.assignmentWeight?.quiz ?? 0,
                    exam: classWeightBySubject.assignmentWeight?.exam ?? 0,
                    project:
                      classWeightBySubject.assignmentWeight?.project ?? 0,
                    finalExam:
                      classWeightBySubject.assignmentWeight?.finalExam ?? 0,
                  });
                  setShowUpdateWeight(true);
                }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="text-gray-500">No subject weights found.</div>
          )}
        </div>
      )}
      {showUpdateWeight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[400px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={() => setShowUpdateWeight(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-1">Update Subject Weights</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter value in percent (%).
            </p>
            <form
              className="flex flex-col gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateWeights({
                  classId,
                  subject: memberSubject,
                  assignmentWeight: newAssignmentWeight,
                });
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Homework<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newAssignmentWeight.homework}
                  onChange={(e) =>
                    setNewAssignmentWeights({
                      ...newAssignmentWeight,
                      homework: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quiz<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newAssignmentWeight.quiz}
                  onChange={(e) =>
                    setNewAssignmentWeights({
                      ...newAssignmentWeight,
                      quiz: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exam<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newAssignmentWeight.exam}
                  onChange={(e) =>
                    setNewAssignmentWeights({
                      ...newAssignmentWeight,
                      exam: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newAssignmentWeight.project}
                  onChange={(e) =>
                    setNewAssignmentWeights({
                      ...newAssignmentWeight,
                      project: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Final Exam<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newAssignmentWeight.finalExam}
                  onChange={(e) =>
                    setNewAssignmentWeights({
                      ...newAssignmentWeight,
                      finalExam: Number(e.target.value),
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => setShowUpdateWeight(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsTab;

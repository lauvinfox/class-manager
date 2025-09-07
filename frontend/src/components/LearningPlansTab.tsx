import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createClassLearningPlan,
  getLearningPlan,
  getLearningPlansByClass,
  getSubjectByClassId,
  updateLearningPlan,
} from "../lib/api";
import { ClassInfo } from "../types/types";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { useState } from "react";
import Spinner from "./Spinner";
import { IoSearchOutline } from "react-icons/io5";
import { useLanguage } from "../contexts/LanguageContext";

interface LearningPlan {
  subject: string;
  topic: string;
  level: "dasar" | "menengah" | "tinggi";
  duration: number;
  learningStyle: string;
  learningPlan: string;
  id: string;
}

const LearningPlansTab = ({
  classId,
  classInfo,
}: {
  classId: string;
  classInfo: ClassInfo | null;
}) => {
  const { language } = useLanguage();

  // Create learning plan mutation
  const { mutate: createLearningPlan } = useMutation({
    mutationFn: async ({
      classId,
      subject,
      topic,
      level,
      duration,
      learningStyle,
      learningPlan,
    }: {
      classId: string;
      subject: string;
      topic: string;
      level: string;
      duration: number;
      learningStyle: string;
      learningPlan: string;
    }) => {
      const response = await createClassLearningPlan({
        classId,
        subject,
        topic,
        level,
        duration,
        learningStyle,
        learningPlan,
      });
      return response.data;
    },
  });

  // Create learning plan
  const { mutate: learningPlan, isPending: learningPlanPending } = useMutation({
    mutationFn: async (formData: {
      topic: string;
      level: string;
      duration: number;
      learningStyle: string;
    }) => {
      const response = await getLearningPlan({
        classId,
        subject: memberSubject,
        topic: formData.topic,
        level: formData.level,
        duration: formData.duration,
        learningStyle: formData.learningStyle,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLearningPlanText(data);
      setShowLearningPlanModal(true);
    },
  });

  const [form, setForm] = useState({
    topic: "",
    level: "dasar",
    duration: 0,
    learningStyle: "",
  });

  const { data: memberSubject } = useQuery({
    queryKey: ["memberSubject"],
    queryFn: async () => {
      if (!classId) return "";
      const res = await getSubjectByClassId(classId);
      return res.data;
    },
  });

  const { data: classLearningPlans, refetch: refetchLearningPlan } = useQuery({
    queryKey: ["classLearningPlans"], // Replace "your-class-id" with actual classId variable if available
    queryFn: async () => {
      if (!classId) return "";
      const res = await getLearningPlansByClass(classId);
      return res.data;
    },
  });

  const { mutate: updatePlan } = useMutation({
    mutationFn: async ({
      learningPlanId,
      learningPlan,
    }: {
      learningPlanId: string;
      learningPlan: string;
    }) => {
      const res = await updateLearningPlan(learningPlanId, learningPlan);
      return res.data;
    },
    onSuccess: () => {
      refetchLearningPlan();
    },
  });

  const subjects = classInfo?.subjects || [];
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectDropdown, setSubjectDropdown] = useState(false);

  const [showCreateLearningPlanModal, setShowCreateLearningPlanModal] =
    useState(false);

  const [showLearningPlanModal, setShowLearningPlanModal] = useState(false);
  const [learningPlanText, setLearningPlanText] = useState("");

  const handleCreateLearningPlan = () => {
    if (!form.topic || !form.level || !form.duration || !form.learningStyle) {
      alert("Please fill in all required fields.");
      return;
    }
    // Call the
    createLearningPlan({
      classId,
      subject: memberSubject,
      topic: form.topic,
      level: form.level,
      duration: form.duration,
      learningStyle: form.learningStyle,
      learningPlan: learningPlanText,
    });
    setShowLearningPlanModal(false);
  };

  const handleUpdateLearningPlan = (
    learningPlanId: string,
    learningPlanText: string
  ) => {
    if (!selectedLearningPlan) return;
    updatePlan(
      {
        learningPlanId: learningPlanId,
        learningPlan: learningPlanText,
      },
      {
        onSuccess: () => {
          setSelectedLearningPlan((prev) =>
            prev ? { ...prev, learningPlan: learningPlanText } : prev
          );
          setIsEdit(false);
          setShowLearningPlanModal(false);
        },
      }
    );
  };

  const [showLearningPlan, setShowLearningPlan] = useState(false);
  const [selectedLearningPlan, setSelectedLearningPlan] =
    useState<LearningPlan | null>(null);

  const [searchTopicTerm, setSearchTopicTerm] = useState("");
  const handleSearchTopic = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTopicTerm(event.target.value);
  };

  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="max-w-full overflow-x-auto py-4 px-4">
      <div className="flex justify-end mb-4 gap-2">
        <div className="flex w-full items-center gap-2">
          <div className="flex w-[35%] items-center gap-5 rounded-lg px-3 py-2 bg-gray-200 dark:bg-gray-800">
            <IoSearchOutline className="text-gray-800 dark:text-gray-200" />
            <input
              type="text"
              placeholder={language === "id" ? "Cari topik" : "Search topic"}
              value={searchTopicTerm}
              onChange={handleSearchTopic}
              className="w-full outline-none bg-transparent"
            />
          </div>
        </div>
        {classInfo?.role === "owner" && (
          <>
            <button
              className="flex translate-x-[-8px] w-44 items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
              onClick={() => setSubjectDropdown((v) => !v)}
            >
              <span>
                {selectedSubject == ""
                  ? language === "id"
                    ? "Subyek"
                    : "Subject"
                  : selectedSubject}
              </span>
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
                    {language === "id" ? "Tidak ada mapel" : "No subjects"}
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
          <>
            <button
              type="button"
              className={`flex items-center gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow ${
                language === "id" ? "w-75" : "w-60"
              }`}
              title={
                language === "id"
                  ? "Buat Rencana Pembelajaran"
                  : "Create Learning Plan"
              }
              onClick={() => setShowCreateLearningPlanModal(true)}
            >
              <FiPlus />
              {language === "id"
                ? "Buat Rencana Pembelajaran"
                : "Create Learning Plan"}
            </button>
            <button
              className="flex items-center justify-between gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
              type="button"
            >
              <span>{memberSubject}</span>
            </button>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {classInfo?.role === "owner" &&
          selectedSubject === "" &&
          classLearningPlans && (
            <>
              {/* Filter by selectedSubject if chosen */}
              {(selectedSubject
                ? classLearningPlans[selectedSubject] || []
                : Object.values(classLearningPlans).flat()
              )
                .filter((learningPlan: LearningPlan) =>
                  learningPlan.topic
                    .toLowerCase()
                    .includes(searchTopicTerm.toLowerCase())
                )
                .map((learningPlan: LearningPlan, idx: number) => (
                  <div
                    key={learningPlan.id || idx}
                    className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedLearningPlan(learningPlan);
                      setShowLearningPlan(true);
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-lg mb-1">
                        {learningPlan.subject ||
                          (language === "id"
                            ? "Permintaan Bantuan"
                            : "Assistance Request")}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                        {learningPlan.topic}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.level === "dasar"
                            ? language === "id"
                              ? "Pemula"
                              : "Beginner"
                            : learningPlan.level === "menengah"
                            ? language === "id"
                              ? "Menengah"
                              : "Intermediate"
                            : language === "id"
                            ? "Tinggi"
                            : "High"}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.duration}{" "}
                          {language === "id" ? "jam" : "hours"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}
        {classInfo?.role === "owner" &&
          selectedSubject !== "" &&
          classLearningPlans && (
            <>
              {(Array.isArray(classLearningPlans[selectedSubject])
                ? classLearningPlans[selectedSubject]
                : Object.values(classLearningPlans).flat()
              )
                .filter(
                  (learningPlan: LearningPlan) =>
                    learningPlan.subject === selectedSubject &&
                    learningPlan.topic
                      .toLowerCase()
                      .includes(searchTopicTerm.toLowerCase())
                )
                .map((learningPlan: LearningPlan, idx: number) => (
                  <div
                    key={learningPlan.id || idx}
                    className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedLearningPlan(learningPlan);
                      setShowLearningPlan(true);
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-lg mb-1">
                        {learningPlan.subject ||
                          (language === "id"
                            ? "Permintaan Bantuan"
                            : "Assistance Request")}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                        {learningPlan.topic}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.level === "dasar"
                            ? language === "id"
                              ? "Pemula"
                              : "Beginner"
                            : learningPlan.level === "menengah"
                            ? language === "id"
                              ? "Menengah"
                              : "Intermediate"
                            : language === "id"
                            ? "Tinggi"
                            : "High"}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.duration}{" "}
                          {language === "id" ? "jam" : "hours"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}
        {classInfo?.role === "member" && classLearningPlans && (
          <>
            {(Array.isArray(classLearningPlans[selectedSubject])
              ? classLearningPlans[selectedSubject]
              : Object.values(classLearningPlans).flat()
            )
              .filter(
                (learningPlan: LearningPlan) =>
                  learningPlan.subject === memberSubject &&
                  learningPlan.topic
                    .toLowerCase()
                    .includes(searchTopicTerm.toLowerCase())
              )
              .map((learningPlan: LearningPlan, idx: number) => (
                <div
                  key={learningPlan.id || idx}
                  className="p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-100 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSelectedLearningPlan(learningPlan);
                    setShowLearningPlan(true);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-lg mb-1">
                      {learningPlan.subject ||
                        (language === "id"
                          ? "Permintaan Bantuan"
                          : "Assistance Request")}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                      {learningPlan.topic}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                      <div className="text-gray-600 dark:text-gray-400">
                        {learningPlan.learningStyle}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {learningPlan.duration}{" "}
                        {language === "id" ? "jam" : "hours"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
        {showLearningPlan && selectedLearningPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[960px] h-[560px] relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                onClick={() => {
                  setShowLearningPlan(false);
                  setSelectedLearningPlan(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-2">
                {selectedLearningPlan.subject}
              </h2>
              <div className="mb-2 text-gray-500 dark:text-gray-300">
                {selectedLearningPlan.topic}
              </div>
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-4">
                <div>
                  <span className="font-semibold">Student Name:</span>{" "}
                  {selectedLearningPlan.learningStyle}
                </div>
                <div>
                  <span className="font-semibold">Learning Style:</span>{" "}
                  {selectedLearningPlan.learningStyle}
                </div>
                <div>
                  <span className="font-semibold">Level:</span>{" "}
                  {selectedLearningPlan.level === "dasar"
                    ? "Beginner"
                    : selectedLearningPlan.level === "menengah"
                    ? "Intermediate"
                    : "High"}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span>{" "}
                  {selectedLearningPlan.duration} hours
                </div>
                <div
                  className={`w-full break-words whitespace-pre-wrap max-h-86 overflow-y-auto p-2 ${
                    isEdit ? "bg-white" : "bg-gray-100"
                  } rounded`}
                >
                  {isEdit ? (
                    <textarea
                      id="description"
                      className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full min-h-80 resize-none"
                      value={learningPlanText}
                      onChange={(e) => setLearningPlanText(e.target.value)}
                    />
                  ) : (
                    selectedLearningPlan.learningPlan
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
                      })
                  )}
                </div>
              </div>
              {classInfo?.role === "member" && isEdit ? (
                <div className="mt-4 flex items-center gap-4">
                  <button
                    className="mt-3 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition w-20"
                    onClick={() =>
                      handleUpdateLearningPlan(
                        selectedLearningPlan.id,
                        learningPlanText
                      )
                    }
                  >
                    {language === "id" ? "Simpan" : "Save"}
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-4">
                  <button
                    className="mt-3 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition w-20"
                    onClick={() => {
                      setIsEdit(!isEdit);
                      setLearningPlanText(selectedLearningPlan.learningPlan);
                    }}
                  >
                    {language === "id" ? "Edit" : "Edit"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {showCreateLearningPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[400px] relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                onClick={() => setShowCreateLearningPlanModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">
                {language === "id"
                  ? "Buat Rencana Pembelajaran"
                  : "Create Learning Plan"}
              </h2>
              <form
                className="flex flex-col gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    !form.topic ||
                    !form.level ||
                    !form.duration ||
                    !form.learningStyle
                  ) {
                    alert(
                      `Topic, Level, Duration, and Learning Style are required. ${form.topic} ${form.level} ${form.duration} ${form.learningStyle}`
                    );
                    return;
                  }
                  learningPlan({
                    topic: form.topic,
                    level: form.level,
                    duration: form.duration,
                    learningStyle: form.learningStyle,
                  });
                  setShowCreateLearningPlanModal(false);
                }}
              >
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="topic"
                  >
                    {language === "id" ? "Topik" : "Topic"}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="topic"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder={
                      language === "id"
                        ? "Topik Rencana Pembelajaran"
                        : "Learning Plan Topic"
                    }
                    value={form.topic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, topic: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="learningLevel"
                  >
                    {language === "id" ? "Tingkat" : "Level"}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="learningLevel"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={form.level || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        level: e.target.value as
                          | "dasar"
                          | "menengah"
                          | "tinggi",
                      }))
                    }
                    required
                  >
                    <option value="dasar">
                      {language === "id" ? "Pemula" : "Beginner"}
                    </option>
                    <option value="menengah">
                      {language === "id" ? "Menengah" : "Intermediate"}
                    </option>
                    <option value="tinggi">
                      {language === "id" ? "Tinggi" : "High"}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="duration"
                  >
                    {language === "id" ? "Durasi (jam)" : "Duration in Hour"}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="duration"
                    className="border rounded-lg px-3 py-2 w-full min-h-[30px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder={
                      language === "id" ? "Durasi (jam)" : "Duration in hour"
                    }
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duration: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="learningStyle"
                  >
                    {language === "id" ? "Gaya Belajar" : "Learning Style"}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="learningStyle"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={form.learningStyle || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        learningStyle: e.target.value as
                          | "visual"
                          | "auditory"
                          | "kinesthetic"
                          | "reading-writing"
                          | "collaborative"
                          | "independent"
                          | "problem-based"
                          | "inquiry-based",
                      }))
                    }
                    required
                  >
                    <option value="visual">
                      {language === "id" ? "Visual" : "Visual"}
                    </option>
                    <option value="auditory">
                      {language === "id" ? "Auditori" : "Auditory"}
                    </option>
                    <option value="kinesthetic">
                      {language === "id" ? "Kinestetik" : "Kinesthetic"}
                    </option>
                    <option value="reading-writing">
                      {language === "id"
                        ? "Membaca-Menulis"
                        : "Reading-Writing"}
                    </option>
                    <option value="collaborative">
                      {language === "id" ? "Kolaboratif" : "Collaborative"}
                    </option>
                    <option value="independent">
                      {language === "id" ? "Mandiri" : "Independent"}
                    </option>
                    <option value="problem-based">
                      {language === "id" ? "Berbasis Masalah" : "Problem-based"}
                    </option>
                    <option value="inquiry-based">
                      {language === "id" ? "Berbasis Inkuiri" : "Inquiry-based"}
                    </option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => setShowCreateLearningPlanModal(false)}
                  >
                    {language === "id" ? "Batal" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                  >
                    {language === "id" ? "Buat" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Learning Plan Pending */}
        {learningPlanPending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="flex items-center justify-center h-full w-full">
              <Spinner />
            </div>
          </div>
        )}

        {/* Showing Learning Plan Response */}
        {showLearningPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-[400px] relative ">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
                onClick={() => setShowLearningPlanModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">
                {language === "id"
                  ? "Buat Rencana Pembelajaran"
                  : "Create Learning Plan"}
              </h2>
              <form
                className="flex flex-col gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateLearningPlan();
                }}
              >
                <div>
                  <label
                    className="block text-sm text-left font-medium mb-1"
                    htmlFor="description"
                  >
                    {language === "id"
                      ? "Rencana Pembelajaran"
                      : "Learning Plan"}
                  </label>
                  <textarea
                    id="description"
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full min-h-[250px] resize-none"
                    placeholder={
                      language === "id"
                        ? "Deskripsi Rencana Pembelajaran"
                        : "Assignment Description"
                    }
                    value={learningPlanText}
                    onChange={(e) => setLearningPlanText(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                  >
                    {language === "id" ? "Simpan" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlansTab;

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
import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";
import { IoSearchOutline } from "react-icons/io5";
import { useLanguage } from "../contexts/LanguageContext";
import { wordTranslations } from "../constants";

interface LearningPlan {
  subject: string;
  topic: string;
  level: "dasar" | "menengah" | "tinggi";
  duration: number;
  learningStyle: string;
  learningPlan:
    | "visual"
    | "auditory"
    | "kinesthetic"
    | "reading-writing"
    | "collaborative"
    | "independent"
    | "problem-based"
    | "inquiry-based";
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

  const t = wordTranslations(language);

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
    onSuccess: () => {
      refetchLearningPlan();
    },
  });

  // Create learning plan
  const { mutate: learningPlan, isPending: learningPlanPending } = useMutation({
    mutationFn: async ({
      topic,
      level,
      duration,
      learningStyle = "visual",
    }: {
      topic: string;
      level: string;
      duration: number;
      learningStyle: string;
    }) => {
      const response = await getLearningPlan({
        classId,
        subject: memberSubject,
        topic: topic,
        level: level,
        duration: duration,
        learningStyle: learningStyle,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setLearningPlanText(data);
      setShowLearningPlanModal(true);
      refetchLearningPlan();
    },
  });

  const [form, setForm] = useState({
    topic: "",
    level: "dasar",
    duration: 0,
    learningStyle: "visual",
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
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return subjects.length > 0 ? subjects[0] : "";
  });

  const [subjectDropdown, setSubjectDropdown] = useState(false);

  // Ref for dropdown area
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subjectDropdown === false) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSubjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [subjectDropdown]);

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
            prev ? { ...prev, learningPlan: prev.learningPlan } : prev
          );
          refetchLearningPlan();
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
    <div className="max-w-full overflow-x-auto py-4 px-4" ref={dropdownRef}>
      <div className="flex justify-end mb-4 gap-2">
        <div className="flex w-full items-center gap-2">
          <div className="flex w-[35%] items-center gap-5 rounded-lg px-3 py-2 bg-gray-200 dark:bg-gray-800">
            <IoSearchOutline className="text-gray-800 dark:text-gray-200" />
            <input
              type="text"
              placeholder={t.searchTopic}
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
              <span>{selectedSubject == "" ? t.subject : selectedSubject}</span>
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
        {classInfo?.role === "member" && memberSubject && (
          <>
            <button
              type="button"
              className={`flex items-center gap-2 text-sm text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold px-4 py-2 rounded-lg shadow ${
                language === "id" ? "w-75" : "w-60"
              }`}
              title={t.createLearningPlan}
              onClick={() => setShowCreateLearningPlanModal(true)}
            >
              <FiPlus />
              {t.createLearningPlan}
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
                        {learningPlan.subject || t.assistanceRequest}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                        {learningPlan.topic}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.level === "dasar"
                            ? t.beginner
                            : learningPlan.level === "menengah"
                            ? t.intermediate
                            : t.high}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.duration} {t.hours}
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
                        {learningPlan.subject || t.assistanceRequest}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                        {learningPlan.topic}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.level === "dasar"
                            ? t.beginner
                            : learningPlan.level === "menengah"
                            ? t.intermediate
                            : t.high}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {learningPlan.duration} {t.hours}
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
                      {learningPlan.subject || t.assistanceRequest}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
                      {learningPlan.topic}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                      <div className="text-gray-600 dark:text-gray-400">
                        {learningPlan.learningStyle}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {learningPlan.duration} {t.hours}
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
                  <span className="font-semibold">{t.learningStyle}:</span>{" "}
                  {selectedLearningPlan.learningStyle}
                </div>
                <div>
                  <span className="font-semibold">{t.level}:</span>{" "}
                  {selectedLearningPlan.level === "dasar"
                    ? t.beginner
                    : selectedLearningPlan.level === "menengah"
                    ? t.intermediate
                    : t.high}
                </div>
                <div>
                  <span className="font-semibold">{t.duration}:</span>{" "}
                  {selectedLearningPlan.duration} {t.hours}
                </div>
                <div
                  className={`w-full break-words whitespace-pre-wrap max-h-86 overflow-y-auto p-2 rounded`}
                >
                  {isEdit ? (
                    <textarea
                      id="description"
                      className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full min-h-80 resize-none dark:bg-gray-800"
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
              {classInfo?.role === "member" &&
                (isEdit ? (
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      className="mt-3 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 w-20 transition flex items-center justify-center"
                      onClick={() =>
                        handleUpdateLearningPlan(
                          selectedLearningPlan.id,
                          learningPlanText
                        )
                      }
                    >
                      {t.save}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      className="mt-3 ml-auto px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 w-20 transition flex items-center justify-center"
                      onClick={() => {
                        setIsEdit(!isEdit);
                        setLearningPlanText(selectedLearningPlan.learningPlan);
                      }}
                    >
                      {t.edit}
                    </button>
                  </div>
                ))}
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
              <h2 className="text-xl font-bold mb-4">{t.createLearningPlan}</h2>
              <form
                className="flex flex-col gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(form);
                  if (
                    !form.topic ||
                    !form.level ||
                    !form.duration ||
                    !form.learningStyle
                  ) {
                    alert(t.topicEtcRequired);
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
                    {t.topic}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="topic"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
                    placeholder={t.learningPlanTopic}
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
                    {t.level}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="learningLevel"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
                    value={form.level}
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
                    <option value="dasar">{t.beginner}</option>
                    <option value="menengah">{t.intermediate}</option>
                    <option value="tinggi">{t.high}</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="duration"
                  >
                    {t.durationInHour}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="duration"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
                    placeholder={t.durationInHour}
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
                    {t.learningStyle}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="learningStyle"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 bg-primary text-font-primary"
                    value={form.learningStyle}
                    defaultValue={"visual"}
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
                    <option value="visual">{t.visual}</option>
                    <option value="auditory">{t.auditory}</option>
                    <option value="kinesthetic">{t.kinesthetic}</option>
                    <option value="reading-writing">{t.readingWriting}</option>
                    <option value="collaborative">{t.collaborative}</option>
                    <option value="independent">{t.independent}</option>
                    <option value="problem-based">{t.problemBased}</option>
                    <option value="inquiry-based">{t.inquiryBased}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => setShowCreateLearningPlanModal(false)}
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
              <h2 className="text-xl font-bold mb-4">{t.createLearningPlan}</h2>
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
                    {t.learningPlan}
                  </label>
                  <textarea
                    id="description"
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full min-h-80 resize-none dark:bg-gray-800"
                    placeholder={t.assignmentDescription}
                    value={learningPlanText}
                    onChange={(e) => setLearningPlanText(e.target.value)}
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
      </div>
    </div>
  );
};

export default LearningPlansTab;

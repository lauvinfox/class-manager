import { useState } from "react";
import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createClass, getClasses } from "../lib/api";
import { MdGroupAdd } from "react-icons/md";
import { ClassCard } from "../components/ClassCard";
import { FiChevronDown } from "react-icons/fi";
import { useLanguage } from "../contexts/LanguageContext";
import Spinner from "../components/Spinner";

export interface ClassesData {
  classId: string;
  id: {
    name: string;
    description?: string;
    id: string;
  };
}

const HomePage = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();

  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  const { mutate: createNewClass } = useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string;
    }) => {
      return createClass(name, description);
    },
    onSuccess: (data) => {
      // data assumed to be the response from createClass, containing classId
      const classId = data?.data?.classId;
      if (classId) {
        navigate(`/class/${classId}`, { replace: true });
      }
    },
  });

  const toggleShowModal = () => {
    setShowModal((prev) => !prev);
    setName("");
    setDescription("");
  };

  const {
    data: classesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userClasses"],
    queryFn: getClasses,
  });

  const [openClassOwned, setOpenClassOwned] = useState(false);
  const [openClassJoined, setOpenClassJoined] = useState(false);

  return (
    <AuthProvider>
      <div
        className={`${
          darkMode && "dark"
        } min-h-screen bg-primary dark:bg-gray-900 text-font-primary dark:text-slate-200`}
      >
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Header title="Class Manager" fontSize="text-xl" />

            <ClassHeader toggleShowModal={toggleShowModal} />
            <div className="w-full overflow-y-auto max-h-[590px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-gray-500 text-center translate-y-[80px]">
                    <Spinner />
                  </span>
                </div>
              ) : (
                <>
                  <div className="pt-6 pl-6 pr-6">
                    <div
                      className="flex items-center gap-2 hover:cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-md p-2 select-none"
                      onClick={() => {
                        setOpenClassOwned(!openClassOwned);
                      }}
                    >
                      <div className="flex items-center">
                        <FiChevronDown
                          className={`mr-2 transition-transform duration-200 ${
                            openClassOwned
                              ? "rotate-90 md:rotate-180"
                              : "rotate-0"
                          }`}
                          style={{
                            transform: openClassOwned
                              ? "rotate(180deg)"
                              : "rotate(270deg)",
                          }}
                        />
                        <span className="text-lg translate-x-[-1px] translate-y-[4px] font-semibold mb-2 text-font-primary dark:text-white">
                          {language === "id" ? "Kelas Dimiliki" : "Owned Class"}
                        </span>
                      </div>
                    </div>
                    {openClassOwned && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {isLoading && (
                          <div className="flex items-center justify-center h-full w-full">
                            <span className="text-gray-500 text-center translate-y-[80px]">
                              <Spinner />
                            </span>
                          </div>
                        )}
                        {error && (
                          <div className="text-red-500">
                            {language === "id"
                              ? "Gagal memuat kelas."
                              : "Failed to load classes."}
                          </div>
                        )}
                        {classesData?.data &&
                          classesData?.data?.classOwned &&
                          classesData.data.classOwned.length === 0 &&
                          !isLoading && (
                            <div className="col-span-full text-center text-gray-500">
                              {language === "id"
                                ? "Tidak ada kelas ditemukan."
                                : "No classes found."}
                            </div>
                          )}
                        {classesData?.data &&
                          classesData.data.classOwned &&
                          classesData.data.classOwned.map(
                            (cls: ClassesData) => (
                              <ClassCard
                                key={cls.classId}
                                title={cls.id.name}
                                classId={cls.classId}
                                owned={true}
                              />
                            )
                          )}
                      </div>
                    )}
                  </div>
                  <div className="pt-6 pl-6 pr-6">
                    <div
                      className="flex items-center gap-2 hover:cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-md p-2 select-none"
                      onClick={() => setOpenClassJoined(!openClassJoined)}
                    >
                      <div className="flex items-center">
                        <FiChevronDown
                          className={`mr-2 transition-transform duration-200 ${
                            openClassJoined
                              ? "rotate-90 md:rotate-180"
                              : "rotate-0"
                          }`}
                          style={{
                            transform: openClassJoined
                              ? "rotate(180deg)"
                              : "rotate(270deg)",
                          }}
                        />
                        <span className="text-lg translate-x-[-1px] translate-y-[4px] font-semibold mb-2 text-font-primary dark:text-white">
                          {language === "id" ? "Kelas Diikuti" : "Joined Class"}
                        </span>
                      </div>
                    </div>
                    {openClassJoined && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                        {isLoading && (
                          <div>
                            {language === "id" ? "Memuat..." : "Loading..."}
                          </div>
                        )}
                        {error && (
                          <div className="text-red-500">
                            {language === "id"
                              ? "Gagal memuat kelas."
                              : "Failed to load classes."}
                          </div>
                        )}
                        {classesData?.data &&
                          classesData?.data?.classes &&
                          classesData.data.classes.length === 0 &&
                          !isLoading && (
                            <div className="col-span-full text-center text-gray-500">
                              {language === "id"
                                ? "Tidak ada kelas ditemukan."
                                : "No classes found."}
                            </div>
                          )}
                        {classesData?.data &&
                          classesData.data.classes &&
                          classesData.data.classes.map((cls: ClassesData) => (
                            <ClassCard
                              key={cls.classId}
                              title={cls.id.name}
                              classId={cls.classId}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {/* Owned Classes */}
              {/* Joined Classes */}
            </div>
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            darkMode ? "bg-black/70" : "bg-black/40"
          } ${darkMode && "dark"} text-font-primary dark:text-slate-200`}
        >
          <div
            className={`bg-white ${
              darkMode ? "dark:bg-gray-900" : ""
            } rounded-lg shadow-lg p-6 w-full max-w-md relative`}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
              onClick={toggleShowModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-font-primary dark:text-white">
              {language === "id" ? "Buat Kelas" : "Create Class"}
            </h2>

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                createNewClass({ name, description });
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "id" ? "Nama" : "Name"}
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-2 text-font-primary dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "id" ? "Deskripsi" : "Description"}
                </label>
                <textarea
                  className="w-full rounded border border-slate-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-2 pt-3 text-font-primary dark:text-white h-40 text-left align-top leading-none resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={toggleShowModal}
                >
                  {language === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                  disabled={!name}
                >
                  {language === "id" ? "Buat" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthProvider>
  );
};

const ClassHeader = ({ toggleShowModal }: { toggleShowModal: () => void }) => {
  const { language } = useLanguage();
  return (
    <div className="sticky top-0 z-45 bg-white">
      <nav className="relative top-0 z-40 flex items-center justify-between bg-primary border-b border-slate-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-800 min-w-0">
        <span className="text-lg font-semibold text-font-primary dark:text-white select-none"></span>

        <button
          type="button"
          className="flex items-center gap-2 px-4 text-sm dark:text-slate-50 border dark:border-slate-50 font-bold rounded-md h-10 min-w-0 min-h-0 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800 ml-2"
          onClick={toggleShowModal}
        >
          <MdGroupAdd className="text-lg" />
          <span>{language === "id" ? "Buat kelas" : "Create class"}</span>
        </button>
      </nav>
    </div>
  );
};

export default HomePage;

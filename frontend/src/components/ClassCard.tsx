import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfilePic } from "./ProfilePic";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useMutation } from "@tanstack/react-query";
import { deleteClassByClassId } from "../lib/api";

export const ClassCard = ({
  title,
  classId,
  owned,
}: {
  title: string;
  owned?: boolean;
  classId: string;
}) => {
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: deleteClass } = useMutation({
    mutationFn: async () => {
      const res = await deleteClassByClassId(classId);
      return res.data;
    },
  });

  return (
    <div className="relative">
      {/* Overlay untuk menutup dropdown, ditempatkan di luar dropdown agar tidak menutupi button */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
          style={{ top: 0, left: 0 }}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      <div
        onClick={() => navigate(`/class/${classId}`)}
        className="bg-white hover:bg-slate-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-row items-center transition h-40 w-76 justify-center gap-4 cursor-pointer relative"
      >
        {/* ProfilePic di kiri atas */}
        <div className="absolute left-6 top-10">
          <ProfilePic firstName={title} size={80} random={true} />
        </div>
        {/* Title di tengah */}
        <div className="absolute left-30 top-17 text-base font-semibold text-font-primary dark:text-white text-center">
          {title}
        </div>
        {/* More (titik tiga) button di kanan atas */}
        {owned && (
          <div className="absolute right-10 top-17">
            <button
              type="button"
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown((prev) => !prev);
              }}
            >
              <BsThreeDotsVertical />
            </button>
            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl"
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowDropdown(false);
                  }}
                >
                  Delete Class
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Delete Class Modal */}
      {showDeleteModal && (
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
                          Delete Class
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete this class? This
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
                        deleteClass();
                        setShowDeleteModal(false);
                        // opsional: redirect atau refresh
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
  );
};

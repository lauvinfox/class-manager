import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfilePic } from "./ProfilePic";
import { BsThreeDotsVertical } from "react-icons/bs";

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

  return (
    <div className="relative">
      <div
        onClick={() => navigate(`/class/${classId}`)}
        className="bg-white hover:bg-slate-100 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-row items-center transition h-40 w-76 justify-center gap-4 cursor-pointer"
      >
        <ProfilePic firstName={title} size={80} random={true} />
        <div className="text-base font-semibold text-font-primary dark:text-white text-center">
          {title}
        </div>
        {/* More (titik tiga) button */}
        {owned && (
          <div className="ml-2 relative">
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
                    setShowDropdown(false);
                    // panggil fungsi delete class di sini
                  }}
                >
                  Delete Class
                </button>
                {/* Overlay untuk menutup dropdown saat klik di luar */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                  style={{ top: 0, left: 0 }}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

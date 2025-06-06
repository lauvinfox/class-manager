import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import {
  FiChevronDown,
  FiHome,
  FiUsers,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";

import { MdOutlineNotifications } from "react-icons/md";

import { getUserInfo, signOut } from "../lib/api";

const TitleSection = React.memo(() => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { mutate: signOutMutate } = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      navigate("/signin", { replace: true });
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  useEffect(() => {
    let isMounted = true;
    getUserInfo()
      .then((res) => {
        if (isMounted) {
          if (res?.data?.username && res?.data?.email) {
            setUser({
              username: res.data.username,
              email: res.data.email,
              firstName: res.data.firstName,
              lastName: res.data.lastName,
            });
          }
        }
      })
      .catch(() => {
        // error handling removed
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize username/email block so it only re-renders if username/email changes
  const userInfoBlock = useMemo(
    () => (
      <div>
        <span className="block text-xs font-semibold dark:text-slate-50">
          {user?.username}
        </span>
        <span className="block text-xs text-slate-500 dark:text-slate-50">
          {user?.email}
        </span>
      </div>
    ),
    [user?.username, user?.email]
  );

  return (
    <div className="mb-3 pb-3" ref={dropdownRef}>
      <div className="relative flex items-center justify-between rounded-md transition-colors">
        <div className="flex items-center gap-2">
          <ProfilePic firstName={user?.firstName} lastName={user?.lastName} />
          {userInfoBlock}
        </div>

        <button
          type="button"
          className="mr-2 p-1 rounded focus:outline-none"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-label="Open user menu"
        >
          <FiChevronDown
            className={`transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            } dark:text-slate-50  dark:hover:text-slate-200`}
          />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full z-20 mt-2 w-40 rounded-md border border-slate-200 bg-white dark:bg-gray-900 dark:text-slate-50  shadow-lg py-1"
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-gray-800"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-gray-800"
              onClick={() => setShowSignOutModal(true)}
            >
              Logout
            </button>
          </motion.div>
        )}
      </div>
      {/* Sign Out Modal */}
      {showSignOutModal && (
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

          <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
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
                        Sign out
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to sign out? You will need to
                          log in again to access your account.
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
                      setShowSignOutModal(false);
                      setDropdownOpen(false);
                      signOutMutate();
                    }}
                  >
                    Sign out
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setShowSignOutModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <hr className="w-[225px] translate-x-[-8px] translate-y-3 text-slate-300 dark:text-gray-800" />
    </div>
  );
});

export const Sidebar = () => {
  const [selected, setSelected] = useState(() => {
    // Set default tab sesuai path
    if (window.location.pathname.startsWith("/settings")) return "Settings";
    if (window.location.pathname.startsWith("/notifications"))
      return "Notification";
    if (window.location.pathname.startsWith("/classes")) return "Classes";
    if (window.location.pathname.startsWith("/help")) return "Help";
    return "Dashboard";
  });

  return (
    <nav
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-primary p-2 dark:bg-gray-900 dark:border-gray-700"
      style={{ width: "225px" }}
    >
      <TitleSection />
      <div className="space-y-1">
        <Option
          Icon={FiHome}
          href="/"
          title="Home"
          selected={selected}
          setSelected={setSelected}
        />
        <Option
          Icon={MdOutlineNotifications}
          href="/notifications"
          title="Notification"
          selected={selected}
          setSelected={setSelected}
          notifs={true}
        />
        <Option
          Icon={FiUsers}
          href="/classes"
          title="Classes"
          selected={selected}
          setSelected={setSelected}
        />
        <Option
          Icon={FiSettings}
          href="/settings"
          title="Settings"
          selected={selected}
          setSelected={setSelected}
        />
        <Option
          Icon={FiHelpCircle}
          href="/help"
          title="Help"
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </nav>
  );
};

interface OptionProps {
  Icon: React.ElementType;
  href: string;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  notifs?: boolean;
}
const Option = ({
  Icon,
  href,
  title,
  selected,
  setSelected,
  notifs,
}: OptionProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    setSelected(title);
    if (href) {
      navigate(href);
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        selected === title
          ? "bg-indigo-100 text-indigo-800 dark:bg-gray-800 dark:text-white"
          : "text-slate-500 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-gray-800"
      }`}
    >
      <div className="grid h-full w-10 place-content-center text-lg">
        <Icon />
      </div>
      <span className="text-xs font-medium">{title}</span>

      {notifs && (
        <span className="absolute right-2 w-2 h-2 rounded bg-indigo-500"></span>
      )}
    </button>
  );
};

interface ProfilePicProps {
  firstName?: string;
  lastName?: string;
}

const ProfilePic = React.memo(({ firstName, lastName }: ProfilePicProps) => {
  // Memoize the avatar URL so it doesn't change on every render
  const avatarUrl = useMemo(() => {
    return `https://ui-avatars.com/api/?name=${firstName || ""}+${
      lastName || ""
    }&background=4D46D3&color=fff&`;
  }, [firstName, lastName]);
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600">
      <img src={avatarUrl} alt="" className="w-10 h-10 rounded-md" />
    </div>
  );
});

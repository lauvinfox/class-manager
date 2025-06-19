import { useEffect, useState, useMemo, useRef, memo, ElementType } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  FiChevronDown,
  FiHome,
  FiUsers,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";

import { MdOutlineNotifications } from "react-icons/md";

import {
  getUserInfo,
  getUserNotifications,
  markAllNotificationsAsRead,
  signOut,
} from "../lib/api";
import { ProfilePic } from "./ProfilePic";
import io from "socket.io-client";

// Ambil token dari localStorage
const token = localStorage.getItem("accessToken");
const socket = io("http://localhost:3000", {
  auth: { token },
});

export const Sidebar = () => {
  const [selected, setSelected] = useState(() => {
    // Set default tab sesuai path
    if (window.location.pathname.startsWith("/settings")) return "Settings";
    if (window.location.pathname.startsWith("/notifications"))
      return "Notification";
    if (window.location.pathname.startsWith("/classes")) return "Classes";
    if (window.location.pathname.startsWith("/help")) return "Help";
    return "Home";
  });

  const [hasUnread, setHasUnread] = useState(false);

  // Query user info
  const { data: user } = useQuery({
    queryKey: ["userInfo"],
    queryFn: getUserInfo,
    select: (res) => res?.data,
  });

  // Query notifikasi user
  const { data: notifs = [], refetch: refetchNotifs } = useQuery({
    queryKey: ["userNotifications", user?.id],
    queryFn: () =>
      user?.id ? getUserNotifications().then((res) => res.data) : [],
    enabled: !!user?.id,
  });

  // Integrasi socket.io untuk real-time notification
  useEffect(() => {
    if (!user?.id) return;

    // Fetch notifikasi awal (jika ingin, bisa pakai refetchNotifs())
    refetchNotifs();

    // Join ke room userId (opsional, jika backend pakai room)
    socket.emit("register", user.id);

    // Listen event notification
    socket.on("notification", () => {
      // Bisa refetch dari server, atau update state notifs secara manual
      refetchNotifs();
      setHasUnread(true); // Tanda unread muncul saat ada notifikasi baru
      // Atau jika ingin langsung push ke notifs:
      // setNotifs((prev) => [notification, ...prev]);
    });

    // Cleanup listener saat unmount
    return () => {
      socket.off("notification");
    };
  }, [user?.id, refetchNotifs]);

  useEffect(() => {
    if (
      Array.isArray(notifs) &&
      notifs.some((n: { isRead: boolean }) => n.isRead === false)
    ) {
      setHasUnread(true);
    }
  }, [notifs]);

  const handleOptionClick = async (title: string) => {
    setSelected(title);
    if (title === "Notification") {
      setHasUnread(false);
      await markAllNotificationsAsRead();
      refetchNotifs();
    }
  };

  return (
    <nav
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-primary p-2 dark:bg-gray-900 dark:border-gray-700"
      style={{ width: "225px" }}
    >
      <TitleSection user={user} />
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
          setSelected={handleOptionClick}
          notifs={hasUnread}
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

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

const TitleSection = memo(({ user }: { user: User | undefined }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: signOutMutate } = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      navigate("/signin", { replace: true });
    },
  });

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
              onClick={() => navigate(`/profile/${user?.username}`)}
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
      {showSignOutModal &&
        createPortal(
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
          </div>,
          document.body
        )}
      <hr className="w-[225px] translate-x-[-8px] translate-y-3 text-slate-300 dark:text-gray-800" />
    </div>
  );
});

interface OptionProps {
  Icon: ElementType;
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

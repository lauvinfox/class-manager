import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserNotifications, respondInviteInstructor } from "../lib/api";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { wordTranslations } from "../constants";
import Spinner from "../components/Spinner";

interface Notification {
  _id: string;
  userId: string;
  message: string;
  classId?: string;
  isRead: boolean;
  type: "invite" | "reminder" | "info" | "other";
  createdAt: string;
  updatedAt: string;
  status: "accepted" | "denied" | "pending";
  classOwner?: string;
}

const Notifications = () => {
  const { darkMode } = useTheme();
  const { language } = useLanguage();

  const t = wordTranslations(language);

  // Ambil notifikasi user
  const {
    data: notifs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userNotifications"],
    queryFn: () => getUserNotifications().then((res) => res.data),
  });

  const queryClient = useQueryClient();
  const { mutate: respondInvite } = useMutation({
    mutationFn: ({
      notificationId,
      inviteResponse,
    }: {
      notificationId: string;
      inviteResponse: string;
    }) => {
      return respondInviteInstructor({ notificationId, inviteResponse });
    },
    onSuccess: () => {
      // Refresh notifikasi setelah menerima atau menolak undangan
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
    },
  });

  const handleAcceptInvite = (notif: Notification) => {
    const notificationId = notif._id;
    respondInvite({ notificationId, inviteResponse: "accepted" });
  };

  const handleDenyInvite = (notif: Notification) => {
    const notificationId = notif._id;
    respondInvite({ notificationId, inviteResponse: "denied" });
  };

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
            <nav className="sticky top-0 z-40 flex items-center justify-between bg-primary border-b border-slate-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-800 min-w-0">
              <span className="flex text-lg font-semibold text-font-primary dark:text-white select-none gap-1">
                {t.notifications}
              </span>
            </nav>
            <div className="flex flex-col h-[608px] w-full items-center justify-center">
              {isLoading && (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-gray-500 text-center translate-y-[80px]">
                    <Spinner />
                  </span>
                </div>
              )}
              {error && (
                <p className="text-red-500">{t.failedToLoadNotifications}</p>
              )}
              <ul className="w-full h-full space-y-1 overflow-auto">
                {notifs.length === 0 && !isLoading && (
                  <div className="flex items-center justify-center h-full w-full">
                    <span className="text-gray-500 text-center translate-y-[-70px]">
                      {t.noNotifications}
                    </span>
                  </div>
                )}
                {notifs.map((notif: Notification) => (
                  <li
                    key={notif._id}
                    className={`group w-full flex items-center justify-between p-4 rounded shadow transition-colors duration-150 ${
                      notif.isRead
                        ? "bg-primary dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        : "bg-primary dark:bg-indigo-900 font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate">
                        {notif.message} {`${t.by} ${notif.classOwner}`}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {notif.type} •{" "}
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {notif.type === "invite" && (
                      <div className="flex ml-4">
                        {notif.status === "accepted" ? (
                          <span className="text-font-primary font-semibold dark:text-form-bg">
                            {t.inviteAccepted}
                          </span>
                        ) : notif.status === "denied" ? (
                          <span className="text-font-primary-800 font-semibold dark:text-form-bg">
                            {t.inviteDenied}
                          </span>
                        ) : (
                          <>
                            <button
                              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-font-primary transition-colors group-hover:bg-gray-200 dark:group-hover:bg-indigo-800 group-hover:text-indigo-900 dark:group-hover:text-indigo-200 cursor-pointer hover:bg-gray-400 dark:hover:bg-indigo-700"
                              onClick={() => {
                                handleAcceptInvite(notif);
                              }}
                            >
                              <FaRegCheckCircle />
                            </button>
                            <button
                              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-font-primary transition-colors group-hover:bg-gray-200 dark:group-hover:bg-indigo-800 group-hover:text-indigo-900 dark:group-hover:text-indigo-200 cursor-pointer hover:bg-gray-400 dark:hover:bg-indigo-700"
                              onClick={() => {
                                handleDenyInvite(notif);
                              }}
                            >
                              <FaRegTimesCircle />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Notifications;

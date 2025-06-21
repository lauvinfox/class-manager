import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserNotifications, respondInviteInstructor } from "../lib/api";

interface Notification {
  _id: string;
  userId: string;
  message: string;
  classId?: string;
  isRead: boolean;
  type: "invite" | "reminder" | "info" | "other";
  createdAt: string;
  updatedAt: string;
}

const Notifications = () => {
  const { darkMode } = useTheme();

  // Ambil notifikasi user
  const {
    data: notifs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userNotifications"],
    queryFn: () => getUserNotifications().then((res) => res.data),
  });

  const { mutate: respondInvite } = useMutation({
    mutationFn: ({
      classId,
      inviteResponse,
    }: {
      classId: string;
      inviteResponse: string;
    }) => {
      return respondInviteInstructor({ classId, inviteResponse });
    },
  });

  const handleAcceptInvite = (notif: Notification) => {
    // Panggil API untuk menerima undangan
    const classId = notif.classId as string;
    respondInvite({ classId, inviteResponse: "accepted" });
  };

  const handleDenyInvite = (notif: Notification) => {
    const classId = notif.classId as string;
    respondInvite({ classId, inviteResponse: "denied" });
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
            <NotificationsHeader />
            <div className="flex flex-col h-[76.5%] items-center justify-center">
              {isLoading && <p>Loading...</p>}
              {error && (
                <p className="text-red-500">Failed to load notifications.</p>
              )}
              <ul className="w-full max-w-lg space-y-2">
                {notifs.length === 0 && !isLoading && (
                  <li className="text-gray-500 text-center">
                    No notifications.
                  </li>
                )}
                {notifs.map((notif: Notification) => (
                  <li
                    key={notif._id}
                    className={`p-4 rounded shadow ${
                      notif.isRead
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "bg-indigo-100 dark:bg-indigo-900 font-semibold"
                    }`}
                  >
                    <div>{notif.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {notif.type} •{" "}
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                    {notif.type === "invite" && (
                      <div className="mt-2 flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          onClick={() => handleAcceptInvite(notif)}
                        >
                          Accept
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => handleDenyInvite(notif)}
                        >
                          Deny
                        </button>
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

const NotificationsHeader = () => {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between bg-primary border-b border-slate-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-800 min-w-0">
      <span className="flex text-lg font-semibold text-font-primary dark:text-white select-none gap-1">
        Notifications
      </span>
    </nav>
  );
};

export default Notifications;

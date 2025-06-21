import Header from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { AuthProvider } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  inviteResponse?: "accepted" | "denied" | "pending";
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

  const queryClient = useQueryClient();
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
    onSuccess: () => {
      // Refresh notifikasi setelah menerima atau menolak undangan
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
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
            <div className="flex flex-col h-[76%] w-full items-center justify-center">
              {isLoading && <p>Loading...</p>}
              {error && (
                <p className="text-red-500">Failed to load notifications.</p>
              )}
              <ul className="w-full h-full space-y-1 overflow-auto">
                {notifs.length === 0 && !isLoading && (
                  <li className="text-gray-500 text-center">
                    No notifications.
                  </li>
                )}
                {notifs.map((notif: Notification) => (
                  <li
                    key={notif._id}
                    className={`w-full flex items-center justify-between p-4 rounded shadow transition-colors duration-150 cursor-pointer ${
                      notif.isRead
                        ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        : "bg-indigo-100 dark:bg-indigo-900 font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate">{notif.message}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {notif.type} •{" "}
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {notif.type === "invite" && (
                      <div className="flex gap-2 ml-4">
                        {notif.inviteResponse === "accepted" ? (
                          <span className="text-green-600 font-semibold">
                            Invite Accepted
                          </span>
                        ) : notif.inviteResponse === "denied" ? (
                          <span className="text-red-600 font-semibold">
                            Invite Denied
                          </span>
                        ) : (
                          <>
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              onClick={() => {
                                handleAcceptInvite(notif);
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              onClick={() => {
                                handleDenyInvite(notif);
                              }}
                            >
                              Deny
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

import React, { useEffect, useState } from "react";
import {
  FiBarChart,
  FiChevronDown,
  FiChevronsRight,
  FiHome,
  FiMonitor,
  FiShoppingCart,
  FiUsers,
  FiSettings,
} from "react-icons/fi";

import { MdOutlineNotifications } from "react-icons/md";

import { motion } from "framer-motion";
import { getUserInfo, signOut } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

export const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      <TitleSection open={open} />

      <div className="space-y-1">
        <Option
          Icon={FiHome}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={MdOutlineNotifications}
          title="Notification"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={3}
        />
        <Option
          Icon={FiMonitor}
          title="View Site"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiShoppingCart}
          title="Products"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiSettings}
          title="Settings"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiBarChart}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={FiUsers}
          title="Members"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

interface OptionProps {
  Icon: React.ElementType;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number; // Optional prop for notifications}
}
const Option = ({
  Icon,
  title,
  selected,
  setSelected,
  open,
  notifs,
}: OptionProps) => {
  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        selected === title
          ? "bg-indigo-100 text-indigo-800"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
        >
          {title}
        </motion.span>
      )}

      {/* Notif badge logic: tampilkan badge jika notifs ada dan open true, jika tidak dan notifs ada, tampilkan dot kecil */}
      {notifs ? (
        open ? (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ y: "-50%" }}
            transition={{ delay: 0.5 }}
            className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
          >
            {notifs}
          </motion.span>
        ) : (
          <motion.span className="absolute right-2 w-2 h-2 top-2 rounded bg-indigo-500"></motion.span>
        )
      ) : null}
    </motion.button>
  );
};

const TitleSection = ({ open }: { open: boolean }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    username: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    setLoading(true);
    getUserInfo()
      .then((res) => {
        if (isMounted) {
          if (res?.data?.username && res?.data?.email) {
            setUser({
              username: res.data.username,
              email: res.data.email,
              name: res.data.name,
              firstName: res.data.firstName, // F besar
              lastName: res.data.lastName, // L besar
            });
            setError(null);
          } else {
            setError("User info not found");
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load user info");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mb-3 border-b border-slate-300 pb-3" ref={dropdownRef}>
      <div className="relative flex items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <ProfilePic firstName={user?.firstName} lastName={user?.lastName} />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold">
                {loading ? "Loading..." : error ? error : user?.username}
              </span>
              <span className="block text-xs text-slate-500">
                {loading || error ? "" : user?.email}
              </span>
            </motion.div>
          )}
        </div>
        {open && (
          <button
            type="button"
            className="mr-2 p-1 rounded hover:bg-slate-200 focus:outline-none"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Open user menu"
          >
            <FiChevronDown
              className={`transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
        {/* Dropdown menu */}
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full z-20 mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg py-1"
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
              onClick={() => signOutMutate()}
            >
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface ProfilePicProps {
  firstName?: string;
  lastName?: string;
}

const ProfilePic = ({ firstName, lastName }: ProfilePicProps) => {
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md bg-indigo-600"
    >
      <img
        src={`https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=4D46D3&color=fff&`}
        alt=""
        className="w-10 h-10 rounded-md"
      />
    </motion.div>
  );
};

interface ToggleCloseProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToggleClose = ({ open, setOpen }: ToggleCloseProps) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg"
        >
          <FiChevronsRight
            className={`transition-transform ${open && "rotate-180"}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

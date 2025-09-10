// src/contexts/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMe } from "../lib/api";
import { useNavigate } from "react-router-dom";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: {
    userId: string;
    username: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((res) => setUser(res?.data))
      .catch(() => navigate("/signin", { replace: true }));
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export default {
  AuthProvider,
  useAuth,
};

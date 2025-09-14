import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Create axios instance for auth endpoints
const authAxios = axios.create({
  baseURL: "https://castaway.zachlearns.com/backend/api/v1/",
  timeout: 10000,
  withCredentials: true,
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const clearCookies = () => {
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const logout = async () => {
    try {
      await authAxios.post("/auth/sign-out");
      clearCookies();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the API call fails, clear local state and cookies
      clearCookies();
      setUser(null);
    }
  };

  const checkAuth = () => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const userId = getCookie("user_id") || getCookie("userID");
    const jwt = getCookie("jwt");

    if (userId && jwt) {
      // You might want to validate the JWT with the backend here
      setUser({ id: userId });
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout, checkAuth }}>
      {children}
    </UserContext.Provider>
  );
};
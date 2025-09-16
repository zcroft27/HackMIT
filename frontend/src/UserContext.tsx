import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

// Simple cookie-based authentication without backend validation
// This provides faster initial load but relies on cookie integrity

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
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Create axios instance for auth endpoints
const authAxios = axios.create({
  baseURL: "http://localhost:8080/api/v1/",
  timeout: 10000,
  withCredentials: true,
});

// Helper function to get cookie value
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

// Helper function to parse all relevant cookies
const parseCookies = () => {
  return {
    userId: getCookie("user_id") || getCookie("userID"),
    jwt: getCookie("jwt"),
    email: getCookie("user_email"),
    firstName: getCookie("user_firstName"),
    lastName: getCookie("user_lastName"),
  };
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user state from cookies synchronously
  const [user, setUser] = useState<User | null>(() => {
    const cookies = parseCookies();
    if (cookies.userId && cookies.jwt) {
      // Return initial user data from cookies
      return {
        id: cookies.userId,
        email: cookies.email,
        firstName: cookies.firstName,
        lastName: cookies.lastName,
      };
    }
    return null;
  });

  const clearCookies = () => {
    // Clear all auth-related cookies
    const cookiesToClear = ["jwt", "user_id", "userID", "user_email", "user_firstName", "user_lastName"];
    cookiesToClear.forEach(cookieName => {
      // Clear with different path and domain combinations to ensure removal
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    });
  };

  const logout = async () => {
    try {
      await authAxios.post("/auth/sign-out");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear cookies and user state
      clearCookies();
      setUser(null);
    }
  };

  const checkAuth = () => {
    const cookies = parseCookies();
    
    if (cookies.userId && cookies.jwt) {
      // Use cookie data directly
      setUser({
        id: cookies.userId,
        email: cookies.email,
        firstName: cookies.firstName,
        lastName: cookies.lastName,
      });
    } else {
      // No auth cookies found
      setUser(null);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    // Re-check cookies in case they were set after initial render
    checkAuth();
  }, []);

  // Optional: Set up an interval to periodically check auth status
  // This can help detect when cookies expire or are modified
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuth();
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        logout, 
        checkAuth,
        isAuthenticated
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
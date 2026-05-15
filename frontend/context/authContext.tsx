"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  UserData,
  apiLogin,
  apiSignup,
  apiFetchProfile,
  getToken,
  setToken,
  clearToken,
} from "@/lib/api";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<UserData>;
  signup: (name: string, email: string, password: string) => Promise<UserData>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUserLocal: (updates: Partial<UserData>) => void;
}

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!token;

  /* ===== HYDRATE ON MOUNT ===== */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setTokenState(storedToken);

      try {
        const { user: profileData } = await apiFetchProfile();
        setUser(profileData);
      } catch (err) {
        // Token invalid/expired — clear it
        console.error("Failed to hydrate auth:", err);
        clearToken();
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ===== LOGIN ===== */
  const login = useCallback(async (email: string, password: string): Promise<UserData> => {
    const data = await apiLogin(email, password);

    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);

    return data.user;
  }, []);

  /* ===== SIGNUP ===== */
  // Creates the account in MongoDB but does NOT authenticate the session.
  // The user must explicitly log in after signup to get their JWT token.
  // This enforces the flow: Signup → Onboarding → Login → Dashboard.
  const signup = useCallback(async (name: string, email: string, password: string): Promise<UserData> => {
    const data = await apiSignup(name, email, password);
    // Account is created. Do NOT store token or set user state here.
    // The user will authenticate via the login page after onboarding.
    return data.user;
  }, []);

  /* ===== LOGOUT ===== */
  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  /* ===== REFRESH PROFILE ===== */
  const refreshProfile = useCallback(async () => {
    try {
      const { user: profileData } = await apiFetchProfile();
      setUser(profileData);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, []);

  /* ===== LOCAL UPDATE (optimistic) ===== */
  const updateUserLocal = useCallback((updates: Partial<UserData>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  /* ===== PROVIDE ===== */
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        refreshProfile,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

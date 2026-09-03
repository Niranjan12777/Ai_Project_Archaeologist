"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthPayload, AuthUser } from "@/types/api";
import { authService } from "@/services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; name?: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser) as AuthUser);
    }
  }, []);

  const persistSession = (payload: AuthPayload) => {
    window.localStorage.setItem("accessToken", payload.accessToken);
    window.localStorage.setItem("refreshToken", payload.refreshToken);
    window.localStorage.setItem("user", JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (input) => persistSession(await authService.login(input)),
      register: async (input) => persistSession(await authService.register(input)),
      logout: () => {
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("refreshToken");
        window.localStorage.removeItem("user");
        setUser(null);
      }
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

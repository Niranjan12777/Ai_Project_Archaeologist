"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({
  children
}: ProtectedRouteProps) {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken = window.localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace("/auth/login");
      return;
    }

    setAuthenticated(true);
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-lg text-muted">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
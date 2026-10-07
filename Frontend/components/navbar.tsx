"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavbarProps {
  sidebarOpen: boolean;
}

export function Navbar({ sidebarOpen }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("user");

    router.replace("/auth/login");
  };

  const getUser = () => {
    if (typeof window === "undefined") return null;

    const storedUser = window.localStorage.getItem("user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser) as {
        name?: string;
        email?: string;
      };
    } catch {
      return null;
    }
  };

  const user = getUser();

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`
        fixed
        right-0
        top-0
        z-30
        h-16

        border-b
        border-line
        bg-surface/95
        backdrop-blur-md

        transition-[left]
        duration-200
        ease-in-out

        left-[72px]

        ${sidebarOpen
          ? "min-[951px]:left-72"
          : "min-[951px]:left-[72px]"
        }
        }
      `}
    >
      <div className="flex h-full items-center justify-between px-5 sm:px-8">

        <div className="min-w-0">
          <div
            className={`
              truncate
              text-base
              font-semibold
              text-ink

              transition-all
              duration-200

              ${sidebarOpen
                ? "opacity-0"
                : "opacity-100"
              }
            `}
          >
            AI Project Archaeologist
          </div>
        </div>

        <div className="flex items-center gap-3">

          <Link
            href="/profile"
            className="
              group
              flex
              items-center
              gap-2.5
              rounded-lg
              px-2
              py-1.5

              transition-colors
              hover:bg-panel

              focus:outline-none
              focus:ring-2
              focus:ring-accent/40
            "
          >

            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full

                bg-accent
                text-sm
                font-semibold
                text-white

                shadow-sm
              "
            >
              {initial}
            </span>

            <div className="hidden text-left sm:block">
              <div className="max-w-32 truncate text-sm font-medium text-ink">
                {displayName}
              </div>

              {user?.email && (
                <div className="max-w-40 truncate text-xs text-muted">
                  {user.email}
                </div>
              )}
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              h-9
              items-center
              gap-2
              rounded-md
              border
              border-line
              px-3

              text-sm
              font-medium
              text-muted

              transition-colors

              hover:border-red-500/30
              hover:bg-red-500/10
              hover:text-red-400

              focus:outline-none
              focus:ring-2
              focus:ring-red-500/30
            "
          >
            <LogOut size={16} />

            <span className="hidden sm:inline">
              Logout
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}
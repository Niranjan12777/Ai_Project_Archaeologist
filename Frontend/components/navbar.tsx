"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Settings,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  sidebarOpen: boolean;
}

interface StoredUser {
  name?: string;
  email?: string;
}

export function Navbar({ sidebarOpen }: NavbarProps) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);

  /* LOAD USER */

  useEffect(() => {
    const storedUser = window.localStorage.getItem("user");

    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

  /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* CLOSE DROPDOWN WITH ESCAPE */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* LOGOUT */

  const handleLogout = () => {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("user");

    setProfileOpen(false);

    router.replace("/auth/login");
  };

  /* USER DISPLAY */

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
        left-[72px]
        transition-[left]
        duration-200
        ease-in-out
        min-[951px]:${sidebarOpen ? "left-72" : "left-[72px]"
        }
      `}
    >
      <div className="flex h-full items-center justify-between px-5 sm:px-8">

        {/* PROJECT NAME */}

        <div className="min-w-0">
          <div
            className={`
              truncate
              text-base
              font-semibold
              text-ink
              transition-opacity
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

        {/* RIGHT SIDE */}

        <div className="flex items-center">

          {/* Profile */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((current) => !current)
              }
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
              "
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {/* Avatar */}

              <div
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
                "
              >
                {initial}
              </div>

              {/* User information */}

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

              {/* Chevron */}

              <ChevronDown
                size={16}
                className={`
                  hidden
                  text-muted
                  transition-transform
                  sm:block
                  ${profileOpen
                    ? "rotate-180"
                    : ""
                  }
                `}
              />
            </button>

            {/* Profile Dropdown */}

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  z-[100]
                  mt-2
                  w-54
                  overflow-hidden
                  rounded-lg
                  border
                  border-line
                  bg-panel
                  shadow-xl
                "
                role="menu"
              >
                {/* User header */}

                <div className="border-b border-line px-4 py-3">
                  <div className="truncate text-sm font-medium text-ink">
                    {displayName}
                  </div>

                  {user?.email && (
                    <div className="mt-0.5 truncate text-xs text-muted">
                      {user.email}
                    </div>
                  )}
                </div>

                {/* Menu items */}

                <div className="p-1.5">

                  {/* Profile */}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/profile");
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-md
                      px-3
                      py-2.5
                      text-sm
                      text-muted
                      transition-colors
                      hover:bg-surface
                      hover:text-ink
                    "
                    role="menuitem"
                  >
                    <User size={17} />

                    <span>
                      Profile
                    </span>
                  </button>

                  {/* Settings */}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/settings");
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-md
                      px-3
                      py-2.5
                      text-sm
                      text-muted
                      transition-colors
                      hover:bg-surface
                      hover:text-ink
                    "
                    role="menuitem"
                  >
                    <Settings size={17} />

                    <span>
                      Settings
                    </span>
                  </button>

                  {/* Divider */}

                  <div className="my-1.5 border-t border-line" />

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-md
                      px-3
                      py-2.5
                      text-sm
                      text-red-400
                      transition-colors
                      hover:bg-red-500/10
                      hover:text-red-300
                    "
                    role="menuitem"
                  >
                    <LogOut size={17} />

                    <span>
                      Logout
                    </span>
                  </button>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
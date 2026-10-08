"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Clock3,
  FileText,
  GitBranch,
  LayoutDashboard,
  Menu,
  Network,
  Search,
  Settings,
  X
} from "lucide-react";

import styles from "@/styles/interactive.module.css";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { Navbar } from "./navbar";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/repositories",
    label: "Repositories",
    icon: GitBranch
  },
  {
    href: "/search",
    label: "Search",
    icon: Search
  },
  {
    href: "/chat",
    label: "AI Chat",
    icon: Bot
  },
  {
    href: "/commits",
    label: "Commit History",
    icon: Clock3
  },
  {
    href: "/architecture",
    label: "Architecture",
    icon: Network
  },
  {
    href: "/documentation",
    label: "Documentation",
    icon: FileText
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings
  }
] as const;

export function AppShell({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface text-ink">
        <aside
          className={`
          fixed inset-y-0 left-0
          z-50
          border-r border-line
          bg-surface
          px-3 py-3

          transition-[width,transform]
          duration-200
          ease-in-out

          ${sidebarOpen ? "w-72" : "w-[72px]"}
        `}
        >

          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"}`}>
            {sidebarOpen ? (
              <Link href="/dashboard" className="min-w-0">
                <div className="truncate text-lg font-semibold">
                  AI Project Archaeologist
                </div>

                <div className="mt-1 text-sm text-muted">
                  Repository intelligence
                </div>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-md
                bg-accent
                text-sm
                font-bold
                text-white
              "
                aria-label="AI Project Archaeologist"
                title="AI Project Archaeologist"
              >
                A
              </Link>
            )}
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`
                  ${styles.navLink}

                  group
                  relative
                  flex
                  items-center
                  rounded-md
                  py-2.5
                  text-sm
                  font-medium
                  text-neutral-700
                  transition-colors

                  ${sidebarOpen
                      ? "gap-3 px-3"
                      : "justify-center px-0"
                    }
                `}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  {sidebarOpen && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}

                  {!sidebarOpen && (
                    <span
                      className="
                      pointer-events-none
                      absolute
                      left-full
                      z-[60]
                      ml-3
                      whitespace-nowrap
                      rounded-md
                      bg-neutral-900
                      px-2.5
                      py-1.5
                      text-xs
                      text-white
                      opacity-0
                      shadow-lg
                      transition-opacity
                      group-hover:opacity-100
                    "
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => { setSidebarOpen((current) => !current); }}
            className="
            absolute
            -right-0
            top-4
            z-[70]

            flex
            h-7
            w-7
            translate-x-1/2
            items-center
            justify-center

            rounded-full
            border
            border-line
            bg-white

            text-neutral-600
            shadow-sm

            transition-colors
            hover:bg-neutral-100

            focus:outline-none
            focus:ring-2
            focus:ring-accent
            focus:ring-offset-1
          "
            aria-label={
              sidebarOpen
                ? "Collapse sidebar"
                : "Expand sidebar"
            }
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <X size={15} />
            ) : (
              <Menu size={15} />
            )}
          </button>
        </aside>

        <Navbar sidebarOpen={sidebarOpen} />

        <main
          className={`
          min-h-screen
          pl-[72px]
          pt-16

          ${sidebarOpen
              ? "min-[951px]:pl-72"
              : "min-[951px]:pl-[72px]"
            }

          transition-[padding-left]
          duration-200
          ease-in-out
        `}
        >
          <div className="mx-auto min-h-screen max-w-7xl px-5 py-6 sm:px-8">
            {children}
          </div>
        </main>

        {sidebarOpen && (
          <button type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}
            className="
            fixed
            inset-0
            z-40

            bg-black/20

            min-[951px]:hidden
          "
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
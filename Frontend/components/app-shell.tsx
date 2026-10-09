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
  Search
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

        {/* SIDEBAR */}

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

          {/* Menu Header */}

          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"}`}>
            <button
              type="button"
              onClick={() => { setSidebarOpen((current) => !current); }}
              className={`
                  ${styles.navLink}
                  ${sidebarOpen ? "w-10" : "w-12"}
                  flex
                  h-10
                  items-center
                  justify-center
                  rounded-md
                  text-sm
                  font-bold
                  text-white
              `}
              aria-label={
                sidebarOpen
                  ? "Collapse sidebar"
                  : "Expand sidebar"
              }
              aria-expanded={sidebarOpen}
            >

              <Menu size={18} />

            </button>

            {sidebarOpen && (
              <Link href="/dashboard" className="min-w-0">
                <div className="truncate text-lg font-semibold">
                  AI Project Archaeologist
                </div>

                <div className="mt-1 text-sm text-muted">
                  Repository intelligence
                </div>
              </Link>
            )}
          </div>

          {/* Sidebar Items */}

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
                </Link>
              );
            })}
          </nav>

        </aside>

        {/* NAVBAR */}

        <Navbar sidebarOpen={sidebarOpen} />

        {/* MAIN CONTENT */}

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

      </div>
    </ProtectedRoute>
  );
}
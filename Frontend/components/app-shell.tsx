"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Clock3, FileText, GitBranch, LayoutDashboard, Network, Search, Settings } from "lucide-react";
import styles from "@/styles/interactive.module.css";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: GitBranch },
  { href: "/search", label: "Search", icon: Search },
  { href: "/chat", label: "AI Chat", icon: Bot },
  { href: "/commits", label: "Commit History", icon: Clock3 },
  { href: "/architecture", label: "Architecture", icon: Network },
  { href: "/documentation", label: "Documentation", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-surface px-5 py-6 lg:block">
        <Link href="/dashboard" className="block">
          <div className="text-lg font-semibold">AI Project Archaeologist</div>
          <div className="mt-1 text-sm text-muted">Repository intelligence</div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <div className="mx-auto min-h-screen max-w-7xl px-5 py-6 sm:px-8">{children}</div>
      </main>
    </div>
  );
}

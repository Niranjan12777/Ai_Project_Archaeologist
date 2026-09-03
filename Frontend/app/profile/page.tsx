"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <PageHeader title="Profile" description="Review account information, role, linked GitHub identity, and audit activity." />
      <section className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">Account</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-md bg-panel p-4">
            <dt className="text-xs text-muted">Name</dt>
            <dd className="mt-1 text-sm font-medium">{user?.name ?? "Not set"}</dd>
          </div>
          <div className="rounded-md bg-panel p-4">
            <dt className="text-xs text-muted">Email</dt>
            <dd className="mt-1 text-sm font-medium">{user?.email ?? "Not signed in"}</dd>
          </div>
          <div className="rounded-md bg-panel p-4">
            <dt className="text-xs text-muted">Role</dt>
            <dd className="mt-1 text-sm font-medium">{user?.role ?? "USER"}</dd>
          </div>
        </dl>
      </section>
    </AppShell>
  );
}

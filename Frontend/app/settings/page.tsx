import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" description="Manage GitHub connection, AI model defaults, theme, indexing preferences, and account controls." />
      <section className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="text-base font-semibold">Workspace preferences</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-muted">
            Default model
            <input className="mt-2 w-full rounded-md border border-line px-3 py-2 text-ink outline-none" defaultValue="gpt-4.1-mini" />
          </label>
          <label className="text-sm text-muted">
            Theme
            <select className="mt-2 w-full rounded-md border border-line px-3 py-2 text-ink outline-none" defaultValue="system">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </section>
    </AppShell>
  );
}

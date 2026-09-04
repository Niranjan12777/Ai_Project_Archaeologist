import Link from "next/link";
import { ArrowRight, GitBranch, Network, Search } from "lucide-react";
import styles from "@/styles/interactive.module.css";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-accent">Repository intelligence platform</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-ink sm:text-6xl">
            AI Project Archaeologist
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Index GitHub repositories, explore architecture, ask grounded questions, generate documentation, and keep onboarding knowledge current.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/login"
              className={`${styles.button} inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-white`}
            >
              Open workspace
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/dashboard"
              className={`${styles.button} inline-flex items-center gap-2 rounded-md border border-line px-5 py-3 text-sm font-medium text-ink`}
            >
              View dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-6 shadow-soft">
          <div className="grid gap-4">
            {[
              { icon: GitBranch, title: "Repository indexing", text: "Clone, parse, chunk, embed, and track progress through the worker." },
              { icon: Search, title: "Hybrid search", text: "Combine semantic, keyword, file, function, and commit search." },
              { icon: Network, title: "Architecture maps", text: "Generate dependency and architecture graphs from source analysis." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-line bg-white p-4">
                  <Icon className="text-accent" size={22} />
                  <h2 className="mt-3 text-sm font-semibold text-ink">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useRepositories } from "@/hooks/use-repositories";
import { repositoryService } from "@/services/repository.service";
import styles from "@/styles/interactive.module.css";

export default function ChatPage() {
  const { data: repositories = [] } = useRepositories();
  const [repositoryId, setRepositoryId] = useState("");
  const [question, setQuestion] = useState("");
  const [chatId, setChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const activeRepositoryId = repositoryId || repositories[0]?.id || "";
  const ask = useMutation({
    mutationFn: () => repositoryService.ask(activeRepositoryId, { question, chatId }),
    onSuccess: (answer) => {
      setChatId(answer.chatId);
      setMessages((current) => [...current, { role: "assistant", content: answer.answer }]);
      setQuestion("");
    }
  });

  return (
    <AppShell>
      <PageHeader title="AI Chat" description="Ask grounded questions about indexed repositories with citations back to files and commits." />
      <section className="mt-8 grid min-h-[620px] grid-rows-[1fr_auto] rounded-lg border border-line bg-white">
        <div className="space-y-4 overflow-auto p-5">
          <select
            className={`${styles.input} w-full rounded-md border border-line px-4 py-3 text-sm outline-none md:w-96`}
            value={activeRepositoryId}
            onChange={(event) => {
              setRepositoryId(event.target.value);
              setChatId(undefined);
              setMessages([]);
            }}
          >
            {repositories.map((repository) => (
              <option key={repository.id} value={repository.id}>
                {repository.fullName}
              </option>
            ))}
          </select>
          {!messages.length ? (
            <div className="rounded-lg bg-panel p-4 text-sm text-muted">Select a repository and ask a question such as "Where is JWT implemented?"</div>
          ) : null}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-lg p-4 text-sm leading-6 ${message.role === "user" ? "bg-accent text-white" : "bg-panel text-ink"}`}
            >
              {message.content}
            </div>
          ))}
          {ask.isPending ? <div className="rounded-lg bg-panel p-4 text-sm text-muted">Retrieving context and composing an answer...</div> : null}
          {ask.isError ? <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">Unable to answer. Confirm this repository has indexed chunks.</div> : null}
        </div>
        <form
          className="flex gap-2 border-t border-line p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!activeRepositoryId || !question.trim()) return;
            setMessages((current) => [...current, { role: "user", content: question }]);
            ask.mutate();
          }}
        >
          <input
            className={`${styles.input} min-w-0 flex-1 rounded-md border border-line px-4 py-3 outline-none`}
            placeholder="Ask about architecture, auth, data flow, or code..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button
            className={`${styles.button} rounded-md bg-accent px-4 text-white disabled:bg-neutral-400`}
            aria-label="Send"
            disabled={!activeRepositoryId || !question.trim() || ask.isPending}
          >
            <Send size={20} />
          </button>
        </form>
      </section>
    </AppShell>
  );
}

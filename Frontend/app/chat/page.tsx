"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useRepositories } from "@/hooks/use-repositories";
import { repositoryService } from "@/services/repository.service";
import styles from "@/styles/interactive.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const { data: repositories = [] } = useRepositories();
  const [repositoryId, setRepositoryId] = useState("");
  const [question, setQuestion] = useState("");
  const [chatId, setChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRepositoryId = repositoryId || repositories[0]?.id || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  const ask = useMutation({
    mutationFn: (inputQuestion: string) => repositoryService.ask(
      activeRepositoryId,
      {
        question: inputQuestion,
        chatId
      }
    ),

    onSuccess: (answer) => {
      setChatId(answer.chatId);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer.answer
        }
      ]);

      setQuestion("");
    }
  });

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!activeRepositoryId || !trimmedQuestion || ask.isPending) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmedQuestion
      }
    ]);

    ask.mutate(trimmedQuestion);
  };

  const handleRepositoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRepositoryId(event.target.value);
    setChatId(undefined);
    setMessages([]);
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Chat"
        description="Ask grounded questions about indexed repositories with citations back to files and commits."
      />

      <section className="mt-8 flex h-[650px] flex-col overflow-hidden rounded-lg border border-line bg-white">

        <div className="shrink-0 border-b border-line p-4">
          <select
            className={`${styles.input} w-full rounded-md border border-line px-4 py-3 text-sm outline-none md:w-96`}
            value={activeRepositoryId}
            onChange={handleRepositoryChange}
          >
            {repositories.map((repository) => (
              <option
                key={repository.id}
                value={repository.id}
              >
                {repository.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-6">

            {!messages.length && !ask.isPending ? (
              <div className="rounded-lg bg-panel p-4 text-sm text-muted">
                Select a repository and ask a question such as "Where is JWT implemented?"
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[80%] rounded-2xl bg-accent px-4 py-3 text-sm leading-6 text-white"
                      : "max-w-[90%] px-1 py-1 text-sm leading-7 text-ink"
                  }
                >
                  {message.role === "user" ? (
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {ask.isPending ? (
              <div className="flex w-full justify-start">
                <div className="px-1 py-1 text-sm text-muted">
                  Retrieving context and composing an answer...
                </div>
              </div>
            ) : null}

            {ask.isError ? (
              <div className="flex w-full justify-start">
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  Unable to answer. Confirm this repository has indexed chunks.
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-line bg-white p-4">
          <form
            className="mx-auto flex w-full max-w-4xl gap-2"
            onSubmit={handleSubmit}
          >
            <input
              className={`${styles.input} min-w-0 flex-1 rounded-md border border-line px-4 py-3 outline-none`}
              placeholder="Ask about architecture, auth, data flow, or code..."
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              disabled={ask.isPending}
            />

            <button
              type="submit"
              className={`${styles.button} rounded-md bg-accent px-4 text-white disabled:bg-neutral-400`}
              aria-label="Send"
              disabled={!activeRepositoryId || !question.trim() || ask.isPending}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
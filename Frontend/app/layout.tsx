import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Project Archaeologist",
  description: "AI-assisted repository indexing, exploration, search, and documentation."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

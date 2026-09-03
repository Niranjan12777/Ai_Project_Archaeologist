"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import styles from "@/styles/interactive.module.css";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { register, handleSubmit } = useForm<LoginForm>();

  return (
    <main className="grid min-h-screen place-items-center bg-panel px-5">
      <form
        className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft"
        onSubmit={handleSubmit(async (values) => {
          await auth.login(values);
          router.push("/dashboard");
        })}
      >
        <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
        <div className="mt-6 space-y-4">
          <input className={`${styles.input} w-full rounded-md border border-line px-3 py-2 outline-none`} placeholder="Email" {...register("email")} />
          <input className={`${styles.input} w-full rounded-md border border-line px-3 py-2 outline-none`} placeholder="Password" type="password" {...register("password")} />
        </div>
        <button className={`${styles.button} mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-medium text-white`}>
          <LogIn size={17} />
          Sign in
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/auth/register" className="font-medium text-accent">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}

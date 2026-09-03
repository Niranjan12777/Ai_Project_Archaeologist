"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import styles from "@/styles/interactive.module.css";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const { register, handleSubmit } = useForm<RegisterForm>();

  return (
    <main className="grid min-h-screen place-items-center bg-panel px-5">
      <form
        className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft"
        onSubmit={handleSubmit(async (values) => {
          await auth.register(values);
          router.push("/dashboard");
        })}
      >
        <h1 className="text-2xl font-semibold text-ink">Create account</h1>
        <div className="mt-6 space-y-4">
          <input className={`${styles.input} w-full rounded-md border border-line px-3 py-2 outline-none`} placeholder="Name" {...register("name")} />
          <input className={`${styles.input} w-full rounded-md border border-line px-3 py-2 outline-none`} placeholder="Email" {...register("email")} />
          <input className={`${styles.input} w-full rounded-md border border-line px-3 py-2 outline-none`} placeholder="Password" type="password" {...register("password")} />
        </div>
        <button className={`${styles.button} mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-medium text-white`}>
          <UserPlus size={17} />
          Create account
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}

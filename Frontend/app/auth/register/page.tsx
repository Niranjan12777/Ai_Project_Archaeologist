"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { FormField } from "@/components/formField";
import styles from "@/styles/interactive.module.css";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5">
      <form
        className="w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-soft"
        onSubmit={handleSubmit(async (values) => {
          await auth.register(values);
          router.push("/dashboard");
        })}
      >
        <h1 className="text-2xl font-semibold text-ink">Create account</h1>
        <div className="mt-6 space-y-4">

          <FormField error={errors.name?.message}>
            <input
              className={`
                ${styles.input} 
                w-full 
                rounded-md 
                border 
                text-ink 
                border-line 
                px-3 
                py-2 
                outline-none 
                ${errors.name ? "border-red-400" : "border-line"}
              `}
              placeholder="Name"
              type="text"
              {...register("name", {
                required: "Enter your name"
              })}
            />
          </FormField>

          <FormField error={errors.email?.message}>
            <input
              className={`
                ${styles.input} 
                w-full 
                rounded-md 
                border 
                text-ink 
                border-line 
                px-3 
                py-2 
                outline-none 
                ${errors.email ? "border-red-400" : "border-line"}
              `}
              placeholder="Email"
              type="email"
              {...register("email", {
                required: "Enter your email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address"
                }
              })}
            />
          </FormField>

          <FormField error={errors.password?.message}>
            <input
              className={`
                ${styles.input} 
                w-full 
                rounded-md 
                border 
                text-ink 
                border-line 
                px-3 
                py-2 
                outline-none 
                ${errors.password ? "border-red-400" : "border-line"}
              `}
              placeholder="Password"
              type="password"
              {...register("password", {
                required: "Enter your password",
                minLength: {
                  value: 10,
                  message: "Password must be at least 10 characters"
                },
                maxLength: {
                  value: 128,
                  message: "Password must be less than 128 characters"
                }
              })}
            />
          </FormField>

        </div>
        <button
          className={`
            ${styles.button} 
            mt-6 
            inline-flex 
            w-full 
            items-center 
            justify-center 
            gap-2 
            rounded-md 
            bg-accent 
            px-4 
            py-2 
            font-medium 
            text-white
          `}
        >
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

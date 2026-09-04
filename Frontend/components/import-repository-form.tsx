"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { UploadCloud } from "lucide-react";
import { repositoryService } from "@/services/repository.service";
import styles from "@/styles/interactive.module.css";

interface FormValues {
  fullName: string;
}

export function ImportRepositoryForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState } = useForm<FormValues>();
  const mutation = useMutation({
    mutationFn: (values: FormValues) => repositoryService.import(values.fullName),
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["repositories"] });
    }
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="w-full sm:w-auto">
      <div className="flex w-full gap-2 sm:w-auto">
        <input
          className={`${styles.input} min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none sm:w-72`}
          placeholder="owner/repository"
          aria-invalid={Boolean(formState.errors.fullName)}
          {...register("fullName", {
            required: true,
            pattern: /^[\w.-]+\/[\w.-]+$/
          })}
        />
        <button
          className={`${styles.button} inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-400`}
          type="submit"
          disabled={mutation.isPending}
        >
          <UploadCloud size={16} />
          {mutation.isPending ? "Queueing" : "Import"}
        </button>
      </div>
      {formState.errors.fullName ? (
        <p className="mt-2 text-xs text-red-600">Use the GitHub full name format, for example vercel/next.js.</p>
      ) : null}
      {mutation.isError ? (
        <p className="mt-2 text-xs text-red-600">Repository import failed. Check the name and try again.</p>
      ) : null}
    </form>
  );
}

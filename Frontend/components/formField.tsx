interface FormFieldProps {
  error?: string;
  children: React.ReactNode;
}

export function FormField({ error, children }: FormFieldProps) {
  return (
    <div>
      {children}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-400 text-xs font-bold text-white">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
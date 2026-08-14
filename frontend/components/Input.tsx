import React from "react";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-[var(--color-surface-high)] border border-[var(--color-glass-border)] rounded-md px-3 py-2 text-[var(--foreground)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ${className}`}
      {...props}
    />
  );
}

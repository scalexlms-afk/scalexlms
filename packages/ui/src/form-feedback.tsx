"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./button";

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-accent-danger/30 bg-accent-danger/10 px-3 py-2 text-sm text-accent-danger"
    >
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="rounded-lg border border-accent-green/30 bg-accent-green/10 px-3 py-2 text-sm text-accent-green"
    >
      {message}
    </p>
  );
}

interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "sm" | "md" | "lg";
  pendingLabel?: string;
  children: ReactNode;
}

/**
 * A submit button that automatically shows a pending state while the parent
 * <form> server action is in flight (via useFormStatus).
 */
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? (
        <>
          <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {pendingLabel ?? "Working..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

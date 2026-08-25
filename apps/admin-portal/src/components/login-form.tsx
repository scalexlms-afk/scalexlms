"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormError, SubmitButton } from "@scalex/ui";
import { loginAction, type LoginState } from "@/app/auth/actions";
import { Field } from "@/components/field";


export function LoginForm({
  redirectTo,
  initialError,
}: {
  redirectTo: string;
  initialError?: string;
}) {
  const [state, formAction] = useActionState(loginAction, {
    error: initialError ?? null,
  });

  return (
    <>
      <div className="mt-4">
        <FormError message={state?.error ?? initialError} />
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <div className="flex justify-end">
          <Link
            href="/reset-password"
            className="text-xs text-muted hover:text-scalex-red hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <SubmitButton className="w-full" pendingLabel="Signing in...">
          Sign In
        </SubmitButton>
      </form>
    </>
  );
}

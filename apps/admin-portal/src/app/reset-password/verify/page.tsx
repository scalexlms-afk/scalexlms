import Link from "next/link";
import { FormError, FormSuccess, SubmitButton } from "@scalex/ui";
import {
  resetPasswordAction,
  verifyPasswordOtpAction,
} from "../../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "@/components/field";

export default async function AdminVerifyResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";

  return (
    <AuthShell
      title="Enter code"
      subtitle="Check your email for a 6-digit code, then set a new password."
      footer={
        <Link href="/reset-password" className="text-scalex-red hover:underline">
          Request a new code
        </Link>
      }
    >
      <div className="mt-4">
        <FormSuccess message="If an account exists for that email, a code is on its way." />
      </div>
      {params.error && (
        <div className="mt-4">
          <FormError message={params.error} />
        </div>
      )}

      <form action={verifyPasswordOtpAction} className="mt-6 space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={email}
        />
        <Field
          label="6-digit code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />
        <Field label="New password" name="password" type="password" required />
        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          required
        />
        <SubmitButton className="w-full" pendingLabel="Updating...">
          Update password
        </SubmitButton>
      </form>

      <form action={resetPasswordAction} className="mt-4">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          className="text-xs text-muted hover:text-scalex-red hover:underline"
        >
          Resend code
        </button>
      </form>
    </AuthShell>
  );
}

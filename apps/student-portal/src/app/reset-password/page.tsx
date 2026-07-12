import type { Metadata } from "next";
import Link from "next/link";
import { FormError, FormSuccess, SubmitButton } from "@scalex/ui";
import { resetPasswordAction } from "../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "@/components/field";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reset Password",
  description: "Reset your ScaleX LaunchPad account password.",
  path: "/reset-password",
  index: false,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email and we'll send you a secure reset link."
      footer={
        <Link href="/login" className="text-scalex-red hover:underline">
          Back to sign in
        </Link>
      }
    >
      {params.sent && (
        <div className="mt-4">
          <FormSuccess message="If an account exists for that email, a password reset link is on its way." />
        </div>
      )}
      {params.error && (
        <div className="mt-4">
          <FormError message={params.error} />
        </div>
      )}

      <form action={resetPasswordAction} className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" required />
        <SubmitButton className="w-full" pendingLabel="Sending...">
          Send Reset Link
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

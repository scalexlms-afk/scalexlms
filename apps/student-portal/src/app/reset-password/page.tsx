import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@scalex/ui";
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
      subtitle="Password reset emails are disabled in dev to avoid Supabase rate limits."
      footer={
        <Link href="/login" className="text-scalex-red hover:underline">
          Back to sign in
        </Link>
      }
    >
      {params.sent && (
        <p className="mt-4 rounded-lg bg-accent-green/10 px-3 py-2 text-sm text-accent-green">
          Check your email for a password reset link.
        </p>
      )}
      {params.error && (
        <p className="mt-4 rounded-lg bg-accent-danger/10 px-3 py-2 text-sm text-accent-danger">
          {params.error}
        </p>
      )}

      <form action={resetPasswordAction} className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" required />
        <Button type="submit" className="w-full">
          Send Reset Link
        </Button>
      </form>
    </AuthShell>
  );
}

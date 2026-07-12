import type { Metadata } from "next";
import Link from "next/link";
import { FormError, SubmitButton } from "@scalex/ui";
import { loginAction } from "../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { AuthSessionBanner } from "@/components/auth-session-banner";
import { Field } from "@/components/field";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description:
    "Sign in to ScaleX LaunchPad — your Amazon FBA private label learning portal with milestones, mentor review, and progress tracking.",
  path: "/login",
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your ScaleX LaunchPad account"
      footer={
        <>
          New to ScaleX?{" "}
          <Link href="/register" className="text-scalex-red hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <AuthSessionBanner />

      {params.error && (
        <div className="mt-4">
          <FormError message={params.error} />
        </div>
      )}

      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={params.redirect ?? ""} />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <div className="flex justify-end">
          <Link
            href="/reset-password"
            className="text-xs text-muted hover:text-scalex-red"
          >
            Forgot password?
          </Link>
        </div>
        <SubmitButton className="w-full" pendingLabel="Signing in...">
          Sign In
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

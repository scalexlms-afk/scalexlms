import type { Metadata } from "next";
import Link from "next/link";
import { FormError, SubmitButton } from "@scalex/ui";
import { registerAction } from "../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { AuthSessionBanner } from "@/components/auth-session-banner";
import { Field } from "@/components/field";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Register",
  description:
    "Create your ScaleX LaunchPad account and start the Amazon FBA private label journey — structured milestones, AI mentor, and human validation.",
  path: "/register",
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Join ScaleX LaunchPad"
      subtitle="Start your Amazon FBA journey today"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-scalex-red hover:underline">
            Sign in
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

      <form action={registerAction} className="mt-6 space-y-4">
        <Field label="Full Name" name="name" type="text" required />
        <Field label="Email" name="email" type="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <SubmitButton className="w-full" pendingLabel="Creating account...">
          Create Account
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

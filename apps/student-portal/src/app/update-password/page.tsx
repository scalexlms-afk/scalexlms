import type { Metadata } from "next";
import Link from "next/link";
import { FormError, SubmitButton } from "@scalex/ui";
import { updatePasswordAction } from "../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "@/components/field";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Set New Password",
  description: "Choose a new password for your ScaleX LaunchPad account.",
  path: "/update-password",
  index: false,
});

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link href="/login" className="text-scalex-red hover:underline">
          Back to sign in
        </Link>
      }
    >
      {params.error && (
        <div className="mt-4">
          <FormError message={params.error} />
        </div>
      )}

      <form action={updatePasswordAction} className="mt-6 space-y-4">
        <Field
          label="New Password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <Field
          label="Confirm Password"
          name="confirm"
          type="password"
          required
          minLength={8}
        />
        <SubmitButton className="w-full" pendingLabel="Updating...">
          Update Password
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

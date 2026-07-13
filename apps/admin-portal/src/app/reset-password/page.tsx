import Link from "next/link";
import { FormError, SubmitButton } from "@scalex/ui";
import { resetPasswordAction } from "../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "@/components/field";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email and we'll send a 6-digit code."
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

      <form action={resetPasswordAction} className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" required />
        <SubmitButton className="w-full" pendingLabel="Sending...">
          Send code
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

import Link from "next/link";
import { Button } from "@scalex/ui";
import { loginAction } from "../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "@/components/field";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Management OS"
      subtitle="Sign in to the ScaleX admin portal"
      footer={
        <>
          Student?{" "}
          <Link
            href={
              process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ??
              "http://localhost:3000"
            }
            className="text-scalex-red hover:underline"
          >
            Go to Student Portal
          </Link>
        </>
      }
    >
      {params.error && (
        <p className="mt-4 rounded-lg bg-accent-danger/10 px-3 py-2 text-sm text-accent-danger">
          {params.error}
        </p>
      )}

      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={params.redirect ?? ""} />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}

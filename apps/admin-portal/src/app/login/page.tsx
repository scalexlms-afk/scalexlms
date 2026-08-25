import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

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
      <LoginForm
        redirectTo={params.redirect ?? ""}
        initialError={params.error}
      />
    </AuthShell>
  );
}

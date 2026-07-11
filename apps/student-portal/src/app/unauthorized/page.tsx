import Link from "next/link";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

export default function UnauthorizedPage() {
  return (
    <AuthShell>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-danger/15 text-3xl text-accent-danger">
          ⚠
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2 text-sm text-text-secondary-dark">
          This portal is for students only. Admin users should use the
          Management OS.
        </p>
        <Link
          href={
            process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL ?? "http://localhost:3001"
          }
          className="mt-6 block"
        >
          <Button variant="secondary" className="w-full">
            Go to Admin Portal
          </Button>
        </Link>
      </div>
    </AuthShell>
  );
}

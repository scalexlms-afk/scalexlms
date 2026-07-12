import Link from "next/link";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

export default function NotFound() {
  return (
    <AuthShell>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-3 text-2xl font-bold text-muted">
          404
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/dashboard" className="mt-6 block">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
      </div>
    </AuthShell>
  );
}

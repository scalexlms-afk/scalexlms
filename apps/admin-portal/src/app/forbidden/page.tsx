import Link from "next/link";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

export default function ForbiddenPage() {
  return (
    <AuthShell>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-amber/15 text-3xl text-accent-amber">
          &#128274;
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted">
          Your role does not have permission to view this section. If you believe
          this is a mistake, contact a Super Admin.
        </p>
        <Link href="/" className="mt-6 block">
          <Button className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    </AuthShell>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AuthShell>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-danger/15 text-3xl text-accent-danger">
          !
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted">
          An unexpected error occurred. You can try again, or head back to your
          dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
          <Link href="/dashboard" className="block">
            <Button variant="secondary" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

import Link from "next/link";
import { Button } from "@scalex/ui";
import { AuthShell } from "@/components/auth-shell";

export default function PaymentCancelPage() {
  return (
    <AuthShell>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-amber/15 text-3xl text-accent-amber">
          ↩
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm text-muted">
          No worries — you can complete payment anytime to activate your account.
        </p>
        <Link href="/payment" className="mt-6 block">
          <Button className="w-full">Try Again</Button>
        </Link>
      </div>
    </AuthShell>
  );
}

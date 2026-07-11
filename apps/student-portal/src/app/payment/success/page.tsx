import { Suspense } from "react";
import PaymentSuccessContent from "./success-content";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-text-secondary-dark">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-scalex-red" />
          Activating your account...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

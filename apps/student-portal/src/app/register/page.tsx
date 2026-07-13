import type { Metadata } from "next";
import Link from "next/link";
import { FormError, SubmitButton } from "@scalex/ui";
import { registerAction } from "../auth/actions";
import { AuthShell } from "@/components/auth-shell";
import { AuthSessionBanner } from "@/components/auth-session-banner";
import { Field } from "@/components/field";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Register",
  description:
    "Create your ScaleX LaunchPad account and start the Amazon FBA private label journey — structured milestones, AI mentor, and human validation.",
  path: "/register",
});

const PLANS = {
  standard: {
    label: "Standard",
    summary: "Self-paced curriculum, AI Mentor, community, and support tickets.",
  },
  premium: {
    label: "Premium Launch Program",
    summary:
      "Everything in Standard plus live classes, mentor calls, and launch support.",
  },
} as const;

type PlanKey = keyof typeof PLANS;

function parsePlan(value: string | undefined): PlanKey {
  return value === "premium" ? "premium" : "standard";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const selectedPlan = parsePlan(params.plan);

  return (
    <AuthShell
      title="Join ScaleX LaunchPad"
      subtitle="Start your Amazon FBA journey today"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-scalex-red hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthSessionBanner />

      {params.error && (
        <div className="mt-4">
          <FormError message={params.error} />
        </div>
      )}

      <form action={registerAction} className="mt-6 space-y-4">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            Choose your plan
          </legend>
          {(Object.keys(PLANS) as PlanKey[]).map((planKey) => {
            const plan = PLANS[planKey];
            const selected = selectedPlan === planKey;
            return (
              <label
                key={planKey}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
                  selected
                    ? "border-scalex-red/50 bg-scalex-red/10"
                    : "border-line bg-surface-3 hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={planKey}
                  defaultChecked={selected}
                  className="mt-1 accent-[var(--color-scalex-red)]"
                />
                <span>
                  <span className="block font-semibold text-foreground">
                    {plan.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {plan.summary}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <Field label="Full Name" name="name" type="text" required />
        <Field label="Email" name="email" type="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <SubmitButton className="w-full" pendingLabel="Creating account...">
          Create Account
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

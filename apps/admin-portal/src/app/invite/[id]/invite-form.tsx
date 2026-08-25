import { FormError, SubmitButton } from "@scalex/ui";
import { Field } from "@/components/field";
import { acceptStaffInviteAction } from "./actions";

export function AcceptInviteForm({
  inviteId,
  email,
  error,
}: {
  inviteId: string;
  email: string;
  error?: string;
}) {
  return (
    <>
      {error ? (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      ) : null}
      <form action={acceptStaffInviteAction} className="mt-6 space-y-4">
        <input type="hidden" name="inviteId" value={inviteId} />
        <Field label="Email" name="emailDisplay" type="email" defaultValue={email} disabled />
        <Field label="Name" name="name" required autoComplete="name" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <SubmitButton className="w-full" pendingLabel="Creating account...">
          Accept invite
        </SubmitButton>
      </form>
    </>
  );
}

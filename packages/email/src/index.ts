import { Resend } from "resend";
import {
  passwordOtpEmailHtml,
  passwordOtpEmailText,
  remainingPaymentEmailHtml,
  remainingPaymentEmailText,
  taskReviewedEmailHtml,
  taskReviewedEmailText,
  staffInviteEmailHtml,
  staffInviteEmailText,
  welcomeEmailHtml,
  welcomeEmailText,
} from "./templates";

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

function getFrom() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "ScaleX LaunchPad <noreply@scalexlms.com>"
  );
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendEmailResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      console.error("sendEmail skipped: missing RESEND_API_KEY");
      return { ok: false, error: "missing RESEND_API_KEY" };
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: getFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      console.error("sendEmail failed:", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "email failed";
    console.error("sendEmail failed:", message);
    return { ok: false, error: message };
  }
}

export async function sendWelcomeEmail(input: {
  to: string;
  name: string;
  planLabel: string;
  dashboardUrl: string;
}) {
  return sendEmail({
    to: input.to,
    subject: "Welcome to ScaleX LaunchPad",
    html: welcomeEmailHtml(input),
    text: welcomeEmailText(input),
  });
}

export async function sendRemainingPaymentEmail(input: {
  to: string;
  name: string;
  amountLabel: string;
  paymentUrl: string;
  kind: "reminder" | "paid";
}) {
  return sendEmail({
    to: input.to,
    subject:
      input.kind === "paid"
        ? "Remaining balance paid — ScaleX"
        : "Reminder: remaining balance due — ScaleX",
    html: remainingPaymentEmailHtml(input),
    text: remainingPaymentEmailText(input),
  });
}

export async function sendTaskReviewedEmail(input: {
  to: string;
  name: string;
  decision: "approved" | "revision_required";
  feedback?: string | null;
  taskUrl: string;
}) {
  return sendEmail({
    to: input.to,
    subject:
      input.decision === "approved"
        ? "Your ScaleX task was approved"
        : "Revision requested on your ScaleX task",
    html: taskReviewedEmailHtml(input),
    text: taskReviewedEmailText(input),
  });
}

export async function sendPasswordOtpEmail(input: {
  to: string;
  code: string;
  portalLabel: string;
  expiresMinutes: number;
}) {
  return sendEmail({
    to: input.to,
    subject: `${input.code} is your ScaleX password reset code`,
    html: passwordOtpEmailHtml(input),
    text: passwordOtpEmailText(input),
  });
}


export async function sendStaffInviteEmail(input: {
  to: string;
  roleLabel: string;
  inviteUrl: string;
  inviterName?: string;
}) {
  return sendEmail({
    to: input.to,
    subject: `You're invited to ScaleX as ${input.roleLabel}`,
    html: staffInviteEmailHtml(input),
    text: staffInviteEmailText(input),
  });
}

export * from "./templates";
export * from "./previews";

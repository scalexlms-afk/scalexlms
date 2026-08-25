import {
  passwordOtpEmailHtml,
  remainingPaymentEmailHtml,
  staffInviteEmailHtml,
  taskReviewedEmailHtml,
  welcomeEmailHtml,
} from "./templates";

export type EmailPreview = {
  name: string;
  subject: string;
  html: string;
};

const siteUrl =
  process.env.EMAIL_SITE_URL?.replace(/\/$/, "") ||
  "https://www.scalexlms.com";

export function getEmailPreviews(): EmailPreview[] {
  return [
    {
      name: "Welcome",
      subject: "Welcome to ScaleX LaunchPad",
      html: welcomeEmailHtml({
        name: "Alex Morgan",
        planLabel: "Premium Launch Program",
        dashboardUrl: `${siteUrl}/dashboard`,
      }),
    },
    {
      name: "Payment reminder",
      subject: "Reminder: remaining balance due — ScaleX",
      html: remainingPaymentEmailHtml({
        name: "Alex Morgan",
        amountLabel: "$299.00",
        paymentUrl: `${siteUrl}/payment?mode=remaining`,
        kind: "reminder",
      }),
    },
    {
      name: "Payment complete",
      subject: "Remaining balance paid — ScaleX",
      html: remainingPaymentEmailHtml({
        name: "Alex Morgan",
        amountLabel: "$299.00",
        paymentUrl: `${siteUrl}/dashboard`,
        kind: "paid",
      }),
    },
    {
      name: "Task approved",
      subject: "Your ScaleX task was approved",
      html: taskReviewedEmailHtml({
        name: "Alex Morgan",
        decision: "approved",
        feedback:
          "Strong product validation and clear margin calculations. Your assumptions are well supported.",
        taskUrl: `${siteUrl}/roadmap`,
      }),
    },
    {
      name: "Revision requested",
      subject: "Revision requested on your ScaleX task",
      html: taskReviewedEmailHtml({
        name: "Alex Morgan",
        decision: "revision_required",
        feedback:
          "Add three more competitor examples and confirm the landed-cost estimate before resubmitting.",
        taskUrl: `${siteUrl}/roadmap`,
      }),
    },
    {
      name: "Password reset",
      subject: "482913 is your ScaleX password reset code",
      html: passwordOtpEmailHtml({
        code: "482913",
        portalLabel: "LaunchPad",
        expiresMinutes: 10,
      }),
    },
    {
      name: "Staff invite",
      subject: "You're invited to ScaleX as Mentor",
      html: staffInviteEmailHtml({
        roleLabel: "Mentor",
        inviteUrl: "https://admin.scalexlms.com/invite/preview",
        inviterName: "Jordan Lee",
      }),
    },
  ];
}

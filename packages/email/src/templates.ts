function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailLayout(params: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}) {
  const preheader = params.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(params.preheader)}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background:#0B0B10;color:#F5F5F7;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B10;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#16161D;border:1px solid #2A2A35;border-radius:12px;padding:28px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;font-weight:600;">ScaleX LaunchPad</p>
              <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#F5F5F7;">${escapeHtml(params.title)}</h1>
              ${params.bodyHtml}
              <p style="margin:28px 0 0;font-size:12px;color:#6B7280;line-height:1.5;">
                Learn. Build. Launch. Grow.<br/>
                You received this because you have a ScaleX account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(label: string, href: string) {
  return `<p style="margin:24px 0 0;">
  <a href="${escapeHtml(href)}" style="display:inline-block;background:#E31E24;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:8px;">
    ${escapeHtml(label)}
  </a>
</p>`;
}

export function welcomeEmailHtml(params: {
  name: string;
  planLabel: string;
  dashboardUrl: string;
}) {
  return emailLayout({
    title: "Welcome to ScaleX LaunchPad",
    preheader: "Your account is active — start your Amazon journey.",
    bodyHtml: `
      <p style="margin:0;font-size:15px;line-height:1.6;color:#D1D5DB;">
        Hi ${escapeHtml(params.name)},
      </p>
      <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#D1D5DB;">
        Your payment is confirmed and your <strong style="color:#F5F5F7;">${escapeHtml(params.planLabel)}</strong> account is active.
        Open your dashboard to continue the 8-milestone roadmap.
      </p>
      ${ctaButton("Go to dashboard", params.dashboardUrl)}
    `,
  });
}

export function remainingPaymentEmailHtml(params: {
  name: string;
  amountLabel: string;
  paymentUrl: string;
  kind: "reminder" | "paid";
}) {
  if (params.kind === "paid") {
    return emailLayout({
      title: "Remaining balance paid",
      preheader: "Thank you — your installment is complete.",
      bodyHtml: `
        <p style="margin:0;font-size:15px;line-height:1.6;color:#D1D5DB;">
          Hi ${escapeHtml(params.name)},
        </p>
        <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#D1D5DB;">
          We received your remaining balance payment of <strong style="color:#F5F5F7;">${escapeHtml(params.amountLabel)}</strong>. Thank you.
        </p>
        ${ctaButton("Open dashboard", params.paymentUrl)}
      `,
    });
  }

  return emailLayout({
    title: "Remaining balance reminder",
    preheader: `Your remaining balance of ${params.amountLabel} is due.`,
    bodyHtml: `
      <p style="margin:0;font-size:15px;line-height:1.6;color:#D1D5DB;">
        Hi ${escapeHtml(params.name)},
      </p>
      <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#D1D5DB;">
        Reminder: your remaining installment of <strong style="color:#F5F5F7;">${escapeHtml(params.amountLabel)}</strong> is still outstanding.
        Pay now to keep your LaunchPad account in good standing.
      </p>
      ${ctaButton("Pay remaining balance", params.paymentUrl)}
    `,
  });
}

export function taskReviewedEmailHtml(params: {
  name: string;
  decision: "approved" | "revision_required";
  feedback?: string | null;
  taskUrl: string;
}) {
  const approved = params.decision === "approved";
  return emailLayout({
    title: approved ? "Task approved" : "Revision requested",
    preheader: approved
      ? "Your submission was approved."
      : "Your mentor requested changes.",
    bodyHtml: `
      <p style="margin:0;font-size:15px;line-height:1.6;color:#D1D5DB;">
        Hi ${escapeHtml(params.name)},
      </p>
      <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#D1D5DB;">
        ${
          approved
            ? "Great work — your task submission has been approved."
            : "Your mentor reviewed your submission and requested revisions."
        }
      </p>
      ${
        params.feedback
          ? `<p style="margin:14px 0 0;padding:12px 14px;background:#1C1C26;border-radius:8px;font-size:14px;line-height:1.55;color:#E5E7EB;">${escapeHtml(params.feedback)}</p>`
          : ""
      }
      ${ctaButton(approved ? "Continue learning" : "Open task", params.taskUrl)}
    `,
  });
}

export function passwordOtpEmailHtml(params: {
  code: string;
  portalLabel: string;
  expiresMinutes: number;
}) {
  return emailLayout({
    title: "Your password reset code",
    preheader: `Use code ${params.code} to reset your password.`,
    bodyHtml: `
      <p style="margin:0;font-size:15px;line-height:1.6;color:#D1D5DB;">
        Use this one-time code to reset your ${escapeHtml(params.portalLabel)} password:
      </p>
      <p style="margin:20px 0;font-size:32px;letter-spacing:0.24em;font-weight:700;color:#F5F5F7;text-align:center;">
        ${escapeHtml(params.code)}
      </p>
      <p style="margin:0;font-size:14px;line-height:1.55;color:#9CA3AF;">
        This code expires in ${params.expiresMinutes} minutes. If you did not request a reset, you can ignore this email.
      </p>
    `,
  });
}

const BRAND = {
  black: "#0B0B10",
  charcoal: "#16161D",
  charcoalAlt: "#1D1D26",
  line: "#2A2A35",
  red: "#E31E24",
  redDark: "#B4181D",
  white: "#FFFFFF",
  body: "#E5E7EB",
  muted: "#C4C4CC",
  subtle: "#A1A1AA",
  green: "#22C55E",
  amber: "#F59E0B",
} as const;

type StatusTone = "success" | "warning" | "brand" | "neutral";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value: string, fallback: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? escapeHtml(parsed.toString())
      : escapeHtml(fallback);
  } catch {
    return escapeHtml(fallback);
  }
}

function brandConfig() {
  const siteUrl =
    process.env.EMAIL_SITE_URL?.trim() || "https://www.scalexlms.com";
  const logoUrl =
    process.env.EMAIL_LOGO_URL?.trim() ||
    `${siteUrl.replace(/\/$/, "")}/scalex-logo-transparent.png`;

  return {
    siteUrl: safeUrl(siteUrl, "https://www.scalexlms.com"),
    logoUrl: safeUrl(
      logoUrl,
      "https://www.scalexlms.com/scalex-logo-transparent.png"
    ),
  };
}

/** Lock a background color so Gmail dark-mode can't invert it to white. */
function lockedBg(color: string) {
  return `background-color:${color};background-image:linear-gradient(${color},${color});background:${color};background:linear-gradient(${color},${color});`;
}

/**
 * Wrap white/light text so Gmail iOS/Android dark-mode inversion
 * (which turns white text into black-on-black) is cancelled via blend modes.
 * Only targets Gmail via the `u + .body` selector.
 */
function gmailSafeText(html: string) {
  return `<div class="gmail-blend-screen" style="background:#000000;background-color:#000000;">
  <div class="gmail-blend-difference" style="background:#000000;background-color:#000000;">
    ${html}
  </div>
</div>`;
}

function statusPill(label: string, tone: StatusTone) {
  const colors: Record<StatusTone, { bg: string; fg: string; dot: string }> = {
    success: { bg: "#12351F", fg: "#86EFAC", dot: BRAND.green },
    warning: { bg: "#3B2A0B", fg: "#FCD34D", dot: BRAND.amber },
    brand: { bg: "#3B1114", fg: "#FCA5A5", dot: BRAND.red },
    neutral: { bg: BRAND.charcoalAlt, fg: BRAND.body, dot: BRAND.muted },
  };
  const color = colors[tone];

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
    <tr>
      <td bgcolor="${color.bg}" style="border-radius:999px;${lockedBg(color.bg)}padding:7px 12px;color:${color.fg};font-size:11px;line-height:1;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
        ${gmailSafeText(`<span style="color:${color.dot};font-size:14px;vertical-align:-1px;">&#9679;</span>&nbsp;&nbsp;<span style="color:${color.fg};">${escapeHtml(label)}</span>`)}
      </td>
    </tr>
  </table>`;
}

export function ctaButton(label: string, href: string) {
  const target = safeUrl(href, "https://www.scalexlms.com");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 4px;">
    <tr>
      <td align="center" bgcolor="${BRAND.red}" style="border-radius:8px;${lockedBg(BRAND.red)}">
        <a href="${target}" style="display:inline-block;border:1px solid ${BRAND.red};border-radius:8px;${lockedBg(BRAND.red)}color:#ffffff;text-decoration:none;font-size:14px;line-height:18px;font-weight:700;padding:13px 22px;">
          ${gmailSafeText(`<span style="color:#ffffff;">${escapeHtml(label)} &nbsp;&#8594;</span>`)}
        </a>
      </td>
    </tr>
  </table>`;
}

function metricPanel(label: string, value: string, tone: StatusTone = "brand") {
  const border =
    tone === "success"
      ? BRAND.green
      : tone === "warning"
        ? BRAND.amber
        : BRAND.red;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BRAND.charcoalAlt}" style="margin:22px 0;${lockedBg(BRAND.charcoalAlt)}border:1px solid ${BRAND.line};border-top:3px solid ${border};border-radius:10px;">
    <tr>
      <td align="center" bgcolor="${BRAND.charcoalAlt}" style="padding:20px 16px;${lockedBg(BRAND.charcoalAlt)}">
        ${gmailSafeText(`
          <p style="margin:0 0 7px;color:${BRAND.muted};font-size:11px;line-height:16px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${escapeHtml(label)}</p>
          <p style="margin:0;color:${BRAND.white};font-size:32px;line-height:38px;font-weight:800;letter-spacing:-.02em;">${escapeHtml(value)}</p>
        `)}
      </td>
    </tr>
  </table>`;
}

function featureRows(
  rows: Array<{ number: string; title: string; description: string }>
) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;">${rows
    .map(
      (row, index) => `<tr>
        <td width="42" valign="top" bgcolor="${BRAND.charcoal}" style="padding:${index ? "14px" : "0"} 12px ${index === rows.length - 1 ? "0" : "14px"} 0;${lockedBg(BRAND.charcoal)}${
          index ? `border-top:1px solid ${BRAND.line};` : ""
        }">
          <div style="width:34px;height:34px;border-radius:50%;${lockedBg("#3B1114")}color:#FCA5A5;font-size:13px;line-height:34px;font-weight:800;text-align:center;">${gmailSafeText(`<span style="color:#FCA5A5;">${escapeHtml(row.number)}</span>`)}</div>
        </td>
        <td valign="top" bgcolor="${BRAND.charcoal}" style="padding:${index ? "14px" : "0"} 0 ${index === rows.length - 1 ? "0" : "14px"};${lockedBg(BRAND.charcoal)}${
          index ? `border-top:1px solid ${BRAND.line};` : ""
        }">
          ${gmailSafeText(`
            <p style="margin:0 0 4px;color:${BRAND.white};font-size:14px;line-height:19px;font-weight:700;">${escapeHtml(row.title)}</p>
            <p style="margin:0;color:${BRAND.muted};font-size:13px;line-height:19px;">${escapeHtml(row.description)}</p>
          `)}
        </td>
      </tr>`
    )
    .join("")}</table>`;
}

function feedbackBox(feedback: string, tone: StatusTone) {
  const accent = tone === "success" ? BRAND.green : BRAND.amber;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BRAND.charcoalAlt}" style="margin:20px 0;${lockedBg(BRAND.charcoalAlt)}border-left:3px solid ${accent};border-radius:8px;">
    <tr>
      <td bgcolor="${BRAND.charcoalAlt}" style="padding:16px 18px;${lockedBg(BRAND.charcoalAlt)}">
        ${gmailSafeText(`
          <p style="margin:0 0 7px;color:${BRAND.muted};font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">Mentor feedback</p>
          <p style="margin:0;color:${BRAND.body};font-size:14px;line-height:22px;">${escapeHtml(feedback).replace(/\n/g, "<br/>")}</p>
        `)}
      </td>
    </tr>
  </table>`;
}

function closingBanner(title: string, body: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BRAND.black}" style="margin:28px 0 0;${lockedBg(BRAND.black)}border:1px solid ${BRAND.line};border-radius:10px;">
    <tr>
      <td align="center" bgcolor="${BRAND.black}" style="padding:19px 18px;${lockedBg(BRAND.black)}">
        ${gmailSafeText(`
          <p style="margin:0;color:${BRAND.white};font-size:14px;line-height:20px;font-weight:700;">${escapeHtml(title)}</p>
          <p style="margin:5px 0 0;color:${BRAND.muted};font-size:12px;line-height:18px;">${escapeHtml(body)}</p>
        `)}
      </td>
    </tr>
  </table>`;
}

export function emailLayout(params: {
  title: string;
  preheader?: string;
  eyebrow: string;
  bodyHtml: string;
}) {
  const preheader = params.preheader
    ? `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(params.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : "";
  const brand = brandConfig();
  const year = new Date().getUTCFullYear();

  return `<!DOCTYPE html>
<html lang="en" style="color-scheme:dark only;supported-color-schemes:dark;">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark only" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(params.title)}</title>
  <style type="text/css">
    :root { color-scheme: dark only; supported-color-schemes: dark; }
    body, table, td, p, a, span, div { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    /* Gmail-only: cancel forced text inversion in dark mode */
    u + .body .gmail-blend-screen { background:#000000 !important; mix-blend-mode:screen !important; }
    u + .body .gmail-blend-difference { background:#000000 !important; mix-blend-mode:difference !important; }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body class="body" bgcolor="${BRAND.black}" style="margin:0;padding:0;${lockedBg(BRAND.black)}color:${BRAND.white};font-family:Arial,'Segoe UI',Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.black}" style="width:100%;${lockedBg(BRAND.black)}">
    <tr>
      <td align="center" bgcolor="${BRAND.black}" style="padding:30px 12px;${lockedBg(BRAND.black)}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.black}" style="width:100%;max-width:600px;${lockedBg(BRAND.black)}">
          <tr>
            <td align="center" bgcolor="${BRAND.black}" style="padding:24px 24px 22px;${lockedBg(BRAND.black)}border:1px solid ${BRAND.line};border-bottom:3px solid ${BRAND.red};border-radius:14px 14px 0 0;">
              <a href="${brand.siteUrl}" style="text-decoration:none;">
                <img src="${brand.logoUrl}" width="205" alt="ScaleX LaunchPad" style="display:block;width:205px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
              </a>
              ${gmailSafeText(`<p style="margin:10px 0 0;color:${BRAND.muted};font-size:10px;line-height:15px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">Learn. Build. Launch. Grow.</p>`)}
            </td>
          </tr>
          <tr>
            <td bgcolor="${BRAND.charcoal}" style="padding:34px 34px 32px;${lockedBg(BRAND.charcoal)}border-right:1px solid ${BRAND.line};border-left:1px solid ${BRAND.line};">
              ${gmailSafeText(`
                <p style="margin:0 0 8px;color:${BRAND.red};font-size:11px;line-height:16px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;">${escapeHtml(params.eyebrow)}</p>
                <h1 style="margin:0 0 20px;color:${BRAND.white};font-size:28px;line-height:35px;font-weight:800;letter-spacing:-.02em;">${escapeHtml(params.title)}</h1>
              `)}
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="${BRAND.black}" style="padding:23px 26px;${lockedBg(BRAND.black)}border:1px solid ${BRAND.line};border-top:0;border-radius:0 0 14px 14px;">
              ${gmailSafeText(`
                <p style="margin:0;color:${BRAND.white};font-size:12px;line-height:18px;font-weight:700;letter-spacing:.06em;">LEARN&nbsp;&nbsp;&middot;&nbsp;&nbsp;BUILD&nbsp;&nbsp;&middot;&nbsp;&nbsp;LAUNCH&nbsp;&nbsp;&middot;&nbsp;&nbsp;GROW</p>
                <p style="margin:9px 0 0;color:${BRAND.subtle};font-size:11px;line-height:17px;">
                  <a href="${brand.siteUrl}" style="color:${BRAND.muted};text-decoration:none;">scalexlms.com</a>
                  &nbsp;&nbsp;&middot;&nbsp;&nbsp; ScaleX LaunchPad
                </p>
                <p style="margin:8px 0 0;color:${BRAND.subtle};font-size:10px;line-height:16px;">&copy; ${year} ScaleX. You received this transactional message because you have a ScaleX account.</p>
              `)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailHtml(params: {
  name: string;
  planLabel: string;
  dashboardUrl: string;
}) {
  return emailLayout({
    title: "Your launch journey starts now",
    eyebrow: "Welcome to ScaleX",
    preheader: "Your account is active — take the first step in your Amazon journey.",
    bodyHtml: `
      ${statusPill("Account active", "success")}
      ${gmailSafeText(`
        <p style="margin:0;color:${BRAND.body};font-size:15px;line-height:24px;">Hi <strong style="color:${BRAND.white};">${escapeHtml(params.name)}</strong>,</p>
        <p style="margin:12px 0 0;color:${BRAND.body};font-size:15px;line-height:24px;">Your payment is confirmed and your <strong style="color:${BRAND.white};">${escapeHtml(params.planLabel)}</strong> access is ready. ScaleX is built to move you from learning to execution — one approved milestone at a time.</p>
        <p style="margin:27px 0 0;color:${BRAND.white};font-size:17px;line-height:23px;font-weight:800;">What happens next?</p>
      `)}
      ${featureRows([
        { number: "01", title: "Open your dashboard", description: "See your current stage, progress, and the next action to take." },
        { number: "02", title: "Follow the 8-milestone roadmap", description: "Work through the exact steps from foundation to brand scaling." },
        { number: "03", title: "Submit your first task", description: "Get AI-assisted feedback and final validation from a human mentor." },
      ])}
      ${ctaButton("Enter your dashboard", params.dashboardUrl)}
      ${closingBanner("Execution beats consumption.", "Your roadmap, AI mentor, and human support are ready when you are.")}
    `,
  });
}

export function welcomeEmailText(params: {
  name: string;
  planLabel: string;
  dashboardUrl: string;
}) {
  return `WELCOME TO SCALEX\n\nHi ${params.name},\n\nYour payment is confirmed and your ${params.planLabel} access is active.\n\nWHAT HAPPENS NEXT\n1. Open your dashboard\n2. Follow the 8-milestone roadmap\n3. Submit your first task for mentor validation\n\nEnter your dashboard: ${params.dashboardUrl}\n\nLearn. Build. Launch. Grow.\nScaleX LaunchPad`;
}

export function remainingPaymentEmailHtml(params: {
  name: string;
  amountLabel: string;
  paymentUrl: string;
  kind: "reminder" | "paid";
}) {
  const paid = params.kind === "paid";

  return emailLayout({
    title: paid ? "Your payment is complete" : "Your remaining balance is due",
    eyebrow: paid ? "Payment confirmation" : "Account reminder",
    preheader: paid
      ? "Thank you — your installment is complete."
      : `Your remaining balance of ${params.amountLabel} is ready for payment.`,
    bodyHtml: `
      ${statusPill(paid ? "Payment complete" : "Balance due", paid ? "success" : "warning")}
      ${gmailSafeText(`
        <p style="margin:0;color:${BRAND.body};font-size:15px;line-height:24px;">Hi <strong style="color:${BRAND.white};">${escapeHtml(params.name)}</strong>,</p>
        <p style="margin:12px 0 0;color:${BRAND.body};font-size:15px;line-height:24px;">${
          paid
            ? "We received your remaining installment. Your ScaleX account is fully paid and your learning access continues uninterrupted."
            : "This is a friendly reminder that the final installment on your ScaleX plan is still outstanding. Complete it to keep your account in good standing."
        }</p>
      `)}
      ${metricPanel(paid ? "Amount received" : "Remaining balance", params.amountLabel, paid ? "success" : "warning")}
      ${ctaButton(paid ? "Open your dashboard" : "Pay remaining balance", params.paymentUrl)}
      ${closingBanner(
        paid ? "You are fully invested in the journey." : "Need help with your payment?",
        paid
          ? "Keep building momentum through your next milestone."
          : "Reply to this email or contact the ScaleX support team before your access is affected."
      )}
    `,
  });
}

export function remainingPaymentEmailText(params: {
  name: string;
  amountLabel: string;
  paymentUrl: string;
  kind: "reminder" | "paid";
}) {
  const paid = params.kind === "paid";
  return `${paid ? "PAYMENT COMPLETE" : "REMAINING BALANCE DUE"}\n\nHi ${params.name},\n\n${
    paid
      ? `We received your remaining payment of ${params.amountLabel}. Your ScaleX account is fully paid.`
      : `Your remaining installment of ${params.amountLabel} is still outstanding.`
  }\n\n${paid ? "Open your dashboard" : "Pay your balance"}: ${params.paymentUrl}\n\nLearn. Build. Launch. Grow.\nScaleX LaunchPad`;
}

export function taskReviewedEmailHtml(params: {
  name: string;
  decision: "approved" | "revision_required";
  feedback?: string | null;
  taskUrl: string;
}) {
  const approved = params.decision === "approved";
  return emailLayout({
    title: approved ? "Task approved — keep moving" : "Your mentor requested a revision",
    eyebrow: "Mentor review complete",
    preheader: approved
      ? "Your task was approved. Your next step is ready."
      : "Review your mentor feedback and update your submission.",
    bodyHtml: `
      ${statusPill(approved ? "Approved" : "Revision requested", approved ? "success" : "warning")}
      ${gmailSafeText(`
        <p style="margin:0;color:${BRAND.body};font-size:15px;line-height:24px;">Hi <strong style="color:${BRAND.white};">${escapeHtml(params.name)}</strong>,</p>
        <p style="margin:12px 0 0;color:${BRAND.body};font-size:15px;line-height:24px;">${
          approved
            ? "Strong work. Your mentor approved this task, which means your execution has met the milestone standard. Your next action is waiting."
            : "Your submission has been reviewed. This is not a setback — it is a clear opportunity to strengthen the work before your milestone is approved."
        }</p>
      `)}
      ${
        params.feedback
          ? feedbackBox(params.feedback, approved ? "success" : "warning")
          : ""
      }
      ${
        approved
          ? featureRows([
              { number: "01", title: "Review your progress", description: "See how this approval moved your course completion forward." },
              { number: "02", title: "Continue to the next action", description: "Keep momentum by opening the next lesson or milestone task." },
            ])
          : featureRows([
              { number: "01", title: "Read the feedback carefully", description: "Focus on the exact improvements requested by your mentor." },
              { number: "02", title: "Update your deliverable", description: "Make the changes, then submit the revised version for review." },
            ])
      }
      ${ctaButton(approved ? "Continue learning" : "Open task and revise", params.taskUrl)}
      ${closingBanner(
        approved ? "Milestone momentum unlocked." : "Progress includes revision.",
        approved
          ? "Every approved task moves your business closer to launch."
          : "Apply the feedback, resubmit, and keep moving forward."
      )}
    `,
  });
}

export function taskReviewedEmailText(params: {
  name: string;
  decision: "approved" | "revision_required";
  feedback?: string | null;
  taskUrl: string;
}) {
  const approved = params.decision === "approved";
  return `${approved ? "TASK APPROVED" : "REVISION REQUESTED"}\n\nHi ${params.name},\n\n${
    approved
      ? "Your mentor approved your task. Your next action is ready."
      : "Your mentor reviewed your task and requested changes."
  }${params.feedback ? `\n\nMENTOR FEEDBACK\n${params.feedback}` : ""}\n\n${
    approved ? "Continue learning" : "Open task and revise"
  }: ${params.taskUrl}\n\nLearn. Build. Launch. Grow.\nScaleX LaunchPad`;
}

export function passwordOtpEmailHtml(params: {
  code: string;
  portalLabel: string;
  expiresMinutes: number;
}) {
  return emailLayout({
    title: "Secure your ScaleX account",
    eyebrow: "Password reset",
    preheader: `Use code ${params.code} to reset your password.`,
    bodyHtml: `
      ${statusPill("Security code", "brand")}
      ${gmailSafeText(`
        <p style="margin:0;color:${BRAND.body};font-size:15px;line-height:24px;">A password reset was requested for your <strong style="color:${BRAND.white};">${escapeHtml(params.portalLabel)}</strong> account.</p>
        <p style="margin:12px 0 0;color:${BRAND.body};font-size:15px;line-height:24px;">Enter this one-time code on the verification screen:</p>
      `)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BRAND.charcoalAlt}" style="margin:24px 0;${lockedBg(BRAND.charcoalAlt)}border:1px solid ${BRAND.line};border-top:3px solid ${BRAND.red};border-radius:10px;">
        <tr>
          <td align="center" bgcolor="${BRAND.charcoalAlt}" style="padding:25px 12px;${lockedBg(BRAND.charcoalAlt)}">
            ${gmailSafeText(`
              <p style="margin:0 0 8px;color:${BRAND.muted};font-size:10px;line-height:15px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;">One-time verification code</p>
              <p style="margin:0;color:${BRAND.white};font-family:'Courier New',Courier,monospace;font-size:38px;line-height:46px;font-weight:800;letter-spacing:.2em;">${escapeHtml(params.code)}</p>
            `)}
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#261D0D" style="margin:0;${lockedBg("#261D0D")}border-left:3px solid ${BRAND.amber};border-radius:8px;">
        <tr>
          <td bgcolor="#261D0D" style="padding:13px 15px;${lockedBg("#261D0D")}color:#FDE68A;font-size:13px;line-height:20px;">
            ${gmailSafeText(`<span style="color:#FDE68A;">This code expires in <strong>${params.expiresMinutes} minutes</strong> and can only be used once.</span>`)}
          </td>
        </tr>
      </table>
      ${closingBanner("Didn’t request this?", "You can safely ignore this email. Never share this code with anyone, including ScaleX staff.")}
    `,
  });
}

export function passwordOtpEmailText(params: {
  code: string;
  portalLabel: string;
  expiresMinutes: number;
}) {
  return `SCALEX PASSWORD RESET\n\nA password reset was requested for your ${params.portalLabel} account.\n\nYOUR ONE-TIME CODE: ${params.code}\n\nThis code expires in ${params.expiresMinutes} minutes and can only be used once.\n\nIf you did not request this, ignore this email. Never share this code with anyone.\n\nScaleX LaunchPad`;
}

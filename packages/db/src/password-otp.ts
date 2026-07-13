import { createHash, randomInt, timingSafeEqual } from "crypto";
import { createServiceClient } from "./service";
import { sendPasswordOtpEmail } from "@scalex/email";

export type OtpPortal = "student" | "admin";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;

function pepper() {
  return (
    process.env.OTP_PEPPER?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32) ||
    "scalex-dev-otp-pepper"
  );
}

export function hashOtpCode(code: string, email: string) {
  return createHash("sha256")
    .update(`${pepper()}:${email.toLowerCase()}:${code}`)
    .digest("hex");
}

function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Request a password-reset OTP. Always returns ok to avoid email enumeration. */
export async function requestPasswordOtp(input: {
  email: string;
  portal: OtpPortal;
  portalLabel: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: true as const };
  }

  const supabase = createServiceClient();

  const { data: recent } = await supabase
    .from("password_reset_otps" as never)
    .select("created_at")
    .eq("email", email)
    .eq("portal", input.portal)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const recentCreated = (recent as { created_at?: string } | null)?.created_at;
  if (
    recentCreated &&
    Date.now() - new Date(recentCreated).getTime() < RESEND_COOLDOWN_MS
  ) {
    return { ok: true as const };
  }

  // Only send if an auth user exists for this email.
  const { data: listed } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const user = (listed?.users ?? []).find(
    (u) => u.email?.toLowerCase() === email
  );
  if (!user) {
    return { ok: true as const };
  }

  // Invalidate prior unused OTPs for this email+portal.
  await supabase
    .from("password_reset_otps" as never)
    .update({ consumed_at: new Date().toISOString() } as never)
    .eq("email", email)
    .eq("portal", input.portal)
    .is("consumed_at", null);

  const code = generateCode();
  const codeHash = hashOtpCode(code, email);
  const expiresAt = new Date(
    Date.now() + OTP_TTL_MINUTES * 60_000
  ).toISOString();

  const { error } = await supabase.from("password_reset_otps" as never).insert({
    email,
    code_hash: codeHash,
    expires_at: expiresAt,
    portal: input.portal,
  } as never);

  if (error) {
    console.error("requestPasswordOtp insert failed:", error.message);
    return { ok: true as const };
  }

  await sendPasswordOtpEmail({
    to: email,
    code,
    portalLabel: input.portalLabel,
    expiresMinutes: OTP_TTL_MINUTES,
  });

  return { ok: true as const };
}

export async function verifyPasswordOtpAndSetPassword(input: {
  email: string;
  code: string;
  newPassword: string;
  portal: OtpPortal;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const code = input.code.trim();

  if (!email || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter a valid 6-digit code." };
  }
  if (input.newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const supabase = createServiceClient();
  const { data: row, error } = await supabase
    .from("password_reset_otps" as never)
    .select("id, code_hash, expires_at, attempts, consumed_at")
    .eq("email", email)
    .eq("portal", input.portal)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, error: "Invalid or expired code. Request a new one." };
  }

  const otp = row as {
    id: string;
    code_hash: string;
    expires_at: string;
    attempts: number;
    consumed_at: string | null;
  };

  if (otp.attempts >= MAX_ATTEMPTS) {
    return {
      ok: false,
      error: "Too many attempts. Request a new code.",
    };
  }

  if (new Date(otp.expires_at).getTime() < Date.now()) {
    await supabase
      .from("password_reset_otps" as never)
      .update({ consumed_at: new Date().toISOString() } as never)
      .eq("id", otp.id);
    return { ok: false, error: "Code expired. Request a new one." };
  }

  const expected = hashOtpCode(code, email);
  if (!safeEqualHex(expected, otp.code_hash)) {
    await supabase
      .from("password_reset_otps" as never)
      .update({ attempts: otp.attempts + 1 } as never)
      .eq("id", otp.id);
    return { ok: false, error: "Invalid code." };
  }

  const { data: listed } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const user = (listed?.users ?? []).find(
    (u) => u.email?.toLowerCase() === email
  );
  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: input.newPassword }
  );
  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  await supabase
    .from("password_reset_otps" as never)
    .update({ consumed_at: new Date().toISOString() } as never)
    .eq("id", otp.id);

  return { ok: true };
}

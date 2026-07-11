/**
 * Seed one test account per role for quick manual testing.
 * Run: node scripts/seed-test-users.mjs
 */
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { createClient } = require(
  "../apps/student-portal/node_modules/@supabase/supabase-js"
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const paths = [
    resolve(root, "apps/student-portal/.env.local"),
    resolve(root, ".env.local"),
  ];
  const env = {};
  for (const p of paths) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PASSWORD = "ScaleXTest123!";

const ACCOUNTS = [
  { email: "superadmin@scalex.dev", name: "Super Admin", role: "super_admin" },
  { email: "instructor@scalex.dev", name: "Instructor", role: "instructor" },
  { email: "mentor@scalex.dev", name: "Mentor", role: "mentor" },
  { email: "sales@scalex.dev", name: "Sales Rep", role: "sales" },
  { email: "student@scalex.dev", name: "Test Student", role: "student" },
];

async function ensureUser(account) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", account.email)
    .maybeSingle();

  let userId = existing?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { name: account.name },
    });
    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: list } = await supabase.auth.admin.listUsers();
        const found = list?.users?.find((u) => u.email === account.email);
        if (!found) throw error;
        userId = found.id;
      } else {
        throw error;
      }
    } else {
      userId = data.user.id;
    }
  }

  const status = account.role === "student" ? "active" : "active";

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: account.name,
      role: account.role,
      status,
      plan: account.role === "student" ? "standard" : null,
    })
    .eq("id", userId);

  if (profileError) throw profileError;

  return userId;
}

async function main() {
  const ids = {};

  for (const account of ACCOUNTS) {
    ids[account.role] = await ensureUser(account);
    console.log(`✓ ${account.role}: ${account.email}`);
  }

  // Assign mentor to test student
  if (ids.mentor && ids.student) {
    await supabase
      .from("profiles")
      .update({ mentor_id: ids.mentor })
      .eq("id", ids.student);
    console.log("✓ Linked student@scalex.dev → mentor@scalex.dev");
  }

  // Enroll test student in published course
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("status", "published")
    .limit(1)
    .single();

  if (course && ids.student) {
    await supabase.from("enrollments").upsert(
      {
        student_id: ids.student,
        course_id: course.id,
        plan: "standard",
      },
      { onConflict: "student_id,course_id" }
    );
    console.log("✓ Enrolled test student in published course");
  }

  console.log("\n--- Test accounts (password for all) ---");
  console.log(`Password: ${TEST_PASSWORD}`);
  console.log("\nStudent portal (localhost:3000):");
  console.log("  student@scalex.dev");
  console.log("\nAdmin portal (localhost:3001):");
  console.log("  superadmin@scalex.dev");
  console.log("  instructor@scalex.dev");
  console.log("  mentor@scalex.dev   ← sees only assigned student submissions");
  console.log("  sales@scalex.dev");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const require = createRequire(import.meta.url);
const { createClient } = require(
  "../apps/student-portal/node_modules/@supabase/supabase-js"
);

function loadEnv() {
  const env = {};
  for (const p of [
    resolve("apps/student-portal/.env.local"),
    resolve(".env.local"),
  ]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      env[t.slice(0, i).trim()] = v;
    }
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const prefix = "lectures/fc0d1b38-9e3d-4125-9bd5-181fdf962b90";
const { data, error } = await sb.storage.from("lesson-media").list(prefix, {
  limit: 100,
});
if (error) {
  console.error(error);
  process.exit(1);
}
const files = (data || []).map((f) => f.name).sort();
console.log("count", files.length);
console.log(files.join("\n"));
const { data: signed, error: signErr } = await sb.storage
  .from("lesson-media")
  .createSignedUrl(`${prefix}/17-lecture-17-inventory-shipment.mp4`, 60);
console.log("L17 signed", Boolean(signed?.signedUrl), signErr?.message ?? "");

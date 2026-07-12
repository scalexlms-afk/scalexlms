import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const payloadPath = process.argv[2];
if (!payloadPath) {
  console.error("Usage: node scripts/vercel-api-deploy.mjs <payload.json>");
  process.exit(1);
}

const payload = JSON.parse(readFileSync(payloadPath, "utf8"));
const authPath = join(
  homedir(),
  "AppData",
  "Roaming",
  "com.vercel.cli",
  "Data",
  "auth.json"
);
const { token } = JSON.parse(readFileSync(authPath, "utf8"));
const teamId = payload.teamId;

async function api(path, { method = "GET", body, headers = {} } = {}) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) url.searchParams.set("teamId", teamId);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }
  return json;
}

function sha1(buf) {
  return createHash("sha1").update(buf).digest("hex");
}

async function uploadFile(filePath, content) {
  const buf = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, "utf8");
  const digest = sha1(buf);
  await api("/v2/files", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "x-vercel-digest": digest,
      "Content-Length": String(buf.length),
    },
    body: buf,
  });
  return { file: filePath, sha: digest, size: buf.length };
}

async function main() {
  console.log(`Uploading ${payload.files.length} files...`);
  const uploaded = [];
  for (const entry of payload.files) {
    const content =
      entry.encoding === "base64"
        ? Buffer.from(entry.data, "base64")
        : entry.data;
    uploaded.push(await uploadFile(entry.file, content));
    process.stdout.write(".");
  }
  console.log("\nCreating deployment...");

  const result = await api("/v13/deployments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      files: uploaded,
      target: payload.target,
      projectSettings: payload.projectSettings,
    }),
  });

  console.log(
    JSON.stringify(
      {
        id: result.id,
        url: result.url ? `https://${result.url}` : null,
        inspectorUrl: result.inspectorUrl,
        readyState: result.readyState,
        projectId: result.projectId,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

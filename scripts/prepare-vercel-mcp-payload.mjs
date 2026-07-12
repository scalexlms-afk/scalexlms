import { readFileSync, writeFileSync } from "node:fs";

const files = JSON.parse(readFileSync("vercel-deploy-files.json", "utf8"));
const teamId = "team_r82C6S4pw5I3R4fZicSRFled";

const apps = [
  {
    name: "scalexlms-student",
    rootDirectory: "apps/student-portal",
    buildCommand: "cd ../.. && pnpm turbo build --filter=student-portal",
    installCommand: "cd ../.. && pnpm install",
  },
  {
    name: "scalexlms-admin",
    rootDirectory: "apps/admin-portal",
    buildCommand: "cd ../.. && pnpm turbo build --filter=admin-portal",
    installCommand: "cd ../.. && pnpm install",
  },
];

const target = process.argv[2] || "student";
const app = apps.find((a) => a.name.includes(target)) ?? apps[0];

const payload = {
  target: "production",
  name: app.name,
  teamId,
  files,
  projectSettings: {
    framework: "nextjs",
    rootDirectory: app.rootDirectory,
    buildCommand: app.buildCommand,
    installCommand: app.installCommand,
    outputDirectory: null,
  },
};

const out = `vercel-mcp-${app.name}.json`;
writeFileSync(out, JSON.stringify(payload));
console.log(`Wrote ${out} (${(readFileSync(out).length / 1024).toFixed(1)} KB)`);

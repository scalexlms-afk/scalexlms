import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const teamId = "team_r82C6S4pw5I3R4fZicSRFled";
const projects = [
  {
    id: "prj_uhyY8jsfWcdeHGrvUXcIoslUWnhh",
    name: "scalexlms-student",
    rootDirectory: "apps/student-portal",
    installCommand: "cd ../.. && pnpm install",
    buildCommand: "cd ../.. && pnpm turbo build --filter=student-portal",
  },
  {
    id: "prj_hDyS9TTxM8NaeLlyYALdjo8M5GZV",
    name: "scalexlms-admin",
    rootDirectory: "apps/admin-portal",
    installCommand: "cd ../.. && pnpm install",
    buildCommand: "cd ../.. && pnpm turbo build --filter=admin-portal",
  },
];

const token = execSync(
  'vercel project token scalexlms-student --scope scalexlms-6008s-projects',
  { encoding: "utf8" }
)
  .trim()
  .split(/\r?\n/)
  .pop()
  .trim();

async function patch(project) {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${project.id}?teamId=${teamId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rootDirectory: project.rootDirectory,
        installCommand: project.installCommand,
        buildCommand: project.buildCommand,
        framework: "nextjs",
      }),
    }
  );
  const text = await res.text();
  console.log(project.name, res.status, text.slice(0, 400));
}

for (const project of projects) {
  await patch(project);
}

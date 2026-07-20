import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const BASE = "http://localhost:3000";
const OUT = join(homedir(), "Desktop", "ScaleX Academy Tabs");
const EMAIL = "student@scalex.dev";
const PASSWORD = "ScaleXTest123!";

const TABS = [
  { name: "01-Dashboard", path: "/dashboard" },
  { name: "02-Continue-Learning", path: "/continue-learning" },
  { name: "03-Roadmap", path: "/roadmap" },
  { name: "04-Tasks", path: "/tasks" },
  { name: "05-Achievements", path: "/achievements" },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});
const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  localStorage.setItem("theme", "dark");
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("light");
});
await page.reload({ waitUntil: "networkidle" });

await page.getByLabel("Email").fill(EMAIL);
await page.getByLabel("Password").fill(PASSWORD);
await page.getByRole("button", { name: "Sign In" }).click();
await page.waitForURL((url) => !url.pathname.includes("/login"), {
  timeout: 30000,
});

for (const tab of TABS) {
  await page.goto(`${BASE}${tab.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // Hide Next.js dev overlay if present
  await page.evaluate(() => {
    document
      .querySelectorAll("nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog]")
      .forEach((el) => {
        el.style.display = "none";
      });
  });
  const file = join(OUT, `${tab.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
}

await browser.close();
console.log("DONE", OUT);

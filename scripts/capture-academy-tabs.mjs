import { chromium } from "playwright";
import { mkdirSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

const BASE = "http://localhost:3000";
const OUT = "C:\\Users\\hp\\Desktop\\ScaleX Academy Tabs";
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

for (const tab of TABS) {
  const file = join(OUT, `${tab.name}.png`);
  if (existsSync(file)) unlinkSync(file);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});

await context.addInitScript(() => {
  localStorage.setItem("theme", "dark");
  localStorage.setItem("scalex-sidebar-open", "1");
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("light");
});

const page = await context.newPage();
const session = await context.newCDPSession(page);
await session.send("Network.enable");
await session.send("Network.setCacheDisabled", { cacheDisabled: true });
await page.route("**/illustrations/**", async (route) => {
  const headers = {
    ...route.request().headers(),
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };
  await route.continue({ headers });
});

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });

await page.getByLabel("Email").fill(EMAIL);
await page.getByLabel("Password").fill(PASSWORD);
await Promise.all([
  page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 60000,
  }),
  page.getByRole("button", { name: "Sign In" }).click(),
]);

// Transparency proof against the live server asset.
const alphaProof = await page.evaluate(async () => {
  const url = `/illustrations/rocket-purple.png?v=rembg-v2&_=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, 0, 0);
  const corners = [
    ctx.getImageData(0, 0, 1, 1).data,
    ctx.getImageData(bmp.width - 1, 0, 1, 1).data,
    ctx.getImageData(0, bmp.height - 1, 1, 1).data,
    ctx.getImageData(bmp.width - 1, bmp.height - 1, 1, 1).data,
  ].map((d) => ({ r: d[0], g: d[1], b: d[2], a: d[3] }));
  return { status: res.status, type: blob.type, corners };
});
console.log("ILLUSTRATION_ALPHA_PROOF", JSON.stringify(alphaProof));
if (!alphaProof.corners.every((c) => c.a === 0)) {
  console.error("FAIL: illustration corners are not transparent — aborting capture");
  await browser.close();
  process.exit(1);
}

for (const tab of TABS) {
  await page.goto(`${BASE}${tab.path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.setItem("scalex-sidebar-open", "1");
  });
  const needsOpen = await page.evaluate(() => {
    return !!document.querySelector('[aria-label="Open sidebar"]');
  });
  if (needsOpen) {
    await page.getByRole("button", { name: "Open sidebar" }).click();
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document
      .querySelectorAll("nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog]")
      .forEach((el) => {
        el.style.display = "none";
      });
  });
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img[src*="/illustrations/"]')];
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
  });
  const file = join(OUT, `${tab.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved", file);
}

await browser.close();
console.log("DONE", OUT);

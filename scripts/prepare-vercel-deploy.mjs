import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

const paths = execSync("git ls-files", { encoding: "utf8" })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);

const binaryExt = new Set([".ico", ".png", ".jpg", ".jpeg", ".gif", ".webp"]);

const files = paths.map((file) => {
  const buf = readFileSync(file);
  const ext = extname(file).toLowerCase();
  if (binaryExt.has(ext)) {
    return {
      file: file.replace(/\\/g, "/"),
      data: buf.toString("base64"),
      encoding: "base64",
    };
  }
  return {
    file: file.replace(/\\/g, "/"),
    data: buf.toString("utf8"),
  };
});

const out = process.argv[2] || "vercel-deploy-files.json";
writeFileSync(out, JSON.stringify(files));
console.log(`Wrote ${files.length} files to ${out}`);

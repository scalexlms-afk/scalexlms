/**
 * Compress lecture videos in `scalex lecs` to H.264 1080p MP4.
 *
 * Run: node scripts/compress-lecture-videos.mjs
 * Optional: node scripts/compress-lecture-videos.mjs "C:\\path\\to\\scalex lecs"
 */
import { spawnSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { basename, dirname, extname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SRC = "C:\\Users\\hp\\Desktop\\scalex lecs";

const VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv"]);

/** @type {{ key: string, outName: string, match: (name: string) => boolean }[]} */
const MANIFEST = [
  {
    key: "01",
    outName: "01-lecture-1-business-models.mp4",
    match: (n) => /^lecture\s*1\b/i.test(n) && !/part/i.test(n),
  },
  {
    key: "02",
    outName: "02-lecture-2-7-factors.mp4",
    match: (n) => /^lecture\s*2\b/i.test(n),
  },
  {
    key: "03",
    outName: "03-lecture-3-jungle-scout.mp4",
    match: (n) => /^lecture\s*3\b/i.test(n),
  },
  {
    key: "04",
    outName: "04-lecture-4-safe-profitable.mp4",
    match: (n) => /^lecture\s*4\b/i.test(n),
  },
  {
    key: "05",
    outName: "05-lecture-5-suppliers.mp4",
    match: (n) => /^lecture[- ]?5\b/i.test(n),
  },
  {
    key: "06",
    outName: "06-lecture-6-rfqs.mp4",
    match: (n) => /^lecture\s*6\b/i.test(n),
  },
  {
    key: "07a",
    outName: "07a-lecture-7-part-1-sampling-qc.mp4",
    match: (n) => /lecture\s*7/i.test(n) && /part[- ]?1/i.test(n),
  },
  {
    key: "07b",
    outName: "07b-lecture-7-part-2-sampling-qc.mp4",
    match: (n) => /lecture\s*7/i.test(n) && /part[- ]?2/i.test(n),
  },
  {
    key: "08",
    outName: "08-lecture-8-branding-packaging.mp4",
    match: (n) => /^lecture\s*8\b/i.test(n),
  },
  {
    key: "09",
    outName: "09-lecture-9-keyword-seo.mp4",
    match: (n) => /^lecture\s*9\b/i.test(n),
  },
  {
    key: "10",
    outName: "10-lecture-10-titles-bullets.mp4",
    match: (n) => /^lecture\s*10\b/i.test(n),
  },
  {
    key: "11",
    outName: "11-lecture-11-images-a-plus.mp4",
    match: (n) => /^lecture\s*11\b/i.test(n),
  },
  {
    key: "12",
    outName: "12-lecture-12-pricing-fees.mp4",
    match: (n) => /^lecture\s*12\b/i.test(n),
  },
  {
    key: "13",
    outName: "13-lecture-13-ppc-fundamentals.mp4",
    match: (n) => /^lecture\s*13\b/i.test(n),
  },
  {
    key: "14",
    outName: "14-lecture-14-ppc-launch.mp4",
    match: (n) => /^lecture\s*14\b/i.test(n),
  },
  {
    key: "15",
    outName: "15-lecture-15-ppc-optimization.mp4",
    match: (n) => /^lecture\s*15\b/i.test(n),
  },
  {
    key: "16",
    outName: "16-lecture-16-reviews.mp4",
    match: (n) => /^lecture\s*16\b/i.test(n),
  },
  {
    key: "17",
    outName: "17-lecture-17-inventory-shipment.mp4",
    match: (n) => /^lecture\s*17\b/i.test(n),
  },
];

function resolveFfmpeg() {
  const which = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (which.status === 0) return "ffmpeg";

  const candidates = [
    resolve(
      __dirname,
      "../tools/ffmpeg/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
    ),
    join(
      process.env.LOCALAPPDATA ?? "",
      "Microsoft",
      "WinGet",
      "Links",
      "ffmpeg.exe"
    ),
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
    "C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe",
  ];

  for (const c of candidates) {
    if (c.endsWith("ffmpeg.exe") && existsSync(c)) return c;
  }

  // Search WinGet package tree for ffmpeg.exe
  const wingetPkgs = join(
    process.env.LOCALAPPDATA ?? "",
    "Microsoft",
    "WinGet",
    "Packages"
  );
  if (existsSync(wingetPkgs)) {
    const found = findFile(wingetPkgs, "ffmpeg.exe", 4);
    if (found) return found;
  }

  throw new Error(
    "ffmpeg not found on PATH. Install with: winget install Gyan.FFmpeg"
  );
}

function findFile(dir, name, depth) {
  if (depth < 0 || !existsSync(dir)) return null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isFile() && e.name.toLowerCase() === name.toLowerCase()) return p;
    if (e.isDirectory()) {
      const hit = findFile(p, name, depth - 1);
      if (hit) return hit;
    }
  }
  return null;
}

function listVideos(srcDir) {
  return readdirSync(srcDir)
    .filter((f) => VIDEO_EXTS.has(extname(f).toLowerCase()))
    .map((f) => join(srcDir, f));
}

function matchSources(srcDir) {
  const files = listVideos(srcDir);
  const pairs = [];
  const used = new Set();

  for (const item of MANIFEST) {
    const hit = files.find((p) => {
      const base = basename(p);
      return item.match(base) && !used.has(p);
    });
    if (!hit) {
      throw new Error(`Missing source for ${item.key}: pattern not found in ${srcDir}`);
    }
    used.add(hit);
    pairs.push({ ...item, src: hit });
  }

  return pairs;
}

function compressOne(ffmpeg, src, dest) {
  if (existsSync(dest)) {
    const s = statSync(dest);
    if (s.size > 1_000_000) {
      console.log(`SKIP (exists): ${basename(dest)} (${(s.size / 1e6).toFixed(1)} MB)`);
      return { skipped: true, dest };
    }
  }

  console.log(`ENCODE: ${basename(src)} → ${basename(dest)}`);
  const args = [
    "-y",
    "-i",
    src,
    "-vf",
    "scale=-2:'min(1080,ih)'",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    dest,
  ];

  const result = spawnSync(ffmpeg, args, {
    stdio: "inherit",
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${src} (exit ${result.status})`);
  }

  const size = statSync(dest).size;
  console.log(`DONE: ${basename(dest)} (${(size / 1e6).toFixed(1)} MB)`);
  return { skipped: false, dest, size };
}

function main() {
  const srcDir = resolve(process.argv[2] ?? DEFAULT_SRC);
  if (!existsSync(srcDir)) {
    throw new Error(`Source folder not found: ${srcDir}`);
  }

  const outDir = join(srcDir, "compressed");
  mkdirSync(outDir, { recursive: true });

  const ffmpeg = resolveFfmpeg();
  console.log(`ffmpeg: ${ffmpeg}`);
  console.log(`source: ${srcDir}`);
  console.log(`output: ${outDir}`);

  const pairs = matchSources(srcDir);
  const report = [];

  for (const p of pairs) {
    const dest = join(outDir, p.outName);
    const result = compressOne(ffmpeg, p.src, dest);
    report.push({
      key: p.key,
      src: p.src,
      dest,
      skipped: result.skipped,
      bytes: existsSync(dest) ? statSync(dest).size : 0,
    });
  }

  const reportPath = join(outDir, "compress-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      { compressedAt: new Date().toISOString(), items: report },
      null,
      2
    )
  );

  console.log(`\nCompressed ${report.length} videos.`);
  console.log(`Report: ${reportPath}`);
}

main();

/**
 * Upload original lecture videos to Supabase lesson-media and wire lessons.
 * Lecture 7 becomes Part 1 + Part 2 (insert sibling lesson).
 * No compression — uploads masters from the source folder.
 *
 * Run: node scripts/upload-lecture-videos.mjs
 * Optional: node scripts/upload-lecture-videos.mjs "C:\\path\\to\\scalex lecs"
 */
import { createRequire } from "module";
import {
  createReadStream,
  existsSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";

const require = createRequire(import.meta.url);
const { createClient } = require(
  "../apps/student-portal/node_modules/@supabase/supabase-js"
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const COURSE_TITLE = "Amazon FBA Private Label Mastery";
const BUCKET = "lesson-media";
const DEFAULT_SRC = "C:\\Users\\hp\\Desktop\\scalex lecs";

/** Original filename matcher → lesson wiring + storage object name */
const VIDEO_MAP = [
  {
    storageFile: "01-lecture-1-business-models.mp4",
    lectureNum: 1,
    title: "Lecture 1 - Business Models",
    part: null,
    match: (n) => /^lecture\s*1\b/i.test(n) && !/part/i.test(n),
  },
  {
    storageFile: "02-lecture-2-7-factors.mp4",
    lectureNum: 2,
    title: "Lecture 2 - Private Label Foundations & The 7 Factors Method",
    part: null,
    match: (n) => /^lecture\s*2\b/i.test(n),
  },
  {
    storageFile: "03-lecture-3-jungle-scout.mp4",
    lectureNum: 3,
    title: "Lecture 3 - Product Research with Jungle Scout",
    part: null,
    match: (n) => /^lecture\s*3\b/i.test(n),
  },
  {
    storageFile: "04-lecture-4-safe-profitable.mp4",
    lectureNum: 4,
    title: "Lecture 4 - Ensuring Safe and Profitable Private Label Products",
    part: null,
    match: (n) => /^lecture\s*4\b/i.test(n),
  },
  {
    storageFile: "05-lecture-5-suppliers.mp4",
    lectureNum: 5,
    title: "Lecture 5 - Finding the Right Suppliers for Private Label FBA",
    part: null,
    match: (n) => /^lecture[- ]?5\b/i.test(n),
  },
  {
    storageFile: "06-lecture-6-rfqs.mp4",
    lectureNum: 6,
    title: "Lecture 6 - RFQs & Negotiations",
    part: null,
    match: (n) => /^lecture\s*6\b/i.test(n),
  },
  {
    storageFile: "07a-lecture-7-part-1-sampling-qc.mp4",
    lectureNum: 7,
    title: "Lecture 7 (Part 1) - Sampling and Quality Control",
    part: 1,
    match: (n) => /lecture\s*7/i.test(n) && /part[- ]?1/i.test(n),
  },
  {
    storageFile: "07b-lecture-7-part-2-sampling-qc.mp4",
    lectureNum: 7,
    title: "Lecture 7 (Part 2) - Sampling and Quality Control",
    part: 2,
    match: (n) => /lecture\s*7/i.test(n) && /part[- ]?2/i.test(n),
  },
  {
    storageFile: "08-lecture-8-branding-packaging.mp4",
    lectureNum: 8,
    title: "Lecture 8 - Branding & Packaging",
    part: null,
    match: (n) => /^lecture\s*8\b/i.test(n),
  },
  {
    storageFile: "09-lecture-9-keyword-seo.mp4",
    lectureNum: 9,
    title: "Lecture 9 - Keyword Research and SEO",
    part: null,
    match: (n) => /^lecture\s*9\b/i.test(n),
  },
  {
    storageFile: "10-lecture-10-titles-bullets.mp4",
    lectureNum: 10,
    title: "Lecture 10 - Writing Titles, Bullets & Descriptions",
    part: null,
    match: (n) => /^lecture\s*10\b/i.test(n),
  },
  {
    storageFile: "11-lecture-11-images-a-plus.mp4",
    lectureNum: 11,
    title: "Lecture 11 - Product Images & A+ Content",
    part: null,
    match: (n) => /^lecture\s*11\b/i.test(n),
  },
  {
    storageFile: "12-lecture-12-pricing-fees.mp4",
    lectureNum: 12,
    title: "Lecture 12 - Pricing & Fees",
    part: null,
    match: (n) => /^lecture\s*12\b/i.test(n),
  },
  {
    storageFile: "13-lecture-13-ppc-fundamentals.mp4",
    lectureNum: 13,
    title: "Lecture 13 - PPC Fundamentals",
    part: null,
    match: (n) => /^lecture\s*13\b/i.test(n),
  },
  {
    storageFile: "14-lecture-14-ppc-launch.mp4",
    lectureNum: 14,
    title: "Lecture 14 - PPC Launch Strategy",
    part: null,
    match: (n) => /^lecture\s*14\b/i.test(n),
  },
  {
    storageFile: "15-lecture-15-ppc-optimization.mp4",
    lectureNum: 15,
    title: "Lecture 15 - PPC Optimization & Analytics",
    part: null,
    match: (n) => /^lecture\s*15\b/i.test(n),
  },
  {
    storageFile: "16-lecture-16-reviews.mp4",
    lectureNum: 16,
    title: "Lecture 16 - Reviews & Early Momentum",
    part: null,
    match: (n) => /^lecture\s*16\b/i.test(n),
  },
  {
    storageFile: "17-lecture-17-inventory-shipment.mp4",
    lectureNum: 17,
    title: "Lecture 17 - Inventory & Shipment Management",
    part: null,
    match: (n) => /^lecture\s*17\b/i.test(n),
  },
];

function loadEnv() {
  const paths = [
    resolve(root, "apps/student-portal/.env.local"),
    resolve(root, "apps/admin-portal/.env.local"),
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
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, eq).trim()] = val;
    }
  }
  return env;
}

function listSourceVideos(srcDir) {
  const { readdirSync } = require("fs");
  return readdirSync(srcDir)
    .filter((f) => /\.(mp4|mov|m4v|webm|mkv)$/i.test(f))
    .map((f) => join(srcDir, f));
}

function resolveSources(srcDir) {
  const files = listSourceVideos(srcDir);
  const used = new Set();
  return VIDEO_MAP.map((item) => {
    const hit = files.find((p) => item.match(basename(p)) && !used.has(p));
    if (!hit) {
      throw new Error(`Missing source for ${item.storageFile} in ${srcDir}`);
    }
    used.add(hit);
    return { ...item, localPath: hit };
  });
}

async function fetchLectureLessons(supabase, courseId) {
  const { data: milestones, error: msErr } = await supabase
    .from("milestones")
    .select("id, title, order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (msErr) throw new Error(msErr.message);

  const lessons = [];
  for (const ms of milestones ?? []) {
    const { data: modules, error: modErr } = await supabase
      .from("modules")
      .select("id, title, order_index")
      .eq("milestone_id", ms.id)
      .order("order_index", { ascending: true });
    if (modErr) throw new Error(modErr.message);

    for (const mod of modules ?? []) {
      const { data: rows, error: lesErr } = await supabase
        .from("lessons")
        .select(
          "id, title, content_text, content_type, content_url, order_index, module_id"
        )
        .eq("module_id", mod.id)
        .order("order_index", { ascending: true });
      if (lesErr) throw new Error(lesErr.message);

      for (const lesson of rows ?? []) {
        lessons.push({
          ...lesson,
          milestone_title: ms.title,
          module_title: mod.title,
        });
      }
    }
  }
  return lessons;
}

function findLecture7Base(lessons) {
  return lessons.find(
    (l) => /^Lecture\s*7\b/i.test(l.title) && !/Part\s*2/i.test(l.title)
  );
}

function contentTypeFor(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

/**
 * Stream upload via signed URL to avoid loading multi-GB files into RAM.
 */
async function uploadFile(supabase, localPath, storagePath) {
  const size = statSync(localPath).size;
  const contentType = contentTypeFor(localPath);
  console.log(
    `UPLOAD ${(size / 1e6).toFixed(1)} MB → ${storagePath} (${basename(localPath)})`
  );

  // Remove existing object so signed upload can succeed on re-runs
  await supabase.storage.from(BUCKET).remove([storagePath]);

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: true });

  if (signErr || !signed?.signedUrl) {
    // Fallback: standard upload with File/Blob for smaller files
    if (size > 200 * 1024 * 1024) {
      throw new Error(
        `Signed upload URL failed (${signErr?.message ?? "no url"}) and file is too large for buffer fallback`
      );
    }
    const buffer = readFileSync(localPath);
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });
    if (error) throw new Error(`Upload failed ${storagePath}: ${error.message}`);
    return storagePath;
  }

  const nodeStream = createReadStream(localPath);
  const webStream = Readable.toWeb(nodeStream);

  const res = await fetch(signed.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: webStream,
    duplex: "half",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `PUT upload failed ${storagePath}: ${res.status} ${res.statusText} ${text}`
    );
  }

  return storagePath;
}

async function ensureLecture7Part2(supabase, part1Lesson) {
  const { data: existingPart2 } = await supabase
    .from("lessons")
    .select("id, title, order_index, module_id, content_text")
    .eq("module_id", part1Lesson.module_id)
    .ilike("title", "%Lecture 7 (Part 2)%")
    .maybeSingle();

  if (existingPart2) return existingPart2;

  const nextOrder = part1Lesson.order_index + 1;

  const { data: siblings, error: sibErr } = await supabase
    .from("lessons")
    .select("id, order_index")
    .eq("module_id", part1Lesson.module_id)
    .gte("order_index", nextOrder)
    .order("order_index", { ascending: false });
  if (sibErr) throw new Error(sibErr.message);

  for (const s of siblings ?? []) {
    const { error } = await supabase
      .from("lessons")
      .update({ order_index: s.order_index + 1 })
      .eq("id", s.id);
    if (error) throw new Error(`Bump order failed: ${error.message}`);
  }

  const { data: inserted, error: insErr } = await supabase
    .from("lessons")
    .insert({
      module_id: part1Lesson.module_id,
      title: "Lecture 7 (Part 2) - Sampling and Quality Control",
      content_type: "video",
      content_text: part1Lesson.content_text,
      content_url: null,
      order_index: nextOrder,
    })
    .select("id, title, order_index, module_id, content_text")
    .single();

  if (insErr) throw new Error(`Insert Part 2 failed: ${insErr.message}`);
  console.log(`Created Lesson 7 Part 2: ${inserted.id}`);
  return inserted;
}

async function main() {
  const srcDir = resolve(process.argv[2] ?? DEFAULT_SRC);
  if (!existsSync(srcDir)) {
    throw new Error(`Source folder not found: ${srcDir}`);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, title")
    .eq("title", COURSE_TITLE)
    .eq("status", "published")
    .maybeSingle();
  if (courseErr) throw new Error(courseErr.message);
  if (!course) throw new Error(`Course not found: ${COURSE_TITLE}`);

  let lessons = await fetchLectureLessons(supabase, course.id);
  console.log(`Course ${course.id}: ${lessons.length} lessons`);
  console.log(`Source: ${srcDir}`);

  const sources = resolveSources(srcDir);
  console.log(`Matched ${sources.length} original videos`);

  const l7Base = findLecture7Base(lessons);
  if (!l7Base) throw new Error("Could not find Lecture 7 lesson to split");

  const { error: renameErr } = await supabase
    .from("lessons")
    .update({
      title: "Lecture 7 (Part 1) - Sampling and Quality Control",
    })
    .eq("id", l7Base.id);
  if (renameErr) throw new Error(renameErr.message);

  l7Base.title = "Lecture 7 (Part 1) - Sampling and Quality Control";
  await ensureLecture7Part2(supabase, l7Base);
  lessons = await fetchLectureLessons(supabase, course.id);

  const report = [];

  for (const item of sources) {
    const storagePath = `lectures/${course.id}/${item.storageFile}`;

    let lesson;
    if (item.part === 1) {
      lesson = lessons.find((l) => /Lecture\s*7\s*\(Part\s*1\)/i.test(l.title));
    } else if (item.part === 2) {
      lesson = lessons.find((l) => /Lecture\s*7\s*\(Part\s*2\)/i.test(l.title));
    } else {
      const exact = lessons.find((l) => l.title === item.title);
      if (exact) {
        lesson = exact;
      } else {
        lesson = lessons.find((l) => {
          const m = l.title.match(/^Lecture\s*(\d+)\b/i);
          return (
            m &&
            Number(m[1]) === item.lectureNum &&
            !/Part\s*2/i.test(l.title)
          );
        });
      }
    }

    if (!lesson) {
      throw new Error(`No lesson row for ${item.title}`);
    }

    // Resume-friendly: skip if already wired to this storage path
    if (
      lesson.content_type === "video" &&
      lesson.content_url === storagePath
    ) {
      console.log(`SKIP (already wired): ${item.title}`);
      report.push({
        local: item.localPath,
        file: item.storageFile,
        lessonId: lesson.id,
        title: item.title,
        storagePath,
        bytes: statSync(item.localPath).size,
        skipped: true,
      });
      continue;
    }

    await uploadFile(supabase, item.localPath, storagePath);

    const { error: updErr } = await supabase
      .from("lessons")
      .update({
        title: item.title,
        content_type: "video",
        content_url: storagePath,
      })
      .eq("id", lesson.id);

    if (updErr) {
      throw new Error(`Lesson update failed ${lesson.id}: ${updErr.message}`);
    }

    // refresh local cache for subsequent skip checks
    lesson.content_type = "video";
    lesson.content_url = storagePath;

    report.push({
      local: item.localPath,
      file: item.storageFile,
      lessonId: lesson.id,
      title: item.title,
      storagePath,
      bytes: statSync(item.localPath).size,
      skipped: false,
    });
    console.log(`WIRED: ${item.title}`);
  }

  const reportPath = join(srcDir, "upload-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        courseId: course.id,
        uploadedAt: new Date().toISOString(),
        mode: "originals-no-compress",
        items: report,
      },
      null,
      2
    )
  );

  console.log(`\nUploaded & wired ${report.length} original videos.`);
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

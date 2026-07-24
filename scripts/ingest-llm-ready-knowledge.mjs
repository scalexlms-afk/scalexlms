/**
 * Ingest llm-ready lecture markdown into published course lessons.content_text
 * so AI Mentor FTS (search_lessons_context) can ground answers.
 *
 * Run: node scripts/ingest-llm-ready-knowledge.mjs
 * Optional: node scripts/ingest-llm-ready-knowledge.mjs "C:\\path\\to\\llm-ready"
 */
import { createRequire } from "module";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  readdirSync,
} from "fs";
import { resolve, dirname, join, basename } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { createClient } = require(
  "../apps/student-portal/node_modules/@supabase/supabase-js"
);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const MAX_CHARS = 100_000;
const COURSE_TITLE = "Amazon FBA Private Label Mastery";

const DEFAULT_LLM_READY = "C:\\Users\\hp\\Desktop\\pdfs\\llm-ready";
const EXTRA_LECTURES = [
  {
    lecture: 3,
    src: "C:\\Users\\hp\\Downloads\\Lecture 3 - Product Research with Jungle Scout.md",
    destName: "Lecture-3-Product-Research-with-Jungle-Scout.md",
    title: "Lecture 3 - Product Research with Jungle Scout",
  },
  {
    lecture: 6,
    src: "C:\\Users\\hp\\Downloads\\Lecture 6 - RFQs & Negotiations.md",
    destName: "Lecture-6-RFQs-and-Negotiations.md",
    title: "Lecture 6 - RFQs & Negotiations",
  },
];

/** Preferred milestone for each lecture (semantic map). */
const LECTURE_MILESTONE = {
  1: "Foundation",
  2: "Product Hunting",
  3: "Product Hunting",
  4: "Product Hunting",
  5: "Sourcing",
  6: "Sourcing",
  7: "Sourcing",
  8: "Brand Development",
  9: "Brand Development",
  10: "Brand Development",
  11: "Brand Development",
  12: "Launch",
  13: "Launch",
  14: "Launch",
  15: "Launch",
  16: "Launch",
  17: "Scaling",
};

const LECTURE_TITLES = {
  1: "Lecture 1 - Business Models",
  2: "Lecture 2 - Private Label Foundations & The 7 Factors Method",
  3: "Lecture 3 - Product Research with Jungle Scout",
  4: "Lecture 4 - Ensuring Safe and Profitable Private Label Products",
  5: "Lecture 5 - Finding the Right Suppliers for Private Label FBA",
  6: "Lecture 6 - RFQs & Negotiations",
  7: "Lecture 7 - Sampling and Quality Control",
  8: "Lecture 8 - Branding & Packaging",
  9: "Lecture 9 - Keyword Research and SEO",
  10: "Lecture 10 - Writing Titles, Bullets & Descriptions",
  11: "Lecture 11 - Product Images & A+ Content",
  12: "Lecture 12 - Pricing & Fees",
  13: "Lecture 13 - PPC Fundamentals",
  14: "Lecture 14 - PPC Launch Strategy",
  15: "Lecture 15 - PPC Optimization & Analytics",
  16: "Lecture 16 - Reviews & Early Momentum",
  17: "Lecture 17 - Inventory & Shipment Management",
};

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

function stripFrontmatter(md) {
  if (!md.startsWith("---")) return md;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return md;
  return md.slice(end + 4).replace(/^\s+/, "");
}

function cleanOcrNoise(md) {
  return md
    .replace(/^scaLEX logo\s*$/gim, "")
    .replace(/^scaLEx logo\s*$/gim, "")
    .replace(/^Isometric illustration[^\n]*$/gim, "")
    .replace(/^An isometric illustration[^\n]*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function capText(text) {
  if (text.length <= MAX_CHARS) return text;
  return `${text.slice(0, MAX_CHARS)}\n\n[Content truncated for AI index limit]`;
}

function parseLectureNumber(filename) {
  const m = basename(filename).match(/^Lecture[- ](\d+)/i);
  return m ? Number(m[1]) : null;
}

function findLectureFile(dir, lectureNum) {
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".md"));
  const hit = files.find((f) => parseLectureNumber(f) === lectureNum);
  return hit ? join(dir, hit) : null;
}

function ensureExtraLectures(llmReadyDir) {
  for (const extra of EXTRA_LECTURES) {
    const dest = join(llmReadyDir, extra.destName);
    if (!existsSync(extra.src)) {
      if (existsSync(dest)) {
        console.log(`Using existing ${extra.destName}`);
        continue;
      }
      throw new Error(`Missing lecture ${extra.lecture} source: ${extra.src}`);
    }
    copyFileSync(extra.src, dest);
    console.log(`Copied Lecture ${extra.lecture} → ${dest}`);
  }
}

function loadLectureBodies(llmReadyDir) {
  const bodies = new Map();
  for (let n = 1; n <= 17; n++) {
    const path = findLectureFile(llmReadyDir, n);
    if (!path) {
      throw new Error(`Missing Lecture ${n} markdown in ${llmReadyDir}`);
    }
    const raw = readFileSync(path, "utf8");
    const body = capText(cleanOcrNoise(stripFrontmatter(raw)));
    bodies.set(n, { path, body, chars: body.length });
  }
  return bodies;
}

function loadTemplate(llmReadyDir, name) {
  const path = join(llmReadyDir, name);
  if (!existsSync(path)) return null;
  return capText(cleanOcrNoise(stripFrontmatter(readFileSync(path, "utf8"))));
}

async function fetchCourseLessons(supabase) {
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, title, status")
    .eq("title", COURSE_TITLE)
    .eq("status", "published")
    .maybeSingle();

  if (courseErr) throw new Error(courseErr.message);
  if (!course) throw new Error(`Published course not found: ${COURSE_TITLE}`);

  const { data: milestones, error: msErr } = await supabase
    .from("milestones")
    .select("id, title, order_index")
    .eq("course_id", course.id)
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
        .select("id, title, content_text, order_index, module_id")
        .eq("module_id", mod.id)
        .order("order_index", { ascending: true });
      if (lesErr) throw new Error(lesErr.message);

      for (const lesson of rows ?? []) {
        lessons.push({
          ...lesson,
          milestone_title: ms.title,
          milestone_order: ms.order_index,
          module_title: mod.title,
        });
      }
    }
  }

  return { course, lessons };
}

/** When preferred milestone is full, try related milestones before leftovers. */
const MILESTONE_FALLBACKS = {
  Foundation: [
    "Business Setup",
    "Brand Research",
    "Product Hunting",
    "Sourcing",
    "Brand Development",
    "Launch",
    "Scaling",
  ],
  "Product Hunting": [
    "Brand Research",
    "Sourcing",
    "Foundation",
    "Business Setup",
    "Launch",
    "Brand Development",
    "Scaling",
  ],
  Sourcing: [
    "Product Hunting",
    "Brand Research",
    "Brand Development",
    "Business Setup",
    "Launch",
    "Foundation",
    "Scaling",
  ],
  "Brand Development": [
    "Brand Research",
    "Launch",
    "Product Hunting",
    "Business Setup",
    "Sourcing",
    "Foundation",
    "Scaling",
  ],
  Launch: [
    "Scaling",
    "Brand Development",
    "Brand Research",
    "Product Hunting",
    "Sourcing",
    "Business Setup",
    "Foundation",
  ],
  Scaling: [
    "Launch",
    "Brand Development",
    "Brand Research",
    "Sourcing",
    "Product Hunting",
    "Business Setup",
    "Foundation",
  ],
};

function pickLessonSlot(unused, preferred) {
  let idx = unused.findIndex((l) => l.milestone_title === preferred);
  if (idx !== -1) return idx;
  for (const fb of MILESTONE_FALLBACKS[preferred] ?? []) {
    idx = unused.findIndex((l) => l.milestone_title === fb);
    if (idx !== -1) return idx;
  }
  return 0;
}

function assignLessons(lessons) {
  if (lessons.length < 17) {
    throw new Error(
      `Expected at least 17 lessons on published course, found ${lessons.length}`
    );
  }

  const unused = [...lessons];
  const byLecture = new Map();
  const pending = [];

  // Pass 1: fill preferred milestones only (capacity-limited).
  for (let n = 1; n <= 17; n++) {
    const preferred = LECTURE_MILESTONE[n];
    const idx = unused.findIndex((l) => l.milestone_title === preferred);
    if (idx === -1) {
      pending.push(n);
      continue;
    }
    const lesson = unused.splice(idx, 1)[0];
    byLecture.set(n, {
      lecture: n,
      title: LECTURE_TITLES[n],
      lesson,
      preferredMilestone: preferred,
      matchedPreferred: true,
    });
  }

  // Pass 2: overflow into related leftover slots.
  for (const n of pending) {
    const preferred = LECTURE_MILESTONE[n];
    const idx = pickLessonSlot(unused, preferred);
    const lesson = unused.splice(idx, 1)[0];
    byLecture.set(n, {
      lecture: n,
      title: LECTURE_TITLES[n],
      lesson,
      preferredMilestone: preferred,
      matchedPreferred: lesson.milestone_title === preferred,
    });
  }

  return Array.from({ length: 17 }, (_, i) => byLecture.get(i + 1));
}

async function main() {
  const llmReadyDir = resolve(process.argv[2] ?? DEFAULT_LLM_READY);
  if (!existsSync(llmReadyDir)) {
    throw new Error(`llm-ready folder not found: ${llmReadyDir}`);
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

  console.log(`Source: ${llmReadyDir}`);
  ensureExtraLectures(llmReadyDir);
  const bodies = loadLectureBodies(llmReadyDir);
  const productsTemplate = loadTemplate(
    llmReadyDir,
    "Updated-Products-Template.md"
  );
  const supplierFilter = loadTemplate(llmReadyDir, "Supplier-FilterOut.md");

  const { course, lessons } = await fetchCourseLessons(supabase);
  console.log(
    `Course: ${course.title} (${course.id}) — ${lessons.length} lessons`
  );

  const assignments = assignLessons(lessons);
  const report = [];

  for (const a of assignments) {
    let content = bodies.get(a.lecture).body;

    // Append templates to best-fit lessons
    if (a.lecture === 2 && productsTemplate) {
      content = `${content}\n\n--- Resource: Updated Products Template ---\n\n${productsTemplate}`;
      content = capText(content);
    }
    if (a.lecture === 5 && supplierFilter) {
      content = `${content}\n\n--- Resource: Supplier FilterOut ---\n\n${supplierFilter}`;
      content = capText(content);
    }

    const { error } = await supabase
      .from("lessons")
      .update({
        title: a.title,
        content_text: content,
      })
      .eq("id", a.lesson.id);

    if (error) {
      throw new Error(
        `Failed updating lesson ${a.lesson.id} (L${a.lecture}): ${error.message}`
      );
    }

    report.push({
      lecture: a.lecture,
      title: a.title,
      lessonId: a.lesson.id,
      previousTitle: a.lesson.title,
      milestone: a.lesson.milestone_title,
      preferredMilestone: a.preferredMilestone,
      matchedPreferred: a.matchedPreferred,
      chars: content.length,
    });

    console.log(
      `L${String(a.lecture).padStart(2, "0")} → [${a.lesson.milestone_title}] ${a.title} (${content.length} chars)${a.matchedPreferred ? "" : " [fallback slot]"}`
    );
  }

  const reportPath = join(llmReadyDir, "ingest-report.json");
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        courseId: course.id,
        courseTitle: course.title,
        ingestedAt: new Date().toISOString(),
        lectures: report,
      },
      null,
      2
    )
  );

  console.log(`\nIngested ${report.length}/17 lectures.`);
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

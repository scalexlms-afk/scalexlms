"use client";

import { useMemo, useState } from "react";
import { planLabel } from "@scalex/db";

type StudentOption = {
  id: string;
  name: string;
  email: string;
  plan: string | null;
};

export function SessionAudiencePicker({
  students,
}: {
  students: StudentOption[];
}) {
  const [audience, setAudience] = useState<"all_premium" | "selected">(
    "all_premium"
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.plan ?? "").toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div className="sm:col-span-2 space-y-3 rounded-xl border border-line bg-surface-3 p-4">
      <p className="text-sm font-medium text-foreground">Audience</p>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="audience"
            value="all_premium"
            checked={audience === "all_premium"}
            onChange={() => setAudience("all_premium")}
          />
          All Premium students
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="audience"
            value="selected"
            checked={audience === "selected"}
            onChange={() => setAudience("selected")}
          />
          Selected students
        </label>
      </div>

      {audience === "selected" && (
        <div className="space-y-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-line bg-surface p-2">
            {filtered.length === 0 ? (
              <p className="p-2 text-xs text-muted">No students found.</p>
            ) : (
              filtered.map((student) => (
                <label
                  key={student.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-surface-3"
                >
                  <input
                    type="checkbox"
                    name="studentIds"
                    value={student.id}
                    className="mt-1"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {student.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {student.email} · {planLabel(student.plan, true)}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-subtle">
            Select at least one student for invite-only sessions.
          </p>
        </div>
      )}
    </div>
  );
}

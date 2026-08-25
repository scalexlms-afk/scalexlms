"use client";

import { useMemo, useState } from "react";
import { inputClasses } from "@/components/field";

export type CourseAttachOption = {
  id: string;
  title: string;
  milestones: Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string }>;
  }>;
};

export function ResourceTargetFields({
  courses,
  defaultCourseId = "",
  defaultMilestoneId = "",
  defaultLessonId = "",
}: {
  courses: CourseAttachOption[];
  defaultCourseId?: string;
  defaultMilestoneId?: string;
  defaultLessonId?: string;
}) {
  const [courseId, setCourseId] = useState(defaultCourseId);
  const [milestoneId, setMilestoneId] = useState(defaultMilestoneId);
  const [lessonId, setLessonId] = useState(defaultLessonId);

  const course = useMemo(
    () => courses.find((c) => c.id === courseId) ?? null,
    [courses, courseId]
  );
  const milestone = useMemo(
    () => course?.milestones.find((m) => m.id === milestoneId) ?? null,
    [course, milestoneId]
  );

  return (
    <>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Course (optional)
        </label>
        <select
          name="courseId"
          className={inputClasses}
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value);
            setMilestoneId("");
            setLessonId("");
          }}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Milestone (optional)
        </label>
        <select
          name="milestoneId"
          className={inputClasses}
          value={milestoneId}
          disabled={!course}
          onChange={(e) => {
            setMilestoneId(e.target.value);
            setLessonId("");
          }}
        >
          <option value="">Whole course</option>
          {(course?.milestones ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Lesson (optional)
        </label>
        <select
          name="lessonId"
          className={inputClasses}
          value={lessonId}
          disabled={!milestone}
          onChange={(e) => setLessonId(e.target.value)}
        >
          <option value="">Whole milestone</option>
          {(milestone?.lessons ?? []).map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

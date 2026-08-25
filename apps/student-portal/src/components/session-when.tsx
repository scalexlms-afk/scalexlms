"use client";

import { formatSessionDateTime } from "@/lib/sessions-shared";

export function SessionWhen({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return <span className={className}>{formatSessionDateTime(value)}</span>;
}

export const siteUrl =
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "https://www.scalexlms.com";

export const siteName = "ScaleX LaunchPad";

export const siteTagline = "Learn. Build. Launch. Grow.";

export const siteDescription =
  "ScaleX LaunchPad is an AI-powered Amazon FBA private label academy. Follow an 8-milestone roadmap from beginner to launched seller with mentor validation, task submissions, and measurable progress.";

export const defaultTitle =
  "ScaleX LaunchPad — Amazon FBA Private Label Education";

/**
 * Guards against open-redirect attacks. Only allows same-origin relative paths
 * (starting with a single "/"), rejecting absolute URLs, protocol-relative
 * ("//evil.com") and backslash tricks. Falls back to `fallback` otherwise.
 */
export function safeRelativePath(
  path: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!path) return fallback;
  // Must start with exactly one forward slash and not be protocol-relative.
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  // Reject backslashes and control characters that browsers may normalise.
  if (path.includes("\\") || /[\x00-\x1f]/.test(path)) return fallback;
  return path;
}

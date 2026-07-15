import { llmsTxtManifest } from "@/lib/ai-visibility";

export function GET() {
  return new Response(llmsTxtManifest(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

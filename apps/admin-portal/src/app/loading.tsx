export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-line border-t-scalex-red" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}

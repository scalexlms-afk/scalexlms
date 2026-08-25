export function CertificateDesignPreview({
  studentName = "Alex Morgan",
  courseTitle = "ScaleX Launch Program",
  issuedLabel = "August 25, 2026",
}: {
  studentName?: string;
  courseTitle?: string;
  issuedLabel?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <div
        className="relative mx-auto aspect-[841/595] w-full max-w-3xl rounded-sm border-[3px] border-[#E31E24] bg-[#FCF9F4] p-4 text-[#16161A] shadow-sm"
        aria-label="Issued ScaleX certificate design preview"
      >
        <div className="flex h-full flex-col items-center justify-between border border-[#B89447] px-6 py-5">
          <div className="w-full">
            <div className="mb-3 h-2 w-full bg-[#E31E24]" />
            <p className="text-center text-[10px] font-bold tracking-[0.28em] text-[#E31E24]">
              SCALEX LAUNCHPAD
            </p>
            <p className="mt-1 text-center text-[11px] italic text-[#6B6B73]">
              Learn. Build. Launch. Grow.
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-serif text-2xl font-bold md:text-3xl">
              Certificate of Completion
            </h3>
            <p className="mt-3 text-xs text-[#6B6B73]">This certifies that</p>
            <p className="mt-2 font-serif text-xl font-bold md:text-2xl">
              {studentName}
            </p>
            <div className="mx-auto mt-2 h-px w-40 bg-[#B4181D]" />
            <p className="mt-3 text-xs text-[#6B6B73]">
              has successfully completed
            </p>
            <p className="mt-2 font-serif text-lg italic">{courseTitle}</p>
            <p className="mt-2 text-[11px] text-[#6B6B73]">
              and has met the ScaleX LaunchPad milestone standard.
            </p>
          </div>
          <div className="flex w-full items-end justify-between text-[10px] text-[#6B6B73]">
            <p>Issued {issuedLabel}</p>
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E31E24] text-[10px] font-bold text-[#E31E24]">
                SX
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1 h-px w-28 bg-[#C8C4BE]" />
              <p>Director of Training</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  showMark?: boolean;
  className?: string;
}

const wordSize = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

const markSize = {
  sm: 20,
  md: 26,
  lg: 40,
};

function LogoMark({ px }: { px: number }) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 6L38 26H29V34H19V26H10L24 6Z"
        fill="var(--color-scalex-red)"
      />
      <path
        d="M10 38C16 43 32 43 38 38"
        stroke="var(--color-scalex-white)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M36 36.5L39 38.5L37 41"
        stroke="var(--color-scalex-white)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  size = "md",
  showTagline = false,
  showMark = true,
  className = "",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showMark && (
        <span className="shrink-0">
          <LogoMark px={markSize[size]} />
        </span>
      )}
      <div className="leading-none">
        <p className={`font-display font-bold tracking-tight ${wordSize[size]}`}>
          scale<span className="text-scalex-red">X</span>
        </p>
        {showTagline && (
          <p className="mt-1 text-xs text-text-secondary-dark">
            Learn. Build. Launch. Grow.
          </p>
        )}
      </div>
    </div>
  );
}

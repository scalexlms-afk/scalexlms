interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  showMark?: boolean;
  className?: string;
}

const logoSize = {
  sm: "h-[3.25rem] w-[4.7rem]",
  md: "h-[4.5rem] w-[6.5rem]",
  lg: "h-24 w-[8.7rem]",
};

export function Logo({
  size = "md",
  showTagline = false,
  showMark = true,
  className = "",
}: LogoProps) {
  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      {showMark && (
        <img
          src="/scalex-logo.png"
          alt="ScaleX"
          className={`${logoSize[size]} shrink-0 object-contain`}
        />
      )}
      {showTagline && (
        <p className="mt-1.5 whitespace-nowrap text-xs text-muted">
          Learn. Build. Launch. Grow.
        </p>
      )}
    </div>
  );
}

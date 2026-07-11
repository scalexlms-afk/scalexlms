interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  className = "",
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="text-text-secondary-dark">{label}</span>
          )}
          {showPercent && (
            <span className="font-medium text-text-primary-dark">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full origin-left animate-grow-x rounded-full bg-gradient-to-r from-scalex-red-dark to-scalex-red shadow-[0_0_12px_-2px_rgba(227,30,36,0.6)] transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

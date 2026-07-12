import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClasses =
  "w-full rounded-lg border border-line bg-surface-3 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-scalex-red focus:ring-2 focus:ring-scalex-red/20";

export function Field({
  label,
  name,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-muted"
      >
        {label}
      </label>
      <input id={name} name={name} className={inputClasses} {...props} />
    </div>
  );
}

export function TextArea({
  label,
  name,
  rows = 3,
  ...props
}: {
  label: string;
  name: string;
  rows?: number;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-muted"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className={`${inputClasses} resize-y`}
        {...props}
      />
    </div>
  );
}

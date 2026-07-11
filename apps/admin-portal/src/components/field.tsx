import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClasses =
  "w-full rounded-lg border border-white/10 bg-scalex-charcoal-alt px-3.5 py-2.5 text-sm text-text-primary-dark placeholder:text-text-tertiary-dark outline-none transition-colors focus:border-scalex-red focus:ring-2 focus:ring-scalex-red/20";

export function Field({
  label,
  name,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-text-secondary-dark"
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
        className="mb-1.5 block text-sm font-medium text-text-secondary-dark"
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

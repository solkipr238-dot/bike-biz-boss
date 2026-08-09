import type { ReactNode } from "react";
import { formatAmountInput, parseAmountInput, toFa } from "@/lib/format";
import type { Currency } from "@/lib/format";

export function Field({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive"
      />
      {error ? (
        <p role="alert" className="text-xs font-bold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AmountField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  currency = "TOMAN",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string | undefined;
  required?: boolean;
  currency?: Currency;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      <div className="flex items-center gap-2 rounded-xl border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
        <input
          id={id}
          inputMode="numeric"
          value={value ? formatAmountInput(String(value)) : ""}
          aria-invalid={!!error}
          onChange={(e) => onChange(parseAmountInput(e.target.value))}
          placeholder="۰"
          className="num h-12 w-full bg-transparent text-base font-bold outline-none"
        />
        <span className="shrink-0 text-sm text-muted-foreground">
          {currency === "RIAL" ? "ریال" : "تومان"}
        </span>
      </div>
      {error ? (
        <p role="alert" className="text-xs font-bold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const jalali = value
    ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(value))
    : "";
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {jalali ? <p className="text-xs text-muted-foreground">تاریخ شمسی: {jalali}</p> : null}
    </div>
  );
}

export function FormActions({
  saving,
  onCancel,
  submitLabel = "ثبت",
}: {
  saving?: boolean;
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={saving}
        className="h-13 min-h-13 flex-1 rounded-xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
      >
        {saving ? "در حال ثبت..." : submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="min-h-13 rounded-xl bg-secondary px-5 py-3.5 text-sm font-bold text-secondary-foreground"
      >
        انصراف
      </button>
    </div>
  );
}

export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 text-end text-sm font-bold">{children}</span>
    </div>
  );
}

export function FaNum({ value }: { value: number | string }) {
  return <span className="num">{toFa(value)}</span>;
}

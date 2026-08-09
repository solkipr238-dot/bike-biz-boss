const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]!);
}

export function groupDigits(value: number | string): string {
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-US");
}

export type Currency = "TOMAN" | "RIAL";

export function money(amount: number, currency: Currency = "TOMAN"): string {
  const value = currency === "RIAL" ? amount * 10 : amount;
  return `${toFa(groupDigits(value))} ${currency === "RIAL" ? "ریال" : "تومان"}`;
}

const jalali = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const jalaliLong = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** Jalali date as ۱۴۰۲/۰۸/۱۵ */
export function faDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return toFa(jalali.format(d).replace(/\//g, "/"));
}

/** Jalali date as ۱۵ آبان ۱۴۰۲ */
export function faDateLong(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return jalaliLong.format(d);
}

export function faTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return toFa(
    new Intl.DateTimeFormat("fa-IR-u-nu-latn", { hour: "2-digit", minute: "2-digit" }).format(d),
  );
}

export function relativeTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("fa-IR", { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), "day");
  return faDate(d);
}

/** Turns an input value into a grouped, Persian-digit amount for display. */
export function formatAmountInput(raw: string): string {
  const digits = raw.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
  if (!digits) return "";
  return toFa(groupDigits(Number(digits)));
}

export function parseAmountInput(raw: string): number {
  const digits = raw.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d))).replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/** yyyy-mm-dd (Gregorian) -> jalali label, and today's ISO helper */
export function todayISO(): string {
  return new Date().toISOString();
}

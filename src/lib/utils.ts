import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatFns } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function microAlgosToAlgos(microAlgos: number) {
  if (typeof microAlgos !== 'number') return 0;
  return microAlgos / 1_000_000;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Using USD as a stand-in for ALGO symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
    .format(amount)
    .replace("$", "ALGO ");
}

/**
 * Converts any Firebase Timestamp | Date | string | number to a plain JS Date.
 * Firebase Timestamps expose a `.toDate()` method; all other types are handled
 * by the standard Date constructor.
 */
export function toDate(val: { toDate(): Date } | Date | string | number | null | undefined): Date {
  if (!val) return new Date(0);
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date(val);
  if (typeof val === 'string') return new Date(val);
  if (typeof (val as any).toDate === 'function') return (val as any).toDate();
  return new Date(val as any);
}

export function formatDate(date: any) {
  if (!date) return "";
  const dateObj = toDate(date);
  return formatFns(dateObj, "MMM d, yyyy");
}

export function formatDateFromTimestamp(timestamp: { toDate(): Date } | number | Date | string | null | undefined) {
    if (!timestamp) return "";
    const date = toDate(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";
    return formatFns(date, "MMM d, yyyy");
}

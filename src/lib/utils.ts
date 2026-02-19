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

export function formatDate(date: any) {
  if (!date) return "";
  // Firebase Timestamps have a toDate() method, otherwise parse string or number
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return formatFns(dateObj, "MMM d, yyyy");
}

export function formatDateFromTimestamp(timestamp: number | Date | string) {
    if (!timestamp) return "";
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";
    return formatFns(date, "MMM d, yyyy");
}

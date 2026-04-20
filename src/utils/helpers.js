import { format } from "date-fns";

export const safeToDate = (ts) => {
  if (!ts) return null;
  return ts?.toDate ? ts.toDate() : new Date(ts);
};

export const monthKey = (dateLike) => {
  const d = safeToDate(dateLike) || new Date();
  return format(d, "yyyy-MM");
};

export const monthLabel = (dateLike) => {
  const d = safeToDate(dateLike) || new Date();
  return format(d, "MMM yyyy");
};

export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

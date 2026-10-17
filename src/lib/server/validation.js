// Shared, server-side validation and helper utilities.
// No external dependencies — safe to import from route handlers.

export const MIN_AGE = 21;
export const MAX_AGE = 80;

/**
 * Calculate exact age (in years) from a YYYY-MM-DD date-of-birth string.
 * Returns 0 for missing/invalid input.
 */
export function calculateAge(dobString) {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

export function isValidDob(dobString) {
  if (!dobString || typeof dobString !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dobString)) return false;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return false;
  return dob.getTime() <= Date.now();
}

export function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Accepts Indian mobile numbers, with or without +91 / spaces / dashes. */
export function normalizePhone(value) {
  if (typeof value !== "string") return "";
  const digits = value.replace(/\D/g, "");
  return digits.slice(-10);
}

export function isPhone(value) {
  return normalizePhone(value).length === 10;
}

export function isPincode(value) {
  return typeof value === "string" && /^\d{6}$/.test(value.trim());
}

/** Trim + collapse whitespace and cap length. */
export function sanitize(value, maxLength = 200) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function pick(source, keys) {
  const out = {};
  if (!source || typeof source !== "object") return out;
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

export function asBool(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return fallback;
}

export function asInt(value, fallback = 0) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function clampInt(value, min, max, fallback) {
  const n = asInt(value, fallback);
  return Math.min(Math.max(n, min), max);
}

export function initials(name) {
  const clean = sanitize(name, 60);
  if (!clean) return "RS";
  return clean
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Relative "time ago" label used by the chat/interest UI. */
export function relativeTime(isoString) {
  const then = new Date(isoString).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  if (diff < 0) return "Just now";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

export function formatClockTime(isoString) {
  const date = new Date(isoString);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Basic HTML-escaping for any value that might be echoed back. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
